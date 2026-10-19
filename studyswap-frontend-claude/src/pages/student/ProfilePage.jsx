import { useState } from 'react';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/NotificationContext';
import { useFetch } from '../../hooks/useFetch';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { ErrorState } from '../../components/common/EmptyState';
import { SEMESTERS } from '../../utils/constants';

export default function ProfilePage() {
  const { setUser } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => userService.me(), []);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const me = data?.data;
  if (loading) return <Loader />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!me) return null;
  const f = form || { name: me.name, college: me.college || '', degree: me.degree || '', branch: me.branch || '', semester: String(me.semester || '') };
  const set = (k) => (e) => setForm({ ...f, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault();
    const errs = {}; if (!f.name.trim()) errs.name = 'Name is required.'; setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try { const res = await userService.update({ ...f, name: f.name.trim(), semester: Number(f.semester) }); setUser((u) => ({ ...u, ...(res?.data || f) })); toast.success('Profile updated.'); setForm(null); reload(); }
    catch (err) { toast.error(err.message); if (err.errors) setErrors(err.errors); } finally { setBusy(false); }
  };
  const s = me.stats || {};
  return (
    <div className="stack">
      <div className="page-head"><h1 style={{ fontSize: '2rem' }}>My profile</h1><p>{me.email}</p></div>
      <div className="grid grid-stats">
        {[['Contribution points', me.contributionPoints ?? 0], ['Uploads', s.uploads ?? 0], ['Approved', s.approved ?? 0], ['Downloads received', s.downloads ?? 0]].map(([l, n]) => <div className="card stat" key={l}><strong>{n}</strong><span>{l}</span></div>)}
      </div>
      <form className="card" onSubmit={save} noValidate style={{ maxWidth: 640 }}>
        <h3>Edit details</h3>
        <Input label="Full name" value={f.name} onChange={set('name')} error={errors.name} />
        <Input label="Email" value={me.email} disabled hint="Email cannot be changed here." readOnly />
        <div className="form-2"><Input label="College" value={f.college} onChange={set('college')} /><Input label="Degree" value={f.degree} onChange={set('degree')} /><Input label="Branch" value={f.branch} onChange={set('branch')} /><Select label="Semester" value={f.semester} onChange={set('semester')} options={SEMESTERS} placeholder="Choose" /></div>
        <Button type="submit" loading={busy} disabled={!form}>Save changes</Button>
      </form>
    </div>
  );
}
