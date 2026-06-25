import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import {
  Home, BookOpen, Headphones, Search, Heart, TrendingUp, Menu, X,
  CircleDot, Clock, Sparkles, Calendar, Calculator, GraduationCap, Mic,
  BookMarked, MessageSquare, Compass, Shield, Download, Settings, Palette,
} from 'lucide-react';

const mainLinks = [
  { href: '/', label: 'الرئيسية', icon: Home },
  { href: '/read', label: 'قراءة القرآن', icon: BookOpen },
  { href: '/listen', label: 'الاستماع', icon: Headphones },
  { href: '/search', label: 'البحث', icon: Search },
  { href: '/progress', label: 'التقدم', icon: TrendingUp },
  { href: '/favorites', label: 'المفضلة', icon: Heart },
] as const;

const moreLinks = [
  { href: '/more/tasbeeh', label: 'السبحة الإلكترونية', icon: CircleDot },
  { href: '/more/prayer-times', label: 'مواقيت الصلاة', icon: Clock },
  { href: '/more/names', label: 'أسماء الله الحسنى', icon: Sparkles },
  { href: '/more/hijri-calendar', label: 'التقويم الهجري', icon: Calendar },
  { href: '/more/zakat-calculator', label: 'حاسبة الزكاة', icon: Calculator },
  { href: '/more/islamic-education', label: 'تعليم الإسلام', icon: GraduationCap },
  { href: '/more/quran-learning', label: 'تعلّم تلاوة القرآن', icon: Mic },
  { href: '/more/athkar', label: 'الأذكار', icon: BookMarked },
  { href: '/more/hadith', label: 'الأحاديث', icon: MessageSquare },
  { href: '/more/qibla', label: 'اتجاه القبلة', icon: Compass },
  { href: '/more/ruqyah', label: 'الرقية الشرعية', icon: Shield },
  { href: '/more/downloads', label: 'التحميلات (بدون نت)', icon: Download },
  { href: '/more/themes', label: 'شكل التطبيق', icon: Palette },
  { href: '/more/settings', label: 'الإعدادات', icon: Settings },
] as const;

export function FajrNavbar() {
  const pathname = useLocation().pathname;
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <nav
        className="app-template-fajr-nav fixed top-0 left-0 right-0 z-40"
        style={{
          background: '#ffffff',
          borderBottom: '1px solid rgba(0, 0, 0, 0.10)',
          boxShadow: '0 8px 24px -16px rgba(0, 0, 0, 0.12)',
          backdropFilter: 'blur(14px) saturate(140%)',
        }}
        dir="rtl"
      >
        <div className="max-w-6xl mx-auto px-3 h-14 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center shadow"
              style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.15)', color: '#000' }}
            >
              <span className="text-base" aria-hidden>🕌</span>
            </span>
            <span className="font-cairo font-extrabold text-sm" style={{ color: '#000' }}>
              نور القرآن الكريم
            </span>
          </Link>

          <ul className="hidden md:flex items-center gap-1">
            {mainLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <li key={href}>
                  <Link
                    to={href}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-cairo text-xs font-bold transition-colors"
                    style={
                      isActive
                        ? { background: 'rgba(0,0,0,0.06)', color: '#000', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)' }
                        : { color: '#000' }
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <button
            onClick={() => setOpen(true)}
            aria-label="فتح القائمة"
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.15)',
              color: '#000',
            }}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Spacer so page content isn't hidden behind the fixed nav */}
      <div aria-hidden style={{ height: 56 }} />

      {/* Slide-in drawer */}
      {open && (
        <div className="fixed inset-0 z-50" dir="rtl">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0, 0, 0, 0.45)' }}
            onClick={() => setOpen(false)}
          />
          <div
            ref={sheetRef}
            className="absolute top-0 bottom-0 right-0 w-[88%] max-w-sm overflow-y-auto"
            style={{
              background: '#ffffff',
              borderLeft: '1px solid rgba(0,0,0,0.10)',
              boxShadow: '-20px 0 40px -10px rgba(0,0,0,0.25)',
            }}
          >
            <div className="flex items-center justify-between px-4 h-14 border-b" style={{ borderColor: 'rgba(0,0,0,0.10)' }}>
              <span className="font-cairo font-extrabold text-sm" style={{ color: '#000' }}>القائمة</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="إغلاق القائمة"
                className="w-9 h-9 rounded-full inline-flex items-center justify-center"
                style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.15)', color: '#000' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3">
              <div className="text-[11px] font-cairo font-bold mb-1.5 px-2" style={{ color: 'rgba(0,0,0,0.6)' }}>
                الأقسام الرئيسية
              </div>
              <ul className="grid grid-cols-1 gap-1">
                {mainLinks.map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <Link
                      to={href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-cairo text-sm font-bold"
                      style={{ color: '#000', background: '#fff', border: '1px solid rgba(0,0,0,0.10)' }}
                    >
                      <Icon className="w-4 h-4" style={{ color: '#000' }} />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="text-[11px] font-cairo font-bold mt-4 mb-1.5 px-2" style={{ color: 'rgba(0,0,0,0.6)' }}>
                المزيد من الميزات
              </div>
              <ul className="grid grid-cols-2 gap-1.5">
                {moreLinks.map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <Link
                      to={href}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-xl font-cairo text-[11px] font-bold"
                      style={{ color: '#000', background: '#fff', border: '1px solid rgba(0,0,0,0.10)' }}
                    >
                      <Icon className="w-4 h-4 shrink-0" style={{ color: '#000' }} />
                      <span className="truncate">{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
