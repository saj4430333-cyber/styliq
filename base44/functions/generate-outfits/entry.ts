import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const LANG_INSTRUCTION = {
  ar: 'استخدم العربية لكل الحقول النصية.',
  en: 'Write all text fields (title, description, reason, product_name, color) in English.',
  fr: 'Rédigez tous les champs textuels (title, description, reason, product_name, color) en français.',
  es: 'Escribe todos los campos de texto (title, description, reason, product_name, color) en español.',
  de: 'Verfasse alle Textfelder (title, description, reason, product_name, color) auf Deutsch.',
  it: 'Scrivi tutti i campi di testo (title, description, reason, product_name, color) in italiano.',
  pt: 'Escreva todos os campos de texto (title, description, reason, product_name, color) em português.',
  tr: 'Tüm metin alanlarını (title, description, reason, product_name, color) Türkçe yazın.',
  ru: 'Пишите все текстовые поля (title, description, reason, product_name, color) на русском.',
  id: 'Tulis semua bidang teks (title, description, reason, product_name, color) dalam bahasa Indonesia.',
};

function bodyDescriptor(order) {
  const h = Number(order.height) || 0;
  const w = Number(order.weight) || 0;
  let heightWord = 'average height';
  if (h && h < 160) heightWord = 'petite';
  else if (h >= 178) heightWord = 'tall';
  let buildWord = 'average build';
  if (h && w) {
    const bmi = w / Math.pow(h / 100, 2);
    if (bmi < 18.5) buildWord = 'slim build';
    else if (bmi < 25) buildWord = 'fit build';
    else if (bmi < 30) buildWord = 'fuller build';
    else buildWord = 'plus-size build';
  }
  return `${heightWord}, ${buildWord}`;
}

function skinToneWord(tone) {
  const map = {
    'أبيض': 'very fair porcelain skin',
    'فاتح': 'fair skin',
    'حنطي': 'olive tan skin',
    'أسمر': 'brown skin',
    'غامق': 'dark brown skin'
  };
  return map[tone] || '';
}

function styleGuidance(style) {
  const map = {
    'كاجوال': 'أناقة يومية مرفوعة بعناية: تيشيرت قطني فاخر بقصّة منظّمة، جينز أو بنطال تشينو بقصّة مستقيمة أنيقة، سنيكرز جلدي بسيط. لوحة ألوان حيادية متزنة (بيج/كحلي/أبيض) مع لمسة لونية واحدة دافئة. مظهر مرتّب يبدو عفوياً لكنه مدروس بذوق رفيع.',
    'رسمي': 'بدلة بقصّة محترفة تلامس الجسم بدقة، خامات صوف راقية، ألوان كلاسيكية عميقة (كحلي/فحمي/زيتي). قميص أبيض بياقة كلاسيكية، حذاء جلدي لامع (ديربي/أوكسفورد). تفاصيل دقيقة: ياقة متزنة، قَصّة بنطال مستقيمة، تناسق تام بين القطع لإطلالة ذات حضور راقٍ.',
    'كلاسيكي': 'خطوط خالدة لا تتأثر بالموضة: قصّات مستقيمة نظيفة، خامات فاخرة (صوف/كتان/حرير)، لوحة ألوان حيادية راقية. تناسق هادئ ومتزن يعكس ذوقاً رفيعاً وأناقة لا تشيخ، مع اهتمام دقيق بالتفاصيل والقَصّة وجودة الخامة.',
    'عصري': 'قصّات حديثة أنيقة بمزيج متزن بين الكاجوال والرسمي: بليزر بقصّة معاصرة فوق تيشيرت قطني، بنطال بقصّة مستقيمة مفعّمة، سنيكرز أنيق. ألوان عصرية متدرّجة ولوحة متناسقة تعكس روح المدينة الحديثة بذوق راقٍ.',
    'مينيمال': 'نقاء وأناقة في الصمت: خطوط نظيفة، قصّات مستقيمة بسيطة، لوحة حيادية أحادية (أبيض/أسود/بيج/رمادي). خامات فاخرة تتحدّث عن نفسها، بدون زخرفة أو شعارات. جمال في البساطة والتناسق والقَصّة المحترفة.',
    'فاخر': 'أناقة راقية بروح high-end: خامات فاخرة لامسة (ساتان/حرير/صوف فاخر)، قصّات دقيقة، ألوان غنية عميقة أو معدنية. تفاصيل راقية ولمسات لامعة متزنة، إطلالة ذات حضور فاخر يليق بالمناسبات المميزة.',
    'ستريت': 'ستريت وير أنيق وعصري: قصّات مريحة مدروسة، طبقات متناسقة (تيشيرت بأكمام طويلة تحت قطعة قصيرة)، بنطال قصد أو كارغو بقصّة معاصرة، سنيكرز مميّز. ألوان حضرية متزنة مع لمسة جريئة، مظهر urbanean أنيق لا فوضوي.',
    'هيب هوب': 'ستريت وير فضفاض أنيق: قطع oversized بقصّات مدروسة، طبقات متزنة، لوحة ألوان جريئة متناسقة، سنيكرز ضخم مميّز. إطلالة ذات حضور وثقة بأناقة شارع معاصرة، ليست عشوائية بل مدروسة بعناية.',
    'رياضي': 'أثلور أنيق بمظهر رياضي راقٍ: خامات تقنية فاخرة، قصّات مريحة محترفة، سنيكرز عصري مميّز. ألوان نشطة متزنة مع لمسات حيادية، إطلالة رياضية نظيفة تصلح للمدينة والنادي بذوق رفيع.',
    'بوهيمي': 'روح بوهيميانية فنية راقية: طبقات ناعمة متناسقة، خامات طبيعية (كتان/قطن/دمسك)، نقوش وألوان دافئة متزنة، أكسسوارات فنية ذهبية. إطلالة حرة الف朝气 بأناقة مدروسة وذوق فني رفيع.',
    'فينتاج': 'لمسة ريترو كلاسيكية أنيقة: قطع مستوحاة من عقود سابقة بقصّات محدّثة، ألوان دافئة راقية، طبقات ناعمة متناسقة. إطلالة نوستالجية بروح معاصرة وذوق رفيع، تعكس أناقة خالدة بلمسة عصرية.',
    'روك': 'أناقة روك داكنة مدروسة: جلد فاخر، أسود عميق، قصّات حادة أنيقة، أكسسوارات معدنية فضية متزنة، حذاء بوت جلدي. إطلالة ذات حضور وجذب بروح متمرّدة راقية، ليست فوضوية بل مدروسة بعناية.',
    'Y2K': 'لمسة أواخر التسعينيات وأوائل الألفية بأناقة معاصرة: قصّات منخفضة الخصر محدّثة، ألوان معدنية ولامعة متزنة، إكسسوارات جريئة. إطلالة نوستالجية بروح عصرية وذوق رفيع، جريئة لكن متزنة.',
    'أولد ماني': 'أناقة هادئة راقية (quiet luxury): خامات فاخرة (كشمير/كتان/حرير)، ألوان حيادية فاتحة، قصّات كلاسيكية محكمة دون شعارات بارزة. جمال في الصمت والجودة والتناسق، إطلالة تعكس ثقة وذوقاً رفيعاً دون استعراض.',
    'كوتيجكور': 'رومانسية ريفية أنيقة: قطع مطرّزة بخامات طبيعية، ألوان باستيل ناعمة متناسقة، تنانير طويلة انسيابية وبلوزات كمفوف. إطلالة ريفية حالمة بروح رومانسية راقية وذوق ناعم.',
    'تك وير': 'أناقة تقنية مستقبلية: أقمشة تقنية وواقية فاخرة، قصّات وظيفية أنيقة، جيوب متعددة متناسقة، ألوان داكنة عميقة، سحابات وتفاصيل مستقبلية متزنة. إطلالة urbanean عملية بروح مستقبلية راقية.',
    'سكاندينافي': 'مينيمال شمالي راقٍ: خطوط نظيفة جداً، ألوان حيادية فاتحة هادئة، خامات دافئة طبيعية (صوف/كتان)، قصّات بسيطة محكمة. أناقة شمالية هادئة تعكس نقاءً ودفئاً وذوقاً رفيعاً في البساطة.',
    'راستا': 'روح حرة مستوحاة من الكاريبي بأناقة: ألوان أخضر/أصفر/أحمر متناسقة، طبقات فضفاضة مدروسة، نقوش إثنية راقية. إطلالة حرة الفضاء بذوق فني دافئ وروح إيجابية أنيقة.',
    'أثلور': 'أثلور أنيق يومي (athleisure): جاكيت رياضي بقصّة معاصرة، تيشيرت قطني فاخر، بنطال جوقر أو تراكبنتس بقصّة محترفة، سنيكرز عصري مميّز. مزيج متزن بين الراحة والأداء بذوق urbanean راقٍ.',
    'سمارث كاجوال': 'مزيج أنيق متزن بين الرسمي والكاجوال: قميص بياقة مرتّب مع كارديجان أو بليزر كاجوال، بنطال تشينو بقصّة مستقيمة، حذاء جلدي أو سنيكرز أنيق. ألوان حيادية متزنة، إطلالة مرتّبة مريحة بأناقة مدروسة.',
    'بزنس كاجوال': 'أناقة عمل مريحة راقية: قميص بولو أو قميص كاجوال مرتّب، بنطال بقصّة مستقيمة أنيقة، بليزر اختياري متزن، حذاء جلدي أنيق. ألوان محايدة احترافية، إطلالة عمل تبعث ثقة واحترافية بذوق رفيع.',
    'بوهيمي فاخر': 'لمسة بوهيمية فاخرة (boho-luxe): طبقات ناعمة من خامات راقية، نقوش نباتية أنيقة، ألوان دافئة غنية متزنة، أكسسوارات ذهبية فاخرة. إطلالة فنية راقية بروح بوهيمية وذوق رفيع.',
    'رومانسي': 'إطلالة رومانسية أنثوية راقية: قصّات ناعمة انسيابية من حرير ودانتيل فاخر، ألوان باستيل أو زهرية ناعمة، تفاصيل رقيقة (كمفوف/طيّات). أنوثة حالمة بذوق رفيع وأناقة ناعمة متزنة.',
    'كاند حول': 'أناقة كاواي لطيفة راقية: ألوان باستيل زاهية متناسقة، قصّات ناعمة أنيقة، نقوش مرحة مدروسة، تنانير بقصّة محترفة، أكسسوارات لطيفة متزنة. روح طفولية أنيقة بذوق رفيع وليست مبتذلة.',
    'جلام': 'أناقة فاخرة جريئة راقية: خامات لامعة فاخرة (ساتان/كريم)، ألوان غنية أو معدنية متزنة، قصّات أنثوية محترفة، تفاصيل لامعة دقيقة. إطلالة مسائية فخمة ذات حضور لافت بأناقة عالية.',
    'ديسكو': 'روح السبعينيات بأناقة معاصرة: خامات لامعة ومعدنية فاخرة، ألوان زاهية متزنة، قصّات واسعة أنيقة، أكمام منفوشة مدروسة، أحذية بمنصات عصرية. روح حفلة راقية بلمسة نوستالجية وذوق رفيع.',
    'محجبة': 'إطلالة محتشمة أنيقة عصرية مخصّصة للمرأة المحجبة: حجاب (وشاح رأس) متناسق مع ألوان الإطلالة، قطع علوية بأكمام طويلة وفضفاضة لا تُحدّد القوام، تنانير طويلة (ماكسي/ميدي) أو بنطال واسع القصّة (ويد ليج)، طبقات ناعمة، تجنّب تماماً القطع القصيرة أو الضيقة أو المفتوحة الصدر أو الشفافة. أناقة راقية محترمة بروح عصرية وذوق رفيع.'
  };
  return map[style] || 'قصّات أنيقة تتناسب مع الستايل المطلوب، باهتمام بالتناسق والخامات والتفاصيل.';
}

const USER_BLOCK = (order, body) => `بيانات المستخدم:
- الجنس: ${order.gender}
- الطول: ${order.height} سم
- الوزن: ${order.weight} كجم
- لون البشرة: ${order.skin_tone || 'غير محدد'}
- القوام: ${body}
- الموسم: ${order.season}
- الستايل المفضل: ${order.style}
- المناسبة: ${order.occasion}`;

function hijabiBlock(order) {
  return order.style === 'محجبة' ? `
قواعد إضافية للإطلالة المحتشمة (إلزامية):
- يجب أن تشمل كل تنسيقة على وشاح رأس (حجاب) كقطعة إضافية (role=accessory) بلون متناسق مع الإطلالة.
- القطعة العلوية (role=top) يجب أن تكون بأكمام طويلة وفضفاضة (مثل تونيك، قميص طويل، كارديجان، بليزر طويل).
- القطعة السفلية (role=bottom) يجب أن تكون طويلة وواسعة (تنورة ماكسي/ميدي، أو بنطال ويد ليج/كارغو فضفاض) — لا بنطال ضيق ولا تنورة قصيرة.
- ممنوع تماماً اختيار: قطع قصيرة (كروب/كروب توب)، قطع ضيقة (سكني/سليم فيت)، قطع مفتوحة الصدر أو بدون أكمام، أو خامات شفافة.
- راعِ أن الحجاب يغطي الشعر والرقبة، وأكمام القطعة العلوية تغطي الذراعين بالكامل.
- اجعل الإطلالة أنيقة محتشمة بروح عصرية تناسب المناسبة والموسم.
` : '';
}

// وضع الكتالوج: اختيار صارم من منتجات حقيقية موجودة
function buildCatalogPrompt(order, catalog, lang) {
  const body = bodyDescriptor(order);
  const guidance = styleGuidance(order.style);
  return `أنت مصمّم أزياء محترف يعمل بالذكاء الاصطناعي. لديك كتالوج منتجات حقيقية فقط. مهمتك اختيار منتجات حقيقية موجودة في الكتالوج حصراً وتكوين 5 تنسيقات ملابس متنوّعة تناسب المستخدم بدقة.

${USER_BLOCK(order, body)}

إرشادات الستايل المطلوب:
${guidance}${hijabiBlock(order)}
الكتالوج المتاح (JSON — الحقل id هو معرّف المنتج الذي يجب اختياره):
${JSON.stringify(catalog)}

قواعد صارمة:
- يجب أن تُنتج بالضبط 5 تنسيقات مختلفة في مصفوفة outfits. أقل من 5 غير مقبول إطلاقاً.
- اختر المنتجات حصراً من قائمة id الموجودة في الكتالوج أعلاه (انسخ قيمة id كما هي تماماً). لا تختَرع أي id أو منتج أو ماركة أو سعر أو رابط غير موجود في الكتالوج.
- التزم بالستايل المطلوب («${order.style}») قدر الإمكان. ابحث أولاً عن منتجات يطابق حقل style فيها الستايل المطلوب تماماً، واستخدمها. إن لم تكن كافية، اختر الأقرب روحاً للستايل.
- المنتجات مرتّبة بحقل _match (الأعلى = الأكثر مطابقة)؛ فضّل الأعلى.
- كل تنسيق يجب أن يحتوي إلزامياً على: top + bottom + shoes، وaccessory اختياري.
- اختر منتجات تطابق جنس المستخدم (gender) أو unisex.
- راعِ الموسم (season) والمناسبة (occasion) والقوام (${body}).
- اجعل التنسيقات الخمسة متنوّعة في الألوان والأشكال والقَصّات.
- لا تكرر نفس المنتج (id) داخل التنسيق الواحد.
- title: اسم جذّاب قصير. description: وصف سطر واحد. reason: شرح مفصّل لماذا يناسب المستخدم (الستايل/القوام/الموسم/المناسبة).
- ${LANG_INSTRUCTION[lang] || LANG_INSTRUCTION.en}
  أرجع JSON بالبنية المطلوبة فقط.`;
}

// الوضع الإبداعي: توليد اقتراحات أنيقة مع ماركات عالمية بدون الاعتماد على كتالوج
function buildCreativePrompt(order, lang) {
  const body = bodyDescriptor(order);
  const guidance = styleGuidance(order.style);
  return `أنت مصمّم أزياء محترف يعمل بالذكاء الاصطناعي. مهمتك اقتراح 5 تنسيقات ملابس أنيقة جداً ومتنوّعة تناسب المستخدم بدقة، مع اقتراح أفضل الماركات العالمية لكل قطعة (ماركات حقيقية متاحة عالمياً مثل Zara, H&M, Mango, Massimo Dutti, COS, Uniqlo, Levi's, Calvin Klein, Tommy Hilfiger, Ralph Lauren, Nike, Adidas, Puma, New Balance, Asics, Gucci, Balenciaga, Burberry, North Face, Carhartt, Diesel, Replay, G-Star, Pull&Bear, Stradivarius, Bershka, Asos, Nordstrom...).

${USER_BLOCK(order, body)}

إرشادات الستايل المطلوب:
${guidance}${hijabiBlock(order)}${order.gender === 'ذكر' ? `
إرشادات إضافية لإطلالات رجالية أنيقة (إلزامية):
- اجعل كل تنسيق أنيقاً وجذّاباً ومتوازن الألوان، باهتمام بالتفاصيل والقَصّات والخامات.
- التزم بقَصّات رجالية محترفة تُبرز القوام: بنطال بقصّة مستقيمة أو مفعّمة (relaxed/tapered)، توب بقصّة أنيقة تلامس الجسم دون ضيق مفرط، طبقات متناسقة عند الحاجة.
- راعِ تناسق الألوان: اقرن ألوان محايدة (كحلي/بيج/زيتي/فحمي/أبيض) مع لون مميز واحد كنقطة تركيز أنيقة. تجنّب التركيبات الفوضوية أو الباهتة.
- الأحذية رجالية أنيقة وواضحة وملائمة للستايل (سنيكرز جلدي، موكاسين، ديربي، بوت تشوكا) — لا أحذية رياضية رخيصة المظهر.
- اجعل الإطلالات تبدو وكأنها من مجلة موضة رجالية راقية (GQ/Esquire) لا عشوائية.
` : ''}
قواعد صارمة:
- يجب أن تُنتج بالضبط 5 تنسيقات مختلفة في مصفوفة outfits. أقل من 5 غير مقبول إطلاقاً.
- كل تنسيق يجب أن يحتوي إلزامياً على: top + bottom + shoes، وaccessory اختياري (للمحجبة: accessory = وشاح رأس إلزامي).
- لكل قطعة اقترح: role, brand (ماركة عالمية حقيقية مناسبة للستايل والفئة), product_name (وصف دقيق للقطعة مثل «قميص قطني أبيض بياقة كلاسيكية»), category, color (لون محدد بنفس لغة المخرجات مثل «أبيض»/«كحلي»).
- التزم بالستايل («${order.style}») بدقة، وراعِ الموسم والمناسبة والقوام (${body}).
- اجعل التنسيقات الخمسة متنوّرة تماماً في الألوان والأشكال والقَصّات — لا تكرّر نفس الألوان أو القطع.
- title: اسم جذّاب قصير. description: وصف سطر واحد. reason: شرح مفصّل لماذا يناسب المستخدم (الستايل/القوام/الموسم/المناسبة).
- ${LANG_INSTRUCTION[lang] || LANG_INSTRUCTION.en} عدا brand (بالإنجليزية كما تكتبه الماركة).
أرجع JSON بالبنية المطلوبة فقط.`;
}

function styleEnglish(style) {
  const map = {
    'كاجوال': 'casual everyday',
    'رسمي': 'formal business',
    'كلاسيكي': 'classic timeless',
    'عصري': 'modern contemporary',
    'مينيمال': 'minimalist clean',
    'فاخر': 'luxury high-end',
    'ستريت': 'streetwear urban',
    'هيب هوب': 'hip-hop oversized streetwear',
    'رياضي': 'sporty athletic performance',
    'بوهيمي': 'bohemian layered artistic',
    'فينتاج': 'vintage retro',
    'روك': 'rock edgy leather',
    'Y2K': 'Y2K late-90s early-2000s metallic',
    'أولد ماني': 'old-money quiet-luxury refined',
    'كوتيجكور': 'cottagecore romantic rural embroidered',
    'تك وير': 'techwear futuristic functional utility',
    'سكاندينافي': 'Scandinavian minimalist neutral',
    'راستا': 'rasta ethnic green-yellow-red',
    'أثلور': 'athleisure sporty-chic',
    'سمارث كاجوال': 'smart casual refined relaxed',
    'بزنس كاجوال': 'business casual office-elegant',
    'بوهيمي فاخر': 'boho-luxe rich eclectic',
    'رومانسي': 'romantic feminine soft flowing',
    'كاند حول': 'kawaii cute pastel playful',
    'جلام': 'glam glossy satin evening',
    'ديسكو': '70s disco shimmer wide-leg',
    'محجبة': 'modest hijabi'
  };
  return map[style] || 'fashionable stylish';
}

function occasionEnglish(occasion) {
  const map = {
    'يومي': 'everyday casual outing',
    'عمل': 'a professional work setting',
    'مناسبة اجتماعية': 'a social gathering',
    'موعد': 'a romantic date',
    'سفر': 'travel'
  };
  return map[occasion] || 'the occasion';
}

function seasonEnglish(season) {
  const map = { 'ربيع': 'spring', 'صيف': 'summer', 'خريف': 'autumn', 'شتاء': 'winter' };
  return map[season] || season;
}

function buildImagePrompt(outfit, order) {
  const isMale = order.gender === 'ذكر';
  const genderWord = isMale ? 'male' : 'female';
  const adj = isMale ? 'handsome' : 'beautiful';
  const body = bodyDescriptor(order);
  const skin = skinToneWord(order.skin_tone);
  const items = (outfit.products || [])
    .map((p) => [p.color, p.brand, p.product_name].filter(Boolean).join(' '))
    .join(', ');
  const hijabi = order.style === 'محجبة';
  const styleWord = styleEnglish(order.style);
  const occWord = occasionEnglish(order.occasion);
  const seasonWord = seasonEnglish(order.season);
  const headClause = hijabi
    ? '. The model wears a matching hijab headscarf that fully covers the hair and neck, a long-sleeve loose tunic or oversized top, and a long flowing maxi skirt or wide-leg trousers'
    : '';
  const genderClause = isMale
    ? '. Clearly depict a masculine man with short masculine hairstyle, masculine facial features, flat chest and male body proportions, wearing menswear only — not a woman, no feminine features'
    : '. Clearly depict a feminine woman with feminine hairstyle and female body proportions, wearing womenswear';
  return `Full-body editorial fashion lookbook photograph of a ${adj} ${body} ${genderWord} fashion model${skin ? ' with ' + skin : ''} wearing a complete ${styleWord} outfit, styled for ${occWord} during ${seasonWord}${headClause}${genderClause}. The carefully curated look consists of: ${items}. Tailoring and silhouette flatter this exact ${genderWord} body type and proportions, colors harmonize beautifully. The model stands in a full-length vertical framing shot from head to feet so the entire outfit — including the shoes/footwear — is fully visible, sharp and clearly detailed at the bottom of the frame. Emphasize the footwear clearly: show the complete shoes in full detail, well-lit, not cropped or cut off. Vogue magazine aesthetic, professional studio lighting with soft beautiful shadows and gentle rim light, clean seamless warm ivory studio backdrop, ultra-photorealistic, high-resolution, sharp focus, full outfit visible head-to-toe, natural confident graceful elegant pose with feet slightly apart to reveal the shoes, refined cinematic color grading, depth of field, 8k detail, photoreal skin texture, no text, no watermark.`;
}

function buildFlatLayPrompt(outfit, order) {
  const items = (outfit.products || [])
    .map((p) => [p.color, p.brand, p.product_name].filter(Boolean).join('، '))
    .join('، ');
  const flatStyleWord = styleEnglish(order.style);
  const hijabGarment = order.style === 'محجبة' ? ', a neatly folded hijab headscarf' : '';
  return `Top-down editorial flat-lay photograph of a complete ${flatStyleWord} outfit neatly arranged on a clean warm beige marble surface, no person, garments and shoes laid out flat with elegant spacing and refined styling: ${items}${hijabGarment}. The shoes/footwear are placed fully visible and clearly detailed at the bottom of the frame, nothing covering or overlapping them. Soft even natural overhead lighting, styled editorial flat-lay composition, high-fashion catalog aesthetic, ultra-photorealistic, bird's-eye top-down view, subtle tasteful props like sunglasses, a folded silk scarf or a magazine corner, refined cinematic color grading, 8k detail, no text, no model.`;
}

const CATALOG_SCHEMA = {
  type: 'object',
  properties: {
    outfits: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          reason: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                role: { type: 'string', enum: ['top', 'bottom', 'shoes', 'accessory'] }
              },
              required: ['id', 'role']
            }
          }
        },
        required: ['title', 'description', 'reason', 'items']
      }
    }
  },
  required: ['outfits']
};

const CREATIVE_SCHEMA = {
  type: 'object',
  properties: {
    outfits: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          reason: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                role: { type: 'string', enum: ['top', 'bottom', 'shoes', 'accessory'] },
                brand: { type: 'string' },
                product_name: { type: 'string' },
                category: { type: 'string' },
                color: { type: 'string' }
              },
              required: ['role', 'brand', 'product_name', 'category']
            }
          }
        },
        required: ['title', 'description', 'reason', 'items']
      }
    }
  },
  required: ['outfits']
};

const orderSummary = (order) => ({
  gender: order.gender,
  season: order.season,
  style: order.style,
  occasion: order.occasion,
  height: order.height,
  weight: order.weight,
  skin_tone: order.skin_tone
});

// مهلة لكل صورة حتى لا يحجب توليد صورة واحدة كل العملية
const withImageTimeout = (p, ms) => Promise.race([p, new Promise((res) => setTimeout(() => res(null), ms))]);

// توليد صور الإطلالات (على الموديل + مسطحة) بالتوازي مع مهلة لكل صورة
async function generateOutfitImages(base44, outfitsList, order) {
  const results = await Promise.all(outfitsList.map((o) =>
    Promise.all([
      withImageTimeout(
        base44.asServiceRole.integrations.Core.GenerateImage({ prompt: buildImagePrompt(o, order) })
          .then((r) => r && r.url).catch(() => null),
        45000
      ),
      withImageTimeout(
        base44.asServiceRole.integrations.Core.GenerateImage({ prompt: buildFlatLayPrompt(o, order) })
          .then((r) => r && r.url).catch(() => null),
        45000
      )
    ])
  ));
  outfitsList.forEach((o, i) => {
    if (results[i][0]) o.image_url = results[i][0];
    if (results[i][1]) o.flat_image_url = results[i][1];
  });
}

export default async function(req) {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);
    const lang = body.lang || 'ar';

    if (!body.order_id) {
      return Response.json({ error: 'معرف الطلب مطلوب' }, { status: 400 });
    }

    // التحقق من ملكية الطلب لمنع الوصول غير المصرّح به (IDOR)
    let me;
    try {
      me = await base44.auth.me();
    } catch (e) {
      return Response.json({ error: 'Unauthorized', code: 'auth_required' }, { status: 401 });
    }
    if (!me) return Response.json({ error: 'Unauthorized', code: 'auth_required' }, { status: 401 });

    const order = await base44.asServiceRole.entities.StylingOrder.get(body.order_id);
    if (!order) return Response.json({ error: 'الطلب غير موجود' }, { status: 404 });

    if (order.created_by_id !== me.id) {
      return Response.json({ error: 'غير مصرّف بالوصول إلى هذا الطلب' }, { status: 403 });
    }

    // إعادة تنسيقات موجودة عند إعادة الزيارة؛ إن كانت بلا صور (بسبب انقطاع سابق) نولّد الصور الناقصة
    if (order.outfits && order.outfits.length >= 5) {
      const missing = order.outfits.filter((o) => !o.image_url);
      if (missing.length) {
        try {
          await generateOutfitImages(base44, missing, order);
          await base44.asServiceRole.entities.StylingOrder.update(order.id, { outfits: order.outfits });
        } catch (e) {
          console.error('cached image fill failed:', e.message);
        }
      }
      return Response.json({ order_id: order.id, outfits: order.outfits, order: orderSummary(order) });
    }

    // التحقق من دفع هذا الطلب قبل التوليد
    if (order.payment_status !== 'paid') {
      return Response.json({ error: 'يجب إتمام الدفع أولاً للحصول على الإطلالات.', code: 'payment_required' }, { status: 402 });
    }

    // الكريديت يُخصم عند create-order / unlock-generation. هنا نتحقق فقط
    // للطلبات القديمة التي دُفعت قبل الخصم المبكر ولم تُعلَّم credit_spent.
    if (!order.credit_spent) {
      const meCredits = Number(me.credits) || 0;
      if (meCredits <= 0) {
        return Response.json({ error: 'لا تملك رصيد كريديت كافٍ.', code: 'no_credits' }, { status: 402 });
      }
    }

    // جلب كتالوج المنتجات الحقيقية المتاحة (إن وُجد)
    let products = [];
    try {
      products = await base44.asServiceRole.entities.Product.filter(
        { gender: { $in: [order.gender, 'unisex'] }, availability_status: { $in: ['in_stock', 'low_stock'] } },
        '-created_date',
        300
      );
    } catch (e) {
      console.error('catalog fetch failed:', e.message);
    }

    const relevance = (p) => {
      let s = 0;
      if (p.style && order.style && p.style === order.style) s += 4;
      if (p.occasion && order.occasion && p.occasion === order.occasion) s += 2;
      if (p.season && (p.season === order.season || p.season === 'all')) s += 1;
      return s;
    };
    const sorted = [...products].sort((a, b) => relevance(b) - relevance(a));
    const byId = new Map(products.map((p) => [p.id, p]));

    const hasCatalog = products.length >= 5;

    const mkCatalogItem = (p, role) => ({
      role,
      product_id: p.product_id,
      brand: p.brand,
      product_name: p.product_name,
      category: p.category,
      subcategory: p.subcategory,
      gender: p.gender,
      color: p.color,
      season: p.season,
      occasion: p.occasion,
      style: p.style,
      price: p.price,
      currency: p.currency,
      image_url: p.image_url,
      product_url: p.product_url,
      availability_status: p.availability_status,
      real: true
    });

    const FALLBACK_TEMPLATES = {
      ar: (st, n, t, b, s, occ, sea) => ({ title: `تنسيق ${st} ${n}`, description: `${t} مع ${b} و${s}.`, reason: `تنسيق مختار من الكتالوج يناسب ستايل ${st} ومناسبة ${occ} وموسم ${sea}.` }),
      en: (st, n, t, b, s, occ, sea) => ({ title: `${st} Outfit ${n}`, description: `${t} with ${b} and ${s}.`, reason: `A catalog look suited for ${st} style, ${occ} occasion, and ${sea} season.` }),
    };
    function fallbackOutfit(ord, idx, tp, bp, sp, lang) {
      const st = lang === 'ar' ? ord.style : styleEnglish(ord.style);
      const occ = lang === 'ar' ? ord.occasion : occasionEnglish(ord.occasion);
      const sea = lang === 'ar' ? ord.season : seasonEnglish(ord.season);
      const tpl = FALLBACK_TEMPLATES[lang] || FALLBACK_TEMPLATES.en;
      return { ...tpl(st, idx, tp.product_name, bp.product_name, sp.product_name, occ, sea), products: [mkCatalogItem(tp, 'top'), mkCatalogItem(bp, 'bottom'), mkCatalogItem(sp, 'shoes')] };
    }

    // تعبئة إبداعية برمجية للوصول إلى ٥ إطلالات عندما لا يكفي output النموذج (بدون كتالوج)
    const CREATIVE_PALETTE = {
      male: {
        top: [['تيشيرت قطني بتفاصيل معمّقة','Premium heavyweight cotton t-shirt','COS'],['قميص أكسفورد بقصّة أنيقة','Tailored Oxford shirt','Ralph Lauren'],['بولو بياقة منسوجة','Knitted polo shirt','Lacoste'],['كارديجان صوف بقصّة عصرية','Modern fitted knit cardigan','Massimo Dutti'],['سترة تريكوت بلا أكمام','Sleeveless knit sweater','Ami Paris'],['قميص كتان بلمسة مفعّمة','Relaxed linen shirt','Studio Nicholson'],['توب هنلي بقصّة جذّابة','Fitted henley top','Levi\'s'],['جاكيت جينز بغسيل أنيق','Washed denim jacket','Calvin Klein'],['قميص قطني بتصميم معمّق','Refined cotton shirt','Paul Smith'],['تيشيرت بياقة عالية','Mock-neck knit top','A.P.C.']],
        bottom: [['بنطال تشينو بقصّة مستقيمة أنيقة','Tailored straight chino trousers','Massimo Dutti'],['بنطال صوف بقصّة أنيقة','Tailored wool trousers','The Row'],['جينز بقصّة مستقيمة مفعّمة','Relaxed straight-leg jeans',"Levi's"],['بنطال كارغو بقصّة عصرية','Modern tapered cargo trousers','Carhartt WIP'],['بنطال كتان بقصّة جذّابة','Relaxed linen trousers','Uniqlo'],['بنطال بقصّة كلاسيكية مودرن','Modern pleated trousers','COS']],
        shoes: [['سنيكرز جلدي أنيق','Minimal premium leather sneakers','Common Projects'],['موكاسين جلد سويدي راقٍ','Suede penny loafers','G.H. Bass'],['سنيكرز ريترو عصري','Retro runner sneakers','New Balance'],['حذاء ديربي جلدي أنيق','Polished leather derby shoes','Hugo Boss'],['سنيكرز كلاسيكي بلمسة عصرية','Classic low-top sneakers','Veja'],['بوت جلدي تشوكا أنيق','Sleek leather chukka boots','Clarks'],['صندل جلدي راقٍ','Leather slide sandals','Birkenstock']]
      },
      female: {
        top: [['بلوزة حرير','Silk-blend blouse','Massimo Dutti'],['توب تريكوت قطني','Cotton knit top','COS'],['كارديجان قصير','Cropped cardigan','Zara'],['بليزر بقَصّة أنيقة','Tailored blazer','Mango'],['قميص كتان','Linen shirt','Uniqlo'],['توب ساتان','Satin camisole','Reiss'],['بلوزة بأكمام منفوشة','Puff-sleeve blouse','Mango'],['سترة صوف ناعمة','Soft wool sweater','COS']],
        bottom: [['تنورة ميدي بليسيه','Pleated midi skirt','COS'],['بنطال ويد ليج','Wide-leg trousers','Massimo Dutti'],['جينز قَصّة مستقيمة','Straight-leg jeans',"Levi's"],['تنورة كاش','A-line skirt','Zara'],['بنطال جينز عالي الخصر','High-waist jeans',"Levi's"],['تنورة قصرة','Midi tube skirt','Reiss']],
        shoes: [['كعب مدبّب','Pointed-toe heels','Steve Madden'],['بوت جلدي فوق الكاحل','Leather ankle boots','Massimo Dutti'],['سنيكرز بسيط','Minimal sneakers','Adidas'],['شوز مسطّح','Slingback flats','Clarks'],['صندل بكعب','Block-heel sandals','Mango'],['سنيكرز بمنصات','Platform sneakers','New Balance']]
      },
      modest: {
        top: [['تونيك بأكمام طويلة','Long-sleeve tunic top','Uniqlo'],['قميص كتان فضفاض','Loose linen shirt','COS'],['كارديجان طويل','Long cardigan','Zara'],['توب تريكوت بأكمام طويلة','Long-sleeve knit top','Mango'],['بليزر طويل','Longline blazer','Massimo Dutti'],['عباية عصرية','Modern abaya','Net-a-Porter'],['تونيك مطرّز','Embroidered tunic','Mango']],
        bottom: [['تنورة ماكسي','Maxi skirt','Uniqlo'],['بنطال ويد ليج','Wide-leg trousers','COS'],['تنورة ماكسي بليسيه','Pleated maxi skirt','Mango'],['بنطال فضفاض انسيابي','Flowy wide trousers','Zara'],['بنطال كتان واسع','Wide linen trousers','Massimo Dutti'],['تنورة بطبقات','Tiered maxi skirt','Zara']],
        shoes: [['موكاسين جلدي','Leather loafers','Clarks'],['سنيكرز بسيط','Minimal sneakers','Adidas'],['شوز مسطّح مدبّب','Pointed flats','Mango'],['بوت جلدي انسيابي','Sleek leather boots','Massimo Dutti'],['صندل مسطّح','Flat sandals','Clarks']]
      }
    };
    const CREATIVE_COLORS = {
      ar: ['كحلي','أبيض','بيج','زيتي','فحمي','خمري','رمادي','أسود','جملي','وردي ناعم'],
      en: ['navy','white','beige','olive','charcoal','burgundy','grey','black','camel','soft pink']
    };
    function creativeFillOutfit(ord, idx, lang, seed) {
      const modest = ord.style === 'محجبة';
      const key = modest ? 'modest' : (ord.gender === 'ذكر' ? 'male' : 'female');
      const pal = CREATIVE_PALETTE[key];
      const colors = CREATIVE_COLORS[lang] || CREATIVE_COLORS.en;
      const color = colors[seed % colors.length];
      const pick = (arr, off) => arr[(seed + off) % arr.length];
      const t = pick(pal.top, 0);
      const b = pick(pal.bottom, 1);
      const s = pick(pal.shoes, 2);
      const name = (it) => lang === 'ar' ? it[0] : it[1];
      const mk = (it, role) => ({ role, brand: it[2], product_name: name(it), category: role, color, style: ord.style, real: false });
      const items = [mk(t, 'top'), mk(b, 'bottom'), mk(s, 'shoes')];
      if (modest) items.push({ role: 'accessory', brand: 'Zara', product_name: lang === 'ar' ? 'حجاب متناسق' : 'Hijab headscarf', category: 'accessory', color, style: ord.style, real: false });
      const st = lang === 'ar' ? ord.style : styleEnglish(ord.style);
      const occ = lang === 'ar' ? ord.occasion : occasionEnglish(ord.occasion);
      const sea = lang === 'ar' ? ord.season : seasonEnglish(ord.season);
      const tpl = FALLBACK_TEMPLATES[lang] || FALLBACK_TEMPLATES.en;
      return { ...tpl(st, idx, name(t), name(b), name(s), occ, sea), products: items };
    }

    const materializeCatalog = (ro) => {
      if (!ro || !Array.isArray(ro.items)) return null;
      const items = ro.items
        .map((it) => {
          const p = byId.get(it.id);
          if (!p) return null;
          return mkCatalogItem(p, it.role);
        })
        .filter(Boolean);
      const hasCore =
        items.some((i) => i.role === 'top') &&
        items.some((i) => i.role === 'bottom') &&
        items.some((i) => i.role === 'shoes');
      if (!hasCore) return null;
      return { title: ro.title, description: ro.description, reason: ro.reason, products: items };
    };

    const materializeCreative = (ro) => {
      if (!ro || !Array.isArray(ro.items)) return null;
      const roleCat = (r) => (r === 'top' ? 'top' : r === 'bottom' ? 'bottom' : r === 'shoes' ? 'shoes' : 'accessory');
      const items = ro.items
        .map((it) => ({
          role: it.role,
          brand: it.brand || '',
          product_name: it.product_name || '',
          category: it.category || roleCat(it.role),
          color: it.color || '',
          style: order.style,
          real: false
        }))
        .filter((it) => it.role);
      const hasCore =
        items.some((i) => i.role === 'top') &&
        items.some((i) => i.role === 'bottom') &&
        items.some((i) => i.role === 'shoes');
      if (!hasCore) return null;
      return { title: ro.title, description: ro.description, reason: ro.reason, products: items };
    };

    const outfits = [];
    const usedKeys = new Set();
    const keyOf = (o) => (o.products || []).map((p) => p.real ? p.product_id : (p.brand + p.product_name)).sort().join('|');

    const pushValid = (rawList, materialize) => {
      for (const ro of rawList) {
        if (outfits.length >= 5) break;
        const o = materialize(ro);
        if (!o) continue;
        const key = keyOf(o);
        if (usedKeys.has(key)) continue;
        usedKeys.add(key);
        outfits.push(o);
      }
    };

    // 1) وضع الكتالوج: إن توفرت منتجات كافية، نختار منها أولاً
    if (hasCatalog) {
      const catalog = sorted.map((p) => ({
        id: p.id,
        brand: p.brand,
        product_name: p.product_name,
        category: p.category,
        subcategory: p.subcategory,
        gender: p.gender,
        color: p.color,
        season: p.season,
        occasion: p.occasion,
        style: p.style,
        price: p.price,
        currency: p.currency,
        availability_status: p.availability_status,
        _match: relevance(p)
      }));

      try {
        const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: buildCatalogPrompt(order, catalog, lang),
          response_json_schema: CATALOG_SCHEMA
        });
        pushValid((llmRes && Array.isArray(llmRes.outfits)) ? llmRes.outfits : [], materializeCatalog);
      } catch (e) {
        console.error('catalog LLM failed:', e.message);
      }

      // محاولة إضافية للكتالوج
      if (outfits.length < 5) {
        const need = 5 - outfits.length;
        try {
          const retryRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: buildCatalogPrompt(order, catalog, lang) + `\n\nملاحظة: أنتج ${need} تنسيق إضافي مختلف تماماً (ألوان وقَصّات أخرى) من نفس الكتالوج، بنفس البنية. أعد فقط ${need} تنسيقات في outfits.`,
            response_json_schema: CATALOG_SCHEMA
          });
          pushValid((retryRes && Array.isArray(retryRes.outfits)) ? retryRes.outfits : [], materializeCatalog);
        } catch (e) {
          console.error('catalog retry failed:', e.message);
        }
      }

      // تعبئة برمجية من الكتالوج إن بقى نقص
      if (outfits.length < 5) {
        const tops = sorted.filter((p) => p.category === 'top');
        const bottoms = sorted.filter((p) => p.category === 'bottom');
        const shoes = sorted.filter((p) => p.category === 'shoes');
        let ti = 0, bi = 0, si = 0, attempts = 0;
        while (outfits.length < 5 && tops.length && bottoms.length && shoes.length && attempts < 60) {
          attempts++;
          const t = tops[ti % tops.length];
          const b = bottoms[bi % bottoms.length];
          const s = shoes[si % shoes.length];
          ti++; bi++; si++;
          const key = [t.id, b.id, s.id].sort().join('|');
          if (usedKeys.has(key)) continue;
          usedKeys.add(key);
          outfits.push(fallbackOutfit(order, outfits.length + 1, t, b, s, lang));
        }
      }
    }

    // 2) الوضع الإبداعي: إن لم يكفِ الكتالوج، نولّد اقتراحات مع ماركات عالمية
    if (outfits.length < 5) {
      try {
        const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: buildCreativePrompt(order, lang),
          response_json_schema: CREATIVE_SCHEMA
        });
        pushValid((llmRes && Array.isArray(llmRes.outfits)) ? llmRes.outfits : [], materializeCreative);
      } catch (e) {
        console.error('creative LLM failed:', e.message);
      }

      if (outfits.length < 5) {
        const need = 5 - outfits.length;
        try {
          const retryRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: buildCreativePrompt(order, lang) + `\n\nملاحظة: أنتج ${need} تنسيق إضافي مختلف تماماً (ألوان وقَصّات أخرى)، بنفس البنية. أعد فقط ${need} تنسيقات في outfits.`,
            response_json_schema: CREATIVE_SCHEMA
          });
          pushValid((retryRes && Array.isArray(retryRes.outfits)) ? retryRes.outfits : [], materializeCreative);
        } catch (e) {
          console.error('creative retry failed:', e.message);
        }
      }

      // تعبئة إبداعية برمجية للوصول إلى ٥ إطلالات دائماً
      if (outfits.length < 5) {
        let seed = 0;
        while (outfits.length < 5 && seed < 80) {
          seed++;
          const o = creativeFillOutfit(order, outfits.length + 1, lang, seed);
          const key = keyOf(o);
          if (usedKeys.has(key)) continue;
          usedKeys.add(key);
          outfits.push(o);
        }
      }
    }

    if (outfits.length < 5) {
      // نظام الدفع مُلغى — يبقى الطلب مفعّلاً ليتمكن المستخدم من إعادة المحاولة مباشرة
      return Response.json({
        error: 'لم نتمكن من توليد ٥ تنسيقات كاملة. يمكنك المحاولة مجدداً.',
        code: 'generation_failed'
      }, { status: 503 });
    }

    // حفظ الإطلالات النصية فوراً قبل توليد الصور لضمان بقاءها عند أي انقطاع/مهلة
    try {
      await base44.asServiceRole.entities.StylingOrder.update(order.id, { outfits });
    } catch (e) {
      console.error('persist text outfits failed:', e.message);
    }

    // توليد صور كل إطلالة بالتوازي مع مهلة لكل صورة
    try {
      await generateOutfitImages(base44, outfits, order);
    } catch (e) {
      console.error('outfit image generation failed:', e.message);
    }

    // حفظ الصور إن أمكن، لكن نرجع الإطلالات للمستخدم حتى لو فشل التحديث النهائي
    try {
      await base44.asServiceRole.entities.StylingOrder.update(order.id, { outfits });
    } catch (e) {
      console.error('final outfits persist failed:', e.message);
    }

    // خصم كريديت للطلبات القديمة فقط (قبل خصم create-order). الطلبات الجديدة
    // عليها credit_spent=true فلا تُخصم مرة ثانية.
    if (!order.credit_spent) {
      try {
        const fresh = await base44.asServiceRole.entities.User.get(me.id);
        const current = Number(fresh?.credits) || 0;
        const afterCredits = Math.max(0, current - 1);
        await base44.asServiceRole.entities.User.update(me.id, { credits: afterCredits });
        await base44.asServiceRole.entities.StylingOrder.update(order.id, { credit_spent: true });
      } catch (e) {
        console.error('credit decrement failed:', e.message);
      }
    }

    return Response.json({ order_id: order.id, outfits, order: orderSummary(order) });
  } catch (error) {
    console.error('generate-outfits error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}