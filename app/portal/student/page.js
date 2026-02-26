'use client';
// Student Portal — Library access for students (class 8, 9, 10)
// Browse, search, borrow, and return books

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function StudentPortal() {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState('');
    const [fetching, setFetching] = useState(true);
    const [msg, setMsg] = useState('');

    // Guard — redirect if not student
    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'student')) {
            router.replace('/login');
        }
    }, [user, authLoading, router]);

    // Fetch library books
    const fetchBooks = (q = '') => {
        setFetching(true);
        const url = q ? `/api/library?search=${q}` : '/api/library';
        api.get(url)
            .then(r => setBooks(r.data))
            .catch(() => { })
            .finally(() => setFetching(false));
    };

    useEffect(() => { if (user) fetchBooks(); }, [user]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchBooks(search);
    };

    // Check if current user has borrowed a book
    const isBorrowed = (book) =>
        book.borrowedBy?.some(b => b.student === user?._id || b.student?._id === user?.id);

    const borrow = async (bookId) => {
        try {
            await api.post(`/api/library/borrow/${bookId}`);
            setMsg('✅ Book borrowed successfully!');
            fetchBooks(search);
        } catch (err) {
            setMsg(`❌ ${err.response?.data?.message || 'Error borrowing book'}`);
        }
        setTimeout(() => setMsg(''), 3000);
    };

    const returnBook = async (bookId) => {
        try {
            await api.post(`/api/library/return/${bookId}`);
            setMsg('✅ Book returned successfully!');
            fetchBooks(search);
        } catch (err) {
            setMsg(`❌ ${err.response?.data?.message || 'Error returning book'}`);
        }
        setTimeout(() => setMsg(''), 3000);
    };

    if (authLoading || !user) return null;

    return (
        <div className="pt-[88px] min-h-screen bg-gray-50">
            <div className="container-custom py-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <p className="text-gray-500 text-sm">Student Portal</p>
                        <h1 className="heading-md" style={{ color: 'var(--navy)' }}>Welcome, {user.name} 👋</h1>
                        <span className="badge badge-notice mt-1">Class {user.classGrade}</span>
                    </div>
                    <button onClick={logout} className="text-sm text-red-500 font-medium hover:text-red-700">Logout</button>
                </div>

                {/* Flash message */}
                {msg && (
                    <div className={`p-3 rounded-lg mb-6 text-sm font-medium ${msg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {msg}
                    </div>
                )}

                {/* Search */}
                <div className="card p-6 mb-6">
                    <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--navy)' }}>📚 School Library</h2>
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <input className="form-input flex-1" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search by title or author…" />
                        <button type="submit" className="btn-primary px-4 py-2">Search</button>
                    </form>
                </div>

                {/* Books grid */}
                {fetching ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="card p-5 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
                                <div className="h-8 bg-gray-200 rounded" />
                            </div>
                        ))}
                    </div>
                ) : books.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-5xl mb-3">📭</p>
                        <p>No books found</p>
                    </div>
                ) : (
                    <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                        initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }}>
                        {books.map(book => {
                            const borrowed = isBorrowed(book);
                            return (
                                <motion.div key={book._id} variants={fadeUp} className="card p-5 flex flex-col">
                                    {/* Cover placeholder */}
                                    <div style={{ background: 'var(--navy)' }}
                                        className="h-24 rounded-lg flex items-center justify-center text-white text-4xl mb-4">
                                        📖
                                    </div>
                                    <p className="font-semibold text-sm leading-snug mb-1" style={{ color: 'var(--navy)' }}>{book.title}</p>
                                    <p className="text-gray-400 text-xs mb-1">by {book.author}</p>
                                    <span className="text-xs text-gray-500 mb-3">{book.category}</span>
                                    {/* Availability badge */}
                                    <p className={`text-xs font-semibold mb-3 ${book.available > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {book.available > 0 ? `${book.available} copies available` : 'Unavailable'}
                                    </p>
                                    <div className="mt-auto">
                                        {borrowed ? (
                                            <button onClick={() => returnBook(book._id)}
                                                className="w-full text-sm py-2 px-3 rounded-lg font-semibold border-2 border-red-300 text-red-600 hover:bg-red-50 transition-colors">
                                                Return Book
                                            </button>
                                        ) : (
                                            <button onClick={() => borrow(book._id)}
                                                disabled={book.available === 0}
                                                className={`w-full text-sm py-2 px-3 rounded-lg font-semibold transition-colors ${book.available > 0
                                                        ? 'text-white'
                                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    }`}
                                                style={book.available > 0 ? { background: 'var(--navy)' } : {}}>
                                                {book.available > 0 ? 'Borrow' : 'Unavailable'}
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
