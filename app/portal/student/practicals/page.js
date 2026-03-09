'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/lib/api';

export default function StudentPracticals() {
    const { user } = useAuth();
    const [videos, setVideos] = useState([]);
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!user) return;
        const uid = user.id || user._id;
        Promise.all([
            api.get('/api/videos'),
            api.get(`/api/students/${uid}/books`)
        ]).then(([vRes, bRes]) => {
            setVideos(vRes.data);
            setBorrowedBooks(bRes.data);
        }).catch(err => console.error(err))
          .finally(() => setFetching(false));
    }, [user]);

    const getYouTubeId = (url) => {
        const m = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i);
        return m ? m[1] : null;
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Practical Learning</h1>
                <p className="text-gray-400 mt-1 text-sm">Video demos and practical resources from your teachers.</p>
            </div>

            {/* Videos Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-violet-500 rounded-full" />
                    <h2 className="text-lg font-black text-gray-800">Learning Videos</h2>
                    {!fetching && <span className="bg-violet-50 text-violet-700 text-xs font-bold px-2.5 py-1 rounded-full">{videos.length}</span>}
                </div>

                {fetching ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[1, 2, 3].map(i => <div key={i} className="h-56 bg-gray-100 rounded-3xl animate-pulse" />)}
                    </div>
                ) : videos.length === 0 ? (
                    <div className="bg-white border border-dashed border-gray-200 rounded-3xl py-14 text-center text-gray-400">
                        <div className="text-4xl mb-2">🎬</div>
                        <p className="text-sm font-medium">No videos uploaded for Class {user?.classGrade} yet.</p>
                        <p className="text-xs mt-1">Your teacher will upload practical videos here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {videos.map(video => {
                            const ytId = getYouTubeId(video.url);
                            const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;
                            return (
                                <div key={video._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col">
                                    {/* Thumbnail */}
                                    <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
                                        {thumb ? (
                                            <img src={thumb} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-violet-600 to-indigo-800 flex items-center justify-center">
                                                <span className="text-4xl opacity-50">🎥</span>
                                            </div>
                                        )}
                                        <a href={video.url} target="_blank" rel="noopener noreferrer"
                                            className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg pl-1 transform group-hover:scale-110 transition-transform">
                                                <span className="text-violet-600 text-lg">▶</span>
                                            </div>
                                        </a>
                                    </div>
                                    {/* Info */}
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 mb-1">{video.title}</h3>
                                        <p className="text-xs text-gray-400 line-clamp-2 flex-1">{video.description}</p>
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-[10px] font-black">
                                                    {video.uploadedBy?.name?.charAt(0) || 'T'}
                                                </div>
                                                <span className="text-[11px] text-gray-500 font-medium">{video.uploadedBy?.name || 'Teacher'}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">Class {video.classGrade}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Borrowed Books Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-blue-500 rounded-full" />
                    <h2 className="text-lg font-black text-gray-800">Currently Borrowing</h2>
                    {!fetching && <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">{borrowedBooks.length}</span>}
                </div>

                {fetching ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[1, 2].map(i => <div key={i} className="h-28 bg-gray-100 rounded-3xl animate-pulse" />)}
                    </div>
                ) : borrowedBooks.length === 0 ? (
                    <div className="bg-white border border-dashed border-gray-200 rounded-3xl py-10 text-center text-gray-400">
                        <div className="text-3xl mb-2">📭</div>
                        <p className="text-sm font-medium">No borrowed books right now.</p>
                        <p className="text-xs mt-1">Visit the Library tab to borrow books.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {borrowedBooks.map(book => (
                            <div key={'bp-' + book._id} className="bg-white border border-gray-100 rounded-3xl p-4 flex gap-4 shadow-sm">
                                <div className="w-12 h-16 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md">
                                    {book.category?.substring(0, 3)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-800 text-sm line-clamp-1">{book.title}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">by {book.author}</p>
                                    {book.dueDate && <p className="text-[10px] text-red-400 font-semibold mt-1.5">Due: {new Date(book.dueDate).toLocaleDateString()}</p>}
                                    {book.pdfUrl && (
                                        <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer"
                                            className="inline-block mt-2 text-[11px] text-blue-600 font-bold hover:underline">
                                            📄 Read PDF →
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
