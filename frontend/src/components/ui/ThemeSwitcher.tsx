import React from 'react';
import { Contrast } from 'lucide-react';
import { useTheme, Theme } from '@/hooks/useTheme';

const colorThemes: { id: Theme; color: string; label: string }[] = [
  { id: 'neutral', color: '#EAEAEA', label: 'Neutral' },
  { id: 'pink', color: '#E2A4A7', label: 'Pink' },
  { id: 'green', color: '#99AC96', label: 'Green' },
  { id: 'yellow', color: '#DABE97', label: 'Yellow' },
];

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-muted/30">
      {colorThemes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`w-4 h-4 rounded-full transition-all shadow-sm ${
            theme === t.id 
              ? 'ring-1 ring-offset-1 ring-foreground scale-110' 
              : 'hover:scale-110'
          }`}
          style={{ 
            backgroundColor: t.color,
            border: '1px solid rgba(0,0,0,0.12)'
          }}
          title={t.label}
          aria-label={`Switch to ${t.label} theme`}
        />
      ))}
      
      {/* High Contrast Mode */}
      <button
        onClick={() => setTheme('contrast')}
        className={`w-4 h-4 rounded-full transition-all flex items-center justify-center ${
          theme === 'contrast' 
            ? 'ring-1 ring-offset-1 ring-foreground scale-110 bg-foreground' 
            : 'hover:scale-110 bg-background border border-foreground'
        }`}
        title="High Contrast"
        aria-label="Switch to High Contrast theme"
      >
        <Contrast className={`w-2.5 h-2.5 ${theme === 'contrast' ? 'text-background' : 'text-foreground'}`} />
      </button>
    </div>
  );
};

export default ThemeSwitcher;