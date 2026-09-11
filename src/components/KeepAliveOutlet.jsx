import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

// بدون Framer Motion: على iOS WKWebView أي transform/animation على الحاوية
// قد يمنع التركيز والكتابة في حقول الإدخال.
export default function KeepAliveOutlet() {
  const location = useLocation();

  return (
    <div key={location.pathname}>
      <Outlet />
    </div>
  );
}
