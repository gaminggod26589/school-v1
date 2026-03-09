'use client';
// Faculty page — lists all teachers fetched from the backend API
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 25 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

// Static subject-department mapping for demo (shown per card)
const SUBJECTS = ['Mathematics', 'Science', 'English', 'Nepali', 'Social Studies', 'Computer', 'Health & PE', 'Optional Math'];

export default function FacultyPage() {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/teachers')
            .then(r => setTeachers(r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="pt-[115px]">

            {/* Header */}
            <section style={{ background: 'var(--navy)' }} className="py-16 text-white text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="section-label mx-auto" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>👨‍🏫 Our Team</div>
                    <h1 className="heading-xl mt-2">Meet Our Faculty</h1>
                    <p className="text-blue-200 mt-3 text-lg">Dedicated educators committed to your child&apos;s success</p>
                </motion.div>
            </section>

            {/* Faculty grid */}
            <section className="section">
                <div className="container-custom">
                    {loading ? (
                        // Loading skeletons
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="card p-6 animate-pulse">
                                    <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-4" />
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
                                    <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto" />
                                </div>
                            ))}
                        </div>
                    ) : teachers.length > 0 ? (
                        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {teachers.map((t, i) => (
                                <motion.div key={t._id} variants={fadeUp} className="card p-6 text-center">
                                    {/* Avatar initials */}
                                    <div style={{ background: i % 2 === 0 ? 'var(--navy)' : 'var(--crimson)' }}
                                        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-black">
                                        {t.name.charAt(0)}
                                    </div>
                                    <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--navy)' }}>{t.name}</h3>
                                    {/* Assign subject in rotation for demo */}
                                    <p className="text-gray-500 text-sm mb-3">{SUBJECTS[i % SUBJECTS.length]} Teacher</p>
                                    <span className="badge badge-notice">Faculty Member</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        // Fallback — static demo cards if API is down
                        <motion.div variants={stagger} initial="hidden" animate="show"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { name: 'Sita Devi Thapa', subject: 'Mathematics' },
                                { name: 'Hari Bahadur Rai', subject: 'Science' },
                                { name: 'Kamala Adhikari', subject: 'English' },
                                { name: 'Rajan Koirala', subject: 'Nepali' },
                                { name: 'Sunita Maharjan', subject: 'Social Studies' },
                                { name: 'Dipak Shrestha', subject: 'Computer' },
                            ].map((t, i) => (
                                <motion.div key={t.name} variants={fadeUp} className="card p-6 text-center">
                                    <div style={{ background: i % 2 === 0 ? 'var(--navy)' : 'var(--crimson)' }}
                                        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-black">
                                        {t.name.charAt(0)}
                                    </div>
                                    <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--navy)' }}>{t.name}</h3>
                                    <p className="text-gray-500 text-sm mb-3">{t.subject} Teacher</p>
                                    <span className="badge badge-notice">Faculty Member</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Join us CTA */}
            <section style={{ background: 'var(--navy)' }} className="py-12 text-center text-white">
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                    <h2 className="heading-md mb-3">Interested in Teaching With Us?</h2>
                    <p className="text-blue-200 text-sm mb-6">We are always looking for passionate educators to join our team.</p>
                    <a href="/contact" className="btn-primary inline-flex">Get in Touch →</a>
                </motion.div>
            </section>
        </div>
    );
}
