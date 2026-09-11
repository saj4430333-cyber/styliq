/** إطلالات متناسقة عالية الجودة — نسخ متعددة لكل ستايل، الاختيار حسب بيانات الطلب. */

const STYLE_EN = {
  كاجوال: 'Casual', رسمي: 'Formal', كلاسيكي: 'Classic', عصري: 'Contemporary',
  مينيمال: 'Minimal', ستريت: 'Streetwear', 'أولد ماني': 'Old Money',
  بوهيمي: 'Bohemian', رياضي: 'Athleisure', أنيق: 'Smart', محجبة: 'Modest',
  سكاندينافي: 'Scandinavian', ياباني: 'Japanese', عمل: 'Work',
};

const OCC_EN = {
  يومي: 'everyday', عمل: 'work', 'مناسبة اجتماعية': 'social event', موعد: 'date', سفر: 'travel',
};

const SEA_EN = { ربيع: 'spring', صيف: 'summer', خريف: 'autumn', شتاء: 'winter' };

const SKIN_EN = {
  أبيض: 'very fair porcelain skin with soft pink undertone',
  فاتح: 'fair light skin with warm undertone',
  حنطي: 'olive medium skin with golden undertone',
  أسمر: 'warm brown skin with rich undertone',
  غامق: 'deep dark brown skin with luminous undertone',
};

/** كل مجموعة متماسكة stylistically — لا خلط عشوائي بين ستايلات */
const LOOKS = {
  male: {
    رسمي: [
      {
        top: ['قميص أبيض بقصّة دقيقة', 'crisp white tailored dress shirt', 'Ralph Lauren'],
        bottom: ['بنطال صوف كحلي مستقيم', 'navy wool straight dress trousers', 'Hugo Boss'],
        shoes: ['حذاء أكسفورد أسود لامع', 'polished black Oxford shoes', 'Clarks'],
        colors: { top: 'white', bottom: 'navy', shoes: 'black' },
      },
      {
        top: ['قميص أزرق فاتح بياقة كلاسيكية', 'light blue classic collar dress shirt', 'Brooks Brothers'],
        bottom: ['بنطال صوف فحمي أنيق', 'charcoal wool tailored trousers', 'Theory'],
        shoes: ['حذاء ديربي بني غامق', 'dark brown leather derby shoes', 'Allen Edmonds'],
        colors: { top: 'light blue', bottom: 'charcoal', shoes: 'dark brown' },
      },
    ],
    عمل: [
      {
        top: ['قميص أكسفورد أزرق فاتح', 'light blue Oxford shirt', 'Brooks Brothers'],
        bottom: ['بنطال تشينو بيج أنيق', 'tailored beige chino trousers', 'Massimo Dutti'],
        shoes: ['موكاسين جلد بني', 'brown leather loafers', 'G.H. Bass'],
        colors: { top: 'light blue', bottom: 'beige', shoes: 'brown' },
      },
      {
        top: ['بولو كحلي ناعم', 'soft navy knit polo', 'Lacoste'],
        bottom: ['بنطال رمادي مستقيم', 'straight grey dress chinos', 'COS'],
        shoes: ['سنيكرز جلدي أبيض نظيف', 'clean white leather sneakers', 'Common Projects'],
        colors: { top: 'navy', bottom: 'grey', shoes: 'white' },
      },
    ],
    كاجوال: [
      {
        top: ['تيشيرت قطني أبيض ثقيل', 'heavyweight white cotton tee', 'COS'],
        bottom: ['جينز مستقيم أزرق داكن', 'dark indigo straight-leg jeans', "Levi's"],
        shoes: ['سنيكرز جلدي أبيض بسيط', 'minimal white leather sneakers', 'Common Projects'],
        colors: { top: 'white', bottom: 'dark indigo', shoes: 'white' },
      },
      {
        top: ['قميص كتان بيج مفتوح', 'relaxed beige linen shirt', 'Uniqlo'],
        bottom: ['بنطال تشينو زيتي', 'olive chino trousers', 'Massimo Dutti'],
        shoes: ['سنيكرز كريمي بسيط', 'cream low-top sneakers', 'Veja'],
        colors: { top: 'beige', bottom: 'olive', shoes: 'cream' },
      },
      {
        top: ['تيشيرت رمادي بقصّة نظيفة', 'clean grey cotton tee', 'A.P.C.'],
        bottom: ['جينز أسود مستقيم', 'black straight jeans', "Levi's"],
        shoes: ['سنيكرز أسود بسيط', 'minimal black sneakers', 'Common Projects'],
        colors: { top: 'heather grey', bottom: 'black', shoes: 'black' },
      },
    ],
    'أولد ماني': [
      {
        top: ['بولو كشمير كريمي', 'cream cashmere polo', 'Loro Piana'],
        bottom: ['بنطال كتان بيج واسع قليلاً', 'relaxed beige linen trousers', 'Brunello Cucinelli'],
        shoes: ['موكاسين سويدي بني', 'brown suede penny loafers', 'G.H. Bass'],
        colors: { top: 'cream', bottom: 'beige', shoes: 'brown suede' },
      },
      {
        top: ['قميص كتان أبيض فاخر', 'luxury white linen shirt', 'Brunello Cucinelli'],
        bottom: ['بنطال صوف رمادي فاتح', 'light grey wool trousers', 'The Row'],
        shoes: ['موكاسين جلد كحلي', 'navy leather loafers', 'Tod\'s'],
        colors: { top: 'white', bottom: 'light grey', shoes: 'navy' },
      },
    ],
    سكاندينافي: [
      {
        top: ['قميص كتان رمادي فاتح', 'light grey linen shirt', 'COS'],
        bottom: ['بنطال صوف رمادي مستقيم', 'straight grey wool trousers', 'Arket'],
        shoes: ['سنيكرز جلدي أبيض نظيف', 'clean white leather sneakers', 'Veja'],
        colors: { top: 'light grey', bottom: 'mid grey', shoes: 'white' },
      },
    ],
    مينيمال: [
      {
        top: ['تيشيرت أسود بقصّة مستقيمة', 'straight black cotton tee', 'A.P.C.'],
        bottom: ['بنطال أسود مستقيم', 'straight black trousers', 'COS'],
        shoes: ['سنيكرز أسود بسيط', 'minimal black sneakers', 'Common Projects'],
        colors: { top: 'black', bottom: 'black', shoes: 'black' },
      },
      {
        top: ['تيشيرت أبيض نظيف', 'clean white cotton tee', 'COS'],
        bottom: ['بنطال بيج مستقيم', 'straight beige trousers', 'Arket'],
        shoes: ['سنيكرز أبيض بسيط', 'minimal white sneakers', 'Veja'],
        colors: { top: 'white', bottom: 'beige', shoes: 'white' },
      },
    ],
    رياضي: [
      {
        top: ['هودي رمادي خفيف فاخر', 'premium lightweight grey hoodie', 'Nike'],
        bottom: ['بنطال رياضي أسود أنيق', 'sleek black tapered joggers', 'Adidas'],
        shoes: ['سنيكرز أبيض عصري', 'modern white sneakers', 'New Balance'],
        colors: { top: 'heather grey', bottom: 'black', shoes: 'white' },
      },
    ],
    ستريت: [
      {
        top: ['هودي أسود أوفرسايز أنيق', 'refined oversized black hoodie', 'Stussy'],
        bottom: ['جينز واسع داكن', 'baggy dark wash jeans', "Levi's"],
        shoes: ['سنيكرز ريترو أبيض', 'white retro sneakers', 'New Balance'],
        colors: { top: 'black', bottom: 'dark denim', shoes: 'white' },
      },
    ],
    عصري: [
      {
        top: ['بليزر كحلي فوق تيشيرت أبيض', 'navy blazer over white tee', 'Theory'],
        bottom: ['بنطال أسود مستقيم مودرن', 'modern straight black trousers', 'COS'],
        shoes: ['سنيكرز جلدي أبيض', 'white leather sneakers', 'Common Projects'],
        colors: { top: 'navy and white', bottom: 'black', shoes: 'white' },
      },
    ],
    كلاسيكي: [
      {
        top: ['قميص قطني أبيض كلاسيكي', 'classic white cotton shirt', 'Ralph Lauren'],
        bottom: ['بنطال كحلي كلاسيكي', 'classic navy trousers', 'Brooks Brothers'],
        shoes: ['حذاء جلد بني كلاسيكي', 'classic brown leather shoes', 'Clarks'],
        colors: { top: 'white', bottom: 'navy', shoes: 'brown' },
      },
    ],
    default: [
      {
        top: ['قميص كتان بقصّة مريحة', 'relaxed linen shirt', 'Uniqlo'],
        bottom: ['بنطال تشينو مستقيم', 'straight chino trousers', 'Massimo Dutti'],
        shoes: ['سنيكرز جلدي بسيط', 'simple leather sneakers', 'Veja'],
        colors: { top: 'sand', bottom: 'khaki', shoes: 'white' },
      },
    ],
  },
  female: {
    رسمي: [
      {
        top: ['بلوزة حرير بيضاء', 'white silk blouse', 'Massimo Dutti'],
        bottom: ['تنورة ميدي سوداء بليسيه', 'black pleated midi skirt', 'COS'],
        shoes: ['كعب مدبب أسود', 'black pointed-toe heels', 'Steve Madden'],
        colors: { top: 'white', bottom: 'black', shoes: 'black' },
      },
    ],
    عمل: [
      {
        top: ['بليزر بيج بقصّة أنيقة', 'tailored beige blazer', 'Mango'],
        bottom: ['بنطال واسع أسود', 'black wide-leg trousers', 'Massimo Dutti'],
        shoes: ['فلات مدبب أسود', 'black pointed flats', 'Clarks'],
        colors: { top: 'beige', bottom: 'black', shoes: 'black' },
      },
      {
        top: ['بلوزة كحلي أنيقة', 'elegant navy blouse', 'COS'],
        bottom: ['بنطال رمادي واسع', 'grey wide-leg trousers', 'Arket'],
        shoes: ['كعب بيج أنيق', 'beige block heels', 'Mango'],
        colors: { top: 'navy', bottom: 'grey', shoes: 'beige' },
      },
    ],
    كاجوال: [
      {
        top: ['توب تريكوت أبيض', 'white knit top', 'COS'],
        bottom: ['جينز مستقيم أزرق متوسط', 'medium-wash straight jeans', "Levi's"],
        shoes: ['سنيكرز أبيض بسيط', 'minimal white sneakers', 'Adidas'],
        colors: { top: 'white', bottom: 'medium denim', shoes: 'white' },
      },
      {
        top: ['بلوزة كتان بيج', 'beige linen blouse', 'Uniqlo'],
        bottom: ['بنطال واسع أبيض كريمي', 'cream wide-leg trousers', 'Zara'],
        shoes: ['سنيكرز كريمي', 'cream sneakers', 'Veja'],
        colors: { top: 'beige', bottom: 'cream', shoes: 'cream' },
      },
    ],
    سكاندينافي: [
      {
        top: ['كارديجان صوف رمادي', 'grey wool cardigan', 'Arket'],
        bottom: ['بنطال كتان بيج واسع', 'wide beige linen trousers', 'COS'],
        shoes: ['بوت كاحل بني', 'brown ankle boots', 'Massimo Dutti'],
        colors: { top: 'grey', bottom: 'beige', shoes: 'brown' },
      },
    ],
    مينيمال: [
      {
        top: ['توب أسود بسيط', 'simple black top', 'COS'],
        bottom: ['بنطال أسود واسع', 'black wide trousers', 'Arket'],
        shoes: ['سنيكرز أبيض نظيف', 'clean white sneakers', 'Veja'],
        colors: { top: 'black', bottom: 'black', shoes: 'white' },
      },
    ],
    'أولد ماني': [
      {
        top: ['بلوزة كشمير كريمية', 'cream cashmere blouse', 'The Row'],
        bottom: ['تنورة ميدي بيج', 'beige midi skirt', 'Massimo Dutti'],
        shoes: ['موكاسين جلد بني', 'brown leather loafers', 'Tod\'s'],
        colors: { top: 'cream', bottom: 'beige', shoes: 'brown' },
      },
    ],
    عصري: [
      {
        top: ['بليزر أسود فوق توب أبيض', 'black blazer over white top', 'Mango'],
        bottom: ['بنطال واسع رمادي', 'grey wide-leg trousers', 'COS'],
        shoes: ['سنيكرز أبيض أنيق', 'chic white sneakers', 'Adidas'],
        colors: { top: 'black and white', bottom: 'grey', shoes: 'white' },
      },
    ],
    موعد: [
      {
        top: ['بلوزة ساتان وردي ناعم', 'soft pink satin blouse', 'Reiss'],
        bottom: ['تنورة ميدي سوداء', 'black midi skirt', 'Zara'],
        shoes: ['كعب أسود أنيق', 'elegant black heels', 'Steve Madden'],
        colors: { top: 'soft pink', bottom: 'black', shoes: 'black' },
      },
    ],
    default: [
      {
        top: ['بلوزة كتان فاتحة', 'light linen blouse', 'Uniqlo'],
        bottom: ['تنورة ميدي بيج', 'beige midi skirt', 'Zara'],
        shoes: ['سنيكرز بسيط', 'minimal sneakers', 'Adidas'],
        colors: { top: 'ivory', bottom: 'beige', shoes: 'white' },
      },
    ],
  },
  modest: {
    default: [
      {
        top: ['تونيك طويل بأكمام كاملة بيج', 'full-sleeve long beige tunic', 'Uniqlo'],
        bottom: ['تنورة ماكسي واسعة كحلي', 'flowing navy maxi skirt', 'COS'],
        shoes: ['موكاسين جلد مريح بني', 'comfortable brown leather loafers', 'Clarks'],
        accessory: ['حجاب متناسق بيج غير لامع', 'matte beige matching hijab', 'Zara'],
        colors: { top: 'beige', bottom: 'navy', shoes: 'brown', accessory: 'beige' },
      },
      {
        top: ['بليزر طويل رمادي فوق تونيك أبيض', 'longline grey blazer over white tunic', 'Massimo Dutti'],
        bottom: ['بنطال واسع أسود محتشم', 'modest black wide-leg trousers', 'COS'],
        shoes: ['فلات أسود أنيق', 'elegant black flats', 'Clarks'],
        accessory: ['حجاب رمادي أنيق', 'elegant grey hijab', 'Mango'],
        colors: { top: 'grey and white', bottom: 'black', shoes: 'black', accessory: 'grey' },
      },
    ],
  },
};

const SKIN_HINT = {
  أبيض: { ar: 'مع تباين ناعم', en: 'with soft contrast' },
  فاتح: { ar: 'بتناسق دافئ', en: 'in warm harmony' },
  حنطي: { ar: 'بألوان ترابية متزنة', en: 'with balanced earth tones' },
  أسمر: { ar: 'بألوان غنية واضحة', en: 'with rich clear tones' },
  غامق: { ar: 'بتباين أنيق ولامع', en: 'with elegant luminous contrast' },
};

export function orderSeed(order = {}) {
  const s = [
    order.id || order.order_id || '',
    order.gender || '',
    order.height || '',
    order.weight || '',
    order.skin_tone || '',
    order.season || '',
    order.style || '',
    order.occasion || '',
  ].join('|');
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

function bodyProfile(order) {
  const h = Number(order?.height) || 0;
  const w = Number(order?.weight) || 0;
  let heightWord = 'average height';
  let heightAr = 'متوسط الطول';
  if (h && h < 160) { heightWord = 'petite'; heightAr = 'قصير القامة نسبياً'; }
  else if (h >= 178) { heightWord = 'tall'; heightAr = 'طويل القامة'; }
  let buildWord = 'average build';
  let buildAr = 'بنية متوسطة';
  if (h && w) {
    const bmi = w / Math.pow(h / 100, 2);
    if (bmi < 18.5) { buildWord = 'slim build'; buildAr = 'بنية نحيفة'; }
    else if (bmi < 25) { buildWord = 'fit athletic build'; buildAr = 'بنية رياضية متناسقة'; }
    else if (bmi < 30) { buildWord = 'fuller build'; buildAr = 'بنية ممتلئة قليلاً'; }
    else { buildWord = 'plus-size build'; buildAr = 'بنية ممتلئة'; }
  }
  return { heightWord, heightAr, buildWord, buildAr, h, w };
}

function resolveLook(order) {
  const modest = order?.style === 'محجبة';
  const genderKey = modest ? 'modest' : order?.gender === 'ذكر' ? 'male' : 'female';
  const bucket = LOOKS[genderKey] || LOOKS.male;
  const variants =
    bucket[order?.style] ||
    bucket[order?.occasion] ||
    bucket.default ||
    LOOKS.male.default;
  const seed = orderSeed(order);
  return variants[seed % variants.length];
}

function mkProduct(item, role, color, style) {
  return {
    role,
    brand: item[2],
    product_name: item[0],
    product_name_en: item[1],
    category: role,
    color,
    style,
    real: false,
  };
}

export function buildFreeOutfits(order = {}, lang = 'ar') {
  const look = resolveLook(order);
  const body = bodyProfile(order);
  const skinHint = SKIN_HINT[order.skin_tone] || SKIN_HINT['حنطي'];
  const st = lang === 'ar' ? (order.style || 'أنيق') : (STYLE_EN[order.style] || order.style || 'Smart');
  const occ = lang === 'ar' ? (order.occasion || 'يومي') : (OCC_EN[order.occasion] || order.occasion || 'everyday');
  const sea = lang === 'ar' ? (order.season || 'ربيع') : (SEA_EN[order.season] || order.season || 'spring');

  const products = [
    mkProduct(look.top, 'top', look.colors.top, order.style),
    mkProduct(look.bottom, 'bottom', look.colors.bottom, order.style),
    mkProduct(look.shoes, 'shoes', look.colors.shoes, order.style),
  ];
  if (look.accessory) {
    products.push(mkProduct(look.accessory, 'accessory', look.colors.accessory || look.colors.top, order.style));
  }

  const name = (it) => (lang === 'ar' ? it[0] : it[1]);

  if (lang === 'ar') {
    return [{
      title: `إطلالتك ${st}`,
      description: `${name(look.top)} مع ${name(look.bottom)} و${name(look.shoes)} — تنسيق متناسق ${skinHint.ar}.`,
      reason: `مصمّمة خصيصاً لـ${body.heightAr} و${body.buildAr}` +
        (body.h ? ` (${body.h} سم` : '') +
        (body.w ? ` / ${body.w} كجم)` : body.h ? ')' : '') +
        `، ستايل ${st}، مناسبة ${occ}، موسم ${sea}. الألوان والقَصّات متوافقة مع لون بشرتك.`,
      products,
    }];
  }

  return [{
    title: `Your ${st} look`,
    description: `${name(look.top)} with ${name(look.bottom)} and ${name(look.shoes)} — a cohesive look ${skinHint.en}.`,
    reason: `Tailored for a ${body.heightWord}, ${body.buildWord}` +
      (body.h ? ` (${body.h} cm` : '') +
      (body.w ? ` / ${body.w} kg)` : body.h ? ')' : '') +
      `, ${st} style, ${occ} occasion, ${sea} season.`,
    products,
  }];
}

export function orderSummaryFrom(order) {
  if (!order) return null;
  return {
    gender: order.gender,
    season: order.season,
    style: order.style,
    occasion: order.occasion,
    height: order.height,
    weight: order.weight,
    skin_tone: order.skin_tone,
  };
}

/** وصف القطع للصور بالإنجليزية فقط — خلط العربي يخرّب جودة الصورة */
function englishGarments(outfit) {
  return (outfit?.products || [])
    .map((p) => {
      const name = p.product_name_en || p.product_name || '';
      // إذا الاسم عربي غالباً، استخدم brand + role + color
      const hasArabic = /[\u0600-\u06FF]/.test(name);
      const label = hasArabic
        ? `${p.color || ''} ${p.brand || ''} ${p.role || 'garment'}`.trim()
        : `${p.color || ''} ${p.brand || ''} ${name}`.trim();
      return label;
    })
    .filter(Boolean)
    .join('; ');
}

export function buildModelImagePrompt(outfit, order) {
  const isMale = order?.gender === 'ذكر';
  const genderWord = isMale ? 'man' : 'woman';
  const body = bodyProfile(order);
  const skin = SKIN_EN[order?.skin_tone] || 'natural healthy skin tone';
  const items = englishGarments(outfit);
  const styleWord = STYLE_EN[order?.style] || 'fashion';
  const occWord = OCC_EN[order?.occasion] || 'everyday';
  const seasonWord = SEA_EN[order?.season] || 'spring';
  const hijabi = order?.style === 'محجبة';

  const heightCm = body.h ? `${body.h}cm tall` : body.heightWord;
  const weightKg = body.w ? `${body.w}kg` : body.buildWord;

  const head = hijabi
    ? 'She wears a neatly styled matching hijab covering hair and neck, long sleeves, long modest silhouette, no skin exposure.'
    : isMale
      ? 'Short masculine haircut, masculine jawline, flat chest, clear male proportions, menswear only.'
      : 'Feminine hairstyle and proportions, womenswear only.';

  return [
    `Premium full-body fashion editorial photo of one ${genderWord}, ${skin}, ${heightCm}, ${weightKg}, ${body.buildWord}.`,
    `Wearing one cohesive ${styleWord} outfit for ${occWord} in ${seasonWord}.`,
    `Garments: ${items}.`,
    head,
    'Perfect fit and color harmony. Shoes fully visible. Head-to-toe framing.',
    'Vogue lookbook, soft studio lighting, warm ivory seamless backdrop, photorealistic 8k, sharp fabric texture.',
    'Single person only. No text, no watermark, no collage, no distorted anatomy.',
  ].join(' ');
}

export function buildFlatImagePrompt(outfit, order) {
  const items = englishGarments(outfit);
  const styleWord = STYLE_EN[order?.style] || 'fashion';
  const hijab = order?.style === 'محجبة' ? ' Include a neatly folded matching hijab.' : '';
  return `Editorial flat-lay of one complete ${styleWord} outfit on warm beige marble, no person: ${items}.${hijab} Soft overhead light, luxury catalog style, shoes fully visible, photorealistic, no text.`;
}

const FALLBACK_MALE = [
  'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=80',
];
const FALLBACK_FEMALE = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
];

export function fallbackOutfitImage(order, index = 0) {
  const list = order?.gender === 'ذكر' ? FALLBACK_MALE : FALLBACK_FEMALE;
  return list[index % list.length];
}
