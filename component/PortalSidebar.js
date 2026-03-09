'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PortalSidebar({ user, pathname, logout }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab') || 'default';

    const navItems = {
        student: [
            { label: 'Library', icon: '📚', href: '/portal/student' },
            { label: 'Practicals', icon: '🔬', href: '/portal/student/practicals' },
        ],
        teacher: [
            { label: 'Schedule', icon: '📅', href: '/portal/teacher?tab=schedule', tab: 'schedule' },
            { label: 'Leave', icon: '🏖️', href: '/portal/teacher?tab=leave', tab: 'leave' },
            { label: 'Upload Center', icon: '⬆️', href: '/portal/teacher?tab=upload', tab: 'upload' },
            { label: 'My Uploads', icon: '📁', href: '/portal/teacher?tab=my-uploads', tab: 'my-uploads' },
        ],
        principal: [
            { label: 'Students', icon: '👥', href: '/portal/principal?tab=students', tab: 'students' },
            { label: 'Staff Directory', icon: '🏫', href: '/portal/principal?tab=staff', tab: 'staff' },
            { label: 'School Board', icon: '📋', href: '/portal/principal?tab=school', tab: 'school' },
            { label: 'Uploads', icon: '📤', href: '/portal/principal?tab=uploads', tab: 'uploads' },
        ]
    };

    const links = navItems[user?.role] || [];
    const roleColors = {
        student: 'from-blue-600 to-indigo-700',
        teacher: 'from-violet-600 to-purple-700',
        principal: 'from-rose-600 to-red-700',
    };
    const gradientClass = roleColors[user?.role] || 'from-[#0f2557] to-[#1e3a8a]';

    const SidebarContent = () => (
        <div className={`bg-gradient-to-b ${gradientClass} text-white flex flex-col h-full shadow-2xl`}>
            {/* Profile Header */}
            <div className="p-6 flex items-center gap-4 border-b border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center font-black text-xl border-2 border-white/20 shrink-0 shadow-lg">
                    {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0">
                    <p className="font-bold text-sm truncate leading-tight">{user?.name}</p>
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-white/15 rounded-full px-2 py-0.5 mt-1 inline-block">
                        {user?.role}
                    </span>
                </div>
                {/* Mobile Close */}
                <button onClick={() => setMobileOpen(false)} className="ml-auto lg:hidden text-white/60 hover:text-white">✕</button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                <p className="px-3 text-[10px] text-white/40 uppercase tracking-widest font-bold mb-3 mt-2">Menu</p>
                {links.map((link) => {
                    let isActive = false;
                    if (link.tab) {
                        // Use tab param for teacher/principal
                        isActive = currentTab === link.tab || (currentTab === 'default' && link.tab === links[0].tab);
                    } else {
                        // Use pathname for student
                        isActive = pathname === link.href || (link.href !== '/portal/student' && pathname.startsWith(link.href));
                    }
                    const exactActive = link.href === '/portal/student' ? pathname === link.href : isActive;

                    return (
                        <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 text-sm font-semibold
                                ${exactActive ? 'bg-white/15 text-white shadow-inner border border-white/10 scale-[1.02]' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
                            <span className="text-base">{link.icon}</span>
                            <span>{link.label}</span>
                            {exactActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="p-4 border-t border-white/10 space-y-1">
                <Link href="/" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-white/50 hover:text-white hover:bg-white/10 transition-all text-xs font-semibold uppercase tracking-wider">
                    <span>🏠</span> Back to Website
                </Link>
                <button onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-300 hover:text-red-100 hover:bg-red-500/20 transition-all text-xs font-semibold uppercase tracking-wider">
                    <span>🚪</span> Logout
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 shrink-0 h-screen sticky top-0">
                <div className="w-full flex flex-col"><SidebarContent /></div>
            </aside>

            {/* Mobile Hamburger Button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 bg-[#0f2557] text-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-xl text-xl border border-white/10">
                ☰
            </button>

            {/* Mobile Drawer */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div className="w-72 h-full flex flex-col"><SidebarContent /></div>
                    <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                </div>
            )}
        </>
    );
}
