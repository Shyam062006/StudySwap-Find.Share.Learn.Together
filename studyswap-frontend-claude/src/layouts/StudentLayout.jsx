import { Outlet } from 'react-router-dom';
import AppSidebar from '../components/layout/AppSidebar';
import AppHeader from '../components/layout/AppHeader';
import MobileNavigation from '../components/layout/MobileNavigation';
import { studentNav, mobileNav } from '../utils/navigation';
export default function StudentLayout() {
  return (
    <div className="shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <AppSidebar items={studentNav} />
      <div className="main-col"><AppHeader /><main id="main" className="content"><Outlet /></main></div>
      <MobileNavigation items={mobileNav} />
    </div>
  );
}
