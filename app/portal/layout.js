'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import PortalSidebar from '@/component/PortalSidebar';

export default function PortalLayout({ children }) {
    const { user, loading, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.push('/login');
    }, [user, loading]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-[#0f2557] border-t-transparent animate-spin" />
                    <p className="text-[#0f2557] font-bold text-sm tracking-wide">Loading portal…</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <PortalSidebar user={user} pathname={pathname} logout={logout} />
            <main className="flex-1 min-w-0 overflow-x-hidden">
                <div className="px-4 sm:px-6 lg:px-10 py-8 pt-16 lg:pt-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
