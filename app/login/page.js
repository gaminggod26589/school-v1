'use client';
// Login page — single login for students, teachers, and principal
// After login, redirects to the correct portal based on role

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/lib/api';

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/api/auth/login', form);
            const { token, user } = res.data;

            // Save to context + localStorage
            login(token, user);

            // Redirect based on role
            if (user.role === 'principal') router.push('/portal/principal');
            else if (user.role === 'teacher') router.push('/portal/teacher');
            else router.push('/portal/student');

        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-[88px] min-h-screen flex items-center" style={{ background: 'var(--gray-50)' }}>
            <div className="container-custom py-16">
                <div className="max-w-md mx-auto">

                    {/* Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                        className="card p-8 md:p-10"
                    >
                        {/* Logo */}
                        <div className="text-center mb-8">
                            <div style={{ background: 'var(--navy)' }}
                                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white text-3xl font-black">
                                M
                            </div>
                            <h1 className="font-bold text-2xl" style={{ color: 'var(--navy)' }}>School Portal Login</h1>
                            <p className="text-gray-500 text-sm mt-1">Martyrs&apos; Memorial School</p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="form-label">Email Address</label>
                                <input className="form-input" type="email" name="email" value={form.email}
                                    onChange={handleChange} required placeholder="you@school.edu.np" />
                            </div>
                            <div>
                                <label className="form-label">Password</label>
                                <input className="form-input" type="password" name="password" value={form.password}
                                    onChange={handleChange} required placeholder="••••••••" />
                            </div>
                            <button type="submit" className="btn-primary justify-center mt-2" disabled={loading}>
                                {loading ? '⏳ Signing in…' : '🔐 Sign In'}
                            </button>
                        </form>

                        {/* Demo credentials hint */}
                        <div className="mt-6 p-4 rounded-xl text-xs" style={{ background: '#f0f4ff', color: 'var(--navy)' }}>
                            <p className="font-bold mb-2">🧪 Demo Credentials (password: password123)</p>
                            <p>👑 Principal: principal@school.edu.np</p>
                            <p>👨‍🏫 Teacher: sita@school.edu.np</p>
                            <p>🎒 Student: bikash@student.edu.np</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
