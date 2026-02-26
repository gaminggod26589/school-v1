'use client';
// Principal Dashboard — Full admin view:
// Stats overview, manage notices, view all user activity logs

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/lib/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function PrincipalDashboard() {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();

    const [tab, setTab] = useState('overview'); // overview | notices | logs
    const [stats, setStats] = useState(null);
    const [notices, setNotices] = useState([]);
    const [logs, setLogs] = useState([]);

    // Form state for creating a notice/news/event
    const [form, setForm] = useState({ title: '', body: '', category: 'notice', date: '', eventDate: '' });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    // Guard — principal only
    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'principal')) {
            router.replace('/login');
        }
    }, [user, authLoading, router]);

    // Fetch data per tab
    useEffect(() => {
        if (!user) return;
        if (tab === 'overview') {
            api.get('/api/dashboard').then(r => setStats(r.data)).catch(() => { });
        } else if (tab === 'notices') {
            api.get('/api/notices').then(r => setNotices(r.data)).catch(() => { });
        } else if (tab === 'logs') {
            api.get('/api/logs?limit=50').then(r => setLogs(r.data)).catch(() => { });
        }
    }, [tab, user]);

    const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const createNotice = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/api/notices', form);
            setMsg('✅ Posted successfully!');
            setForm({ title: '', body: '', category: 'notice', date: '', eventDate: '' });
            api.get('/api/notices').then(r => setNotices(r.data)).catch(() => { });
        } catch {
            setMsg('❌ Failed to post.');
        } finally {
            setSaving(false);
            setTimeout(() => setMsg(''), 3000);
        }
    };

    const deleteNotice = async (id) => {
        if (!confirm('Delete this notice?')) return;
        await api.delete(`/api/notices/${id}`);
        setNotices(prev => prev.filter(n => n._id !== id));
    };

    const clearLogs = async () => {
        if (!confirm('Clear ALL activity logs? This cannot be undone.')) return;
        await api.delete('/api/logs');
        setLogs([]);
    };

    if (authLoading || !user) return null;

    return (
        <div className="pt-[88px] min-h-screen bg-gray-50">
            <div className="container-custom py-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <p className="text-gray-500 text-sm">Principal Dashboard</p>
                        <h1 className="heading-md" style={{ color: 'var(--navy)' }}>Welcome, {user.name} 👑</h1>
                    </div>
                    <button onClick={logout} className="text-sm text-red-500 font-medium hover:text-red-700">Logout</button>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-3 mb-6">
                    {[['overview', '📊 Overview'], ['notices', '📋 Manage Notices'], ['logs', '🔍 Activity Logs']].map(([k, l]) => (
                        <button key={k} onClick={() => setTab(k)}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${tab === k ? 'text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                            style={tab === k ? { background: 'var(--navy)' } : {}}>
                            {l}
                        </button>
                    ))}
                </div>

                {/* Flash */}
                {msg && (
                    <div className={`p-3 rounded-lg mb-6 text-sm font-medium ${msg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {msg}
                    </div>
                )}

                {/* ── Overview Tab ─────────────────────────────────────────────── */}
                {tab === 'overview' && (
                    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}
                        className="flex flex-col gap-6">
                        {/* Stat cards */}
                        {stats ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {[
                                    { icon: '🎒', label: 'Students', value: stats.totalStudents },
                                    { icon: '👨‍🏫', label: 'Teachers', value: stats.totalTeachers },
                                    { icon: '📚', label: 'Library Books', value: stats.totalBooks },
                                    { icon: '📋', label: 'Notices', value: stats.totalNotices },
                                    { icon: '✅', label: "Today's Attendance", value: stats.todayAttendance },
                                ].map(s => (
                                    <motion.div key={s.label} variants={fadeUp} className="card p-5 text-center">
                                        <div className="text-3xl mb-2">{s.icon}</div>
                                        <p className="font-black text-2xl" style={{ color: 'var(--navy)' }}>{s.value}</p>
                                        <p className="text-gray-400 text-xs mt-1">{s.label}</p>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="card p-5 animate-pulse h-28" />)}
                            </div>
                        )}

                        {/* Recent logs preview */}
                        <motion.div variants={fadeUp} className="card p-6">
                            <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--navy)' }}>🕐 Recent Activity</h3>
                            {stats?.recentLogs?.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="table-clean">
                                        <thead><tr><th>User</th><th>Role</th><th>Method</th><th>Route</th><th>Time</th></tr></thead>
                                        <tbody>
                                            {stats.recentLogs.map(l => (
                                                <tr key={l._id}>
                                                    <td className="font-medium">{l.userName}</td>
                                                    <td><span className="badge badge-notice capitalize">{l.userRole}</span></td>
                                                    <td><span className="text-xs font-bold" style={{ color: l.method === 'GET' ? '#059669' : '#dc2626' }}>{l.method}</span></td>
                                                    <td className="font-mono text-xs text-gray-500">{l.route}</td>
                                                    <td className="text-gray-400 text-xs">{new Date(l.createdAt).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : <p className="text-gray-400 text-sm">No activity yet</p>}
                        </motion.div>
                    </motion.div>
                )}

                {/* ── Manage Notices Tab ───────────────────────────────────────── */}
                {tab === 'notices' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-2 gap-6">
                        {/* Create form */}
                        <div className="card p-6">
                            <h3 className="font-bold text-lg mb-5" style={{ color: 'var(--navy)' }}>➕ Post New Notice / News / Event</h3>
                            <form onSubmit={createNotice} className="flex flex-col gap-4">
                                <div>
                                    <label className="form-label">Category</label>
                                    <select className="form-input" name="category" value={form.category} onChange={handleFormChange}>
                                        <option value="notice">📌 Notice</option>
                                        <option value="news">📰 News</option>
                                        <option value="event">📅 Event</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Title *</label>
                                    <input className="form-input" name="title" value={form.title} onChange={handleFormChange} required placeholder="Notice title…" />
                                </div>
                                <div>
                                    <label className="form-label">Body *</label>
                                    <textarea className="form-input" name="body" value={form.body} onChange={handleFormChange} required rows={4} placeholder="Notice content…" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="form-label">Display Date *</label>
                                        <input className="form-input" name="date" value={form.date} onChange={handleFormChange} required placeholder="e.g. Feb 23, 2025" />
                                    </div>
                                    {form.category === 'event' && (
                                        <div>
                                            <label className="form-label">Event Date</label>
                                            <input type="date" className="form-input" name="eventDate" value={form.eventDate} onChange={handleFormChange} />
                                        </div>
                                    )}
                                </div>
                                <button type="submit" className="btn-primary justify-center" disabled={saving}>
                                    {saving ? '⏳ Posting…' : '📤 Post'}
                                </button>
                            </form>
                        </div>

                        {/* Existing notices list */}
                        <div className="card p-6">
                            <h3 className="font-bold text-lg mb-5" style={{ color: 'var(--navy)' }}>📋 All Notices ({notices.length})</h3>
                            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto">
                                {notices.map(n => (
                                    <div key={n._id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-gray-50">
                                        <div>
                                            <span className={`badge ${n.category === 'news' ? 'badge-news' : n.category === 'event' ? 'badge-event' : 'badge-notice'} text-xs`}>
                                                {n.category}
                                            </span>
                                            <p className="font-medium text-sm mt-1 text-gray-800">{n.title}</p>
                                            <p className="text-gray-400 text-xs">{n.date}</p>
                                        </div>
                                        <button onClick={() => deleteNotice(n._id)}
                                            className="text-red-400 hover:text-red-600 text-sm flex-shrink-0 font-bold">✕</button>
                                    </div>
                                ))}
                                {notices.length === 0 && <p className="text-gray-400 text-sm">No notices yet</p>}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── Activity Logs Tab ────────────────────────────────────────── */}
                {tab === 'logs' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-lg" style={{ color: 'var(--navy)' }}>🔍 User Activity Logs ({logs.length})</h3>
                            <button onClick={clearLogs} className="text-sm text-red-500 font-semibold hover:text-red-700">Clear All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="table-clean">
                                <thead>
                                    <tr><th>User</th><th>Role</th><th>Method</th><th>Route</th><th>IP</th><th>Time</th></tr>
                                </thead>
                                <tbody>
                                    {logs.length === 0 ? (
                                        <tr><td colSpan={6} className="text-center text-gray-400 py-8">No logs recorded yet</td></tr>
                                    ) : logs.map(l => (
                                        <tr key={l._id}>
                                            <td className="font-medium text-sm">{l.userName}</td>
                                            <td><span className="badge badge-notice capitalize text-xs">{l.userRole}</span></td>
                                            <td>
                                                <span className="text-xs font-bold px-2 py-0.5 rounded"
                                                    style={{
                                                        background: l.method === 'GET' ? '#d1fae5' : l.method === 'POST' ? '#dbeafe' : '#fee2e2',
                                                        color: l.method === 'GET' ? '#065f46' : l.method === 'POST' ? '#1e40af' : '#991b1b',
                                                    }}>
                                                    {l.method}
                                                </span>
                                            </td>
                                            <td className="font-mono text-xs text-gray-500 max-w-48 truncate">{l.route}</td>
                                            <td className="text-gray-400 text-xs">{l.ip}</td>
                                            <td className="text-gray-400 text-xs whitespace-nowrap">
                                                {new Date(l.createdAt).toLocaleString('en-NP')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

            </div>
        </div>
    );
}
