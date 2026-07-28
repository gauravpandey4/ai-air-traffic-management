import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { App } from './App';
import { ErrorBoundary } from './ErrorBoundary';

function BrokenPanel(): never {
  throw new Error('test display failure');
}

describe('App foundation', () => {
  it('shows the project identity and simulation status', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'FutureATC Lab' })).toBeVisible();
    expect(screen.getByText(/simulated data/i)).toBeVisible();
    expect(screen.getByLabelText(/academic safety notice/i)).toBeVisible();
  });

  it('shows the exact required academic disclaimer', () => {
    render(<App />);

    expect(
      screen.getByText(
        'This is an academic simulation for educational demonstration only. It is not an operational air traffic control, navigation, collision-avoidance, flight-planning, or safety system.',
      ),
    ).toBeVisible();
  });

  it('exposes the planned module regions', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Traffic picture' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Decision support' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Weather context' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Explainable statistics' })).toBeVisible();
  });
});

describe('ErrorBoundary', () => {
  it('shows a safe recovery view when a child fails', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <ErrorBoundary>
        <BrokenPanel />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('heading', { name: /needs a reset/i })).toBeVisible();
    expect(screen.getByText(/no real system is affected/i)).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: /reload simulation/i }));

    consoleSpy.mockRestore();
  });
});
