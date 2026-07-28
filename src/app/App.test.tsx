import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { App } from './App';
import { ErrorBoundary } from './ErrorBoundary';

function BrokenPanel(): never {
  throw new Error('test display failure');
}

describe('App simulation dashboard', () => {
  it('opens in the deterministic normal scenario with persistent safety context', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'FutureATC Lab' })).toBeVisible();
    expect(screen.getByText('Simulated data')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Normal traffic' })).toBeVisible();
    expect(screen.getByLabelText(/academic safety notice/i)).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Local schematic' })).toBeVisible();
    expect(screen.getByLabelText('Region')).toHaveValue('lucknow');
  });

  it('shows the exact required academic disclaimer', () => {
    render(<App />);

    expect(
      screen.getByText(
        'This is an academic simulation for educational demonstration only. It is not an operational air traffic control, navigation, collision-avoidance, flight-planning, or safety system.',
      ),
    ).toBeVisible();
  });

  it('changes scenarios atomically and exposes synthetic aircraft details', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText('Scenario'), 'emergency');

    expect(screen.getByRole('heading', { name: 'Emergency' })).toBeVisible();
    expect(screen.getByText('Declared simulated events').previousElementSibling).toHaveTextContent(
      '1',
    );

    const table = screen.getByRole('table');
    const flightButtons = within(table).getAllByRole('button');
    const secondFlight = flightButtons.at(1);
    if (secondFlight === undefined) {
      throw new Error('Expected a second synthetic flight.');
    }
    await user.click(secondFlight);

    expect(screen.getByRole('heading', { name: secondFlight.textContent })).toBeVisible();
  });

  it('supports play, playback-rate, and reset controls', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Play' }));
    expect(screen.getByRole('button', { name: 'Pause' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: '4×' }));
    expect(screen.getByRole('button', { name: '4×' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByText('FATC-NORMAL-2401')).toBeVisible();
  });

  it('explains a Critical collision projection with facts, rule, limitation, and human action', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText('Scenario'), 'collision-risk');
    expect(screen.getByRole('heading', { name: 'Alert center' })).toBeVisible();
    expect(screen.getAllByText('Critical projected separation').length).toBeGreaterThan(0);

    const explanationButtons = screen.getAllByText('Why this result?');
    const firstExplanation = explanationButtons[0];
    expect(firstExplanation).toBeDefined();
    if (firstExplanation === undefined) return;
    await user.click(firstExplanation);

    expect(screen.getAllByText('Facts and units').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/10-minute constant-velocity CPA/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/educational simplification/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/human controller must verify/i).length).toBeGreaterThan(0);
  });

  it('updates simulated review and emergency controls without operational wording', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText('Scenario'), 'emergency');
    expect(screen.getAllByText('Suggested runway SIM-27').length).toBeGreaterThan(0);
    expect(screen.getByText('Unavailable')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Confirm simulation' }));
    expect(screen.getByText('Confirmed in simulation')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Reject simulation' }));
    expect(screen.getByText('Rejected in simulation')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Clear simulated emergency' }));
    expect(screen.getByText('No simulated emergency is active.')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Declare simulated emergency' }));
    expect(screen.getByText('A simulated emergency is active.')).toBeVisible();
    expect(screen.queryByText(/clearance issued/i)).not.toBeInTheDocument();
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
