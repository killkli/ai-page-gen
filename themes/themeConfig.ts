export interface ThemeColor {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  border: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColor;
  gradient: string;
  isDark: boolean;
}

export const themes: Theme[] = [
  {
    id: 'default',
    name: '經典預設',
    description: '清晰明亮的經典配色',
    colors: {
      primary: '#4f46e5',
      secondary: '#0284c7',
      accent: '#f59e0b',
      background: '#f8fafc',
      surface: '#ffffff',
      text: {
        primary: '#0f172a',
        secondary: '#334155',
        muted: '#64748b',
        inverse: '#ffffff',
      },
      border: '#e2e8f0',
    },
    gradient: 'from-slate-100 via-sky-50 to-indigo-100',
    isDark: false,
  },
  {
    id: 'ocean',
    name: '深海藍調',
    description: '沉穩寧靜的海洋氣息',
    colors: {
      primary: '#0891b2',
      secondary: '#14b8a6',
      accent: '#facc15',
      background: '#ecfeff',
      surface: '#ffffff',
      text: {
        primary: '#164e63',
        secondary: '#155e75',
        muted: '#0e7490',
        inverse: '#ffffff',
      },
      border: '#cffafe',
    },
    gradient: 'from-cyan-50 via-teal-50 to-blue-50',
    isDark: false,
  },
  {
    id: 'forest',
    name: '森林綠意',
    description: '自然清新的大地色系',
    colors: {
      primary: '#059669',
      secondary: '#84cc16',
      accent: '#d97706',
      background: '#f0fdf4',
      surface: '#ffffff',
      text: {
        primary: '#064e3b',
        secondary: '#14532d',
        muted: '#166534',
        inverse: '#ffffff',
      },
      border: '#dcfce7',
    },
    gradient: 'from-emerald-50 via-green-50 to-lime-50',
    isDark: false,
  },
  {
    id: 'sunset',
    name: '夕陽暖光',
    description: '溫暖活力的橙紫漸層',
    colors: {
      primary: '#f97316',
      secondary: '#f43f5e',
      accent: '#8b5cf6',
      background: '#fff7ed',
      surface: '#ffffff',
      text: {
        primary: '#7c2d12',
        secondary: '#9a3412',
        muted: '#c2410c',
        inverse: '#ffffff',
      },
      border: '#ffedd5',
    },
    gradient: 'from-orange-50 via-rose-50 to-amber-50',
    isDark: false,
  },
  {
    id: 'midnight',
    name: '午夜星空',
    description: '深邃神秘的暗色模式',
    colors: {
      primary: '#8b5cf6',
      secondary: '#a855f7',
      accent: '#38bdf8',
      background: '#0f172a',
      surface: '#1e293b',
      text: {
        primary: '#f8fafc',
        secondary: '#cbd5e1',
        muted: '#94a3b8',
        inverse: '#0f172a',
      },
      border: '#334155',
    },
    gradient: 'from-slate-900 via-slate-800 to-indigo-950',
    isDark: true,
  },
  {
    id: 'sakura',
    name: '櫻花粉嫩',
    description: '柔和浪漫的粉白色調',
    colors: {
      primary: '#ec4899',
      secondary: '#fb7185',
      accent: '#f472b6',
      background: '#fdf2f8',
      surface: '#ffffff',
      text: {
        primary: '#831843',
        secondary: '#9d174d',
        muted: '#be185d',
        inverse: '#ffffff',
      },
      border: '#fce7f3',
    },
    gradient: 'from-pink-50 via-rose-50 to-red-50',
    isDark: false,
  },
];

export const defaultThemeId = 'default';
