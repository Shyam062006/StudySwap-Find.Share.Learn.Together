import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({ label, error, hint, as = 'input', type = 'text', className = '', ...rest }) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPw = type === 'password';
  const Tag = as;
  const field = (
    <Tag id={id} className={`input ${className}`} type={as === 'input' ? (isPw && show ? 'text' : type) : undefined}
      aria-invalid={error ? 'true' : undefined} aria-describedby={error ? `${id}-e` : hint ? `${id}-h` : undefined} {...rest} />
  );
  return (
    <div className="field">
      {label && <label htmlFor={id}>{label}</label>}
      {isPw ? (
        <div className="input-wrap">{field}
          <button type="button" className="toggle" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      ) : field}
      {error ? <span id={`${id}-e`} className="error-text" role="alert">{error}</span> : hint ? <span id={`${id}-h`} className="hint">{hint}</span> : null}
    </div>
  );
}
