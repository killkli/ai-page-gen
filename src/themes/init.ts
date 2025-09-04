/**
 * 主題系統初始化腳本
 * 在應用載入時立即執行，避免主題閃爍
 */

import { themeManager } from './index';

/**
 * 立即初始化主題系統
 * 這個函數應該在應用的最早期被調用
 */
export const initializeTheme = () => {
  try {
    // 移除加載中的隱藏類別
    document.documentElement.classList.remove('theme-loading');
    
    // 立即應用檢測到的分支主題
    const detectedBranch = detectBranchFromURL() || 'main';
    themeManager.applyBranchTheme(detectedBranch);
    
    // 更新 HTML title 和 meta
    updatePageMeta(detectedBranch);
    
    console.log(`✅ 主題系統已初始化: ${detectedBranch} 分支`);
  } catch (error) {
    console.error('❌ 主題系統初始化失敗:', error);
    // 降級到默認主題
    document.documentElement.className = 'theme-main';
  }
};

/**
 * 從 URL 檢測分支類型
 */
function detectBranchFromURL() {
  if (typeof window === 'undefined') return null;
  
  const path = window.location.pathname;
  const hostname = window.location.hostname;
  const search = window.location.search;
  
  // 檢查 URL 參數
  const params = new URLSearchParams(search);
  const branchParam = params.get('branch');
  if (branchParam && ['main', 'english', 'math'].includes(branchParam)) {
    return branchParam as 'main' | 'english' | 'math';
  }
  
  // 檢查主機名
  if (hostname.includes('english') || path.includes('english')) {
    return 'english';
  }
  if (hostname.includes('math') || path.includes('math')) {
    return 'math';
  }
  
  return 'main';
}

/**
 * 更新頁面 meta 資訊
 */
function updatePageMeta(branch: 'main' | 'english' | 'math') {
  const branchConfig = {
    main: {
      title: 'AI 學習頁面產生器 - 跨領域通用學習平台',
      description: '使用 AI 生成各領域教學內容，支援測驗、互動學習和教案管理',
      themeColor: '#0ea5e9',
    },
    english: {
      title: 'AI 英語學習產生器 - 專業英語教學平台',
      description: '專注英語四技能學習，提供詞彙管理、對話練習和發音評估',
      themeColor: '#3b82f6',
    },
    math: {
      title: 'AI 數學學習產生器 - 數學概念理解平台',
      description: '數學概念可視化學習，包含公式渲染、互動工具和解題分析',
      themeColor: '#8b5cf6',
    },
  };
  
  const config = branchConfig[branch];
  
  // 更新 title
  document.title = config.title;
  
  // 更新 meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', config.description);
  }
  
  // 更新 theme-color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', config.themeColor);
  }
}

/**
 * 主題系統健康檢查
 */
export const checkThemeHealth = () => {
  const issues: string[] = [];
  
  // 檢查 CSS 變量是否正確設定
  const root = document.documentElement;
  const primaryColor = getComputedStyle(root).getPropertyValue('--color-primary').trim();
  if (!primaryColor || primaryColor === '') {
    issues.push('主要顏色變量未設定');
  }
  
  // 檢查主題類別是否存在
  const hasThemeClass = root.className.match(/theme-(main|english|math)/);
  if (!hasThemeClass) {
    issues.push('主題類別未應用');
  }
  
  // 檢查字體是否載入
  if (!document.fonts) {
    issues.push('字體 API 不支援');
  } else {
    document.fonts.ready.then(() => {
      const interLoaded = document.fonts.check('16px Inter');
      if (!interLoaded) {
        console.warn('⚠️ Inter 字體可能未正確載入');
      }
    });
  }
  
  if (issues.length > 0) {
    console.warn('⚠️ 主題系統檢查發現問題:', issues);
    return false;
  }
  
  console.log('✅ 主題系統健康檢查通過');
  return true;
};

/**
 * 監聽系統偏好變化
 */
export const setupSystemPreferenceListeners = () => {
  if (typeof window === 'undefined') return;
  
  // 監聽深色模式偏好變化
  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  darkModeQuery.addEventListener('change', (e) => {
    console.log(`🌓 系統深色模式偏好變更: ${e.matches ? '深色' : '淺色'}`);
    // 將來可以用於自動切換深色/淺色主題
  });
  
  // 監聽高對比度偏好變化
  const contrastQuery = window.matchMedia('(prefers-contrast: high)');
  contrastQuery.addEventListener('change', (e) => {
    console.log(`🔍 系統對比度偏好變更: ${e.matches ? '高對比度' : '正常'}`);
    // 將來可以用於自動調整對比度
  });
  
  // 監聽減少動畫偏好變化
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  motionQuery.addEventListener('change', (e) => {
    console.log(`🎬 系統動畫偏好變更: ${e.matches ? '減少動畫' : '正常動畫'}`);
    if (e.matches) {
      document.documentElement.style.setProperty('--duration-fast', '0ms');
      document.documentElement.style.setProperty('--duration-normal', '0ms');
      document.documentElement.style.setProperty('--duration-slow', '0ms');
    } else {
      document.documentElement.style.removeProperty('--duration-fast');
      document.documentElement.style.removeProperty('--duration-normal');
      document.documentElement.style.removeProperty('--duration-slow');
    }
  });
};

/**
 * 開發模式主題調試工具
 */
export const enableThemeDebugging = () => {
  if (process.env.NODE_ENV !== 'development') return;
  
  // 添加全域調試函數
  (window as any).__themeDebug = {
    getCurrentTheme: () => themeManager.getCurrentTheme(),
    getCurrentBranch: () => themeManager.getCurrentBranch(),
    applyTheme: (branch: string) => themeManager.applyBranchTheme(branch as any),
    checkHealth: checkThemeHealth,
    showCSS: () => {
      const root = document.documentElement;
      const styles = getComputedStyle(root);
      const themeVars: Record<string, string> = {};
      
      // 收集所有 CSS 變量
      for (let i = 0; i < styles.length; i++) {
        const prop = styles[i];
        if (prop.startsWith('--color-')) {
          themeVars[prop] = styles.getPropertyValue(prop).trim();
        }
      }
      
      console.table(themeVars);
    }
  };
  
  console.log('🔧 主題調試模式已啟用，使用 __themeDebug 查看可用方法');
};

// 立即執行初始化（如果在瀏覽器環境中）
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // 添加載入中類別以防止閃爍
  document.documentElement.classList.add('theme-loading');
  
  // DOM 準備好後立即初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeTheme();
      setupSystemPreferenceListeners();
      enableThemeDebugging();
    });
  } else {
    // DOM 已經準備好了，立即初始化
    setTimeout(() => {
      initializeTheme();
      setupSystemPreferenceListeners();
      enableThemeDebugging();
    }, 0);
  }
}

export default {
  initializeTheme,
  checkThemeHealth,
  setupSystemPreferenceListeners,
  enableThemeDebugging,
};