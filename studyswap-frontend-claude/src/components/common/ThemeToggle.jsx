import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button className="btn btn-ghost btn-icon" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title="Toggle theme">
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
