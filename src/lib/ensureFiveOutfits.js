/** ضمان ٥ إطلالات على الواجهة لو السيرفر رجّع أقل */
const MALE = {
  tops: [
    ['تيشيرت قطني', 'COS'],
    ['قميص أكسفورد', 'Ralph Lauren'],
    ['بولو منسوج', 'Lacoste'],
    ['كارديجان صوف', 'Massimo Dutti'],
    ['قميص كتان', 'Uniqlo'],
  ],
  bottoms: [
    ['بنطال تشينو', 'Massimo Dutti'],
    ['جينز مستقيم', "Levi's"],
    ['بنطال صوف', 'COS'],
    ['بنطال كتان', 'Uniqlo'],
    ['كارغو عصري', 'Carhartt WIP'],
  ],
  shoes: [
    ['سنيكرز جلدي', 'Common Projects'],
    ['موكاسين سويدي', 'G.H. Bass'],
    ['سنيكرز ريترو', 'New Balance'],
    ['ديربي جلدي', 'Hugo Boss'],
    ['بوت تشوكا', 'Clarks'],
  ],
};

const FEMALE = {
  tops: [
    ['بلوزة حرير', 'Massimo Dutti'],
    ['توب تريكوت', 'COS'],
    ['بليزر أنيق', 'Mango'],
    ['قميص كتان', 'Uniqlo'],
    ['كارديجان', 'Zara'],
  ],
  bottoms: [
    ['تنورة ميدي', 'COS'],
    ['بنطال واسع', 'Massimo Dutti'],
    ['جينز مستقيم', "Levi's"],
    ['تنورة كاش', 'Zara'],
    ['بنطال كتان', 'Uniqlo'],
  ],
  shoes: [
    ['كعب مدبّب', 'Steve Madden'],
    ['بوت كاحل', 'Massimo Dutti'],
    ['سنيكرز', 'Adidas'],
    ['فلات', 'Clarks'],
    ['صندل', 'Mango'],
  ],
};

function pack(order, index) {
  const female = order?.gender === 'أنثى';
  const pal = female ? FEMALE : MALE;
  const i = Math.max(0, index);
  const [topName, topBrand] = pal.tops[i % pal.tops.length];
  const [bottomName, bottomBrand] = pal.bottoms[i % pal.bottoms.length];
  const [shoeName, shoeBrand] = pal.shoes[i % pal.shoes.length];
  const style = order?.style || 'كلاسيكي';
  return {
    title: `إطلالة ${style} ${i + 1}`,
    description: `تنسيق ${style} متناسق للمناسبة والموسم.`,
    reason: `اختير ليناسب ستايلك (${style}) ومقاسك.`,
    products: [
      { role: 'top', brand: topBrand, product_name: topName, category: 'top', color: '', style, real: false },
      { role: 'bottom', brand: bottomBrand, product_name: bottomName, category: 'bottom', color: '', style, real: false },
      { role: 'shoes', brand: shoeBrand, product_name: shoeName, category: 'shoes', color: '', style, real: false },
    ],
  };
}

/** يكمّل المصفوفة إلى ٥ إطلالات بدون حذف الموجود */
export function ensureFiveOutfits(outfits, order) {
  const list = Array.isArray(outfits) ? outfits.filter(Boolean).map((o) => ({ ...o })) : [];
  while (list.length < 5) {
    list.push(pack(order || {}, list.length));
  }
  return list.slice(0, 5);
}

/** استخراج outfits من رد invoke بأشكال مختلفة */
export function extractOutfitsPayload(res) {
  const candidates = [res?.data?.data, res?.data, res].filter(Boolean);
  for (const body of candidates) {
    if (Array.isArray(body?.outfits) && body.outfits.length) {
      return { body, outfits: body.outfits, build: body.build, order: body.order };
    }
    if (Array.isArray(body) && body.length && (body[0]?.products || body[0]?.title)) {
      return { body: { outfits: body }, outfits: body, build: undefined, order: undefined };
    }
  }
  const fallback = res?.data || res || {};
  return {
    body: fallback,
    outfits: Array.isArray(fallback?.outfits) ? fallback.outfits : [],
    build: fallback?.build,
    order: fallback?.order,
  };
}
