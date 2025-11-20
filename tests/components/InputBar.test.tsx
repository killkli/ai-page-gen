import { render, screen, fireEvent } from '@testing-library/react';
import InputBar from '../../components/InputBar';
import { describe, it, expect, vi } from 'vitest';

describe('InputBar', () => {
    const mockSetTopic = vi.fn();
    const mockOnGenerate = vi.fn();
    const mockOnGenerateWithLevels = vi.fn();

    const defaultProps = {
        topic: '',
        setTopic: mockSetTopic,
        onGenerate: mockOnGenerate,
        onGenerateWithLevels: mockOnGenerateWithLevels,
        isLoading: false,
    };

    it('renders input field and buttons', () => {
        render(<InputBar {...defaultProps} />);
        expect(screen.getByLabelText('學習主題輸入欄位')).toBeInTheDocument();
        expect(screen.getByText('⚡ 直接產生內容')).toBeInTheDocument();
        expect(screen.getByText('🎯 選擇程度後產生')).toBeInTheDocument();
    });

    it('updates topic on input change', () => {
        render(<InputBar {...defaultProps} />);
        const input = screen.getByLabelText('學習主題輸入欄位');
        fireEvent.change(input, { target: { value: 'New Topic' } });
        expect(mockSetTopic).toHaveBeenCalledWith('New Topic');
    });

    it('calls onGenerate when form is submitted', () => {
        render(<InputBar {...defaultProps} topic="Test Topic" />);
        const button = screen.getByText('⚡ 直接產生內容');
        fireEvent.click(button);
        expect(mockOnGenerate).toHaveBeenCalled();
    });

    it('calls onGenerateWithLevels when level button is clicked', () => {
        render(<InputBar {...defaultProps} topic="Test Topic" />);
        const button = screen.getByText('🎯 選擇程度後產生');
        fireEvent.click(button);
        expect(mockOnGenerateWithLevels).toHaveBeenCalled();
    });

    it('disables input and buttons when loading', () => {
        render(<InputBar {...defaultProps} isLoading={true} />);
        expect(screen.getByLabelText('學習主題輸入欄位')).toBeDisabled();
        const loadingButtons = screen.getAllByText('產生中...');
        loadingButtons.forEach(button => {
            expect(button.closest('button')).toBeDisabled();
        });
    });
});
