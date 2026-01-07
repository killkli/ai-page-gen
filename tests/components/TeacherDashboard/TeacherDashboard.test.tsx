import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TeacherDashboard from '../../../components/TeacherDashboard/TeacherDashboard';
import { classService } from '../../../services/class/classService';

vi.mock('../../../services/class/classService', () => ({
  classService: {
    getTeacherIdentity: vi.fn(),
    setTeacherIdentity: vi.fn(),
    getAllClasses: vi.fn(),
    createClass: vi.fn(),
    updateClass: vi.fn(),
    deleteClass: vi.fn(),
  },
}));

vi.mock('../../../components/LessonPlanManager', () => ({
  default: () => <div data-testid="lesson-plan-manager">LessonPlanManager</div>,
}));

vi.mock('../../../components/TeacherDashboard/ClassManager', () => ({
  default: () => <div data-testid="class-manager">ClassManager</div>,
}));

vi.mock('../../../components/TeacherDashboard/AnalyticsView', () => ({
  default: () => <div data-testid="analytics-view">AnalyticsView</div>,
}));

describe('TeacherDashboard', () => {
  const mockOnNavigateToGenerator = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Teacher Identity', () => {
    it('shows name modal when no teacher identity exists', () => {
      vi.mocked(classService.getTeacherIdentity).mockReturnValue(null);

      render(
        <TeacherDashboard onNavigateToGenerator={mockOnNavigateToGenerator} />
      );

      expect(screen.getByText('歡迎使用教師儀表板')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('教師名字')).toBeInTheDocument();
    });

    it('does not show name modal when teacher identity exists', () => {
      vi.mocked(classService.getTeacherIdentity).mockReturnValue({
        id: 'teacher-1',
        name: '王老師',
        createdAt: new Date().toISOString(),
      });

      render(
        <TeacherDashboard onNavigateToGenerator={mockOnNavigateToGenerator} />
      );

      expect(screen.queryByText('歡迎使用教師儀表板')).not.toBeInTheDocument();
      expect(screen.getByText('王老師 老師')).toBeInTheDocument();
    });

    it('sets teacher identity when name is submitted', async () => {
      vi.mocked(classService.getTeacherIdentity).mockReturnValue(null);
      vi.mocked(classService.setTeacherIdentity).mockReturnValue({
        id: 'teacher-1',
        name: '李老師',
        createdAt: new Date().toISOString(),
      });

      render(
        <TeacherDashboard onNavigateToGenerator={mockOnNavigateToGenerator} />
      );

      const input = screen.getByPlaceholderText('教師名字');
      fireEvent.change(input, { target: { value: '李老師' } });
      fireEvent.click(screen.getByText('開始使用'));

      await waitFor(() => {
        expect(classService.setTeacherIdentity).toHaveBeenCalledWith('李老師');
      });
    });

    it('sets teacher identity when Enter key is pressed', async () => {
      vi.mocked(classService.getTeacherIdentity).mockReturnValue(null);
      vi.mocked(classService.setTeacherIdentity).mockReturnValue({
        id: 'teacher-1',
        name: '陳老師',
        createdAt: new Date().toISOString(),
      });

      render(
        <TeacherDashboard onNavigateToGenerator={mockOnNavigateToGenerator} />
      );

      const input = screen.getByPlaceholderText('教師名字');
      fireEvent.change(input, { target: { value: '陳老師' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => {
        expect(classService.setTeacherIdentity).toHaveBeenCalledWith('陳老師');
      });
    });

    it('disables submit button when name is empty', () => {
      vi.mocked(classService.getTeacherIdentity).mockReturnValue(null);

      render(
        <TeacherDashboard onNavigateToGenerator={mockOnNavigateToGenerator} />
      );

      const submitButton = screen.getByText('開始使用');
      expect(submitButton).toBeDisabled();
    });

    it('trims whitespace from teacher name', async () => {
      vi.mocked(classService.getTeacherIdentity).mockReturnValue(null);
      vi.mocked(classService.setTeacherIdentity).mockReturnValue({
        id: 'teacher-1',
        name: '張老師',
        createdAt: new Date().toISOString(),
      });

      render(
        <TeacherDashboard onNavigateToGenerator={mockOnNavigateToGenerator} />
      );

      const input = screen.getByPlaceholderText('教師名字');
      fireEvent.change(input, { target: { value: '  張老師  ' } });
      fireEvent.click(screen.getByText('開始使用'));

      await waitFor(() => {
        expect(classService.setTeacherIdentity).toHaveBeenCalledWith('張老師');
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      vi.mocked(classService.getTeacherIdentity).mockReturnValue({
        id: 'teacher-1',
        name: '測試老師',
        createdAt: new Date().toISOString(),
      });
    });

    it('renders header with title and teacher name', () => {
      render(
        <TeacherDashboard onNavigateToGenerator={mockOnNavigateToGenerator} />
      );

      expect(screen.getByText('教師儀表板')).toBeInTheDocument();
      expect(screen.getByText('測試老師 老師')).toBeInTheDocument();
    });

    it('calls onNavigateToGenerator when create button is clicked', () => {
      render(
        <TeacherDashboard onNavigateToGenerator={mockOnNavigateToGenerator} />
      );

      fireEvent.click(screen.getByText('建立新教案'));
      expect(mockOnNavigateToGenerator).toHaveBeenCalled();
    });

    it('renders all tabs', () => {
      render(
        <TeacherDashboard onNavigateToGenerator={mockOnNavigateToGenerator} />
      );

      expect(screen.getByText('我的教案')).toBeInTheDocument();
      expect(screen.getByText('班級管理')).toBeInTheDocument();
      expect(screen.getByText('學習分析')).toBeInTheDocument();
    });

    it('shows LessonPlanManager by default', () => {
      render(
        <TeacherDashboard onNavigateToGenerator={mockOnNavigateToGenerator} />
      );

      expect(screen.getByTestId('lesson-plan-manager')).toBeInTheDocument();
    });

    it('switches to ClassManager tab when clicked', async () => {
      render(
        <TeacherDashboard onNavigateToGenerator={mockOnNavigateToGenerator} />
      );

      fireEvent.click(screen.getByText('班級管理'));

      await waitFor(() => {
        expect(screen.getByTestId('class-manager')).toBeInTheDocument();
      });
    });

    it('switches to AnalyticsView tab when clicked', async () => {
      render(
        <TeacherDashboard onNavigateToGenerator={mockOnNavigateToGenerator} />
      );

      fireEvent.click(screen.getByText('學習分析'));

      await waitFor(() => {
        expect(screen.getByTestId('analytics-view')).toBeInTheDocument();
      });
    });
  });
});
