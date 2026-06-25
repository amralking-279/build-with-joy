import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Settings2, Share2, MapPin, Compass, Calculator, HeartHandshake, GraduationCap, BookMarked, Sunrise, Sparkles, Clock4, BookOpen, Headphones, Search, Heart, TrendingUp, Mic, MessageSquare, Shield, Calendar, CircleDot, Mail, Info, Moon, Sun, Users } from 'lucide-react';
import { usePrayerData, formatCountdown, to12hArabic, type PrayerKey } from '@/hooks/usePrayerData';
import headerBg from '@/assets/fajr-header.jpg';
import headerBgNight from '@/assets/fajr-header-night.jpg';
import FajrSurahList from '@/components/templates/FajrSurahList';

const NIGHT_KEY = 'fajr:night';

function readFajrNightPreference() {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(NIGHT_KEY) === '1';
  } catch {
    return false;
  }
}

function useFajrNight() {
  const [night, setNight] = useState(readFajrNightPreference);
  useEffect(() => {
    try {
      const v = readFajrNightPreference();
      setNight(v);
      document.documentElement.classList.toggle('fajr-night', v);
    } catch { /* ignore */ }
  }, []);
  const toggle = () => {
    setNight((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(NIGHT_KEY, next ? '1' : '0');
        document.documentElement.classList.toggle('fajr-night', next);
      } catch { /* ignore */ }
      return next;
    });
  };
  return { night, toggle };
}

const PRAYER_ROW: { key: PrayerKey; label: string; emoji: string }[] = [
  { key: 'Fajr', label: 'الفجر', emoji: '🌙' },
  { key: 'Dhuhr', label: 'الظهر', emoji: '☀️' },
  { key: 'Asr', label: 'العصر', emoji: '⛅' },
  { key: 'Maghrib', label: 'المغرب', emoji: '🌇' },
  { key: 'Isha', label: 'العشاء', emoji: '🌃' },
];

const QUICK_FEATURES = [
  { to: '/read', label: 'قراءة القرآن', Icon: BookOpen },
  { to: '/listen', label: 'الاستماع', Icon: Headphones },
  { to: '/search', label: 'البحث', Icon: Search },
  { to: '/progress', label: 'التقدم', Icon: TrendingUp },
  { to: '/favorites', label: 'المفضلة', Icon: Heart },
  { to: '/more/qibla', label: 'اتجاه القبلة', Icon: Compass },
  { to: '/more/tasbeeh', label: 'السبحة', Icon: HeartHandshake },
  { to: '/more/prayer-times', label: 'مواقيت الصلاة', Icon: Clock4 },
  { to: '/more/athkar', label: 'الأذكار', Icon: BookMarked },
  { to: '/more/names', label: 'أسماء الله الحسنى', Icon: Sparkles },
  { to: '/more/hadith', label: 'الأحاديث', Icon: MessageSquare },
  { to: '/more/quran-learning', label: 'تعلّم التلاوة', Icon: Mic },
  { to: '/more/islamic-education', label: 'تعليم إسلامي', Icon: GraduationCap },
  { to: '/more/zakat-calculator', label: 'حاسبة الزكاة', Icon: Calculator },
  { to: '/more/hijri-calendar', label: 'التقويم الهجري', Icon: Calendar },
  { to: '/more/ruqyah', label: 'الرقية الشرعية', Icon: Shield },
  { to: '/more/prophets-stories', label: 'قصص الأنبياء', Icon: Users },
];

export function FajrHome() {
  const data = usePrayerData();
  const remaining = data.next?.remainingMs ?? 0;
  const { night, toggle } = useFajrNight();

  return (
    <main
      className="min-h-screen pb-28 fajr-root"
      dir="rtl"
    >
      {/* Top bar */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            aria-pressed={night}
            aria-label={night ? 'إيقاف الوضع الليلي' : 'تشغيل الوضع الليلي'}
            className="inline-flex items-center gap-1.5 rounded-full bg-white border border-neutral-200 px-3 py-1.5 text-neutral-900 font-cairo text-xs font-bold shadow-sm hover:bg-neutral-50 transition fajr-chip"
          >
            {night ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {night ? 'الوضع النهاري' : 'الوضع الليلي'}
          </button>
        </div>
        <div className="flex items-center gap-2 text-neutral-900 fajr-title">
          <div className="text-right leading-tight">
            <h1 className="font-cairo font-extrabold text-base">نور القرآن الكريم</h1>
            <p className="font-cairo text-[10px] text-neutral-500 fajr-sub">رفيقك اليومي للعبادة</p>
          </div>
          <span className="w-10 h-10 rounded-full bg-white border border-neutral-200 text-neutral-900 flex items-center justify-center text-lg shadow-md fajr-chip">
            🕌
          </span>
        </div>
      </div>


      {/* Hero header with desert image and countdown */}
      <section
        className="relative mx-3 mt-1 rounded-3xl overflow-hidden shadow-xl ring-1 ring-neutral-200"
        style={{ aspectRatio: '16 / 14' }}
      >
        <img
          src={night ? headerBgNight : headerBg}
          alt={night ? 'سماء ليلية بالقمر والنجوم' : 'هيدر شروق الشمس'}
          width={1280}
          height={768}
          className="absolute inset-0 w-full h-full object-cover fajr-hero-image"
        />
        {/* Subtle dark gradients for text legibility (no white wash) */}
        <div className={night ? 'absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/35 to-transparent fajr-hero-gradient-top' : 'absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent fajr-hero-gradient-top'} />
        <div className={night ? 'absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent fajr-hero-gradient-bottom' : 'absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent fajr-hero-gradient-bottom'} />

        {/* Top-left settings */}
        <Link
          to="/more/themes"
          className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/85 backdrop-blur-md text-neutral-900 border border-neutral-200 flex items-center justify-center hover:bg-white transition"
          aria-label="إعدادات الشكل"
        >
          <Settings2 className="w-5 h-5" />
        </Link>

        {/* Brand pill */}
        <div className="absolute top-14 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur px-3 py-1 font-cairo text-[11px] font-extrabold text-neutral-900 border border-neutral-200 shadow-sm">
          نور القرآن الكريم
        </div>

        {/* Countdown */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
        >
          <div className="font-cairo text-white text-xl font-extrabold tracking-wide" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.55)' }}>
            {data.next ? `الصلاة القادمة · ${data.next.name}` : '...'}
          </div>
          <div
            className="font-cairo text-white text-5xl sm:text-6xl font-black tracking-wider mt-2 tabular-nums"
            style={{ direction: 'ltr', textShadow: '0 3px 12px rgba(0,0,0,0.6)' }}
          >
            {formatCountdown(remaining)}
          </div>
          {data.next && (
            <div className="font-cairo text-white/90 text-xs mt-1.5 tabular-nums" style={{ direction: 'ltr', textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>
              تبدأ {to12hArabic(data.next.time)}
            </div>
          )}
        </div>

        {/* Location chip */}
        <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/85 backdrop-blur-sm text-neutral-900 border border-neutral-200 px-2.5 py-1 font-cairo text-[11px]">
          <MapPin className="w-3 h-3" />
          {data.city}
        </div>
      </section>

      {/* Date strip */}
      <section className="mx-3 mt-3 rounded-2xl bg-white border border-neutral-200 shadow-sm px-4 py-3 flex items-center justify-between">
        <button
          aria-label="مشاركة"
          onClick={async () => {
            const shareData = {
              title: 'نور القرآن الكريم',
              text: 'تطبيق نور القرآن الكريم - رفيقك اليومي للعبادة',
              url: 'https://noor-quran.apk.com/',
            };

            const copyLink = async () => {
              try {
                if (navigator.clipboard?.writeText) {
                  await navigator.clipboard.writeText(shareData.url);
                } else {
                  const ta = document.createElement('textarea');
                  ta.value = shareData.url;
                  ta.style.position = 'fixed';
                  ta.style.opacity = '0';
                  document.body.appendChild(ta);
                  ta.focus();
                  ta.select();
                  document.execCommand('copy');
                  document.body.removeChild(ta);
                }
                alert('تم نسخ رابط التطبيق إلى الحافظة');
              } catch {
                window.open(shareData.url, '_blank');
              }
            };

            // Try the native share sheet first; fall back to copying the link
            // when Web Share is unavailable or blocked (e.g. inside an iframe).
            if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
              try {
                await navigator.share(shareData);
                return;
              } catch (err) {
                // Real user cancellation should not trigger a fallback.
                if (err instanceof DOMException && err.name === 'AbortError') return;
                await copyLink();
              }
            } else {
              await copyLink();
            }
          }}
          className="text-neutral-900 hover:text-neutral-600 transition"
        >
          <Share2 className="w-5 h-5" />
        </button>
        <div className="flex-1 text-center">
          <div className="font-cairo font-extrabold text-neutral-900 text-base">{data.gregorian}</div>
          <div className="font-cairo text-neutral-500 text-[11px] mt-0.5">{data.hijri}</div>
        </div>
        <div className="text-right flex items-center gap-2">
          <div>
            <div className="font-cairo text-neutral-600 text-[10px] font-bold">الشروق</div>
            <div className="font-cairo text-neutral-900 text-sm font-extrabold tabular-nums" style={{ direction: 'ltr' }}>
              {to12hArabic(data.times?.Sunrise)}
            </div>
          </div>
          <Sunrise className="w-5 h-5 text-neutral-900" />
        </div>
      </section>

      {/* Prayer times row */}
      <section className="mx-3 mt-3 rounded-2xl bg-white border border-neutral-200 shadow-sm px-2 py-3">
        <ul className="grid grid-cols-5 gap-1">
          {PRAYER_ROW.map((p) => {
            const isNext = data.next?.key === p.key;
            return (
              <li
                key={p.key}
                className={`flex flex-col items-center text-center px-1 py-2 rounded-xl transition ${
                  isNext ? 'bg-neutral-100 ring-1 ring-neutral-300 shadow-sm' : ''
                }`}
              >
                <div className={`font-cairo font-extrabold text-sm ${isNext ? 'text-neutral-900' : 'text-neutral-700'}`}>
                  {p.label}
                </div>
                <div className="text-xl my-1" aria-hidden>{p.emoji}</div>
                <div
                  className={`font-cairo text-xs font-bold tabular-nums ${isNext ? 'text-neutral-900' : 'text-neutral-600'}`}
                  style={{ direction: 'ltr' }}
                >
                  {to12hArabic(data.times?.[p.key])}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Features grid — full list, mirrors classic template features */}
      <section className="mx-3 mt-3 rounded-2xl bg-white border border-neutral-200 shadow-sm px-3 py-4">
        <h2 className="font-cairo font-extrabold text-neutral-900 text-sm mb-3 text-right">كل الميزات</h2>
        <ul className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
          {QUICK_FEATURES.map(({ to, label, Icon }) => (
            <li key={to}>
              <Link
                to={to}
                className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
              >
                <span className="w-11 h-11 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-900 shadow-sm">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="font-cairo text-[10.5px] font-bold text-neutral-900 text-center leading-tight">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Friendly note */}
      <section className="mx-3 mt-3 rounded-2xl bg-white border border-neutral-200 px-4 py-3 flex items-start gap-3">
        <span className="shrink-0 w-9 h-9 rounded-full bg-neutral-100 text-neutral-900 flex items-center justify-center font-extrabold">!</span>
        <div className="flex-1 text-right">
          <p className="font-cairo text-neutral-900 text-[13px] leading-relaxed">
            فعّل إشعارات الأذكار والمؤذن لتُذكّرك بأوقات الصلاة طوال اليوم.
          </p>
          <Link to="/more/prayer-times" className="font-cairo text-neutral-900 underline text-xs font-extrabold mt-1 inline-block">
            اضغط للتفعيل!
          </Link>
        </div>
      </section>

      {/* Surah list — same data/component as classic, re-skinned to cream via CSS */}
      <section className="mx-3 mt-4 rounded-2xl bg-white border border-neutral-200 shadow-sm px-3 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-cairo font-extrabold text-neutral-900 text-base">سور القرآن الكريم</h2>
          <Link to="/read" className="font-cairo text-neutral-900 text-xs font-bold">عرض الكل</Link>
        </div>
        <FajrSurahList />
      </section>

      {/* About + Contact mini blocks */}
      <section className="mx-3 mt-4 grid sm:grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white border border-neutral-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-neutral-900" />
            <h3 className="font-cairo font-extrabold text-neutral-900 text-sm">عن التطبيق</h3>
          </div>
          <p className="font-cairo text-neutral-700 text-[12.5px] leading-relaxed">
            منصة إسلامية شاملة تضم القرآن الكريم، الأذكار، الرقية الشرعية، الأذان، والسبحة الإلكترونية — رفيقك اليومي للعبادة.
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-neutral-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-neutral-900" />
            <h3 className="font-cairo font-extrabold text-neutral-900 text-sm">تواصل معنا</h3>
          </div>
          <p className="font-cairo text-neutral-700 text-[12.5px] leading-relaxed">
            هل لديك اقتراح أو ملاحظة؟ تواصل عبر صفحة الإعدادات أو زر التواصل العائم.
          </p>
          <Link to="/more/settings" className="inline-block mt-2 font-cairo text-neutral-900 text-xs font-bold">
            افتح الإعدادات →
          </Link>
        </div>
      </section>
    </main>
  );
}
