'use client';
// Contact page — contact form + Google Maps embed + contact details
import { useState } from 'react';
import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [sending, setSending] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        // Demo: just simulate a 1.5s send delay
        await new Promise(r => setTimeout(r, 1500));
        setSending(false);
        setSubmitted(true);
    };

    return (
        <div className="pt-[88px]">

            {/* Header */}
            <section style={{ background: 'var(--navy)' }} className="py-16 text-white text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="section-label mx-auto" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>📬 Contact</div>
                    <h1 className="heading-xl mt-2">Get in Touch</h1>
                    <p className="text-blue-200 mt-3 text-lg">We&apos;re here to answer your questions</p>
                </motion.div>
            </section>

            <section className="section">
                <div className="container-custom grid lg:grid-cols-2 gap-12">

                    {/* Left — contact info + map */}
                    <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                        <h2 className="heading-md mb-6" style={{ color: 'var(--navy)' }}>School Information</h2>

                        {/* Contact details */}
                        <div className="flex flex-col gap-4 mb-8">
                            {[
                                { icon: '📍', label: 'Address', value: 'Urlabari-5, Morang District, Koshi Province, Nepal' },
                                { icon: '📞', label: 'Phone', value: '+977-021-570XXX' },
                                { icon: '✉️', label: 'Email', value: 'info@martyrsmemorial.edu.np' },
                                { icon: '🕐', label: 'Hours', value: 'Sunday – Friday: 10:00 AM – 4:00 PM' },
                            ].map((c) => (
                                <div key={c.label} className="flex gap-4 items-start">
                                    <div style={{ background: 'var(--navy)' }}
                                        className="w-11 h-11 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                                        {c.icon}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm" style={{ color: 'var(--navy)' }}>{c.label}</p>
                                        <p className="text-gray-500 text-sm">{c.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Google Map embed */}
                        <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3572.2452880864485!2d87.28405579999999!3d26.4478212!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ef743663b54f97%3A0x591363e8e88ec4fc!2sMartyrs&#39;%20Memorial%20School!5e0!3m2!1sen!2snp!4v1771834847222!5m2!1sen!2snp"
                                width="100%"
                                height="300"
                                style={{ border: 0, display: 'block' }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Martyrs Memorial School on Google Maps"
                            />
                        </div>
                    </motion.div>

                    {/* Right — contact form */}
                    <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                        <div className="card p-8">
                            <h2 className="heading-md mb-6" style={{ color: 'var(--navy)' }}>Send a Message</h2>

                            {submitted ? (
                                <div className="text-center py-12">
                                    <div className="text-5xl mb-4">✅</div>
                                    <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--navy)' }}>Message Sent!</h3>
                                    <p className="text-gray-500 text-sm">Thank you for reaching out. We will get back to you shortly.</p>
                                    <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                                        className="mt-6 btn-primary">Send Another</button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="form-label">Full Name *</label>
                                            <input className="form-input" name="name" value={form.name} onChange={handleChange} required placeholder="Ram Bahadur" />
                                        </div>
                                        <div>
                                            <label className="form-label">Phone</label>
                                            <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+977-98XXXXXXXX" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="form-label">Email *</label>
                                        <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" />
                                    </div>
                                    <div>
                                        <label className="form-label">Subject *</label>
                                        <select className="form-input" name="subject" value={form.subject} onChange={handleChange} required>
                                            <option value="">Select a subject…</option>
                                            <option>Admissions Inquiry</option>
                                            <option>Fee Structure</option>
                                            <option>Academic Query</option>
                                            <option>General Information</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">Message *</label>
                                        <textarea className="form-input" name="message" value={form.message} onChange={handleChange} required rows={5} placeholder="Write your message here…" />
                                    </div>
                                    <button type="submit" className="btn-primary justify-center" disabled={sending}>
                                        {sending ? '⏳ Sending…' : '📤 Send Message'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
