// خرائط عرض لترجمة القيم المخزّنة بالعربية (style/occasion/season/gender)
// إلى لغة الواجهة الحالية. تبقى القيم الأصلية كما هي للتوافق مع الخلفية.

const STYLES = {
  'كاجوال': { en: 'Casual', fr: 'Décontracté', es: 'Casual', de: 'Lässig', it: 'Casual', pt: 'Casual', tr: 'Günlük', ru: 'Повседневный', id: 'Kasual' },
  'رسمي': { en: 'Formal', fr: 'Formel', es: 'Formal', de: 'Formell', it: 'Elegante', pt: 'Formal', tr: 'Resmi', ru: 'Официальный', id: 'Formal' },
  'كلاسيكي': { en: 'Classic', fr: 'Classique', es: 'Clásico', de: 'Klassisch', it: 'Classico', pt: 'Clássico', tr: 'Klasik', ru: 'Классический', id: 'Klasik' },
  'عصري': { en: 'Modern', fr: 'Moderne', es: 'Moderno', de: 'Modern', it: 'Moderno', pt: 'Moderno', tr: 'Modern', ru: 'Современный', id: 'Modern' },
  'مينيمال': { en: 'Minimalist', fr: 'Minimaliste', es: 'Minimalista', de: 'Minimalistisch', it: 'Minimalista', pt: 'Minimalista', tr: 'Minimalist', ru: 'Минималистичный', id: 'Minimalis' },
  'فاخر': { en: 'Luxury', fr: 'Luxe', es: 'Lujo', de: 'Luxus', it: 'Lusso', pt: 'Luxo', tr: 'Lüks', ru: 'Роскошный', id: 'Mewah' },
  'ستريت': { en: 'Streetwear', fr: 'Streetwear', es: 'Streetwear', de: 'Streetwear', it: 'Streetwear', pt: 'Streetwear', tr: 'Streetwear', ru: 'Стрит', id: 'Streetwear' },
  'هيب هوب': { en: 'Hip Hop', fr: 'Hip Hop', es: 'Hip Hop', de: 'Hip Hop', it: 'Hip Hop', pt: 'Hip Hop', tr: 'Hip Hop', ru: 'Хип-хоп', id: 'Hip Hop' },
  'رياضي': { en: 'Sporty', fr: 'Sport', es: 'Deportivo', de: 'Sportlich', it: 'Sportivo', pt: 'Esportivo', tr: 'Spor', ru: 'Спортивный', id: 'Olahraga' },
  'بوهيمي': { en: 'Bohemian', fr: 'Bohème', es: 'Bohemio', de: 'Bohemisch', it: 'Boemo', pt: 'Boêmio', tr: 'Bohem', ru: 'Богемный', id: 'Bohem' },
  'فينتاج': { en: 'Vintage', fr: 'Vintage', es: 'Vintage', de: 'Vintage', it: 'Vintage', pt: 'Vintage', tr: 'Vintage', ru: 'Винтаж', id: 'Vintage' },
  'روك': { en: 'Rock', fr: 'Rock', es: 'Rock', de: 'Rock', it: 'Rock', pt: 'Rock', tr: 'Rock', ru: 'Рок', id: 'Rock' },
  'Y2K': { en: 'Y2K', fr: 'Y2K', es: 'Y2K', de: 'Y2K', it: 'Y2K', pt: 'Y2K', tr: 'Y2K', ru: 'Y2K', id: 'Y2K' },
  'أولد ماني': { en: 'Old Money', fr: 'Old Money', es: 'Old Money', de: 'Old Money', it: 'Old Money', pt: 'Old Money', tr: 'Old Money', ru: 'Old Money', id: 'Old Money' },
  'كوتيجكور': { en: 'Cottagecore', fr: 'Cottagecore', es: 'Cottagecore', de: 'Cottagecore', it: 'Cottagecore', pt: 'Cottagecore', tr: 'Cottagecore', ru: 'Коттеджкор', id: 'Cottagecore' },
  'تك وير': { en: 'Techwear', fr: 'Techwear', es: 'Techwear', de: 'Techwear', it: 'Techwear', pt: 'Techwear', tr: 'Techwear', ru: 'Techwear', id: 'Techwear' },
  'بريب': { en: 'Preppy', fr: 'Preppy', es: 'Preppy', de: 'Preppy', it: 'Preppy', pt: 'Preppy', tr: 'Preppy', ru: 'Преппи', id: 'Preppy' },
  'جرنج': { en: 'Grunge', fr: 'Grunge', es: 'Grunge', de: 'Grunge', it: 'Grunge', pt: 'Grunge', tr: 'Grunge', ru: 'Гранж', id: 'Grunge' },
  'سكاندينافي': { en: 'Scandinavian', fr: 'Scandinave', es: 'Escandinavo', de: 'Skandinavisch', it: 'Scandinavo', pt: 'Escandinavo', tr: 'İskandinav', ru: 'Скандинавский', id: 'Skandinavia' },
  'صيفي': { en: 'Summery', fr: 'Estival', es: 'Veraniego', de: 'Sommerlich', it: 'Estivo', pt: 'Estivo', tr: 'Yazlık', ru: 'Летний', id: 'Musim panas' },
  'راستا': { en: 'Rasta', fr: 'Rasta', es: 'Rasta', de: 'Rasta', it: 'Rasta', pt: 'Rasta', tr: 'Rasta', ru: 'Раста', id: 'Rasta' },
  'عربي عصري': { en: 'Modern Arabic', fr: 'Arabe moderne', es: 'Árabe moderno', de: 'Modernes Arabisch', it: 'Arabo moderno', pt: 'Árabe moderno', tr: 'Modern Arap', ru: 'Современный арабский', id: 'Arab modern' },
  'أثلور': { en: 'Athleisure', fr: 'Athleisure', es: 'Athleisure', de: 'Athleisure', it: 'Athleisure', pt: 'Athleisure', tr: 'Athleisure', ru: 'Атлежр', id: 'Athleisure' },
  'سمارث كاجوال': { en: 'Smart Casual', fr: 'Smart Casual', es: 'Smart Casual', de: 'Smart Casual', it: 'Smart Casual', pt: 'Smart Casual', tr: 'Smart Casual', ru: 'Смарт-кэжуал', id: 'Smart Casual' },
  'بزنس كاجوال': { en: 'Business Casual', fr: 'Business Casual', es: 'Business Casual', de: 'Business Casual', it: 'Business Casual', pt: 'Business Casual', tr: 'Business Casual', ru: 'Бизнес-кэжуал', id: 'Business Casual' },
  'بوهيمي فاخر': { en: 'Boho Luxe', fr: 'Boho Luxe', es: 'Boho Luxe', de: 'Boho Luxe', it: 'Boho Luxe', pt: 'Boho Luxe', tr: 'Boho Lüks', ru: 'Бохо-люкс', id: 'Boho Mewah' },
  'رومانسي': { en: 'Romantic', fr: 'Romantique', es: 'Romántico', de: 'Romantisch', it: 'Romantico', pt: 'Romântico', tr: 'Romantik', ru: 'Романтичный', id: 'Romantis' },
  'غوث': { en: 'Goth', fr: 'Goth', es: 'Goth', de: 'Goth', it: 'Goth', pt: 'Goth', tr: 'Goth', ru: 'Гот', id: 'Goth' },
  'بانك': { en: 'Punk', fr: 'Punk', es: 'Punk', de: 'Punk', it: 'Punk', pt: 'Punk', tr: 'Punk', ru: 'Панк', id: 'Punk' },
  'كاند حول': { en: 'Candy Hollow', fr: 'Candy Hollow', es: 'Candy Hollow', de: 'Candy Hollow', it: 'Candy Hollow', pt: 'Candy Hollow', tr: 'Candy Hollow', ru: 'Кэнди-холлоу', id: 'Candy Hollow' },
  'جلام': { en: 'Glam', fr: 'Glam', es: 'Glam', de: 'Glam', it: 'Glam', pt: 'Glam', tr: 'Glam', ru: 'Глам', id: 'Glam' },
  'ديسكو': { en: 'Disco', fr: 'Disco', es: 'Disco', de: 'Disco', it: 'Disco', pt: 'Disco', tr: 'Disco', ru: 'Диско', id: 'Disko' },
  'شيك': { en: 'Chic', fr: 'Chic', es: 'Chic', de: 'Chic', it: 'Chic', pt: 'Chic', tr: 'Şık', ru: 'Шик', id: 'Chic' },
  'محجبة': { en: 'Modest Hijabi', fr: 'Hijabi modeste', es: 'Hijabi modesto', de: 'Bescheidene Hijabi', it: 'Hijabi modesta', pt: 'Hijabi modesta', tr: 'Hijabi Modest', ru: 'Скромный хиджаб', id: 'Hijabi Modest' },
};

const OCCASIONS = {
  'يومي': { en: 'Everyday', fr: 'Quotidien', es: 'Diario', de: 'Alltag', it: 'Quotidiano', pt: 'Diário', tr: 'Günlük', ru: 'Повседневное', id: 'Sehari-hari' },
  'عمل': { en: 'Work', fr: 'Travail', es: 'Trabajo', de: 'Arbeit', it: 'Lavoro', pt: 'Trabalho', tr: 'İş', ru: 'Работа', id: 'Bekerja' },
  'مناسبة اجتماعية': { en: 'Social gathering', fr: 'Événement social', es: 'Evento social', de: 'Treffen', it: 'Evento sociale', pt: 'Evento social', tr: 'Sosyal etkinlik', ru: 'Социальное событие', id: 'Acara sosial' },
  'موعد': { en: 'Date', fr: 'Rendez-vous', es: 'Cita', de: 'Date', it: 'Appuntamento', pt: 'Encontro', tr: 'Buluşma', ru: 'Свидание', id: 'Kencan' },
  'سفر': { en: 'Travel', fr: 'Voyage', es: 'Viaje', de: 'Reise', it: 'Viaggio', pt: 'Viagem', tr: 'Seyahat', ru: 'Путешествие', id: 'Bepergian' },
};

const SEASONS = {
  'ربيع': { en: 'Spring', fr: 'Printemps', es: 'Primavera', de: 'Frühling', it: 'Primavera', pt: 'Primavera', tr: 'İlkbahar', ru: 'Весна', id: 'Semi' },
  'صيف': { en: 'Summer', fr: 'Été', es: 'Verano', de: 'Sommer', it: 'Estate', pt: 'Verão', tr: 'Yaz', ru: 'Лето', id: 'Musim panas' },
  'خريف': { en: 'Autumn', fr: 'Automne', es: 'Otoño', de: 'Herbst', it: 'Autunno', pt: 'Outono', tr: 'Sonbahar', ru: 'Осень', id: 'Musim gugur' },
  'شتاء': { en: 'Winter', fr: 'Hiver', es: 'Invierno', de: 'Winter', it: 'Inverno', pt: 'Inverno', tr: 'Kış', ru: 'Зима', id: 'Musim dingin' },
};

const GENDERS = {
  'ذكر': { en: 'Male', fr: 'Homme', es: 'Hombre', de: 'Mann', it: 'Uomo', pt: 'Homem', tr: 'Erkek', ru: 'Мужской', id: 'Pria' },
  'أنثى': { en: 'Female', fr: 'Femme', es: 'Mujer', de: 'Frau', it: 'Donna', pt: 'Mulher', tr: 'Kadın', ru: 'Женский', id: 'Wanita' },
};

// ألوان المنتجات الشائعة (مفتاح بالعربية والإنجليزية معًا لدعم كلا الاتجاهين)
const COLOR_ENTRIES = [
  { ar:'أسود', en:'Black', fr:'Noir', es:'Negro', de:'Schwarz', it:'Nero', pt:'Preto', tr:'Siyah', ru:'Чёрный', id:'Hitam' },
  { ar:'أبيض', en:'White', fr:'Blanc', es:'Blanco', de:'Weiß', it:'Bianco', pt:'Branco', tr:'Beyaz', ru:'Белый', id:'Putih' },
  { ar:'رمادي', en:'Gray', fr:'Gris', es:'Gris', de:'Grau', it:'Grigio', pt:'Cinza', tr:'Gri', ru:'Серый', id:'Abu-abu' },
  { ar:'أحمر', en:'Red', fr:'Rouge', es:'Rojo', de:'Rot', it:'Rosso', pt:'Vermelho', tr:'Kırmızı', ru:'Красный', id:'Merah' },
  { ar:'أزرق', en:'Blue', fr:'Bleu', es:'Azul', de:'Blau', it:'Blu', pt:'Azul', tr:'Mavi', ru:'Синий', id:'Biru' },
  { ar:'أخضر', en:'Green', fr:'Vert', es:'Verde', de:'Grün', it:'Verde', pt:'Verde', tr:'Yeşil', ru:'Зелёный', id:'Hijau' },
  { ar:'أصفر', en:'Yellow', fr:'Jaune', es:'Amarillo', de:'Gelb', it:'Giallo', pt:'Amarelo', tr:'Sarı', ru:'Жёлтый', id:'Kuning' },
  { ar:'بني', en:'Brown', fr:'Marron', es:'Marrón', de:'Braun', it:'Marrone', pt:'Marrom', tr:'Kahverengi', ru:'Коричневый', id:'Coklat' },
  { ar:'برتقالي', en:'Orange', fr:'Orange', es:'Naranja', de:'Orange', it:'Arancione', pt:'Laranja', tr:'Turuncu', ru:'Оранжевый', id:'Oranye' },
  { ar:'بنفسجي', en:'Purple', fr:'Violet', es:'Púrpura', de:'Violett', it:'Viola', pt:'Roxo', tr:'Mor', ru:'Фиолетовый', id:'Ungu' },
  { ar:'وردي', en:'Pink', fr:'Rose', es:'Rosa', de:'Rosa', it:'Rosa', pt:'Rosa', tr:'Pembe', ru:'Розовый', id:'Merah muda' },
  { ar:'بيچ', en:'Beige', fr:'Beige', es:'Beis', de:'Beige', it:'Beige', pt:'Bege', tr:'Bej', ru:'Бежевый', id:'Beige' },
  { ar:'كحلي', en:'Navy', fr:'Marine', es:'Azul marino', de:'Marineblau', it:'Blu marino', pt:'Marinho', tr:'Lacivert', ru:'Тёмно-синий', id:'Biru tua' },
  { ar:'فيروزي', en:'Turquoise', fr:'Turquoise', es:'Turquesa', de:'Türkis', it:'Turchese', pt:'Turquesa', tr:'Turkuaz', ru:'Бирюзовый', id:'Turkuaz' },
  { ar:'خمري', en:'Maroon', fr:'Bordeaux', es:'Granate', de:'Kastanie', it:'Granata', pt:'Bordô', tr:'Bordo', ru:'Бордовый', id:'Marun' },
  { ar:'نبيتي', en:'Burgundy', fr:'Bordeaux', es:'Burdeos', de:'Bordeaux', it:'Borgogna', pt:'Bordô', tr:'Bordo', ru:'Бордовый', id:'Marun tua' },
  { ar:'ذهبي', en:'Gold', fr:'Doré', es:'Dorado', de:'Gold', it:'Oro', pt:'Dourado', tr:'Altın', ru:'Золотой', id:'Emas' },
  { ar:'فضي', en:'Silver', fr:'Argent', es:'Plateado', de:'Silber', it:'Argento', pt:'Prata', tr:'Gümüş', ru:'Серебряный', id:'Perak' },
  { ar:'نحاسي', en:'Bronze', fr:'Bronze', es:'Bronce', de:'Bronze', it:'Bronzo', pt:'Bronze', tr:'Bronz', ru:'Бронзовый', id:'Perunggu' },
  { ar:'كريمي', en:'Cream', fr:'Crème', es:'Crema', de:'Creme', it:'Crema', pt:'Creme', tr:'Krem', ru:'Кремовый', id:'Krem' },
  { ar:'زيتي', en:'Olive', fr:'Olive', es:'Oliva', de:'Oliv', it:'Oliva', pt:'Verde-oliva', tr:'Zeytin', ru:'Оливковый', id:'Zaitun' },
  { ar:'خوخي', en:'Peach', fr:'Pêche', es:'Melocotón', de:'Pfirsich', it:'Pesca', pt:'Pêssego', tr:'Şeftali', ru:'Персиковый', id:'Persik' },
  { ar:'مرجاني', en:'Coral', fr:'Corail', es:'Coral', de:'Koralle', it:'Corallo', pt:'Coral', tr:'Mercan', ru:'Коралловый', id:'Karang' },
  { ar:'نعناعي', en:'Mint', fr:'Menthe', es:'Menta', de:'Minze', it:'Menta', pt:'Menta', tr:'Menta', ru:'Мятный', id:'Mint' },
  { ar:'لافندر', en:'Lavender', fr:'Lavande', es:'Lavanda', de:'Lavendel', it:'Lavanda', pt:'Lavanda', tr:'Lavanta', ru:'Лавандовый', id:'Lavender' },
  { ar:'شامبين', en:'Champagne', fr:'Champagne', es:'Champán', de:'Champagner', it:'Champagne', pt:'Champanhe', tr:'Şampanya', ru:'Шампань', id:'Sampanye' },
  { ar:'فحمي', en:'Charcoal', fr:'Anthracite', es:'Grafito', de:'Anthrazit', it:'Carbone', pt:'Carvão', tr:'Antrasit', ru:'Угольный', id:'Arang' },
  { ar:'كاكاو', en:'Cocoa', fr:'Cacao', es:'Cacao', de:'Kakao', it:'Cacao', pt:'Cacau', tr:'Kakao', ru:'Какао', id:'Kakao' },
  { ar:'نيون', en:'Neon', fr:'Néon', es:'Neón', de:'Neon', it:'Neon', pt:'Neon', tr:'Neon', ru:'Неоновый', id:'Neon' },
];
const COLORS = {};
COLOR_ENTRIES.forEach((e) => {
  COLORS[e.ar] = e;
  COLORS[e.en] = e;
  COLORS[e.en.toLowerCase()] = e;
});

// درجات البشرة (منفصلة لأن الترجمة السياقية تختلف عن ألوان المنتجات)
const SKIN_TONES = {
  'أبيض': { ar:'أبيض', en:'Fair', fr:'Clair', es:'Claro', de:'Hell', it:'Chiaro', pt:'Claro', tr:'Açık', ru:'Светлый', id:'Cerah' },
  'فاتح': { ar:'فاتح', en:'Light', fr:'Clair', es:'Claro', de:'Hell', it:'Chiaro', pt:'Claro', tr:'Açık', ru:'Светлый', id:'Terang' },
  'حنطي': { ar:'حنطي', en:'Tan', fr:'Hâlé', es:'Moreno', de:'Gebräunt', it:'Abbronzato', pt:'Bronzeado', tr:'Buğday', ru:'Загорелый', id:'Sawo matang' },
  'أسمر': { ar:'أسمر', en:'Brown', fr:'Bronzé', es:'Moreno oscuro', de:'Dunkel', it:'Scuro', pt:'Moreno', tr:'Esmer', ru:'Тёмный', id:'Coklat' },
  'غامق': { ar:'غامق', en:'Deep', fr:'Foncé', es:'Oscuro', de:'Tief', it:'Scuro', pt:'Escuro', tr:'Koyu', ru:'Тёмный', id:'Gelap' },
};

function pick(map, value, lang) {
  if (!value) return '';
  const entry = map[value];
  if (!entry) return value;
  return entry[lang] || entry.en || value;
}

export const styleDisplayName = (v, lang) => (lang === 'ar' ? v || '' : pick(STYLES, v, lang));
export const occasionDisplayName = (v, lang) => pick(OCCASIONS, v, lang);
export const seasonDisplayName = (v, lang) => pick(SEASONS, v, lang);
export const genderDisplayName = (v, lang) => pick(GENDERS, v, lang);
export const colorDisplayName = (v, lang) => {
  if (!v) return '';
  const entry = COLORS[v] || COLORS[String(v).toLowerCase()];
  if (!entry) return v;
  return entry[lang] || entry.en || v;
};
export const skinToneDisplayName = (v, lang) => pick(SKIN_TONES, v, lang);