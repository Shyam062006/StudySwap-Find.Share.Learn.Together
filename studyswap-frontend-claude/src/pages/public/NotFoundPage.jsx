import { SearchX } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
export default function NotFoundPage() {
  return <div className="container section"><EmptyState icon={SearchX} title="Page not found" text="The page you are looking for does not exist or has moved." action={{ label: 'Go to home', to: '/' }} /></div>;
}
