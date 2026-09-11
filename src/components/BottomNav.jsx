import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Shirt, Plus, Heart, User } from 'lucide-react';
import { useI18n } from '@/lib/i18n-store';

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useI18n();

  const items = [
    { to: '/', icon: HomeIcon, label: t.nav_home },
    { to: '/designs', icon: Shirt, label: t.nav_designs },
    { to: '/styling', icon: Plus, label: t.nav_create, center: true },
    { to: '/my-styles', icon: Heart, label: t.nav_saved },
    { to: '/account', icon: User, label: t.nav_account },
  ];

  const handlePress = (to) => {
    const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);
    if (isActive) {
      window.dispatchEvent(new CustomEvent('active-tab-reselected', { detail: to }));
    }
    navigate(to);
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl z-50">
      <div className="bg-card/95 backdrop-blur-lg border-t border-border px-3 pt-2.5 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <div className="flex items-end justify-between">
          {items.map((it) => {
            const active = it.to === '/' ? pathname === '/' : pathname.startsWith(it.to);
            const Icon = it.icon;

            if (it.center) {
              return (
                <button
                  key={it.to}
                  onClick={() => handlePress(it.to)}
                  className="flex flex-col items-center gap-1 -mt-7 shrink-0"
                >
                  <span className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform active:scale-95 bg-gradient-to-br from-accent to-orange-500 text-white shadow-glow">
                    <Icon className="w-7 h-7" strokeWidth={2.4} />
                  </span>
                  <span className={`text-[10px] font-medium ${active ? 'text-accent' : 'text-muted-foreground'}`}>{it.label}</span>
                </button>
              );
            }

            return (
              <button
                key={it.to}
                onClick={() => handlePress(it.to)}
                className="flex flex-col items-center gap-1 flex-1 py-1"
              >
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${active ? 'bg-accent/10' : ''}`}>
                  <Icon className={`w-6 h-6 transition-colors ${active ? 'text-accent' : 'text-muted-foreground'}`} strokeWidth={active ? 2.4 : 1.8} />
                </span>
                <span className={`text-[10px] font-medium ${active ? 'text-accent' : 'text-muted-foreground'}`}>{it.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}