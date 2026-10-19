import { Link } from 'react-router-dom';
export default function AppFooter() {
  return (
    <footer className="footer">
      <div className="container inner">
        <div>
          <Link to="/" className="brand"><img src="/StudySwap.png" alt="StudySwap" style={{ objectFit: 'contain' }} />StudySwap</Link>
          <p style={{ margin: '.5rem 0 0' }}>Find. Share. Learn. Together.</p>
        </div>
        <nav aria-label="Footer">
          <Link to="/">Home</Link><Link to="/app/materials">Material Hub</Link><Link to="/about">About</Link><Link to="/login">Login</Link>
        </nav>
        <small>© {new Date().getFullYear()} StudySwap</small>
      </div>
    </footer>
  );
}
