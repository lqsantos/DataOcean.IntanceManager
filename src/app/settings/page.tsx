import { redirect } from 'next/navigation';

export default function SettingsPage() {
  // Redirecionar para a primeira subseção (applications)
  redirect('/settings/applications');
}
