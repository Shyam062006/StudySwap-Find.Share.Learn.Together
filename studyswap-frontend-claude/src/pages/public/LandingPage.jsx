import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Share2, SlidersHorizontal, Bookmark, Star, Users, FileText, FlaskConical, BookOpen, ClipboardList, Presentation, GraduationCap } from 'lucide-react';
import Button from '../../components/common/Button';

const features = [
  { icon: Search, t: 'Discover Study Materials', d: 'Find notes, papers and lab records shared by other students.' },
  { icon: Share2, t: 'Share Academic Resources', d: 'Upload what helped you so the next student can start further ahead.' },
  { icon: SlidersHorizontal, t: 'Search and Filter', d: 'Narrow by college, branch, semester, subject, unit and type.' },
  { icon: Bookmark, t: 'Save Useful Resources', d: 'Bookmark materials and return to them before exams.' },
  { icon: Star, t: 'Ratings and Reviews', d: 'See what is worth your time before you download.' },
  { icon: Users, t: 'Student Contributions', d: 'Earn contribution points for materials you share.' },
];
const categories = [
  { icon: BookOpen, t: 'Lecture Notes' }, { icon: FileText, t: 'Previous Papers' }, { icon: FlaskConical, t: 'Lab Manuals & Records' },
  { icon: ClipboardList, t: 'Question Banks' }, { icon: Presentation, t: 'Presentations' }, { icon: GraduationCap, t: 'Study Guides' },
];

export default function LandingPage() {
  const { hash } = useLocation();
  useEffect(() => { if (hash) document.getElementById(hash.slice(1))?.scrollIntoView(); }, [hash]);
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.5rem', padding: '.5rem 1.2rem', background: 'rgba(239,35,60,0.08)', borderRadius: '999px', border: '1px solid rgba(239,35,60,0.25)', backdropFilter: 'blur(8px)' }}>
              <div className="logo-glow-wrapper" style={{ width: 28, height: 28 }}>
                <img src="/StudySwap.png" alt="StudySwap Logo" style={{ width: 28, height: 28, objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(239,35,60,0.7))' }} />
              </div>
              <span style={{ fontSize: '.88rem', fontWeight: 700, letterSpacing: '0.02em', color: 'var(--text)' }}>StudySwap — Find. Share. Learn. Together.</span>
            </div>
            <h1>Your Knowledge.<br /><span className="red">Shared</span> with Everyone.</h1>
            <p className="lead">Discover notes, previous papers, lab records, and study materials shared by students. Find what you need, contribute what you know, and make learning easier for everyone.</p>
            <div className="row"><Button to="/app/materials">Explore Materials</Button><Button to="/app/upload" variant="ghost">Share Your Notes</Button></div>
          </div>
          <div className="card preview" aria-label="Material Hub preview" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute',
              right: -20,
              bottom: -20,
              width: 180,
              height: 180,
              backgroundImage: 'url(/StudySwap.png)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              opacity: 0.12,
              pointerEvents: 'none',
              filter: 'drop-shadow(0 0 24px rgba(239,35,60,0.45))'
            }} />
            <strong>Material Hub</strong>
            <div className="bar"><span className="badge badge-red">Semester</span><span className="badge">Subject</span><span className="badge">Unit</span><span className="badge">Resource type</span></div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="card" style={{ marginTop: '.6rem', padding: '.8rem' }}>
                <div className="row" style={{ flexWrap: 'nowrap' }}><span className="filetype">PDF</span><div style={{ flex: 1 }}><div className="skeleton line" style={{ width: `${70 - i * 10}%`, animation: 'none' }} /><div className="skeleton line" style={{ width: '45%', animation: 'none' }} /></div></div>
              </div>
            ))}
            <p className="hint" style={{ margin: '.75rem 0 0' }}>Illustrative layout. Real materials appear once you sign in.</p>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="features">
        <div className="container">
          <h2>Everything you need to study together</h2>
          <div className="grid features" style={{ marginTop: '1.5rem' }}>
            {features.map(({ icon: I, t, d }) => (<div className="card" key={t}><I size={26} aria-hidden="true" /><h3>{t}</h3><p className="muted" style={{ margin: 0 }}>{d}</p></div>))}
          </div>
        </div>
      </section>

      <section className="section" id="how-it-works">
        <div className="container">
          <h2>How it works</h2>
          <div className="grid steps" style={{ marginTop: '1.5rem' }}>
            <div className="card"><h3>Discover</h3><p className="muted" style={{ margin: 0 }}>Search the Material Hub and filter to your exact subject and semester.</p></div>
            <div className="card"><h3>Learn</h3><p className="muted" style={{ margin: 0 }}>Download, save and rate the resources that help you most.</p></div>
            <div className="card"><h3>Share</h3><p className="muted" style={{ margin: 0 }}>Upload your own notes. Approved materials earn you contribution points.</p></div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <h2>Resource categories</h2>
          <div className="grid grid-2" style={{ marginTop: '1.5rem' }}>
            {categories.map(({ icon: I, t }) => (<div className="card row" key={t}><I className="red" size={22} aria-hidden="true" /><strong>{t}</strong></div>))}
          </div>
        </div>
      </section>

      <section className="section"><div className="container"><div className="cta"><h2>Your Next Study Resource Is Here.</h2><p className="muted">One hub. Every subject, semester and branch.</p><Button to="/app/materials">Enter Material Hub</Button></div></div></section>
    </>
  );
}
