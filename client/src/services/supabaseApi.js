import { supabase } from './supabaseClient';
import { DEFAULT_CATEGORIES } from '../data/categoriesData';
import {
  getTrilingualNames,
  ensureTrilingualEntitySync,
  enforceScript
} from './transliterationService';

const TAXONOMY_CACHE_KEY = 'jsm_trilingual_taxonomy_cache_v1';

function readTaxonomyCache() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return {};
    const raw = window.localStorage.getItem(TAXONOMY_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function writeTaxonomyCacheEntry(key, values) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const current = readTaxonomyCache();
    current[key] = { ...(current[key] || {}), ...values };
    window.localStorage.setItem(TAXONOMY_CACHE_KEY, JSON.stringify(current));
  } catch (e) {}
}

function buildSlugId(text, prefix = 'item') {
  const clean = (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return clean || `${prefix}-${Date.now()}`;
}

function needsDbTranslationRepair(item) {
  if (!item) return false;
  const hi = (item.name_hi || '').trim();
  const en = (item.name_en || '').trim();
  // Needs repair if name_hi is missing or contains Latin letters, or name_en is missing or contains non-Latin script
  if (!hi || /[a-zA-Z]/.test(hi) || /[\u0600-\u06FF]/.test(hi)) return true;
  if (!en || /[\u0900-\u097F\u0600-\u06FF]/.test(en)) return true;
  return false;
}

function ensureBookTrilingualSync(book) {
  if (!book) return book;
  const seedTitle = book.title_en || book.title_hi || book.title_ur || '';
  const seedAuthor = book.author_en || book.author_hi || book.author_ur || '';

  const title_hi =
    book.title_hi && /[\u0900-\u097F]/.test(book.title_hi) && !/[a-zA-Z]/.test(book.title_hi)
      ? book.title_hi
      : enforceScript(book.title_hi || seedTitle, 'hi');
  const title_en =
    book.title_en && /[a-zA-Z]/.test(book.title_en) && !/[\u0900-\u097F\u0600-\u06FF]/.test(book.title_en)
      ? book.title_en
      : enforceScript(book.title_en || seedTitle, 'en');
  const title_ur =
    book.title_ur && /[\u0600-\u06FF]/.test(book.title_ur) && !/[a-zA-Z\u0900-\u097F]/.test(book.title_ur)
      ? book.title_ur
      : enforceScript(book.title_ur || title_hi || seedTitle, 'ur');

  const author_hi =
    book.author_hi && /[\u0900-\u097F]/.test(book.author_hi) && !/[a-zA-Z]/.test(book.author_hi)
      ? book.author_hi
      : enforceScript(book.author_hi || seedAuthor, 'hi');
  const author_en =
    book.author_en && /[a-zA-Z]/.test(book.author_en) && !/[\u0900-\u097F\u0600-\u06FF]/.test(book.author_en)
      ? book.author_en
      : enforceScript(book.author_en || seedAuthor, 'en');
  const author_ur =
    book.author_ur && /[\u0600-\u06FF]/.test(book.author_ur) && !/[a-zA-Z\u0900-\u097F]/.test(book.author_ur)
      ? book.author_ur
      : enforceScript(book.author_ur || author_hi || seedAuthor, 'ur');

  return {
    ...book,
    title_hi: title_hi || book.title_hi,
    title_en: title_en || book.title_en,
    title_ur: title_ur || book.title_ur,
    author_hi: author_hi || book.author_hi,
    author_en: author_en || book.author_en,
    author_ur: author_ur || book.author_ur
  };
}

// Background self-healing for existing Supabase taxonomy rows that were saved in English-only or single-script
async function healTaxonomyItemInBackground(table, matchQuery, item, cacheKey) {
  try {
    const trilingual = await getTrilingualNames(item);
    writeTaxonomyCacheEntry(cacheKey, trilingual);
    if (trilingual.name_hi !== item.name_hi || trilingual.name_en !== item.name_en) {
      let q = supabase.from(table).update({
        name_hi: trilingual.name_hi,
        name_en: trilingual.name_en
      });
      for (const [k, v] of Object.entries(matchQuery)) {
        q = q.eq(k, v);
      }
      await q;
    }
  } catch (e) {}
}

// 1. Fetch Categories with nested Genres, Subgenres & real-time book counts
export async function getCategoriesWithHierarchy() {
  try {
    const [catRes, genreRes, subRes, bookRes] = await Promise.all([
      supabase.from('categories').select('*').order('created_at', { ascending: true }),
      supabase.from('genres').select('*').order('created_at', { ascending: true }),
      supabase.from('subgenres').select('*').order('created_at', { ascending: true }),
      supabase.from('books').select('id, category, genre, subgenre, title_hi, title_en')
    ]);

    const dbCategories = (catRes.data || []).filter(c => c && c.id && !String(c.id).startsWith('__'));
    const rawCategories = dbCategories.length > 0 ? dbCategories : DEFAULT_CATEGORIES;
    const genres = genreRes.data || [];
    const subgenres = subRes.data || [];
    const books = bookRes.data || [];
    const localCache = readTaxonomyCache();

    return rawCategories.map(rawCat => {
      const defaultCat = DEFAULT_CATEGORIES.find(c => c.id === rawCat.id);
      const catCacheKey = `cat:${rawCat.id}`;
      const cachedCat = localCache[catCacheKey] || {};
      const mergedCat = {
        ...defaultCat,
        ...rawCat,
        name_hi: cachedCat.name_hi || rawCat.name_hi || defaultCat?.name_hi,
        name_en: cachedCat.name_en || rawCat.name_en || defaultCat?.name_en,
        name_ur: rawCat.name_ur || cachedCat.name_ur || defaultCat?.name_ur
      };

      if (needsDbTranslationRepair(rawCat)) {
        healTaxonomyItemInBackground('categories', { id: rawCat.id }, mergedCat, catCacheKey);
      }

      const cat = ensureTrilingualEntitySync(mergedCat);
      const catBooks = books.filter(b => b.category === cat.id);

      // Find genres from DB or fallback to bundled defaultCat.genres
      let matchedGenres = genres.filter(g => g.category_id === cat.id);
      if (matchedGenres.length === 0 && defaultCat?.genres) {
        matchedGenres = defaultCat.genres;
      }

      const catGenres = matchedGenres.map(rawG => {
        const defaultGenre = defaultCat?.genres?.find(dg => dg.id === rawG.id);
        const genreCacheKey = `genre:${cat.id}:${rawG.id}`;
        const cachedGenre = localCache[genreCacheKey] || {};
        const mergedGenre = {
          ...defaultGenre,
          ...rawG,
          name_hi: cachedGenre.name_hi || rawG.name_hi || defaultGenre?.name_hi,
          name_en: cachedGenre.name_en || rawG.name_en || defaultGenre?.name_en,
          name_ur: rawG.name_ur || cachedGenre.name_ur || defaultGenre?.name_ur
        };

        if (needsDbTranslationRepair(rawG)) {
          healTaxonomyItemInBackground('genres', { category_id: cat.id, id: rawG.id }, mergedGenre, genreCacheKey);
        }

        const g = ensureTrilingualEntitySync(mergedGenre);

        let gSubgenres = subgenres.filter(sg => sg.category_id === cat.id && sg.genre_id === g.id);
        if (gSubgenres.length === 0 && defaultGenre?.subgenres) {
          gSubgenres = defaultGenre.subgenres;
        }

        const sgWithCounts = gSubgenres.map(rawSg => {
          const defaultSg = defaultGenre?.subgenres?.find(dsg => dsg.id === rawSg.id);
          const sgCacheKey = `subgenre:${cat.id}:${g.id}:${rawSg.id}`;
          const cachedSg = localCache[sgCacheKey] || {};
          const mergedSg = {
            ...defaultSg,
            ...rawSg,
            name_hi: cachedSg.name_hi || rawSg.name_hi || defaultSg?.name_hi,
            name_en: cachedSg.name_en || rawSg.name_en || defaultSg?.name_en,
            name_ur: rawSg.name_ur || cachedSg.name_ur || defaultSg?.name_ur
          };

          if (needsDbTranslationRepair(rawSg)) {
            healTaxonomyItemInBackground(
              'subgenres',
              { category_id: cat.id, genre_id: g.id, id: rawSg.id },
              mergedSg,
              sgCacheKey
            );
          }

          const sg = ensureTrilingualEntitySync(mergedSg);
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

        const genreKeywords = [g.id, g.name_en, g.name_hi, g.name_ur].filter(Boolean).map(k => k.toLowerCase());
        const genreBooks = catBooks.filter(b => {
          const bg = (b.genre || '').toLowerCase();
          return genreKeywords.some(k => bg.includes(k) || bg === k);
        });

        return {
          ...g,
          count: genreBooks.length || sgWithCounts.reduce((acc, s) => acc + s.count, 0),
          subgenres_count: sgWithCounts.length,
          subgenres: sgWithCounts
        };
      });

      return {
        ...cat,
        count: catBooks.length,
        genres_count: catGenres.length,
        genres: catGenres
      };
    });
  } catch (err) {
    console.warn('Failed to load categories from Supabase, using bundled hierarchy fallback:', err);
    return DEFAULT_CATEGORIES;
  }
}

// 2. Fetch Books with filters
export async function getBooks(filters = {}) {
  let query = supabase.from('books').select('*');

  if (filters.category && filters.category !== 'all') {
    query = query.eq('category', filters.category);
  }

  if (filters.featured === 'true' || filters.featured === true) {
    query = query.eq('is_featured', true);
  }

  if (filters.limit) {
    query = query.limit(parseInt(filters.limit));
  }

  if (filters.sort === 'popular') {
    query = query.order('downloads_count', { ascending: false });
  } else if (filters.sort === 'views') {
    query = query.order('views_count', { ascending: false });
  } else if (filters.sort === 'latest') {
    query = query.order('created_at', { ascending: false });
  } else if (filters.sort === 'title') {
    query = query.order('title_hi', { ascending: true });
  }

  const { data, error } = await query;
  if (error) throw error;

  let books = (data || []).map(ensureBookTrilingualSync);

  if (filters.genre && filters.genre !== 'all') {
    const gq = filters.genre.toLowerCase();
    books = books.filter(b => (b.genre || '').toLowerCase().includes(gq));
  }

  if (filters.subgenre && filters.subgenre !== 'all') {
    const sq = filters.subgenre.toLowerCase();
    books = books.filter(b => {
      const g = (b.genre || '').toLowerCase();
      const sg = (b.subgenre || '').toLowerCase();
      const tHi = (b.title_hi || '').toLowerCase();
      const tEn = (b.title_en || '').toLowerCase();
      return g.includes(sq) || sg.includes(sq) || tHi.includes(sq) || tEn.includes(sq);
    });
  }

  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    const normQ = q.replace(/\u093C/g, '').replace(/\u095E/g, 'फ').replace(/\u095B/g, 'ज').replace(/\u095A/g, 'ग').replace(/\u0959/g, 'ख').replace(/\u0958/g, 'क');
    books = books.filter(b => {
      const directMatch = (
        (b.title_hi && b.title_hi.toLowerCase().includes(q)) ||
        (b.title_en && b.title_en.toLowerCase().includes(q)) ||
        (b.title_ur && b.title_ur.toLowerCase().includes(q)) ||
        (b.author_hi && b.author_hi.toLowerCase().includes(q)) ||
        (b.author_en && b.author_en.toLowerCase().includes(q)) ||
        (b.author_ur && b.author_ur.toLowerCase().includes(q)) ||
        (b.genre && b.genre.toLowerCase().includes(q)) ||
        (b.subgenre && b.subgenre.toLowerCase().includes(q)) ||
        (b.description && b.description.toLowerCase().includes(q))
      );
      if (directMatch) return true;
      const tHiNorm = (b.title_hi || '').toLowerCase().replace(/\u093C/g, '').replace(/\u095E/g, 'फ').replace(/\u095B/g, 'ज').replace(/\u095A/g, 'ग').replace(/\u0959/g, 'ख').replace(/\u0958/g, 'क');
      const aHiNorm = (b.author_hi || '').toLowerCase().replace(/\u093C/g, '').replace(/\u095E/g, 'फ').replace(/\u095B/g, 'ज').replace(/\u095A/g, 'ग').replace(/\u0959/g, 'ख').replace(/\u0958/g, 'क');
      return tHiNorm.includes(normQ) || aHiNorm.includes(normQ);
    });
  }

  return books;
}

// 3. Increment Views & Downloads
export async function incrementViews(bookId) {
  const { data } = await supabase.from('books').select('views_count').eq('id', bookId).single();
  const next = (data?.views_count || 0) + 1;
  await supabase.from('books').update({ views_count: next }).eq('id', bookId);
  return next;
}

export async function incrementDownloads(bookId) {
  const { data } = await supabase.from('books').select('downloads_count').eq('id', bookId).single();
  const next = (data?.downloads_count || 0) + 1;
  await supabase.from('books').update({ downloads_count: next }).eq('id', bookId);
  return next;
}

// 4. Storage Upload: PDF & Cover
export async function uploadBookFile(file, bucket = 'books') {
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${Date.now()}_${cleanName}`;
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false
  });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return urlData.publicUrl;
}

export async function createBookRecord(bookData) {
  const id = `jsm-${Date.now()}-${Math.round(Math.random() * 1000)}`;
  const titleTrilingual = await getTrilingualNames({
    name_hi: bookData.title_hi,
    name_en: bookData.title_en,
    name_ur: bookData.title_ur
  });
  const authorTrilingual = await getTrilingualNames({
    name_hi: bookData.author_hi,
    name_en: bookData.author_en,
    name_ur: bookData.author_ur
  });

  const payload = {
    ...bookData,
    id,
    title_hi: titleTrilingual.name_hi || bookData.title_hi,
    title_en: titleTrilingual.name_en || bookData.title_en,
    title_ur: titleTrilingual.name_ur || bookData.title_ur,
    author_hi: authorTrilingual.name_hi || bookData.author_hi,
    author_en: authorTrilingual.name_en || bookData.author_en,
    author_ur: authorTrilingual.name_ur || bookData.author_ur,
    views_count: 0,
    downloads_count: 0
  };

  let { data, error } = await supabase.from('books').insert(payload).select().single();
  if (error && error.message && error.message.includes('column')) {
    const { title_ur, author_ur, ...fallbackPayload } = payload;
    const retry = await supabase.from('books').insert(fallbackPayload).select().single();
    if (retry.error) throw retry.error;
    return ensureBookTrilingualSync({ ...retry.data, title_ur, author_ur });
  }
  if (error) throw error;
  return ensureBookTrilingualSync(data);
}

// Helper to insert/update taxonomy table with automatic fallback if `name_ur` column is not in Supabase schema
async function executeTaxonomyWrite(table, operation, payload, matchFilters = {}) {
  const executeQuery = async (body) => {
    let q = supabase.from(table);
    if (operation === 'insert') {
      q = q.insert(body);
    } else {
      q = q.update(body);
      for (const [k, v] of Object.entries(matchFilters)) {
        q = q.eq(k, v);
      }
    }
    return await q.select().single();
  };

  let { data, error } = await executeQuery(payload);
  if (error) {
    // Retry without name_ur in case the Supabase table only has name_hi and name_en columns
    const { name_ur, ...payloadWithoutUr } = payload;
    const retry = await executeQuery(payloadWithoutUr);
    if (retry.error) throw retry.error;
    return { ...retry.data, name_ur };
  }
  return { ...data, name_ur: data?.name_ur || payload.name_ur };
}

// 5. Hierarchy CRUD Operations (Supports creating/updating in ANY of the 3 languages: hi, en, ur)
export async function createFormat(formatData) {
  const trilingual = await getTrilingualNames(formatData);
  const id =
    formatData.id && !/^(fmt|cat)-\d+$/.test(formatData.id)
      ? formatData.id
      : buildSlugId(trilingual.name_en, 'fmt');
  const payload = {
    ...formatData,
    id,
    name_hi: trilingual.name_hi,
    name_en: trilingual.name_en,
    name_ur: trilingual.name_ur
  };
  writeTaxonomyCacheEntry(`cat:${id}`, trilingual);
  return await executeTaxonomyWrite('categories', 'insert', payload);
}

export async function deleteFormat(formatId) {
  const { data, error } = await supabase.from('categories').delete().eq('id', formatId);
  if (error) throw error;
  return data;
}

export async function updateFormat(formatId, updateData) {
  const trilingual = await getTrilingualNames(updateData);
  const payload = {
    ...updateData,
    name_hi: trilingual.name_hi || updateData.name_hi,
    name_en: trilingual.name_en || updateData.name_en,
    name_ur: trilingual.name_ur || updateData.name_ur
  };
  writeTaxonomyCacheEntry(`cat:${formatId}`, trilingual);
  return await executeTaxonomyWrite('categories', 'update', payload, { id: formatId });
}

export async function createGenre(genreData) {
  const trilingual = await getTrilingualNames(genreData);
  const id =
    genreData.id && !/^gnr-\d+$/.test(genreData.id)
      ? genreData.id
      : buildSlugId(trilingual.name_en, 'gnr');
  const payload = {
    ...genreData,
    id,
    name_hi: trilingual.name_hi,
    name_en: trilingual.name_en,
    name_ur: trilingual.name_ur
  };
  writeTaxonomyCacheEntry(`genre:${genreData.category_id}:${id}`, trilingual);
  return await executeTaxonomyWrite('genres', 'insert', payload);
}

export async function deleteGenre(categoryIdOrGenreId, genreId) {
  let query = supabase.from('genres').delete();
  if (genreId) {
    query = query.eq('category_id', categoryIdOrGenreId).eq('id', genreId);
  } else {
    query = query.eq('id', categoryIdOrGenreId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updateGenre(categoryId, genreId, updateData) {
  const trilingual = await getTrilingualNames(updateData);
  const payload = {
    ...updateData,
    name_hi: trilingual.name_hi || updateData.name_hi,
    name_en: trilingual.name_en || updateData.name_en,
    name_ur: trilingual.name_ur || updateData.name_ur
  };
  writeTaxonomyCacheEntry(`genre:${categoryId}:${genreId}`, trilingual);
  return await executeTaxonomyWrite('genres', 'update', payload, {
    category_id: categoryId,
    id: genreId
  });
}

export async function createSubgenre(subgenreData) {
  const trilingual = await getTrilingualNames(subgenreData);
  const id =
    subgenreData.id && !/^(sub|sg)-\d+$/.test(subgenreData.id)
      ? subgenreData.id
      : buildSlugId(trilingual.name_en, 'sub');
  const payload = {
    ...subgenreData,
    id,
    name_hi: trilingual.name_hi,
    name_en: trilingual.name_en,
    name_ur: trilingual.name_ur
  };
  writeTaxonomyCacheEntry(`subgenre:${subgenreData.category_id}:${subgenreData.genre_id}:${id}`, trilingual);
  return await executeTaxonomyWrite('subgenres', 'insert', payload);
}

export async function deleteSubgenre(categoryIdOrSubId, genreId, subgenreId) {
  let query = supabase.from('subgenres').delete();
  if (subgenreId) {
    query = query.eq('category_id', categoryIdOrSubId).eq('genre_id', genreId).eq('id', subgenreId);
  } else if (genreId) {
    query = query.eq('category_id', categoryIdOrSubId).eq('id', genreId);
  } else {
    query = query.eq('id', categoryIdOrSubId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updateSubgenre(categoryId, genreId, subgenreId, updateData) {
  const trilingual = await getTrilingualNames(updateData);
  const payload = {
    ...updateData,
    name_hi: trilingual.name_hi || updateData.name_hi,
    name_en: trilingual.name_en || updateData.name_en,
    name_ur: trilingual.name_ur || updateData.name_ur
  };
  writeTaxonomyCacheEntry(`subgenre:${categoryId}:${genreId}:${subgenreId}`, trilingual);
  return await executeTaxonomyWrite('subgenres', 'update', payload, {
    category_id: categoryId,
    genre_id: genreId,
    id: subgenreId
  });
}

// 6. Book CRUD Operations
export async function updateBookRecord(bookId, updateData) {
  const titleTrilingual = await getTrilingualNames({
    name_hi: updateData.title_hi,
    name_en: updateData.title_en,
    name_ur: updateData.title_ur
  });
  const authorTrilingual = await getTrilingualNames({
    name_hi: updateData.author_hi,
    name_en: updateData.author_en,
    name_ur: updateData.author_ur
  });

  const payload = {
    ...updateData,
    title_hi: titleTrilingual.name_hi || updateData.title_hi,
    title_en: titleTrilingual.name_en || updateData.title_en,
    title_ur: titleTrilingual.name_ur || updateData.title_ur,
    author_hi: authorTrilingual.name_hi || updateData.author_hi,
    author_en: authorTrilingual.name_en || updateData.author_en,
    author_ur: authorTrilingual.name_ur || updateData.author_ur
  };

  let { data, error } = await supabase.from('books').update(payload).eq('id', bookId).select().single();
  if (error && error.message && error.message.includes('column')) {
    const { title_ur, author_ur, ...fallbackPayload } = payload;
    const retry = await supabase.from('books').update(fallbackPayload).eq('id', bookId).select().single();
    if (retry.error) throw retry.error;
    return ensureBookTrilingualSync({ ...retry.data, title_ur, author_ur });
  }
  if (error) throw error;
  return ensureBookTrilingualSync(data);
}

export async function deleteBookRecord(bookId) {
  const { data, error } = await supabase.from('books').delete().eq('id', bookId);
  if (error) throw error;
  return data;
}

// Fetch single book by ID
export async function getBookById(id) {
  if (!id) return null;
  
  // 1. Direct query by ID in Supabase
  try {
    const { data } = await supabase.from('books').select('*').eq('id', id).maybeSingle();
    if (data) return ensureBookTrilingualSync(data);
  } catch (e) {
    console.warn('Supabase getBookById notice:', e);
  }

  // 2. Query all books as fallback
  try {
    const all = await getBooks({ limit: 300 });
    const matched = all.find(b => String(b.id) === String(id) || b.slug === id || String(b._id) === String(id));
    if (matched) return ensureBookTrilingualSync(matched);
  } catch (e) {}

  // 3. Query local backend API fallback
  try {
    const res = await fetch(`/api/books/${id}`);
    const json = await res.json();
    if (json.success && json.book) return ensureBookTrilingualSync(json.book);
  } catch (e) {}

  return null;
}


// 7. Authorized Admin Email Registry (Persisted in Supabase + localStorage)
export const DEFAULT_ADMIN_EMAILS = [
  'suchitmathurwta@gmail.com',
  'farzanamehdi21@gmail.com'
];

const ADMIN_REGISTRY_ROW_ID = '__jsm_admin_registry__';
const ADMIN_EMAILS_STORAGE_KEY = 'jsm_authorized_admin_emails_v1';

function normalizeEmailList(list = []) {
  const merged = [...DEFAULT_ADMIN_EMAILS, ...(Array.isArray(list) ? list : [])];
  const seen = new Set();
  const result = [];
  for (const item of merged) {
    const clean = String(item || '').trim().toLowerCase();
    if (clean && clean.includes('@') && !seen.has(clean)) {
      seen.add(clean);
      result.push(clean);
    }
  }
  return result;
}

export function getCachedAdminEmails() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(ADMIN_EMAILS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return normalizeEmailList(parsed);
        }
      }
    }
  } catch (e) {}
  return [...DEFAULT_ADMIN_EMAILS];
}

export async function getAdminEmails() {
  const localList = getCachedAdminEmails();
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('name_en')
      .eq('id', ADMIN_REGISTRY_ROW_ID)
      .maybeSingle();

    if (!error && data && data.name_en) {
      const parsed = JSON.parse(data.name_en);
      if (Array.isArray(parsed)) {
        const seen = new Set();
        const dbList = [];
        for (const item of ['suchitmathurwta@gmail.com', ...parsed]) {
          const clean = String(item || '').trim().toLowerCase();
          if (clean && clean.includes('@') && !seen.has(clean)) {
            seen.add(clean);
            dbList.push(clean);
          }
        }
        try {
          window.localStorage.setItem(ADMIN_EMAILS_STORAGE_KEY, JSON.stringify(dbList));
        } catch (e) {}
        return dbList;
      }
    }
  } catch (e) {
    console.warn('Notice fetching admin registry from Supabase:', e);
  }
  return localList;
}

export async function saveAdminEmails(emailsList) {
  const seen = new Set();
  const finalEmails = [];
  for (const item of ['suchitmathurwta@gmail.com', ...(Array.isArray(emailsList) ? emailsList : [])]) {
    const clean = String(item || '').trim().toLowerCase();
    if (clean && clean.includes('@') && !seen.has(clean)) {
      seen.add(clean);
      finalEmails.push(clean);
    }
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(ADMIN_EMAILS_STORAGE_KEY, JSON.stringify(finalEmails));
    }
  } catch (e) {}

  const { error } = await supabase.from('categories').upsert({
    id: ADMIN_REGISTRY_ROW_ID,
    name_hi: 'SYS_ADMIN_REGISTRY',
    name_en: JSON.stringify(finalEmails)
  });

  if (error) {
    console.warn('Supabase admin registry sync warning:', error);
  }

  return finalEmails;
}

export async function addAdminEmailToRegistry(email) {
  const clean = String(email || '').trim().toLowerCase();
  if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    throw new Error('Please enter a valid email address.');
  }
  const current = await getAdminEmails();
  if (current.includes(clean)) {
    return current;
  }
  return await saveAdminEmails([...current, clean]);
}

export async function removeAdminEmailFromRegistry(email) {
  const clean = String(email || '').trim().toLowerCase();
  if (clean === 'suchitmathurwta@gmail.com') {
    throw new Error('Primary owner admin (suchitmathurwta@gmail.com) cannot be removed.');
  }
  const current = await getAdminEmails();
  const updated = current.filter(e => e !== clean);
  return await saveAdminEmails(updated);
}
