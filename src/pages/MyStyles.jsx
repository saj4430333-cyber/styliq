import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Heart, Clock, RefreshCw, ArrowLeft, Shirt, Sparkles } from 'lucide-react';
import SavedOutfitCard from '@/components/SavedOutfitCard';
import PullToRefresh from '@/components/PullToRefresh';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n-store';
import { styleDisplayName, occasionDisplayName, seasonDisplayName, genderDisplayName } from '@/lib/translate';

export default function MyStyles() {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const [tab, setTab] = useState('favorites');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [favs, ords] = await Promise.all([
        base44.entities.SavedOutfit.list('-created_date', 50),
        base44.entities.StylingOrder.list('-created_date', 50),
      ]);
      setFavorites(favs || []);
      setOrders(ords || []);
    } catch (e) {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // الضغط مجدداً على تبويب المفضلة يمرّر الصفحة للأعلى
  useEffect(() => {
    const handler = (e) => {
      if (e.detail === '/my-styles') window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('active-tab-reselected', handler);
    return () => window.removeEventListener('active-tab-reselected', handler);
  }, []);

  const removeFav = async (id) => {
    const prev = favorites;
    setFavorites((p) => p.filter((f) => f.id !== id));
    try {
      await base44.entities.SavedOutfit.delete(id);
    } catch (e) {
      setFavorites(prev);
    }
  };

  const reuse = (order) => {
    navigate('/styling', {
      state: {
        prefill: {
          height: order.height,
          weight: order.weight,
          gender: order.gender,
          season: order.season,
          style: order.style,
          occasion: order.occasion,
        },
      },
    });
  };

  const formatDate = (d) => {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-EG' : lang, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <PullToRefresh onRefresh={load} className="px-5 pt-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-5">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          {t.my_badge}
        </span>
        <h1 className="font-display text-3xl font-bold">{t.my_title}</h1>
      </motion.div>

      {/* Tabs */}
      <div className="inline-flex gap-1 bg-secondary p-1 rounded-full mb-6">
        <button
          type="button"
          onClick={() => setTab('favorites')}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${tab === 'favorites' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
        >
          <Heart className="w-4 h-4" />
          {t.my_fav} ({favorites.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('history')}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${tab === 'history' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
        >
          <Clock className="w-4 h-4" />
          {t.my_hist} ({orders.length})
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent mb-3" />
          <p className="text-muted-foreground text-sm">{t.my_loading}</p>
        </div>
      ) : tab === 'favorites' ? (
        favorites.length === 0 ? (
          <EmptyState
            icon={Heart}
            title={t.my_fav_empty_t}
            desc={t.my_fav_empty_d}
            actionLabel={t.my_new}
            onAction={() => navigate('/styling')}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {favorites.map((f, i) => (
              <SavedOutfitCard key={f.id} item={f} index={i} onRemove={removeFav} />
            ))}
          </div>
        )
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Clock}
          title={t.my_hist_empty_t}
          desc={t.my_hist_empty_d}
          actionLabel={t.my_new}
          onAction={() => navigate('/styling')}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-card border border-border rounded-3xl p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-sm">{styleDisplayName(order.style, lang)} · {occasionDisplayName(order.occasion, lang)}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">{seasonDisplayName(order.season, lang)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.created_date)} · {genderDisplayName(order.gender, lang)}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="icon" onClick={() => reuse(order)} className="rounded-xl h-9 w-9">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" onClick={() => navigate(`/results?order_id=${order.id}`)} className="rounded-xl h-9 w-9">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {order.outfits && order.outfits.length > 0 ? (
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
                  {order.outfits.map((o, j) => {
                    const img = o.image_mannequin || o.image_flat || o.image_url;
                    return (
                      <div key={j} className="shrink-0 w-24">
                        <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted mb-1.5">
                          {img ? (
                            <Image src={img} alt={o.title} className="w-full h-full" fittingType="fill" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Shirt className="w-5 h-5 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] font-medium truncate">{o.title}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t.my_no_outfits}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </PullToRefresh>
  );
}

function EmptyState({ icon: Icon, title, desc, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center text-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
        <Icon className="w-8 h-8 text-accent" />
      </div>
      <h3 className="font-display text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-xs">{desc}</p>
      <Button onClick={onAction} className="h-12 px-7 rounded-2xl">{actionLabel}</Button>
    </div>
  );
}