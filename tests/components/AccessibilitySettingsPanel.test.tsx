import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AccessibilitySettingsPanel from '../../components/AccessibilitySettingsPanel';
import * as accessibilityService from '../../services/accessibilityService';
import type { AccessibilitySettings } from '../../src/core/types/accessibility';

const defaultMockSettings: AccessibilitySettings = {
  fontSize: 'medium',
  lineSpacing: 'normal',
  highContrast: false,
  simplifiedUI: false,
  reduceAnimations: false,
  extendedTime: false,
  timeMultiplier: 1.5,
};

vi.mock('../../services/accessibilityService', () => ({
  getAccessibilitySettings: vi.fn(() => ({ ...defaultMockSettings })),
  saveAccessibilitySettings: vi.fn(),
}));

describe('AccessibilitySettingsPanel', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(accessibilityService.getAccessibilitySettings).mockReturnValue({
      ...defaultMockSettings,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the settings panel with title', () => {
    render(<AccessibilitySettingsPanel onClose={mockOnClose} />);
    expect(screen.getByText('無障礙設定')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<AccessibilitySettingsPanel onClose={mockOnClose} />);
    fireEvent.click(screen.getByLabelText('關閉'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when finish button is clicked', () => {
    render(<AccessibilitySettingsPanel onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('完成設定'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  describe('Font Size Settings', () => {
    it('renders all font size options', () => {
      render(<AccessibilitySettingsPanel onClose={mockOnClose} />);
      expect(screen.getByText('小')).toBeInTheDocument();
      expect(screen.getByText('中')).toBeInTheDocument();
      expect(screen.getByText('大')).toBeInTheDocument();
      expect(screen.getByText('特大')).toBeInTheDocument();
    });

    it('highlights the current font size selection', () => {
      render(<AccessibilitySettingsPanel onClose={mockOnClose} />);
      const mediumButton = screen.getByText('中');
      expect(mediumButton).toHaveClass('bg-indigo-600');
    });

    it('saves settings when font size is changed', () => {
      render(<AccessibilitySettingsPanel onClose={mockOnClose} />);
      fireEvent.click(screen.getByText('大'));
      expect(accessibilityService.saveAccessibilitySettings).toHaveBeenCalled();
    });
  });

  describe('Line Spacing Settings', () => {
    it('renders all line spacing options', () => {
      render(<AccessibilitySettingsPanel onClose={mockOnClose} />);
      expect(screen.getByText('正常')).toBeInTheDocument();
      expect(screen.getByText('寬鬆')).toBeInTheDocument();
      expect(screen.getByText('加寬')).toBeInTheDocument();
    });

    it('highlights the current line spacing selection', () => {
      render(<AccessibilitySettingsPanel onClose={mockOnClose} />);
      const normalButton = screen.getByText('正常');
      expect(normalButton).toHaveClass('bg-indigo-600');
    });
  });

  describe('Toggle Settings', () => {
    it('renders high contrast toggle', () => {
      render(<AccessibilitySettingsPanel onClose={mockOnClose} />);
      expect(screen.getByText('高對比模式')).toBeInTheDocument();
      expect(
        screen.getByText('增加文字與背景的對比度，提高可讀性')
      ).toBeInTheDocument();
    });

    it('renders simplified UI toggle', () => {
      render(<AccessibilitySettingsPanel onClose={mockOnClose} />);
      expect(screen.getByText('簡化介面')).toBeInTheDocument();
      expect(
        screen.getByText('減少視覺元素，聚焦核心內容')
      ).toBeInTheDocument();
    });

    it('renders reduce animations toggle', () => {
      render(<AccessibilitySettingsPanel onClose={mockOnClose} />);
      expect(screen.getByText('減少動畫')).toBeInTheDocument();
      expect(screen.getByText('減少過渡動畫效果')).toBeInTheDocument();
    });

    it('renders extended time toggle', () => {
      render(<AccessibilitySettingsPanel onClose={mockOnClose} />);
      expect(screen.getByText('延長作答時間')).toBeInTheDocument();
      expect(
        screen.getByText('測驗計時將延長為原本的 1.5 倍')
      ).toBeInTheDocument();
    });

    it('toggles high contrast when clicked', () => {
      render(<AccessibilitySettingsPanel onClose={mockOnClose} />);
      const toggles = screen.getAllByRole('switch');
      fireEvent.click(toggles[0]);
      expect(accessibilityService.saveAccessibilitySettings).toHaveBeenCalled();
    });
  });

  describe('Extended Time Settings', () => {
    it('shows time multiplier slider when extended time is enabled', () => {
      vi.mocked(accessibilityService.getAccessibilitySettings).mockReturnValue({
        ...defaultMockSettings,
        extendedTime: true,
        timeMultiplier: 1.5,
      });

      render(<AccessibilitySettingsPanel onClose={mockOnClose} />);
      expect(screen.getByText('時間倍數: 1.5x')).toBeInTheDocument();
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('does not show time multiplier slider when extended time is disabled', () => {
      vi.mocked(accessibilityService.getAccessibilitySettings).mockReturnValue({
        ...defaultMockSettings,
        extendedTime: false,
      });

      render(<AccessibilitySettingsPanel onClose={mockOnClose} />);
      expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper switch roles for toggles', () => {
      render(<AccessibilitySettingsPanel onClose={mockOnClose} />);
      const switches = screen.getAllByRole('switch');
      expect(switches.length).toBe(4);
    });

    it('toggles have aria-checked attribute', () => {
      render(<AccessibilitySettingsPanel onClose={mockOnClose} />);
      const switches = screen.getAllByRole('switch');
      switches.forEach(switchEl => {
        expect(switchEl).toHaveAttribute('aria-checked');
      });
    });
  });
});
