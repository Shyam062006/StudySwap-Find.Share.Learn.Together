import { Outlet } from 'react-router-dom';
import AppSidebar from '../components/layout/AppSidebar';
import AppHeader from '../components/layout/AppHeader';
import MobileNavigation from '../components/layout/MobileNavigation';
import { adminNav } from '../utils/navigation';
export default function AdminLayout() {
  return (
    <div className="shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <AppSidebar items={adminNav} title="Admin console" />
      <div className="main-col"><AppHeader admin /><main id="main" className="content"><Outlet /></main></div>
      <MobileNavigation items={adminNav} />
    </div>
  );
}
