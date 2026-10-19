import { useId } from 'react';
export default function Select({ label, error, options = [], placeholder, ...rest }) {
  const id = useId();
  return (
    <div className="field">
      {label && <label htmlFor={id}>{label}</label>}
      <select id={id} className="input" aria-invalid={error ? 'true' : undefined} {...rest}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => { const v = typeof o === 'object' ? o.value : o; const l = typeof o === 'object' ? o.label : o; return <option key={v} value={v}>{l}</option>; })}
      </select>
      {error && <span className="error-text" role="alert">{error}</span>}
    </div>
  );
}
