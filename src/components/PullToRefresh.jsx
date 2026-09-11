import React, { useRef, useState, useCallback } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

const THRESHOLD = 64;

export default function PullToRefresh({ onRefresh, children, className }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const active = useRef(false);

  const onStart = useCallback((e) => {
    if (typeof window !== 'undefined' && window.scrollY <= 0) {
      startY.current = e.touches[0].clientY;
      active.current = true;
    } else {
      active.current = false;
    }
  }, []);

  const onMove = useCallback((e) => {
    if (!active.current || refreshing) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) setPull(Math.min(dy * 0.5, 90));
  }, [refreshing]);

  const onEnd = useCallback(async () => {
    if (!active.current) return;
    active.current = false;
    if (pull > THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPull(0);
      try { await onRefresh?.(); } finally { setRefreshing(false); }
    } else {
      setPull(0);
    }
  }, [pull, refreshing, onRefresh]);

  const height = refreshing ? 48 : pull;

  return (
    <div className={className} onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd} onTouchCancel={onEnd}>
      <div className="flex items-center justify-center overflow-hidden transition-[height] duration-200" style={{ height }}>
        {refreshing ? (
          <Loader2 className="w-5 h-5 text-accent animate-spin" />
        ) : pull > 4 ? (
          <RefreshCw
            className="w-5 h-5 text-accent transition-transform"
            style={{ transform: `rotate(${Math.min(pull * 4, 360)}deg)`, opacity: Math.min(pull / THRESHOLD, 1) }}
          />
        ) : null}
      </div>
      {children}
    </div>
  );
}