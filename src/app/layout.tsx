import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { MainLayout } from '@/components/layout/main-layout';
import { ThemeProvider } from '@/components/theme-provider';
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
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <MainLayout>{children}</MainLayout>
          </ThemeProvider>
        </MockProvider>
      </body>
    </html>
  );
}
