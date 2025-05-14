if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
  import('@/mocks');
}

import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'DataOcean Instance Manager',
  description: 'Manage your DataOcean instances',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
