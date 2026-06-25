import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
} as const;

const Schema = z.object({ endpoint: z.string().url().min(20).max(2048) });

export const Route = createFileRoute('/api/public/push/unsubscribe')({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          // Per-IP rate limit to prevent bulk deletion of subscriptions by
          // attackers who may have obtained endpoint URLs.
          const { rateLimit, getClientIp } = await import(
            '@/lib/server/rate-limit.server'
          );
          const ip = getClientIp(request.headers);
          const limited = rateLimit('push-unsub', ip, 5, 60_000);
          if (!limited.ok) {
            return new Response(
              JSON.stringify({ error: 'Too Many Requests' }),
              {
                status: 429,
                headers: {
                  'Content-Type': 'application/json',
                  'Retry-After': String(limited.retryAfterSeconds),
                  ...CORS,
                },
              },
            );
          }

          const data = Schema.parse(await request.json());
          const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
          await supabaseAdmin.from('push_subscriptions').delete().eq('endpoint', data.endpoint);
          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...CORS },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Bad request';
          return new Response(JSON.stringify({ error: message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...CORS },
          });
        }
      },
    },
  },
});
