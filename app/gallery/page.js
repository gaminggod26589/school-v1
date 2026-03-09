'use client';
// Gallery page — photo grid showcasing school life
// Static demo images with colored placeholders (replace with real img srcs)
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Demo gallery items — in production, replace bg with real image URLs
const ITEMS = [
    { id: 1, category: 'events', label: 'Annual Sports Day 2024', bg: '#0f2557', emoji: '🏃' },
    { id: 2, category: 'academics', label: 'Science Exhibition', bg: '#dc143c', emoji: '🔬' },
    { id: 3, category: 'events', label: 'Cultural Day Celebration', bg: '#1a3a7a', emoji: '🎭' },
    { id: 4, category: 'campus', label: 'School Assembly', bg: '#4a90d9', emoji: '🏫' },
    { id: 5, category: 'academics', label: 'Library Reading Session', bg: '#2d5a9b', emoji: '📚' },
    { id: 6, category: 'events', label: 'Graduation Ceremony 2024', bg: '#8b0000', emoji: '🎓' },
    { id: 7, category: 'campus', label: 'Classroom Learning', bg: '#0a5c0a', emoji: '📖' },
    { id: 8, category: 'events', label: 'Teachers Day Celebration', bg: '#5b21b6', emoji: '👨‍🏫' },
    { id: 9, category: 'academics', label: 'Math Olympiad Winners', bg: '#b45309', emoji: '🏆' },
    { id: 10, category: 'campus', label: 'Morning Prayers', bg: '#0e7490', emoji: '🙏' },
    { id: 11, category: 'events', label: 'Republic Day Function', bg: '#166534', emoji: '🇳🇵' },
    { id: 12, category: 'campus', label: 'Football Match', bg: '#7c3aed', emoji: '⚽' },
];

const FILTERS = ['all', 'events', 'academics', 'campus'];

export default function GalleryPage() {
    const [active, setActive] = useState('all');
    const [lightbox, setLightbox] = useState(null); // clicked item

    const filtered = active === 'all' ? ITEMS : ITEMS.filter(i => i.category === active);

    return (
        <div className="pt-[115px]">

            {/* Header */}
            <section style={{ background: 'var(--navy)' }} className="py-16 text-white text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="section-label mx-auto" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>📸 Gallery</div>
                    <h1 className="heading-xl mt-2">School Life in Pictures</h1>
                    <p className="text-blue-200 mt-3 text-lg">Memories from our vibrant school community</p>
                </motion.div>
            </section>

            <section className="section">
                <div className="container-custom">
                    {/* Filter */}
                    <div className="flex flex-wrap gap-3 mb-10 justify-center">
                        {FILTERS.map(f => (
                            <button key={f} onClick={() => setActive(f)}
                                className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition-all ${active === f ? 'text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                style={active === f ? { background: 'var(--navy)' } : {}}>
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Grid */}
                    <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                        layout>
                        <AnimatePresence>
                            {filtered.map(item => (
                                <motion.div
                                    key={item.id} layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    onClick={() => setLightbox(item)}
                                    style={{ background: item.bg }}
                                    className="h-44 md:h-52 rounded-xl flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition-colors duration-300" />
                                    <span className="text-5xl relative z-10 group-hover:scale-110 transition-transform duration-300">{item.emoji}</span>
                                    <span className="text-white text-xs font-medium mt-2 px-3 text-center relative z-10 opacity-80 group-hover:opacity-100">{item.label}</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </section>

            {/* Lightbox */}
            <AnimatePresence>
                {lightbox && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                        onClick={() => setLightbox(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
                            onClick={e => e.stopPropagation()}
                            style={{ background: lightbox.bg }}
                            className="w-full max-w-lg h-80 rounded-2xl flex flex-col items-center justify-center relative"
                        >
                            <button onClick={() => setLightbox(null)}
                                className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl">✕</button>
                            <span className="text-8xl mb-4">{lightbox.emoji}</span>
                            <span className="text-white font-bold text-lg px-6 text-center">{lightbox.label}</span>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
