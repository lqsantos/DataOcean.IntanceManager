import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

import { ClientLayout } from '@/components/layout/client-layout';
import { MainLayout } from '@/components/layout/main-layout';
import { Providers } from '@/lib/providers';
import { MockProvider } from '@/mocks/provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// Metadata needs to be in a Server Component
export const metadata: Metadata = {
  title: 'DataOcean Instance Manager',
  description: 'Plataforma para gerenciamento de instâncias DataOcean',
};

// This is a Server Component now (no 'use client' directive)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className={inter.className}>
        <MockProvider>
          <Providers>
            <ClientLayout>
              <MainLayout>{children}</MainLayout>
            </ClientLayout>
            <Toaster position="top-right" richColors />
          </Providers>
        </MockProvider>
      </body>
    </html>
  );
}
