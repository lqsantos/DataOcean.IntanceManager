'use client';

import { CreateTemplateModalProvider } from '@/contexts/create-template-modal-context';

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return <CreateTemplateModalProvider>{children}</CreateTemplateModalProvider>;
}
