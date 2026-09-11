import { Capacitor } from '@capacitor/core';

export function isNative() {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export function backendOrigin() {
  const fromEnv = import.meta.env.VITE_BASE44_APP_BASE_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.replace(/\/$/, '');
  }
  return 'https://styli-q-copy-ee56fa4f.base44.app';
}

/** Empty on web (same-origin /api). Full origin on native so requests don't hit localhost. */
export function apiServerUrl() {
  return isNative() ? backendOrigin() : '';
}

/** Query string for both BrowserRouter (?x=) and HashRouter (#/path?x=). */
export function getQueryString() {
  if (typeof window === 'undefined') return '';
  if (window.location.search) return window.location.search;
  const hash = window.location.hash || '';
  const i = hash.indexOf('?');
  return i >= 0 ? hash.slice(i) : '';
}
