import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const BOOKS_FILE = path.join(DATA_DIR, 'books.json');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const initialCategories = [
  {
    "id": "novel",
    "name_hi": "उपन्यास और गल्प",
    "name_en": "Novel & Fiction",
    "name_ur": "ناول و فکشن",
    "subtitle_hi": "कथा-शिल्प, सामाजिक यथार्थ, महाकाव्यात्मक आख्यान व कालजयी उपन्यास",
    "subtitle_en": "Epic narratives, social realism, historical chronicles & human journeys",
    "subtitle_ur": "معاشرتی حقیقت نگاری، تاریخی و نفسیاتی ناول",
    "icon": "BookOpen",
    "color": "#b45309",
    "genres": [
      {
        "id": "social-realism",
        "name_hi": "सामाजिक यथार्थवादी उपन्यास",
        "name_en": "Social Realism",
        "name_ur": "سماجی حقیقت نگاری",
        "description_hi": "सामंतवाद, जाति संघर्ष, ग्रामीण-शहरी असमानता व श्रमिक जीवन का यथार्थवादी चित्रण",
        "description_en": "Feudalism, caste dynamics, rural-urban inequality, and working-class realities",
        "subgenres": [
          {
            "id": "agrarian-peasantry",
            "name_hi": "कृषक व ग्रामीण यथार्थ",
            "name_en": "Agrarian Struggles & Peasantry",
            "name_ur": "دیہی و کسان جدوجہد"
          },
          {
            "id": "feudal-critique",
            "name_hi": "सामंतवाद व ज़मींदारी विरोध",
            "name_en": "Anti-Feudal & Landlordism Critique",
            "name_ur": "جاگیرداری نظام کے خلاف"
          },
          {
            "id": "labor-working-class",
            "name_hi": "मजदूर चेतना व श्रमिक संघर्ष",
            "name_en": "Labor & Working-Class Realities",
            "name_ur": "مزدور اور محنت کش طبقہ"
          },
          {
            "id": "caste-inequality",
            "name_hi": "जाति व वर्ग चेतना",
            "name_en": "Caste & Social Hierarchy",
            "name_ur": "ذات پات اور طبقاتی کشمکش"
          },
          {
            "id": "urban-alienation",
            "name_hi": "शहरी मध्यवर्गीय विसंगति",
            "name_en": "Urban Middle-Class Disillusionment",
            "name_ur": "شہری متوسط طبقے کا احساسِ بیگانگی"
          }
        ]
      },
      {
        "id": "historical-fiction",
        "name_hi": "ऐतिहासिक उपन्यास",
        "name_en": "Historical Fiction",
        "name_ur": "تاریخی ناول",
        "description_hi": "स्वाधीनता संग्राम, प्राचीन साम्राज्य, मुग़ल व औपनिवेशिक काल के ऐतिहासिक आख्यान",
        "description_en": "Freedom struggles, ancient civilizations, empires, and documented history",
        "subgenres": [
          {
            "id": "freedom-struggle",
            "name_hi": "स्वाधीनता आंदोलन व राष्ट्रीय चेतना",
            "name_en": "Freedom Movement & National Awakening",
            "name_ur": "تحریکِ آزادی اور قومی بیداری"
          },
          {
            "id": "medieval-empires",
            "name_hi": "मध्यकालीन इतिहास व सल्तनत काल",
            "name_en": "Medieval Empires & Sultanates",
            "name_ur": "قرونِ وسطیٰ کی سلطنتیں"
          },
          {
            "id": "partition-chronicles",
            "name_hi": "विभाजन त्रासदी व विस्थापन",
            "name_en": "Partition Chronicles & Trauma",
            "name_ur": "تقسیم کے المیے اور ہجرت"
          },
          {
            "id": "renaissance-epoch",
            "name_hi": "भारतीय पुनर्जागरण व सुधार काल",
            "name_en": "Indian Renaissance & Reforms",
            "name_ur": "ہندوستانی نشاۃِ ثانیہ"
          }
        ]
      },
      {
        "id": "psychological-modernist",
        "name_hi": "मनोवैज्ञानिक व आधुनिक गल्प",
        "name_en": "Psychological & Modernist",
        "name_ur": "نفسیاتی و جدیدیت پسند فکشن",
        "description_hi": "चेतना प्रवाह, अंतर्द्वंद्व, अस्तित्ववादी संत्रास व आधुनिक मानवीय अनुभूतियाँ",
        "description_en": "Stream of consciousness, existential alienation, and inner psychological monologues",
        "subgenres": [
          {
            "id": "stream-of-consciousness",
            "name_hi": "चेतना प्रवाह व आंतरिक संवाद",
            "name_en": "Stream of Consciousness",
            "name_ur": "شعور کی رو اور باطنی مکالمے"
          },
          {
            "id": "existential-alienation",
            "name_hi": "अस्तित्ववादी संत्रास व अकेलापन",
            "name_en": "Existential Alienation & Loneliness",
            "name_ur": "وجودیت اور تنہائی کا کرب"
          },
          {
            "id": "psychoanalytic-prose",
            "name_hi": "मनोविश्लेषणात्मक आख्यान",
            "name_en": "Psychoanalytic Narratives",
            "name_ur": "نفسیاتی تجزیاتی نثر"
          }
        ]
      },
      {
        "id": "regional-aanchalik",
        "name_hi": "आंचलिक उपन्यास व लोक-जीवन",
        "name_en": "Regional & Aanchalik",
        "name_ur": "علاقائی و آنچلِک ناول",
        "description_hi": "अंचल विशेष का भूगोल, देशज बोलियाँ, लोक-संस्कृति व जन-जीवन का सजीव चित्रण",
        "description_en": "Deeply rooted rural settings, local dialects, folklore, and indigenous regional geographies",
        "subgenres": [
          {
            "id": "folk-geography",
            "name_hi": "लोक-भूगोल व अंचल की गाथा",
            "name_en": "Regional Folklore & Landscape",
            "name_ur": "علاقائی جغرافیہ اور روایات"
          },
          {
            "id": "dialect-narratives",
            "name_hi": "देशज भाषा व लोक-संस्कृति",
            "name_en": "Vernacular Dialect Narratives",
            "name_ur": "دیسی زبان اور لوک کلچر"
          },
          {
            "id": "tribal-pastoral",
            "name_hi": "जनजातीय व चरवाहा जीवन",
            "name_en": "Tribal & Pastoral Life",
            "name_ur": "قبائلی اور چرواہا زندگی"
          }
        ]
      },
      {
        "id": "novellas",
        "name_hi": "लघु उपन्यास व दीर्घ गल्प",
        "name_en": "Novellas & Long Prose",
        "name_ur": "مختصر ناول و طویل افسانے",
        "description_hi": "तीव्र संवेदना, एकाग्र कथानक व सघन सामाजिक-वैचारिक लघु उपन्यास",
        "description_en": "Concentrated long-form prose, philosophical novellas, and compact epic tales",
        "subgenres": [
          {
            "id": "chamber-novellas",
            "name_hi": "एकाग्र लघु उपन्यास",
            "name_en": "Chamber Novellas",
            "name_ur": "مرکوز مختصر ناول"
          },
          {
            "id": "philosophical-novellas",
            "name_hi": "दार्शनिक व प्रतीकात्मक लघु उपन्यास",
            "name_en": "Philosophical & Symbolic Novellas",
            "name_ur": "فلسفیانہ و علامتی ناولیٹ"
          }
        ]
      }
    ]
  },
  {
    "id": "story",
    "name_hi": "कहानी और आख्यान",
    "name_en": "Story & Narrative",
    "name_ur": "کہانی و افسانہ",
    "subtitle_hi": "कालजयी कहानियाँ, नई कहानी, लघुकथाएँ, दास्तानगोई व आख्यान",
    "subtitle_en": "Classic short stories, Nayi Kahani, folklore, micro-fiction & memoirs",
    "subtitle_ur": "لازوال افسانے، نئی کہانی اور داستانوی ادب",
    "icon": "Scroll",
    "color": "#047857",
    "genres": [
      {
        "id": "classic-short-story",
        "name_hi": "कालजयी कहानियाँ",
        "name_en": "Classic Short Story",
        "name_ur": "کلاسیکی افسانہ",
        "description_hi": "प्रेमचंद, मंटो, बेदी परंपरा का आदर्शोन्मुख एवं यथार्थवादी कथा-साहित्य",
        "description_en": "Traditional plot-driven classic stories of Premchand, Manto, and Bedi tradition",
        "subgenres": [
          {
            "id": "premchand-tradition",
            "name_hi": "प्रेमचंद कथा परंपरा",
            "name_en": "Premchandian Realism",
            "name_ur": "پریم چند کی افسانوی روایت"
          },
          {
            "id": "idealistic-realism",
            "name_hi": "आदर्शोन्मुख यथार्थवाद",
            "name_en": "Idealistic Realism",
            "name_ur": "حقیقت نگاری و اخلاقی اقدار"
          },
          {
            "id": "social-justice-stories",
            "name_hi": "सामाजिक चेतना कथाएँ",
            "name_en": "Social Justice Stories",
            "name_ur": "سماجی انصاف کی کہانیاں"
          }
        ]
      },
      {
        "id": "nayi-kahani",
        "name_hi": "नई कहानी व समकालीन यथार्थ",
        "name_en": "Nayi Kahani & Modern Realism",
        "name_ur": "نئی کہانی اور عصری احساس",
        "description_hi": "आज़ादी के बाद का मोहभंग, मध्यवर्गीय नैतिकता, जटिल मानवीय रिश्ते व अकेलापन",
        "description_en": "Post-1947 disillusionment, urban breakdown, and complex modern relationships",
        "subgenres": [
          {
            "id": "urban-loneliness",
            "name_hi": "शहरी अकेलापन व अजनबीपन",
            "name_en": "Urban Alienation & Loneliness",
            "name_ur": "شہری تنہائی اور بیگانگی"
          },
          {
            "id": "relationship-complexes",
            "name_hi": "संबंधों की अंतर्गुंफित जटिलता",
            "name_en": "Relationship Complexes",
            "name_ur": "انسانی رشتوں کی الجھنیں"
          },
          {
            "id": "post-independence-disillusion",
            "name_hi": "स्वातंत्र्योत्तर मोहभंग",
            "name_en": "Post-Independence Disillusionment",
            "name_ur": "آزادی کے بعد کا موہ بھنگ"
          }
        ]
      },
      {
        "id": "folk-tales-oral",
        "name_hi": "लोक कथाएँ व दास्तानगोई",
        "name_en": "Folk Tales & Dastangoi",
        "name_ur": "لوک کہانیاں و داستان گوئی",
        "description_hi": "दास्तानगोई, लोक गाथाएँ, नीति कथाएँ, परियों व साहसिक किस्सागोई",
        "description_en": "Dastangoi, fables, oral narrative heritage, and traditional myths",
        "subgenres": [
          {
            "id": "dastangoi-epics",
            "name_hi": "दास्तानगोई व किस्सागोई",
            "name_en": "Dastangoi & Oral Epics",
            "name_ur": "داستان گوئی اور طلسمات"
          },
          {
            "id": "moral-fables",
            "name_hi": "बोधकथाएँ व दृष्टांत",
            "name_en": "Moral Fables & Parables",
            "name_ur": "تمثیلی و اخلاقی حکایات"
          },
          {
            "id": "mythological-tales",
            "name_hi": "पौराणिक व लोक आख्यान",
            "name_en": "Mythological & Folk Lore",
            "name_ur": "روایتی لوک کہانیاں"
          }
        ]
      },
      {
        "id": "flash-fiction",
        "name_hi": "लघुकथा व सूक्ष्म आख्यान",
        "name_en": "Flash Fiction & Laghukatha",
        "name_ur": "مائیکرو فکشن و مختصر کہانیاں",
        "description_hi": "कम शब्दों में तीखा सामाजिक प्रहार, सूक्ष्म व्यंग्य एवं नैतिक झलकियाँ",
        "description_en": "Micro-fiction, sharp moral tales, and single-scene narratives (laghukatha)",
        "subgenres": [
          {
            "id": "socio-satirical-micro",
            "name_hi": "सामाजिक व्यंग्य लघुकथाएँ",
            "name_en": "Socio-Satirical Micro Fiction",
            "name_ur": "سماجی طنزیہ مائیکرو فکشن"
          },
          {
            "id": "philosophical-vignettes",
            "name_hi": "दार्शनिक सूत्र कथाएँ",
            "name_en": "Philosophical Vignettes",
            "name_ur": "فلسفیانہ و فکری خاکے"
          }
        ]
      },
      {
        "id": "memoir-stories",
        "name_hi": "संस्मरणात्मक कथाएँ",
        "name_en": "Memoir Stories",
        "name_ur": "یادداشتوں پر مبنی کہانیاں",
        "description_hi": "व्यक्तिगत स्मृतियों, बीती घटनाओं व बीसवीं सदी के जीवन-चित्रों पर आधारित कथाएँ",
        "description_en": "Semi-autobiographical reflections, nostalgia, and memory-driven narratives",
        "subgenres": [
          {
            "id": "childhood-nostalgia",
            "name_hi": "बाल्य स्मृति कथाएँ",
            "name_en": "Childhood Nostalgia",
            "name_ur": "بچپن کی یادیں"
          },
          {
            "id": "life-portraits",
            "name_hi": "व्यक्ति-चित्र व जीवन-झांकी",
            "name_en": "Life Portraits & Sketches",
            "name_ur": "شخصی خاکے اور جھلکیاں"
          }
        ]
      }
    ]
  },
  {
    "id": "poetry",
    "name_hi": "कविता, शायरी और पद्य",
    "name_en": "Poetry & Verse",
    "name_ur": "شاعری، نظم و مرثیہ",
    "subtitle_hi": "ग़ज़ल, नज़्म, मर्सिया, दोहे, मुक्तछंद, रुबाइयात व प्रतिरोध काव्य",
    "subtitle_en": "Ghazals, Nazms, Marsiya, Doha, Free Verse, Rubaiyat & Protest Poetry",
    "subtitle_ur": "غزلیات، منظومات، مرثیہ، دوہے اور انقلابی کلام",
    "icon": "Feather",
    "color": "#7e22ce",
    "genres": [
      {
        "id": "ghazal",
        "name_hi": "ग़ज़ल व कसीदा",
        "name_en": "Ghazal & Odes",
        "name_ur": "غزل و قصیدہ",
        "description_hi": "मीर, ग़ालिब, फ़ैज़ परंपरा की शास्त्रीय एवं समकालीन ग़ज़लें व अशआर",
        "description_en": "Coupled rhyming structures (matla, maqta, radif, qafiya, beher) and lyricism",
        "subgenres": [
          {
            "id": "classical-ghazal",
            "name_hi": "शास्त्रीय उर्दू ग़ज़ल",
            "name_en": "Classical Urdu Ghazal",
            "name_ur": "کلاسیکی اردو غزل"
          },
          {
            "id": "progressive-ghazal",
            "name_hi": "प्रगतिशील दौर की ग़ज़ल",
            "name_en": "Progressive Era Ghazal",
            "name_ur": "ترقی پسند غزل"
          },
          {
            "id": "contemporary-ghazal",
            "name_hi": "समकालीन हिंदी-उर्दू ग़ज़ल",
            "name_en": "Contemporary Ghazal",
            "name_ur": "عصری غزل"
          },
          {
            "id": "qasida-odes",
            "name_hi": "क़सीदा व प्रशस्ति काव्य",
            "name_en": "Qasida & Poetic Odes",
            "name_ur": "قصیدہ نگاری"
          }
        ]
      },
      {
        "id": "nazm",
        "name_hi": "नज़्म व छंदबद्ध काव्य",
        "name_en": "Nazm & Thematic Verse",
        "name_ur": "نظم و منظومات",
        "description_hi": "इक़बाल, साहिर, कैफ़ी, मख़दूम की विषय-प्रधान व सामाजिक नज़्में",
        "description_en": "Single-subject thematic verse, free verse (azad nazm), and blank verse",
        "subgenres": [
          {
            "id": "thematic-nazm",
            "name_hi": "वैचारिक व सामाजिक नज़्म",
            "name_en": "Thematic & Social Nazm",
            "name_ur": "فکری و سماجی نظمیں"
          },
          {
            "id": "azad-nazm",
            "name_hi": "आज़ाद नज़्म व आधुनिक शिल्प",
            "name_en": "Azad Nazm (Free Metric)",
            "name_ur": "آزاد نظم"
          },
          {
            "id": "lyrical-soliloquies",
            "name_hi": "भावपूर्ण व आत्मपरक नज़्म",
            "name_en": "Lyrical Soliloquies",
            "name_ur": "جذباتی و انفرادی نظمیں"
          }
        ]
      },
      {
        "id": "traditional-forms",
        "name_hi": "पारंपरिक छंद व भक्ति काव्य",
        "name_en": "Traditional Metric & Bhakti",
        "name_ur": "روایتی اصناف، دوہے و گیت",
        "description_hi": "कबीर, तुलसी, रहीम के दोहे, सूर-मीरा के पद, चौपाई, गीत व नवगीत",
        "description_en": "Geet, Doha, Chaupai, Pad, and traditional metric devotional compositions",
        "subgenres": [
          {
            "id": "bhakti-dohas",
            "name_hi": "भक्तिकाल के दोहे व साखियाँ",
            "name_en": "Bhakti Dohas & Sakhiyan",
            "name_ur": "بھکتی کال کے دوہے"
          },
          {
            "id": "sufi-kalam",
            "name_hi": "सूफ़ी कलाम व काफ़ियाँ",
            "name_en": "Sufi Mystical Verse",
            "name_ur": "صوفیانہ کلام و کافیاں"
          },
          {
            "id": "geet-navgeet",
            "name_hi": "गीत व नवगीत",
            "name_en": "Lyrical Geet & Navgeet",
            "name_ur": "گیت اور نو گیت"
          }
        ]
      },
      {
        "id": "elegy-marsiya",
        "name_hi": "मर्सिया, नौहा व शोक काव्य",
        "name_en": "Elegy, Marsiya & Soz",
        "name_ur": "مرثیہ، نوحہ و سوز",
        "description_hi": "मीर अनीस व मिर्ज़ा दबीर की मुसद्दस मर्सिया निगारी, नौहा, सोज़ व शहादत विमर्श",
        "description_en": "Mourning verse, elegies, classical Marsiya, Nauha, and devotional Soz",
        "subgenres": [
          {
            "id": "classical-marsiya",
            "name_hi": "शास्त्रीय मुसद्दस मर्सिया",
            "name_en": "Classical Musaddas Marsiya",
            "name_ur": "کلاسیکی مسدس مرثیہ"
          },
          {
            "id": "soz-khwani",
            "name_hi": "सोज़ व सलाम",
            "name_en": "Soz-Khwani & Salaam",
            "name_ur": "سوز خوانی و سلام"
          },
          {
            "id": "nauha-mourning",
            "name_hi": "नौहा व मातमी काव्य",
            "name_en": "Nauha & Mourning Verses",
            "name_ur": "نوحہ اور ماتمی کلام"
          },
          {
            "id": "resistance-martyrdom",
            "name_hi": "शहादत व प्रतिरोध विमर्श",
            "name_en": "Martyrdom & Resistance Discourse",
            "name_ur": "شہادت اور مزاحمتی شعور"
          }
        ]
      },
      {
        "id": "modern-free-verse",
        "name_hi": "समकालीन मुक्तछंद व नई कविता",
        "name_en": "Modern Free Verse & Protest",
        "name_ur": "جدید آزاد نظم و مزاحمتی شاعری",
        "description_hi": "मुक्तिबोध, अज्ञेय, नागार्जुन, पाश, धूमिल की जन-प्रतिरोध एवं समकालीन कविताएँ",
        "description_en": "Contemporary free verse (Nai Kavita), resistance verse, and experimental poetry",
        "subgenres": [
          {
            "id": "nai-kavita-protest",
            "name_hi": "नई कविता व जन-प्रतिरोध",
            "name_en": "Nai Kavita & Social Protest",
            "name_ur": "نئی کَوِتا اور عوامی مزاحمت"
          },
          {
            "id": "revolutionary-verse",
            "name_hi": "इंक़लाबी व जनवादी कविता",
            "name_en": "Revolutionary Peoples Verse",
            "name_ur": "انقلابی و عوامی شاعری"
          }
        ]
      },
      {
        "id": "rubaiyat-qataat",
        "name_hi": "रुबाइयात व क़तआत",
        "name_en": "Rubaiyat & Qataat",
        "name_ur": "رباعیات و قطعات",
        "description_hi": "चार पंक्तियों का दार्शनिक छंद (रुबाई) व संक्षिप्त काव्य खंड (क़तआ)",
        "description_en": "Standalone quatrains, rubaiyat, and concise poetic fragments",
        "subgenres": [
          {
            "id": "rubai-quatrains",
            "name_hi": "रुबाई व दार्शनिक चौपाइयाँ",
            "name_en": "Rubaiyat Quatrains",
            "name_ur": "رباعیاتِ حکمت"
          },
          {
            "id": "qata-fragments",
            "name_hi": "क़तआत व पद्य खंड",
            "name_en": "Qataat Fragments",
            "name_ur": "قطعات و اخلاقی اشعار"
          }
        ]
      }
    ]
  },
  {
    "id": "magazines",
    "name_hi": "पत्रिकाएँ एवं सामयिकी",
    "name_en": "Magazines & Periodicals",
    "name_ur": "رسائل و جرائد",
    "subtitle_hi": "साहित्यिक पत्रिकाएँ, विशेषांक, आंदोलन बुलेटिन व ऐतिहासिक पुरालेख",
    "subtitle_en": "Literary periodicals, cultural manifestos, special retrospectives & heritage archives",
    "subtitle_ur": "ادبی رسائل، خصوصی شمارے اور تاریخی دستاویزات",
    "icon": "Newspaper",
    "color": "#0284c7",
    "genres": [
      {
        "id": "literary-periodicals",
        "name_hi": "साहित्यिक पत्रिकाएँ व नियमित अंक",
        "name_en": "Literary Periodicals",
        "name_ur": "ادبی جرائد و ماہنامے",
        "description_hi": "हंस, पहल, कथादेश, नया ज्ञानोदय, जनमत, चहारसू जैसी ऐतिहासिक साहित्यिक पत्रिकाएँ",
        "description_en": "Literary journals, fiction monthlies, and poetry quarterlies",
        "subgenres": [
          {
            "id": "monthly-issues",
            "name_hi": "मासिक नियमित अंक",
            "name_en": "Monthly Regular Issues",
            "name_ur": "ماہنامہ باقاعدہ شمارے"
          },
          {
            "id": "quarterly-journals",
            "name_hi": "त्रैमासिक शोध पत्रिकाएँ",
            "name_en": "Quarterly Research Journals",
            "name_ur": "سہ ماہی تحقیقی مجلے"
          },
          {
            "id": "little-magazines",
            "name_hi": "लघु पत्रिका आंदोलन (Little Magazines)",
            "name_en": "Little Magazine Movement",
            "name_ur": "لٹل میگزین تحریک"
          }
        ]
      },
      {
        "id": "cultural-manifestos",
        "name_hi": "सांस्कृतिक व आंदोलन बुलेटिन",
        "name_en": "Cultural & Movement Bulletins",
        "name_ur": "فکری و تحریکی رسائل",
        "description_hi": "प्रगतिशील लेखक संघ, इप्टा, दलित-आदिवासी जन-आंदोलनों के वैचारिक बुलेटिन",
        "description_en": "Movement bulletins, progressive little magazines, and cultural manifestos",
        "subgenres": [
          {
            "id": "progressive-bulletins",
            "name_hi": "प्रगतिशील लेखक संघ व इप्टा बुलेटिन",
            "name_en": "PWA & IPTA Bulletins",
            "name_ur": "ترقی پسند مصنفین و اپٹا بلیٹن"
          },
          {
            "id": "theatre-periodicals",
            "name_hi": "रंगमंच व नाट्य पत्रिकाएँ",
            "name_en": "Theatre & Performance Periodicals",
            "name_ur": "تھیٹر اور ڈرامائی رسائل"
          }
        ]
      },
      {
        "id": "special-editions",
        "name_hi": "विशेषांक व स्मृति ग्रंथ",
        "name_en": "Special & Memorial Editions",
        "name_ur": "خصوصی و یادگاری نمبر",
        "description_hi": "लेखक विशेषांक, शताब्दी अंक, विषय-विशेष समीक्षा अंक व स्मारक ग्रंथ",
        "description_en": "Author memorial issues (Visheshank), centenary retrospectives, and topic monographs",
        "subgenres": [
          {
            "id": "author-memorial-editions",
            "name_hi": "लेखक स्मृति विशेषांक",
            "name_en": "Author Memorial Editions",
            "name_ur": "مصنف یادگاری نمبر"
          },
          {
            "id": "centenary-retrospectives",
            "name_hi": "शताब्दी व ऐतिहासिक विशेषांक",
            "name_en": "Centenary & Epoch Retrospectives",
            "name_ur": "صدی اور تاریخی نمبر"
          }
        ]
      },
      {
        "id": "historical-archives",
        "name_hi": "दुर्लभ ऐतिहासिक अभिलेख",
        "name_en": "Historical Archives",
        "name_ur": "نایاب تاریخی آرکائیوز",
        "description_hi": "स्वाधीनता पूर्व (1947 से पहले) की मुद्रित पत्रिकाएँ, सरस्वती, ज़माना, प्रताप",
        "description_en": "Rare pre-1947 print archives, vintage periodicals, and scanned heritage prints",
        "subgenres": [
          {
            "id": "pre-independence-scans",
            "name_hi": "स्वाधीनता-पूर्व पत्रिकाएँ (Pre-1947)",
            "name_en": "Pre-Independence Print Archives",
            "name_ur": "قبل از آزادی کے نایاب شمارے"
          },
          {
            "id": "heritage-literary-prints",
            "name_hi": "दुर्लभ धरोहर अंक",
            "name_en": "Heritage Scanned Journals",
            "name_ur": "قلمی و نایاب رسائل"
          }
        ]
      }
    ]
  },
  {
    "id": "vimarsh",
    "name_hi": "विमर्श एवं सांस्कृतिक संवाद",
    "name_en": "Discussion & Cultural Discourse",
    "name_ur": "مباحث و فکری مکالمہ",
    "subtitle_hi": "दलित चेतना, स्त्री विमर्श, आदिवासी अधिकार, पर्यावरण व वैचारिक संवाद",
    "subtitle_en": "Dalit identity, feminist studies, indigenous rights, ecology & dialogues",
    "subtitle_ur": "دلت شعور، نسائی مباحث، قبائلی فکر اور فکری مکالمات",
    "icon": "MessagesSquare",
    "color": "#e11d48",
    "genres": [
      {
        "id": "dalit-discourse",
        "name_hi": "दलित चेतना व अस्मिता विमर्श",
        "name_en": "Dalit Discourse & Identity",
        "name_ur": "دلت شعور اور فکری مباحث",
        "description_hi": "जाति-विरोधी विमर्श, डॉ. आंबेडकर दर्शन, सामाजिक मुक्ति एवं दलित आत्मकथाएँ",
        "description_en": "Anti-caste discourse, Dalit identity, resistance, and social liberation critiques",
        "subgenres": [
          {
            "id": "ambedkarite-thought",
            "name_hi": "आंबेडकरवादी दर्शन व सिद्धांत",
            "name_en": "Ambedkarite Philosophy & Social Justice",
            "name_ur": "امبیڈکر وادی فکر و فلسفہ"
          },
          {
            "id": "dalit-literature-critique",
            "name_hi": "दलित साहित्य व सौंदर्यशास्त्र",
            "name_en": "Dalit Literary Aesthetics",
            "name_ur": "دلت ادبی جمالیات"
          },
          {
            "id": "anti-caste-critique",
            "name_hi": "जाति-उन्मूलन व सामाजिक मुक्ति",
            "name_en": "Annihilation of Caste & Liberation",
            "name_ur": "انسدادِ ذات پات اور سماجی آزادی"
          }
        ]
      },
      {
        "id": "gender-feminist",
        "name_hi": "स्त्री विमर्श व लैंगिक समता",
        "name_en": "Gender & Feminist Perspectives",
        "name_ur": "نسائی مباحث و حقوقِ نسواں",
        "description_hi": "पितृसत्ता विरोध, महिला अधिकार, स्त्री आत्मकथाएँ व लैंगिक समानता विमर्श",
        "description_en": "Feminist theory, women's agency, queer perspectives, and anti-patriarchy writings",
        "subgenres": [
          {
            "id": "patriarchy-critique",
            "name_hi": "पितृसत्ता विरोध व संरचनात्मक विमर्श",
            "name_en": "Critique of Patriarchy",
            "name_ur": "پدر شاہی نظام کی مخالفت"
          },
          {
            "id": "women-agency",
            "name_hi": "स्त्री अस्मिता, श्रम व स्वावलंबन",
            "name_en": "Women's Agency & Selfhood",
            "name_ur": "عورت کا وجود اور خود مختاری"
          },
          {
            "id": "queer-perspectives",
            "name_hi": "क्वीर व समावेशी अध्ययन",
            "name_en": "Queer & Inclusive Studies",
            "name_ur": "شمولیاتی و صنفی مباحث"
          }
        ]
      },
      {
        "id": "adivasi-indigenous",
        "name_hi": "आदिवासी व मूलनिवासी विमर्श",
        "name_en": "Adivasi & Indigenous Rights",
        "name_ur": "قبائلی شعور اور وسائل کے حقوق",
        "description_hi": "जल-जंगल-ज़मीन, जनजातीय अस्मिता, लोक-ज्ञान व विस्थापन विरोधी विमर्श",
        "description_en": "Indigenous rights, tribal identity, water/forest/land (Jal-Jangal-Jameen) critique",
        "subgenres": [
          {
            "id": "jal-jangal-jameen",
            "name_hi": "जल-जंगल-ज़मीन व स्वायत्तता",
            "name_en": "Jal-Jangal-Jameen & Autonomy",
            "name_ur": "جل، جنگل، زمین کے حقوق"
          },
          {
            "id": "tribal-identity-culture",
            "name_hi": "आदिवासी संस्कृति, दर्शन व भाषा",
            "name_en": "Tribal Philosophy & Oral Heritage",
            "name_ur": "قبائلی تہذیب اور شناخت"
          }
        ]
      },
      {
        "id": "environmental-thought",
        "name_hi": "पर्यावरण चेतना व पारिस्थितिकी",
        "name_en": "Environmental & Ecological Thought",
        "name_ur": "ماحولیاتی شعور و فکر",
        "description_hi": "जलवायु संकट, नदी-पहाड़ संरक्षण, जैव-विविधता व पर्यावरण दर्शन",
        "description_en": "Ecology, climate crisis, rural displacements, and environmental philosophy",
        "subgenres": [
          {
            "id": "ecological-justice",
            "name_hi": "पारिस्थितिकी न्याय व प्रकृति संरक्षण",
            "name_en": "Ecological Justice & Nature",
            "name_ur": "ماحولیاتی انصاف اور تحفظ"
          },
          {
            "id": "rural-displacement",
            "name_hi": "विस्थापन, बाँध व जन-संघर्ष",
            "name_en": "Displacement & Peoples Struggles",
            "name_ur": "بے دخلی اور عوامی جدوجہد"
          }
        ]
      },
      {
        "id": "interviews-dialogues",
        "name_hi": "दीर्घ साक्षात्कार व वैचारिक संवाद",
        "name_en": "Interviews & Dialogues",
        "name_ur": "طویل انٹرویوز اور مکالمے",
        "description_hi": "प्रमुख चिंतकों, लेखकों, समाजकर्मियों के साथ गंभीर प्रश्नोत्तरी व संवाद",
        "description_en": "Long-form conversations, interviews, and intellectual debates",
        "subgenres": [
          {
            "id": "author-conversations",
            "name_hi": "साहित्यकार व विचारक साक्षात्कार",
            "name_en": "Author & Thinker Interviews",
            "name_ur": "اہلِ قلم کے مکالمے"
          },
          {
            "id": "intellectual-debates",
            "name_hi": "वैचारिक गोष्ठी व परिसंवाद",
            "name_en": "Intellectual Debates & Seminars",
            "name_ur": "فکری مباحثے اور سمپوزیم"
          }
        ]
      }
    ]
  },
  {
    "id": "cultural-conscience",
    "name_hi": "सांस्कृतिक चेतना और विचार",
    "name_en": "Cultural Conscience & Thought",
    "name_ur": "ثقافتی شعور و فلسفہ",
    "subtitle_hi": "प्रगतिशील मानवतावाद, सौंदर्यशास्त्र, दार्शनिक इतिहास व नागरिक नैतिकता",
    "subtitle_en": "Progressive humanism, aesthetics criticism, intellectual history & civil ethics",
    "subtitle_ur": "انسانی اقدار، جمالیات، اخلاقی فکر اور تہذیبی تاریخ",
    "icon": "Brain",
    "color": "#1d4ed8",
    "genres": [
      {
        "id": "progressive-humanism",
        "name_hi": "प्रगतिशील मानवतावाद",
        "name_en": "Progressive Humanism",
        "name_ur": "ترقی پسند انسانیت پسندی",
        "description_hi": "धर्मनिरपेक्ष जनतंत्र, साझी विरासत, गंगा-जमुनी तहज़ीब व वैज्ञानिक चेतना",
        "description_en": "Democratic secular thought, composite culture, and socialist humanist values",
        "subgenres": [
          {
            "id": "secular-democracy",
            "name_hi": "धर्मनिरपेक्ष जनतंत्र व वैज्ञानिक सोच",
            "name_en": "Secular Democracy & Scientific Temper",
            "name_ur": "سیکولر جمہوریت اور سائنسی فکر"
          },
          {
            "id": "composite-culture",
            "name_hi": "साझा संस्कृति व सौहार्द",
            "name_en": "Composite Culture & Harmony",
            "name_ur": "مشترکہ تہذیب اور یگانگت"
          }
        ]
      },
      {
        "id": "aesthetics-criticism",
        "name_hi": "सौंदर्यशास्त्र व आलोचना",
        "name_en": "Aesthetics & Literary Criticism",
        "name_ur": "جمالیات و ادبی تنقید",
        "description_hi": "रस सिद्धांत, आधुनिक सौंदर्यशास्त्र, मार्क्सवादी आलोचना व साहित्य चिंतन",
        "description_en": "Rasa theory, progressive aesthetic frameworks, and literary critique",
        "subgenres": [
          {
            "id": "rasa-aesthetics",
            "name_hi": "रस सिद्धांत व काव्यशास्त्र",
            "name_en": "Classical Rasa Theory & Poetics",
            "name_ur": "رس سدھانت اور فنِ شاعری"
          },
          {
            "id": "marxist-literary-critique",
            "name_hi": "मार्क्सवादी व जनवादी आलोचना",
            "name_en": "Marxist Literary Criticism",
            "name_ur": "مارکسی و ترقی پسند تنقید"
          }
        ]
      },
      {
        "id": "intellectual-history",
        "name_hi": "वैचारिक व दार्शनिक इतिहास",
        "name_en": "Intellectual History",
        "name_ur": "فکری و فلسفیانہ تاریخ",
        "description_hi": "बौद्ध धम्म, लोकायत, चार्वाक, सांख्य, अद्वैत एवं मध्यकालीन सुधार आंदोलन",
        "description_en": "Bhakti movements, medieval philosophy, Buddhist thought, and renaissance traditions",
        "subgenres": [
          {
            "id": "buddhist-dhamma-thought",
            "name_hi": "बौद्ध दर्शन व धम्म चेतना",
            "name_en": "Buddhist Philosophy & Dhamma",
            "name_ur": "بدھ مت کا فلسفہ اور دھم"
          },
          {
            "id": "bhakti-reformation",
            "name_hi": "भक्ति आंदोलन व सामाजिक सुधार",
            "name_en": "Bhakti Movement & Social Reform",
            "name_ur": "بھکتی تحریک اور سماجی اصلاحات"
          }
        ]
      },
      {
        "id": "civil-society-ethics",
        "name_hi": "नागरिक चेतना व सामाजिक न्याय",
        "name_en": "Civil Society & Ethics",
        "name_ur": "شہری شعور اور سماجی انصاف",
        "description_hi": "संवैधानिक मूल्य, नागरिक अधिकार, बंधुता, समता एवं सामूहिक नैतिकता",
        "description_en": "Moral philosophy, civic rights, pluralism, and collective ethics",
        "subgenres": [
          {
            "id": "constitutional-morality",
            "name_hi": "संवैधानिक नैतिकता व बंधुता",
            "name_en": "Constitutional Morality & Fraternity",
            "name_ur": "آئینی اخلاقیات اور اخوت"
          },
          {
            "id": "human-rights-philosophy",
            "name_hi": "मानवाधिकार व सामाजिक समता",
            "name_en": "Human Rights & Social Equality",
            "name_ur": "انسانی حقوق اور سماجی برابری"
          }
        ]
      }
    ]
  },
  {
    "id": "drama",
    "name_hi": "नाटक और रंगमंच",
    "name_en": "Drama & Theatre",
    "name_ur": "ڈراما و اسٹیج",
    "subtitle_hi": "पूर्ण नाटक, एकल नाटक, नुक्कड़ नाटक, रेडियो नाटक व लोक रंगमंच",
    "subtitle_en": "Full-length plays, solo/one-act chamber scripts, street theatre & folk drama",
    "subtitle_ur": "اسٹیج ڈرامے، یک بابی تمثیل، نکڑ ناٹک اور لوک تھیٹر",
    "icon": "Theater",
    "color": "#c2410c",
    "genres": [
      {
        "id": "full-length-plays",
        "name_hi": "पूर्ण मंचीय नाटक",
        "name_en": "Full-Length Stage Plays",
        "name_ur": "مکمل اسٹیج ڈرامے",
        "description_hi": "भारतेन्दु, जयशंकर प्रसाद, मोहन राकेश, हबीब तनवीर परंपरा के बहु-अंकीय नाटक",
        "description_en": "Multi-act classic and modern stage scripts of social conflict and historical drama",
        "subgenres": [
          {
            "id": "historical-plays",
            "name_hi": "ऐतिहासिक व पौराणिक नाटक",
            "name_en": "Historical & Mythological Plays",
            "name_ur": "تاریخی و اساطیری ڈرامے"
          },
          {
            "id": "social-struggle-plays",
            "name_hi": "सामाजिक संघर्ष व यथार्थवादी नाटक",
            "name_en": "Social Realist Stage Plays",
            "name_ur": "سماجی کشمکش کے اسٹیج ڈرامے"
          }
        ]
      },
      {
        "id": "one-act-plays",
        "name_hi": "एकल व एकांकी नाटक",
        "name_en": "One-Act & Solo Plays",
        "name_ur": "یک بابی و سولو ڈرامے",
        "description_hi": "एकल अभिनय (Solo Play), एकांकी (Ekanki), लघु नाट्य आलेख व एकाग्र मंचन",
        "description_en": "Short chamber plays (Ekanki) and single-actor solo dramatic scripts",
        "subgenres": [
          {
            "id": "solo-chamber-plays",
            "name_hi": "एकल नाटक (Solo Play / Monodrama)",
            "name_en": "Solo Dramatic Chamber Scripts",
            "name_ur": "سولو پلے اور مونو ڈراما"
          },
          {
            "id": "ekanki-plays",
            "name_hi": "एकांकी व लघु नाटक (Ekanki)",
            "name_en": "One-Act Chamber Plays",
            "name_ur": "یک بابی مختصر تمثیلیں"
          }
        ]
      },
      {
        "id": "street-theatre",
        "name_hi": "नुक्कड़ नाटक व जन-चेतना",
        "name_en": "Street Theatre (Nukkad Natak)",
        "name_ur": "نکڑ ناٹک و عوامی تھیٹر",
        "description_hi": "सफ़दर हाशमी परंपरा, जन-आंदोलन, सामाजिक जागृति एवं तात्कालिक राजनीतिक व्यंग्य",
        "description_en": "Agitprop, street plays (Nukkad Natak), and socio-political performance scripts",
        "subgenres": [
          {
            "id": "agitprop-street-plays",
            "name_hi": "जन-आंदोलन नुक्कड़ नाटक",
            "name_en": "Agitprop & Movement Plays",
            "name_ur": "عوامی بیداری کے نکڑ ناٹک"
          },
          {
            "id": "workers-theatre",
            "name_hi": "श्रमिक व जनवादी रंगमंच",
            "name_en": "Workers & Peoples Theatre",
            "name_ur": "مزدور اور عوامی تھیٹر"
          }
        ]
      },
      {
        "id": "radio-plays",
        "name_hi": "रेडियो व ध्वन्यात्मक नाटक",
        "name_en": "Radio & Acoustic Plays",
        "name_ur": "ریڈیو ڈرامے و صوتی تمثیل",
        "description_hi": "रेडियो प्रसारण हेतु विशेष ध्वनि-संयोजन, संवाद-प्रधान एवं श्रव्य नाटक",
        "description_en": "Audio-first dramas and dialogic scripts meant for acoustic radio performance",
        "subgenres": [
          {
            "id": "audio-dramas",
            "name_hi": "श्रव्य नाट्य व संवाद आलेख",
            "name_en": "Audio-First Radio Dramas",
            "name_ur": "صوتی ڈرامے اور ریڈیائی کہانیاں"
          }
        ]
      },
      {
        "id": "folk-theatre",
        "name_hi": "लोक रंगमंच",
        "name_en": "Folk Theatre",
        "name_ur": "روایتی لوک تھیٹر",
        "description_hi": "नौटंकी, स्वांग, भवई, जात्रा, तमाशा, माच व पारंपरिक लोक नाट्य",
        "description_en": "Nautanki, Swang, Bhavai, Jatra, and traditional folk performance scripts",
        "subgenres": [
          {
            "id": "nautanki-swang",
            "name_hi": "नौटंकी, स्वांग व रास",
            "name_en": "Nautanki & Swang Traditions",
            "name_ur": "نوٹنکی اور سوانگ"
          },
          {
            "id": "bhavai-jatra",
            "name_hi": "भवई, जात्रा व तमाशा",
            "name_en": "Bhavai, Jatra & Tamasha",
            "name_ur": "بھوائی اور جاترا"
          }
        ]
      }
    ]
  },
  {
    "id": "satire",
    "name_hi": "व्यंग्य और हास्य",
    "name_en": "Satire & Humor",
    "name_ur": "طنز و مزاح",
    "subtitle_hi": "राजनीतिक व्यंग्य, प्रहसन, विद्रूपता, व्यंग्य स्तंभ व ललित हास्य",
    "subtitle_en": "Socio-political satire, farce, parody, satirical columns & witty humor",
    "subtitle_ur": "سماجی و سیاسی طنز، پرہاس، شوخی اور شائستہ مزاح",
    "icon": "Smile",
    "color": "#d97706",
    "genres": [
      {
        "id": "political-social-satire",
        "name_hi": "राजनीतिक व सामाजिक व्यंग्य",
        "name_en": "Political & Social Satire",
        "name_ur": "سیاسی و سماجی طنز",
        "description_hi": "हरिशंकर परसाई, श्रीलाल शुक्ल, शरद जोशी, मुश्ताक़ अहमद यूसुफ़ी परंपरा का तीखा व्यंग्य",
        "description_en": "Systemic critiques, bureaucratic irony, and hard-hitting socio-political satire (Vyangya)",
        "subgenres": [
          {
            "id": "bureaucratic-satire",
            "name_hi": "प्रशासनिक व व्यवस्थागत व्यंग्य",
            "name_en": "Bureaucratic & Systemic Irony",
            "name_ur": "سرکاری نظام پر طنز"
          },
          {
            "id": "parliamentary-political",
            "name_hi": "राजनीतिक विद्रूपता व कटाक्ष",
            "name_en": "Political Hypocrisy & Satire",
            "name_ur": "سیاسی منافقت پر طنز"
          }
        ]
      },
      {
        "id": "parody-farce",
        "name_hi": "प्रहसन व विद्रूपता",
        "name_en": "Parody & Farce",
        "name_ur": "پرہاس اور ظرافت",
        "description_hi": "विद्रूप सामाजिक प्रहसन, हास्य नाटक, पैरोडी एवं विसंगतिपरक आलेख",
        "description_en": "Farce, slapstick scripts, and humorous lampoons of social absurdities",
        "subgenres": [
          {
            "id": "satirical-farce",
            "name_hi": "सामाजिक प्रहसन व स्वांग",
            "name_en": "Social Farce & Absurdity",
            "name_ur": "سماجی پرہاس اور ظرافت"
          }
        ]
      },
      {
        "id": "satirical-columns",
        "name_hi": "व्यंग्य स्तंभ व रेखाचित्र",
        "name_en": "Satirical Columns & Vignettes",
        "name_ur": "طنز کے کالم و خاکے",
        "description_hi": "अखबारों व पत्रिकाओं में छपने वाले नियमित व्यंग्य स्तंभ, चुटीले रेखाचित्र व टिप्पणियाँ",
        "description_en": "Short observational columns, episodic vignettes, and character ironies",
        "subgenres": [
          {
            "id": "newspaper-columns",
            "name_hi": "अखबारी व्यंग्य स्तंभ",
            "name_en": "Periodical Satirical Columns",
            "name_ur": "اخبارات کے طنزیہ کالم"
          }
        ]
      },
      {
        "id": "humorous-essays",
        "name_hi": "ललित हास्य व चुटीले निबंध",
        "name_en": "Humorous & Witty Essays",
        "name_ur": "شائستہ مزاحیہ مضامین",
        "description_hi": "दैनिक जीवन की हल्की-फुल्की घटनाओं पर आधारित सौम्य हास्य एवं सुरुचिपूर्ण गद्य",
        "description_en": "Lighthearted, non-caustic reflections on daily life, quirks, and genial humor",
        "subgenres": [
          {
            "id": "witty-reflections",
            "name_hi": "सौम्य हास्य व विनोद",
            "name_en": "Genial Wit & Reflections",
            "name_ur": "شائستہ اور لطیف مزاح"
          }
        ]
      }
    ]
  },
  {
    "id": "essays",
    "name_hi": "निबंध और आलेख",
    "name_en": "Essays & Discourse",
    "name_ur": "مضامین و مقالات",
    "subtitle_hi": "ललित निबंध, शास्त्रीय शोध आलेख, यात्रा-वृत्तांत व संस्मरण",
    "subtitle_en": "Lalit Nibandh, academic research treatises, travelogues & memorial sketches",
    "subtitle_ur": "لطیف مضامین، تحقیقی مقالات، سفرنامے اور سوانحی خاکے",
    "icon": "FileText",
    "color": "#0f766e",
    "genres": [
      {
        "id": "lalit-nibandh",
        "name_hi": "ललित निबंध",
        "name_en": "Lalit Nibandh (Reflective Essays)",
        "name_ur": "لطیف و انشائیہ مضامین",
        "description_hi": "हज़ारीप्रसाद द्विवेदी, विद्यानिवास मिश्र, कुबेरनाथ राय परंपरा का आत्मीय व लालित्यपूर्ण गद्य",
        "description_en": "Wandering, lyrical, subjective personal prose essays and cultural reflections",
        "subgenres": [
          {
            "id": "aesthetic-prose",
            "name_hi": "सौंदर्यपरक व लालित्य गद्य",
            "name_en": "Aesthetic & Lyrical Prose",
            "name_ur": "جمالیاتی انشائیہ نثر"
          },
          {
            "id": "personal-reflections",
            "name_hi": "आत्मीय वैचारिक आलेख",
            "name_en": "Personal Cultural Reflections",
            "name_ur": "شخصی و فکری مضامین"
          }
        ]
      },
      {
        "id": "academic-research",
        "name_hi": "शोध आलेख व शास्त्रीय विवेचन",
        "name_en": "Academic & Scholarly Research",
        "name_ur": "علمی و تحقیقی مقالات",
        "description_hi": "साहित्यिक इतिहास, भाषा-विज्ञान, पाण्डुलिपि अध्ययन व गंभीर आलोचनात्मक शोध",
        "description_en": "Peer-reviewed papers, formal literary analysis, linguistics, and historical investigations",
        "subgenres": [
          {
            "id": "critical-treatises",
            "name_hi": "आलोचनात्मक शोध निबंध",
            "name_en": "Critical Research Treatises",
            "name_ur": "تنقیدی اور تحقیقی مقالات"
          }
        ]
      },
      {
        "id": "travelogues",
        "name_hi": "यात्रा-वृत्तांत व सांस्कृतिक भूगोल",
        "name_en": "Travelogues & Geography",
        "name_ur": "سفرنامے اور جغرافیائی خاکے",
        "description_hi": "राहुल सांकृत्यायन, अज्ञेय, इब्ने इंशा परंपरा के यात्रा वृत्तांत व भौगोलिक आख्यान",
        "description_en": "Travel accounts, exploratory essays, and cultural-geographic observations",
        "subgenres": [
          {
            "id": "cultural-journeys",
            "name_hi": "सांस्कृतिक यात्रा वृत्तांत",
            "name_en": "Cultural & Heritage Journeys",
            "name_ur": "ثقافتی و معلوماتی سفرنامے"
          }
        ]
      },
      {
        "id": "memorial-sketches",
        "name_hi": "संस्मरण व रेखाचित्र",
        "name_en": "Memorial Sketches & Profiles",
        "name_ur": "سوانحی خاکے و یادداشتیں",
        "description_hi": "महादेवी वर्मा, रामवृक्ष बेनीपुरी परंपरा के रेखाचित्र, लेखक संस्मरण व स्मृति-चित्र",
        "description_en": "Biographical sketches, author memoirs (Rekhachitra), and memory profiles",
        "subgenres": [
          {
            "id": "rekhachitra-profiles",
            "name_hi": "रेखाचित्र व शब्द-चित्र",
            "name_en": "Rekhachitra & Pen Portraits",
            "name_ur": "قلمی چہرے اور خاکے"
          }
        ]
      }
    ]
  }
];

export function getCategories() {
  if (!fs.existsSync(CATEGORIES_FILE)) {
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(initialCategories, null, 2), 'utf8');
    return initialCategories;
  }
  try {
    return JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf8'));
  } catch (err) {
    return initialCategories;
  }
}

export function saveCategories(categories) {
  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2), 'utf8');
}

export function getBooks() {
  if (!fs.existsSync(BOOKS_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(BOOKS_FILE, 'utf8'));
  } catch (err) {
    return [];
  }
}

export function saveBooks(books) {
  fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2), 'utf8');
}

export function getBookById(id) {
  const books = getBooks();
  return books.find(b => b.id === id);
}

export function addBook(bookData) {
  const books = getBooks();
  const id = bookData.id || `chetna-${Date.now()}-${Math.round(Math.random() * 1000)}`;
  const newBook = {
    ...bookData,
    id,
    views_count: bookData.views_count || 0,
    downloads_count: bookData.downloads_count || 0,
    created_at: bookData.created_at || new Date().toISOString()
  };
  books.unshift(newBook);
  saveBooks(books);
  return newBook;
}

export function updateBook(id, updateData) {
  const books = getBooks();
  const index = books.findIndex(b => b.id === id);
  if (index === -1) return null;
  books[index] = { ...books[index], ...updateData, updated_at: new Date().toISOString() };
  saveBooks(books);
  return books[index];
}

export function deleteBook(id) {
  const books = getBooks();
  const index = books.findIndex(b => b.id === id);
  if (index === -1) return null;
  const deleted = books.splice(index, 1)[0];
  saveBooks(books);
  return deleted;
}

export function incrementDownloads(id) {
  const books = getBooks();
  const book = books.find(b => b.id === id);
  if (book) {
    book.downloads_count = (book.downloads_count || 0) + 1;
    saveBooks(books);
    return book.downloads_count;
  }
  return 0;
}

export function incrementViews(id) {
  const books = getBooks();
  const book = books.find(b => b.id === id);
  if (book) {
    book.views_count = (book.views_count || 0) + 1;
    saveBooks(books);
    return book.views_count;
  }
  return 0;
}
