import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const SwatchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className || 'w-6 h-6'}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"
    />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
    className={className || 'w-6 h-6'}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12.75l6 6 9-13.5"
    />
  </svg>
);

const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeSelect = (themeId: string) => {
    setTheme(themeId);
  };

  return (
    <div className="relative z-50">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm hover:bg-white border border-indigo-100 rounded-full shadow-sm hover:shadow-md transition-all text-indigo-600 group"
        aria-label="切換主題"
        aria-expanded={isOpen}
      >
        <div className="p-1 rounded-full bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
          <SwatchIcon className="w-5 h-5" />
        </div>
        <span className="hidden sm:inline font-medium text-sm text-slate-600 group-hover:text-indigo-700">
          {currentTheme.name}
        </span>
      </button>

      <div
        ref={dropdownRef}
        className={`absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 transition-all duration-300 origin-top-right transform ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 visible'
            : 'opacity-0 scale-95 -translate-y-2 invisible'
        }`}
      >
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="font-bold text-slate-800 text-lg">選擇主題風格</h3>
          <span className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-500">
            {availableThemes.length} 款風格
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
          {availableThemes.map(theme => {
            const isActive = currentTheme.id === theme.id;

            return (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme.id)}
                className={`relative group flex flex-col items-start p-3 rounded-xl border-2 transition-all duration-200 text-left w-full
                  ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500/20'
                      : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                  }`}
              >
                <div
                  className={`w-full h-16 rounded-lg mb-3 bg-gradient-to-br ${theme.gradient} relative overflow-hidden shadow-inner`}
                >
                  <div className="absolute bottom-2 right-2 flex -space-x-1">
                    <div
                      className="w-5 h-5 rounded-full ring-2 ring-white z-30"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <div
                      className="w-5 h-5 rounded-full ring-2 ring-white z-20"
                      style={{ backgroundColor: theme.colors.secondary }}
                    />
                    <div
                      className="w-5 h-5 rounded-full ring-2 ring-white z-10"
                      style={{ backgroundColor: theme.colors.accent }}
                    />
                  </div>

                  {theme.isDark && (
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/30 backdrop-blur-sm rounded text-[10px] text-white font-medium">
                      Dark
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-start w-full">
                  <div>
                    <h4
                      className={`font-bold text-sm ${isActive ? 'text-indigo-900' : 'text-slate-700'}`}
                    >
                      {theme.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {theme.description}
                    </p>
                  </div>

                  {isActive && (
                    <div className="text-indigo-600 bg-indigo-100 rounded-full p-0.5">
                      <CheckIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
