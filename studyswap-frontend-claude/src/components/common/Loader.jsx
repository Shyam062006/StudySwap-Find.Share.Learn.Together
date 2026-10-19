export default function Loader({ label = 'Loading…' }) {
  return <div className="row" role="status" style={{ justifyContent: 'center', padding: '2rem' }}><span className="spinner" aria-hidden="true" /><span className="muted">{label}</span></div>;
}
