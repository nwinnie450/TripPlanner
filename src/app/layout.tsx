import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import AuthProvider from "@/context/AuthContext";
import ToastProvider from "@/context/ToastContext";
import AppBottomNav from "@/components/ui/AppBottomNav";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "GroupTrip",
  description: "Plan together. Split fair.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GroupTrip",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#7C3AED',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${inter.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          <ToastProvider>
            {children}
            <AppBottomNav />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
