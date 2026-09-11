import React from 'react';

export default function Logo({ className = '', compact = false }) {
  return (
    <span className={`font-display text-[1.7rem] leading-none font-extrabold tracking-[-0.02em] ${className}`}>
      Styli<span className="text-accent">Q</span>
    </span>
  );
}