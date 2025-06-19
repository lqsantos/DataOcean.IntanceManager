// app/applications/page.tsx
import { redirect } from 'next/navigation';

export default function ApplicationsRoute() {
  redirect('/settings/applications');
}
