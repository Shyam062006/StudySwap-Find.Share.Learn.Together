import { Link, NavLink } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';
import Button from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';

export default function PublicNavbar() {
  const { user } = useAuth();
  return (
    <header className="pnav">
      <div className="container inner">
        <Link to="/" className="brand-highlight" aria-label="StudySwap home">
          <div className="logo-glow-wrapper">
            <img src="/StudySwap.png" alt="StudySwap Logo" className="brand-logo-img" />
          </div>
          <div className="brand-text-col">
            <span className="brand-title">Study<span className="red">Swap</span></span>
            <span className="brand-tagline">Find. Share. Learn.</span>
          </div>
        </Link>
        <nav className="navlinks desktop" aria-label="Main">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/app/materials">Explore Materials</NavLink>
          <Link to="/#how-it-works">How It Works</Link>
          <NavLink to="/about">About</NavLink>
        </nav>
        <div className="row">
          <ThemeToggle />
          {user ? <Button to="/app/dashboard" size="sm">Open app</Button> : (
            <>
              <Button to="/login" variant="ghost" size="sm">Login</Button>
              <Button to="/register" size="sm">Get Started</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
