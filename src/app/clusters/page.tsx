// app/clusters/page.tsx
import { ClustersPage } from '@/components/clusters/clusters-page';

export const metadata = {
  title: 'Clusters | Instance Manager',
  description: 'Gerenciamento de clusters de infraestrutura',
};

export default function Page() {
  return <ClustersPage />;
}
