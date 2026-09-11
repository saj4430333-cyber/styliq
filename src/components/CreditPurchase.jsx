import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, X, Check, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n-store';
import { purchaseLooks, getLooksPackage, purchaseErrorText, PurchaseCancelledError } from '@/lib/iap';
import { waitForCredits, CREDITS_PER_PACK } from '@/lib/revenuecat';
import { isPaymentsEnabled } from '@/lib/features';

export default function CreditPurchase({ open, onClose, onSuccess }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [price, setPrice] = useState('$0.99');
  const { t, dir } = useI18n();
  const COUNT = CREDITS_PER_PACK;
  const desc = t.pw_desc.replace('{price}', price).replace('{count}', COUNT);
  const countLabel = t.pw_count.replace('{count}', COUNT);
  const payLabel = t.pw_pay.replace('{price}', price);

  // السعر الحقيقي المحلي من App Store عبر RevenueCat.
  useEffect(() => {
    if (!isPaymentsEnabled() || !open) return;
    getLooksPackage()
      .then((pkg) => { if (pkg?.product?.priceString) setPrice(pkg.product.priceString); })
      .catch(() => {});
  }, [open]);

  // النسخة المجانية: الكود يبقى لكن الشاشة لا تُعرض.
  if (!isPaymentsEnabled() || !open) return null;

  const pay = async () => {
    setBusy(true);
    setErr('');
    try {
      await purchaseLooks();
      // الكريديت يُمنح من revenuecat-webhook بعد تحقّق RevenueCat مع آبل.
      const credits = await waitForCredits();
      if (credits > 0) {
        onSuccess?.(credits);
        onClose?.();
      } else {
        setErr(t.pw_err);
      }
    } catch (e) {
      if (e instanceof PurchaseCancelledError) return;
      setErr(e?.response?.data?.error || purchaseErrorText(e) || t.pw_err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            dir={dir}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="w-full max-w-sm bg-card rounded-3xl overflow-hidden border border-border shadow-2xl relative"
          >
            <div className="relative bg-gradient-to-br from-accent to-orange-500 px-6 pt-6 pb-7 text-white">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/15 blur-3xl" />
              <button
                onClick={onClose}
                className="absolute top-4 ltr:right-4 rtl:left-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center active:scale-95"
                aria-label={t.pw_close}
              >
                <X className="w-4 h-4 text-white" />
              </button>
              <div className="relative flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/20 ring-1 ring-white/30 flex items-center justify-center mb-3">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-xl font-bold mb-1">{t.pw_title}</h3>
                <p className="text-white/85 text-sm leading-relaxed max-w-[15rem]">{desc}</p>
              </div>
            </div>

            <div className="px-6 pt-5 pb-6">
              <div className="space-y-2.5 mb-5">
                <Perk icon={Sparkles} text={countLabel} />
                <Perk icon={Check} text={t.res_badge} />
                <Perk icon={ShieldCheck} text={t.pw_note} />
              </div>

              <div className="rounded-2xl border border-border bg-muted/40 p-4 mb-5 flex items-center justify-between">
                <span className="font-medium text-sm text-muted-foreground">{countLabel}</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-body text-2xl font-extrabold text-foreground">{price}</span>
                  <span className="text-xs text-muted-foreground">/ {COUNT}</span>
                </div>
              </div>

              {err && (
                <div className="mb-3 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-destructive text-sm text-center">
                  {err}
                </div>
              )}

              <Button
                onClick={pay}
                disabled={busy}
                className="w-full h-14 rounded-2xl text-base font-bold bg-gradient-to-br from-accent to-orange-500 text-white hover:opacity-95 shadow-glow"
              >
                {busy ? <Loader2 className="w-5 h-5 ltr:mr-2 rtl:ml-2 animate-spin" /> : <Sparkles className="w-5 h-5 ltr:mr-2 rtl:ml-2" />}
                {busy ? t.creating : payLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Perk({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-accent" />
      </span>
      <span className="text-sm text-foreground/90">{text}</span>
    </div>
  );
}