'use client'

import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';

import { SessionProvider } from 'next-auth/react';

export default function RootLayout({ children }) {
  return (
    <SessionProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </SessionProvider>
  );
}