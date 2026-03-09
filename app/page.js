'use client';
// Home page — Hero, Stats counter, Latest Notices, Upcoming Events, Gallery preview
// All sections use Framer Motion for entrance animations

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api from '@/lib/api';

// ── Animation variants (reused across sections) ───────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { show: { transition: { staggerChildren: 0.12 } } };

// ── Animated counter component ────────────────────────────────────────────────
function Counter({ end, suffix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(end / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 25);
    return () => clearInterval(timer);
  }, [end]);
  return <span>{count}{suffix}</span>;
}

// ── Gallery images (static demo) ─────────────────────────────────────────────
const GALLERY = [
  { bg: '#1a3a7a', label: 'Annual Sports Day' },
  { bg: '#dc143c', label: 'Science Fair 2024' },
  { bg: '#0f2557', label: 'Cultural Program' },
  { bg: '#4a90d9', label: 'Classroom Learning' },
  { bg: '#2d5a9b', label: 'Library Reading' },
  { bg: '#8b0000', label: 'Graduation 2024' },
];

export default function HomePage() {
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);

  // Fetch latest notices and events from backend
  useEffect(() => {
    api.get('/api/notices?category=notice').then(r => setNotices(r.data.slice(0, 3))).catch(() => { });
    api.get('/api/notices?category=event').then(r => setEvents(r.data.slice(0, 3))).catch(() => { });
  }, []);

  return (
    <div className="pt-[130px]"> {/* push below fixed navbar */}

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="gradient-hero min-h-[90vh] flex items-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f2557 0%, #1a3a7a 60%, #0d1f4a 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'var(--crimson)' }} />
        <div className="absolute -bottom-10 left-10 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'var(--blue)' }} />

        <div className="container-custom relative z-10">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="max-w-3xl"
          >
            {/* Label */}
            <motion.div variants={fadeUp}>
              <span className="inline-block bg-white/10 text-blue-200 border border-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                🏫 Welcome to Martyrs&apos; Memorial School
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp} className="heading-xl text-white mb-6">
              Shaping{' '}
              <span style={{ color: 'var(--crimson)' }}>Bright Futures</span>
              <br />Through Quality Education
            </motion.h1>

            {/* Subheading */}
            <motion.p variants={fadeUp} className="text-blue-100 text-lg mb-10 leading-relaxed max-w-2xl">
              Located in the heart of Urlabari, Morang, we are committed to nurturing young minds with academic excellence, strong values, and a love for lifelong learning.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <Link href="/about" className="btn-primary text-base px-6 py-3">
                Discover Our School
              </Link>
              <Link href="/contact" className="btn-outline text-base px-6 py-3">
                Contact Us
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-blue-300 text-xs">
          <span>Scroll Down</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-5 h-5 border-b-2 border-r-2 border-blue-300 rotate-45 mt-1" />
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--crimson)' }} className="py-8">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center"
          >
            {[
              { value: 1200, suffix: '+', label: 'Students Enrolled' },
              { value: 45, suffix: '+', label: 'Qualified Teachers' },
              { value: 30, suffix: '+', label: 'Years of Excellence' },
              { value: 98, suffix: '%', label: 'SEE Pass Rate' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl md:text-4xl font-black">
                  <Counter end={s.value} suffix={s.suffix} />
                </p>
                <p className="text-red-100 text-sm mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── NOTICES + EVENTS GRID ────────────────────────────────────────── */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-10">

            {/* Latest Notices */}
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}
            >
              <div className="section-label">📋 Latest Notices</div>
              <h2 className="heading-md mb-6" style={{ color: 'var(--navy)' }}>Notice Board</h2>
              <div className="flex flex-col gap-3">
                {notices.length > 0 ? notices.map((n) => (
                  <div key={n._id} className="card p-4 flex gap-4 items-start">
                    <div style={{ background: 'var(--navy)', minWidth: '44px' }}
                      className="h-11 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      📌
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm leading-snug">{n.title}</p>
                      <p className="text-gray-400 text-xs mt-1">{n.date}</p>
                    </div>
                  </div>
                )) : (
                  // Skeleton placeholders while loading
                  [1, 2, 3].map((i) => (
                    <div key={i} className="card p-4 flex gap-4 animate-pulse">
                      <div className="bg-gray-200 w-11 h-11 rounded-lg" />
                      <div className="flex-1"><div className="bg-gray-200 h-4 rounded w-3/4 mb-2" /><div className="bg-gray-100 h-3 rounded w-1/3" /></div>
                    </div>
                  ))
                )}
                <Link href="/notice-board" className="text-sm font-semibold mt-2 flex items-center gap-1"
                  style={{ color: 'var(--crimson)' }}>
                  View All Notices →
                </Link>
              </div>
            </motion.div>

            {/* Upcoming Events */}
            <motion.div
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}
            >
              <div className="section-label">📅 Upcoming</div>
              <h2 className="heading-md mb-6" style={{ color: 'var(--navy)' }}>Events</h2>
              <div className="flex flex-col gap-3">
                {events.length > 0 ? events.map((e) => (
                  <div key={e._id} className="card p-4 flex gap-4 items-start">
                    <div style={{ background: 'var(--crimson)', minWidth: '44px' }}
                      className="h-11 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      🎉
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm leading-snug">{e.title}</p>
                      <p className="text-gray-400 text-xs mt-1">{e.date}</p>
                    </div>
                  </div>
                )) : (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="card p-4 flex gap-4 animate-pulse">
                      <div className="bg-gray-200 w-11 h-11 rounded-lg" />
                      <div className="flex-1"><div className="bg-gray-200 h-4 rounded w-3/4 mb-2" /><div className="bg-gray-100 h-3 rounded w-1/3" /></div>
                    </div>
                  ))
                )}
                <Link href="/events" className="text-sm font-semibold mt-2 flex items-center gap-1"
                  style={{ color: 'var(--crimson)' }}>
                  View All Events →
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container-custom text-center mb-12">
          <div className="section-label mx-auto">⭐ Why Choose Us</div>
          <h2 className="heading-lg" style={{ color: 'var(--navy)' }}>A School That Cares</h2>
        </div>
        <motion.div
          variants={stagger} initial="hidden" whileInView="show"
          viewport={{ once: true }}
          className="container-custom grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {[
            { icon: '🎓', title: 'Academic Excellence', desc: 'Consistently high SEE results with dedicated teachers who invest in every student.' },
            { icon: '🏆', title: 'Co-curricular Activities', desc: 'Sports, debate, science fairs, cultural programs — we believe in all-round development.' },
            { icon: '📚', title: 'Modern Library', desc: 'A well-stocked library giving students access to thousands of books and learning resources.' },
            { icon: '🔬', title: 'Science Labs', desc: 'Fully equipped Physics, Chemistry, and Biology labs for hands-on learning.' },
            { icon: '👨‍🏫', title: 'Expert Faculty', desc: 'Experienced, caring teachers committed to every child\'s personal growth and success.' },
            { icon: '🛡️', title: 'Safe Environment', desc: 'A secure, inclusive campus where every child feels valued, respected, and empowered.' },
          ].map((item) => (
            <motion.div key={item.title} variants={fadeUp} className="card p-6">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--navy)' }}>{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── GALLERY PREVIEW ──────────────────────────────────────────────── */}
      <section className="section-sm bg-gray-50">
        <div className="container-custom">
          <div className="flex justify-between items-end mb-8">
            <div>
              <div className="section-label">📸 Gallery</div>
              <h2 className="heading-md" style={{ color: 'var(--navy)' }}>School Life in Pictures</h2>
            </div>
            <Link href="/gallery" className="text-sm font-semibold" style={{ color: 'var(--crimson)' }}>
              View All →
            </Link>
          </div>
          <motion.div
            variants={stagger} initial="hidden" whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 gap-3"
          >
            {GALLERY.map((item, i) => (
              <motion.div
                key={i} variants={fadeUp}
                style={{ background: item.bg }}
                className="h-44 md:h-52 rounded-xl flex items-end p-4 cursor-pointer overflow-hidden group relative"
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <span className="relative z-10 text-white text-sm font-semibold">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--navy)' }} className="py-16 text-center text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="container-custom"
        >
          <h2 className="heading-lg mb-4">Ready to Join Our School Family?</h2>
          <p className="text-blue-200 mb-8 text-lg">Admissions open for the 2082 academic year. Limited seats available.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/contact" className="btn-primary px-8 py-3 text-base">Apply Now</Link>
            <Link href="/about" className="btn-outline px-8 py-3 text-base">Learn More</Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
