'use client';
// Academics page — Programs, classes, subjects, timetable overview
import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

// Academic programs with subjects
const PROGRAMS = [
    {
        level: 'Primary Level',
        grades: 'Grade 1 – 5',
        icon: '🌱',
        color: '#4a90d9',
        desc: 'Building a strong foundation in Nepali, English, Mathematics, Science, and Social Studies through play-based and activity-oriented learning.',
        subjects: ['Nepali', 'English', 'Mathematics', 'Science', 'Social Studies', 'Moral Education', 'Art'],
    },
    {
        level: 'Lower Secondary',
        grades: 'Grade 6 – 8',
        icon: '📗',
        color: '#0f2557',
        desc: 'Developing critical thinking, scientific curiosity, and digital literacy. Students are introduced to optional subjects and basic computer education.',
        subjects: ['Nepali', 'English', 'Mathematics', 'Science', 'Social Studies', 'Health & PE', 'Computer', 'Optional Maths'],
    },
    {
        level: 'Secondary Level',
        grades: 'Grade 9 – 10',
        icon: '🎓',
        color: '#dc143c',
        desc: 'Comprehensive preparation for the SEE (Secondary Education Examination). Students choose from Science, Commerce, and Arts streams.',
        subjects: ['Nepali', 'English', 'Mathematics', 'Science', 'Social Studies', 'Health & PE', 'Optional Maths / Account / Population'],
    },
];

const FACILITIES = [
    { icon: '🔬', title: 'Physics Lab', desc: 'Equipped with modern instruments for experiments' },
    { icon: '🧪', title: 'Chemistry Lab', desc: 'Safe, well-ventilated lab with essential chemicals' },
    { icon: '🦠', title: 'Biology Lab', desc: 'Microscopes, specimens, and models' },
    { icon: '💻', title: 'Computer Lab', desc: '30 computers with internet access' },
    { icon: '📚', title: 'Library', desc: '5000+ books across all subjects' },
    { icon: '⚽', title: 'Sports Ground', desc: 'Football, volleyball, basketball facilities' },
];

export default function AcademicsPage() {
    return (
        <div className="pt-[115px]">

            {/* Header */}
            <section style={{ background: 'var(--navy)' }} className="py-16 text-white text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="section-label mx-auto" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>📚 Academics</div>
                    <h1 className="heading-xl mt-2">Academic Programs</h1>
                    <p className="text-blue-200 mt-3 text-lg">Grade 1 through 10 — Curriculum aligned with CDC Nepal</p>
                </motion.div>
            </section>

            {/* Programs */}
            <section className="section">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <div className="section-label mx-auto">🎒 Programs</div>
                        <h2 className="heading-lg" style={{ color: 'var(--navy)' }}>Our Academic Levels</h2>
                    </div>
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
                        className="flex flex-col gap-8">
                        {PROGRAMS.map((p) => (
                            <motion.div key={p.level} variants={fadeUp} className="card p-8 flex flex-col md:flex-row gap-8 items-start">
                                {/* Icon badge */}
                                <div className="w-20 h-20 flex-shrink-0 rounded-2xl flex items-center justify-center text-4xl"
                                    style={{ background: `${p.color}15` }}>
                                    {p.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <h3 className="font-bold text-xl" style={{ color: p.color }}>{p.level}</h3>
                                        <span className="badge" style={{ background: `${p.color}15`, color: p.color }}>{p.grades}</span>
                                    </div>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{p.desc}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {p.subjects.map((s) => (
                                            <span key={s} className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Facilities */}
            <section className="section bg-gray-50">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <div className="section-label mx-auto">🏫 Facilities</div>
                        <h2 className="heading-lg" style={{ color: 'var(--navy)' }}>Learning Facilities</h2>
                    </div>
                    <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
                        className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {FACILITIES.map((f) => (
                            <motion.div key={f.title} variants={fadeUp} className="card p-6 text-center">
                                <div className="text-4xl mb-3">{f.icon}</div>
                                <h3 className="font-bold mb-1" style={{ color: 'var(--navy)' }}>{f.title}</h3>
                                <p className="text-gray-500 text-sm">{f.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* School hours */}
            <section className="section">
                <div className="container-custom max-w-2xl mx-auto">
                    <div className="text-center mb-10">
                        <div className="section-label mx-auto">🕐 Schedule</div>
                        <h2 className="heading-lg" style={{ color: 'var(--navy)' }}>School Timings</h2>
                    </div>
                    <div className="card overflow-hidden">
                        <table className="table-clean">
                            <thead>
                                <tr><th>Day</th><th>School Hours</th><th>Breaks</th></tr>
                            </thead>
                            <tbody>
                                {[
                                    ['Sunday', '10:00 AM – 4:00 PM', 'Tiffin: 12:00 | Lunch: 2:30'],
                                    ['Monday', '10:00 AM – 4:00 PM', 'Tiffin: 12:00 | Lunch: 2:30'],
                                    ['Tuesday', '10:00 AM – 4:00 PM', 'Tiffin: 12:00 | Lunch: 2:30'],
                                    ['Wednesday', '10:00 AM – 4:00 PM', 'Tiffin: 12:00 | Lunch: 2:30'],
                                    ['Thursday', '10:00 AM – 4:00 PM', 'Tiffin: 12:00 | Lunch: 2:30'],
                                    ['Friday', '10:00 AM – 1:00 PM', 'Assembly Day'],
                                    ['Saturday', 'Closed', '—'],
                                ].map(([day, hours, breaks]) => (
                                    <tr key={day}>
                                        <td className="font-medium">{day}</td>
                                        <td style={{ color: 'var(--navy)' }} className="font-semibold">{hours}</td>
                                        <td className="text-gray-500 text-sm">{breaks}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

        </div>
    );
}
