import Button from '../../components/common/Button';
export default function AboutPage() {
  return (
    <section className="section"><div className="container" style={{ maxWidth: 760 }}>
      <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>About StudySwap</h1>
      <p className="muted">StudySwap is a student-run space for sharing academic resources. It has one central Material Hub: every lecture note, previous paper, lab manual, question bank and study guide lives there, and subjects, semesters, branches and resource types are simply filters.</p>
      <h2 style={{ fontSize: '1.4rem' }}>How the community works</h2>
      <p className="muted">Students upload study materials directly. Readers can download, save, rate and review what they find, and contributors earn contribution points for sharing their knowledge.</p>
      <div className="row"><Button to="/app/materials">Explore Materials</Button><Button to="/register" variant="ghost">Create an account</Button></div>
    </div></section>
  );
}
