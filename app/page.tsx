import Dashboard from '@/components/Dashboard';
import { getDashboardData } from '@/lib/data';

export default function HomePage() {
  return <Dashboard data={getDashboardData()} />;
}
