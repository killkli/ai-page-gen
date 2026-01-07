import React, { useState, useEffect, useCallback } from 'react';
import {
  AccessibilitySettings,
  FONT_SIZE_LABELS,
  LINE_SPACING_LABELS,
} from '../src/core/types/accessibility';
import {
  getAccessibilitySettings,
  saveAccessibilitySettings,
} from '../services/accessibilityService';

interface AccessibilitySettingsPanelProps {
  onClose: () => void;
}

const AccessibilitySettingsPanel: React.FC<AccessibilitySettingsPanelProps> = ({
  onClose,
}) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(
    getAccessibilitySettings
  );

  useEffect(() => {
    saveAccessibilitySettings(settings);
  }, [settings]);

  const updateSetting = useCallback(
    <K extends keyof AccessibilitySettings>(
      key: K,
      value: AccessibilitySettings[K]
    ) => {
      setSettings(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">無障礙設定</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            aria-label="關閉"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              字體大小
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(
                Object.keys(
                  FONT_SIZE_LABELS
                ) as AccessibilitySettings['fontSize'][]
              ).map(size => (
                <button
                  key={size}
                  onClick={() => updateSetting('fontSize', size)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    settings.fontSize === size
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {FONT_SIZE_LABELS[size]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              行距
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                Object.keys(
                  LINE_SPACING_LABELS
                ) as AccessibilitySettings['lineSpacing'][]
              ).map(spacing => (
                <button
                  key={spacing}
                  onClick={() => updateSetting('lineSpacing', spacing)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    settings.lineSpacing === spacing
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {LINE_SPACING_LABELS[spacing]}
                </button>
              ))}
            </div>
          </div>

          <ToggleSetting
            label="高對比模式"
            description="增加文字與背景的對比度，提高可讀性"
            checked={settings.highContrast}
            onChange={v => updateSetting('highContrast', v)}
          />

          <ToggleSetting
            label="簡化介面"
            description="減少視覺元素，聚焦核心內容"
            checked={settings.simplifiedUI}
            onChange={v => updateSetting('simplifiedUI', v)}
          />

          <ToggleSetting
            label="減少動畫"
            description="減少過渡動畫效果"
            checked={settings.reduceAnimations}
            onChange={v => updateSetting('reduceAnimations', v)}
          />

          <ToggleSetting
            label="延長作答時間"
            description="測驗計時將延長為原本的 1.5 倍"
            checked={settings.extendedTime}
            onChange={v => updateSetting('extendedTime', v)}
          />

          {settings.extendedTime && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                時間倍數: {settings.timeMultiplier}x
              </label>
              <input
                type="range"
                min={1.25}
                max={3}
                step={0.25}
                value={settings.timeMultiplier}
                onChange={e =>
                  updateSetting('timeMultiplier', parseFloat(e.target.value))
                }
                className="w-full"
              />
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            完成設定
          </button>
        </div>
      </div>
    </div>
  );
};

interface ToggleSettingProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

const ToggleSetting: React.FC<ToggleSettingProps> = ({
  label,
  description,
  checked,
  onChange,
}) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <div className="text-sm font-medium text-slate-700">{label}</div>
      <div className="text-xs text-slate-500">{description}</div>
    </div>
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? 'bg-indigo-600' : 'bg-slate-300'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

export default AccessibilitySettingsPanel;
