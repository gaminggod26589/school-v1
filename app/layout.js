// Root layout — wraps every page with AuthProvider, Navbar, and Footer
// Inter font is loaded from Google Fonts via globals.css

import './globals.css';
import { AuthProvider } from '@/app/context/AuthContext';
import Navbar from '@/component/navbar';
import Footer from '@/component/Footer';

// Browser tab title and meta description
export const metadata = {
  title: "Martyrs' Memorial School — Urlabari, Nepal",
  description:
    "Official website of Martyrs' Memorial School, Urlabari. Explore academics, faculty, notices, events, library, and student portal.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* AuthProvider gives every page access to login/logout state */}
        <AuthProvider>
          <Navbar />
          {/* Each page renders here */}
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
