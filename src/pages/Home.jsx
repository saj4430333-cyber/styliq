import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Sparkles, Heart, Clock, ArrowLeft, Shirt } from 'lucide-react';
import Logo from '@/components/Logo';
import PullToRefresh from '@/components/PullToRefresh';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { isOnboarded, getOnboardingPrefs, clearOnboardingPrefs } from '@/lib/language';
import { useI18n } from '@/lib/i18n-store';
import { styleDisplayName, occasionDisplayName } from '@/lib/translate';
import { isPaymentsEnabled } from '@/lib/features';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const [orders, setOrders] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const [o, s] = await Promise.all([
        base44.entities.StylingOrder.list('-created_date', 10),
        base44.entities.SavedOutfit.list('-created_date', 10),
      ]);
      setOrders(o || []);
      setSaved(s || []);
    } catch (e) {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { reload(); }, [reload]);

  // الضغط مجدداً على تبويب الرئيسية يمرّر الصفحة للأعلى
  useEffect(() => {
    const handler = (e) => {
      if (e.detail === '/') window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('active-tab-reselected', handler);
    return () => window.removeEventListener('active-tab-reselected', handler);
  }, []);

  // أول زيارة: أجبر العميل على الإعداد (لغة + تصميم + تسجيل)
  useEffect(() => {
    if (!user && !isOnboarded()) {
      navigate('/onboarding', { replace: true });
    }
  }, [user, navigate]);

  // بعد التسجيل: احفظ تفضيلات الإعداد في حساب المستخدم
  useEffect(() => {
    if (!user) return;
    const prefs = getOnboardingPrefs();
    if (prefs) {
      base44.auth.updateMe({
        height: Number(prefs.height) || null,
        weight: Number(prefs.weight) || null,
        gender: prefs.gender || null,
        default_season: prefs.season || null,
        default_style: prefs.style || null,
      }).catch(() => {});
      clearOnboardingPrefs();
    }
  }, [user]);

  const name = user?.full_name || (user?.email ? user.email.split('@')[0] : t.home_friend);
  const recent = orders.filter((o) => o.outfits && o.outfits.length);

  return (
    <PullToRefresh onRefresh={reload} className="px-5 pt-5">
      {/* Top */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground">{t.home_welcome}</p>
          <h1 className="font-display text-2xl font-bold">{name}</h1>
        </div>
        <div className="flex items-center gap-2">
          {isPaymentsEnabled() && (
            <button
              onClick={() => navigate('/pricing')}
              className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              كريديت: {user?.credits ?? 0}
            </button>
          )}
          <Logo />
        </div>
      </div>

      {/* Create CTA */}
      <motion.button
        onClick={() => navigate('/styling')}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        className="w-full rounded-3xl bg-gradient-to-br from-accent to-orange-500 text-white p-5 mb-7 relative overflow-hidden shadow-glow"
      >
        <div className="absolute -top-12 -left-12 w-44 h-44 rounded-full bg-white/15 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <span className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 ring-1 ring-white/25">
            <Plus className="w-7 h-7 text-white" strokeWidth={2.4} />
          </span>
          <div className="flex-1">
            <h2 className="font-bold text-lg mb-0.5">{t.home_new}</h2>
            <p className="text-white/80 text-sm">{t.home_new_desc}</p>
          </div>
          <ArrowLeft className="w-5 h-5 text-white/70" />
        </div>
      </motion.button>

      {/* Recent designs */}
      <Section title={t.home_recent} icon={Clock} onMore={() => navigate('/designs')} showMore={recent.length > 0} allLabel={t.home_all}>
        {recent.length ? (
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
            {recent.map((o) => {
              const first = o.outfits[0];
              const img = first?.image_mannequin || first?.image_flat || first?.image_url;
              return (
                <button key={o.id} onClick={() => navigate(`/results?order_id=${o.id}`)} className="shrink-0 w-36 text-start">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-muted mb-2">
                    {img ? <Image src={img} alt={first?.title} className="w-full h-full" fittingType="fill" /> : <div className="w-full h-full flex items-center justify-center"><Shirt className="w-8 h-8 text-muted-foreground/40" /></div>}
                  </div>
                  <p className="text-sm font-medium truncate">{styleDisplayName(o.style, lang)} · {occasionDisplayName(o.occasion, lang)}</p>
                  <p className="text-xs text-muted-foreground">{o.outfits.length} {t.home_outfits}</p>
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyMini text={loading ? t.home_loading_orders : t.home_empty_orders} />
        )}
      </Section>

      {/* Saved */}
      <Section title={t.home_saved} icon={Heart} onMore={() => navigate('/my-styles')} showMore={saved.length > 0} allLabel={t.home_all}>
        {saved.length ? (
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
            {saved.map((s) => {
              const img = s.outfit?.image_mannequin || s.outfit?.image_flat || s.outfit?.image_url || s.image_url;
              return (
                <button key={s.id} onClick={() => navigate('/my-styles')} className="shrink-0 w-36 text-start">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-muted mb-2">
                    {img ? <Image src={img} alt={s.title} className="w-full h-full" fittingType="fill" /> : <div className="w-full h-full flex items-center justify-center"><Shirt className="w-8 h-8 text-muted-foreground/40" /></div>}
                  </div>
                  <p className="text-sm font-medium truncate">{s.title}</p>
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyMini text={loading ? t.home_loading_saved : t.home_empty_saved} />
        )}
      </Section>

      {/* How it works */}
      <div className="mt-7 rounded-3xl bg-accent/5 border border-accent/15 p-5">
        <div className="flex items-center gap-2 text-accent mb-2 font-medium text-sm">
          <Sparkles className="w-4 h-4" />
          {t.home_how}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {isPaymentsEnabled() ? t.home_how_desc : t.home_how_desc_free}
        </p>
      </div>
    </PullToRefresh>
  );
}

function Section({ title, icon: Icon, onMore, showMore, allLabel, children }) {
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-accent" />
          <h2 className="font-bold text-base">{title}</h2>
        </div>
        {showMore && (
          <button onClick={onMore} className="text-xs text-muted-foreground flex items-center gap-1">
            {allLabel}
            <ArrowLeft className="w-3 h-3" />
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function EmptyMini({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-6 text-center">
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}