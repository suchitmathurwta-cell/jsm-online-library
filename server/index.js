import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  getCategories,
  saveCategories,
  getBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
  incrementDownloads,
  incrementViews
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const BOOKS_DIR = path.join(UPLOADS_DIR, 'books');
const COVERS_DIR = path.join(UPLOADS_DIR, 'covers');

if (!fs.existsSync(BOOKS_DIR)) fs.mkdirSync(BOOKS_DIR, { recursive: true });
if (!fs.existsSync(COVERS_DIR)) fs.mkdirSync(COVERS_DIR, { recursive: true });

// Static route for uploads
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(UPLOADS_DIR));

// Configure Multer Storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'pdf') {
      cb(null, BOOKS_DIR);
    } else if (file.fieldname === 'cover') {
      cb(null, COVERS_DIR);
    } else {
      cb(null, UPLOADS_DIR);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E6);
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'pdf') {
      if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF documents are allowed for e-book upload'));
      }
    } else if (file.fieldname === 'cover') {
      if (file.mimetype.startsWith('image/') || file.originalname.match(/\.(jpg|jpeg|png|webp|svg)$/i)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for cover'));
      }
    } else {
      cb(null, true);
    }
  }
});

function createGenericChetnaSvgCover(title, author, category, year) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 850" width="600" height="850">
    <defs>
      <linearGradient id="bgGC" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="50%" stop-color="#1d4ed8" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>
    </defs>
    <rect width="600" height="850" fill="url(#bgGC)" />
    <rect x="25" y="25" width="550" height="800" rx="14" fill="none" stroke="#fde68a" stroke-width="2.5" opacity="0.85" />
    <rect x="35" y="35" width="530" height="780" rx="10" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1" />
    <text x="300" y="85" text-anchor="middle" font-family="'Noto Serif Devanagari', serif" font-size="22" fill="#fde68a" font-weight="bold">चेतना डिजिटल पुस्तकालय</text>
    <text x="300" y="110" text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#ffffff" letter-spacing="3">CHETNA OPEN ACCESS LIBRARY</text>
    <rect x="55" y="240" width="490" height="260" rx="12" fill="rgba(0,0,0,0.6)" stroke="#fde68a" stroke-width="1.5" />
    <text x="300" y="340" text-anchor="middle" font-family="'Noto Serif Devanagari', Georgia, serif" font-size="28" fill="#ffffff" font-weight="bold">${title.slice(0, 32)}</text>
    <text x="300" y="420" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#fde68a">${category.toUpperCase()}</text>
    <text x="300" y="580" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="rgba(255,255,255,0.7)" letter-spacing="2">रचयिता / CREATOR</text>
    <text x="300" y="630" text-anchor="middle" font-family="'Noto Serif Devanagari', Georgia, serif" font-size="24" fill="#ffffff" font-weight="bold">${author.slice(0, 35)}</text>
    <text x="300" y="760" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="rgba(255,255,255,0.85)">Year: ${year || 'Open Access'}</text>
  </svg>`;
}

// 1. Get Categories (with real-time book counts)

// 1b. Create New Dynamic Category (Layer 1)
app.post('/api/categories', async (req, res) => {
  try {
    const { name, name_hi, name_en, name_ur, subtitle_hi, subtitle_en, subtitle_ur, icon = 'BookOpen' } = req.body;
    const inputName = (name || name_en || name_hi || name_ur || '').trim();
    if (!inputName) {
      return res.status(400).json({ success: false, error: 'Category name is required' });
    }

    const categories = getCategories();
    
    // Auto translate if any language missing
    const [hi, en, ur] = await Promise.all([
      name_hi ? Promise.resolve(name_hi) : transliterateScript(inputName, 'hi'),
      name_en ? Promise.resolve(name_en) : transliterateScript(inputName, 'en'),
      name_ur ? Promise.resolve(name_ur) : transliterateScript(inputName, 'ur')
    ]);

    const id = en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `cat-${Date.now()}`;

    const existing = categories.find(c => c.id === id || c.name_en?.toLowerCase() === en.toLowerCase());
    if (existing) {
      return res.json({ success: true, category: existing, alreadyExisted: true });
    }

    const pastelColors = ['#b45309', '#047857', '#7e22ce', '#0284c7', '#e11d48', '#1d4ed8', '#c2410c', '#d97706', '#0f766e', '#4338ca', '#be185d', '#0891b2'];
    const randomColor = pastelColors[categories.length % pastelColors.length];

    const newCat = {
      id,
      name_hi: hi,
      name_en: en,
      name_ur: ur,
      subtitle_hi: subtitle_hi || `${hi} से संबंधित विशिष्ट शोध एवं रचनाएँ`,
      subtitle_en: subtitle_en || `Curated treatises, perspectives & works on ${en}`,
      subtitle_ur: subtitle_ur || `${ur} پر مشتمل اہم ادبی و فکری ذخیرہ`,
      icon,
      color: randomColor,
      genres: []
    };

    categories.push(newCat);
    saveCategories(categories);

    res.json({ success: true, category: newCat });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 1c. Create New Genre (Layer 2) under a Category
app.post('/api/categories/:categoryId/genres', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, name_hi, name_en, name_ur, description_hi, description_en } = req.body;
    const inputName = (name || name_en || name_hi || name_ur || '').trim();
    if (!inputName) {
      return res.status(400).json({ success: false, error: 'Genre name is required' });
    }

    const categories = getCategories();
    const catIndex = categories.findIndex(c => c.id === categoryId);
    if (catIndex === -1) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    const [hi, en, ur] = await Promise.all([
      name_hi ? Promise.resolve(name_hi) : transliterateScript(inputName, 'hi'),
      name_en ? Promise.resolve(name_en) : transliterateScript(inputName, 'en'),
      name_ur ? Promise.resolve(name_ur) : transliterateScript(inputName, 'ur')
    ]);

    const genreId = en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `genre-${Date.now()}`;

    if (!categories[catIndex].genres) {
      categories[catIndex].genres = [];
    }

    const existingGenre = categories[catIndex].genres.find(g => g.id === genreId || g.name_en?.toLowerCase() === en.toLowerCase());
    if (existingGenre) {
      return res.json({ success: true, genre: existingGenre, category: categories[catIndex], alreadyExisted: true });
    }

    const newGenre = {
      id: genreId,
      name_hi: hi,
      name_en: en,
      name_ur: ur,
      description_hi: description_hi || `${hi} से संबंधित विशिष्ट साहित्यिक विधा`,
      description_en: description_en || `Curated works and perspectives on ${en}`,
      subgenres: []
    };

    categories[catIndex].genres.push(newGenre);
    saveCategories(categories);

    res.json({ success: true, genre: newGenre, category: categories[catIndex] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 1d. Create New Sub-Genre (Layer 3) under a Genre
app.post('/api/categories/:categoryId/genres/:genreId/subgenres', async (req, res) => {
  try {
    const { categoryId, genreId } = req.params;
    const { name, name_hi, name_en, name_ur } = req.body;
    const inputName = (name || name_en || name_hi || name_ur || '').trim();
    if (!inputName) {
      return res.status(400).json({ success: false, error: 'Sub-genre name is required' });
    }

    const categories = getCategories();
    const catIndex = categories.findIndex(c => c.id === categoryId);
    if (catIndex === -1) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    const genres = categories[catIndex].genres || [];
    let genreIndex = genres.findIndex(g => g.id === genreId);
    if (genreIndex === -1) {
      // Fallback: create genre if not found or attach to first
      if (genres.length === 0) {
        genres.push({
          id: genreId,
          name_hi: genreId,
          name_en: genreId,
          subgenres: []
        });
        genreIndex = 0;
      } else {
        genreIndex = 0;
      }
    }

    const [hi, en, ur] = await Promise.all([
      name_hi ? Promise.resolve(name_hi) : transliterateScript(inputName, 'hi'),
      name_en ? Promise.resolve(name_en) : transliterateScript(inputName, 'en'),
      name_ur ? Promise.resolve(name_ur) : transliterateScript(inputName, 'ur')
    ]);

    const subId = en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `sg-${Date.now()}`;

    if (!categories[catIndex].genres[genreIndex].subgenres) {
      categories[catIndex].genres[genreIndex].subgenres = [];
    }

    const existingSub = categories[catIndex].genres[genreIndex].subgenres.find(s => s.id === subId || s.name_en?.toLowerCase() === en.toLowerCase());
    if (existingSub) {
      return res.json({ success: true, subgenre: existingSub, alreadyExisted: true });
    }

    const newSubgenre = {
      id: subId,
      name_hi: hi,
      name_en: en,
      name_ur: ur
    };

    categories[catIndex].genres[genreIndex].subgenres.push(newSubgenre);
    saveCategories(categories);

    res.json({ success: true, subgenre: newSubgenre });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Legacy subgenre creation endpoint compatibility
app.post('/api/categories/:categoryId/subgenres', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name } = req.body;
    const categories = getCategories();
    const cat = categories.find(c => c.id === categoryId);
    const firstGenreId = cat?.genres?.[0]?.id || 'general';
    req.url = `/api/categories/${categoryId}/genres/${firstGenreId}/subgenres`;
    req.params.genreId = firstGenreId;
    return app._router.handle(req, res);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});


// ==========================================
// 1b-ii. DELETE & UPDATE CATEGORY (Layer 1)
// ==========================================
app.delete('/api/categories/:categoryId', (req, res) => {
  try {
    const { categoryId } = req.params;
    let categories = getCategories();
    const catIndex = categories.findIndex(c => c.id === categoryId);
    if (catIndex === -1) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    const deleted = categories.splice(catIndex, 1)[0];
    saveCategories(categories);
    res.json({ success: true, message: 'Category deleted successfully', category: deleted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/categories/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name_hi, name_en, name_ur, subtitle_hi, subtitle_en, subtitle_ur, icon, color } = req.body;
    let categories = getCategories();
    const catIndex = categories.findIndex(c => c.id === categoryId);
    if (catIndex === -1) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    const cat = categories[catIndex];
    if (name_hi !== undefined) cat.name_hi = name_hi;
    if (name_en !== undefined) cat.name_en = name_en;
    if (name_ur !== undefined) cat.name_ur = name_ur;
    if (subtitle_hi !== undefined) cat.subtitle_hi = subtitle_hi;
    if (subtitle_en !== undefined) cat.subtitle_en = subtitle_en;
    if (subtitle_ur !== undefined) cat.subtitle_ur = subtitle_ur;
    if (icon !== undefined) cat.icon = icon;
    if (color !== undefined) cat.color = color;

    saveCategories(categories);
    res.json({ success: true, message: 'Category updated successfully', category: cat });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 1c-ii. DELETE & UPDATE GENRE (Layer 2)
// ==========================================
app.delete('/api/categories/:categoryId/genres/:genreId', (req, res) => {
  try {
    const { categoryId, genreId } = req.params;
    let categories = getCategories();
    const catIndex = categories.findIndex(c => c.id === categoryId);
    if (catIndex === -1) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    const genres = categories[catIndex].genres || [];
    const genreIndex = genres.findIndex(g => g.id === genreId);
    if (genreIndex === -1) {
      return res.status(404).json({ success: false, error: 'Genre not found' });
    }

    const deletedGenre = genres.splice(genreIndex, 1)[0];
    saveCategories(categories);
    res.json({ success: true, message: 'Genre deleted successfully', genre: deletedGenre });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/categories/:categoryId/genres/:genreId', (req, res) => {
  try {
    const { categoryId, genreId } = req.params;
    const { name_hi, name_en, name_ur, description_hi, description_en, description_ur } = req.body;
    let categories = getCategories();
    const catIndex = categories.findIndex(c => c.id === categoryId);
    if (catIndex === -1) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    const genres = categories[catIndex].genres || [];
    const genre = genres.find(g => g.id === genreId);
    if (!genre) {
      return res.status(404).json({ success: false, error: 'Genre not found' });
    }

    if (name_hi !== undefined) genre.name_hi = name_hi;
    if (name_en !== undefined) genre.name_en = name_en;
    if (name_ur !== undefined) genre.name_ur = name_ur;
    if (description_hi !== undefined) genre.description_hi = description_hi;
    if (description_en !== undefined) genre.description_en = description_en;
    if (description_ur !== undefined) genre.description_ur = description_ur;

    saveCategories(categories);
    res.json({ success: true, message: 'Genre updated successfully', genre });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 1d-ii. DELETE & UPDATE SUB-GENRE (Layer 3)
// ==========================================
app.delete('/api/categories/:categoryId/genres/:genreId/subgenres/:subgenreId', (req, res) => {
  try {
    const { categoryId, genreId, subgenreId } = req.params;
    let categories = getCategories();
    const catIndex = categories.findIndex(c => c.id === categoryId);
    if (catIndex === -1) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    const genres = categories[catIndex].genres || [];
    const genre = genres.find(g => g.id === genreId);
    if (!genre) {
      return res.status(404).json({ success: false, error: 'Genre not found' });
    }

    const subgenres = genre.subgenres || [];
    const subIndex = subgenres.findIndex(s => s.id === subgenreId);
    if (subIndex === -1) {
      return res.status(404).json({ success: false, error: 'Sub-genre not found' });
    }

    const deletedSub = subgenres.splice(subIndex, 1)[0];
    saveCategories(categories);
    res.json({ success: true, message: 'Sub-genre deleted successfully', subgenre: deletedSub });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/categories/:categoryId/subgenres/:subgenreId', (req, res) => {
  try {
    const { categoryId, subgenreId } = req.params;
    let categories = getCategories();
    const catIndex = categories.findIndex(c => c.id === categoryId);
    if (catIndex === -1) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    let deletedSub = null;
    for (const g of (categories[catIndex].genres || [])) {
      const idx = (g.subgenres || []).findIndex(s => s.id === subgenreId || s.name_en?.toLowerCase() === subgenreId.toLowerCase() || s.name_hi === subgenreId);
      if (idx !== -1) {
        deletedSub = g.subgenres.splice(idx, 1)[0];
        break;
      }
    }

    saveCategories(categories);
    res.json({ success: true, message: 'Sub-genre deleted successfully', subgenre: deletedSub });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/categories/:categoryId/genres/:genreId/subgenres/:subgenreId', (req, res) => {
  try {
    const { categoryId, genreId, subgenreId } = req.params;
    const { name_hi, name_en, name_ur } = req.body;
    let categories = getCategories();
    const catIndex = categories.findIndex(c => c.id === categoryId);
    if (catIndex === -1) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    const genre = (categories[catIndex].genres || []).find(g => g.id === genreId);
    if (!genre) {
      return res.status(404).json({ success: false, error: 'Genre not found' });
    }

    const subgenre = (genre.subgenres || []).find(s => s.id === subgenreId);
    if (!subgenre) {
      return res.status(404).json({ success: false, error: 'Sub-genre not found' });
    }

    if (name_hi !== undefined) subgenre.name_hi = name_hi;
    if (name_en !== undefined) subgenre.name_en = name_en;
    if (name_ur !== undefined) subgenre.name_ur = name_ur;

    saveCategories(categories);
    res.json({ success: true, message: 'Sub-genre updated successfully', subgenre });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 1e. Get Hierarchical Categories with accurate 4-layer book counters
app.get('/api/categories', (req, res) => {
  try {
    const categories = getCategories();
    const books = getBooks();

    const enriched = categories.map(c => {
      const catBooks = books.filter(b => b.category === c.id);
      const enrichedGenres = (c.genres || []).map(g => {
        const genreKeywords = [g.id, g.name_en, g.name_hi, g.name_ur].filter(Boolean).map(k => k.toLowerCase());
        const genreBooks = catBooks.filter(b => {
          const bg = (b.genre || '').toLowerCase();
          return genreKeywords.some(k => bg.includes(k) || bg === k);
        });

        const enrichedSubgenres = (g.subgenres || []).map(sg => {
          const sgKeywords = [sg.id, sg.name_en, sg.name_hi, sg.name_ur].filter(Boolean).map(k => k.toLowerCase());
          const sgBooks = catBooks.filter(b => {
            const bg = (b.genre || '').toLowerCase();
            const bsg = (b.subgenre || '').toLowerCase();
            const bt = (b.title_hi || b.title_en || '').toLowerCase();
            return sgKeywords.some(k => bg.includes(k) || bsg.includes(k) || bt.includes(k));
          });
          return {
            ...sg,
            count: sgBooks.length
          };
        });

        return {
          ...g,
          count: genreBooks.length || (enrichedSubgenres.reduce((acc, s) => acc + s.count, 0)),
          subgenres_count: enrichedSubgenres.length,
          subgenres: enrichedSubgenres
        };
      });

      return {
        ...c,
        count: catBooks.length,
        genres_count: enrichedGenres.length,
        genres: enrichedGenres
      };
    });

    res.json({ success: true, categories: enriched, totalBooks: books.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2b. Dedicated Fullstack Intelligent Search API
app.get('/api/search', (req, res) => {
  try {
    const q = (req.query.q || '').trim().toLowerCase();
    if (!q) {
      return res.json({ success: true, query: '', total: 0, results: [], suggestions: [] });
    }

    const books = getBooks();
    const scoredResults = [];

    for (const b of books) {
      let score = 0;
      const titleHi = (b.title_hi || '').toLowerCase();
      const titleEn = (b.title_en || '').toLowerCase();
      const titleUr = (b.title_ur || '').toLowerCase();
      const authorHi = (b.author_hi || '').toLowerCase();
      const authorEn = (b.author_en || '').toLowerCase();
      const authorUr = (b.author_ur || '').toLowerCase();
      const cat = (b.category || '').toLowerCase();
      const genre = (b.genre || '').toLowerCase();
      const publisher = (b.publisher || '').toLowerCase();
      const desc = (b.description || b.synopsis || '').toLowerCase();

      // Exact & Prefix Title Match
      if (titleHi === q || titleEn === q || titleUr === q) score += 150;
      else if (titleHi.startsWith(q) || titleEn.startsWith(q)) score += 100;
      else if (titleHi.includes(q) || titleEn.includes(q) || titleUr.includes(q)) score += 70;

      // Author Match
      if (authorHi === q || authorEn === q || authorUr === q) score += 120;
      else if (authorHi.includes(q) || authorEn.includes(q) || authorUr.includes(q)) score += 60;

      // Category & Genre Match
      if (cat === q || genre.includes(q)) score += 40;

      // Marsiya specific
      if (q === 'marsiya' || q === 'मर्सिया' || q === 'مرثیہ') {
        if (genre.includes('marsiya') || genre.includes('मर्सिया') || titleHi.includes('मर्सिया') || authorHi.includes('अनीस') || authorHi.includes('दबीर')) {
          score += 130;
        }
      }

      // Publisher & Description
      if (publisher.includes(q)) score += 20;
      if (desc.includes(q)) score += 15;

      if (score > 0) {
        scoredResults.push({ book: b, score });
      }
    }

    scoredResults.sort((a, b) => b.score - a.score);
    const results = scoredResults.slice(0, 15).map(item => item.book);

    res.json({
      success: true,
      query: q,
      total: results.length,
      results
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/books', (req, res) => {
  try {
    const {
      category,
      era,
      language,
      featured,
      sort = 'popular',
      page = 1,
      limit = 100
    } = req.query;

    let books = getBooks();

    // Category Filter
    if (category && category !== 'all') {
      if (category === 'marsiya') {
        books = books.filter(b => 
          (b.category === 'poetry' || b.category === 'marsiya') &&
          ((b.genre && b.genre.toLowerCase().includes('marsiya')) ||
           (b.genre && b.genre.includes('मर्सिया')) ||
           (b.title_hi && b.title_hi.includes('मर्सिया')) ||
           (b.title_en && b.title_en.toLowerCase().includes('marsiya')) ||
           (b.title_ur && b.title_ur.includes('مرثیہ')) ||
           (b.author_hi && (b.author_hi.includes('अनीस') || b.author_hi.includes('दबीर'))) ||
           (b.author_en && (b.author_en.toLowerCase().includes('anees') || b.author_en.toLowerCase().includes('dabeer'))))
        );
      } else {
        books = books.filter(b => b.category === category);
      }
    }

    // Genre (Layer 2) Filter
    if (req.query.genre && req.query.genre !== 'all') {
      const gQuery = req.query.genre.trim().toLowerCase();
      const allCategories = getCategories();
      let matchedGenreKeywords = [gQuery];
      for (const cat of allCategories) {
        for (const g of (cat.genres || [])) {
          if (
            g.id?.toLowerCase() === gQuery ||
            g.name_en?.toLowerCase() === gQuery ||
            g.name_hi?.toLowerCase() === gQuery ||
            g.name_ur?.toLowerCase() === gQuery
          ) {
            if (g.id) matchedGenreKeywords.push(g.id.toLowerCase());
            if (g.name_hi) matchedGenreKeywords.push(g.name_hi.toLowerCase());
            if (g.name_en) matchedGenreKeywords.push(g.name_en.toLowerCase());
          }
        }
      }
      matchedGenreKeywords = [...new Set(matchedGenreKeywords)];
      books = books.filter(b => {
        const bg = (b.genre || '').toLowerCase();
        return matchedGenreKeywords.some(k => bg.includes(k) || bg === k);
      });
    }

    // Subgenre (Layer 3 & 4) Filter
    if (req.query.subgenre && req.query.subgenre !== 'all') {
      const subQuery = req.query.subgenre.trim().toLowerCase();
      const allCategories = getCategories();
      
      let matchedKeywords = [subQuery];
      for (const cat of allCategories) {
        for (const g of (cat.genres || [])) {
          for (const sg of (g.subgenres || [])) {
            if (
              sg.id?.toLowerCase() === subQuery ||
              sg.name_en?.toLowerCase() === subQuery ||
              sg.name_hi?.toLowerCase() === subQuery ||
              sg.name_ur?.toLowerCase() === subQuery
            ) {
              if (sg.id) matchedKeywords.push(sg.id.toLowerCase());
              if (sg.name_hi) matchedKeywords.push(sg.name_hi.toLowerCase());
              if (sg.name_en) matchedKeywords.push(sg.name_en.toLowerCase());
              if (sg.name_ur) matchedKeywords.push(sg.name_ur.toLowerCase());
            }
          }
        }
      }
      matchedKeywords = [...new Set(matchedKeywords)];

      books = books.filter(b => {
        const g = (b.genre || '').toLowerCase();
        const sg = (b.subgenre || '').toLowerCase();
        const tHi = (b.title_hi || '').toLowerCase();
        const tEn = (b.title_en || '').toLowerCase();
        const tUr = (b.title_ur || '').toLowerCase();

        return matchedKeywords.some(kw => 
          g.includes(kw) || sg.includes(kw) || tHi.includes(kw) || tEn.includes(kw) || tUr.includes(kw)
        );
      });
    }

    // Format Filter (PDF, EPUB, Text)
    if (req.query.format && req.query.format !== 'all') {
      const fmt = req.query.format.toLowerCase();
      if (fmt === 'pdf') {
        books = books.filter(b => b.file_url && b.file_url.toLowerCase().endsWith('.pdf'));
      } else if (fmt === 'epub') {
        books = books.filter(b => b.file_url && b.file_url.toLowerCase().endsWith('.epub'));
      }
    }

    // Era Filter
    if (era && era !== 'all') {
      books = books.filter(b => b.era && b.era.toLowerCase().includes(era.toLowerCase()));
    }

    // Language Filter
    if (language && language !== 'all') {
      books = books.filter(b => 
        b.language && b.language.toLowerCase().includes(language.toLowerCase())
      );
    }

    // Featured Filter
    if (featured === 'true') {
      books = books.filter(b => b.is_featured);
    }

    // Search Query (matches titles and authors in Hindi, English, Urdu, and description)
    if (req.query.search && req.query.search.trim()) {
      const q = req.query.search.trim().toLowerCase();
      books = books.filter(b => {
        return (
          (b.title_hi && b.title_hi.toLowerCase().includes(q)) ||
          (b.title_en && b.title_en.toLowerCase().includes(q)) ||
          (b.title_ur && b.title_ur.toLowerCase().includes(q)) ||
          (b.author_hi && b.author_hi.toLowerCase().includes(q)) ||
          (b.author_en && b.author_en.toLowerCase().includes(q)) ||
          (b.author_ur && b.author_ur.toLowerCase().includes(q)) ||
          (b.description && b.description.toLowerCase().includes(q)) ||
          (b.description_en && b.description_en.toLowerCase().includes(q)) ||
          (b.publisher && b.publisher.toLowerCase().includes(q)) ||
          (b.genre && b.genre.toLowerCase().includes(q)) ||
          (b.era && b.era.toLowerCase().includes(q)) ||
          (b.tag && b.tag.toLowerCase().includes(q))
        );
      });
    }

    // Sorting
    if (sort === 'popular') {
      books.sort((a, b) => (b.downloads_count || 0) - (a.downloads_count || 0));
    } else if (sort === 'views') {
      books.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
    } else if (sort === 'latest') {
      books.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sort === 'year') {
      books.sort((a, b) => parseInt(a.year || 0) - parseInt(b.year || 0));
    } else if (sort === 'title') {
      books.sort((a, b) => (a.title_hi || a.title_en || '').localeCompare(b.title_hi || b.title_en || ''));
    }

    const total = books.length;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginated = books.slice(offset, offset + parseInt(limit));

    res.json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      books: paginated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Get Single Book
app.get('/api/books/:id', (req, res) => {
  try {
    const { id } = req.params;
    const book = getBookById(id);
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }
    const newViews = incrementViews(id);
    res.json({ success: true, book: { ...book, views_count: newViews } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Citation Generator API
app.get('/api/books/:id/cite', (req, res) => {
  try {
    const { id } = req.params;
    const book = getBookById(id);
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    const citations = {
      chicago: `${book.author_hi || book.author_en}. ${book.title_hi || book.title_en}. ${book.publisher || 'Chetna Digital Preservation Library'}, ${book.year || 'n.d.'}.`,
      apa: `${book.author_en || book.author_hi} (${book.year || 'n.d.'}). ${book.title_en || book.title_hi}. ${book.publisher || 'Chetna Digital Archive'}.`,
      mla: `${book.author_hi || book.author_en}. "${book.title_hi || book.title_en}." ${book.publisher || 'Chetna Digital Archive'}, ${book.year || 'n.d.'}.`,
      humanities: `[${book.year} CE] ${book.author_hi} (${book.author_en}). ${book.title_hi}. Digitized & Preserved by Chetna Open Free Library.`
    };

    res.json({ success: true, citations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Download Book PDF
app.get('/api/books/:id/download', (req, res) => {
  try {
    const { id } = req.params;
    const book = getBookById(id);
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    incrementDownloads(id);

    let relativePath = book.file_url;
    if (relativePath.startsWith('/uploads/')) {
      relativePath = relativePath.replace('/uploads/', '');
    }
    const filePath = path.join(UPLOADS_DIR, relativePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'PDF file not found on disk' });
    }

    const safeTitle = (book.title_en || book.title_hi || 'chetna_ebook')
      .replace(/[^a-zA-Z0-9_-]/g, '_') + '.pdf';

    res.download(filePath, safeTitle, (err) => {
      if (err && !res.headersSent) {
        res.status(500).json({ success: false, error: 'Error streaming file download' });
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Upload New Book
app.post('/api/books/upload', upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), (req, res) => {
  try {
    if (!req.files || !req.files.pdf || req.files.pdf.length === 0) {
      return res.status(400).json({ success: false, error: 'A PDF file is required' });
    }

    const pdfFile = req.files.pdf[0];
    const {
      title_hi,
      title_en,
      title_ur,
      author_hi,
      author_en,
      author_ur,
      category = 'novel',
      genre = 'साहित्य व चेतना',
      subgenre = '',
      era = 'आधुनिक काल',
      year = new Date().getFullYear().toString(),
      language = 'Hindi / English',
      publisher = 'चेतना डिजिटल अभिलेखागार',
      pages = 50,
      description = '',
      description_en = '',
      is_featured = false,
      tag = 'साहित्य'
    } = req.body;

    const file_url = `/uploads/books/${pdfFile.filename}`;
    let cover_url = '';

    if (req.files.cover && req.files.cover.length > 0) {
      cover_url = `/uploads/covers/${req.files.cover[0].filename}`;
    } else {
      const coverSvg = createGenericChetnaSvgCover(
        title_hi || title_en || 'Chetna E-Book',
        author_hi || author_en || 'अज्ञात रचनाकार',
        category,
        year
      );
      const coverFileName = `cover-${Date.now()}-${Math.round(Math.random() * 1000)}.svg`;
      fs.writeFileSync(path.join(COVERS_DIR, coverFileName), coverSvg, 'utf8');
      cover_url = `/uploads/covers/${coverFileName}`;
    }

    const newBook = addBook({
      title_hi: title_hi || title_en || 'अनाम कृति',
      title_en: title_en || title_hi || 'Untitled Literary Work',
      title_ur: title_ur || '',
      author_hi: author_hi || author_en || 'अज्ञात रचनाकार',
      author_en: author_en || author_hi || 'Unknown Author',
      author_ur: author_ur || '',
      category,
      genre: genre || 'साहित्य व संस्कृति',
      subgenre: subgenre || '',
      era: era || 'आधुनिक काल',
      year: String(year),
      language,
      publisher,
      pages: parseInt(pages) || 50,
      description: description || 'सांस्कृतिक चेतना और साहित्य पर उत्कृष्ट कृति।',
      description_en: description_en || 'Literary masterpiece on cultural conscience and human development.',
      is_featured: is_featured === 'true' || is_featured === true,
      file_url,
      cover_url,
      tag: tag || 'साहित्य'
    });

    res.status(201).json({
      success: true,
      message: 'Book uploaded and preserved successfully into Chetna Library!',
      book: newBook
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Update Book Metadata
app.put('/api/books/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updated = updateBook(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }
    res.json({ success: true, book: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Delete Book
app.delete('/api/books/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = deleteBook(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }

    if (deleted.file_url) {
      const pdfPath = path.join(UPLOADS_DIR, deleted.file_url.replace('/uploads/', ''));
      if (fs.existsSync(pdfPath)) {
        try { fs.unlinkSync(pdfPath); } catch (_) {}
      }
    }
    if (deleted.cover_url) {
      const coverPath = path.join(UPLOADS_DIR, deleted.cover_url.replace('/uploads/', ''));
      if (fs.existsSync(coverPath)) {
        try { fs.unlinkSync(coverPath); } catch (_) {}
      }
    }

    res.json({ success: true, message: 'Book deleted successfully', book: deleted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Stats



// Pure Phonetic Script Transliteration Engine (Names/Titles do not change meaning, only scripts)
const translitCache = new Map();

const phoneticWordMap = {
  hi: {
    'the': 'द', 'of': 'ऑफ', 'and': 'एंड', 'in': 'इन', 'on': 'ऑन', 'at': 'एट',
    'for': 'फॉर', 'by': 'बाय', 'with': 'विद', 'a': 'अ', 'an': 'एन', 'to': 'टू',
    'baskerville': 'बास्करविले', 'hound': 'हाउंड', 'doyle': 'डॉयल', 'arthur': 'आर्थर', 'conan': 'कॉनन',
    'premchand': 'प्रेमचंद', 'munshi': 'मुंशी', 'godan': 'गोदान', 'ghalib': 'ग़ालिब', 'mirza': 'मिर्ज़ा',
    'faiz': 'फ़ैज़', 'ahmad': 'अहमद', 'tagore': 'टैगोर', 'rabindranath': 'रवींद्रनाथ',
    'janmat': 'जनमत', 'june': 'जून', 'july': 'जुलाई', 'august': 'अगस्त', 'september': 'सितंबर',
    'october': 'अक्टूबर', 'november': 'नवंबर', 'december': 'दिसंबर', 'january': 'जनवरी', 'february': 'फरवरी',
    'march': 'मार्च', 'april': 'अप्रैल', 'may': 'मई', 'hans': 'हंस', 'patrika': 'पत्रिका',
    'jasam': 'जसम', 'dawatnama': 'दावतनामा', 'marsiya': 'मर्सिया', 'mir': 'मीर', 'anees': 'अनीस', 'dabeer': 'दबीर',
    'soz-e-watan': 'सोज़-ए-वतन', 'gitanjali': 'गीतांजलि', 'kamayani': 'कामायनी', 'buddha': 'बुद्ध',
    'rajesh': 'राजेश', 'kumar': 'कुमार', 'hassan': 'हसन', 'abbas': 'अब्बास', 'raza': 'रज़ा', 'number': 'नंबर',
    'chahar': 'चाहर', 'su': 'सु', 'raat': 'रात', 'bhar': 'भर', 'ka': 'का', 'khwab': 'ख्वाब', 'farzana': 'फरज़ाना', 'mahdi': 'महदी'
  },
  ur: {
    'the': 'دی', 'of': 'آف', 'and': 'اینڈ', 'in': 'ان', 'on': 'آن', 'at': 'ایٹ',
    'for': 'فار', 'by': 'بائے', 'with': 'ود', 'a': 'اے', 'an': 'این', 'to': 'ٹو',
    'baskerville': 'باسکرویل', 'hound': 'ہاؤنڈ', 'doyle': 'ڈوئل', 'arthur': 'آرتھر', 'conan': 'کونن',
    'premchand': 'پریم چند', 'munshi': 'منشی', 'godan': 'گودان', 'ghalib': 'غالب', 'mirza': 'مرزا',
    'faiz': 'فیض', 'ahmad': 'احمد', 'tagore': 'ٹیگور', 'rabindranath': 'رابندر ناتھ',
    'janmat': 'جنمت', 'june': 'جون', 'july': 'جولائی', 'august': 'اگست', 'september': 'ستمبر',
    'october': 'اکتوبر', 'november': 'نومبر', 'december': 'دسمبر', 'january': 'جنوری', 'february': 'فروری',
    'march': 'مارچ', 'april': 'اپریل', 'may': 'مئی', 'hans': 'ہنس', 'patrika': 'پتریکا',
    'jasam': 'جسم', 'dawatnama': 'دوتنامہ', 'marsiya': 'مرثیہ', 'mir': 'میر', 'anees': 'انیس', 'dabeer': 'دبیر',
    'soz-e-watan': 'سوزِ وطن', 'gitanjali': 'گیتا نجلی', 'kamayani': 'کامیانی', 'buddha': 'بدھ',
    'rajesh': 'راجیش', 'kumar': 'کمار', 'hassan': 'حسن', 'abbas': 'عباس', 'raza': 'رضا', 'number': 'نمبر',
    'chahar': 'چہار', 'su': 'سو', 'raat': 'رات', 'bhar': 'بھر', 'ka': 'کا', 'khwab': 'خواب', 'farzana': 'فرزانہ', 'mahdi': 'مہدی'
  }
};

async function transliterateToken(token, targetLang) {
  if (!token || !token.trim()) return token;
  const lower = token.trim().toLowerCase();

  // 1. Exact phonetic word dictionary
  if (phoneticWordMap[targetLang] && phoneticWordMap[targetLang][lower]) {
    return phoneticWordMap[targetLang][lower];
  }

  // 2. Preserve numbers directly
  if (/^\d+$/.test(token.trim())) {
    return token.trim();
  }

  // 3. Preserve punctuation
  if (/^[.,:;!?'"()[\]\-_/]+$/.test(token)) {
    return token;
  }

  // 4. Google Input Tools Transliteration
  const itc = targetLang === 'hi' ? 'hi-t-i0-und' : (targetLang === 'ur' ? 'ur-t-i0-und' : null);
  if (itc && /[a-zA-Z]/.test(token)) {
    try {
      const url = `https://inputtools.google.com/request?text=${encodeURIComponent(token.trim())}&itc=${itc}&num=1`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data[1] && data[1][0] && data[1][0][1] && data[1][0][1][0]) {
        return data[1][0][1][0];
      }
    } catch (_) {}
  }

  return token;
}

async function transliterateScript(text, targetLang) {
  if (!text || !text.trim()) return '';
  const trimmed = text.trim();
  const cacheKey = `${trimmed}_${targetLang}`;
  if (translitCache.has(cacheKey)) {
    return translitCache.get(cacheKey);
  }

  let result = trimmed;

  if (targetLang === 'en') {
    // Transliterate Devanagari or Nastaliq to English Roman Script
    if (/[\u0900-\u097F]/.test(trimmed) || /[\u0600-\u06FF]/.test(trimmed)) {
      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=rm&q=${encodeURIComponent(trimmed)}`;
        const res = await fetch(url);
        const data = await res.json();
        let roman = data && data[0] && data[0][0] && data[0][0][3] ? data[0][0][3] : null;
        if (roman) {
          result = roman;
        } else {
          const url2 = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(trimmed)}`;
          const res2 = await fetch(url2);
          const d2 = await res2.json();
          if (d2 && d2[0] && d2[0][0] && d2[0][0][0]) result = d2[0][0][0];
        }
      } catch (_) {}
    }
  } else {
    // If input is Hindi (Devanagari) and target is Urdu
    if (/[\u0900-\u097F]/.test(trimmed) && targetLang === 'ur') {
      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=hi&tl=ur&dt=t&q=${encodeURIComponent(trimmed)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data && data[0] && data[0][0] && data[0][0][0]) {
          result = data[0][0][0];
        }
      } catch (_) {}
    } else if (/[\u0600-\u06FF]/.test(trimmed) && targetLang === 'hi') {
      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ur&tl=hi&dt=t&q=${encodeURIComponent(trimmed)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data && data[0] && data[0][0] && data[0][0][0]) {
          result = data[0][0][0];
        }
      } catch (_) {}
    } else {
      // English -> Hindi / Urdu
      const tokens = trimmed.split(/(\s+|[.,:;!?'"()[\]\-_/]+)/);
      const converted = await Promise.all(tokens.map(t => transliterateToken(t, targetLang)));
      result = converted.join('');
    }
  }

  translitCache.set(cacheKey, result);
  return result;
}

// 10. Translation/Transliteration API endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLang = 'auto' } = req.body;
    if (!text || !text.trim()) {
      return res.json({ success: true, translations: { hi: '', en: '', ur: '' } });
    }

    const trimmed = text.trim();
    let detectedSource = sourceLang;
    if (detectedSource === 'auto') {
      if (/[\u0900-\u097F]/.test(trimmed)) detectedSource = 'hi';
      else if (/[\u0600-\u06FF]/.test(trimmed)) detectedSource = 'ur';
      else detectedSource = 'en';
    }

    const [hi, en, ur] = await Promise.all([
      detectedSource === 'hi' ? Promise.resolve(trimmed) : transliterateScript(trimmed, 'hi'),
      detectedSource === 'en' ? Promise.resolve(trimmed) : transliterateScript(trimmed, 'en'),
      detectedSource === 'ur' ? Promise.resolve(trimmed) : transliterateScript(trimmed, 'ur')
    ]);

    res.json({
      success: true,
      translations: { hi, en, ur }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/stats', (req, res) => {
  try {
    const books = getBooks();
    const categories = getCategories();
    const totalDownloads = books.reduce((acc, b) => acc + (b.downloads_count || 0), 0);
    const totalViews = books.reduce((acc, b) => acc + (b.views_count || 0), 0);

    res.json({
      success: true,
      stats: {
        totalBooks: books.length,
        totalCategories: categories.length,
        totalDownloads,
        totalViews
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve client in production if built
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (req, res) => {
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Chetna E-Library (Cultural Conscience & Development) Server running on http://localhost:${PORT}`);
});
