import { Link, NavLink } from 'react-router-dom';
export default function AppSidebar({ items, title }) {
  return (
    <aside className="sidebar" aria-label="Sidebar">
      <Link to="/" className="brand-highlight" aria-label="StudySwap Home" style={{ padding: '.4rem .5rem', marginBottom: '.5rem' }}>
        <div className="logo-glow-wrapper">
          <img src="/StudySwap.png" alt="StudySwap Logo" className="brand-logo-img" />
        </div>
        <div className="brand-text-col">
          <span className="brand-title">Study<span className="red">Swap</span></span>
          <span className="brand-tagline">Find. Share. Learn.</span>
        </div>
      </Link>
      {title && <span className="muted" style={{ fontSize: '.8rem', padding: '0 .8rem' }}>{title}</span>}
      <nav aria-label="Application">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `navitem ${isActive ? 'active' : ''}`}><Icon size={18} aria-hidden="true" />{label}</NavLink>
        ))}
      </nav>
    </aside>
  );
}
