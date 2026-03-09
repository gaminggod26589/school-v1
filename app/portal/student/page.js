'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/lib/api';

export default function StudentLibrary() {
    const { user } = useAuth();
    const [books, setBooks] = useState([]);
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [search, setSearch] = useState('');
    const [fetching, setFetching] = useState(true);
    const [msg, setMsg] = useState(null);

    const fetchData = async (q = '') => {
        if (!user) return;
        setFetching(true);
        try {
            const libUrl = q ? `/api/library?search=${q}` : '/api/library';
            const [libRes, borrowRes] = await Promise.all([
                api.get(libUrl),
                api.get(`/api/students/${user.id || user._id}/books`)
            ]);
            setBooks(libRes.data);
            setBorrowedBooks(borrowRes.data);
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => { fetchData(); }, [user]);

    const showMsg = (text, ok = true) => {
        setMsg({ text, ok });
        setTimeout(() => setMsg(null), 3000);
    };

    const handleSearch = (e) => { e.preventDefault(); fetchData(search); };

    const isBorrowed = (bookId) => borrowedBooks.some(b => b._id === bookId);

    const borrow = async (bookId) => {
        try {
            await api.post(`/api/library/borrow/${bookId}`);
            showMsg('Book borrowed! Happy reading 📖');
            fetchData(search);
        } catch (err) { showMsg(err.response?.data?.message || 'Error borrowing book', false); }
    };

    const returnBook = async (bookId) => {
        try {
            await api.post(`/api/library/return/${bookId}`);
            showMsg('Book returned successfully ✅');
            fetchData(search);
        } catch (err) { showMsg(err.response?.data?.message || 'Error returning book', false); }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Library</h1>
                    <p className="text-gray-400 mt-1 text-sm">Browse, borrow, and read your digital books.</p>
                </div>
                <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
                    <input
                        className="flex-1 sm:w-60 bg-white border border-gray-200 text-gray-800 text-sm rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        value={search} onChange={e => setSearch(e.target.value)} placeholder="Search books…" />
                    <button type="submit" className="bg-gray-900 hover:bg-gray-700 text-white px-5 py-2.5 rounded-2xl text-sm font-bold transition-colors shadow-sm shrink-0">
                        Search
                    </button>
                </form>
            </div>

            {/* Toast */}
            {msg && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold text-white transition-all ${msg.ok ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    {msg.text}
                </div>
            )}

            {/* Currently Borrowing */}
            <section>
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-1 h-6 bg-blue-600 rounded-full" />
                    <h2 className="text-lg font-black text-gray-800">Currently Borrowing</h2>
                    {!fetching && <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">{borrowedBooks.length}</span>}
                </div>

                {fetching ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-28 rounded-3xl bg-gray-100 animate-pulse" />)}
                    </div>
                ) : borrowedBooks.length === 0 ? (
                    <div className="bg-white border border-dashed border-gray-200 rounded-3xl py-10 text-center text-gray-400">
                        <div className="text-4xl mb-2">📭</div>
                        <p className="text-sm font-medium">You haven't borrowed any books yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {borrowedBooks.map(book => (
                            <div key={'b-' + book._id} className="bg-white border border-gray-100 rounded-3xl p-5 flex gap-4 shadow-sm hover:shadow-md transition-shadow">
                                {/* Spine graphic or Cover Image */}
                                {book.coverImage ? (
                                    <div className="w-14 h-full min-h-[70px] rounded-2xl shrink-0 overflow-hidden shadow-md">
                                        <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-14 h-full min-h-[70px] rounded-2xl shrink-0 flex flex-col items-center justify-center text-white text-[9px] font-bold text-center p-1 shadow-md"
                                        style={{ background: 'linear-gradient(135deg,#1e3a8a,#0f2557)' }}>
                                        <span className="text-2xl mb-1">{book.pdfUrl ? '🔓' : '📗'}</span>
                                        {book.category?.substring(0, 4).toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0 flex flex-col">
                                    <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">{book.title}</h3>
                                    <p className="text-xs text-gray-400 mt-0.5 truncate">by {book.author}</p>
                                    {book.dueDate && (
                                        <p className="text-[10px] text-red-500 font-semibold mt-1">
                                            Due: {new Date(book.dueDate).toLocaleDateString()}
                                        </p>
                                    )}
                                    <div className="flex gap-2 mt-3">
                                        {book.pdfUrl ? (
                                            <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer"
                                                className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-2 rounded-xl transition-colors">
                                                Read PDF
                                            </a>
                                        ) : (
                                            <span className="flex-1 text-center bg-gray-100 text-gray-400 text-[11px] font-bold px-3 py-2 rounded-xl cursor-not-allowed">
                                                Physical Book
                                            </span>
                                        )}
                                        <button onClick={() => returnBook(book._id)}
                                            className="bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 text-[11px] font-bold px-3 py-2 rounded-xl transition-colors">
                                            Return
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* School Catalog */}
            <section>
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-1 h-6 bg-green-500 rounded-full" />
                    <h2 className="text-lg font-black text-gray-800">School Catalog</h2>
                    {!fetching && <span className="bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">{books.length} books</span>}
                </div>

                {fetching ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-56 rounded-3xl bg-gray-100 animate-pulse" />)}
                    </div>
                ) : books.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 bg-white rounded-3xl border border-gray-100">
                        <p className="text-5xl mb-3">🔍</p>
                        <p className="text-sm font-medium">No books found matching your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {books.map(book => {
                            const borrowed = isBorrowed(book._id);
                            const colors = [
                                'from-blue-700 to-indigo-900', 'from-emerald-600 to-teal-900',
                                'from-violet-600 to-purple-900', 'from-rose-600 to-red-900',
                                'from-amber-600 to-orange-800',
                            ];
                            const color = colors[book.title.charCodeAt(0) % colors.length];
                            return (
                                <div key={book._id}
                                    className={`bg-white rounded-3xl border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group ${borrowed ? 'border-blue-200' : 'border-gray-100'}`}>
                                    {/* Book Cover */}
                                    {book.coverImage ? (
                                        <div className="w-full aspect-[3/4] relative overflow-hidden bg-gray-100">
                                            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                                            {book.pdfUrl && (
                                                <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-[9px] font-black px-2 py-0.5 rounded-full uppercase z-10">PDF</span>
                                            )}
                                            {borrowed && (
                                                <span className="absolute top-3 left-3 bg-blue-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase z-10">Yours</span>
                                            )}
                                            {/* Gradient overlay for text readability at bottom */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                                <p className="text-white text-xs font-bold leading-tight line-clamp-3">{book.title}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={`w-full aspect-[3/4] bg-gradient-to-br ${color} flex items-end p-4 relative`}>
                                            {book.pdfUrl && (
                                                <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">PDF</span>
                                            )}
                                            {borrowed && (
                                                <span className="absolute top-3 left-3 bg-blue-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Yours</span>
                                            )}
                                            <div className="absolute left-3 top-0 bottom-0 w-px bg-white/15"></div>
                                            <p className="text-white/80 text-xs font-bold leading-tight line-clamp-3">{book.title}</p>
                                        </div>
                                    )}
                                    {/* Info */}
                                    <div className="p-3">
                                        <p className="font-bold text-xs text-gray-800 truncate">{book.title}</p>
                                        <p className="text-[10px] text-gray-400 truncate mt-0.5">by {book.author}</p>
                                        <div className="flex items-center justify-between mt-2 mb-3">
                                            <span className={`text-[10px] font-black ${book.available > 0 ? 'text-green-500' : 'text-red-400'}`}>
                                                {book.available > 0 ? `${book.available} avail.` : 'Out of stock'}
                                            </span>
                                        </div>
                                        {borrowed ? (
                                            <button disabled className="w-full bg-blue-50 text-blue-500 border border-blue-100 font-bold text-[10px] py-2 rounded-xl cursor-not-allowed">
                                                ✓ In Your Library
                                            </button>
                                        ) : (
                                            <button onClick={() => borrow(book._id)} disabled={book.available === 0}
                                                className={`w-full font-bold text-[11px] py-2 rounded-xl transition-all ${book.available > 0 
                                                    ? 'bg-gray-900 hover:bg-gray-700 text-white' 
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                                                {book.available > 0 ? 'Borrow' : 'Unavailable'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
