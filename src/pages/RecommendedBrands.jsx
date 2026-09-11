import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertTriangle, ArrowRight, ArrowLeft, ShoppingBag, Sparkles, Home } from 'lucide-react';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import BrandCard from '@/components/BrandCard';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n-store';

function Chip({ children }) {
  return <span className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">{children}</span>;
}

export default function RecommendedBrands() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, dir, lang } = useI18n();
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;
  const tierLabel = (tier) => ({ budget: t.rb_tier_budget, mid: t.rb_tier_mid, premium: t.rb_tier_premium, luxury: t.rb_tier_luxury }[tier] || tier);
  const [state, setState] = useState({ loading: true, brands: [], analysis: null, error: '' });
  const [ctx] = useState(() => {
    let s = location.state && location.state.outfit ? location.state : null;
    if (!s) {
      try { s = JSON.parse(localStorage.getItem('styliq_brands_context') || 'null'); } catch { s = null; }
    }
    return s || {};
  });

  useEffect(() => {
    const outfit = ctx.outfit;
    const order = ctx.order;
    if (!outfit) { navigate('/styling', { replace: true }); return; }
    (async () => {
      try {
        const res = await base44.functions.invoke('recommend-brands', { outfit, order, lang });
        const data = res.data || {};
        setState({ loading: false, brands: data.brands || [], analysis: data.analysis || null, error: '' });
        try { localStorage.removeItem('styliq_brands_context'); } catch {}
      } catch (e) {
        setState({ loading: false, brands: [], analysis: null, error: e.message });
      }
    })();
  }, [navigate, ctx]);

  const backToResults = () => {
    const orderId = ctx.order_id;
    if (orderId) navigate(`/results?order_id=${orderId}`);
    else navigate('/styling');
  };

  if (state.loading) {
    return (
      <div dir={dir} className="min-h-screen bg-background">
        <div className="mx-auto max-w-md min-h-screen flex flex-col items-center justify-center px-6 pt-[env(safe-area-inset-top)]">
          <Logo className="mb-8" />
          <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
          <p className="text-muted-foreground">{t.rb_loading}</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div dir={dir} className="min-h-screen bg-background">
        <div className="mx-auto max-w-md min-h-screen flex flex-col items-center justify-center px-6 text-center pt-[env(safe-area-inset-top)]">
          <Logo className="mb-8" />
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-5">
            <AlertTriangle className="w-7 h-7 text-destructive" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">{t.rb_err_t}</h1>
          <p className="text-muted-foreground mb-7 max-w-sm">{state.error}</p>
          <Button onClick={backToResults} className="h-12 px-7 rounded-2xl">{t.rb_back_res}</Button>
        </div>
      </div>
    );
  }

  const outfit = ctx.outfit || {};
  const analysis = state.analysis || {};

  return (
    <div dir={dir} className="min-h-screen bg-background">
      <div className="mx-auto max-w-md pt-[env(safe-area-inset-top)] pb-12">
        {/* Top bar */}
        <div className="px-5 py-4 flex items-center gap-3">
          <button onClick={backToResults} className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center active:scale-95">
            <BackIcon className="w-5 h-5" />
          </button>
          <Logo />
        </div>

        <div className="px-5">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-3">
              <ShoppingBag className="w-3.5 h-3.5" />
              {t.rb_badge}
            </span>
            <h1 className="font-display text-2xl font-bold mb-1.5">{t.rb_title.replace('{title}', outfit.title)}</h1>
            <p className="text-muted-foreground text-sm">{t.rb_desc}</p>
          </motion.div>

          {state.analysis && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="mb-6 bg-card border border-border rounded-3xl p-4">
              <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                <Sparkles className="w-4 h-4 text-accent" />
                {t.rb_analysis}
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.clothing_types?.map((c, i) => <Chip key={`ct${i}`}>{c}</Chip>)}
                {analysis.colors?.map((c, i) => <Chip key={`co${i}`}>{c}</Chip>)}
                {analysis.season && <Chip>{analysis.season}</Chip>}
                {analysis.occasion && <Chip>{analysis.occasion}</Chip>}
                {analysis.style && <Chip>{analysis.style}</Chip>}
                {analysis.price_tier && <Chip>{tierLabel(analysis.price_tier)}</Chip>}
              </div>
            </motion.div>
          )}

          {/* الماركات المقترحة — في الأسفل */}
          <div className="mt-6">
            <h2 className="font-display text-lg font-bold mb-3">{t.rb_suggested}</h2>
            {state.brands.length === 0 ? (
              <p className="text-muted-foreground">{t.rb_empty}</p>
            ) : (
              <div className="space-y-4">
                {state.brands.map((b, i) => <BrandCard key={i} brand={b} index={i} />)}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <Button onClick={() => navigate('/register?returnTo=%2F')} className="h-12 px-7 rounded-2xl w-full">
              <Sparkles className="w-4 h-4 ml-1" />
              {t.rb_register}
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="h-12 px-7 rounded-2xl">
              <Home className="w-4 h-4 ml-1" />
              {t.rb_home}
            </Button>
            <Button variant="ghost" onClick={backToResults} className="h-12 px-7 rounded-2xl">
              <BackIcon className="w-4 h-4 ml-1" />
              {t.rb_back_res}
            </Button>
            <nav className="flex items-center gap-5 text-xs text-muted-foreground">
              <button onClick={() => navigate('/privacy')} className="hover:text-foreground">{t.rb_privacy}</button>
              <button onClick={() => navigate('/terms')} className="hover:text-foreground">{t.rb_terms}</button>
              <button onClick={() => navigate('/contact')} className="hover:text-foreground">{t.rb_contact}</button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}