import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CivicChatWidget } from '@/components/chat/CivicChatWidget';

export const metadata: Metadata = {
  title: 'CivicPulse — Intelligent Infrastructure Reporting & City Operations',
  description: 'Empowering citizens to report public infrastructure issues and enabling municipal crews to triage, dispatch, and track resolution transparently.',
  keywords: ['civic tech', 'infrastructure reporting', 'pothole report', 'municipal works', 'city operations'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-white antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,500;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-full flex-col bg-white text-slate-900 selection:bg-amber-100 selection:text-amber-900">
        <AuthProvider>
          <Suspense fallback={<div className="h-20 bg-white border-b border-slate-200" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1 bg-white">
            <Suspense fallback={<div className="min-h-screen bg-white py-16 flex items-center justify-center">Loading...</div>}>
              {children}
            </Suspense>
          </main>
          <CivicChatWidget />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
