import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n-store';

export default function BrandCard({ brand, index }) {
  const { t } = useI18n();
  const tierLabel = (tier) => ({ budget: t.rb_tier_budget, mid: t.rb_tier_mid, premium: t.rb_tier_premium, luxury: t.rb_tier_luxury }[tier] || tier);
  const initial = (brand.name || '?').trim().charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="bg-card border border-border rounded-2xl p-6 flex flex-col hover:border-accent/40 transition-colors"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-display text-2xl font-bold shrink-0">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold leading-tight">{brand.name}</h3>
            {brand.price_tier && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                {tierLabel(brand.price_tier)}
              </span>
            )}
          </div>
          {brand.categories && brand.categories.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
              <Tag className="w-3 h-3" />
              {brand.categories.join(' · ')}
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">{brand.description}</p>

      {brand.products && brand.products.length > 0 ? (
        <div className="space-y-2 mb-4">
          {brand.products.map((p, i) => (
            <div key={i} className="flex items-center justify-between text-sm border border-border rounded-xl px-3 py-2">
              <span className="font-medium">{p.name}</span>
              {p.price && <span className="text-muted-foreground">{p.price}</span>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground/70 mb-4">{t.bc_no_products}</p>
      )}

      {brand.website ? (
        <Button asChild variant="outline" className="w-full h-11 rounded-full">
          <a href={brand.website} target="_blank" rel="noopener noreferrer">
            {t.bc_view}
            <ExternalLink className="w-4 h-4 mr-2" />
          </a>
        </Button>
      ) : (
        <Button variant="outline" disabled className="w-full h-11 rounded-full">{t.bc_view}</Button>
      )}
    </motion.div>
  );
}