import { useEffect, useState } from 'react';
import '../../styles/ThemeToggleSwitch.css';

export function ThemeToggleSwitch() {
  const showToggle = import.meta.env.VITE_SHOW_THEME_SWITCH === 'true';
  if (!showToggle) return null;

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggle = () => setIsDark(prev => !prev);

  return (
    <div className="theme-switch-container">
      <label className="switch">
        <input type="checkbox" onChange={toggle} checked={isDark} />
        <span className="slider"></span>
      </label>
    </div>
  );
}
