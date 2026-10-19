import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/NotificationContext';
import { validateRegister } from '../../utils/validation';
import { SEMESTERS } from '../../utils/constants';

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [v, setV] = useState({ name: '', email: '', password: '', confirmPassword: '', college: '', degree: '', branch: '', semester: '', terms: false });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const errs = validateRegister(v); setErrors(errs); setFormError('');
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      // The role is never sent: the server assigns the student role.
      const { confirmPassword, terms, ...payload } = v;
      await register({ ...payload, name: v.name.trim(), email: v.email.trim(), semester: Number(v.semester) });
      toast.success('Account created. Log in to continue.');
      navigate('/login');
    } catch (err) { setFormError(err.message); if (err.errors) setErrors((s) => ({ ...s, ...err.errors })); } finally { setBusy(false); }
  };
  return (
    <div className="auth-wrap"><form className="card auth-card" onSubmit={submit} noValidate>
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
      <h2>Create your account</h2><p className="muted">Join students sharing study materials.</p>
      {formError && <div className="alert" role="alert" style={{ marginBottom: '1rem' }}>{formError}</div>}
      <Input label="Full name" autoComplete="name" value={v.name} onChange={set('name')} error={errors.name} />
      <Input label="Email" type="email" autoComplete="email" value={v.email} onChange={set('email')} error={errors.email} />
      <div className="form-2">
        <Input label="Password" type="password" autoComplete="new-password" value={v.password} onChange={set('password')} error={errors.password} />
        <Input label="Confirm password" type="password" autoComplete="new-password" value={v.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} />
        <Input label="College" value={v.college} onChange={set('college')} error={errors.college} />
        <Input label="Degree" value={v.degree} onChange={set('degree')} error={errors.degree} />
        <Input label="Branch" value={v.branch} onChange={set('branch')} error={errors.branch} />
        <Select label="Semester" value={v.semester} onChange={set('semester')} error={errors.semester} placeholder="Choose" options={SEMESTERS} />
      </div>
      <div className="field"><label className="checkbox"><input type="checkbox" checked={v.terms} onChange={(e) => setV((s) => ({ ...s, terms: e.target.checked }))} />I agree to share only materials I am allowed to share, and to follow the community terms.</label>
        {errors.terms && <span className="error-text" role="alert">{errors.terms}</span>}</div>
      <Button type="submit" block loading={busy}>Create account</Button>
      <p className="muted" style={{ marginTop: '1rem', marginBottom: 0 }}>Already registered? <Link to="/login" className="red">Log in</Link></p>
    </form></div>
  );
}
