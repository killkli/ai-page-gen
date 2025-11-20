import { render, screen, fireEvent } from '@testing-library/react';
import FillBlankQuizItem from '../../../components/quizTypes/FillBlankQuizItem';
import { describe, it, expect, vi } from 'vitest';
import { FillBlankQuestion } from '../../../types';

describe('FillBlankQuizItem', () => {
    const mockQuestion: FillBlankQuestion = {
        sentenceWithBlank: 'The capital of France is ____.',
        correctAnswer: 'Paris',
    };

    const mockOnAnswer = vi.fn();

    it('renders the question with input', () => {
        render(
            <FillBlankQuizItem
                question={mockQuestion}
                itemNumber={1}
                onAnswer={mockOnAnswer}
            />
        );
        expect(screen.getByText(/The capital of France is/)).toBeInTheDocument();
        expect(screen.getByPlaceholderText('答案')).toBeInTheDocument();
    });

    it('handles correct answer submission', () => {
        render(
            <FillBlankQuizItem
                question={mockQuestion}
                itemNumber={1}
                onAnswer={mockOnAnswer}
            />
        );

        const input = screen.getByPlaceholderText('答案');
        fireEvent.change(input, { target: { value: 'Paris' } });

        const checkButton = screen.getByText('檢查');
        fireEvent.click(checkButton);

        expect(screen.getByText('答對了！')).toBeInTheDocument();
        expect(mockOnAnswer).toHaveBeenCalledWith('Paris', true, expect.any(Number));
    });

    it('handles incorrect answer submission', () => {
        render(
            <FillBlankQuizItem
                question={mockQuestion}
                itemNumber={1}
                onAnswer={mockOnAnswer}
            />
        );

        const input = screen.getByPlaceholderText('答案');
        fireEvent.change(input, { target: { value: 'London' } });

        const checkButton = screen.getByText('檢查');
        fireEvent.click(checkButton);

        expect(screen.getByText(/答錯了/)).toBeInTheDocument();
        expect(mockOnAnswer).toHaveBeenCalledWith('London', false, expect.any(Number));
    });

    it('is case insensitive for correct answer', () => {
        render(
            <FillBlankQuizItem
                question={mockQuestion}
                itemNumber={1}
                onAnswer={mockOnAnswer}
            />
        );

        const input = screen.getByPlaceholderText('答案');
        fireEvent.change(input, { target: { value: 'paris' } }); // lowercase

        const checkButton = screen.getByText('檢查');
        fireEvent.click(checkButton);

        expect(screen.getByText('答對了！')).toBeInTheDocument();
        expect(mockOnAnswer).toHaveBeenCalledWith('paris', true, expect.any(Number));
    });
});
