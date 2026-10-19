import { useRef, useState } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { resourceService } from '../../services/resourceService';
import { useToast } from '../../contexts/NotificationContext';
import { validateUpload, validateFile } from '../../utils/validation';
import { formatFileSize } from '../../utils/formatFileSize';
import { RESOURCE_TYPES, SEMESTERS } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';

export default function ResourceUploadForm() {
  const { user, refresh } = useAuth();
  const toast = useToast();
  const initial = { title: '', description: '', college: user?.college || '', degree: user?.degree || '', branch: user?.branch || '', semester: user?.semester ? String(user.semester) : '', subject: '', unit: '', resourceType: '', tags: '' };
  const [v, setV] = useState(initial);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [formError, setFormError] = useState('');
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  const pick = (f) => { if (!f) return; setFile(f); setErrors((e) => ({ ...e, file: validateFile(f) })); };
  const reset = () => { setV(initial); setFile(null); setErrors({}); setProgress(0); setResult(null); setFormError(''); };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validateUpload(v, file);
    setErrors(errs); setFormError('');
    if (Object.keys(errs).length) return;
    setBusy(true); setProgress(0);
    try {
      const tags = v.tags.split(',').map((t) => t.trim()).filter(Boolean);
      const res = await resourceService.upload({ ...v, title: v.title.trim(), description: v.description.trim(), tags }, file, setProgress);
      setResult(res?.data || res);
      if (typeof refresh === 'function') refresh();
      toast.success('Resource shared successfully! +20 points earned');
    } catch (err) {
      let msg = err.message || 'Upload failed.';
      if (err.errors) {
        if (Array.isArray(err.errors)) {
          const mapped = {};
          err.errors.forEach((e) => { if (e.field) mapped[e.field] = e.message; });
          setErrors(mapped);
          if (err.errors[0]?.message) msg = err.errors[0].message;
        } else if (typeof err.errors === 'object') {
          setErrors((s) => ({ ...s, ...err.errors }));
        }
      }
      setFormError(msg);
      toast.error(msg);
    } finally { setBusy(false); }
  };

  if (result) {
    return (
      <div className="card stack" role="status">
        <div className="alert ok">
          <strong>Upload complete!</strong> “{result.title || v.title}” is now shared and live in the Material Hub.
        </div>
        <div className="row">
          <Button onClick={reset}>Upload another</Button>
          <Button to="/app/materials">View in Material Hub</Button>
          <Button variant="ghost" to="/app/my-uploads">My uploads</Button>
        </div>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={submit} noValidate>
      {formError && <div className="alert" role="alert" style={{ marginBottom: '1rem' }}>{formError}</div>}
      <Input label="Title" value={v.title} onChange={set('title')} error={errors.title} maxLength={150} />
      <Input as="textarea" label="Description" value={v.description} onChange={set('description')} error={errors.description} maxLength={1000} />
      <div className="form-2">
        <Input label="College" value={v.college} onChange={set('college')} error={errors.college} />
        <Input label="Degree" value={v.degree} onChange={set('degree')} error={errors.degree} />
        <Input label="Branch" value={v.branch} onChange={set('branch')} error={errors.branch} />
        <Select label="Semester" value={v.semester} onChange={set('semester')} error={errors.semester} placeholder="Choose" options={SEMESTERS} />
        <Input label="Subject" value={v.subject} onChange={set('subject')} error={errors.subject} />
        <Input label="Unit" value={v.unit} onChange={set('unit')} error={errors.unit} placeholder="e.g. 3" />
        <Select label="Resource type" value={v.resourceType} onChange={set('resourceType')} error={errors.resourceType} placeholder="Choose" options={RESOURCE_TYPES} />
        <Input label="Tags" value={v.tags} onChange={set('tags')} hint="Separate with commas" />
      </div>

      <div className="field">
        <span id="file-label" style={{ fontSize: '.875rem', fontWeight: 600 }}>File</span>
        <div className={`dropzone ${drag ? 'drag' : ''}`} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}>
          <UploadCloud size={32} className="red" aria-hidden="true" />
          <p style={{ margin: '.5rem 0' }}>Drag a file here, or</p>
          <input ref={inputRef} type="file" hidden aria-labelledby="file-label" accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => pick(e.target.files?.[0])} />
          <Button variant="ghost" onClick={() => inputRef.current?.click()}>Browse files</Button>
          <p className="hint" style={{ margin: '.75rem 0 0' }}>PDF, PPT, PPTX, DOC, DOCX, JPG, JPEG, PNG · up to 20 MB</p>
        </div>
        {file && (
          <div className="row row-between card" style={{ padding: '.6rem .9rem' }}>
            <span className="row"><FileText size={18} className="red" /><span>{file.name}</span><span className="muted">{formatFileSize(file.size)}</span></span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = ''; }} aria-label="Remove selected file"><X size={14} /></button>
          </div>
        )}
        {errors.file && <span className="error-text" role="alert">{errors.file}</span>}
      </div>

      {busy && <div className="progress" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100" aria-label="Upload progress" style={{ marginBottom: '1rem' }}><div style={{ width: `${progress}%` }} /></div>}
      <div className="row"><Button type="submit" loading={busy}>{busy ? `Uploading ${progress}%` : 'Upload material'}</Button><Button variant="ghost" onClick={reset} disabled={busy}>Reset form</Button></div>
    </form>
  );
}
