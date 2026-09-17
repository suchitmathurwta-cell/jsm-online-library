-- ========================================================
-- CHETNA DIGITAL LIBRARY: SUPABASE DATABASE SCHEMA & SEED
-- ========================================================

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name_hi TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_ur TEXT,
  subtitle_hi TEXT,
  subtitle_en TEXT,
  subtitle_ur TEXT,
  icon TEXT DEFAULT 'BookOpen',
  color TEXT DEFAULT '#1d4ed8',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS genres (
  id TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name_hi TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_ur TEXT,
  description_hi TEXT,
  description_en TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (category_id, id)
);

CREATE TABLE IF NOT EXISTS subgenres (
  id TEXT NOT NULL,
  genre_id TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name_hi TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_ur TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (category_id, genre_id, id)
);

CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title_hi TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_ur TEXT,
  author_hi TEXT,
  author_en TEXT,
  author_ur TEXT,
  category TEXT NOT NULL,
  genre TEXT,
  subgenre TEXT,
  era TEXT,
  year TEXT,
  language TEXT,
  publisher TEXT,
  pages INTEGER DEFAULT 50,
  description TEXT,
  description_en TEXT,
  is_featured BOOLEAN DEFAULT false,
  file_url TEXT,
  cover_url TEXT,
  tag TEXT,
  downloads_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS) & Public Policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE subgenres ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read categories') THEN
    CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public insert categories') THEN
    CREATE POLICY "Public insert categories" ON categories FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public update categories') THEN
    CREATE POLICY "Public update categories" ON categories FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public delete categories') THEN
    CREATE POLICY "Public delete categories" ON categories FOR DELETE USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read genres') THEN
    CREATE POLICY "Public read genres" ON genres FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public insert genres') THEN
    CREATE POLICY "Public insert genres" ON genres FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public update genres') THEN
    CREATE POLICY "Public update genres" ON genres FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public delete genres') THEN
    CREATE POLICY "Public delete genres" ON genres FOR DELETE USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read subgenres') THEN
    CREATE POLICY "Public read subgenres" ON subgenres FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public insert subgenres') THEN
    CREATE POLICY "Public insert subgenres" ON subgenres FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public update subgenres') THEN
    CREATE POLICY "Public update subgenres" ON subgenres FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public delete subgenres') THEN
    CREATE POLICY "Public delete subgenres" ON subgenres FOR DELETE USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read books') THEN
    CREATE POLICY "Public read books" ON books FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public insert books') THEN
    CREATE POLICY "Public insert books" ON books FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public update books') THEN
    CREATE POLICY "Public update books" ON books FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public delete books') THEN
    CREATE POLICY "Public delete books" ON books FOR DELETE USING (true);
  END IF;
END
$$;

-- 3. Seed Formats, Genres & Subgenres
INSERT INTO categories (id, name_hi, name_en, name_ur, subtitle_hi, subtitle_en, subtitle_ur, icon, color)
VALUES ('novel', 'उपन्यास और गल्प', 'Novel & Fiction', 'ناول و فکشن', 'कथा-शिल्प, सामाजिक यथार्थ, महाकाव्यात्मक आख्यान व कालजयी उपन्यास', 'Epic narratives, social realism, historical chronicles & human journeys', 'معاشرتی حقیقت نگاری، تاریخی و نفسیاتی ناول', 'BookOpen', '#b45309')
ON CONFLICT (id) DO UPDATE SET name_hi = EXCLUDED.name_hi, name_en = EXCLUDED.name_en, subtitle_hi = EXCLUDED.subtitle_hi, subtitle_en = EXCLUDED.subtitle_en;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('social-realism', 'novel', 'सामाजिक यथार्थवादी उपन्यास', 'Social Realism', 'سماجی حقیقت نگاری', 'सामंतवाद, जाति संघर्ष, ग्रामीण-शहरी असमानता व श्रमिक जीवन का यथार्थवादी चित्रण', 'Feudalism, caste dynamics, rural-urban inequality, and working-class realities')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('agrarian-peasantry', 'social-realism', 'novel', 'कृषक व ग्रामीण यथार्थ', 'Agrarian Struggles & Peasantry', 'دیہی و کسان جدوجہد')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('feudal-critique', 'social-realism', 'novel', 'सामंतवाद व ज़मींदारी विरोध', 'Anti-Feudal & Landlordism Critique', 'جاگیرداری نظام کے خلاف')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('labor-working-class', 'social-realism', 'novel', 'मजदूर चेतना व श्रमिक संघर्ष', 'Labor & Working-Class Realities', 'مزدور اور محنت کش طبقہ')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('caste-inequality', 'social-realism', 'novel', 'जाति व वर्ग चेतना', 'Caste & Social Hierarchy', 'ذات پات اور طبقاتی کشمکش')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('urban-alienation', 'social-realism', 'novel', 'शहरी मध्यवर्गीय विसंगति', 'Urban Middle-Class Disillusionment', 'شہری متوسط طبقے کا احساسِ بیگانگی')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('historical-fiction', 'novel', 'ऐतिहासिक उपन्यास', 'Historical Fiction', 'تاریخی ناول', 'स्वाधीनता संग्राम, प्राचीन साम्राज्य, मुग़ल व औपनिवेशिक काल के ऐतिहासिक आख्यान', 'Freedom struggles, ancient civilizations, empires, and documented history')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('freedom-struggle', 'historical-fiction', 'novel', 'स्वाधीनता आंदोलन व राष्ट्रीय चेतना', 'Freedom Movement & National Awakening', 'تحریکِ آزادی اور قومی بیداری')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('medieval-empires', 'historical-fiction', 'novel', 'मध्यकालीन इतिहास व सल्तनत काल', 'Medieval Empires & Sultanates', 'قرونِ وسطیٰ کی سلطنتیں')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('partition-chronicles', 'historical-fiction', 'novel', 'विभाजन त्रासदी व विस्थापन', 'Partition Chronicles & Trauma', 'تقسیم کے المیے اور ہجرت')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('renaissance-epoch', 'historical-fiction', 'novel', 'भारतीय पुनर्जागरण व सुधार काल', 'Indian Renaissance & Reforms', 'ہندوستانی نشاۃِ ثانیہ')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('psychological-modernist', 'novel', 'मनोवैज्ञानिक व आधुनिक गल्प', 'Psychological Modernism', 'نفسیاتی و جدید فکشن', 'चेतना प्रवाह, अंतर्द्वंद्व, अस्तित्ववादी संत्रास व आधुनिक मानवीय अनुभूतियाँ', 'Stream of consciousness, existential alienation, and inner psychological monologues')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('stream-of-consciousness', 'psychological-modernist', 'novel', 'चेतना प्रवाह व आंतरिक संवाद', 'Stream of Consciousness', 'شعور کی رو اور باطنی مکالمے')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('existential-alienation', 'psychological-modernist', 'novel', 'अस्तित्ववादी संत्रास व अकेलापन', 'Existential Alienation & Loneliness', 'وجودیت اور تنہائی کا کرب')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('psychoanalytic-prose', 'psychological-modernist', 'novel', 'मनोविश्लेषणात्मक आख्यान', 'Psychoanalytic Narratives', 'نفسیاتی تجزیاتی نثر')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('regional-aanchalik', 'novel', 'आंचलिक उपन्यास व लोक-जीवन', 'Regional & Aanchalik', 'علاقائی و آنچلِک ناول', 'अंचल विशेष का भूगोल, देशज बोलियाँ, लोक-संस्कृति व जन-जीवन का सजीव चित्रण', 'Deeply rooted rural settings, local dialects, folklore, and indigenous regional geographies')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('folk-geography', 'regional-aanchalik', 'novel', 'लोक-भूगोल व अंचल की गाथा', 'Regional Folklore & Landscape', 'علاقائی جغرافیہ اور روایات')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('dialect-narratives', 'regional-aanchalik', 'novel', 'देशज भाषा व लोक-संस्कृति', 'Vernacular Dialect Narratives', 'دیسی زبان اور لوک کلچر')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('tribal-pastoral', 'regional-aanchalik', 'novel', 'जनजातीय व चरवाहा जीवन', 'Tribal & Pastoral Life', 'قبائلی اور چرواہا زندگی')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('novellas', 'novel', 'लघु उपन्यास व दीर्घ गल्प', 'Novellas & Long Prose', 'مختصر ناول و ناولیٹ', 'तीव्र संवेदना, एकाग्र कथानक व सघन सामाजिक-वैचारिक लघु उपन्यास', 'Concentrated long-form prose, philosophical novellas, and compact epic tales')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('chamber-novellas', 'novellas', 'novel', 'एकाग्र लघु उपन्यास', 'Chamber Novellas', 'مرکوز مختصر ناول')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('philosophical-novellas', 'novellas', 'novel', 'दार्शनिक व प्रतीकात्मक लघु उपन्यास', 'Philosophical & Symbolic Novellas', 'فلسفیانہ و علامتی ناولیٹ')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('dalit-anti-caste-novels', 'novel', 'दलित चेतना उपन्यास', 'Dalit Consciousness Fiction', 'دلت شعور ناول', 'अस्मिता, सामाजिक मुक्ति, आत्मसम्मान व जाति-उन्मूलन पर आधारित आख्यान', 'Novels exploring emancipation, anti-caste struggle, identity, and dignity')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('caste-emancipation', 'dalit-anti-caste-novels', 'novel', 'सामाजिक मुक्ति संघर्ष', 'Social Emancipation Struggle', 'سماجی آزادی کی جدوجہد')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('dalit-autobiographical-fiction', 'dalit-anti-caste-novels', 'novel', 'आत्मकथात्मक उपन्यास', 'Autobiographical Fiction', 'آپ بیتی نما فکشن')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO categories (id, name_hi, name_en, name_ur, subtitle_hi, subtitle_en, subtitle_ur, icon, color)
VALUES ('story', 'कहानी और आख्यान', 'Story & Narrative', 'کہانی و افسانہ', 'कालजयी कहानियाँ, नई कहानी, लघुकथाएँ, दास्तानगोई व आख्यान', 'Classic short stories, Nayi Kahani, folklore, micro-fiction & memoirs', 'لازوال افسانے، نئی کہانی اور داستانوی ادب', 'Scroll', '#047857')
ON CONFLICT (id) DO UPDATE SET name_hi = EXCLUDED.name_hi, name_en = EXCLUDED.name_en, subtitle_hi = EXCLUDED.subtitle_hi, subtitle_en = EXCLUDED.subtitle_en;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('classic-short-story', 'story', 'कालजयी कहानियाँ', 'Classic Short Story', 'کلاسیکی کہانی', 'प्रेमचंद, गुलेरी, कौशिक परंपरा का आदर्शोन्मुख एवं यथार्थवादी कथा-साहित्य', 'Traditional plot-driven classic short stories of Premchand tradition')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('premchand-tradition', 'classic-short-story', 'story', 'प्रेमचंद कथा परंपरा', 'Premchandian Realism', 'پریم چند کی افسانوی روایت')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('idealistic-realism', 'classic-short-story', 'story', 'आदर्शोन्मुख यथार्थवाद', 'Idealistic Realism', 'حقیقت نگاری و اخلاقی اقدار')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('social-justice-stories', 'classic-short-story', 'story', 'सामाजिक चेतना कथाएँ', 'Social Justice Stories', 'سماجی انصاف کی کہانیاں')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('nayi-kahani', 'story', 'नई कहानी', 'Nayi Kahani', 'نئی کہانی', 'आज़ादी के बाद का मोहभंग, मध्यवर्गीय नैतिकता, जटिल मानवीय रिश्ते व अकेलापन', 'Post-1947 disillusionment, urban breakdown, and complex modern relationships')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('urban-loneliness', 'nayi-kahani', 'story', 'शहरी अकेलापन व अजनबीपन', 'Urban Alienation & Loneliness', 'شہری تنہائی اور بیگانگی')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('relationship-complexes', 'nayi-kahani', 'story', 'संबंधों की अंतर्गुंफित जटिलता', 'Relationship Complexes', 'انسانی رشتوں کی الجھنیں')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('post-independence-disillusion', 'nayi-kahani', 'story', 'स्वातंत्र्योत्तर मोहभंग', 'Post-Independence Disillusionment', 'آزادی کے بعد کا موہ بھنگ')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('urdu-afsana', 'story', 'उर्दू अफ़साना', 'Urdu Afsana', 'اردو افسانہ', 'मंटो, बेदी, इस्मत, कृष्ण चंदर की बेबाक व मनोवैज्ञानिक अफ़साना निगारी', 'Progressive, psychological, and fearless short fiction in Urdu tradition')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('progressive-afsana', 'urdu-afsana', 'story', 'तरक़्क़ी-पसंद अफ़साने', 'Progressive Movement Afsana', 'ترقی پسند افسانہ')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('partition-afsana', 'urdu-afsana', 'story', 'विभाजन पर आधारित अफ़साने', 'Partition Afsana', 'تقسیم پر مبنی افسانے')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('psychological-afsana', 'urdu-afsana', 'story', 'मनोवैज्ञानिक अफ़साना', 'Psychological Afsana', 'نفسیاتی افسانہ')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('folk-tales', 'story', 'लोक कथाएँ', 'Folk Tales & Lore', 'لوک کہانیاں', 'क्षेत्रीय लोक कथाएँ, जातक कथाएँ, पंचतंत्र, पंचायती किस्से व नीतिकथाएँ', 'Regional folklore, moral fables, indigenous legends, and cautionary tales')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('regional-legends', 'folk-tales', 'story', 'क्षेत्रीय लोकगाथाएँ', 'Regional Legends & Lore', 'علاقائی روایات')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('moral-fables', 'folk-tales', 'story', 'बोधकथाएँ व दृष्टांत', 'Moral Allegories & Fables', 'اخلاقی کہانیاں')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('dastangoi', 'story', 'दास्तानगोई व वाचिक आख्यान', 'Dastangoi & Oral Epics', 'داستان گوئی', 'दास्तान-ए-अमीर हम्ज़ा, तिलिस्म-ए-होशरुबा व पारंपारिक वाचिक किस्सागोई', 'Classical oral epics, romance, fantasy, and heroic spoken narratives')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('dastangoi-tilism', 'dastangoi', 'story', 'तिलिस्म व ऐयारी दास्तानें', 'Tilism & Romance Tales', 'طلسم و عیاری')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('oral-storytelling', 'dastangoi', 'story', 'वाचिक किस्सागोई', 'Oral Recitations', 'زبانی قصہ گوئی')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('micro-fiction', 'story', 'लघुकथा', 'Micro-Fiction & Vignettes', 'مختصر ترین کہانیاں', 'संक्षिप्त, मारक, सूत्रबद्ध सामाजिक व्यंग्य व तीक्ष्ण लघुकथाएँ', 'Flash fiction, impactful concise vignettes, and satirical snapshots')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('socio-satirical-micro', 'micro-fiction', 'story', 'सामाजिक व्यंग्य लघुकथाएँ', 'Socio-Satirical Micro Fiction', 'سماجی طنزیہ مائیکرو فکشن')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('philosophical-vignettes', 'micro-fiction', 'story', 'दार्शनिक सूत्र कथाएँ', 'Philosophical Vignettes', 'فلسفیانہ خاکے')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('memoirs', 'story', 'संस्मरण व रेखाचित्र', 'Memoirs & Reminiscences', 'یادداشتیں اور خاکے', 'व्यक्तिगत स्मृतियों, बीती घटनाओं व साहित्यकारों के जीवन-चित्र', 'Semi-autobiographical reflections, character sketches, and nostalgia')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('childhood-nostalgia', 'memoirs', 'story', 'बाल्य स्मृति कथाएँ', 'Childhood Nostalgia', 'بچپن کی یادیں')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('life-portraits', 'memoirs', 'story', 'व्यक्ति-चित्र व जीवन-झांकी', 'Life Portraits & Sketches', 'شخصی خاکے')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO categories (id, name_hi, name_en, name_ur, subtitle_hi, subtitle_en, subtitle_ur, icon, color)
VALUES ('poetry', 'कविता, शायरी और पद्य', 'Poetry & Verse', 'شاعری و منظومات', 'ग़ज़ल, क़सीदा, नज़्म, मर्सिया, नौहा, दोहे, गीत, मुक्तछंद, रुबाइयात', 'Ghazals, Odes, Nazms, Marsiya, Nauha, Doha, Geet, Free Verse, Rubaiyat', 'غزل، قصیدہ، نظم، مرثیہ، نوحہ، دوہے، گیت، آزاد نظم، رباعیات', 'Feather', '#7e22ce')
ON CONFLICT (id) DO UPDATE SET name_hi = EXCLUDED.name_hi, name_en = EXCLUDED.name_en, subtitle_hi = EXCLUDED.subtitle_hi, subtitle_en = EXCLUDED.subtitle_en;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('ghazal', 'poetry', 'ग़ज़ल', 'Ghazal', 'غزل', 'मीर, ग़ालिब, मोमिन, फ़ैज़ परंपरा की शास्त्रीय एवं समकालीन ग़ज़लें व अशआर', 'Classical and contemporary coupled rhyming verse with matla, maqta, radif and qafiya')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('classical-ghazal', 'ghazal', 'poetry', 'शास्त्रीय उर्दू ग़ज़ल', 'Classical Urdu Ghazal', 'کلاسیکی اردو غزل')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('progressive-ghazal', 'ghazal', 'poetry', 'प्रगतिशील दौर की ग़ज़ल', 'Progressive Era Ghazal', 'ترقی پسند غزل')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('contemporary-ghazal', 'ghazal', 'poetry', 'समकालीन हिंदी-उर्दू ग़ज़ल', 'Contemporary Ghazal', 'عصری غزل')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('romantic-mystical-ghazal', 'ghazal', 'poetry', 'इश्किया व सूफ़ी ग़ज़ल', 'Romantic & Mystical Ghazal', 'عشقیہ و صوفیانہ غزل')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('odes-qasida', 'poetry', 'क़सीदा व प्रशस्ति काव्य', 'Odes & Qasida', 'قصیدہ نگاری', 'सौदा, ज़ौक़ की भव्य प्रशस्ति शैली, स्तुति काव्य व ऐतिहासिक ओड्स', 'Grand laudatory verse, classical praise odes, panegyrics, and formal tributes')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('classical-qasida', 'odes-qasida', 'poetry', 'शास्त्रीय क़सीदा', 'Classical Qasida', 'کلاسیکی قصیدہ')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('historical-odes', 'odes-qasida', 'poetry', 'ऐतिहासिक प्रशस्ति ओड्स', 'Historical & Royal Odes', 'تاریخی قصائد')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('devotional-odes', 'odes-qasida', 'poetry', 'भक्ति व मनक़बत ओड्स', 'Devotional & Spiritual Odes', 'منقبت اور مدحیہ کلام')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('nazm', 'poetry', 'नज़्म', 'Nazm', 'نظم', 'इक़बाल, साहिर, कैफ़ी, मख़दूम, नज़ीर अकबराबादी की विषय-प्रधान नज़्में', 'Single-subject thematic verse, narrative, philosophical, and social nazms')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('thematic-nazm', 'nazm', 'poetry', 'वैचारिक व सामाजिक नज़्म', 'Thematic & Social Nazm', 'فکری و سماجی نظمیں')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('azad-nazm', 'nazm', 'poetry', 'आज़ाद नज़्म', 'Azad Nazm (Free Metric)', 'آزاد نظم')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('modernist-nazm', 'nazm', 'poetry', 'आधुनिक व अमूर्त नज़्म', 'Modernist & Abstract Nazm', 'جدید نظم')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('marsiya', 'poetry', 'मर्सिया', 'Marsiya', 'مرثیہ', 'मीर अनीस व मिर्ज़ा दबीर की मुसद्दस मर्सिया निगारी, शहादत, शौर्य व करुणा', 'Classical mourning epics, 6-line musaddas elegies of Mir Anees & Mirza Dabeer')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('classical-musaddas-marsiya', 'marsiya', 'poetry', 'शास्त्रीय मुसद्दस मर्सिया', 'Classical Musaddas Marsiya', 'کلاسیکی مسدس مرثیہ')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('historical-battle-marsiya', 'marsiya', 'poetry', 'ऐतिहासिक व युद्ध वर्णन मर्सिया', 'Historical & Battle Accounts', 'رجز اور جنگی مرثیہ')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('philosophical-marsiya', 'marsiya', 'poetry', 'दार्शनिक व मानवीय मर्सिया', 'Humanist & Ethical Marsiya', 'انسانی و اخلاقی مرثیہ')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('xyuza', 'marsiya', 'poetry', 'सयुजा', 'XYUZA', 'ضا')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('nauha-soz', 'poetry', 'नौहा व सोज़', 'Nauha & Soz', 'نوحہ و سوز', 'करुण शोक गीत, नौहा, सोज़, सलाम व अज़ादारी का शास्त्रीय काव्य', 'Sorrowful mourning chants, melodic soz-khwani, and elegiac dirges')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('classical-nauha', 'nauha-soz', 'poetry', 'शास्त्रीय नौहा', 'Classical Nauha', 'کلاسیکی نوحہ')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('melodic-soz', 'nauha-soz', 'poetry', 'सोज़ व सलाम', 'Melodic Soz & Salam', 'سوز خوانی و سلام')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('doha-sakhi', 'poetry', 'दोहा व साखी', 'Doha & Sakhi', 'دوہے و ساکھیاں', 'कबीर, तुलसी, रहीम, रसखान के दोहे, साखियाँ, दृष्टांत व नीति-काव्य', 'Couplets, aphorisms, ethical maxims, and spiritual dohas of Bhakti tradition')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('kabir-sakhiyan', 'doha-sakhi', 'poetry', 'कबीर की साखियाँ व उलटबांसी', 'Kabir''s Sakhiyan & Ulatbansi', 'کبیر کی ساکھیاں')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('ethical-dohas', 'doha-sakhi', 'poetry', 'नीति व उपदेशात्मक दोहे', 'Ethical & Didactic Couplets', 'اخلاقی دوہے')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('geet-navgeet', 'poetry', 'गीत व नवगीत', 'Geet & Navgeet', 'گیت و نو گیت', 'निराला, बच्चन, नीरज, शंभुनाथ सिंह के भावपूर्ण गीत, नवगीत व जनगीत', 'Lyrical songs, Navgeet of modern Hindi, romantic melodies, and folk tunes')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('classical-geet', 'geet-navgeet', 'poetry', 'भावप्रधान गीत', 'Classical Lyrical Geet', 'کلاسیکی گیت')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('navgeet-modern', 'geet-navgeet', 'poetry', 'आधुनिक नवगीत', 'Navgeet & Contemporary Song', 'جدید نو گیت')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('bhakti-sufi-kalam', 'poetry', 'भक्ति व सूफ़ी काव्य', 'Bhakti & Sufi Kalam', 'بھکتی و صوفیانہ کلام', 'सूरदास, मीराबाई, बुल्ले शाह, बाबा फरीद का रहस्यवादी, प्रेमाश्रयी व ज्ञानाश्रयी काव्य', 'Mystical Sufi kafis, Pada, Vachanas, and devotional expressions of divine love')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('sufi-mystical-verse', 'bhakti-sufi-kalam', 'poetry', 'सूफ़ी काफ़ियाँ व बैत', 'Sufi Kafis & Baits', 'صوفیانہ کافیاں')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('devotional-pada', 'bhakti-sufi-kalam', 'poetry', 'भक्ति पद व कीर्तन', 'Devotional Pada & Hymns', 'بھکتی کے پد')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('modern-free-verse', 'poetry', 'मुक्तछंद व नई कविता', 'Modern Free Verse', 'آزاد و جدید نظم', 'अज्ञेय, मुक्तिबोध, नागार्जुन, त्रिलोचन, शमशेर की नई कविता व प्रयोगात्मक पद्य', 'Nai Kavita, experimental free verse, existential expressions, and modern imagery')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('experimental-free-verse', 'modern-free-verse', 'poetry', 'प्रयोगात्मक मुक्तछंद', 'Experimental Verse', 'تجرباتی آزاد شاعری')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('existential-modernist-poetry', 'modern-free-verse', 'poetry', 'अस्तित्ववादी नई कविता', 'Existential Modernist Poetry', 'وجودیت پسند شاعری')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('protest-poetry', 'poetry', 'प्रतिरोध व जनवादी कविता', 'Protest & Resistance Poetry', 'انقلابی و احتجاجی شاعری', 'हबीब जालिब, पाश, फैज़, गोरख पांडेय की इंक़लाबी व जन-संघर्ष की शायरी', 'Revolutionary verse, anti-fascist songs, labor struggle anthems, and civil resistance')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('revolutionary-anthems', 'protest-poetry', 'poetry', 'इंक़लाबी तराने व जनगीत', 'Revolutionary Anthems', 'انقلابی ترانے')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('anti-colonial-verse', 'protest-poetry', 'poetry', 'साम्राज्यवाद-विरोधी कविता', 'Anti-Imperialist Verse', 'سامراج مخالف کلام')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('rubaiyat', 'poetry', 'रुबाइयात', 'Rubaiyat', 'رباعیات', 'उमर खय्याम, जोश, अमजद हैदराबादी की चार पंक्तियों वाली दार्शनिक रुबाइयाँ', 'Four-line quatrains with aaba rhyme scheme, philosophical and reflective')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('classical-rubaiyat', 'rubaiyat', 'poetry', 'शास्त्रीय दार्शनिक रुबाइयाँ', 'Classical Philosophical Rubaiyat', 'فلسفیانہ رباعیات')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('romantic-rubaiyat', 'rubaiyat', 'poetry', 'इश्किया रुबाइयाँ', 'Romantic Rubaiyat', 'عشقیہ رباعیات')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('qataat-epigrams', 'poetry', 'क़तआत व संक्षेप पद्य', 'Qataat & Epigrams', 'قطعات', 'व्यंग्यात्मक, सामयिक, तीक्ष्ण दो से चार शेरों वाले क़तआत व सूक्तियाँ', 'Short satirical stanzas, topical epigrams, and sharp poetic fragments')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('satirical-qataat', 'qataat-epigrams', 'poetry', 'व्यंग्यात्मक क़तआत', 'Satirical Epigrams', 'طنزیہ قطعات')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('topical-stanzas', 'qataat-epigrams', 'poetry', 'सामयिक राजनीतिक क़तआत', 'Topical Political Stanzas', 'عصری قطعات')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO categories (id, name_hi, name_en, name_ur, subtitle_hi, subtitle_en, subtitle_ur, icon, color)
VALUES ('magazines', 'पत्रिकाएँ एवं सामयिकी', 'Magazines & Periodicals', 'رسائل و جرائد', 'साहित्यिक पत्रिकाएँ, आंदोलन बुलेटिन, विशेषांक व दुर्लभ ऐतिहासिक अभिलेख', 'Literary periodicals, cultural manifestos, special numbers & historic journals', 'ادبی رسائل، تحریک کے بلیٹن اور نایاب تاریخی جرائد', 'Newspaper', '#0284c7')
ON CONFLICT (id) DO UPDATE SET name_hi = EXCLUDED.name_hi, name_en = EXCLUDED.name_en, subtitle_hi = EXCLUDED.subtitle_hi, subtitle_en = EXCLUDED.subtitle_en;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('literary-periodicals', 'magazines', 'साहित्यिक पत्रिकाएँ', 'Literary Periodicals', 'ادبی رسائل', 'हंस, सरस्वती, नई धारा, आजकल, पहल, तद्भव जैसी प्रतिष्ठित साहित्यिक पत्रिकाएँ', 'Monthly, quarterly, and prestigious literary reviews and journals')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('monthly-literary-reviews', 'literary-periodicals', 'magazines', 'मासिक साहित्यिक समीक्षा', 'Monthly Literary Reviews', 'ماہوار ادبی جائزے')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('quarterly-journals', 'literary-periodicals', 'magazines', 'त्रैमासिक शोध पत्रिकाएँ', 'Quarterly Academic Journals', 'سہ ماہی تحقیقی جرائد')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('cultural-bulletins', 'magazines', 'सांस्कृतिक बुलेटिन', 'Cultural Bulletins', 'ثقافتی بلیٹن', 'जसम, इप्टा, जनवादी लेखक संघ व प्रगतिशील लेखक संघ के नियमित बुलेटिन', 'Newsletters, regular bulletins, and organizational cultural organs')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('movement-newsletters', 'cultural-bulletins', 'magazines', 'आंदोलन समाचार व रिपोर्ट', 'Movement Newsletters', 'تحریکی خبرنامے')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('theatre-bulletins', 'cultural-bulletins', 'magazines', 'रंगमंच व जन-संस्कृति बुलेटिन', 'Theatre & Cultural Bulletins', 'تھیٹر اور ثقافتی بلیٹن')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('movement-manifestos', 'magazines', 'आंदोलन व घोषणापत्र', 'Political & Movement Manifestos', 'تحریکی اعلانیے و منشور', 'प्रगतिशील, दलित, किसान व श्रमिक आंदोलनों के ऐतिहासिक घोषणापत्र व वैचारिक दस्तावेज़', 'Historical declarations, cultural manifestos, and ideological resolutions')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('progressive-manifestos', 'movement-manifestos', 'magazines', 'प्रगतिशील लेखक संघ घोषणापत्र', 'Progressive Writers Manifestos', 'ترقی پسند منشور')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('peasant-worker-resolutions', 'movement-manifestos', 'magazines', 'किसान-मजदूर संकल्प दस्तावेज़', 'Peasant-Worker Resolutions', 'کسان مزدور قراردادیں')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('special-editions', 'magazines', 'विशेषांक व स्मृति ग्रंथ', 'Special & Memorial Editions', 'خصوصی و یادگاری نمبر', 'प्रेमचंद विशेषांक, ग़ालिब शताब्दी अंक, निराला स्मृति ग्रंथ व समकालीन विशेषांक', 'Author centenary editions, thematic special volumes, and memorial monographs')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('author-centenary-editions', 'special-editions', 'magazines', 'रचनाकार शताब्दी विशेषांक', 'Author Centenary Numbers', 'مصنفین کے یادگاری نمبر')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('thematic-special-numbers', 'special-editions', 'magazines', 'विषय-केंद्रित विशेषांक', 'Thematic Special Numbers', 'موضوعاتی خصوصی شمارے')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('historical-periodicals', 'magazines', 'दुर्लभ ऐतिहासिक पत्रिकाएँ', 'Historical Periodical Archives', 'نایاب تاریخی رسائل', 'स्वाधीनता पूर्व (1947 से पहले) प्रकाशित दुर्लभ व विलुप्तप्राय ऐतिहासिक पत्रिकाएँ', 'Digitized rare archives of pre-independence periodicals and antique journals')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('pre-1947-archives', 'historical-periodicals', 'magazines', 'स्वाधीनता पूर्व पत्रिकाएँ (1857-1947)', 'Pre-Independence Periodicals', 'قبل از آزادی کے رسائل')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('bilingual-antique-journals', 'historical-periodicals', 'magazines', 'द्विभाषी ऐतिहासिक अंक', 'Bilingual Historical Journals', 'دو لسانی تاریخی جرائد')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO categories (id, name_hi, name_en, name_ur, subtitle_hi, subtitle_en, subtitle_ur, icon, color)
VALUES ('vimarsh', 'विमर्श एवं सांस्कृतिक संवाद', 'Discussion & Cultural Discourse', 'مباحث و فکری مکالمہ', 'दलित विमर्श, स्त्री विमर्श, आदिवासी चेतना, पर्यावरण व वैचारिक साक्षात्कार', 'Dalit identity, feminist studies, indigenous rights, ecology & dialogues', 'دلت شعور، نسائی مباحث، قبائلی فکر اور فکری مکالمے', 'MessagesSquare', '#e11d48')
ON CONFLICT (id) DO UPDATE SET name_hi = EXCLUDED.name_hi, name_en = EXCLUDED.name_en, subtitle_hi = EXCLUDED.subtitle_hi, subtitle_en = EXCLUDED.subtitle_en;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('dalit-discourse', 'vimarsh', 'दलित विमर्श', 'Dalit Discourse', 'دلت فکر و مباحث', 'अंबेडकरवादी चिंतन, जाति उन्मूलन, अस्मिता संघर्ष, दलित सौंदर्यशास्त्र व साहित्य', 'Ambedkarite thought, anti-caste philosophy, Dalit aesthetics, and identity struggles')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('anti-caste-theory', 'dalit-discourse', 'vimarsh', 'जाति-उन्मूलन सिद्धांत', 'Anti-Caste Philosophy', 'ذات پات کا خاتمہ')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('dalit-aesthetics', 'dalit-discourse', 'vimarsh', 'दलित सौंदर्यशास्त्र व चेतना', 'Dalit Aesthetics & Literature', 'دلت جمالیات')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('gender-feminist', 'vimarsh', 'स्त्री विमर्श व लैंगिक समता', 'Gender & Feminist Studies', 'نسائی فکر و صنفی مساوات', 'पितृसत्ता का प्रतिरोध, महिला अधिकार, श्रम, लैंगिक न्याय व स्त्री अस्मिता', 'Critique of patriarchy, women''s liberation, labor, and gender rights')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('patriarchy-critique', 'gender-feminist', 'vimarsh', 'पितृसत्ता विरोध व समानता', 'Critique of Patriarchy', 'پدر شاہی کی مخالفت')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('women-labor-rights', 'gender-feminist', 'vimarsh', 'महिला श्रम व सामाजिक अधिकार', 'Women''s Labor & Social Rights', 'خواتین کی محنت اور حقوق')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('adivasi-indigenous', 'vimarsh', 'आदिवासी व मूलनिवासी विमर्श', 'Adivasi & Indigenous Studies', 'قبائلی فکر و خود مختاری', 'जल-जंगल-ज़मीन, जनजातीय स्वायत्तता, प्रकृति-सहजीविता व देशज ज्ञान परंपरा', 'Indigenous rights, Jal-Jangal-Zameen, tribal culture, and vernacular wisdom')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('land-forest-rights', 'adivasi-indigenous', 'vimarsh', 'जल-जंगल-ज़मीन अधिकार', 'Land & Forest Rights', 'زمین و جنگل کے حقوق')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('indigenous-cosmology', 'adivasi-indigenous', 'vimarsh', 'प्रकृति-सहजीविता व लोक-संस्कृति', 'Indigenous Cosmology & Folklore', 'فطرت اور لوک دانش')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('environmental-thought', 'vimarsh', 'पर्यावरण चेतना व पारिस्थितिकी', 'Environmental & Ecological Thought', 'ماحولیاتی شعور', 'पारिस्थितिकी संकट, चिपको आंदोलन परंपरा, नदी-पहाड़ विमर्श व जलवायु न्याय', 'Ecological crisis, Chipko tradition, river & mountain preservation, and climate justice')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('ecological-justice', 'environmental-thought', 'vimarsh', 'पर्यावरणीय न्याय व जन-आंदोलन', 'Ecological Justice & Movements', 'ماحولیاتی انصاف')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('river-commons', 'environmental-thought', 'vimarsh', 'नदी, जल व साझे संसाधन', 'Rivers & Common Commons', 'دریا اور آبی وسائل')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('interviews-dialogues', 'vimarsh', 'दीर्घ साक्षात्कार व संवाद', 'Interviews & Intellectual Dialogues', 'طویل انٹرویوز اور مکالمے', 'प्रमुख चिंतकों, साहित्यकारों, रंगकर्मियों व आंदोलनकारियों से विस्तृत संवाद', 'In-depth conversations, intellectual debates, and recorded oral histories')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('author-dialogues', 'interviews-dialogues', 'vimarsh', 'साहित्यकारों से साक्षात्कार', 'Author & Critic Dialogues', 'ادیبوں کے انٹرویوز')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('activist-debates', 'interviews-dialogues', 'vimarsh', 'आंदोलनकारियों से संवाद', 'Activist Conversations', 'سماجی کارکنوں سے مکالمے')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO categories (id, name_hi, name_en, name_ur, subtitle_hi, subtitle_en, subtitle_ur, icon, color)
VALUES ('cultural-conscience', 'सांस्कृतिक चेतना और विचार', 'Cultural Conscience & Thought', 'ثقافتی شعور و فلسفہ', 'प्रगतिशील मानवतावाद, सौंदर्यशास्त्र, दार्शनिक इतिहास व नागरिक अधिकार', 'Progressive humanism, aesthetics, philosophical traditions & civil ethics', 'ترقی پسند انسانیت، جمالیات، فکری تاریخ اور شہری اخلاقیات', 'Brain', '#1d4ed8')
ON CONFLICT (id) DO UPDATE SET name_hi = EXCLUDED.name_hi, name_en = EXCLUDED.name_en, subtitle_hi = EXCLUDED.subtitle_hi, subtitle_en = EXCLUDED.subtitle_en;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('progressive-humanism', 'cultural-conscience', 'प्रगतिशील मानवतावाद', 'Progressive Humanism', 'ترقی پسند انسانیت', 'वैज्ञानिक चेतना, तर्कशीलता, अंधविश्वास-विरोध व सार्वभौमिक मानवीय मूल्य', 'Scientific temper, rationalism, anti-superstition, and universal humanist values')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('scientific-temper', 'progressive-humanism', 'cultural-conscience', 'वैज्ञानिक दृष्टिकोण व तर्कशीलता', 'Scientific Temper & Rationalism', 'سائنسی شعور')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('humanist-ethics', 'progressive-humanism', 'cultural-conscience', 'सार्वभौमिक मानवीय नैतिकता', 'Universal Humanist Ethics', 'عالمی انسانی اقدار')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('secular-democratic-values', 'cultural-conscience', 'जनतंत्र व धर्मनिरपेक्षता', 'Democratic Values & Secularism', 'جمہوریت و سیکولرازم', 'साझा सांस्कृतिक विरासत, गंगा-जमुनी तहज़ीब, संवैधानिक मूल्य व नागरिक स्वतंत्रता', 'Ganga-Jamuni composite culture, constitutional morality, and civil liberties')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('composite-culture', 'secular-democratic-values', 'cultural-conscience', 'गंगा-जमुनी तहज़ीब व साझा विरासत', 'Composite Culture & Pluralism', 'مشترکہ تہذیب')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('constitutional-morality', 'secular-democratic-values', 'cultural-conscience', 'संवैधानिक जनतंत्र व नागरिक अधिकार', 'Constitutional Morality', 'آئینی اخلاقیات')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('aesthetics-criticism', 'cultural-conscience', 'सौंदर्यशास्त्र व कला विमर्श', 'Aesthetics & Literary Criticism', 'جمالیات و تنقید', 'रस सिद्धांत, मार्क्सवादी सौंदर्यशास्त्र, कला-रूप व साहित्यिक मूल्यांकन की पद्धतियाँ', 'Marxist aesthetics, Indian poetics, art forms, and critical evaluation theories')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('marxist-aesthetics', 'aesthetics-criticism', 'cultural-conscience', 'मार्क्सवादी व जनवादी सौंदर्यशास्त्र', 'Marxist & People''s Aesthetics', 'مارکسی جمالیات')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('poetics-criticism', 'aesthetics-criticism', 'cultural-conscience', 'साहित्य सिद्धांत व आलोचना दृष्टि', 'Poetics & Critical Theory', 'تنقیدی نظریات')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('intellectual-history', 'cultural-conscience', 'वैचारिक व दार्शनिक इतिहास', 'Intellectual History', 'فکری و فلسفیانہ تاریخ', 'लोकायत, चार्वाक, बौद्ध दर्शन, सूफी मत, नव-जागरण व आधुनिक चिंतन का इतिहास', 'Materialist philosophies, Lokayata, Buddhism, Bhakti-Sufi history, and Enlightenment')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('materialist-traditions', 'intellectual-history', 'cultural-conscience', 'लोकायत व भौतिकवादी परंपरा', 'Lokayata & Materialist Traditions', 'مادہ پرستانہ روایات')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('renaissance-reformers', 'intellectual-history', 'cultural-conscience', 'भारतीय नवजागरण व समाज सुधारक', 'Indian Renaissance Thinkers', 'اصلاحی تحریکیں')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO categories (id, name_hi, name_en, name_ur, subtitle_hi, subtitle_en, subtitle_ur, icon, color)
VALUES ('drama', 'नाटक और रंगमंच', 'Drama & Theatre', 'ڈراما و اسٹیج', 'पूर्ण नाटक, एकांकी, नुक्कड़ नाटक, रेडियो नाटक व लोक नाट्य', 'Full-length plays, one-act chamber plays, street theatre & folk performances', 'اسٹیج ڈرامے، یک بابی، اسٹریٹ تھیٹر اور ریڈیو ڈراما', 'Theater', '#c2410c')
ON CONFLICT (id) DO UPDATE SET name_hi = EXCLUDED.name_hi, name_en = EXCLUDED.name_en, subtitle_hi = EXCLUDED.subtitle_hi, subtitle_en = EXCLUDED.subtitle_en;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('full-length-plays', 'drama', 'पूर्ण नाटक व मंचीय आलेख', 'Full-Length Stage Plays', 'طویل اسٹیج ڈرامے', 'भारतेंदु, जयशंकर प्रसाद, हबीब तनवीर, मोहन राकेश के मंचीय नाटक', 'Multi-act stage dramas, historical epics, and modern theatrical scripts')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('historical-drama', 'full-length-plays', 'drama', 'ऐतिहासिक व महाकाव्यात्मक नाटक', 'Historical & Epic Drama', 'تاریخی ڈرامے')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('social-theatre', 'full-length-plays', 'drama', 'सामाजिक यथार्थवादी रंगमंच', 'Social Realist Plays', 'سماجی تھیٹر')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('one-act-plays', 'drama', 'एकांकी नाटक', 'One-Act Plays (Ekanki)', 'یک بابی ڈرامے', 'संक्षिप्त, सघन, एकल या लघु पात्रीय कक्ष नाटक (चैंबर प्ले)', 'Single-act concentrated chamber plays and solo theatrical performances')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('chamber-plays', 'one-act-plays', 'drama', 'कक्ष नाटक (चैंबर प्ले)', 'Chamber & Studio Plays', 'چیمبر ڈراما')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('solo-monologues', 'one-act-plays', 'drama', 'एकल अभिनय व स्वगत आलेख', 'Solo Theatrical Monologues', 'ایک اداکاری و خود کلامی')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('street-theatre', 'drama', 'नुक्कड़ नाटक', 'Street Theatre (Nukkad Natak)', 'اسٹریٹ تھیٹر', 'सफ़दर हाशमी (जनम) परंपरा का जन-चेतना, श्रमिक अधिकार व विरोध प्रदर्शन रंगमंच', 'Safdar Hashmi / JANAM tradition of activist street performance and agitprop')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('agitprop-theatre', 'street-theatre', 'drama', 'जन-चेतना व श्रमिक रंगमंच', 'Agitprop & Worker Plays', 'مزدور اور عوامی تھیٹر')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('democratic-rights-plays', 'street-theatre', 'drama', 'नागरिक अधिकार नुक्कड़ नाटक', 'Civil Rights Street Plays', 'حقوقِ انسانی اسٹریٹ پلے')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('radio-plays', 'drama', 'रेडियो व ध्वन्यात्मक नाटक', 'Radio & Acoustic Plays', 'ریڈیو ڈراما', 'ध्वनि-प्रभाव, संवाद-प्रधान रेडियो रूपक व श्रव्य नाट्य आलेख', 'Sound-crafted acoustic dramas, radio features, and broadcast plays')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('audio-features', 'radio-plays', 'drama', 'ध्वनि रूपक व रेडियो वार्ता', 'Audio Features & Dialogues', 'صوتی ڈراما')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('literary-radio-adaptations', 'radio-plays', 'drama', 'साहित्यिक कृतियों का रेडियो रूपांतरण', 'Literary Radio Adaptations', 'ادبی ریڈیو ڈرامے')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('folk-theatre', 'drama', 'पारंपरिक लोक नाट्य', 'Traditional Folk Theatre', 'روایتی لوک تھیٹر', 'नौटंकी, स्वांग, जात्रा, भवई, माच व तमाशा के पारंपरिक लोक आलेख', 'Nautanki, Swang, Jatra, Bhavai, and traditional indigenous folk theatrical scripts')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('nautanki-swang', 'folk-theatre', 'drama', 'नौटंकी व स्वांग आलेख', 'Nautanki & Swang Scripts', 'نوٹنکی اور سوانگ')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('jatra-bhavai', 'folk-theatre', 'drama', 'जात्रा व भवई लोकनाट्य', 'Jatra & Bhavai Performances', 'جاترا اور بھوائی')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO categories (id, name_hi, name_en, name_ur, subtitle_hi, subtitle_en, subtitle_ur, icon, color)
VALUES ('satire', 'व्यंग्य और हास्य', 'Satire & Humor', 'طنز و مزاح', 'सामाजिक-राजनीतिक व्यंग्य, प्रहसन, हास्य स्तंभ व प्रतीकात्मक कटाक्ष', 'Socio-political satire, literary parody, ironical columns & allegories', 'سماجی و سیاسی طنز، مزاحیہ مضامین اور خاکے', 'Smile', '#d97706')
ON CONFLICT (id) DO UPDATE SET name_hi = EXCLUDED.name_hi, name_en = EXCLUDED.name_en, subtitle_hi = EXCLUDED.subtitle_hi, subtitle_en = EXCLUDED.subtitle_en;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('socio-political-satire', 'satire', 'सामाजिक-राजनीतिक व्यंग्य', 'Socio-Political Satire', 'سماجی و سیاسی طنز', 'हरिशंकर परसाई, शरद जोशी, श्रीलाल शुक्ल की व्यवस्था-विरोधी व्यंग्य रचनाएँ', 'Harishankar Parsai & Sharad Joshi tradition of sharp anti-establishment satire')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('bureaucracy-critique', 'socio-political-satire', 'satire', 'प्रशासनिक व व्यवस्थागत व्यंग्य', 'Bureaucracy & System Critique', 'سرکاری نظام پر طنز')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('electoral-political-parody', 'socio-political-satire', 'satire', 'चुनावी व राजनीतिक व्यंग्य', 'Electoral & Political Parody', 'سیاسی طنز')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('literary-parody', 'satire', 'साहित्यिक प्रहसन व व्यंग्य', 'Literary Parody & Farce', 'ادبی پیروڈی و طنز', 'साहित्यिक विद्रूपताओं, पाखंड, बौद्धिक दंभ व ढोंग पर तीखा प्रहार', 'Farce, intellectual mockery, literary parody, and ironic sketches')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('intellectual-hypocrisy', 'literary-parody', 'satire', 'बौद्धिक पाखंड पर व्यंग्य', 'Intellectual Hypocrisy Satire', 'دانشورانہ منافقت پر طنز')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('comic-farce', 'literary-parody', 'satire', 'हास्य प्रहसन', 'Comic Farce', 'مزاحیہ خاکے')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('humorous-columns', 'satire', 'हास्य-व्यंग्य स्तंभ व रेखाचित्र', 'Humorous Columns & Sketches', 'مزاحیہ کالم و خاکے', 'दैनिक जीवन की विसंगतियों पर लिखे गए हल्के-फुल्के व चुटीले निबंध', 'Witty daily life columns, eccentric character sketches, and lighthearted humor')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('daily-life-wit', 'humorous-columns', 'satire', 'दैनिक जीवन की विसंगतियाँ', 'Daily Life Quirks', 'روزمرہ زندگی کا مزاح')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('eccentric-sketches', 'humorous-columns', 'satire', 'विचित्र पात्र व हास्य चित्र', 'Eccentric Character Sketches', 'مزاحیہ کردار نگاری')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('allegorical-satire', 'satire', 'प्रतीकात्मक व रूपक व्यंग्य', 'Allegorical Satire', 'علامتی و تمثیلی طنز', 'पशु-पक्षियों, प्रतीकों व रूपकों के माध्यम से सत्ता और समाज की विद्रूपताओं का उद्घाटन', 'Fables of power, animal allegories, and symbolic socio-political satire')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('fables-of-power', 'allegorical-satire', 'satire', 'सत्ता के रूपक व पशु कथाएँ', 'Fables of Power', 'طاقت کی علامتی کہانیاں')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO categories (id, name_hi, name_en, name_ur, subtitle_hi, subtitle_en, subtitle_ur, icon, color)
VALUES ('essays', 'निबंध और आलोचना', 'Essays & Discourse', 'مضامین و تنقید', 'ललित निबंध, समीक्षात्मक आलेख, समाजशास्त्रीय अध्ययन व दार्शनिक निबंध', 'Lalit Nibandh, critical analyses, sociological studies & philosophical treatises', 'انشائیہ، تنقیدی مضامین، سماجیاتی اور فلسفیانہ مقالے', 'FileText', '#0f766e')
ON CONFLICT (id) DO UPDATE SET name_hi = EXCLUDED.name_hi, name_en = EXCLUDED.name_en, subtitle_hi = EXCLUDED.subtitle_hi, subtitle_en = EXCLUDED.subtitle_en;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('lalit-nibandh', 'essays', 'ललित निबंध', 'Lalit Nibandh (Reflective Essays)', 'انشائیہ', 'हज़ारी प्रसाद द्विवेदी, विद्यानिवास मिश्र, कुबेरनाथ राय के आत्मीय, सांस्कृतिक व प्रकृति-परक निबंध', 'Personal, cultural, evocative, and meditative essays of Hazari Prasad Dwivedi tradition')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('cultural-reflections', 'lalit-nibandh', 'essays', 'सांस्कृतिक व आत्मीय निबंध', 'Cultural & Meditative Essays', 'ثقافتی انشائیے')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('nature-ecology-essays', 'lalit-nibandh', 'essays', 'प्रकृति व ऋतु विमर्श निबंध', 'Nature & Seasonal Reflections', 'فطرت پر انشائیے')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('critical-essays', 'essays', 'आलोचनात्मक व समीक्षात्मक निबंध', 'Critical & Analytical Essays', 'تنقیدی و تجزیاتی مقالے', 'रामविलास शर्मा, नामवर सिंह, मलयज के साहित्यिक व ऐतिहासिक मूल्यांकन के लेख', 'Rigorous literary criticism, historiography, and textual evaluations')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('literary-evaluations', 'critical-essays', 'essays', 'साहित्यिक मूल्यांकन व समीक्षा', 'Literary Evaluations', 'ادبی تنقید')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('historiography-essays', 'critical-essays', 'essays', 'इतिहास-दृष्टि व आलोचना', 'Historiography & Method', 'تاریخی تجزیہ')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('sociological-essays', 'essays', 'समाजशास्त्रीय व ऐतिहासिक निबंध', 'Sociological & Historical Essays', 'سماجیاتی و تاریخی مضامین', 'भारतीय समाज, किसान-मजदूर इतिहास, जाति संरचना व धर्मनिरपेक्षता पर शोधपरक निबंध', 'Scholarly research essays on Indian society, caste structures, and peasant histories')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('social-structures', 'sociological-essays', 'essays', 'सामाजिक संरचना व बदलाव', 'Social Structures & Change', 'سماجی ڈھانچہ')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('agrarian-history-essays', 'sociological-essays', 'essays', 'कृषक समाज का इतिहास', 'Agrarian History & Sociology', 'کسان تاریخ')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO genres (id, category_id, name_hi, name_en, name_ur, description_hi, description_en)
VALUES ('philosophical-treatises', 'essays', 'दार्शनिक व वैचारिक निबंध', 'Philosophical Treatises', 'فلسفیانہ مقالات', 'मानव अस्तित्व, चेतना, नीतिशास्त्र, सौंदर्य और सत्य की खोज पर गंभीर दार्शनिक आलेख', 'In-depth explorations of human existence, epistemology, and ethical systems')
ON CONFLICT (category_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('epistemology-ethics', 'philosophical-treatises', 'essays', 'ज्ञानमीमांसा व नीतिशास्त्र', 'Epistemology & Ethics', 'فلسفہِ اخلاق')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;
INSERT INTO subgenres (id, genre_id, category_id, name_hi, name_en, name_ur)
VALUES ('existential-inquiries', 'philosophical-treatises', 'essays', 'अस्तित्व व मानवीय नियति', 'Existential Inquiries', 'انسانی وجود کے سوالات')
ON CONFLICT (category_id, genre_id, id) DO NOTHING;

-- 4. Seed Preserved Books
INSERT INTO books (id, title_hi, title_en, title_ur, author_hi, author_en, author_ur, category, genre, subgenre, era, year, language, publisher, pages, description, description_en, is_featured, file_url, cover_url, tag, downloads_count, views_count)
VALUES ('chetna-1788873817487-547', 'जब होइ ज़ुहर तलाक क़त्ल सिपाह इ शब्बीर', 'JAB HOI ZUHAR TALAK KATL SIPAH E SHABBIR', 'جب ہوئی زہر تلک کٹل سپاہ ا شببر', 'मिज़ा दबीर', 'Miza Dabeer', 'مزا دبیر', 'poetry', 'marsiya', 'xyuza', 'Contemporary Era (2000–Present) / समकालीन युग', '2026', 'Hindi / English / Urdu', 'चेतना डिजिटल अभिलेखागार', 6, 'सांस्कृतिक चेतना और साहित्य पर उत्कृष्ट कृति।', 'Literary masterpiece on cultural conscience and human development.', false, '/uploads/books/JAB_HOI__ZUHAR_TALAK_KATL_SIPAH_E_SHABBIR-1788873817441-959267.pdf', '/uploads/covers/cover-1788873817480-24.svg', 'साहित्य', 0, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO books (id, title_hi, title_en, title_ur, author_hi, author_en, author_ur, category, genre, subgenre, era, year, language, publisher, pages, description, description_en, is_featured, file_url, cover_url, tag, downloads_count, views_count)
VALUES ('chetna-1788703254930-767', 'जब होइ ज़ुहर तलाक क़त्ल सिपाह इ शब्बीर', 'JAB HOI ZUHAR TALAK KATL SIPAH E SHABBIR', 'جب ہوئی زہر تلک کٹل سپاہ ا شببر', 'सज', 'xz', 'شذ', 'poetry', 'मर्सिया (Marsiya)', 'शास्त्रीय मुसद्दस मर्सिया', 'Contemporary Era (2000–Present) / समकालीन युग', '2026', 'Hindi / English / Urdu', 'चेतना डिजिटल अभिलेखागार', 6, 'सांस्कृतिक चेतना और साहित्य पर उत्कृष्ट कृति।', 'Literary masterpiece on cultural conscience and human development.', false, '/uploads/books/JAB_HOI__ZUHAR_TALAK_KATL_SIPAH_E_SHABBIR-1788703254877-747691.pdf', '/uploads/covers/cover-1788703254925-441.svg', 'साहित्य', 0, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO books (id, title_hi, title_en, title_ur, author_hi, author_en, author_ur, category, genre, subgenre, era, year, language, publisher, pages, description, description_en, is_featured, file_url, cover_url, tag, downloads_count, views_count)
VALUES ('chetna-1788446830436-903', 'रात भर का ख्वाब फरजाना मेहदी', 'RAAT BHAR KA KHWAB FERJANA MAHDI', 'رات بھر کا خواب فرجانا مہدی', 'फ़ैज़ाना मेहदी', 'fazana mahdi', 'فزانہ مہدی', 'story', 'प्रगतिशील कथा-साहित्य', NULL, 'Contemporary Era (2000–Present)', '2026', 'Hindi / English', 'चेतना डिजिटल अभिलेखागार', 50, 'सांस्कृतिक चेतना और साहित्य पर उत्कृष्ट कृति।', 'Literary masterpiece on cultural conscience and human development.', false, '/uploads/books/RAAT_BHAR_KA_KHWAB-FERJANA_MAHDI-1788446830421-412611.pdf', '/uploads/covers/extracted_cover-1788446830422-368426.jpg', 'साहित्य', 0, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO books (id, title_hi, title_en, title_ur, author_hi, author_en, author_ur, category, genre, subgenre, era, year, language, publisher, pages, description, description_en, is_featured, file_url, cover_url, tag, downloads_count, views_count)
VALUES ('chetna-1788445597030-27', 'हसन अब्बास रज़ा नंबर(1)', 'HASSAN ABBAS RAZA NUMBER(1)', 'حسن عباس رضا نمبر (1)', 'चाहर सु', 'chahar su', 'چہار سو', 'magazines', 'मासिक पत्रिका व विशेषांक', NULL, 'Contemporary Era (2000–Present)', '2026', 'Hindi / English', 'चेतना डिजिटल अभिलेखागार', 50, 'सांस्कृतिक चेतना और साहित्य पर उत्कृष्ट कृति।', 'Literary masterpiece on cultural conscience and human development.', false, '/uploads/books/HASSAN_ABBAS_RAZA_NUMBER_1_-1788445596967-65917.pdf', '/uploads/covers/extracted_cover-1788445597024-369326.jpg', 'साहित्य', 0, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO books (id, title_hi, title_en, title_ur, author_hi, author_en, author_ur, category, genre, subgenre, era, year, language, publisher, pages, description, description_en, is_featured, file_url, cover_url, tag, downloads_count, views_count)
VALUES ('chetna-1788445596943-687', 'बुद्धा', 'Buddha', 'بدھا۔', 'राजेश कुमार', 'rajesh kaumar', 'راجیش کمار', 'fiction', 'नाटक व रंगमंच', NULL, 'समकालीन युग (2000–वर्तमान)', '2026', 'Hindi / English', 'चेतना डिजिटल अभिलेखागार', 50, 'सांस्कृतिक चेतना और साहित्य पर उत्कृष्ट कृति।', 'Literary masterpiece on cultural conscience and human development.', false, '/uploads/books/_______________-1788445596914-663782.pdf', '/uploads/covers/extracted_cover-1788445596938-288480.jpg', 'साहित्य', 0, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO books (id, title_hi, title_en, title_ur, author_hi, author_en, author_ur, category, genre, subgenre, era, year, language, publisher, pages, description, description_en, is_featured, file_url, cover_url, tag, downloads_count, views_count)
VALUES ('chetna-1788445596881-707', 'जब होइ  ज़ुहर तलाक क़त्ल सिपाह इ शब्बीर', 'JAB HOI  ZUHAR TALAK KATL SIPAH E SHABBIR', 'جب آپ بولتے ہیں تو سپاہ شبیر کو مار دیتی ہے۔', 'मिर्ज़ा दबीर', 'mirza dabeer ', 'مرزا دبیر', 'poetry', 'Social Realism', NULL, 'मुगल उत्तरकाल व 19वीं सदी (1800–1857)', '2026', 'Hindi / English', 'चेतना डिजिटल अभिलेखागार', 50, 'सांस्कृतिक चेतना और साहित्य पर उत्कृष्ट कृति।', 'Literary masterpiece on cultural conscience and human development.', false, '/uploads/books/JAB-HOI-ZUHAR-TALAK-QATL-SIPAH-E-SHABBIR-1788445596850-613656.pdf', '/uploads/covers/extracted_cover-1788445596870-972019.jpg', 'साहित्य', 1, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO books (id, title_hi, title_en, title_ur, author_hi, author_en, author_ur, category, genre, subgenre, era, year, language, publisher, pages, description, description_en, is_featured, file_url, cover_url, tag, downloads_count, views_count)
VALUES ('mir-anees-marsiya', 'शाहकार मर्सिया (नमक-ए-ख़्वान-ए-तकल्लुम)', 'Master Marsiya (Namak-e-Khwan-e-Takallum)', 'شاہکار مرثیہ (نمک خوان تکلم ہے فصاحت میری)', 'मीर बब्बर अली अनीस', 'Mir Babar Ali Anees', 'میر ببر علی انیس', 'poetry', 'मर्सिया / Marsiya (शोक काव्य व शहादत विमर्श)', NULL, 'भारतेन्दु व पुनर्जागरण युग (1850–1900)', '1860', 'Urdu / Hindi', 'चेतना डिजिटल अभिलेखागार', 140, NULL, NULL, true, '/uploads/books/faiz-nuskha-e-wafa.pdf', '/uploads/covers/default_cover.jpg', NULL, 18900, 54200)
ON CONFLICT (id) DO NOTHING;
INSERT INTO books (id, title_hi, title_en, title_ur, author_hi, author_en, author_ur, category, genre, subgenre, era, year, language, publisher, pages, description, description_en, is_featured, file_url, cover_url, tag, downloads_count, views_count)
VALUES ('chetna-1788445596795-512', 'रात्रि स्वप्न', 'Night dream', 'رات کا خواب', 'फ़रज़ाना महदी', 'farzana mahdi ', 'فرزانہ مہدی', 'fiction', 'प्रगतिशील कथा-साहित्य', NULL, 'समकालीन युग (2000–वर्तमान)', '2026', 'Hindi / English', 'चेतना डिजिटल अभिलेखागार', 50, 'सांस्कृतिक चेतना और साहित्य पर उत्कृष्ट कृति।', 'Literary masterpiece on cultural conscience and human development.', false, '/uploads/books/RAAT_BHAR_KA_KHWAB-FERJANA_MAHDI-1788445596766-177840.pdf', '/uploads/covers/extracted_cover-1788445596769-54534.jpg', 'साहित्य', 0, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO books (id, title_hi, title_en, title_ur, author_hi, author_en, author_ur, category, genre, subgenre, era, year, language, publisher, pages, description, description_en, is_featured, file_url, cover_url, tag, downloads_count, views_count)
VALUES ('chetna-1788443293810-159', 'JANMAT JUNE 2026', 'JANMAT JUNE 2026', 'جنم جون 2026', 'जेएसएम', 'JSM', 'جے ایس ایم', 'magazines', 'सांस्कृतिक चेतना व विमर्श', NULL, 'समकालीन युग (2000–वर्तमान)', '2026', 'Hindi / English', 'JSM', 44, 'सांस्कृतिक चेतना और साहित्य पर उत्कृष्ट कृति।', 'Literary masterpiece on cultural conscience and human development.', false, '/uploads/books/JANMAT_JUNE_26-1788443293704-378637.pdf', '/uploads/covers/JANMAT_JUNE_26-cover-1788443293800-143099.jpg', 'साहित्य', 1, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO books (id, title_hi, title_en, title_ur, author_hi, author_en, author_ur, category, genre, subgenre, era, year, language, publisher, pages, description, description_en, is_featured, file_url, cover_url, tag, downloads_count, views_count)
VALUES ('chetna-1788442103287-233', 'हंस पत्रिका (अप्रैल अंक)', 'Hans Magazine (April Issue)', 'سوان اپریل 2026', 'हंस / मुंशी प्रेमचंद', 'Hans / Munshi Premchand', 'ہنس', 'magazines', 'मासिक पत्रिका व विशेषांक', NULL, 'समकालीन युग (2000–वर्तमान)', '2026', 'Hindi / English', 'चेतना डिजिटल अभिलेखागार', 50, 'सांस्कृतिक चेतना और साहित्य पर उत्कृष्ट कृति।', 'Literary masterpiece on cultural conscience and human development.', true, '/uploads/books/Hans_April_2026_removed-1788442103277-844668.pdf', '/uploads/covers/cover-1788442103281-309.svg', 'साहित्य', 0, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO books (id, title_hi, title_en, title_ur, author_hi, author_en, author_ur, category, genre, subgenre, era, year, language, publisher, pages, description, description_en, is_featured, file_url, cover_url, tag, downloads_count, views_count)
VALUES ('chetna-1788442103255-494', 'जसम दावतनामा (सांस्कृतिक विमर्श व संवाद)', 'JASAM Dawatnama (Cultural Discourse)', 'جاسم ایک سوال ہے۔', 'जन संस्कृति मंच (जसम)', 'Jan Sanskriti Manch (JSM)', 'جے ایس ایم', 'vimarsh', 'सांस्कृतिक चेतना व विमर्श', NULL, 'समकालीन युग (2000–वर्तमान)', '2026', 'Hindi / English', 'Jan Sanskriti Manch', 50, 'सांस्कृतिक चेतना और साहित्य पर उत्कृष्ट कृति।', 'Literary masterpiece on cultural conscience and human development.', true, '/uploads/books/JASAM_DAWATNAMA-1788442103234-102372.pdf', '/uploads/covers/cover-1788442103250-2.svg', 'साहित्य', 0, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO books (id, title_hi, title_en, title_ur, author_hi, author_en, author_ur, category, genre, subgenre, era, year, language, publisher, pages, description, description_en, is_featured, file_url, cover_url, tag, downloads_count, views_count)
VALUES ('chetna-1788442103208-73', 'हंस पत्रिका (अक्टूबर अंक)', 'Hans Magazine (October Issue)', 'ہنس اکتوبر 2025 کو ہٹا دیا گیا۔', 'हंस / मुंशी प्रेमचंद', 'Hans / Munshi Premchand', 'ہنس', 'magazines', 'मासिक पत्रिका व विशेषांक', NULL, 'समकालीन युग (2000–वर्तमान)', '2026', 'Hindi / English', '', 50, 'सांस्कृतिक चेतना और साहित्य पर उत्कृष्ट कृति।', 'Literary masterpiece on cultural conscience and human development.', true, '/uploads/books/Hans_Oct__2025_removed-1788442103183-446760.pdf', '/uploads/covers/cover-1788442103205-900.svg', 'साहित्य', 0, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO books (id, title_hi, title_en, title_ur, author_hi, author_en, author_ur, category, genre, subgenre, era, year, language, publisher, pages, description, description_en, is_featured, file_url, cover_url, tag, downloads_count, views_count)
VALUES ('premchand-godan', 'गोदान', 'Godan (The Gift of a Cow)', 'گودان', 'मुंशी प्रेमचंद', 'Munshi Premchand', 'منشی پریم چند', 'novel', 'सामाजिक यथार्थवादी उपन्यास', NULL, 'आधुनिक काल (Modern Classical / 1936)', '1936', 'Hindi / Urdu / English', 'सरस्वती प्रेस, बनारस / चेतना अभिलेखागार', 368, 'भारतीय ग्रामीण समाज, किसान जीवन के संघर्ष और मानवीय गरिमा का कालजयी महाकाव्यात्मक उपन्यास। होरी और धनिया की गाथा मानवीय चेतना और सामाजिक यथार्थ का शाश्वत दस्तावेज है।', 'The greatest epic novel of Indian rural life, capturing peasant struggle, socio-economic exploitation, human resilience and empathy.', true, '/uploads/books/premchand-godan.pdf', '/uploads/covers/premchand-godan-cover.svg', 'उपन्यास', 48900, 142000)
ON CONFLICT (id) DO NOTHING;
INSERT INTO books (id, title_hi, title_en, title_ur, author_hi, author_en, author_ur, category, genre, subgenre, era, year, language, publisher, pages, description, description_en, is_featured, file_url, cover_url, tag, downloads_count, views_count)
VALUES ('mahadevi-shrinkhala-ki-kadiyan', 'शृंखला की कड़ियाँ (स्त्री विमर्श)', 'Shrinkhala Ki Kariyan (Essays on Feminist Conscience & Freedom)', 'شرنکھلا کی کڑیاں (عورت اور سماجی شعور)', 'महादेवी वर्मा', 'Mahadevi Varma', 'مہادیوی ورما', 'vimarsh', 'स्त्री विमर्श व सामाजिक चिंतन', NULL, 'आधुनिक सामाजिक विमर्श (1942)', '1942', 'Hindi / English', 'भारती भंडार, इलाहाबाद / चेतना विमर्श', 190, 'भारतीय समाज में स्त्री की स्थिति, स्वावलंबन, अधिकारों और पितृसत्तात्मक बेड़ियों के विरुद्ध महादेवी वर्मा का कालजयी वैचारिक विमर्श ग्रंथ।', 'Foundational text of Indian feminist consciousness critically examining women''s autonomy, domestic subjugation, and the struggle for human dignity.', true, '/uploads/books/mahadevi-shrinkhala-ki-kadiyan.pdf', '/uploads/covers/mahadevi-shrinkhala-ki-kadiyan-cover.svg', 'विमर्श', 42100, 134000)
ON CONFLICT (id) DO NOTHING;
INSERT INTO books (id, title_hi, title_en, title_ur, author_hi, author_en, author_ur, category, genre, subgenre, era, year, language, publisher, pages, description, description_en, is_featured, file_url, cover_url, tag, downloads_count, views_count)
VALUES ('dalit-chetna-vimarsh', 'दलित साहित्य का सौंदर्यशास्त्र (दलित विमर्श)', 'Aesthetics of Dalit Literature (Social Conscience & Discourse)', 'دلت ادب کی جمالیات اور فکری مکالمہ', 'डॉ. शरणकुमार लिंबाले', 'Dr. Sharankumar Limbale', 'ڈاکٹر شرن کمار لمبالے', 'vimarsh', 'दलित विमर्श व सामाजिक न्याय', NULL, 'समकालीन विमर्श (2000)', '2000', 'Marathi / Hindi / English', 'वाणी प्रकाशन / चेतना समकालीन विमर्श', 210, 'दलित अस्मिता, मानवीय पीड़ा, प्रतिरोध और समानता के आधार पर साहित्य के नए सौंदर्यशास्त्रीय प्रतिमान स्थापित करने वाला ऐतिहासिक विमर्श।', 'Pioneering theoretical discourse proposing an alternative aesthetic framework rooted in lived experience, social rebellion, and human equality.', true, '/uploads/books/dalit-chetna-vimarsh.pdf', '/uploads/covers/dalit-chetna-vimarsh-cover.svg', 'विमर्श', 31800, 98500)
ON CONFLICT (id) DO NOTHING;
INSERT INTO books (id, title_hi, title_en, title_ur, author_hi, author_en, author_ur, category, genre, subgenre, era, year, language, publisher, pages, description, description_en, is_featured, file_url, cover_url, tag, downloads_count, views_count)
VALUES ('tagore-gitanjali', 'गीतांजलि (गीतोपहार)', 'Gitanjali (Song Offerings - Nobel Prize Edition)', 'گیتا انجلی', 'रवींद्रनाथ ठाकुर (टैगोर)', 'Rabindranath Tagore (Nobel Laureate)', 'رابندر ناتھ ٹیگور', 'poetry', 'आध्यात्मिक व सौंदर्यपरक काव्य', NULL, 'विश्व साहित्य (1910-1913)', '1910', 'Bengali / Hindi / English', 'The India Society, London / विश्वभारती', 156, 'साहित्य के नोबेल पुरस्कार से सम्मानित अमर काव्य-संग्रह। प्रकृति, ईश्वरीय प्रेम, मानवता और आत्मिक मुक्ति के अमर गीतों का संगम।', 'Nobel Prize-winning collection of sublime devotional and aesthetic verses exploring the unity of humanity, nature, and divine consciousness.', true, '/uploads/books/tagore-gitanjali.pdf', '/uploads/covers/tagore-gitanjali-cover.svg', 'काव्य', 52400, 168500)
ON CONFLICT (id) DO NOTHING;
INSERT INTO books (id, title_hi, title_en, title_ur, author_hi, author_en, author_ur, category, genre, subgenre, era, year, language, publisher, pages, description, description_en, is_featured, file_url, cover_url, tag, downloads_count, views_count)
VALUES ('saraswati-magazine-dwivedi', 'सरस्वती पत्रिका (शताब्दी विशेषांक)', 'Saraswati Literary Periodical (Centenary Heritage Edition)', 'سرسوتی ادبی رسالہ', 'आचार्य महावीर प्रसाद द्विवेदी (संपादक)', 'Acharya Mahavir Prasad Dwivedi (Editor)', 'آچاریہ مہاویر پرساد دویدی', 'magazines', 'साहित्यिक शोध व सांस्कृतिक पत्रिका', NULL, 'द्विवेदी युग (1903-1920)', '1903', 'Hindi / English', 'इंडियन प्रेस, प्रयाग / चेतना राष्ट्रीय अभिलेखागार', 280, 'भारतीय साहित्य, आधुनिक भाषा-संस्कार, स्वाधीनता आंदोलन, विज्ञान, समाज और कला का ऐतिहासिक मासिक संकलन।', 'Historic monthly magazine that defined modern standard Hindi literature, scientific vocabulary, nationalist journalism, and critical thinking.', true, '/uploads/books/saraswati-magazine-dwivedi.pdf', '/uploads/covers/saraswati-magazine-dwivedi-cover.svg', 'पत्रिका', 27900, 89400)
ON CONFLICT (id) DO NOTHING;
INSERT INTO books (id, title_hi, title_en, title_ur, author_hi, author_en, author_ur, category, genre, subgenre, era, year, language, publisher, pages, description, description_en, is_featured, file_url, cover_url, tag, downloads_count, views_count)
VALUES ('ambedkar-annihilation-of-caste', 'जाति का विनाश (एनिहिलेशन ऑफ कास्ट)', 'Annihilation of Caste (Undelivered Speech)', 'ذات پات کا خاتمہ', 'डॉ. भीमराव रामजी आंबेडकर', 'Dr. B.R. Ambedkar (Babasaheb)', 'ڈاکٹر بی آر امبیڈکر', 'cultural-conscience', 'सामाजिक दर्शन व मानवीय मुक्ति', NULL, 'सामाजिक क्रांति युग (1936)', '1936', 'English / Hindi / Marathi', 'जात-पांत तोड़क मंडल / चेतना शोध संस्थान', 180, 'मानव गरिमा, सामाजिक न्याय, स्वतंत्रता, समता और बंधुता का अमर दार्शनिक उद्घोष। जाति-व्यवस्था के विरुद्ध तर्कपूर्ण एवं वैचारिक महाग्रंथ।', 'Seminal philosophical treatise arguing for the eradication of caste hierarchies, social democracy, human liberty, equality, and fraternity.', true, '/uploads/books/ambedkar-annihilation-of-caste.pdf', '/uploads/covers/ambedkar-annihilation-of-caste-cover.svg', 'सामाजिक चेतना', 61200, 195000)
ON CONFLICT (id) DO NOTHING;
INSERT INTO books (id, title_hi, title_en, title_ur, author_hi, author_en, author_ur, category, genre, subgenre, era, year, language, publisher, pages, description, description_en, is_featured, file_url, cover_url, tag, downloads_count, views_count)
VALUES ('gandhi-hind-swaraj', 'हिंद स्वराज (सच्चा स्वराज्य)', 'Hind Swaraj or Indian Home Rule', 'ہند سوراج', 'महात्मा मोहनदास करमचंद गांधी', 'Mahatma M.K. Gandhi', 'مہاتما گاندھی', 'cultural-conscience', 'नैतिक दर्शन व सभ्यता विमर्श', NULL, 'स्वतंत्रता संग्राम युग (1909)', '1909', 'Gujarati / Hindi / English', 'नवजीवन ट्रस्ट, अहमदाबाद', 140, 'आधुनिक सभ्यता, उपभोक्तावाद, सत्य, अहिंसा और आत्म-नियंत्रण पर गांधीजी का मौलिक दार्शनिक संवाद। मानवीय चेतना के विकास का मूल ग्रंथ।', 'Foundational philosophical dialogue diagnosing modern civilization, machine dependency, moral autonomy (Swaraj), and soul-force (Satyagraha).', true, '/uploads/books/gandhi-hind-swaraj.pdf', '/uploads/covers/gandhi-hind-swaraj-cover.svg', 'सभ्यता विमर्श', 41800, 124000)
ON CONFLICT (id) DO NOTHING;
INSERT INTO books (id, title_hi, title_en, title_ur, author_hi, author_en, author_ur, category, genre, subgenre, era, year, language, publisher, pages, description, description_en, is_featured, file_url, cover_url, tag, downloads_count, views_count)
VALUES ('prasad-kamayani', 'कामायनी (महाकाव्य)', 'Kamayani (The Epic of Human Evolution & Psychology)', 'کامایانی', 'जयशंकर प्रसाद', 'Jaishankar Prasad', 'جئے شنکر پرساد', 'poetry', 'छायावादी महाकाव्य', NULL, 'छायावाद युग (1936)', '1936', 'Hindi / English', 'भारती भंडार, इलाहाबाद / चेतना साहित्य', 310, 'मनु, श्रद्धा और इड़ा के माध्यम से मानव मन, बुद्धि और रागात्मक चेतना के समन्वय का अमर महाकाव्य। भारतीय दर्शन का अनुपम साहित्यिक शिखर।', 'Monumental psychological epic synthesizing intellect (Ida), emotion (Shraddha), and consciousness (Manu) in human evolutionary destiny.', true, '/uploads/books/prasad-kamayani.pdf', '/uploads/covers/prasad-kamayani-cover.svg', 'महाकाव्य', 38700, 118400)
ON CONFLICT (id) DO NOTHING;
INSERT INTO books (id, title_hi, title_en, title_ur, author_hi, author_en, author_ur, category, genre, subgenre, era, year, language, publisher, pages, description, description_en, is_featured, file_url, cover_url, tag, downloads_count, views_count)
VALUES ('parsai-nithalle-ki-diary', 'निठल्ले की डायरी व पगडंडियों का ज़माना', 'Nithalle Ki Diary (Diary of an Idle Observer & Social Satires)', 'نتھلے کی ڈائری', 'हरिशंकर परसाई', 'Harishankar Parsai', 'ہری شنکر پرسائی', 'satire', 'सामाजिक व राजनीतिक व्यंग्य', NULL, 'आधुनिक व्यंग्य युग (1968)', '1968', 'Hindi', 'राजकमल प्रकाशन / चेतना अभिलेखागार', 210, 'पाखंड, भ्रष्ट व्यवस्था, राजनीतिक ढोंग और सामाजिक विद्रूपताओं पर तीखा, मारक व विचारोत्तेजक व्यंग्य। चेतना को झकझोरने वाली कालजयी कृतियाँ।', 'Trenchant social and political satires exposing hypocrisy, institutional apathy, and moral decay with unparalleled wit and moral sharpness.', true, '/uploads/books/parsai-nithalle-ki-diary.pdf', '/uploads/covers/parsai-nithalle-ki-diary-cover.svg', 'व्यंग्य', 45600, 139000)
ON CONFLICT (id) DO NOTHING;
INSERT INTO books (id, title_hi, title_en, title_ur, author_hi, author_en, author_ur, category, genre, subgenre, era, year, language, publisher, pages, description, description_en, is_featured, file_url, cover_url, tag, downloads_count, views_count)
VALUES ('renu-maila-anchal', 'मैला आंचल (आंचलिक उपन्यास)', 'Maila Anchal (The Soiled Border)', 'میلا آنچل', 'फणीश्वर नाथ ''रेणु''', 'Phanishwar Nath ''Renu''', 'پھنیشور ناتھ رینو', 'novel', 'आंचलिक उपन्यास व लोक-चेतना', NULL, 'आधुनिक आंचलिक युग (1954)', '1954', 'Hindi', 'समता प्रकाशन, पटना', 340, 'मेरीगंज गाँव की पृष्ठभूमि पर लोक-गीत, लोक-संस्कृति, राजनीतिक संक्रमण, अंधविश्वास और जीवन-राग का अनुपम भारतीय उपन्यास।', 'Pioneering regional novel capturing the folk songs, social textures, political dawn, and vibrant heartbeat of rural Purnea, Bihar.', false, '/uploads/books/renu-maila-anchal.pdf', '/uploads/covers/renu-maila-anchal-cover.svg', 'उपन्यास', 36100, 108400)
ON CONFLICT (id) DO NOTHING;
INSERT INTO books (id, title_hi, title_en, title_ur, author_hi, author_en, author_ur, category, genre, subgenre, era, year, language, publisher, pages, description, description_en, is_featured, file_url, cover_url, tag, downloads_count, views_count)
VALUES ('ghalib-diwan', 'दीवान-ए-ग़ालिब (दार्शनिक शायरी)', 'Diwan-e-Ghalib (The Master Collection of Urdu & Persian Verse)', 'دیوانِ غالب', 'मिर्ज़ा असदुल्लाह खां ''ग़ालिब''', 'Mirza Asadullah Khan Ghalib', 'مرزا اسد اللہ خاں غالب', 'poetry', 'क्लासिकल शायरी व दार्शनिक गज़लें', NULL, 'मुगल उत्तरकाल / 19वीं सदी (1841)', '1841', 'Urdu / Persian / Hindi', 'मतब-ए-अहमदी, दिल्ली / चेतना क्लासिक्स', 220, 'उर्दू और विश्व शायरी का सर्वोच्च मुकुट। अस्तित्व, समय, प्रेम, ईश्वर, संदेह और मानव नियति पर ग़ालिब की गहन दार्शनिक गज़लें।', 'Supreme monument of poetic philosophy exploring human existence, skepticism, cosmic wonder, unfulfilled longing, and metaphysical irony.', true, '/uploads/books/ghalib-diwan.pdf', '/uploads/covers/ghalib-diwan-cover.svg', 'शायरी', 58200, 184000)
ON CONFLICT (id) DO NOTHING;
INSERT INTO books (id, title_hi, title_en, title_ur, author_hi, author_en, author_ur, category, genre, subgenre, era, year, language, publisher, pages, description, description_en, is_featured, file_url, cover_url, tag, downloads_count, views_count)
VALUES ('faiz-nuskha-e-wafa', 'नुस्खा-हा-ए-वफ़ा (कुलियात-ए-फ़ैज़)', 'Nuskha-hae-Wafa (Complete Poetic Works of Resistance & Love)', 'نسخہ ہائے وفا (کلیاتِ فیض)', 'फ़ैज़ अहमद फ़ैज़ (लेनिन शांति पुरस्कार)', 'Faiz Ahmad Faiz (Lenin Peace Laureate)', 'فیض احمد فیض', 'poetry', 'प्रगतिशील व प्रतिरोध का काव्य', NULL, 'प्रगतिशील आंदोलन (20वीं सदी)', '1984', 'Urdu / Hindi / English', 'मकतब-ए-कारवां, लाहौर / चेतना काव्य', 320, 'मानव मुक्ति, प्रेम, क्रांति, लोकतंत्र और मानवीय आशा का अमर काव्य (नक़्श-ए-फ़रियादी, दस्त-ए-सबा, ज़िंदाँ-नामा का समग्र संकलन)।', 'Collected works of Faiz, blending classical aesthetic beauty with revolutionary social consciousness, human solidarity, and hope.', true, '/uploads/books/faiz-nuskha-e-wafa.pdf', '/uploads/covers/faiz-nuskha-e-wafa-cover.svg', 'प्रतिरोध काव्य', 44300, 137800)
ON CONFLICT (id) DO NOTHING;
INSERT INTO books (id, title_hi, title_en, title_ur, author_hi, author_en, author_ur, category, genre, subgenre, era, year, language, publisher, pages, description, description_en, is_featured, file_url, cover_url, tag, downloads_count, views_count)
VALUES ('manto-toba-tek-singh', 'टोबा टेक सिंह व प्रतिनिधि कहानियाँ', 'Toba Tek Singh & Master Stories of Human Tragedy', 'ٹوبہ ٹیک سنگھ و شاہکار افسانے', 'सआदत हसन मंटो', 'Saadat Hasan Manto', 'سعادت حسن منٹو', 'story', 'यथार्थवादी कहानी व मानवीय संवेदना', NULL, 'विभाजन कालीन कथा साहित्य (1955)', '1955', 'Urdu / Hindi / English', 'नया इदारा, लाहौर / चेतना कथा', 240, 'विभाजन की त्रासदी, पागलों के माध्यम से सीमाओं की निरर्थकता और मानवीय संवेदना की गहराई का विश्वविख्यात कथा-संग्रह।', 'World-famous masterpiece exposing the insanity of geopolitical borders, human trauma, and the enduring resilience of compassion.', true, '/uploads/books/manto-toba-tek-singh.pdf', '/uploads/covers/manto-toba-tek-singh-cover.svg', 'कहानी', 49700, 156000)
ON CONFLICT (id) DO NOTHING;
INSERT INTO books (id, title_hi, title_en, title_ur, author_hi, author_en, author_ur, category, genre, subgenre, era, year, language, publisher, pages, description, description_en, is_featured, file_url, cover_url, tag, downloads_count, views_count)
VALUES ('nehru-discovery-of-india', 'भारत की खोज (डिस्कवरी ऑफ इंडिया)', 'The Discovery of India (Civilizational Journey)', 'تلاشِ ہند', 'जवाहरलाल नेहरू', 'Jawaharlal Nehru', 'جواہر لال نہرو', 'cultural-conscience', 'सभ्यता, इतिहास व सांस्कृतिक चेतना', NULL, 'अहमदनगर किला कारावास (1944-1946)', '1946', 'English / Hindi / Urdu', 'Signet Press, Calcutta / चेतना इतिहास', 580, 'सिंधु घाटी सभ्यता से आधुनिक काल तक भारतीय संस्कृति, दर्शन, कला, सामाजिक समरसता और राष्ट्रीय चेतना की महाकाव्यात्मक खोज।', 'Monumental exploration of India''s rich civilizational ethos, philosophical traditions, cultural synthesis, and democratic awakening.', true, '/uploads/books/nehru-discovery-of-india.pdf', '/uploads/covers/nehru-discovery-of-india-cover.svg', 'सभ्यता व इतिहास', 41200, 129000)
ON CONFLICT (id) DO NOTHING;
INSERT INTO books (id, title_hi, title_en, title_ur, author_hi, author_en, author_ur, category, genre, subgenre, era, year, language, publisher, pages, description, description_en, is_featured, file_url, cover_url, tag, downloads_count, views_count)
VALUES ('vivekananda-jnana-karma-yoga', 'ज्ञान योग व कर्म योग (मानव विकास)', 'Jnana Yoga & Karma Yoga (Awakening Human Potential)', 'گیان یوگ اور کرم یوگ', 'स्वामी विवेकानंद', 'Swami Vivekananda', 'سوامی وویکانند', 'cultural-conscience', 'आत्म-विकास, सेवा व सार्वभौमिक दर्शन', NULL, 'आधुनिक पुनर्जागरण (1896-1900)', '1896', 'English / Hindi / Bengali', 'Advaita Ashrama, Mayavati / चेतना प्रसार', 310, 'कर्म, निष्काम सेवा, ज्ञान, आत्म-विश्वास और समस्त मानव जाति की सेवा ही ईश्वर की सेवा है—इस वैश्विक चेतना का उद्घोष।', 'Practical philosophy of selfless service, fearless inquiry, mental mastery, and universal compassion for human development.', true, '/uploads/books/vivekananda-jnana-karma-yoga.pdf', '/uploads/covers/vivekananda-jnana-karma-yoga-cover.svg', 'मानव विकास', 46200, 145000)
ON CONFLICT (id) DO NOTHING;
