import { render, screen, fireEvent } from '@testing-library/react';
import MultipleChoiceQuizItem from '../../../components/quizTypes/MultipleChoiceQuizItem';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MultipleChoiceQuestion } from '../../../types';

describe('MultipleChoiceQuizItem', () => {
    const mockQuestion: MultipleChoiceQuestion = {
        question: 'What is 2 + 2?',
        options: ['3', '4', '5'],
        correctAnswerIndex: 1,
    };

    const mockOnAnswer = vi.fn();

    beforeEach(() => {
        mockOnAnswer.mockClear();
    });

    it('renders the question and options', () => {
        render(
            <MultipleChoiceQuizItem
                question={mockQuestion}
                itemNumber={1}
                onAnswer={mockOnAnswer}
            />
        );
        expect(screen.getByText('1. What is 2 + 2?')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('4')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('handles correct answer selection', () => {
        render(
            <MultipleChoiceQuizItem
                question={mockQuestion}
                itemNumber={1}
                onAnswer={mockOnAnswer}
            />
        );

        const correctOption = screen.getByLabelText('4');
        fireEvent.click(correctOption);

        const checkButton = screen.getByText('檢查答案');
        fireEvent.click(checkButton);

        expect(screen.getByText('答對了！')).toBeInTheDocument();
        expect(mockOnAnswer).toHaveBeenCalledWith(1, true, expect.any(Number));
    });

    it('handles incorrect answer selection', () => {
        render(
            <MultipleChoiceQuizItem
                question={mockQuestion}
                itemNumber={1}
                onAnswer={mockOnAnswer}
            />
        );

        const incorrectOption = screen.getByLabelText('3');
        fireEvent.click(incorrectOption);

        const checkButton = screen.getByText('檢查答案');
        fireEvent.click(checkButton);

        expect(screen.getByText(/答錯了/)).toBeInTheDocument();
        expect(mockOnAnswer).toHaveBeenCalledWith(0, false, expect.any(Number));
    });

    it('requires an option to be selected before checking', () => {
        render(
            <MultipleChoiceQuizItem
                question={mockQuestion}
                itemNumber={1}
                onAnswer={mockOnAnswer}
            />
        );

        const checkButton = screen.getByText('檢查答案');
        expect(checkButton).toBeDisabled();

        // Try clicking anyway (though disabled)
        fireEvent.click(checkButton);
        expect(mockOnAnswer).not.toHaveBeenCalled();
    });
});
