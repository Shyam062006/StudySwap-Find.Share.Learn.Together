import { NavLink } from 'react-router-dom';
export default function MobileNavigation({ items }) {
  return (
    <nav className="mobilenav" aria-label="Mobile">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'active' : '')}><Icon size={20} aria-hidden="true" /><span>{label.split(' ')[0]}</span></NavLink>
      ))}
    </nav>
  );
}
