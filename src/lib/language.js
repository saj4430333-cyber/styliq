export function getLang() {
  if (typeof window === 'undefined') return 'ar';
  try { return localStorage.getItem('styliq_lang') || 'ar'; } catch (e) { return 'ar'; }
}

export function applyLang(lang) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

export function setLang(lang) {
  try { localStorage.setItem('styliq_lang', lang); } catch (e) {}
  applyLang(lang);
}

export function isOnboarded() {
  try { return localStorage.getItem('styliq_onboarded') === '1'; } catch (e) { return false; }
}

export function setOnboarded() {
  try { localStorage.setItem('styliq_onboarded', '1'); } catch (e) {}
}

export function getOnboardingPrefs() {
  try {
    const r = localStorage.getItem('styliq_onboarding_prefs');
    return r ? JSON.parse(r) : null;
  } catch (e) { return null; }
}

export function setOnboardingPrefs(prefs) {
  try { localStorage.setItem('styliq_onboarding_prefs', JSON.stringify(prefs)); } catch (e) {}
}

export function clearOnboardingPrefs() {
  try { localStorage.removeItem('styliq_onboarding_prefs'); } catch (e) {}
}