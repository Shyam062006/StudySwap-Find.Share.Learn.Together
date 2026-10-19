import { Link } from 'react-router-dom';
export default function Button({ variant = 'primary', size, loading = false, to, href, block, icon, className = '', children, disabled, type = 'button', ...rest }) {
  const cls = `btn btn-${variant} ${size === 'sm' ? 'btn-sm' : ''} ${block ? 'btn-block' : ''} ${className}`.trim();
  const inner = (<>{loading && <span className="spinner" aria-hidden="true" />}{!loading && icon}{children}</>);
  if (to) return <Link to={to} className={cls} {...rest}>{inner}</Link>;
  if (href) return <a href={href} className={cls} {...rest}>{inner}</a>;
  return <button type={type} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>{inner}</button>;
}
