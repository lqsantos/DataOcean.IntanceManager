// app/environments/page.tsx
import { redirect } from 'next/navigation';

export default function EnvironmentsRoute() {
  redirect('/settings/environments');
}
