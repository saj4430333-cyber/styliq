// مفتاح تشغيل الدفع داخل التطبيق (IAP / Paywall / الكريديت).
// true = الدفع مفعّل (Paywall + RevenueCat + خصم كريديت)
export const PAYMENTS_ENABLED = true;

export function isPaymentsEnabled() {
  return PAYMENTS_ENABLED === true;
}
