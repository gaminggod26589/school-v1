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
        <div className="pt-[115px] pb-12 min-h-screen flex items-center justify-center relative bg-[#4a4073] px-4 sm:px-6 lg:px-8 font-sans">
            <style>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>

            {/* Glowing background animated blobs adapted to the purple theme */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#1ab785]/10 mix-blend-screen filter blur-[100px] animate-blob"></div>
                <div className="absolute top-0 right-10 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#3b82f6]/10 mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/3 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#8b5cf6]/10 mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>
            </div>
            
            <div className="w-full max-w-md relative z-10 my-8">
                {/* Glass Card */}
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.95 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="bg-[#61548f]/90 border border-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-3xl p-8 sm:p-12 relative overflow-hidden block"
                >
                    {/* Logo / Header */}
                    <div className="text-center mb-10 relative">
                        <motion.div 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1 }} 
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                            className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2b7a9f] to-[#1ab785] shadow-[0_4px_14px_0_rgba(26,183,133,0.39)] flex items-center justify-center mx-auto mb-6 relative overflow-hidden group"
                        >
                            <span className="text-white text-[2rem] font-bold tracking-tight">M</span>
                        </motion.div>
                        <h1 className="font-black text-[1.75rem] text-[#1c1c1c] mb-2 tracking-wide">Welcome Back</h1>
                        <p className="text-[#d1d5db] font-medium text-sm">Enter your credentials to access your account</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-red-500/20 border border-red-500/50 backdrop-blur-sm text-red-100 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2 shadow-sm"
                        >
                            <span className="text-lg">⚠️</span> 
                            <span className="flex-1">{error}</span>
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#1a1a2e] uppercase tracking-wide pl-1">Email Address</label>
                            <input 
                                className="w-full bg-[#7163a3]/60 border border-white/10 text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#1ab785]/50 focus:bg-[#7163a3]/80 transition-all duration-300 placeholder-white/40 shadow-inner" 
                                type="email" 
                                name="email" 
                                value={form.email}
                                onChange={handleChange} 
                                required 
                                placeholder="your.email@example.com" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#1a1a2e] uppercase tracking-wide pl-1">Password</label>
                            <input 
                                className="w-full bg-[#7163a3]/60 border border-white/10 text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#1ab785]/50 focus:bg-[#7163a3]/80 transition-all duration-300 placeholder-white/40 shadow-inner" 
                                type="password" 
                                name="password" 
                                value={form.password}
                                onChange={handleChange} 
                                required 
                                placeholder="Enter your password" 
                            />
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between text-[13px] mt-1 mb-2">
                            <label className="flex items-center gap-2 cursor-pointer text-[#1a1a2e] font-semibold">
                                <input type="checkbox" className="w-4 h-4 rounded border-white/20 text-[#1ab785] focus:ring-[#1ab785] bg-[#7163a3]/60 focus:ring-offset-[#61548f]" />
                                <span>Remember me</span>
                            </label>
                            <a href="#" className="flex-shrink-0 text-[#2b7a9f] font-bold hover:text-[#1ab785] transition-colors">
                                Forgot Password?
                            </a>
                        </div>

                        <motion.button 
                            whileHover={{ scale: 1.02, boxShadow: "0 10px 20px -5px rgba(26, 183, 133, 0.4)" }}
                            whileTap={{ scale: 0.98 }}
                            type="submit" 
                            className="w-full bg-gradient-to-r from-[#2b7a9f] to-[#1ab785] text-white font-bold text-[1.05rem] py-3.5 px-6 rounded-xl border border-white/10 transition-all duration-300 shadow-lg mt-1 flex justify-center items-center gap-2 hover:brightness-110 tracking-widest" 
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    SIGNING IN...
                                </>
                            ) : 'SIGN IN'}
                        </motion.button>
                    </form>

                    {/* Footer / Sign Up */}
                    <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-[#1a1a2e] font-medium">
                        Don&apos;t have an account? <a href="#" className="text-[#2b7a9f] font-bold hover:text-[#1ab785] transition-colors">Sign Up</a>
                    </div>
                    
                    {/* Demo credentials hint */}
                    <div className="mt-8 p-4 rounded-xl text-xs bg-[#1a1a2e]/20 border border-white/5 text-[#e2e8f0] shadow-inner relative overflow-hidden transition-colors duration-300">
                        <p className="font-bold text-white mb-3 text-[11px] uppercase tracking-wider flex items-center gap-2 opacity-80">
                            <span>🧪</span> Demo Credentials 
                        </p>
                        <div className="space-y-1.5 font-medium">
                            <div className="flex flex-wrap items-center gap-2 hover:bg-white/10 p-2 rounded-lg transition-colors cursor-pointer" onClick={() => setForm({email: 'principal@school.edu.np', password: 'password123'})}>
                                <span className="text-sm">👑</span> <span className="truncate">principal@school.edu.np</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 hover:bg-white/10 p-2 rounded-lg transition-colors cursor-pointer" onClick={() => setForm({email: 'sita@school.edu.np', password: 'password123'})}>
                                <span className="text-sm">👨‍🏫</span> <span className="truncate">sita@school.edu.np</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 hover:bg-white/10 p-2 rounded-lg transition-colors cursor-pointer" onClick={() => setForm({email: 'bikash@student.edu.np', password: 'password123'})}>
                                <span className="text-sm">🎒</span> <span className="truncate">bikash@student.edu.np</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
