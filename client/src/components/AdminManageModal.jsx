import React, { useState, useEffect } from 'react';
import { getCategoriesWithHierarchy, getBooks, deleteFormat, updateFormat, createFormat, deleteGenre, updateGenre, createGenre, deleteSubgenre, updateSubgenre, createSubgenre } from '../services/supabaseApi';
import { supabase } from '../services/supabaseClient';
import {
  X,
  BookOpen,
  Trash2,
  Download,
  Eye,
  Search,
  PlusCircle,
  BarChart3,
  Calendar,
  Layers,
  FolderTree,
  FolderOpen,
  Edit2,
  ChevronDown,
  ChevronRight,
  Plus
} from 'lucide-react';

export default function AdminManageModal({
  onClose,
  onOpenUpload,
  onOpenReader,
  onDownloadBook,
  onBookDeleted,
  lang,
  t
}) {
  const [activeTab, setActiveTab] = useState('hierarchy'); // 'hierarchy' | 'books'
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Hierarchy expansion state
  const [expandedCats, setExpandedCats] = useState({});
  const [expandedGenres, setExpandedGenres] = useState({});

  // Hierarchy edit/delete state
  const [editingItem, setEditingItem] = useState(null); // { type: 'category'|'genre'|'subgenre', data, catId, genreId }
  const [editNameHi, setEditNameHi] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // New item creation state
  const [addingUnder, setAddingUnder] = useState(null); // { type: 'genre'|'subgenre', catId, genreId }
  const [newItemName, setNewItemName] = useState('');

  const fetchLibraryData = async () => {
    setIsLoading(true);
    try {
      const [booksData, catsData] = await Promise.all([
        getBooks({ limit: 250 }),
        getCategoriesWithHierarchy()
      ]);
      setBooks(booksData || []);
      setCategories(catsData || []);
      const initCats = {};
      (catsData || []).slice(0, 3).forEach(c => { initCats[c.id] = true; });
      setExpandedCats(initCats);
    } catch (e) {
      console.error('Error fetching admin data from Supabase:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraryData();
  }, []);

  const handleDeleteBook = async (id) => {
    try {
      await supabase.from('books').delete().eq('id', id);
      setBooks((prev) => prev.filter((b) => b.id !== id));
      setDeleteConfirmId(null);
      if (onBookDeleted) onBookDeleted(id);
      fetchLibraryData();
    } catch (e) {
      alert('Error deleting book: ' + e.message);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Are you sure you want to delete this Category?')) return;
    try {
      const res = await fetch(`/api/categories/${catId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) fetchLibraryData();
      else alert(json.error || 'Failed to delete category');
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeleteGenre = async (catId, genreId) => {
    if (!window.confirm('Are you sure you want to delete this Genre?')) return;
    try {
      const res = await fetch(`/api/categories/${catId}/genres/${genreId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) fetchLibraryData();
      else alert(json.error || 'Failed to delete genre');
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeleteSubGenre = async (catId, genreId, subId) => {
    if (!window.confirm('Are you sure you want to delete this Sub-Genre?')) return;
    try {
      const res = await fetch(`/api/categories/${catId}/genres/${genreId}/subgenres/${subId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) fetchLibraryData();
      else alert(json.error || 'Failed to delete sub-genre');
    } catch (e) {
      alert(e.message);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSubmittingEdit(true);
    try {
      let url = '';
      if (editingItem.type === 'category') {
        url = `/api/categories/${editingItem.data.id}`;
      } else if (editingItem.type === 'genre') {
        url = `/api/categories/${editingItem.catId}/genres/${editingItem.data.id}`;
      } else if (editingItem.type === 'subgenre') {
        url = `/api/categories/${editingItem.catId}/genres/${editingItem.genreId}/subgenres/${editingItem.data.id}`;
      }

      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name_hi: editNameHi.trim(),
          name_en: editNameEn.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setEditingItem(null);
        fetchLibraryData();
      } else {
        alert(data.error || 'Failed to save changes');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleCreateNewItem = async (e) => {
    e.preventDefault();
    if (!addingUnder || !newItemName.trim()) return;
    try {
      let url = '';
      if (addingUnder.type === 'genre') {
        url = `/api/categories/${addingUnder.catId}/genres`;
      } else if (addingUnder.type === 'subgenre') {
        url = `/api/categories/${addingUnder.catId}/genres/${addingUnder.genreId}/subgenres`;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newItemName.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setAddingUnder(null);
        setNewItemName('');
        fetchLibraryData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const openEdit = (type, data, catId = null, genreId = null) => {
    setEditingItem({ type, data, catId, genreId });
    setEditNameHi(data.name_hi || '');
    setEditNameEn(data.name_en || '');
  };

  const filteredBooks = books.filter((b) => {
    const q = searchTerm.toLowerCase();
    return (
      (b.title_en && b.title_en.toLowerCase().includes(q)) ||
      (b.title_hi && b.title_hi.toLowerCase().includes(q)) ||
      (b.author_en && b.author_en.toLowerCase().includes(q)) ||
      (b.author_hi && b.author_hi.toLowerCase().includes(q)) ||
      (b.category && b.category.toLowerCase().includes(q)) ||
      (b.genre && b.genre.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative bg-white rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden border border-stone-200 my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#1d4ed8] text-white">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 font-rekhta-serif">
                {t.admin.title}
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Manage Formats, Genres, Sub-Genres, and Digital Books Archive
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenUpload}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-semibold rounded-lg shadow-xs transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t.nav.uploadBook}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs: Hierarchy vs Books */}
        <div className="flex border-b border-stone-200 px-6 pt-3 bg-stone-50/50 gap-4">
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`pb-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'hierarchy'
                ? 'border-[#1d4ed8] text-[#1d4ed8]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>🗂️ Formats, Genres & Sub-Genres Hierarchy</span>
          </button>
          <button
            onClick={() => setActiveTab('books')}
            className={`pb-2.5 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
              activeTab === 'books'
                ? 'border-[#1d4ed8] text-[#1d4ed8]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>📚 Digitized Books Archive ({books.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          
          {/* TAB 1: Hierarchy Tree Manager */}
          {activeTab === 'hierarchy' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  Click on any format to view and manage its nested genres and sub-genres. You can create, rename, or delete any tier.
                </span>
              </div>

              <div className="space-y-3">
                {categories.map((cat) => {
                  const isCatOpen = !!expandedCats[cat.id];
                  const genres = cat.genres || [];

                  return (
                    <div key={cat.id} className="border border-stone-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
                      
                      {/* Format Header Row */}
                      <div className="flex items-center justify-between p-3.5 bg-stone-50/90 border-b border-stone-200">
                        <div
                          className="flex items-center gap-2.5 cursor-pointer flex-1"
                          onClick={() => setExpandedCats(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                        >
                          <span className="text-stone-400">
                            {isCatOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </span>
                          <span className="font-bold text-stone-900 text-sm font-rekhta-serif">
                            {cat.name_hi || cat.name_en}
                          </span>
                          {cat.name_en && cat.name_en !== cat.name_hi && (
                            <span className="text-xs text-stone-500">({cat.name_en})</span>
                          )}
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#1d4ed8]">
                            {genres.length} Genres
                          </span>
                          <span className="text-[10px] text-stone-500">
                            {cat.count || 0} Works
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setAddingUnder({ type: 'genre', catId: cat.id })}
                            title="Add Genre to this Format"
                            className="px-2.5 py-1 text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-[#1d4ed8] rounded-lg border border-blue-200 flex items-center gap-1 transition"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Genre</span>
                          </button>
                          <button
                            onClick={() => openEdit('category', cat)}
                            title="Edit Format Name"
                            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            title="Delete Format"
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Category: Genres List */}
                      {isCatOpen && (
                        <div className="p-4 pl-6 space-y-3 bg-stone-50/30">
                          {/* Inline Add Genre Form */}
                          {addingUnder && addingUnder.type === 'genre' && addingUnder.catId === cat.id && (
                            <form onSubmit={handleCreateNewItem} className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 flex items-center gap-2">
                              <input
                                type="text"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                placeholder="New Genre Name (e.g. Ghazal, Regional Novel)..."
                                className="flex-1 px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg"
                                autoFocus
                              />
                              <button type="submit" className="px-3 py-1.5 bg-[#1d4ed8] text-white text-xs font-bold rounded-lg">+ Add</button>
                              <button type="button" onClick={() => setAddingUnder(null)} className="px-2 py-1.5 text-xs text-stone-500">Cancel</button>
                            </form>
                          )}

                          {genres.length > 0 ? (
                            genres.map((g) => {
                              const isGenreOpen = !!expandedGenres[g.id];
                              const subgenres = g.subgenres || [];

                              return (
                                <div key={g.id} className="border border-stone-200/80 rounded-xl bg-white overflow-hidden">
                                  {/* Genre Row */}
                                  <div className="flex items-center justify-between p-2.5 bg-white border-b border-stone-100">
                                    <div
                                      className="flex items-center gap-2 cursor-pointer flex-1"
                                      onClick={() => setExpandedGenres(prev => ({ ...prev, [g.id]: !prev[g.id] }))}
                                    >
                                      <FolderTree className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                      <span className="font-bold text-stone-800 text-xs font-hindi-serif">
                                        {g.name_hi || g.name_en}
                                      </span>
                                      {g.name_en && g.name_en !== g.name_hi && (
                                        <span className="text-[11px] text-stone-400">({g.name_en})</span>
                                      )}
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                                        {subgenres.length} Sub-Genres
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => setAddingUnder({ type: 'subgenre', catId: cat.id, genreId: g.id })}
                                        className="px-2 py-0.5 text-[10.5px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-md border border-amber-200 flex items-center gap-0.5 transition"
                                      >
                                        <Plus className="w-2.5 h-2.5" />
                                        <span>Add Sub-Genre</span>
                                      </button>
                                      <button
                                        onClick={() => openEdit('genre', g, cat.id)}
                                        className="p-1 text-stone-400 hover:text-stone-700 rounded-md"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteGenre(cat.id, g.id)}
                                        className="p-1 text-stone-400 hover:text-red-600 rounded-md"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Subgenres List */}
                                  {isGenreOpen && (
                                    <div className="p-3 pl-8 bg-stone-50/50 space-y-2">
                                      {addingUnder && addingUnder.type === 'subgenre' && addingUnder.genreId === g.id && (
                                        <form onSubmit={handleCreateNewItem} className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-200 flex items-center gap-2">
                                          <input
                                            type="text"
                                            value={newItemName}
                                            onChange={(e) => setNewItemName(e.target.value)}
                                            placeholder="New Sub-Genre Name (e.g. Agrarian Struggles)..."
                                            className="flex-1 px-3 py-1 text-xs bg-white border border-stone-300 rounded-lg"
                                            autoFocus
                                          />
                                          <button type="submit" className="px-3 py-1 bg-[#1d4ed8] text-white text-xs font-bold rounded-lg">+ Add</button>
                                          <button type="button" onClick={() => setAddingUnder(null)} className="px-2 py-1 text-xs text-stone-500">Cancel</button>
                                        </form>
                                      )}

                                      {subgenres.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                          {subgenres.map((sg) => (
                                            <div key={sg.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200/90 text-xs">
                                              <div className="truncate mr-2">
                                                <span className="font-semibold text-stone-800">{sg.name_hi || sg.name_en}</span>
                                                {sg.name_en && sg.name_en !== sg.name_hi && (
                                                  <span className="text-[10px] text-stone-400 block truncate">{sg.name_en}</span>
                                                )}
                                              </div>
                                              <div className="flex items-center gap-0.5 shrink-0">
                                                <button
                                                  onClick={() => openEdit('subgenre', sg, cat.id, g.id)}
                                                  className="p-1 text-stone-400 hover:text-stone-700"
                                                >
                                                  <Edit2 className="w-3 h-3" />
                                                </button>
                                                <button
                                                  onClick={() => handleDeleteSubGenre(cat.id, g.id, sg.id)}
                                                  className="p-1 text-stone-400 hover:text-red-600"
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-[11px] text-stone-400 italic">No sub-genres yet. Click "+ Add Sub-Genre" above.</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-xs text-stone-400 italic">No genres yet. Click "+ Add Genre" above.</p>
                          )}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Books Table */}
          {activeTab === 'books' && (
            <div>
              {/* Search in Books */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search books by title, author, category, genre..."
                    className="w-full pl-9 pr-4 py-2 text-xs border border-stone-300 rounded-xl outline-hidden focus:border-[#1d4ed8]"
                  />
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Books Table */}
              <div className="overflow-x-auto border border-stone-200 rounded-2xl">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold text-[10.5px]">
                    <tr>
                      <th className="px-4 py-3">Book Title</th>
                      <th className="px-4 py-3">Author</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Genre / Subgenre</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredBooks.map((book) => (
                      <tr key={book.id} className="hover:bg-stone-50 transition">
                        <td className="px-4 py-3 font-medium text-stone-900">
                          <div className="font-hindi-serif font-bold text-xs">{book.title_hi || book.title_en}</div>
                          {book.title_en && book.title_en !== book.title_hi && (
                            <div className="text-[10px] text-stone-400 font-normal">{book.title_en}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-stone-600">{book.author_hi || book.author_en}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#1d4ed8] text-[10px] font-bold border border-blue-200">
                            {book.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-stone-500 text-[11px]">
                          {book.genre || 'General'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => { onClose(); onOpenReader(book); }}
                              title="Read Book"
                              className="p-1.5 text-stone-500 hover:text-[#1d4ed8] rounded-lg hover:bg-stone-100 transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDownloadBook(book)}
                              title="Download PDF"
                              className="p-1.5 text-stone-500 hover:text-[#1d4ed8] rounded-lg hover:bg-stone-100 transition"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            {deleteConfirmId === book.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDeleteBook(book.id)}
                                  className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-2 py-1 bg-stone-200 text-stone-700 rounded text-[10px]"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(book.id)}
                                title="Delete Book"
                                className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-stone-200 bg-stone-50 text-xs text-stone-500">
          <span>Chetna Preservation & Archival Control System</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 text-white font-bold rounded-lg hover:bg-stone-900 transition"
          >
            Close
          </button>
        </div>

      </div>

      {/* Edit Hierarchy Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-stone-900 font-rekhta-serif mb-4 capitalize">
              Edit {editingItem.type} Name
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Name (Hindi / Devnagari)</label>
                <input
                  type="text"
                  value={editNameHi}
                  onChange={(e) => setEditNameHi(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl outline-hidden focus:border-[#1d4ed8]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Name (English)</label>
                <input
                  type="text"
                  value={editNameEn}
                  onChange={(e) => setEditNameEn(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl outline-hidden focus:border-[#1d4ed8]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-4 py-2 bg-[#1d4ed8] text-white font-bold rounded-xl shadow-xs"
                >
                  {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
