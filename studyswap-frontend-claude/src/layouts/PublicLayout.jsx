import { Outlet } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import AppFooter from '../components/layout/AppFooter';
export default function PublicLayout() {
  return (<><a className="skip-link" href="#main">Skip to content</a><PublicNavbar /><main id="main"><Outlet /></main><AppFooter /></>);
}
