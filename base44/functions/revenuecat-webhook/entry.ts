// Webhook من RevenueCat: يستقبل أحداث الشراء ويضيف 5 كريديت لكل شراء consumable.
//
// المنتج Consumable → NON_RENEWING_PURCHASE فقط.
// منع التكرار: نخزّن معرّف معاملة المتجر + معرّف الحدث في rc_processed_ids
// و rc_processed_event_ids. نفس الشراء بـ event.id مختلف لن يضيف +5 مرة ثانية.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

const CREDIT_EVENT_TYPES = ['NON_RENEWING_PURCHASE'];
const CANCELLATION_TYPES = [
  'CANCELLATION',
  'EXPIRATION',
  'BILLING_ISSUE',
  'SUBSCRIPTION_PAUSED',
];
const CREDITS_PER_PURCHASE = 5;
const MAX_STORED_IDS = 100;

function collectProcessedIds(user: any): string[] {
  const fromEvents = Array.isArray(user?.rc_processed_event_ids)
    ? user.rc_processed_event_ids.map(String)
    : [];
  const fromTxn = Array.isArray(user?.rc_processed_ids)
    ? user.rc_processed_ids.map(String)
    : [];
  return [...new Set([...fromEvents, ...fromTxn].filter(Boolean))];
}

function purchaseIdentity(event: any): { keys: string[]; creditKey: string | null } {
  const raw = [
    event?.store_transaction_id,
    event?.transaction_id,
    event?.original_transaction_id,
    event?.product_transaction_id,
    event?.id,
    event?.event_id,
  ]
    .map((v) => (v == null ? '' : String(v).trim()))
    .filter(Boolean);

  const keys = [...new Set(raw)];
  const txn =
    String(event?.store_transaction_id || '').trim() ||
    String(event?.transaction_id || '').trim() ||
    String(event?.original_transaction_id || '').trim() ||
    String(event?.id || event?.event_id || '').trim() ||
    '';

  return {
    keys,
    creditKey: txn ? `credited:${txn}` : null,
  };
}

export default async function (req: Request): Promise<Response> {
  const authHeader = req.headers.get('authorization') || '';
  const expected = `Bearer ${secrets.get('REVENUECAT_WEBHOOK_AUTH')}`;
  if (!authHeader || authHeader !== expected) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const event: any = body?.event || body;
  const type: string = event?.type || event?.event_type || '';
  const appUserId: string = event?.app_user_id || event?.appUserID || '';

  if (!appUserId || !type) {
    return Response.json({ received: true, ignored: true, reason: 'missing_fields' });
  }

  const base44 = createClientFromRequest(req);

  try {
    const user: any = await base44.asServiceRole.entities.User.get(appUserId);
    if (!user) {
      return Response.json({ received: true, ignored: true, reason: 'user_not_found' });
    }

    if (CREDIT_EVENT_TYPES.includes(type)) {
      const { keys, creditKey } = purchaseIdentity(event);
      if (!creditKey || keys.length === 0) {
        return Response.json({
          received: true,
          ignored: true,
          reason: 'missing_purchase_id',
        });
      }

      const processed = collectProcessedIds(user);
      if (processed.includes(creditKey) || keys.some((k) => processed.includes(k))) {
        return Response.json({
          received: true,
          ignored: true,
          reason: 'duplicate_purchase',
          credit_key: creditKey,
          keys,
        });
      }

      const currentCredits = Number(user.credits) || 0;
      const nextProcessed = [...processed, creditKey, ...keys].slice(-MAX_STORED_IDS);

      await base44.asServiceRole.entities.User.update(appUserId, {
        is_pro: true,
        credits: currentCredits + CREDITS_PER_PURCHASE,
        rc_processed_event_ids: nextProcessed,
        rc_processed_ids: nextProcessed,
      });

      return Response.json({
        received: true,
        processed: true,
        type,
        credits_added: CREDITS_PER_PURCHASE,
        credit_key: creditKey,
        keys,
      });
    }

    if (CANCELLATION_TYPES.includes(type)) {
      await base44.asServiceRole.entities.User.update(appUserId, {
        is_pro: false,
      });
      return Response.json({ received: true, processed: true, type, is_pro: false });
    }

    return Response.json({ received: true, ignored: true, type });
  } catch (error: any) {
    console.error('revenuecat-webhook error:', error?.message || error);
    return Response.json({ received: true, error: String(error?.message || error) }, { status: 500 });
  }
}
