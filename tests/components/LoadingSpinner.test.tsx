import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { describe, it, expect } from 'vitest';

describe('LoadingSpinner', () => {
    it('renders correctly', () => {
        const { container } = render(<LoadingSpinner />);
        expect(screen.getByText('正在產生學習內容...')).toBeInTheDocument();
        expect(container.firstChild).toHaveClass('flex flex-col items-center justify-center space-y-2');
    });

    it('matches snapshot', () => {
        const { container } = render(<LoadingSpinner />);
        expect(container).toMatchSnapshot();
    });
});
