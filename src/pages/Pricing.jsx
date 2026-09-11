import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Sparkles, Loader2, Check, RotateCcw,
  ShoppingBag, Crown, Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { useToast } from '@/components/ui/use-toast';
import { useI18n } from '@/lib/i18n-store';
import { useAuth } from '@/lib/AuthContext';
import { purchaseLooks, getLooksPackage, purchaseErrorText, PurchaseCancelledError } from '@/lib/iap';
import {
  fetchState, restorePurchases, waitForCredits,
  RC_PRODUCT_ID, CREDITS_PER_PACK,
} from '@/lib/revenuecat';

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dir } = useI18n();
  const { toast } = useToast();
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  const [state, setState] = useState({
    loading: true,
    isPro: false,
    credits: 0,
    pkg: null,
  });
  const [buying, setBuying] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const load = async () => {
    // السعر يأتي من App Store عبر RevenueCat، والرصيد من السيرفر.
    const [serverState, pkg] = await Promise.all([
      fetchState().catch((e) => {
        toast({ title: 'تعذّر تحميل الحالة', description: String(e?.message || e), variant: 'destructive' });
        return null;
      }),
      getLooksPackage().catch(() => null),
    ]);

    setState({
      loading: false,
      isPro: !!(serverState?.is_pro ?? user?.is_pro),
      credits: Number(serverState?.credits ?? user?.credits) || 0,
      pkg,
    });
  };

  useEffect(() => { load(); }, []);

  const handleBuy = async () => {
    setBuying(true);
    const before = state.credits;
    try {
      await purchaseLooks();
      // RevenueCat يتحقق من الإيصال ثم الويبهوك يضيف الكريديت — ننتظر ظهوره.
      const credits = await waitForCredits({ since: before });
      await load();
      toast(
        credits > before
          ? { title: 'تم الشراء بنجاح!', description: `أُضيف ${CREDITS_PER_PACK} كريديت وتم تفعيل Pro.` }
          : { title: 'تم الشراء', description: 'جارٍ تفعيل الكريديت، حدّث الصفحة بعد لحظات.' },
      );
    } catch (e) {
      if (e instanceof PurchaseCancelledError) return;
      toast({ title: 'فشل الشراء', description: purchaseErrorText(e), variant: 'destructive' });
    } finally {
      setBuying(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const r = await restorePurchases();
      await load();
      const active = !!r?.is_pro;
      toast({
        title: active ? 'تم استرجاع Pro' : 'لا توجد مشتريات سابقة',
        variant: active ? 'default' : 'default',
      });
    } catch (e) {
      toast({ title: 'فشل الاسترجاع', description: String(e?.message || e), variant: 'destructive' });
    } finally {
      setRestoring(false);
    }
  };

  const price = state.pkg?.product?.priceString || '$0.99';
  const title = state.pkg?.product?.title || 'StyliQ Premium';

  return (
    <div dir={dir} className="min-h-screen bg-background">
      <div className="mx-auto max-w-md md:max-w-lg lg:max-w-xl px-5 pt-[env(safe-area-inset-top)] pb-16">
        {/* Top bar */}
        <div className="py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center active:scale-95"
          >
            <BackIcon className="w-5 h-5" />
          </button>
          <Logo />
        </div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-gradient-to-br from-accent to-orange-500 text-white p-7 mb-6 relative overflow-hidden shadow-glow"
        >
          <div className="absolute -top-12 -left-12 w-44 h-44 rounded-full bg-white/15 blur-3xl" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-3 ring-1 ring-white/25">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-1">باقة الكريديت</h1>
            <p className="text-white/85 text-sm leading-relaxed">
              احصل على {CREDITS_PER_PACK} إطلالات إضافية + تفعيل Pro مع كل عملية شراء.
            </p>
          </div>
        </motion.div>

        {/* Status */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-2xl bg-card border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">رصيد الكريديت</p>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="font-bold text-lg">
                {state.loading ? '—' : state.credits}
              </span>
            </div>
          </div>
          <div className="rounded-2xl bg-card border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">حالة Pro</p>
            <div className="flex items-center gap-2">
              <Crown className={`w-5 h-5 ${state.isPro ? 'text-accent' : 'text-muted-foreground/40'}`} />
              <span className="font-bold text-sm">
                {state.loading ? '—' : state.isPro ? 'مفعّل' : 'غير مفعّل'}
              </span>
            </div>
          </div>
        </div>

        {/* Pack card */}
        <div className="rounded-3xl border border-accent/30 bg-accent/5 p-6 mb-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="font-bold text-lg mb-1">{title}</h2>
              <p className="text-muted-foreground text-xs" dir="ltr">{RC_PRODUCT_ID}</p>
              <p className="text-muted-foreground text-sm mt-2">
                {CREDITS_PER_PACK} إطلالات + تفعيل Pro
              </p>
            </div>
            <div className="text-end">
              <div className="font-display text-2xl font-bold text-accent" dir="ltr">{price}</div>
            </div>
          </div>

          <ul className="space-y-2.5 mb-5">
            {[
              `${CREDITS_PER_PACK} إطلالات احترافية مولّدة بالذكاء الاصطناعي`,
              'تفعيل Pro لكل ميزات التطبيق',
              'تكامل مع أفضل الماركات العالمية',
              'تفعيل فوري عبر Apple In‑App Purchase',
            ].map((feat, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm">
                <span className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-accent" />
                </span>
                {feat}
              </li>
            ))}
          </ul>

          <Button
            onClick={handleBuy}
            disabled={buying || state.loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-br from-accent to-orange-500 text-white hover:opacity-95 text-base font-bold"
          >
            {buying ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> جارٍ الشراء…</>
            ) : (
              <><ShoppingBag className="w-5 h-5" /> شراء الآن · {price}</>
            )}
          </Button>
        </div>

        {/* Restore */}
        <button
          onClick={handleRestore}
          disabled={restoring}
          className="w-full h-12 rounded-2xl border border-border bg-card flex items-center justify-center gap-2 text-sm font-medium active:scale-[0.98] disabled:opacity-50"
        >
          {restoring ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> جارٍ الاسترجاع…</>
          ) : (
            <><RotateCcw className="w-4 h-4" /> استرجاع المشتريات</>
          )}
        </button>

        <p className="text-center text-muted-foreground/60 text-xs mt-4 leading-relaxed px-4">
          تتم عملية الشراء عبر Apple App Store باستخدام معرّف المنتج {RC_PRODUCT_ID}،
          ويتحقق RevenueCat من الإيصال مع آبل قبل إضافة {CREDITS_PER_PACK} كريديت إلى حسابك.
          الرصيد محفوظ على حسابك، فيمكنك استرجاعه على أي جهاز بتسجيل الدخول.
        </p>

        <button
          onClick={() => navigate('/styling')}
          className="mt-5 w-full h-11 rounded-2xl bg-gradient-to-br from-accent to-orange-500 text-white flex items-center justify-center gap-2 text-sm font-bold active:scale-[0.98] shadow-glow"
        >
          <Plus className="w-4 h-4" /> إنشاء إطلالة جديدة
        </button>
      </div>

      <style>{`.h-13 { height: 3.25rem; }`}</style>
    </div>
  );
}