import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    let user;
    try {
      user = await base44.auth.me();
    } catch (e) {
      return Response.json({ error: 'Unauthorized', code: 'auth_required' }, { status: 401 });
    }
    if (!user) return Response.json({ error: 'Unauthorized', code: 'auth_required' }, { status: 401 });

    // حذف بيانات المستخدم من الكيانات أولاً
    try { await base44.asServiceRole.entities.SavedOutfit.deleteMany({ created_by_id: user.id }); } catch (e) { console.error('saved delete failed:', e.message); }
    try { await base44.asServiceRole.entities.StylingOrder.deleteMany({ created_by_id: user.id }); } catch (e) { console.error('orders delete failed:', e.message); }

    // حذف سجل المستخدم نفسه
    await base44.asServiceRole.entities.User.delete(user.id);

    return Response.json({ success: true });
  } catch (error) {
    console.error('delete-account error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}