import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { apiServerUrl, backendOrigin } from '@/lib/native';

const { appId, token, appBaseUrl } = appParams;

// On Capacitor, same-origin `/api` hits the WebView (localhost) and pages fail to load.
// لا نمرّر functionsVersion حتى نستخدم دائماً أحدث draft المنشور عبر CLI.
export const base44 = createClient({
  appId,
  token,
  serverUrl: apiServerUrl(),
  requiresAuth: false,
  appBaseUrl: appBaseUrl || backendOrigin()
});
