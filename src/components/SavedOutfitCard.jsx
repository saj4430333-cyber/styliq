import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Shirt } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';

export default function SavedOutfitCard({ item, index, onRemove }) {
  const outfit = item.outfit || {};
  const img = outfit.image_mannequin || outfit.image_flat || outfit.image_url || item.image_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="bg-card border border-border rounded-3xl overflow-hidden flex flex-col"
    >
      <div className="relative aspect-[4/5] bg-muted">
        {img ? (
          <Image src={img} alt={item.title} className="w-full h-full" fittingType="fill" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Shirt className="w-10 h-10 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold mb-1">{item.title || outfit.title}</h3>
        {outfit.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">{outfit.description}</p>
        )}
        {outfit.colors && outfit.colors.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {outfit.colors.map((c, i) => (
              <span key={i} className="px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[11px] font-medium">{c}</span>
            ))}
          </div>
        )}
        <div className="mt-auto pt-1">
          <Button
            variant="outline"
            onClick={() => onRemove(item.id)}
            className="w-full h-11 rounded-2xl text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 ml-1.5" />
            إزالة
          </Button>
        </div>
      </div>
    </motion.div>
  );
}