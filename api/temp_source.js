// Client-Side Trilingual Transliteration & Translation Service for Chetna Digital Library
// Supports instantaneous and high-fidelity transliteration across Hindi (Devanagari), English (Latin), and Urdu (Perso-Arabic)

const LITERARY_DICTIONARY = {
  // Key Authors
  'munshi premchand': { hi: 'मुंशी प्रेमचंद', en: 'Munshi Premchand', ur: 'منشی پریم چند' },
  'premchand': { hi: 'मुंशी प्रेमचंद', en: 'Premchand', ur: 'پریم چند' },
  'bhagat singh': { hi: 'भगत सिंह', en: 'Bhagat Singh', ur: 'بھگت سنگھ' },
  'sohan singh josh': { hi: 'सोहन सिंह जोश', en: 'Sohan Singh Josh', ur: 'سوہن سنگھ جوش' },
  'sohan singh': { hi: 'सोहन सिंह', en: 'Sohan Singh', ur: 'سوہن سنگھ' },
  'kabir': { hi: 'संत कबीर', en: 'Kabir', ur: 'کبیر' },
  'sant kabir': { hi: 'संत कबीर', en: 'Sant Kabir', ur: 'سنت کبیر' },
  'rabindranath tagore': { hi: 'रवींद्रनाथ टैगोर', en: 'Rabindranath Tagore', ur: 'رابندر ناتھ ٹیگور' },
  'tagore': { hi: 'रवींद्रनाथ टैगोर', en: 'Rabindranath Tagore', ur: 'ٹیگور' },
  'mir anees': { hi: 'मीर अनीस', en: 'Mir Anees', ur: 'میر انیس' },
  'anees': { hi: 'मीर अनीस', en: 'Mir Anees', ur: 'میر انیس' },
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

  // Key Classics & Treatise Titles
  'godan': { hi: 'गोदान', en: 'Godan', ur: 'گودان' },
  'gaban': { hi: 'ग़बन', en: 'Gaban', ur: 'غبن' },
  'nirmala': { hi: 'निर्मला', en: 'Nirmala', ur: 'نرملہ' },
  'karmabhoomi': { hi: 'कर्मभूमि', en: 'Karmabhoomi', ur: 'کرم بھومی' },
  'rangbhoomi': { hi: 'रंगभूमि', en: 'Rangbhoomi', ur: 'رنگ بھومی' },
  'sevasadan': { hi: 'सेवासदन', en: 'Sevasadan', ur: 'سوا سدن' },
  'mansarovar': { hi: 'मानसरोवर', en: 'Mansarovar', ur: 'مانسروور' },
  'idgah': { hi: 'ईदगाह', en: 'Idgah', ur: 'عیدگاہ' },
  'poos ki raat': { hi: 'पूस की रात', en: 'Poos Ki Raat', ur: 'پوس کی رات' },
  'do bailon ki katha': { hi: 'दो बैलों की कथा', en: 'Do Baillon Ki Katha', ur: 'دو بیلوں کی کہانی' },
  'madhushala': { hi: 'मधुशाला', en: 'Madhushala', ur: 'مدھوشالا' },
  'kamayani': { hi: 'कामायनी', en: 'Kamayani', ur: 'کامایانی' },
  'rashmirathi': { hi: 'रश्मिरथी', en: 'Rashmirathi', ur: 'رشمیرتھ' },
  'kurukshetra': { hi: 'कुरुक्षेत्र', en: 'Kurukshetra', ur: 'کروکشیتر' },
  'raag darbari': { hi: 'राग दरबारी', en: 'Raag Darbari', ur: 'راگ درباری' },
  'tamas': { hi: 'तमस', en: 'Tamas', ur: 'تمس' },
  'maila aanchal': { hi: 'मैला आंचल', en: 'Maila Aanchal', ur: 'میلا آنچل' },
  'maila anchal': { hi: 'मैला आंचल', en: 'Maila Aanchal', ur: 'میلا آنچل' },
  'gitanjali': { hi: 'गीतांजलि', en: 'Gitanjali', ur: 'گیتانجلی' },
  'my meetings with bhagat singh': { hi: 'माई मीटिंग्स विद भगत सिंह', en: 'My Meetings with Bhagat Singh', ur: 'مائی میٹنگز ود بھگت سنگھ' },
  'marsiya e anees': { hi: 'मर्सिया-ए-अनीस', en: 'Marsiya-e-Anees', ur: 'مرثیہ انیس' },
  'diwan e ghalib': { hi: 'दीवान-ए-ग़ालिब', en: 'Diwan-e-Ghalib', ur: 'دیوان غالب' },
  'kulliyat e faiz': { hi: 'कुल्लियात-ए-फ़ैज़', en: 'Kulliyat-e-Faiz', ur: 'کلیات فیض' }
};

const translitCache = new Map();

/**
 * Detect script / language of input string
 * Returns 'hi' (Devanagari), 'ur' (Perso-Arabic), or 'en' (Latin)
 */
export function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'en';
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  if (/[\u0600-\u06FF]/.test(text)) return 'ur';
  return 'en';
}

/**
 * Check if the text matches a known literary title or author
 */
function lookupDictionary(text) {
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

/**
 * Google Input Tools Transliteration (Phonetic Latin -> Devanagari / Urdu)
 */
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

/**
 * Google Translate / Transliteration Single Call
 */
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

/**
 * Transliterate single token using Google Input Tools or dictionary
 */
async function transliterateToken(token, targetLang) {
  if (!token || !token.trim()) return token;
  if (/^[0-9.,:;!?'"()[\]\-_/\s]+$/.test(token)) return token;

  const direct = lookupDictionary(token);
  if (direct) return direct[targetLang] || token;

  // Try Google Input Tools
  const inputToolResult = await fetchGoogleInputTools(token, targetLang);
  if (inputToolResult) return inputToolResult;

  // Try Google Translate
  const gtx = await fetchGoogleTranslate(token, 'en', targetLang);
  if (gtx) return gtx;

  return token;
}

/**
 * Main function: Translates / Transliterates given text into all three languages: { hi, en, ur }
 */
export async function transliterateAll(text, sourceLangHint = 'auto') {
  if (!text || !text.trim()) {
    return { hi: '', en: '', ur: '' };
  }

  const trimmed = text.trim();
  const cacheKey = `${trimmed}_${sourceLangHint}`;
  if (translitCache.has(cacheKey)) {
    return translitCache.get(cacheKey);
  }

  // 1. Check exact dictionary match
  const dictMatch = lookupDictionary(trimmed);
  if (dictMatch) {
    const result = {
      hi: dictMatch.hi || trimmed,
      en: dictMatch.en || trimmed,
      ur: dictMatch.ur || trimmed
    };
    translitCache.set(cacheKey, result);
    return result;
  }

  // 2. Detect source language
  let srcLang = sourceLangHint;
  if (srcLang === 'auto' || !['hi', 'en', 'ur'].includes(srcLang)) {
    srcLang = detectLanguage(trimmed);
  }

  let hiResult = srcLang === 'hi' ? trimmed : '';
  let enResult = srcLang === 'en' ? trimmed : '';
  let urResult = srcLang === 'ur' ? trimmed : '';

  try {
    if (srcLang === 'en') {
      // Transliterate English -> Hindi & Urdu
      const [hiTokens, urTokens, hiGtx, urGtx] = await Promise.all([
        Promise.all(trimmed.split(/(\s+|[.,:;!?'"()[\]\-_/]+)/).map(t => transliterateToken(t, 'hi'))),
        Promise.all(trimmed.split(/(\s+|[.,:;!?'"()[\]\-_/]+)/).map(t => transliterateToken(t, 'ur'))),
        fetchGoogleTranslate(trimmed, 'en', 'hi'),
        fetchGoogleTranslate(trimmed, 'en', 'ur')
      ]);

      const hiTokenStr = hiTokens.join('');
      const urTokenStr = urTokens.join('');

      hiResult = hiTokenStr || hiGtx || trimmed;
      urResult = urTokenStr || urGtx || trimmed;
      enResult = trimmed;

    } else if (srcLang === 'hi') {
      // Hindi (Devanagari) -> English & Urdu
      const [enGtx, urGtx] = await Promise.all([
        fetchGoogleTranslate(trimmed, 'hi', 'en'),
        fetchGoogleTranslate(trimmed, 'hi', 'ur')
      ]);

      hiResult = trimmed;
      enResult = enGtx || trimmed;
      urResult = urGtx || trimmed;

    } else if (srcLang === 'ur') {
      // Urdu (Nastaliq) -> Hindi & English
      const [hiGtx, enGtx] = await Promise.all([
        fetchGoogleTranslate(trimmed, 'ur', 'hi'),
        fetchGoogleTranslate(trimmed, 'ur', 'en')
      ]);

      urResult = trimmed;
      hiResult = hiGtx || trimmed;
      enResult = enGtx || trimmed;
    }

  } catch (err) {
    console.warn('Transliteration service exception:', err);
  }

  // Final sanity fallbacks so we never return empty strings
  const finalResult = {
    hi: hiResult || trimmed,
    en: enResult || trimmed,
    ur: urResult || trimmed
  };

  translitCache.set(cacheKey, finalResult);
  return finalResult;
}
