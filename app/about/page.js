'use client';
// About page — School history, mission/vision, principal message, core values
import { motion } from 'framer-motion';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

export default function AboutPage() {
    return (
        <div className="pt-[115px]">

            {/* Page Header */}
            <section style={{ background: 'var(--navy)' }} className="py-16 text-white text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="section-label mx-auto" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>🏫 About Us</div>
                    <h1 className="heading-xl mt-2">Martyrs&apos; Memorial School</h1>
                    <p className="text-blue-200 mt-3 text-lg">Urlabari, Morang — Serving our community since 2050 B.S.</p>
                </motion.div>
            </section>

            {/* History + Mission */}
            <section className="section">
                <div className="container-custom grid md:grid-cols-2 gap-12 items-center">
                    {/* Text */}
                    <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}>
                        <div className="section-label">📜 Our Story</div>
                        <h2 className="heading-lg mb-5" style={{ color: 'var(--navy)' }}>A Legacy of Learning</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            Martyrs&apos; Memorial School was founded in the spirit of the brave souls who sacrificed their lives for Nepal&apos;s democracy. Established in Urlabari, Morang, the school has grown from a small community institution to one of the region&apos;s most respected educational centres.
                        </p>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            Over three decades, we have consistently produced top performers in the SEE examination and have been a beacon of quality education for thousands of families in the Morang district.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            Our campus provides state-of-the-art labs, a rich library, and well-trained teachers — all working together to give every child the best possible start in life.
                        </p>
                    </motion.div>

                    {/* Stats card */}
                    <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }}>
                        <div className="card p-8 grid grid-cols-2 gap-6" style={{ border: '2px solid #e2e8f0' }}>
                            {[
                                { icon: '🏛️', value: '2050 B.S.', label: 'Year Founded' },
                                { icon: '👥', value: '1200+', label: 'Current Students' },
                                { icon: '👨‍🏫', value: '45+', label: 'Teaching Staff' },
                                { icon: '🎓', value: '98%', label: 'SEE Pass Rate' },
                                { icon: '🔬', value: '3', label: 'Science Labs' },
                                { icon: '📚', value: '5000+', label: 'Library Books' },
                            ].map((s) => (
                                <div key={s.label} className="text-center p-3 rounded-xl bg-gray-50">
                                    <div className="text-3xl mb-1">{s.icon}</div>
                                    <p className="font-black text-xl" style={{ color: 'var(--navy)' }}>{s.value}</p>
                                    <p className="text-gray-500 text-xs font-medium">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Mission / Vision / Values */}
            <section className="section bg-gray-50">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <div className="section-label mx-auto">🎯 Who We Are</div>
                        <h2 className="heading-lg" style={{ color: 'var(--navy)' }}>Mission, Vision & Values</h2>
                    </div>
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
                        className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: '🎯',
                                title: 'Our Mission',
                                color: 'var(--navy)',
                                text: 'To provide accessible, high-quality education that empowers every student with knowledge, skills, and character to thrive in a rapidly changing world.',
                            },
                            {
                                icon: '🔭',
                                title: 'Our Vision',
                                color: 'var(--crimson)',
                                text: 'To be the leading school in Morang District, recognized for academic excellence, innovation, and producing responsible and compassionate citizens of Nepal.',
                            },
                            {
                                icon: '💎',
                                title: 'Our Values',
                                color: '#4a90d9',
                                text: 'Integrity, Respect, Excellence, Inclusion, and Service — these guide everything we do, from classroom instruction to co-curricular activities.',
                            },
                        ].map((item) => (
                            <motion.div key={item.title} variants={fadeUp} className="card p-8 text-center">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl"
                                    style={{ background: `${item.color}15` }}>
                                    {item.icon}
                                </div>
                                <h3 className="font-bold text-xl mb-3" style={{ color: item.color }}>{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.text}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Principal's Message */}
            <section className="section">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <div className="section-label mx-auto">💬 Leadership</div>
                        <h2 className="heading-lg" style={{ color: 'var(--navy)' }}>Principal&apos;s Message</h2>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.55 }}
                        className="card max-w-3xl mx-auto p-8 md:p-12"
                    >
                        {/* Avatar */}
                        <div className="flex items-center gap-5 mb-8">
                            <div style={{ background: 'var(--navy)' }}
                                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-black flex-shrink-0">
                                R
                            </div>
                            <div>
                                <p className="font-bold text-lg" style={{ color: 'var(--navy)' }}>Ram Prasad Sharma</p>
                                <p className="text-gray-500 text-sm">Principal, Martyrs&apos; Memorial School</p>
                                <p className="text-gray-400 text-xs mt-0.5">M.Ed. Tribhuvan University | 20+ Years in Education</p>
                            </div>
                        </div>
                        {/* Message */}
                        <blockquote className="text-gray-600 leading-relaxed text-base border-l-4 pl-6 italic"
                            style={{ borderColor: 'var(--crimson)' }}>
                            &ldquo;At Martyrs&apos; Memorial School, we believe that every child carries within them the potential for greatness. Our role as educators is not just to teach textbook knowledge, but to ignite curiosity, build character, and instil the confidence to face the world. I invite you to join our school family — a community built on trust, excellence, and a deep love for learning.&rdquo;
                        </blockquote>
                    </motion.div>
                </div>
            </section>

        </div>
    );
}
