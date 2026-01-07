import {
  AccessibilitySettings,
  DEFAULT_ACCESSIBILITY_SETTINGS,
  FONT_SIZE_VALUES,
  LINE_SPACING_VALUES,
} from '../src/core/types/accessibility';

const STORAGE_KEY = 'accessibility_settings';

export const getAccessibilitySettings = (): AccessibilitySettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_ACCESSIBILITY_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    console.warn('Failed to load accessibility settings');
  }
  return DEFAULT_ACCESSIBILITY_SETTINGS;
};

export const saveAccessibilitySettings = (
  settings: AccessibilitySettings
): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    applyAccessibilitySettings(settings);
  } catch {
    console.warn('Failed to save accessibility settings');
  }
};

export const applyAccessibilitySettings = (
  settings: AccessibilitySettings
): void => {
  const root = document.documentElement;

  root.style.setProperty(
    '--app-font-size',
    FONT_SIZE_VALUES[settings.fontSize]
  );
  root.style.setProperty(
    '--app-line-height',
    LINE_SPACING_VALUES[settings.lineSpacing]
  );

  if (settings.highContrast) {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }

  if (settings.simplifiedUI) {
    root.classList.add('simplified-ui');
  } else {
    root.classList.remove('simplified-ui');
  }

  if (settings.reduceAnimations) {
    root.classList.add('reduce-motion');
  } else {
    root.classList.remove('reduce-motion');
  }
};

export const initAccessibilitySettings = (): AccessibilitySettings => {
  const settings = getAccessibilitySettings();
  applyAccessibilitySettings(settings);
  return settings;
};
