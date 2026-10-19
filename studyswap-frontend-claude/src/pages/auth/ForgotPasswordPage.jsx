import { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authService } from '../../services/authService';

// NOTE: POST /auth/forgot-password is not in the base API contract. If the backend does not
// implement it, the error returned by the server is shown to the user.
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter a valid email address.');
    setError(''); setBusy(true);
    try { await authService.forgotPassword(email.trim()); setSent(true); } catch (err) { setError(err.status === 404 ? 'Password reset via email is not configured in this demo. Please use the quick student logins on the login page.' : err.message); } finally { setBusy(false); }
  };
  return (
    <div className="auth-wrap"><form className="card auth-card" onSubmit={submit} noValidate>
      <h2>Reset your password</h2>
      {sent ? <div className="alert ok" role="status">If an account exists for that email, a reset link has been sent.</div> : (
        <><p className="muted">Enter your email and we will send reset instructions.</p>
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
          <Button type="submit" block loading={busy}>Send reset link</Button></>
      )}
      <p style={{ marginTop: '1rem', marginBottom: 0 }}><Link to="/login" className="red">Back to log in</Link></p>
    </form></div>
  );
}
