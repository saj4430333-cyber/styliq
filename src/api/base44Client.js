import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { apiServerUrl, backendOrigin } from '@/lib/native';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// On Capacitor, same-origin `/api` hits the WebView (localhost) and pages fail to load.
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: apiServerUrl(),
  requiresAuth: false,
  appBaseUrl: appBaseUrl || backendOrigin()
});
