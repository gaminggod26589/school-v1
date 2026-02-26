'use client';
// Notice Board page — fetches all notices from backend, filterable by category
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function NoticeBoardPage() {
    const [notices, setNotices] = useState([]);
    const [filter, setFilter] = useState('all'); // all | notice | news
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const url = filter === 'all' ? '/api/notices' : `/api/notices?category=${filter}`;
        setLoading(true);
        api.get(url)
            .then(r => setNotices(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [filter]);

    return (
        <div className="pt-[88px]">

            {/* Header */}
            <section style={{ background: 'var(--navy)' }} className="py-16 text-white text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="section-label mx-auto" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>📋 Updates</div>
                    <h1 className="heading-xl mt-2">Notice Board</h1>
                    <p className="text-blue-200 mt-3 text-lg">Stay informed with the latest school notices and news</p>
                </motion.div>
            </section>

            {/* Filter tabs */}
            <div className="container-custom py-8">
                <div className="flex flex-wrap gap-3 mb-8">
                    {[
                        { key: 'all', label: '📁 All' },
                        { key: 'notice', label: '📌 Notices' },
                        { key: 'news', label: '📰 News' },
                    ].map(({ key, label }) => (
                        <button key={key} onClick={() => setFilter(key)}
                            className={`px-5 py-2 rounded-full font-semibold text-sm transition-all duration-200 ${filter === key ? 'text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            style={filter === key ? { background: 'var(--navy)' } : {}}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Notice list */}
                {loading ? (
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="card p-5 animate-pulse flex gap-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0" />
                                <div className="flex-1"><div className="h-4 bg-gray-200 rounded w-2/3 mb-2" /><div className="h-3 bg-gray-100 rounded w-full mb-2" /><div className="h-3 bg-gray-100 rounded w-1/3" /></div>
                            </div>
                        ))}
                    </div>
                ) : notices.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-5xl mb-3">📭</p>
                        <p className="font-medium">No notices found</p>
                    </div>
                ) : (
                    <motion.div className="flex flex-col gap-4" initial="hidden" animate="show"
                        variants={{ show: { transition: { staggerChildren: 0.07 } } }}>
                        {notices.map((n) => (
                            <motion.div key={n._id} variants={fadeUp} className="card p-5 flex gap-4 items-start">
                                {/* Icon */}
                                <div className="w-12 h-12 flex-shrink-0 rounded-lg flex items-center justify-center text-xl"
                                    style={{ background: n.category === 'news' ? '#d1fae5' : '#fef3c7' }}>
                                    {n.category === 'news' ? '📰' : '📌'}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between gap-2 flex-wrap">
                                        <h3 className="font-semibold text-gray-800">{n.title}</h3>
                                        <span className={`badge ${n.category === 'news' ? 'badge-news' : 'badge-notice'} flex-shrink-0`}>
                                            {n.category === 'news' ? 'News' : 'Notice'}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">{n.body}</p>
                                    <p className="text-gray-400 text-xs mt-2">📅 {n.date}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
