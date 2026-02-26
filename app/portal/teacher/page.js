'use client';
// Teacher Portal — Mark attendance for students, view all student records

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/lib/api';

export default function TeacherPortal() {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();

    const [tab, setTab] = useState('attendance'); // 'attendance' | 'records'
    const [classGrade, setClassGrade] = useState(8);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({}); // { studentId: 'present'|'absent'|'late' }
    const [existing, setExisting] = useState([]); // already marked records for this date
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    // Guard
    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'teacher')) {
            router.replace('/login');
        }
    }, [user, authLoading, router]);

    // Load students for selected class
    useEffect(() => {
        if (!user) return;
        api.get(`/api/students?classGrade=${classGrade}`)
            .then(r => {
                setStudents(r.data);
                // Default all to present
                const init = {};
                r.data.forEach(s => { init[s._id] = 'present'; });
                setAttendance(init);
            })
            .catch(() => { });
    }, [classGrade, user]);

    // Load already-marked attendance for this date + class
    useEffect(() => {
        if (!user) return;
        api.get(`/api/attendance?date=${date}&classGrade=${classGrade}`)
            .then(r => {
                setExisting(r.data);
                // Populate the status toggles with existing values
                const fromDb = {};
                r.data.forEach(a => { fromDb[a.student?._id] = a.status; });
                setAttendance(prev => ({ ...prev, ...fromDb }));
            })
            .catch(() => { });
    }, [date, classGrade, user]);

    const setStatus = (studentId, status) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const saveAttendance = async () => {
        setSaving(true);
        try {
            await Promise.all(
                students.map(s =>
                    api.post('/api/attendance', {
                        studentId: s._id,
                        date,
                        classGrade: Number(classGrade),
                        status: attendance[s._id] || 'present',
                    })
                )
            );
            setMsg('✅ Attendance saved successfully!');
        } catch {
            setMsg('❌ Failed to save attendance.');
        } finally {
            setSaving(false);
            setTimeout(() => setMsg(''), 3000);
        }
    };

    if (authLoading || !user) return null;

    return (
        <div className="pt-[88px] min-h-screen bg-gray-50">
            <div className="container-custom py-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <p className="text-gray-500 text-sm">Teacher Portal</p>
                        <h1 className="heading-md" style={{ color: 'var(--navy)' }}>Welcome, {user.name} 👋</h1>
                    </div>
                    <button onClick={logout} className="text-sm text-red-500 font-medium hover:text-red-700">Logout</button>
                </div>

                {/* Tabs */}
                <div className="flex gap-3 mb-6">
                    {[['attendance', '📋 Attendance'], ['records', '👥 Student Records']].map(([key, label]) => (
                        <button key={key} onClick={() => setTab(key)}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${tab === key ? 'text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                            style={tab === key ? { background: 'var(--navy)' } : {}}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Flash */}
                {msg && (
                    <div className={`p-3 rounded-lg mb-6 text-sm font-medium ${msg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {msg}
                    </div>
                )}

                {/* ── Attendance Tab ───────────────────────────────────────────── */}
                {tab === 'attendance' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
                        {/* Controls */}
                        <div className="flex flex-wrap gap-4 mb-6">
                            <div>
                                <label className="form-label">Class</label>
                                <select className="form-input w-28" value={classGrade} onChange={e => setClassGrade(Number(e.target.value))}>
                                    <option value={8}>Class 8</option>
                                    <option value={9}>Class 9</option>
                                    <option value={10}>Class 10</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Date</label>
                                <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
                            </div>
                        </div>

                        {students.length === 0 ? (
                            <p className="text-gray-400 text-sm py-8 text-center">No students in Class {classGrade}</p>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="table-clean">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Student Name</th>
                                                <th>Class</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.map((s, i) => (
                                                <tr key={s._id}>
                                                    <td className="text-gray-400 text-sm">{i + 1}</td>
                                                    <td className="font-medium">{s.name}</td>
                                                    <td><span className="badge badge-notice">Class {s.classGrade}</span></td>
                                                    <td>
                                                        {/* Toggle buttons */}
                                                        <div className="flex gap-2">
                                                            {['present', 'absent', 'late'].map(status => (
                                                                <button key={status} onClick={() => setStatus(s._id, status)}
                                                                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all ${attendance[s._id] === status ? 'text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                                        }`}
                                                                    style={attendance[s._id] === status ? {
                                                                        background: status === 'present' ? '#059669' : status === 'absent' ? '#dc2626' : '#d97706'
                                                                    } : {}}>
                                                                    {status}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button onClick={saveAttendance} className="btn-primary" disabled={saving}>
                                        {saving ? '⏳ Saving…' : '💾 Save Attendance'}
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}

                {/* ── Student Records Tab ──────────────────────────────────────── */}
                {tab === 'records' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                            <label className="form-label mb-0">Filter by Class:</label>
                            <select className="form-input w-28" value={classGrade} onChange={e => setClassGrade(Number(e.target.value))}>
                                <option value={8}>Class 8</option>
                                <option value={9}>Class 9</option>
                                <option value={10}>Class 10</option>
                            </select>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="table-clean">
                                <thead>
                                    <tr><th>#</th><th>Name</th><th>Email</th><th>Class</th><th>Status</th></tr>
                                </thead>
                                <tbody>
                                    {students.length === 0 ? (
                                        <tr><td colSpan={5} className="text-center text-gray-400 py-8">No students found</td></tr>
                                    ) : students.map((s, i) => (
                                        <tr key={s._id}>
                                            <td className="text-gray-400 text-sm">{i + 1}</td>
                                            <td className="font-medium">{s.name}</td>
                                            <td className="text-gray-500 text-sm">{s.email}</td>
                                            <td><span className="badge badge-notice">Class {s.classGrade}</span></td>
                                            <td><span className={`text-xs font-bold ${s.isActive ? 'text-green-600' : 'text-red-500'}`}>{s.isActive ? '● Active' : '● Inactive'}</span></td>
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
