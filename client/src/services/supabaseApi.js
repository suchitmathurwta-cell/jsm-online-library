import { supabase } from './supabaseClient';

// 1. Fetch Categories with nested Genres, Subgenres & real-time book counts
export async function getCategoriesWithHierarchy() {
  const [catRes, genreRes, subRes, bookRes] = await Promise.all([
    supabase.from('categories').select('*').order('created_at', { ascending: true }),
    supabase.from('genres').select('*').order('created_at', { ascending: true }),
    supabase.from('subgenres').select('*').order('created_at', { ascending: true }),
    supabase.from('books').select('id, category, genre, subgenre, title_hi, title_en')
  ]);

  if (catRes.error) throw catRes.error;
  if (genreRes.error) throw genreRes.error;
  if (subRes.error) throw subRes.error;

  const categories = catRes.data || [];
  const genres = genreRes.data || [];
  const subgenres = subRes.data || [];
  const books = bookRes.data || [];

  return categories.map(cat => {
    const catBooks = books.filter(b => b.category === cat.id);
    const catGenres = genres.filter(g => g.category_id === cat.id).map(g => {
      const genreKeywords = [g.id, g.name_en, g.name_hi, g.name_ur].filter(Boolean).map(k => k.toLowerCase());
      const genreBooks = catBooks.filter(b => {
        const bg = (b.genre || '').toLowerCase();
        return genreKeywords.some(k => bg.includes(k) || bg === k);
      });

      const gSubgenres = subgenres.filter(sg => sg.category_id === cat.id && sg.genre_id === g.id).map(sg => {
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
        count: genreBooks.length || gSubgenres.reduce((acc, s) => acc + s.count, 0),
        subgenres_count: gSubgenres.length,
        subgenres: gSubgenres
      };
    });

    return {
      ...cat,
      count: catBooks.length,
      genres_count: catGenres.length,
      genres: catGenres
    };
  });
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

  let books = data || [];

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
    books = books.filter(b => (
      (b.title_hi && b.title_hi.toLowerCase().includes(q)) ||
      (b.title_en && b.title_en.toLowerCase().includes(q)) ||
      (b.author_hi && b.author_hi.toLowerCase().includes(q)) ||
      (b.author_en && b.author_en.toLowerCase().includes(q)) ||
      (b.genre && b.genre.toLowerCase().includes(q)) ||
      (b.subgenre && b.subgenre.toLowerCase().includes(q)) ||
      (b.description && b.description.toLowerCase().includes(q))
    ));
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
  const id = `chetna-${Date.now()}-${Math.round(Math.random() * 1000)}`;
  const { data, error } = await supabase.from('books').insert({
    ...bookData,
    id,
    views_count: 0,
    downloads_count: 0
  }).select().single();

  if (error) throw error;
  return data;
}

// 5. Hierarchy CRUD Operations
export async function createFormat(formatData) {
  const { data, error } = await supabase.from('categories').insert(formatData).select().single();
  if (error) throw error;
  return data;
}

export async function deleteFormat(formatId) {
  const { data, error } = await supabase.from('categories').delete().eq('id', formatId);
  if (error) throw error;
  return data;
}

export async function updateFormat(formatId, updateData) {
  const { data, error } = await supabase.from('categories').update(updateData).eq('id', formatId).select().single();
  if (error) throw error;
  return data;
}

export async function createGenre(genreData) {
  const { data, error } = await supabase.from('genres').insert(genreData).select().single();
  if (error) throw error;
  return data;
}

export async function deleteGenre(categoryId, genreId) {
  const { data, error } = await supabase.from('genres').delete().eq('category_id', categoryId).eq('id', genreId);
  if (error) throw error;
  return data;
}

export async function updateGenre(categoryId, genreId, updateData) {
  const { data, error } = await supabase.from('genres').update(updateData).eq('category_id', categoryId).eq('id', genreId).select().single();
  if (error) throw error;
  return data;
}

export async function createSubgenre(subgenreData) {
  const { data, error } = await supabase.from('subgenres').insert(subgenreData).select().single();
  if (error) throw error;
  return data;
}

export async function deleteSubgenre(categoryId, genreId, subgenreId) {
  const { data, error } = await supabase.from('subgenres').delete()
    .eq('category_id', categoryId)
    .eq('genre_id', genreId)
    .eq('id', subgenreId);
  if (error) throw error;
  return data;
}

export async function updateSubgenre(categoryId, genreId, subgenreId, updateData) {
  const { data, error } = await supabase.from('subgenres').update(updateData)
    .eq('category_id', categoryId)
    .eq('genre_id', genreId)
    .eq('id', subgenreId)
    .select().single();
  if (error) throw error;
  return data;
}

// 6. Book CRUD Operations
export async function updateBookRecord(bookId, updateData) {
  const { data, error } = await supabase.from('books').update(updateData).eq('id', bookId).select().single();
  if (error) throw error;
  return data;
}

export async function deleteBookRecord(bookId) {
  const { data, error } = await supabase.from('books').delete().eq('id', bookId);
  if (error) throw error;
  return data;
}
