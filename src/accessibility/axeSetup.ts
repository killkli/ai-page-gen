import React from 'react';

export const initAxeAccessibilityReporter = async (): Promise<void> => {
  if (import.meta.env.DEV) {
    try {
      const axe = await import('@axe-core/react');
      const ReactDOM = await import('react-dom');

      axe.default(React, ReactDOM, 1000, {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'label', enabled: true },
          { id: 'button-name', enabled: true },
          { id: 'image-alt', enabled: true },
          { id: 'link-name', enabled: true },
          { id: 'valid-lang', enabled: true },
        ],
      });

      console.log('[Accessibility] axe-core initialized in development mode');
    } catch (error) {
      console.warn('[Accessibility] Failed to initialize axe-core:', error);
    }
  }
};
