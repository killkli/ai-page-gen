import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import OfflineIndicator from '../../components/OfflineIndicator';

describe('OfflineIndicator', () => {
  let originalNavigatorOnLine: boolean;
  let onlineListeners: EventListener[] = [];
  let offlineListeners: EventListener[] = [];

  beforeEach(() => {
    originalNavigatorOnLine = navigator.onLine;
    onlineListeners = [];
    offlineListeners = [];

    vi.spyOn(window, 'addEventListener').mockImplementation(
      (type: string, listener: EventListenerOrEventListenerObject) => {
        if (type === 'online') {
          onlineListeners.push(listener as EventListener);
        } else if (type === 'offline') {
          offlineListeners.push(listener as EventListener);
        }
      }
    );

    vi.spyOn(window, 'removeEventListener').mockImplementation(
      (type: string, listener: EventListenerOrEventListenerObject) => {
        if (type === 'online') {
          onlineListeners = onlineListeners.filter(l => l !== listener);
        } else if (type === 'offline') {
          offlineListeners = offlineListeners.filter(l => l !== listener);
        }
      }
    );
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      value: originalNavigatorOnLine,
      writable: true,
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  const setNavigatorOnline = (online: boolean) => {
    Object.defineProperty(navigator, 'onLine', {
      value: online,
      writable: true,
      configurable: true,
    });
  };

  it('renders nothing when online and banner not shown', () => {
    setNavigatorOnline(true);
    const { container } = render(<OfflineIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it('shows offline message when navigator is offline', () => {
    setNavigatorOnline(false);
    render(<OfflineIndicator />);

    act(() => {
      offlineListeners.forEach(listener => listener(new Event('offline')));
    });

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/目前處於離線模式/)).toBeInTheDocument();
  });

  it('shows online message when connection is restored', () => {
    setNavigatorOnline(false);
    render(<OfflineIndicator />);

    act(() => {
      offlineListeners.forEach(listener => listener(new Event('offline')));
    });

    setNavigatorOnline(true);
    act(() => {
      onlineListeners.forEach(listener => listener(new Event('online')));
    });

    expect(screen.getByText(/網路已恢復連線/)).toBeInTheDocument();
  });

  it('applies correct styling for offline state', () => {
    setNavigatorOnline(false);
    render(<OfflineIndicator />);

    act(() => {
      offlineListeners.forEach(listener => listener(new Event('offline')));
    });

    const banner = screen.getByRole('alert');
    expect(banner).toHaveClass('bg-amber-500');
  });

  it('applies correct styling for online state', () => {
    setNavigatorOnline(false);
    render(<OfflineIndicator />);

    act(() => {
      offlineListeners.forEach(listener => listener(new Event('offline')));
    });

    setNavigatorOnline(true);
    act(() => {
      onlineListeners.forEach(listener => listener(new Event('online')));
    });

    const banner = screen.getByRole('alert');
    expect(banner).toHaveClass('bg-green-500');
  });

  it('has correct accessibility attributes', () => {
    setNavigatorOnline(false);
    render(<OfflineIndicator />);

    act(() => {
      offlineListeners.forEach(listener => listener(new Event('offline')));
    });

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });

  it('cleans up event listeners on unmount', () => {
    setNavigatorOnline(true);
    const { unmount } = render(<OfflineIndicator />);

    expect(window.addEventListener).toHaveBeenCalledWith(
      'online',
      expect.any(Function)
    );
    expect(window.addEventListener).toHaveBeenCalledWith(
      'offline',
      expect.any(Function)
    );

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith(
      'online',
      expect.any(Function)
    );
    expect(window.removeEventListener).toHaveBeenCalledWith(
      'offline',
      expect.any(Function)
    );
  });

  it('hides online banner after 3 seconds', async () => {
    vi.useFakeTimers();
    setNavigatorOnline(false);
    render(<OfflineIndicator />);

    act(() => {
      offlineListeners.forEach(listener => listener(new Event('offline')));
    });

    setNavigatorOnline(true);
    act(() => {
      onlineListeners.forEach(listener => listener(new Event('online')));
    });

    expect(screen.getByText(/網路已恢復連線/)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
