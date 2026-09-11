import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertTriangle, Sparkles, Check, ArrowRight, ArrowLeft, Wand2, ShoppingBag } from 'lucide-react';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import OutfitCard from '@/components/OutfitCard';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n-store';
import { styleDisplayName, occasionDisplayName, seasonDisplayName, genderDisplayName } from '@/lib/translate';
import { isPaymentsEnabled } from '@/lib/features';
import { buildFreeOutfits, orderSummaryFrom, buildModelImagePrompt, buildFlatImagePrompt, fallbackOutfitImage } from '@/lib/freeOutfits';

const LOADING_STEPS_ICONS = [Wand2, ShoppingBag, Sparkles];

export default function Results() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, dir, lang } = useI18n();
  const LOADING_STEPS = [
    { icon: Wand2, label: t.res_step1 },
    { icon: ShoppingBag, label: t.res_step2 },
    { icon: Sparkles, label: t.res_step3 },
  ];
  const [state, setState] = useState({ loading: true, outfits: [], order: null, error: '', code: '' });
  const [selected, setSelected] = useState(null);
  const [savedSet, setSavedSet] = useState(new Set());
  const [stepIdx, setStepIdx] = useState(0);
  const { toast } = useToast();
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;
  const actionRef = useRef(null);

  const persistOutfits = async (orderId, outfits) => {
    try {
      await base44.entities.StylingOrder.update(orderId, {
        outfits,
        payment_status: 'paid',
        credit_spent: true,
      });
    } catch {
      /* ignore */
    }
  };

  const enrichWithImages = async (outfits, order, onUpdate) => {
    const next = outfits.map((o) => ({ ...o }));
    const withTimeout = (p, ms) =>
      Promise.race([p, new Promise((resolve) => setTimeout(() => resolve(null), ms))]);

    await Promise.all(
      next.map(async (outfit, i) => {
        if (outfit.image_url) return;
        try {
          const res = await withTimeout(
            base44.integrations.Core.GenerateImage({ prompt: buildModelImagePrompt(outfit, order) }),
            70000,
          );
          const url = res?.url;
          if (url) {
            next[i] = { ...next[i], image_url: url };
            onUpdate(next.map((o) => ({ ...o })));
          }
        } catch {
          /* fall through */
        }
        if (!next[i].image_url) {
          next[i] = { ...next[i], image_url: fallbackOutfitImage(order, i) };
          onUpdate(next.map((o) => ({ ...o })));
        }

        if (!next[i].flat_image_url) {
          try {
            const res = await withTimeout(
              base44.integrations.Core.GenerateImage({ prompt: buildFlatImagePrompt(outfit, order) }),
              40000,
            );
            const url = res?.url;
            if (url) {
              next[i] = { ...next[i], flat_image_url: url };
              onUpdate(next.map((o) => ({ ...o })));
            }
          } catch {
            /* optional */
          }
        }
      }),
    );

    return next;
  };

  const finishWithOutfits = async (orderId, outfits, order) => {
    const summary = orderSummaryFrom(order) || order;
    // انتظر صورة الـ AI أولاً — لا تعرض صورة Unsplash العشوائية فوراً (تبان زي الزفت)
    setState({ loading: true, outfits: [], order: summary, error: '', code: '' });
    await persistOutfits(orderId, outfits);

    const enriched = await enrichWithImages(outfits, order || {}, () => {});
    await persistOutfits(orderId, enriched);
    setState({ loading: false, outfits: enriched, order: summary, error: '', code: '' });
    setSelected(0);
    base44.analytics.track({ eventName: 'outfits_generated', properties: { order_id: orderId, free: true } });
  };

  const runGenerate = () => {
    const orderId = searchParams.get('order_id');
    const sessionId = searchParams.get('session_id');
    if (!orderId) { navigate('/styling', { replace: true }); return; }
    setState((p) => ({ ...p, loading: true, error: '', code: '' }));
    setStepIdx(0);
    (async () => {
      if (!isPaymentsEnabled()) {
        try {
          let order = null;
          try {
            order = await base44.entities.StylingOrder.get(orderId);
          } catch {
            try {
              const list = await base44.entities.StylingOrder.filter({ id: orderId });
              order = Array.isArray(list) ? list[0] : list?.data?.[0];
            } catch {
              order = null;
            }
          }

          // إطلالة محفوظة بصورة AI حقيقية (مش Unsplash)
          const existing = order?.outfits || [];
          const hasRealAiImage = existing.length >= 1 && existing.every((o) => {
            const url = o?.image_url || '';
            return url && !url.includes('images.unsplash.com');
          });
          if (hasRealAiImage) {
            setState({
              loading: false,
              outfits: existing,
              order: orderSummaryFrom(order),
              error: '',
              code: '',
            });
            setSelected(0);
            return;
          }

          // إطلالة متناسقة محلياً + صورة AI بجودة أعلى (أفضل من قوالب LLM العشوائية)
          const outfits = buildFreeOutfits(order || { id: orderId }, lang);
          await finishWithOutfits(orderId, outfits, order || { id: orderId });
          return;
        } catch (e) {
          setState({
            loading: false,
            outfits: [],
            order: null,
            error: e?.message || t.res_err_d,
            code: 'generation_failed',
          });
          return;
        }
      }

      try {
        const res = await base44.functions.invoke('generate-outfits', {
          order_id: orderId,
          session_id: sessionId,
          lang,
        });
        const data = res.data || {};
        const outfits = data.outfits || [];
        if (!outfits.length) {
          setState({ loading: false, outfits: [], order: data.order, error: t.res_err_d, code: 'generation_failed' });
          return;
        }
        base44.analytics.track({ eventName: 'outfits_generated', properties: { order_id: orderId } });
        setState({ loading: false, outfits, order: data.order, error: '', code: '' });
      } catch (e) {
        const status = e?.response?.status || e?.status;
        const code = e?.response?.data?.code || (status === 402 ? 'payment_required' : 'generation_failed');
        const error = e?.response?.data?.error || e.message;
        setState({ loading: false, outfits: [], order: null, error, code });
      }
    })();
  };

  const retryGenerate = async () => {
    runGenerate();
  };

  useEffect(() => { runGenerate(); }, [navigate, searchParams]);

  useEffect(() => {
    if (!state.loading) return;
    const id = setInterval(() => setStepIdx((p) => Math.min(p + 1, LOADING_STEPS.length - 1)), 2200);
    return () => clearInterval(id);
  }, [state.loading]);

  useEffect(() => {
    if (state.loading || selected === null) return;
    const t = setTimeout(() => {
      actionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 160);
    return () => clearTimeout(t);
  }, [selected, state.loading]);

  const orderId = searchParams.get('order_id');

  const handleSave = async (i) => {
    const outfit = state.outfits[i];
    if (!outfit || savedSet.has(i)) return;
    setSavedSet((p) => new Set(p).add(i));
    try {
      await base44.entities.SavedOutfit.create({
        outfit,
        order_id: orderId || '',
        title: outfit.title || '',
        image_url: outfit.products?.[0]?.image_url || outfit.image_url || '',
      });
      toast({ title: t.res_saved_t, description: t.res_saved_d });
    } catch (e) {
      setSavedSet((p) => { const n = new Set(p); n.delete(i); return n; });
      toast({ title: t.res_save_err, description: e.message, variant: 'destructive' });
    }
  };

  const goToBrands = () => {
    if (!chosen) return;
    const brandsCtx = { outfit: chosen, order: state.order, order_id: orderId };
    try { localStorage.setItem('styliq_brands_context', JSON.stringify(brandsCtx)); } catch {}
    navigate('/brands', { state: brandsCtx });
  };

  if (state.loading) {
    return (
      <div dir={dir} className="min-h-screen bg-background">
        <div className="mx-auto max-w-md md:max-w-lg lg:max-w-xl min-h-screen flex flex-col items-center justify-center px-6 pt-[env(safe-area-inset-top)]">
          <Logo className="mb-10" />
          <div className="flex flex-col items-center gap-7 w-full">
            {LOADING_STEPS.map((s, i) => {
              const active = i === stepIdx;
              const done = i < stepIdx;
              return (
                <motion.div key={i} initial={false} animate={{ opacity: active || done ? 1 : 0.4, scale: active ? 1 : 0.96 }} className="flex items-center gap-3 w-full">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${active ? 'bg-accent/15' : done ? 'bg-accent/10' : 'bg-muted'}`}>
                    {active ? <Loader2 className="w-5 h-5 text-accent animate-spin" /> : done ? <Check className="w-5 h-5 text-accent" /> : <s.icon className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <span className={`text-sm font-medium transition-colors ${active || done ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</span>
                </motion.div>
              );
            })}
          </div>
          <p className="text-muted-foreground/60 text-xs mt-10">{t.res_wait}</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div dir={dir} className="min-h-screen bg-background">
        <div className="mx-auto max-w-md md:max-w-lg lg:max-w-xl min-h-screen flex flex-col items-center justify-center px-6 text-center pt-[env(safe-area-inset-top)]">
          <Logo className="mb-8" />
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 bg-destructive/10">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">{t.res_err_t}</h1>
          <p className="text-muted-foreground mb-7 max-w-sm">{state.error}</p>
          {state.code === 'generation_failed' && (
            <Button onClick={retryGenerate} className="h-12 px-7 rounded-2xl mb-3">
              {t.res_retry}
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate('/styling')} className="h-12 px-7 rounded-2xl">
            {t.res_back}
          </Button>
        </div>
      </div>
    );
  }

  const order = state.order || {};
  const chosen = selected !== null ? state.outfits[selected] : null;

  return (
    <div dir={dir} className="min-h-screen bg-background">
      <div className="mx-auto max-w-md md:max-w-lg lg:max-w-xl pt-[env(safe-area-inset-top)] pb-12">
        {/* Top bar */}
        <div className="px-5 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/designs')} className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center active:scale-95">
            <BackIcon className="w-5 h-5" />
          </button>
          <Logo />
        </div>

        <div className="px-5">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-5">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              {t.res_badge}
            </span>
            <h1 className="font-display text-3xl font-bold mb-1.5">{t.res_title}</h1>
            <p className="text-muted-foreground text-sm">
              {styleDisplayName(order.style, lang)} · {occasionDisplayName(order.occasion, lang)} · {seasonDisplayName(order.season, lang)}
            </p>
            {order.gender && (
              <p className="text-muted-foreground/70 text-xs mt-1">
                {genderDisplayName(order.gender, lang)}{order.height ? ` · ${order.height} ${dir === 'rtl' ? 'سم' : 'cm'}` : ''}{order.weight ? ` · ${order.weight} ${dir === 'rtl' ? 'كجم' : 'kg'}` : ''}
              </p>
            )}
          </motion.div>

          {chosen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 flex items-center gap-3 bg-accent/10 border border-accent/20 rounded-2xl px-4 py-3.5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Check className="w-5 h-5 text-accent shrink-0" />
                <span className="font-medium text-sm truncate">{t.res_chosen}: {chosen.title}</span>
              </div>
            </motion.div>
          )}

          <div className="space-y-5">
            {state.outfits.map((outfit, i) => (
              <OutfitCard
                key={i}
                outfit={outfit}
                index={i}
                selected={selected === i}
                onSelect={setSelected}
                onSave={handleSave}
                saved={savedSet.has(i)}
              />
            ))}
          </div>

          {!chosen && (
            <p className="text-center text-muted-foreground/70 text-xs mt-6">{t.res_pick}</p>
          )}

          {chosen && (
            <motion.div ref={actionRef} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
              <div className="rounded-3xl bg-primary text-primary-foreground p-6 text-center relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-accent/25 blur-3xl" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-display text-lg font-bold mb-1">{t.res_brands_t}</h3>
                  <p className="text-primary-foreground/70 text-sm mb-4">{t.res_brands_d}</p>
                  <Button
                    onClick={goToBrands}
                    className="h-12 px-8 rounded-2xl bg-accent text-white hover:bg-accent/90 text-base font-bold w-full"
                  >
                    {t.res_brands_btn}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          <div className="mt-6">
            <Button variant="outline" onClick={() => navigate('/styling')} className="w-full h-12 rounded-2xl">
              {t.res_new}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}