import { render, screen, fireEvent } from '@testing-library/react';
import TrueFalseQuizItem from '../../../components/quizTypes/TrueFalseQuizItem';
import { describe, it, expect, vi } from 'vitest';
import { TrueFalseQuestion } from '../../../types';

describe('TrueFalseQuizItem', () => {
    const mockQuestion: TrueFalseQuestion = {
        statement: 'The sky is blue.',
        isTrue: true,
        explanation: 'Rayleigh scattering causes the sky to look blue.',
    };

    const mockOnAnswer = vi.fn();

    it('renders the question statement', () => {
        render(
            <TrueFalseQuizItem
                question={mockQuestion}
                itemNumber={1}
                onAnswer={mockOnAnswer}
            />
        );
        expect(screen.getByText('1. The sky is blue.')).toBeInTheDocument();
    });

    it('handles correct answer selection', () => {
        render(
            <TrueFalseQuizItem
                question={mockQuestion}
                itemNumber={1}
                onAnswer={mockOnAnswer}
            />
        );

        const trueButton = screen.getByText('是 (True)');
        fireEvent.click(trueButton);

        expect(screen.getByText('答對了！')).toBeInTheDocument();
        expect(screen.getByText(mockQuestion.explanation!)).toBeInTheDocument();
        expect(mockOnAnswer).toHaveBeenCalledWith(true, true, expect.any(Number));
    });

    it('handles incorrect answer selection', () => {
        render(
            <TrueFalseQuizItem
                question={mockQuestion}
                itemNumber={1}
                onAnswer={mockOnAnswer}
            />
        );

        const falseButton = screen.getByText('非 (False)');
        fireEvent.click(falseButton);

        expect(screen.getByText(/答錯了/)).toBeInTheDocument();
        expect(mockOnAnswer).toHaveBeenCalledWith(false, false, expect.any(Number));
    });

    it('disables buttons after answering', () => {
        render(
            <TrueFalseQuizItem
                question={mockQuestion}
                itemNumber={1}
                onAnswer={mockOnAnswer}
            />
        );

        const trueButton = screen.getByText('是 (True)');
        fireEvent.click(trueButton);

        expect(trueButton).toBeDisabled();
        expect(screen.getByText('非 (False)')).toBeDisabled();
    });
});
