import React from 'react';
import { Theme } from '../types';
import { ThemeIcon } from './Icons';

interface ThemeSwitcherProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, setTheme }) => {
  
  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('matrix');
    else setTheme('light');
  };

  const themeTitle = {
    light: 'მუქი თემა',
    dark: 'მატრიცის თემა',
    matrix: 'ღია თემა',
  };

  return (
    <div className="absolute top-4 right-4">
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full text-secondary hover:text-accent transition-colors duration-200"
        aria-label="თემის შეცვლა"
        title={themeTitle[theme]}
      >
        <ThemeIcon theme={theme} />
      </button>
    </div>
  );
};

export default ThemeSwitcher;
