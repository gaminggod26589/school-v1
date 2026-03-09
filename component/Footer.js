'use client';
// Footer — school information, quick links, contact details, Google Map
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
    const year = new Date().getFullYear();
    const pathname = usePathname();

    // If we are in the portal, do not render this footer
    if (pathname && pathname.startsWith('/portal')) return null;

    return (
        <footer style={{ background: 'var(--navy)' }} className="text-white py-19 gap-5">
            {/* Main footer grid */}
            <div className="container-custom">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* Column 1 — School info */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div style={{ background: 'var(--crimson)' }} className="w-10 h-10 rounded-lg flex items-center justify-center gap-4 font-black text-lg">M</div>
                            <div>
                                <p className="font-bold leading-none">Martyrs&apos; Memorial School</p>
                                <p className="text-blue-200 text-xs">Urlabari, Morang, Nepal</p>
                            </div>
                        </div>
                        <p className="text-blue-100 text-sm leading-relaxed">
                            Committed to nurturing future leaders through quality education, values, and holistic development since 2050 B.S.
                        </p>
                    </div>

                    {/* Column 2 — Quick links */}
                    <div>
                        <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-blue-200">Quick Links</h3>
                        <ul className="flex flex-col text-sm text-blue-100">
                            {[
                                { label: 'Home', href: '/' },
                                { label: 'About Us', href: '/about' },
                                { label: 'Academics', href: '/academics' },
                                { label: 'Our Faculty', href: '/faculty' },
                                { label: 'Notice Board', href: '/notice-board' },
                                { label: 'Gallery', href: '/gallery' },
                            ].map((l) => (
                                <li key={l.href}>
                                    <Link href={l.href} className="hover:text-white transition-colors flex items-center gap-1">
                                        <span className="text-crimson">›</span> {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3 — Contact */}
                    <div>
                        <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-blue-200">Contact Us</h3>
                        <ul className="flex flex-col mt-4 gap-4 text-sm text-blue-100">
                            <li className="flex gap-2">
                                <span>📍</span>
                                <span>Urlabari-5, Morang District, Koshi Province, Nepal</span>
                            </li>
                            <li className="flex gap-2">
                                <span>📞</span>
                                <span>+977-021-570XXX</span>
                            </li>
                            <li className="flex gap-2">
                                <span>✉️</span>
                                <span>info@martyrsmemorial.edu.np</span>
                            </li>
                            <li className="flex gap-2">
                                <span>🕐</span>
                                <span>Sun–Fri: 10:00 AM – 4:00 PM</span>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4 — Mini Map */}
                    <div>
                        <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-blue-200">Our Location</h3>
                        <div className="rounded-lg overflow-hidden border-2 border-blue-800">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3572.2452880864485!2d87.28405579999999!3d26.4478212!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ef743663b54f97%3A0x591363e8e88ec4fc!2sMartyrs&#39;%20Memorial%20School!5e0!3m2!1sen!2snp!4v1771834847222!5m2!1sen!2snp"
                                width="100%"
                                height="150"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Martyrs Memorial School Location"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-blue-900">
                <div className="container-custom py-4 flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-blue-300">
                    <p>© {year} Martyrs&apos; Memorial School. All rights reserved.</p>
                    <p>Designed with ❤️ for quality education in Nepal</p>
                </div>
            </div>
        </footer>
    );
}
