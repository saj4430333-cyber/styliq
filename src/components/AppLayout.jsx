import React from 'react';
import BottomNav from './BottomNav';
import KeepAliveOutlet from './KeepAliveOutlet';
import { useI18n } from '@/lib/i18n-store';

export default function AppLayout() {
  const { dir } = useI18n();
  return (
    <div dir={dir} className="min-h-screen bg-secondary/40">
      <div className="mx-auto max-w-md md:max-w-lg lg:max-w-xl min-h-screen bg-background relative flex flex-col shadow-2xl">
        <main className="flex-1 pt-[env(safe-area-inset-top)] pb-28">
          <KeepAliveOutlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}