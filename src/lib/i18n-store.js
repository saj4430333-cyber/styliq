import { useSyncExternalStore } from 'react';
import { applyLang } from './language';
import { t } from './i18n';

let currentLang = (() => {
  if (typeof window === 'undefined') return 'ar';
  try { return localStorage.getItem('styliq_lang') || 'ar'; } catch (e) { return 'ar'; }
})();
if (typeof document !== 'undefined') applyLang(currentLang);

const listeners = new Set();

function emit() { listeners.forEach((l) => l()); }

export function getLang() { return currentLang; }

export function setLang(next) {
  if (next === currentLang) return;
  currentLang = next;
  try { localStorage.setItem('styliq_lang', next); } catch (e) {}
  applyLang(next);
  emit();
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useI18n() {
  const lang = useSyncExternalStore(subscribe, getLang);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  return { lang, dir, t: t(lang), setLang };
}