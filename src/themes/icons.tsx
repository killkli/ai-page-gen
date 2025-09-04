/**
 * 分支特定圖標系統
 * 提供三分支專用的 SVG 圖標組件
 */

import React from 'react';

// 圖標基礎屬性介面
interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

// 通用圖標屬性
const defaultIconProps: Required<Pick<IconProps, 'size'>> & Partial<IconProps> = {
  size: 24,
  className: '',
  color: 'currentColor',
};

/* ======================
   Main Branch 圖標
   ====================== */

/**
 * 通用學習圖標
 */
export const MainLearningIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = '', 
  color = 'currentColor' 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L2 7L12 12L22 7L12 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 17L12 22L22 17"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 12L12 17L22 12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 通用知識圖標
 */
export const KnowledgeIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = '', 
  color = 'currentColor' 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.5 2H20V22H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="8" r="2" fill={color} />
    <path d="M15 13A3 3 0 1 0 9 13" stroke={color} strokeWidth="2" />
  </svg>
);

/* ======================
   English Branch 圖標
   ====================== */

/**
 * 語言學習圖標
 */
export const LanguageLearningIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = '', 
  color = 'currentColor' 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <path
      d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
      stroke={color}
      strokeWidth="2"
    />
    <path
      d="M8 12c0-2 2-4 4-4s4 2 4 4-2 4-4 4-4-2-4-4z"
      fill={color}
      opacity="0.3"
    />
  </svg>
);

/**
 * 對話氣泡圖標
 */
export const ConversationIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = '', 
  color = 'currentColor' 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 15A2 2 0 0 1 19 17H7L4 20V5A2 2 0 0 1 6 3H19A2 2 0 0 1 21 5V15Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="9" cy="9" r="1" fill={color} />
    <circle cx="12" cy="9" r="1" fill={color} />
    <circle cx="15" cy="9" r="1" fill={color} />
  </svg>
);

/**
 * 語音練習圖標
 */
export const SpeechIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = '', 
  color = 'currentColor' 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 10v2a7 7 0 0 1-14 0v-2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line x1="12" y1="19" x2="12" y2="23" stroke={color} strokeWidth="2" />
    <line x1="8" y1="23" x2="16" y2="23" stroke={color} strokeWidth="2" />
  </svg>
);

/**
 * 詞彙庫圖標
 */
export const VocabularyIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = '', 
  color = 'currentColor' 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="4" width="18" height="16" rx="2" stroke={color} strokeWidth="2" />
    <path d="M7 8h10M7 12h8M7 16h6" stroke={color} strokeWidth="2" />
    <rect x="17" y="2" width="4" height="4" rx="1" fill={color} opacity="0.3" />
  </svg>
);

/* ======================
   Math Branch 圖標
   ====================== */

/**
 * 數學學習圖標
 */
export const MathLearningIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = '', 
  color = 'currentColor' 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="2"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M8 8l8 8M8 16l8-8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="8" cy="8" r="1" fill={color} />
    <circle cx="16" cy="16" r="1" fill={color} />
    <circle cx="16" cy="8" r="1" fill={color} />
    <circle cx="8" cy="16" r="1" fill={color} />
  </svg>
);

/**
 * 幾何圖形圖標
 */
export const GeometryIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = '', 
  color = 'currentColor' 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <polygon
      points="12,2 22,20 2,20"
      stroke={color}
      strokeWidth="2"
      fill={color}
      fillOpacity="0.2"
    />
    <circle
      cx="12"
      cy="14"
      r="3"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
    <rect
      x="6"
      y="10"
      width="4"
      height="4"
      stroke={color}
      strokeWidth="2"
      fill={color}
      fillOpacity="0.3"
    />
  </svg>
);

/**
 * 計算器圖標
 */
export const CalculatorIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = '', 
  color = 'currentColor' 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="4" y="2" width="16" height="20" rx="2" stroke={color} strokeWidth="2" />
    <rect x="6" y="4" width="12" height="4" rx="1" fill={color} opacity="0.3" />
    <circle cx="8" cy="12" r="1" fill={color} />
    <circle cx="12" cy="12" r="1" fill={color} />
    <circle cx="16" cy="12" r="1" fill={color} />
    <circle cx="8" cy="16" r="1" fill={color} />
    <circle cx="12" cy="16" r="1" fill={color} />
    <circle cx="16" cy="16" r="1" fill={color} />
  </svg>
);

/**
 * 公式圖標
 */
export const FormulaIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = '', 
  color = 'currentColor' 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 6h16M4 10h16M4 14h12M4 18h8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M16 14l4 4M20 14l-4 4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="6" cy="6" r="1" fill={color} />
    <text x="10" y="11" fontSize="8" fill={color} fontFamily="serif">π</text>
  </svg>
);

/* ======================
   複合 Logo 組件
   ====================== */

/**
 * Main Branch Logo
 */
export const MainLogo: React.FC<IconProps> = ({ 
  size = 32, 
  className = '' 
}) => (
  <div className={`flex items-center space-x-2 ${className}`}>
    <MainLearningIcon size={size} color="var(--color-primary)" />
    <span className="font-bold text-xl text-[var(--color-text-primary)]">
      AI 學習產生器
    </span>
  </div>
);

/**
 * English Branch Logo
 */
export const EnglishLogo: React.FC<IconProps> = ({ 
  size = 32, 
  className = '' 
}) => (
  <div className={`flex items-center space-x-2 ${className}`}>
    <LanguageLearningIcon size={size} color="var(--color-primary)" />
    <span className="font-bold text-xl text-[var(--color-text-primary)]">
      AI 英語學習
    </span>
  </div>
);

/**
 * Math Branch Logo
 */
export const MathLogo: React.FC<IconProps> = ({ 
  size = 32, 
  className = '' 
}) => (
  <div className={`flex items-center space-x-2 ${className}`}>
    <MathLearningIcon size={size} color="var(--color-primary)" />
    <span className="font-bold text-xl text-[var(--color-text-primary)]">
      AI 數學學習
    </span>
  </div>
);

/**
 * 動態分支 Logo
 * 根據當前分支顯示對應的 Logo
 */
export const BranchLogo: React.FC<IconProps & {
  branch?: 'main' | 'english' | 'math';
}> = ({ branch, ...props }) => {
  // 如果沒有指定分支，嘗試從主題管理器獲取
  let currentBranch = branch;
  if (!currentBranch && typeof window !== 'undefined') {
    currentBranch = document.documentElement.className.replace('theme-', '') as any;
  }
  currentBranch = currentBranch || 'main';

  const LogoComponents = {
    main: MainLogo,
    english: EnglishLogo,
    math: MathLogo,
  };

  const LogoComponent = LogoComponents[currentBranch];
  return <LogoComponent {...props} />;
};

/* ======================
   圖標集合
   ====================== */

// 導出所有圖標的映射物件，方便動態使用
export const BranchIcons = {
  main: {
    primary: MainLearningIcon,
    knowledge: KnowledgeIcon,
    logo: MainLogo,
  },
  english: {
    primary: LanguageLearningIcon,
    conversation: ConversationIcon,
    speech: SpeechIcon,
    vocabulary: VocabularyIcon,
    logo: EnglishLogo,
  },
  math: {
    primary: MathLearningIcon,
    geometry: GeometryIcon,
    calculator: CalculatorIcon,
    formula: FormulaIcon,
    logo: MathLogo,
  },
};

// 通用圖標 - 跨分支使用
export const CommonIcons = {
  check: (props: IconProps) => (
    <svg {...defaultIconProps} {...props} viewBox="0 0 24 24" fill="none">
      <path
        d="m9 12 2 2 4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  close: (props: IconProps) => (
    <svg {...defaultIconProps} {...props} viewBox="0 0 24 24" fill="none">
      <path
        d="m18 6-12 12M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  menu: (props: IconProps) => (
    <svg {...defaultIconProps} {...props} viewBox="0 0 24 24" fill="none">
      <line x1="4" x2="20" y1="6" y2="6" stroke="currentColor" strokeWidth="2" />
      <line x1="4" x2="20" y1="12" y2="12" stroke="currentColor" strokeWidth="2" />
      <line x1="4" x2="20" y1="18" y2="18" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  settings: (props: IconProps) => (
    <svg {...defaultIconProps} {...props} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="m12 1 1.27 4.88L18 4.52l-1.27 4.88L22 8.14l-4.88 1.27L18.48 14l-4.88-1.27L14.86 18l-1.27-4.88L9 14.48l1.27-4.88L5 10.86l4.88-1.27L8.52 5l4.88 1.27z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  ),
};

export default BranchIcons;