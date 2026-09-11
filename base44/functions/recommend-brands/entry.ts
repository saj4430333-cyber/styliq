import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const RB_LANG = {
  ar: 'استخدم العربية في description و categories وحقول analysis النصية.',
  en: 'Write description, categories, and analysis text fields in English.',
  fr: 'Rédigez description, categories et les champs texte de analysis en français.',
  es: 'Escribe description, categories y los campos de texto de analysis en español.',
  de: 'Verfasse description, categories und die Textfelder von analysis auf Deutsch.',
  it: 'Scrivi description, categories e i campi di testo di analysis in italiano.',
  pt: 'Escreva description, categories e os campos de texto de analysis em português.',
  tr: 'description, categories ve analysis metin alanlarını Türkçe yazın.',
  ru: 'Пишите description, categories и текстовые поля analysis на русском.',
  id: 'Tulis description, categories, dan bidang teks analysis dalam bahasa Indonesia.',
};

function buildPrompt(outfit, order, lang) {
  const acc = (outfit.accessories || []).map((a) => a.item).filter(Boolean).join('، ') || 'لا يوجد';
  const colors = (outfit.colors || []).join('، ') || 'غير محدد';
  const style = order?.style || 'غير محدد';
  return `أنت خبير أزياء ومرشد تسوّق. مهمتك: اقترح ٦ إلى ٨ ماركات أزياء حقيقية ومعروفة عالميًا تتطابق تمامًا مع الستايل المختار "${style}".

★ المعيار الأول والأهم: الستايل "${style}" هو المحدّد الأساسي لاختيار الماركات. يجب أن تكون كل ماركة تختارها معروفة فعلًا بأنها تقدّم أو تتقن هذا الستايل تحديدًا. لا تختتر ماركات عامة أو ماركات لا تمثّل هذا الستايل حتى لو ناسبت القطع. تجنّب الماركات التي لا تتناسب مع "${style}" تمامًا.

★ التنوّع مطلوب: اختر ماركات متنوّعة قدر الإمكان ضمن الستايل "${style}":
  - نوّع بين مستويات السعر: على الأقل ماركة واحدة budget وأخرى mid وأخرى premium (وماركة luxury إن كان الستايل يدعمها).
  - نوّع بين ماركات عالمية كبرى، ماركات متخصصة/نيش في هذا الستايل، وماركات شعبية تقدّم هذا الستايل بأسعار مناسبة.
  - لا تكرّر ماركات قريبة جدًا في الهوية أو التسعير؛ اجعل كل ماركة تضيف زاوية مختلفة لتحقيق الستايل.
  - إن أمكن، أدرج ماركة أو اثنتين تقدّمان هذا الستايل لفئة ${order?.gender === 'أنثى' ? 'النساء' : order?.gender === 'ذكر' ? 'الرجال' : 'الجنسين'} بوضوح.

بيانات المستخدم والطلب:
- الجنس: ${order?.gender || 'غير محدد'}
- الموسم: ${order?.season || 'غير محدد'}
- الستايل المطلوب (الأساس): ${style}
- المناسبة: ${order?.occasion || 'غير محدد'}

التنسيق المختار (للسياق فقط):
- العنوان: ${outfit.title || ''}
- الوصف: ${outfit.description || ''}
- القطعة العلوية: ${outfit.top?.item || ''} (${outfit.top?.detail || ''})
- القطعة السفلية: ${outfit.bottom?.item || ''} (${outfit.bottom?.detail || ''})
- الحذاء: ${outfit.shoes?.item || ''} (${outfit.shoes?.detail || ''})
- الإكسسوارات: ${acc}
- الألوان: ${colors}

المطلوب:
1. analysis: استخرج من التنسيق: أنواع الملابس (clothing_types)، الألوان (colors)، الموسم (season)، المناسبة (occasion)، الستايل (style — يجب أن يساوي "${style}"), ومستوى السعر المناسب (price_tier).
2. brands: من ٦ إلى ٨ ماركات حقيقية موجودة فعلًا عالميًا، كل منها معروفة بأنها تقدّم الستايل "${style}" تحديدًا، مع تنوّع واضح في مستويات السعر والهوية (عالمية/متخصصة/شعبية). لكل ماركة قدّم:
   - name: اسم الماركة (ماركة حقيقية معروفة)
   - description: اشرح صراحةً كيف تتقن/تمثّل هذه الماركة الستايل "${style}" تحديدًا (بالعربية، جملة أو جملتين)
   - website: رابط موقعها الرسمي إن كان معروفًا، وإلا ""
   - price_tier: واحد من budget | mid | premium | luxury
   - categories: فئات تخصصها (مثل: قمصان، بناطيل، أحذية، إكسسوار)
   - products: [] (اتركها فارغة دائمًا — ستُربط مصادر المنتجات الحقيقية لاحقًا)

قواعد صارمة:
- المعيار الأول هو مطابقة الستايل "${style}". أي ماركة لا تمثّل هذا الستايل تُستبعد.
- لا تختلق منتجات أو أسعار كأنها حقيقية. أعد products كمصفوفة فارغة دائمًا.
- أسماء الماركات يجب أن تكون ماركات حقيقية موجودة فعلًا في السوق العالمي ومعروفة بهذا الستايل.
- ${RB_LANG[lang] || RB_LANG.en} استخدم الإنجليزية في name فقط.`;
}

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    analysis: {
      type: 'object',
      properties: {
        clothing_types: { type: 'array', items: { type: 'string' } },
        colors: { type: 'array', items: { type: 'string' } },
        season: { type: 'string' },
        occasion: { type: 'string' },
        style: { type: 'string' },
        price_tier: { type: 'string', enum: ['budget', 'mid', 'premium', 'luxury'] }
      },
      required: ['clothing_types', 'colors', 'season', 'occasion', 'style', 'price_tier']
    },
    brands: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          website: { type: 'string' },
          price_tier: { type: 'string', enum: ['budget', 'mid', 'premium', 'luxury'] },
          categories: { type: 'array', items: { type: 'string' } },
          products: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                price: { type: 'string' },
                url: { type: 'string' }
              }
            }
          }
        },
        required: ['name', 'description', 'website', 'price_tier', 'categories', 'products']
      }
    }
  },
  required: ['analysis', 'brands']
};

export default async function(req) {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    // مصادقة إلزامية: لا يُسمح بتشغيل الدالة (أو استدعاء LLM المدفوع) إلا لمستخدم مسجّل.
    // هوية المستخدم تُؤخذ من الجلسة côté الخادم فقط — لا تُقبل من العميل.
    let me;
    try {
      me = await base44.auth.me();
    } catch (e) {
      return Response.json({ error: 'Unauthorized', code: 'auth_required' }, { status: 401 });
    }
    if (!me) {
      return Response.json({ error: 'Unauthorized', code: 'auth_required' }, { status: 401 });
    }

    const outfit = body.outfit;
    const order = body.order;
    const lang = body.lang || 'ar';
    if (!outfit || !outfit.title) {
      return Response.json({ error: 'التنسيق مطلوب' }, { status: 400 });
    }

    const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: buildPrompt(outfit, order, lang),
      response_json_schema: RESPONSE_SCHEMA
    });

    const brands = (llmRes && llmRes.brands ? llmRes.brands : []).slice(0, 8).map((b) => ({
      name: b.name,
      description: b.description,
      website: (b.website || '').trim(),
      price_tier: b.price_tier,
      categories: b.categories || [],
      products: [] // يُترك فارغًا حتى ربط مصادر منتجات حقيقية لاحقًا
    }));

    return Response.json({
      analysis: llmRes?.analysis || null,
      brands,
      extensible: true // إشارة لأن النظام قابل للتوسع لربط متاجر/منتجات حقيقية لاحقًا
    });
  } catch (error) {
    console.error('recommend-brands error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}