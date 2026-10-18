const KEY = 'styliq_pending_form';

export function savePendingForm(form) {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      ...form,
      saved_at: Date.now(),
    }));
  } catch {
    /* ignore */
  }
}

export function getPendingForm() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;
    return data;
  } catch {
    return null;
  }
}

export function clearPendingForm() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
