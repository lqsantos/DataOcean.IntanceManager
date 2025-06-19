// app/resources/page.tsx
import { redirect } from 'next/navigation';

export default function ResourcesPage() {
  // Redirect to the templates tab by default
  redirect('/resources/templates');
}
