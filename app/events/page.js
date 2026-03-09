'use client';
// Events page — upcoming school events from backend
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

export default function EventsPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/notices?category=event')
            .then(r => setEvents(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="pt-[115px]">

            {/* Header */}
            <section style={{ background: 'var(--navy)' }} className="py-16 text-white text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="section-label mx-auto" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>📅 Calendar</div>
                    <h1 className="heading-xl mt-2">School Events</h1>
                    <p className="text-blue-200 mt-3 text-lg">Upcoming programs, competitions, and celebrations</p>
                </motion.div>
            </section>

            {/* Events grid */}
            <section className="section">
                <div className="container-custom">
                    {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="card p-6 animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                                    <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                                </div>
                            ))}
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <p className="text-6xl mb-4">📅</p>
                            <p className="font-medium text-lg">No upcoming events</p>
                            <p className="text-sm mt-1">Check back soon for new events!</p>
                        </div>
                    ) : (
                        <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                            initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
                            {events.map((e, i) => (
                                <motion.div key={e._id} variants={fadeUp} className="card overflow-hidden">
                                    {/* Color top strip */}
                                    <div className="h-2" style={{ background: i % 2 === 0 ? 'var(--crimson)' : 'var(--navy)' }} />
                                    <div className="p-6">
                                        <div className="badge badge-event mb-3">📅 Event</div>
                                        <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--navy)' }}>{e.title}</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed mb-4">{e.body}</p>
                                        <div className="flex items-center gap-2 text-sm font-medium"
                                            style={{ color: i % 2 === 0 ? 'var(--crimson)' : 'var(--navy)' }}>
                                            <span>📅</span>
                                            <span>
                                                {e.eventDate
                                                    ? new Date(e.eventDate).toLocaleDateString('en-NP', { day: 'numeric', month: 'long', year: 'numeric' })
                                                    : e.date}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </section>
        </div>
    );
}
