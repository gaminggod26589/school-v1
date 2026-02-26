'use client';
// Navbar Component — Top navigation bar for the school website
// This is the simplified, beginner-friendly version as requested.

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

// List of all navigation links
const NAV_LINKS = [
  { label: 'Home',         href: '/' },
  { label: 'About',        href: '/about' },
  { label: 'Academics',    href: '/academics' },
  { label: 'Faculty',      href: '/faculty' },
  { label: 'Notice Board', href: '/notice-board' },
  { label: 'Events',       href: '/events' },
  { label: 'Gallery',      href: '/gallery' },
  { label: 'Contact',      href: '/contact' },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Controls mobile menu
  const { user, logout } = useAuth(); // Global auth context to check if logged in
  const pathname = usePathname(); // Get current URL path to highlight active link

  // Helper function: Redirect user to the correct portal based on their role
  const getPortalLink = () => {
    if (!user) return '/login';
    if (user.role === 'principal') return '/portal/principal';
    if (user.role === 'teacher')   return '/portal/teacher';
    return '/portal/student';
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 w-full z-50">
      
      {/* Top Banner - School Info (Only visible on larger screens) */}
      <div className="bg-[#0f2557] text-white text-xs py-5 text-center hidden md:block">
        🏫 Martyrs&apos; Memorial School — Urlabari, Morang &nbsp;|&nbsp; 📞 +977-021-570XXX
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-5 py-5 flex justify-between items-center">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-[#dc143c] text-white font-bold w-10 h-10 flex items-center justify-center rounded-lg">
            M
          </div>
          <div>
            <h1 className="text-[#0f2557] font-bold text-sm">Martyrs&apos; Memorial</h1>
            <p className="text-gray-500 text-xs text-left">School, Urlabari</p>
          </div>
        </Link>

        {/* Desktop Links (Hidden on mobile) */}
        <ul className="hidden lg:flex items-center gap-4">
          {NAV_LINKS.map(link => (
            <li key={link.href}>
              <Link 
                href={link.href}
                className={pathname === link.href ? "text-white bg-[#0f2557] px-4 py-2 rounded-md text-sm font-medium" : "text-gray-600 hover:text-[#0f2557] text-sm font-medium"}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Login / Portal / Logout Buttons (Desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <Link href={getPortalLink()} className="bg-[#dc143c] text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-[#a50e2d]">
                My Portal
              </Link>
              <button onClick={logout} className="text-gray-600 hover:text-red-500 text-sm font-bold">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="bg-[#dc143c] text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-[#a50e2d]">
              Login
            </Link>
          )}
        </div>

        {/* Hamburger Menu Button (Mobile Only) */}
        <button 
          className="lg:hidden text-gray-700 text-2xl" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? "✖" : "☰"}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t p-4 flex flex-col gap-3">
          {/* Mobile Links */}
          {NAV_LINKS.map(link => (
            <Link 
              key={link.href} 
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
              className={pathname === link.href ? "text-[#0f2557] font-bold" : "text-gray-600"}
            >
              {link.label}
            </Link>
          ))}
          
          <hr className="my-2" />
          
          {/* Mobile Auth Buttons */}
          {user ? (
            <div className="flex flex-col gap-2">
              <Link 
                href={getPortalLink()} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="bg-[#0f2557] text-white text-center py-2 rounded-md font-bold"
              >
                My Portal
              </Link>
              <button 
                onClick={() => { logout(); setIsMobileMenuOpen(false); }} 
                className="text-red-500 font-bold text-center py-2"
              >
                Logout
              </button>
            </div>
          ) : (
             <Link 
               href="/login" 
               onClick={() => setIsMobileMenuOpen(false)}
               className="bg-[#dc143c] text-white text-center py-2 rounded-md font-bold"
             >
               Login
             </Link>
          )}
        </div>
      )}
    </nav>
  );
}
