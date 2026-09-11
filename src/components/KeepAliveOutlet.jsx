import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// تبديل الصفحات بانتقال بسيط. لا نحتفظ بعناصر Outlet قديمة:
// النسخة السابقة كانت تكدّس الصفحات بترتيب الزيارة وتعرض الصفحة الخطأ على iOS/Android.
export default function KeepAliveOutlet() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}
