/**
 * 主題提供者組件
 * 負責初始化和管理整個應用的主題狀態
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeManager, ThemeColors, BranchType, themeManager } from './index';

// 主題上下文介面
interface ThemeContextType {
  currentBranch: BranchType;
  currentTheme: ThemeColors;
  applyTheme: (branch: BranchType) => void;
  getTailwindClasses: () => Record<string, string>;
  isDarkMode: boolean;
}

// 創建主題上下文
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 主題提供者組件屬性
interface ThemeProviderProps {
  children: ReactNode;
  initialBranch?: BranchType;
}

/**
 * 主題提供者組件
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialBranch 
}) => {
  const [currentBranch, setCurrentBranch] = useState<BranchType>(
    initialBranch || themeManager.getCurrentBranch()
  );
  const [currentTheme, setCurrentTheme] = useState<ThemeColors>(
    themeManager.getCurrentTheme()
  );
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 初始化主題系統
  useEffect(() => {
    // 如果提供了初始分支，應用該主題
    if (initialBranch && initialBranch !== currentBranch) {
      themeManager.applyBranchTheme(initialBranch);
    }

    // 監聽主題變更事件
    const cleanup = themeManager.onThemeChange((branch, theme) => {
      setCurrentBranch(branch);
      setCurrentTheme(theme);
    });

    // 監聽系統深色模式偏好
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleColorSchemeChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    setIsDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleColorSchemeChange);

    // 清理函數
    return () => {
      cleanup();
      mediaQuery.removeEventListener('change', handleColorSchemeChange);
    };
  }, [initialBranch, currentBranch]);

  // 應用主題函數
  const applyTheme = (branch: BranchType) => {
    themeManager.applyBranchTheme(branch);
  };

  // 獲取 Tailwind 類別
  const getTailwindClasses = () => {
    return themeManager.getTailwindClasses();
  };

  // 上下文值
  const contextValue: ThemeContextType = {
    currentBranch,
    currentTheme,
    applyTheme,
    getTailwindClasses,
    isDarkMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * 主題 Hook
 * 提供主題相關的狀態和方法
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

/**
 * 分支特定的主題 Hook
 * 提供當前分支的特定樣式和行為
 */
export const useBranchTheme = () => {
  const { currentBranch, currentTheme, getTailwindClasses } = useTheme();
  
  // 分支特定的配置
  const branchConfig = {
    main: {
      name: 'AI 學習頁面產生器',
      description: '跨領域通用學習內容生成器',
      icon: '🎓',
      features: ['多領域適應', '通用測驗', '教案管理'],
    },
    english: {
      name: 'AI 英語學習產生器',
      description: '專業英語教學與學習平台',
      icon: '🌍',
      features: ['四技能整合', '詞彙管理', '情境對話'],
    },
    math: {
      name: 'AI 數學學習產生器',
      description: '數學概念理解與解題能力培養平台',
      icon: '📐',
      features: ['公式渲染', '互動工具', '概念映射'],
    },
  };

  // 分支特定的樣式類別
  const branchStyles = {
    main: {
      gradient: 'bg-gradient-to-r from-sky-500 to-amber-500',
      cardBorder: 'border-sky-200 hover:border-sky-300',
      buttonHover: 'hover:bg-sky-600',
      accent: 'text-sky-600',
    },
    english: {
      gradient: 'bg-gradient-to-r from-blue-500 to-emerald-500',
      cardBorder: 'border-blue-200 hover:border-blue-300',
      buttonHover: 'hover:bg-blue-600',
      accent: 'text-blue-600',
      special: 'conversation-bubble', // 對話氣泡特效
    },
    math: {
      gradient: 'bg-gradient-to-r from-violet-500 to-cyan-500',
      cardBorder: 'border-violet-200 hover:border-violet-300',
      buttonHover: 'hover:bg-violet-600',
      accent: 'text-violet-600',
      special: 'formula-block', // 數學公式塊特效
    },
  };

  return {
    branch: currentBranch,
    theme: currentTheme,
    config: branchConfig[currentBranch],
    styles: branchStyles[currentBranch],
    tailwindClasses: getTailwindClasses(),
  };
};

/**
 * 主題切換器組件
 * 提供用戶主題切換界面
 */
export const ThemeSwitcher: React.FC<{
  className?: string;
  showLabels?: boolean;
}> = ({ className = '', showLabels = true }) => {
  const { currentBranch, applyTheme } = useTheme();

  const branches: { key: BranchType; label: string; color: string; icon: string }[] = [
    { key: 'main', label: '通用', color: 'bg-sky-500', icon: '🎓' },
    { key: 'english', label: '英語', color: 'bg-blue-500', icon: '🌍' },
    { key: 'math', label: '數學', color: 'bg-violet-500', icon: '📐' },
  ];

  const handleThemeChange = (branch: BranchType) => {
    applyTheme(branch);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showLabels && (
        <span className="text-sm text-[var(--color-text-muted)]">主題:</span>
      )}
      <div className="flex bg-[var(--color-surface)] rounded-lg p-1 shadow-sm border border-gray-200">
        {branches.map(({ key, label, color, icon }) => (
          <button
            key={key}
            onClick={() => handleThemeChange(key)}
            className={`
              flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium
              transition-all duration-200
              ${currentBranch === key 
                ? `${color} text-white shadow-sm` 
                : 'text-[var(--color-text-secondary)] hover:bg-gray-100'
              }
            `}
            title={`切換到${label}主題`}
          >
            <span>{icon}</span>
            {showLabels && <span>{label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * 分支標識組件
 * 顯示當前分支的品牌標識
 */
export const BranchBadge: React.FC<{
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ className = '', size = 'md' }) => {
  const { config, styles } = useBranchTheme();

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <div className={`
      inline-flex items-center space-x-1 rounded-full
      bg-[var(--color-primary)] text-white font-medium
      ${sizeClasses[size]} ${className}
    `}>
      <span>{config.icon}</span>
      <span>{config.name}</span>
    </div>
  );
};

/**
 * 主題狀態指示器
 * 用於調試和開發環境顯示主題狀態
 */
export const ThemeDebugger: React.FC<{
  show?: boolean;
}> = ({ show = process.env.NODE_ENV === 'development' }) => {
  const { currentBranch, currentTheme, isDarkMode } = useTheme();

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-[var(--z-tooltip)]">
      <div>分支: {currentBranch}</div>
      <div>主色: {currentTheme.primary}</div>
      <div>深色模式: {isDarkMode ? '是' : '否'}</div>
    </div>
  );
};

export default ThemeProvider;