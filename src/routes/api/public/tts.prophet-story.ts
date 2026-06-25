import { createFileRoute } from '@tanstack/react-router';

const MAX_INPUT = 6000;

const COMMON_STYLE =
  'Speak ARABIC with a clear, authentic EGYPTIAN ACCENT (لهجة مصرية واضحة) — pronounce ج as a hard G (Gaal/Gameel), ق softly, and shape the vowels the natural Cairo way. ' +
  'Sound like a real human Egyptian storyteller on television or radio, NOT a robotic text-to-speech voice. ' +
  'Use natural breathing, soft micro-pauses between sentences, gentle emotional warmth, and a flowing storytelling rhythm. ' +
  'Keep Quranic verses (آيات القرآن) in pure classical Arabic with proper tajweed and slower, reverent pacing, then return to the warm Egyptian-accented narration. ' +
  'Pronounce every word clearly, never rush, never sound monotone. Vary pitch slightly to convey meaning, as a kind Egyptian uncle or aunt would when telling a meaningful story to family.';

const VOICE_PRESETS = {
  male: {
    // "ash" handles Arabic with a warm masculine tone better than onyx.
    voice: 'ash',
    instructions:
      'You are a wise, warm, mature Egyptian male storyteller (راوي مصري حكيم وحنون) — imagine a beloved Egyptian uncle (عمو) telling a meaningful prophetic story to his family in the living room. ' +
      COMMON_STYLE,
  },
  female: {
    // "sage" / "nova" sound more natural in Arabic than shimmer.
    voice: 'sage',
    instructions:
      'You are a warm, gentle Egyptian female storyteller (راوية مصرية حنونة) — imagine a kind Egyptian mother or aunt (ماما / طنط) telling a meaningful prophetic story to her children with affection. ' +
      COMMON_STYLE,
  },
} as const;

type VoiceKey = keyof typeof VOICE_PRESETS;

async function generateMp3(text: string, voiceKey: VoiceKey): Promise<Response> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) return new Response('Missing LOVABLE_API_KEY', { status: 500 });

  const preset = VOICE_PRESETS[voiceKey];

  const upstream = await fetch('https://ai.gateway.lovable.dev/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini-tts',
        input: text,
        voice: preset.voice,
        instructions: preset.instructions,
        response_format: 'mp3',
        // Slightly slower than natural to give the storytelling cadence room.
        speed: 0.92,
      }),
  });

  if (!upstream.ok) {
    const msg = await upstream.text().catch(() => '');
    const status =
      upstream.status === 402 || upstream.status === 429 ? upstream.status : 502;
    return new Response(`TTS failed: ${upstream.status} ${msg}`, { status });
  }

  const buf = await upstream.arrayBuffer();
  return new Response(buf, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export const Route = createFileRoute('/api/public/tts/prophet-story')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Same-origin first line of defence against cross-site abuse of the
        // shared LOVABLE_API_KEY (mirrors tts.ruqyah.ts).
        const host = request.headers.get('host') || '';
        const source =
          request.headers.get('origin') || request.headers.get('referer') || '';
        let sameOrigin = false;
        if (source && host) {
          try {
            sameOrigin = new URL(source).host === host;
          } catch {
            sameOrigin = false;
          }
        }
        if (!sameOrigin) {
          return new Response('Forbidden', { status: 403 });
        }

        // Per-IP rate limit to cap cost exposure of the shared key.
        const { rateLimit, getClientIp } = await import(
          '@/lib/server/rate-limit.server'
        );
        const ip = getClientIp(request.headers);
        const limited = rateLimit('tts-prophet', ip, 5, 60_000);
        if (!limited.ok) {
          return new Response('Too Many Requests', {
            status: 429,
            headers: { 'Retry-After': String(limited.retryAfterSeconds) },
          });
        }

        let body: { text?: unknown; voice?: unknown };
        try {
          body = await request.json();
        } catch {
          return new Response('Invalid JSON', { status: 400 });
        }
        const text = typeof body.text === 'string' ? body.text.trim() : '';
        const voice = body.voice === 'female' ? 'female' : 'male';
        if (!text) return new Response('Missing text', { status: 400 });
        if (text.length > MAX_INPUT) {
          return new Response('Text too long', { status: 400 });
        }
        return generateMp3(text, voice);
      },
    },
  },
});