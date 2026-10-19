import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { validateLogin } from '../../utils/validation';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [v, setV] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));

  const doLogin = async (email, password) => {
    setBusy(true);
    setFormError('');
    try {
      await login({ email: email.trim(), password });
      navigate(location.state?.from || '/app/dashboard', { replace: true });
    } catch (err) {
      setFormError(err.status === 401 ? 'Email or password is incorrect.' : err.message);
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validateLogin(v);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    await doLogin(v.email, v.password);
  };

  const handleQuickLogin = (email, password) => {
    setV({ email, password });
    doLogin(email, password);
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={submit} noValidate>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem', marginBottom: '1.5rem' }}>
          <div className="logo-glow-wrapper large">
            <img src="/StudySwap.png" alt="StudySwap" className="brand-logo-img large" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.5rem', lineHeight: 1.1 }}>
              Study<span style={{ color: 'var(--red)' }}>Swap</span>
            </span>
            <span className="muted" style={{ fontSize: '.78rem', fontWeight: 500 }}>Find. Share. Learn. Together.</span>
          </div>
        </div>
        <h2>Student Sign In</h2>
        <p className="muted">Log in with your student account to share & discover study materials.</p>

        {formError && <div className="alert" role="alert" style={{ marginBottom: '1rem' }}>{formError}</div>}

        {/* Quick Student Logins */}
        <div
          style={{
            margin: '1rem 0 1.5rem',
            padding: '1rem',
            background: 'rgba(239, 35, 60, 0.05)',
            border: '1px solid rgba(239, 35, 60, 0.2)',
            borderRadius: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.65rem' }}>
            <span style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--text)' }}>⚡ Quick Student Logins:</span>
            <span className="muted" style={{ fontSize: '.75rem' }}>1-Click Sign In</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '.65rem' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => handleQuickLogin('praveen@studyswap.dev', 'Student123!')}
              disabled={busy}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '.75rem',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                textAlign: 'left',
                background: 'var(--surface)',
                cursor: 'pointer',
                gap: '2px',
                width: '100%',
              }}
            >
              <span style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text)' }}>👨‍🎓 Praveen</span>
              <span className="muted" style={{ fontSize: '.75rem' }}>CSE • Semester 5</span>
              <span style={{ fontSize: '.72rem', color: 'var(--color-primary, #EF233C)', marginTop: '4px' }}>Click to enter →</span>
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => handleQuickLogin('neelish@studyswap.dev', 'Student123!')}
              disabled={busy}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '.75rem',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                textAlign: 'left',
                background: 'var(--surface)',
                cursor: 'pointer',
                gap: '2px',
                width: '100%',
              }}
            >
              <span style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text)' }}>👨‍🎓 Neelish</span>
              <span className="muted" style={{ fontSize: '.75rem' }}>CSE • Semester 5</span>
              <span style={{ fontSize: '.72rem', color: 'var(--color-primary, #EF233C)', marginTop: '4px' }}>Click to enter →</span>
            </button>
          </div>
        </div>

        <Input label="Student Email" type="email" autoComplete="email" value={v.email} onChange={set('email')} error={errors.email} />
        <Input label="Password" type="password" autoComplete="current-password" value={v.password} onChange={set('password')} error={errors.password} />
        <div className="row row-between" style={{ marginBottom: '1rem' }}>
          <span className="hint">Session preserved securely by HTTP cookie.</span>
          <Link to="/forgot-password" className="red">Forgot password?</Link>
        </div>
        <Button type="submit" block loading={busy}>Log in</Button>
        <p className="muted" style={{ marginTop: '1rem', marginBottom: 0 }}>
          New student? <Link to="/register" className="red">Create a student account</Link>
        </p>
      </form>
    </div>
  );
}

