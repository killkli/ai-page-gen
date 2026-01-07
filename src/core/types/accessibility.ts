export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  lineSpacing: 'normal' | 'relaxed' | 'loose';
  highContrast: boolean;
  simplifiedUI: boolean;
  extendedTime: boolean;
  timeMultiplier: number;
  reduceAnimations: boolean;
}

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  fontSize: 'medium',
  lineSpacing: 'normal',
  highContrast: false,
  simplifiedUI: false,
  extendedTime: false,
  timeMultiplier: 1.5,
  reduceAnimations: false,
};

export const FONT_SIZE_VALUES: Record<
  AccessibilitySettings['fontSize'],
  string
> = {
  small: '14px',
  medium: '16px',
  large: '18px',
  'extra-large': '22px',
};

export const LINE_SPACING_VALUES: Record<
  AccessibilitySettings['lineSpacing'],
  string
> = {
  normal: '1.5',
  relaxed: '1.75',
  loose: '2',
};

export const FONT_SIZE_LABELS: Record<
  AccessibilitySettings['fontSize'],
  string
> = {
  small: '小',
  medium: '中',
  large: '大',
  'extra-large': '特大',
};

export const LINE_SPACING_LABELS: Record<
  AccessibilitySettings['lineSpacing'],
  string
> = {
  normal: '正常',
  relaxed: '寬鬆',
  loose: '加寬',
};
