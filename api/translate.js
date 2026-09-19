// Vercel Serverless Function: /api/translate
// Handles Trilingual Transliteration (Hindi, English, Urdu) without browser CORS issues

// Universal Trilingual Transliteration Service for Chetna Digital Library
// Supports Instantaneous & Accurate Transliteration across Hindi (Devanagari), English (Latin), and Urdu (Perso-Arabic)

export const LITERARY_DICTIONARY = {
  // Key Authors & Historic Figures
  'munshi premchand': { hi: 'मुंशी प्रेमचंद', en: 'Munshi Premchand', ur: 'منشی پریم چند' },
  'premchand': { hi: 'मुंशी प्रेमचंद', en: 'Premchand', ur: 'پریم چند' },
  'bhagat singh': { hi: 'भगत सिंह', en: 'Bhagat Singh', ur: 'بھگت سنگھ' },
  'sohan singh josh': { hi: 'सोहन सिंह जोश', en: 'Sohan Singh Josh', ur: 'سوہن سنگھ جوش' },
  'sohan singh': { hi: 'सोहन सिंह', en: 'Sohan Singh', ur: 'سوہن سنگھ' },
  'suchit mathur': { hi: 'सुचित माथुर', en: 'Suchit Mathur', ur: 'سوچت ماتھر' },
  'kabir': { hi: 'संत कबीर', en: 'Kabir', ur: 'کبیر' },
  'sant kabir': { hi: 'संत कबीर', en: 'Sant Kabir', ur: 'سنت کبیر' },
  'rabindranath tagore': { hi: 'रवींद्रनाथ टैगोर', en: 'Rabindranath Tagore', ur: 'رابندر ناتھ ٹیگور' },
  'tagore': { hi: 'रवींद्रनाथ टैगोर', en: 'Rabindranath Tagore', ur: 'ٹیگور' },
  'mir anees': { hi: 'मीर अनीस', en: 'Mir Anees', ur: 'میر انیس' },
  'mirza ghalib': { hi: 'मिर्ज़ा ग़ालिब', en: 'Mirza Ghalib', ur: 'مرزا غالب' },
  'ghalib': { hi: 'मिर्ज़ा ग़ालिब', en: 'Mirza Ghalib', ur: 'مرزا غالب' },
  'faiz ahmad faiz': { hi: 'फ़ैज़ अहमद फ़ैज़', en: 'Faiz Ahmad Faiz', ur: 'فیض احمد فیض' },
  'faiz': { hi: 'फ़ैज़ अहमद फ़ैज़', en: 'Faiz Ahmad Faiz', ur: 'فیض احمد فیض' },
  'mahadevi varma': { hi: 'महादेवी वर्मा', en: 'Mahadevi Varma', ur: 'مہادیوی ورما' },
  'jaishankar prasad': { hi: 'जयशंकर प्रसाद', en: 'Jaishankar Prasad', ur: 'جئے شنکر پرساد' },
  'harishankar parsai': { hi: 'हरिशंकर परसाई', en: 'Harishankar Parsai', ur: 'ہری شنکر پرسائی' },
  'dr. b.r. ambedkar': { hi: 'डॉ. बी.आर. आंबेडकर', en: 'Dr. B.R. Ambedkar', ur: 'ڈاکٹر امبیڈکر' },
  'b.r. ambedkar': { hi: 'डॉ. बी.आर. आंबेडकर', en: 'Dr. B.R. Ambedkar', ur: 'ڈاکٹر امبیڈکر' },
  'ambedkar': { hi: 'डॉ. बी.आर. आंबेडकर', en: 'Dr. B.R. Ambedkar', ur: 'ڈاکٹر امبیڈکر' },
  'mahatma gandhi': { hi: 'महात्मा गांधी', en: 'Mahatma Gandhi', ur: 'مہاتما گاندھی' },
  'gandhi': { hi: 'महात्मा गांधी', en: 'Mahatma Gandhi', ur: 'مہاتما گاندھی' },
  'allama iqbal': { hi: 'अल्लामा इक़बाल', en: 'Allama Iqbal', ur: 'علامہ اقبال' },
  'iqbal': { hi: 'अल्लामा इक़बाल', en: 'Allama Iqbal', ur: 'علامہ اقبال' },
  'suryakant tripathi nirala': { hi: 'सूर्यकांत त्रिपाठी निराला', en: 'Suryakant Tripathi Nirala', ur: 'سوریہ کانت ترپاٹھی نرالا' },
  'nirala': { hi: 'सूर्यकांत त्रिपाठी निराला', en: 'Nirala', ur: 'نرالا' },
  'ramdhari singh dinkar': { hi: 'रामधारी सिंह दिनकर', en: 'Ramdhari Singh Dinkar', ur: 'رام دھاری سنگھ دنکر' },
  'dinkar': { hi: 'रामधारी सिंह दिनकर', en: 'Dinkar', ur: 'دنکر' },
  'manto': { hi: 'सआदत हसन मंटो', en: 'Saadat Hasan Manto', ur: 'سعادت حسن منٹو' },
  'saadat hasan manto': { hi: 'सआदत हसन मंटो', en: 'Saadat Hasan Manto', ur: 'سعادت حسن منٹو' },
  'ismat chughtai': { hi: 'इस्मत चुग़ताई', en: 'Ismat Chughtai', ur: 'عصمت چغتائی' },
  'firaq gorakhpuri': { hi: 'फ़िराक़ गोरखपुरी', en: 'Firaq Gorakhpuri', ur: 'فراق گورکھپوری' },
  'rahul sankrityayan': { hi: 'राहुल सांकृत्यायन', en: 'Rahul Sankrityayan', ur: 'راہل سانکرتیائن' },
  'yashpal': { hi: 'यशपाल', en: 'Yashpal', ur: 'یش پال' },
  'nagarjun': { hi: 'नागार्जुन', en: 'Nagarjun', ur: 'ناگارجن' },
  'hazari prasad dwivedi': { hi: 'हज़ारी प्रसाद द्विवेदी', en: 'Hazari Prasad Dwivedi', ur: 'ہزاری پرساد دویدی' },

  // Key Classics, Books & Common Title Terms
  'godan': { hi: 'गोदान', en: 'Godan', ur: 'گودان' },
  'gaban': { hi: 'ग़बन', en: 'Gaban', ur: 'غبن' },
  'nirmala': { hi: 'निर्मला', en: 'Nirmala', ur: 'نرملہ' },
  'karmabhoomi': { hi: 'कर्मभूमि', en: 'Karmabhoomi', ur: 'کرم بھومی' },
  'rangbhoomi': { hi: 'रंगभूमि', en: 'Rangbhoomi', ur: 'رنگ بھومی' },
  'sevasadan': { hi: 'सेवासदन', en: 'Sevasadan', ur: 'سوا سدن' },
  'mansarovar': { hi: 'मानसरोवर', en: 'Mansarovar', ur: 'مانسروور' },
  'idgah': { hi: 'ईदगाह', en: 'Idgah', ur: 'عیدگاہ' },
  'poos ki raat': { hi: 'पूस की रात', en: 'Poos Ki Raat', ur: 'پوس کی رات' },
  'do bailon ki katha': { hi: 'दो बैलों की कथा', en: 'Do Baillon Ki Katha', ur: 'दो بیلوں کی کہانی' },
  'madhushala': { hi: 'मधुशाला', en: 'Madhushala', ur: 'مدھوشالا' },
  'kamayani': { hi: 'कामायनी', en: 'Kamayani', ur: 'کامایانی' },
  'rashmirathi': { hi: 'रश्मिरथी', en: 'Rashmirathi', ur: 'رشمیرتھ' },
  'kurukshetra': { hi: 'कुरुक्षेत्र', en: 'Kurukshetra', ur: 'کروکشیتر' },
  'raag darbari': { hi: 'राग दरबारी', en: 'Raag Darbari', ur: 'راگ درباری' },
  'tamas': { hi: 'तमस', en: 'Tamas', ur: 'تمس' },
  'maila aanchal': { hi: 'मैला आंचल', en: 'Maila Aanchal', ur: 'میلا آنچل' },
  'gitanjali': { hi: 'गीतांजलि', en: 'Gitanjali', ur: 'گیتانجلی' },
  'my meetings with bhagat singh': { hi: 'माई मीटिंग्स विद भगत सिंह', en: 'My Meetings with Bhagat Singh', ur: 'مائی میٹنگز ود بھگت سنگھ' },
  'my meetings with bhagat singh and on other early revolutionaries': { hi: 'माई मीटिंग्स विद भगत सिंह एंड ऑन अदर अर्ली रिवोल्यूशनरीज़', en: 'My Meetings with Bhagat Singh and on Other Early Revolutionaries', ur: 'مائی میٹنگز ود بھگت سنگھ اور دیگر ابتدائی انقلابیوں پر' },
  'and on other early revolutionaries': { hi: 'एंड ऑन अदर अर्ली रिवोल्यूशनरीज़', en: 'and on Other Early Revolutionaries', ur: 'اور دیگر ابتدائی انقلابیوں پر' },
  'early revolutionaries': { hi: 'अर्ली रिवोल्यूशनरीज़', en: 'Early Revolutionaries', ur: 'ابتدائی انقلابی' },
  'marsiya e anees': { hi: 'मर्सिया-ए-अनीस', en: 'Marsiya-e-Anees', ur: 'مرثیہ انیس' },
  'diwan e ghalib': { hi: 'दीवान-ए-ग़ालिब', en: 'Diwan-e-Ghalib', ur: 'دیوان غالب' },
  'kulliyat e faiz': { hi: 'कुल्लियात-ए-फ़ैज़', en: 'Kulliyat-e-Faiz', ur: 'کلیات فیض' },

  // Common Literary Words for Titles
  'my': { hi: 'माई', en: 'My', ur: 'مائی' },
  'meetings': { hi: 'मीटिंग्स', en: 'Meetings', ur: 'میٹنگز' },
  'meeting': { hi: 'मीटिंग', en: 'Meeting', ur: 'میٹنگ' },
  'with': { hi: 'विद', en: 'With', ur: 'ود' },
  'and': { hi: 'एंड', en: 'And', ur: 'اینڈ' },
  'on': { hi: 'ऑन', en: 'On', ur: 'آن' },
  'other': { hi: 'अदर', en: 'Other', ur: 'ادر' },
  'early': { hi: 'अर्ली', en: 'Early', ur: 'ارلی' },
  'revolutionaries': { hi: 'रिवोल्यूशनरीज़', en: 'Revolutionaries', ur: 'انقلابی' },
  'revolutionary': { hi: 'रिवोल्यूशनरी', en: 'Revolutionary', ur: 'انقلابی' },
  'revolution': { hi: 'क्रांति', en: 'Revolution', ur: 'انقلاب' },
  'stories': { hi: 'कहानियाँ', en: 'Stories', ur: 'کہانیاں' },
  'story': { hi: 'कहानी', en: 'Story', ur: 'کہانی' },
  'poems': { hi: 'कविताएँ', en: 'Poems', ur: 'نظمیں' },
  'poetry': { hi: 'कविता', en: 'Poetry', ur: 'شاعری' },
  'selected': { hi: 'चयनित', en: 'Selected', ur: 'منتخب' },
  'works': { hi: 'रचनाएँ', en: 'Works', ur: 'تصانیف' },
  'collected': { hi: 'संग्रह', en: 'Collected', ur: 'مجموعہ' },
  'writings': { hi: 'लेख', en: 'Writings', ur: 'تحریریں' },
  'essay': { hi: 'निबंध', en: 'Essay', ur: 'مضمون' },
  'essays': { hi: 'निबंध संग्रह', en: 'Essays', ur: 'مضامین' },
  'novel': { hi: 'उपन्यास', en: 'Novel', ur: 'ناول' },
  'history': { hi: 'इतिहास', en: 'History', ur: 'تاریخ' },
  'memoirs': { hi: 'संस्मरण', en: 'Memoirs', ur: 'یادداشتیں' },
  'autobiography': { hi: 'आत्मकथा', en: 'Autobiography', ur: 'آپ بیتی' },
  'letters': { hi: 'पत्र', en: 'Letters', ur: 'خطوط' },
  'speech': { hi: 'भाषण', en: 'Speech', ur: 'تقریر' },
  'speeches': { hi: 'भाषण संग्रह', en: 'Speeches', ur: 'تقاریر' },
  'the': { hi: 'द', en: 'The', ur: 'دی' },
  'of': { hi: 'ऑफ', en: 'Of', ur: 'آف' },
  'in': { hi: 'इन', en: 'In', ur: 'ان' },
  'for': { hi: 'फॉर', en: 'For', ur: 'فار' },
  'by': { hi: 'द्वारा', en: 'By', ur: 'از' }
};

const translitCache = new Map();

export function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'en';
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  if (/[\u0600-\u06FF]/.test(text)) return 'ur';
  return 'en';
}

const HI_TO_UR_MAP = {
  'अ': 'ا', 'आ': 'آ', 'इ': 'اِ', 'ई': 'ای', 'उ': 'اُ', 'ऊ': 'او', 'ए': 'اے', 'ऐ': 'ائے', 'ओ': 'او', 'औ': 'ائو',
  'क': 'ک', 'ख': 'کھ', 'ग': 'گ', 'घ': 'گھ', 'ङ': 'نگ',
  'च': 'چ', 'छ': 'چھ', 'ज': 'ج', 'झ': 'جھ', 'ञ': 'نج',
  'ट': 'ٹ', 'ठ': 'ٹھ', 'ड': 'ڈ', 'ढ': 'ڈھ', 'ण': 'ن',
  'त': 'ت', 'थ': 'تھ', 'द': 'د', 'ध': 'دھ', 'न': 'ن',
  'प': 'پ', 'फ': 'پھ', 'ब': 'ب', 'भ': 'بھ', 'म': 'م',
  'य': 'ی', 'र': 'ر', 'ल': 'ل', 'व': 'و', 'श': 'ش', 'ष': 'ش', 'स': 'س', 'ह': 'ہ',
  'क़': 'ق', 'ख़': 'خ', 'ग़': 'غ', 'ज़': 'ز', 'ड़': 'ڑ', 'ढ़': 'ڑھ', 'फ़': 'ف',
  'ा': 'ا', 'ि': 'ِ', 'ी': 'ی', 'ु': 'ُ', 'ू': 'و', 'े': 'ے', 'ै': 'ے', 'ो': 'و', 'ौ': 'و',
  'ं': 'ں', 'ँ': 'ں', '्': '', '़': '', '।': '۔', '?': '؟'
};

const UR_TO_HI_MAP = {
  'آ': 'आ', 'ا': 'अ', 'ب': 'ब', 'پ': 'प', 'ت': 'त', 'ٹ': 'ट', 'ث': 'स', 'ج': 'ज', 'چ': 'च',
  'ح': 'ह', 'ख': 'ख़', 'د': 'द', 'ڈ': 'ड', 'ذ': 'ज़', 'ر': 'र', 'ڑ': 'ड़', 'ز': 'ज़', 'ژ': 'झ़',
  'س': 'स', 'ش': 'श', 'ص': 'स', 'ض': 'ज़', 'ط': 'त', 'ظ': 'ज़', 'ع': 'अ', 'غ': 'ग़', 'ف': 'फ़',
  'ق': 'क़', 'ک': 'क', 'گ': 'ग', 'ل': 'ल', 'م': 'म', 'ن': 'न', 'ں': 'ं', 'و': 'व', 'ہ': 'ह',
  'ۂ': 'ह', 'ۃ': 'त', 'ی': 'य', 'ے': 'े', 'ئ': 'ई', 'ء': '', 'بھ': 'भ', 'پھ': 'फ', 'تھ': 'थ',
  'ٹھ': 'ठ', 'جھ': 'झ', 'چھ': 'छ', 'دھ': 'ध', 'ڈھ': 'ढ', 'کھ': 'ख', 'گھ': 'घ', 'ڑھ': 'ढ़',
  '۔': '।', '؟': '?'
};

export function phoneticEnglishToHindi(text) {
  if (!text) return '';
  let s = text.toLowerCase();
  
  const multiRules = [
    ['bhagat', 'भगत'], ['singh', 'सिंह'], ['sohan', 'सोहन'], ['josh', 'जोश'],
    ['suchit', 'सुचित'], ['mathur', 'माथुर'], ['premchand', 'प्रेमचंद'],
    ['munshi', 'मुंशी'], ['kumar', 'कुमार'], ['sharma', 'शर्मा'],
    ['verma', 'वर्मा'], ['gupta', 'गुप्ता'], ['yadav', 'यादव'],
    ['singhal', 'सिंघल'], ['mishra', 'मिश्रा'], ['pandey', 'पांडेय'],
    ['khan', 'ख़ान'], ['ahmad', 'अहमद'], ['ahmed', 'अहमद'],
    ['ali', 'अली'], ['hussain', 'हुसैन'], ['iqbal', 'इक़बाल'],
    ['ghalib', 'ग़ालिब'], ['faiz', 'फ़ैज़'], ['kavita', 'कविता'],
    ['kahani', 'कहानी'], ['katha', 'कथा'], ['itihas', 'इतिहास'],
    ['kranti', 'क्रांति'], ['bharat', 'भारत'], ['hindustan', 'हिंदुस्तान'],
    ['meetings', 'मीटिंग्स'], ['meeting', 'मीटिंग'], ['revolutionaries', 'रिवोल्यूशनरीज़'],
    ['revolutionary', 'रिवोल्यूशनरी'], ['early', 'अर्ली'], ['other', 'अदर'],
    ['with', 'विद'], ['and', 'एंड'], ['the', 'द'], ['of', 'ऑफ'], ['in', 'इन'], ['on', 'ऑन'], ['by', 'बाय']
  ];

  for (const [eng, hin] of multiRules) {
    const reg = new RegExp('\\b' + eng + '\\b', 'gi');
    s = s.replace(reg, hin);
  }

  if (/[\u0900-\u097F]/.test(s) && !/[a-zA-Z]/.test(s)) {
    return s;
  }

  const charRules = [
    ['ksh', 'क्ष'], ['gya', 'ज्ञ'], ['tra', 'त्र'], ['shri', 'श्री'],
    ['kh', 'ख'], ['gh', 'घ'], ['ch', 'च'], ['chh', 'छ'], ['jh', 'झ'],
    ['th', 'थ'], ['dh', 'ध'], ['ph', 'फ'], ['bh', 'भ'], ['sh', 'श'],
    ['zh', 'झ'], ['ee', 'ी'], ['oo', 'ू'], ['ai', 'ै'], ['au', 'ौ'],
    ['aa', 'ा'], ['k', 'क'], ['g', 'ग'], ['c', 'क'], ['j', 'ज'],
    ['t', 'त'], ['d', 'द'], ['n', 'न'], ['p', 'प'], ['f', 'फ़'],
    ['b', 'ब'], ['m', 'म'], ['y', 'य'], ['r', 'र'], ['l', 'ल'],
    ['v', 'व'], ['w', 'व'], ['s', 'स'], ['h', 'ह'], ['z', 'ज़'],
    ['q', 'क़'], ['x', 'क्स'], ['a', 'ा'], ['i', 'ि'], ['u', 'ु'],
    ['e', 'े'], ['o', 'ो']
  ];

  let out = '';
  let words = s.split(/(\s+|[.,:;!?'"()[\]\-_/]+)/);
  for (let w of words) {
    if (/[\u0900-\u097F]/.test(w) || /^\s+$/.test(w) || /^[.,:;!?'"()[\]\-_/]+$/.test(w)) {
      out += w;
      continue;
    }
    let cur = w;
    for (const [k, v] of charRules) {
      cur = cur.split(k).join(v);
    }
    cur = cur.replace(/^([ािीुूेैोौ])/, 'अ$1');
    out += cur;
  }
  return out;
}

export function devanagariToUrdu(text) {
  if (!text) return '';
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1] || '';
    if (ch === 'न' && (next === ' ' || i === text.length - 1)) {
      out += 'ں';
    } else if (HI_TO_UR_MAP[ch] !== undefined) {
      out += HI_TO_UR_MAP[ch];
    } else {
      out += ch;
    }
  }
  return out;
}

export function urduToDevanagari(text) {
  if (!text) return '';
  let out = '';
  let i = 0;
  while (i < text.length) {
    const two = text.slice(i, i + 2);
    if (UR_TO_HI_MAP[two]) {
      out += UR_TO_HI_MAP[two];
      i += 2;
    } else {
      const one = text[i];
      out += UR_TO_HI_MAP[one] !== undefined ? UR_TO_HI_MAP[one] : one;
      i += 1;
    }
  }
  return out;
}

export function devanagariToEnglish(text) {
  if (!text) return '';
  const HI_TO_EN_MAP = {
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh',
    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n', 'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
    'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm', 'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
    'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h', 'क़': 'q', 'ख़': 'kh', 'ग़': 'gh', 'ज़': 'z', 'फ़': 'f',
    'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n'
  };
  let out = '';
  for (let ch of text) {
    out += HI_TO_EN_MAP[ch] !== undefined ? HI_TO_EN_MAP[ch] : ch;
  }
  return out.replace(/\b[a-z]/g, c => c.toUpperCase());
}

export function lookupDictionary(text) {
  if (!text) return null;
  const clean = text.trim().toLowerCase().replace(/[\s_-]+/g, ' ');
  if (LITERARY_DICTIONARY[clean]) return LITERARY_DICTIONARY[clean];

  for (const [k, v] of Object.entries(LITERARY_DICTIONARY)) {
    if (clean === k || clean === v.hi.toLowerCase() || clean === v.en.toLowerCase() || clean === v.ur.toLowerCase()) {
      return v;
    }
  }
  return null;
}

export function clientSideTransliterateFallback(text, sourceLang) {
  const trimmed = text.trim();
  const dict = lookupDictionary(trimmed);
  if (dict) {
    return {
      hi: dict.hi || trimmed,
      en: dict.en || trimmed,
      ur: dict.ur || trimmed
    };
  }

  let hi = '';
  let en = '';
  let ur = '';

  if (sourceLang === 'en') {
    en = trimmed;
    hi = phoneticEnglishToHindi(trimmed);
    ur = devanagariToUrdu(hi);
  } else if (sourceLang === 'hi') {
    hi = trimmed;
    en = devanagariToEnglish(trimmed);
    ur = devanagariToUrdu(trimmed);
  } else if (sourceLang === 'ur') {
    ur = trimmed;
    hi = urduToDevanagari(trimmed);
    en = devanagariToEnglish(hi);
  }

  return {
    hi: hi || trimmed,
    en: en || trimmed,
    ur: ur || trimmed
  };
}

export async function transliterateAll(text, sourceLangHint = 'auto') {
  if (!text || !text.trim()) {
    return { hi: '', en: '', ur: '' };
  }

  const trimmed = text.trim();
  const cacheKey = `${trimmed}_${sourceLangHint}`;
  if (translitCache.has(cacheKey)) {
    return translitCache.get(cacheKey);
  }

  const dictMatch = lookupDictionary(trimmed);
  if (dictMatch) {
    const res = {
      hi: dictMatch.hi || trimmed,
      en: dictMatch.en || trimmed,
      ur: dictMatch.ur || trimmed
    };
    translitCache.set(cacheKey, res);
    return res;
  }

  let srcLang = sourceLangHint;
  if (srcLang === 'auto' || !['hi', 'en', 'ur'].includes(srcLang)) {
    srcLang = detectLanguage(trimmed);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const apiRes = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: trimmed, sourceLang: srcLang }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (apiRes.ok) {
      const contentType = apiRes.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await apiRes.json();
        if (data.success && data.translations) {
          const trans = data.translations;
          const result = {
            hi: trans.hi || trimmed,
            en: trans.en || trimmed,
            ur: trans.ur || trimmed
          };
          translitCache.set(cacheKey, result);
          return result;
        }
      }
    }
  } catch (err) {
    // Falls through to fallback
  }

  const fallbackResult = clientSideTransliterateFallback(trimmed, srcLang);
  translitCache.set(cacheKey, fallbackResult);
  return fallbackResult;
}


async function fetchGoogleInputTools(token, targetLang) {
  const itc = targetLang === 'hi' ? 'hi-t-i0-und' : (targetLang === 'ur' ? 'ur-t-i0-und' : null);
  if (!itc || !/[a-zA-Z]/.test(token)) return null;

  try {
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(token.trim())}&itc=${itc}&num=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data[1] && data[1][0] && data[1][0][1] && data[1][0][1][0]) {
      return data[1][0][1][0];
    }
  } catch (_) {}
  return null;
}

async function fetchGoogleTranslate(text, sourceLang, targetLang) {
  if (!text || !text.trim()) return '';
  try {
    const src = sourceLang === 'auto' ? 'auto' : sourceLang;
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${src}&tl=${targetLang}&dt=t&dt=rm&q=${encodeURIComponent(text.trim())}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    if (targetLang === 'en') {
      let roman = data && data[0] && data[0][0] && data[0][0][3] ? data[0][0][3] : null;
      if (roman && typeof roman === 'string') return roman;
      if (data && data[0] && data[0][0] && data[0][0][0]) return data[0][0][0];
    } else {
      if (data && data[0] && data[0][0] && data[0][0][0]) return data[0][0][0];
    }
  } catch (_) {}
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let text = '';
    let sourceLang = 'auto';

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      text = body?.text || '';
      sourceLang = body?.sourceLang || 'auto';
    } else {
      text = req.query?.text || '';
      sourceLang = req.query?.sourceLang || 'auto';
    }

    if (!text || !text.trim()) {
      return res.status(200).json({ success: true, translations: { hi: '', en: '', ur: '' } });
    }

    const trimmed = text.trim();
    let detectedSource = sourceLang;
    if (detectedSource === 'auto') {
      if (/[\u0900-\u097F]/.test(trimmed)) detectedSource = 'hi';
      else if (/[\u0600-\u06FF]/.test(trimmed)) detectedSource = 'ur';
      else detectedSource = 'en';
    }

    let hi = '';
    let en = '';
    let ur = '';

    if (detectedSource === 'en') {
      en = trimmed;
      const hiItc = await fetchGoogleInputTools(trimmed, 'hi');
      const urItc = await fetchGoogleInputTools(trimmed, 'ur');
      const hiGtx = await fetchGoogleTranslate(trimmed, 'en', 'hi');
      const urGtx = await fetchGoogleTranslate(trimmed, 'en', 'ur');
      hi = hiItc || hiGtx || '';
      ur = urItc || urGtx || '';
    } else if (detectedSource === 'hi') {
      hi = trimmed;
      en = await fetchGoogleTranslate(trimmed, 'hi', 'en');
      ur = await fetchGoogleTranslate(trimmed, 'hi', 'ur');
    } else if (detectedSource === 'ur') {
      ur = trimmed;
      hi = await fetchGoogleTranslate(trimmed, 'ur', 'hi');
      en = await fetchGoogleTranslate(trimmed, 'ur', 'en');
    }

    const fallback = clientSideTransliterateFallback(trimmed, detectedSource);

    return res.status(200).json({
      success: true,
      translations: {
        hi: hi || fallback.hi || trimmed,
        en: en || fallback.en || trimmed,
        ur: ur || fallback.ur || trimmed
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
