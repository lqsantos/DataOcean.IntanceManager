import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

import { MainLayout } from '@/components/layout/main-layout';
import { Providers } from '@/lib/providers';
import { MockProvider } from '@/mocks/provider';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DataOcean Instance Manager',
  description: 'Plataforma para gerenciamento de instâncias DataOcean',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <MockProvider>
          <Providers>
            <MainLayout>{children}</MainLayout>
            <Toaster position="top-right" richColors />
          </Providers>
        </MockProvider>
      </body>
    </html>
  );
}
