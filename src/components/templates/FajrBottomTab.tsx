import { Link } from '@tanstack/react-router';
import { BookOpenText, Sparkles, LayoutGrid, Clock4, HeartHandshake } from 'lucide-react';

const TABS = [
  { to: '/', label: 'استكشف', Icon: Sparkles },
  { to: '/more/prayer-times', label: 'الصلاة', Icon: Clock4 },
  { to: '/more', label: 'المزيد', Icon: LayoutGrid },
  { to: '/more/athkar', label: 'الأذكار', Icon: HeartHandshake },
  { to: '/read', label: 'القرآن', Icon: BookOpenText },
] as const;

export function FajrBottomTab() {
  return (
    <nav
      className="app-template-tab fajr-bottom-tab fixed bottom-0 left-0 right-0 z-40"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: '#ffffff',
        borderTop: '1px solid rgba(0, 0, 0, 0.10)',
        boxShadow: '0 -8px 30px -10px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
        backdropFilter: 'blur(16px) saturate(140%)',
      }}
      dir="rtl"
    >
      <div
        className="fajr-bottom-tab-accent absolute top-0 left-1/2 -translate-x-1/2 h-px w-32"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.15), transparent)' }}
      />
      <ul className="flex items-stretch justify-around max-w-md mx-auto px-2 pt-2 pb-1.5">
        {TABS.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              className="fajr-bottom-tab-link group relative flex flex-col items-center justify-center gap-1 py-1.5 px-1 transition-colors"
              activeProps={{ className: 'fajr-bottom-tab-link-active' }}
            >
              {({ isActive }) => (
                <>
                  <span
                    className={
                      'fajr-bottom-tab-icon-wrap flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300 ' +
                      (isActive ? 'is-active' : '')
                    }
                  >
                    <Icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.4 : 1.9} />
                  </span>
                  <span className="fajr-bottom-tab-label font-cairo text-[11px] font-bold tracking-tight">
                    {label}
                  </span>
                  {isActive && <span className="fajr-bottom-tab-indicator absolute -top-[6px] left-1/2 -translate-x-1/2 h-1 w-8 rounded-full" />}
                </>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
