/**
 * 主題管理系統
 * 支援三分支的動態主題切換
 */

import { BranchType } from '../core/types';

// 主題定義介面
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  auxiliary?: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

// 分支主題配置
export const branchThemes: Record<BranchType, ThemeColors> = {
  main: {
    primary: '#0ea5e9', // Sky 500
    secondary: '#64748b', // Slate 500
    accent: '#f59e0b', // Amber 500
    background: '#f8fafc', // Slate 50
    surface: '#ffffff',
    text: {
      primary: '#0f172a', // Slate 900
      secondary: '#334155', // Slate 700
      muted: '#64748b' // Slate 500
    },
    status: {
      success: '#22c55e', // Green 500
      warning: '#f59e0b', // Amber 500
      error: '#ef4444', // Red 500
      info: '#3b82f6' // Blue 500
    }
  },
  english: {
    primary: '#3b82f6', // Blue 500
    secondary: '#1e40af', // Blue 700
    accent: '#10b981', // Emerald 500
    auxiliary: '#f97316', // Orange 500
    background: '#f0f9ff', // Sky 50
    surface: '#ffffff',
    text: {
      primary: '#1e293b', // Slate 800
      secondary: '#3730a3', // Indigo 700
      muted: '#6b7280' // Gray 500
    },
    status: {
      success: '#10b981', // Emerald 500
      warning: '#f59e0b', // Amber 500
      error: '#ef4444', // Red 500
      info: '#3b82f6' // Blue 500
    }
  },
  math: {
    primary: '#8b5cf6', // Violet 500
    secondary: '#6366f1', // Indigo 500
    accent: '#06b6d4', // Cyan 500
    auxiliary: '#f43f5e', // Rose 500
    background: '#faf5ff', // Purple 50
    surface: '#ffffff',
    text: {
      primary: '#312e81', // Indigo 900
      secondary: '#6d28d9', // Violet 700
      muted: '#6b7280' // Gray 500
    },
    status: {
      success: '#22c55e', // Green 500
      warning: '#f59e0b', // Amber 500
      error: '#f43f5e', // Rose 500
      info: '#8b5cf6' // Violet 500
    }
  }
};

// 主題管理器類別
export class ThemeManager {
  private static instance: ThemeManager;
  private currentBranch: BranchType = 'main';
  private isInitialized = false;

  private constructor() {
    this.initializeTheme();
  }

  public static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  /**
   * 初始化主題系統
   */
  private initializeTheme() {
    if (this.isInitialized) return;

    // 從環境變數或 URL 檢測分支類型
    this.currentBranch = this.detectBranchFromEnvironment();
    
    // 應用檢測到的分支主題
    this.applyBranchTheme(this.currentBranch);
    
    this.isInitialized = true;
  }

  /**
   * 從環境檢測分支類型
   */
  private detectBranchFromEnvironment(): BranchType {
    // 1. 檢查環境變數
    const envBranch = import.meta.env.VITE_BRANCH_TYPE as BranchType;
    if (envBranch && this.isValidBranch(envBranch)) {
      return envBranch;
    }

    // 2. 檢查 URL 路徑
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hostname = window.location.hostname;

      if (hostname.includes('english') || path.includes('english')) {
        return 'english';
      }
      if (hostname.includes('math') || path.includes('math')) {
        return 'math';
      }
    }

    // 3. 檢查本地存儲
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('selected-branch') as BranchType;
      if (stored && this.isValidBranch(stored)) {
        return stored;
      }
    }

    return 'main';
  }

  /**
   * 驗證分支類型
   */
  private isValidBranch(branch: string): branch is BranchType {
    return ['main', 'english', 'math'].includes(branch);
  }

  /**
   * 應用分支主題
   */
  public applyBranchTheme(branch: BranchType) {
    if (!this.isValidBranch(branch)) {
      console.warn(`Invalid branch type: ${branch}, falling back to main`);
      branch = 'main';
    }

    const theme = branchThemes[branch];
    const root = document.documentElement;

    // 應用主題 CSS 變數
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-accent', theme.accent);
    
    if (theme.auxiliary) {
      root.style.setProperty('--color-auxiliary', theme.auxiliary);
    }

    root.style.setProperty('--color-background', theme.background);
    root.style.setProperty('--color-surface', theme.surface);

    // 文字顏色
    root.style.setProperty('--color-text-primary', theme.text.primary);
    root.style.setProperty('--color-text-secondary', theme.text.secondary);
    root.style.setProperty('--color-text-muted', theme.text.muted);

    // 狀態顏色
    root.style.setProperty('--color-success', theme.status.success);
    root.style.setProperty('--color-warning', theme.status.warning);
    root.style.setProperty('--color-error', theme.status.error);
    root.style.setProperty('--color-info', theme.status.info);

    // 設定主題類別
    root.className = `theme-${branch}`;
    
    // 儲存當前分支
    this.currentBranch = branch;
    
    // 持久化到本地存儲
    if (typeof window !== 'undefined') {
      localStorage.setItem('selected-branch', branch);
    }

    // 觸發主題變更事件
    this.dispatchThemeChangeEvent(branch, theme);
  }

  /**
   * 取得當前分支
   */
  public getCurrentBranch(): BranchType {
    return this.currentBranch;
  }

  /**
   * 取得當前主題
   */
  public getCurrentTheme(): ThemeColors {
    return branchThemes[this.currentBranch];
  }

  /**
   * 取得指定分支的主題
   */
  public getTheme(branch: BranchType): ThemeColors {
    return branchThemes[branch];
  }

  /**
   * 檢查是否為暗色主題（為未來擴展準備）
   */
  public isDarkTheme(): boolean {
    // 目前所有分支都是淺色主題
    // 未來可以根據主題配置或用戶偏好返回
    return false;
  }

  /**
   * 分派主題變更事件
   */
  private dispatchThemeChangeEvent(branch: BranchType, theme: ThemeColors) {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('themeChanged', {
        detail: { branch, theme }
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * 監聽主題變更事件
   */
  public onThemeChange(callback: (branch: BranchType, theme: ThemeColors) => void): () => void {
    if (typeof window === 'undefined') {
      return () => {};
    }

    const handler = (event: CustomEvent) => {
      callback(event.detail.branch, event.detail.theme);
    };

    window.addEventListener('themeChanged', handler);
    
    // 返回移除監聽器的函數
    return () => {
      window.removeEventListener('themeChanged', handler);
    };
  }

  /**
   * 生成主題相關的 Tailwind 類別
   */
  public getTailwindClasses(): Record<string, string> {
    const branch = this.currentBranch;
    
    const baseClasses = {
      primary: `bg-[var(--color-primary)] text-white`,
      secondary: `bg-[var(--color-secondary)] text-white`,
      accent: `bg-[var(--color-accent)] text-white`,
      surface: `bg-[var(--color-surface)] text-[var(--color-text-primary)]`,
      background: `bg-[var(--color-background)]`,
    };

    // 分支特定的額外類別
    const branchSpecificClasses: Record<BranchType, Record<string, string>> = {
      main: {
        card: 'border-sky-200 hover:border-sky-300',
        button: 'hover:bg-sky-600 focus:ring-sky-500',
        input: 'border-slate-300 focus:border-sky-500',
      },
      english: {
        card: 'border-blue-200 hover:border-blue-300',
        button: 'hover:bg-blue-600 focus:ring-blue-500',
        input: 'border-blue-300 focus:border-blue-500',
        special: 'bg-gradient-to-r from-blue-500 to-emerald-500',
      },
      math: {
        card: 'border-violet-200 hover:border-violet-300',
        button: 'hover:bg-violet-600 focus:ring-violet-500',
        input: 'border-violet-300 focus:border-violet-500',
        special: 'bg-gradient-to-r from-violet-500 to-cyan-500',
      }
    };

    return {
      ...baseClasses,
      ...branchSpecificClasses[branch]
    };
  }

  /**
   * 重設主題（用於測試和調試）
   */
  public reset() {
    this.isInitialized = false;
    this.currentBranch = 'main';
    this.initializeTheme();
  }
}

// 匯出單例實例
export const themeManager = ThemeManager.getInstance();

// 便利函數
export const getCurrentBranch = () => themeManager.getCurrentBranch();
export const getCurrentTheme = () => themeManager.getCurrentTheme();
export const applyBranchTheme = (branch: BranchType) => themeManager.applyBranchTheme(branch);

// 注意：useTheme Hook 已移至 ThemeProvider.tsx 中

export default ThemeManager;