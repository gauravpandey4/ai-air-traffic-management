import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { PwaStatusView } from './PwaStatus';

describe('PwaStatusView', () => {
  it('explains offline cache boundaries and supports notice dismissal', async () => {
    const user = userEvent.setup();
    const dismissOffline = vi.fn();
    render(
      <PwaStatusView
        needRefresh={false}
        offlineReady
        online={false}
        onDismissOfflineReady={dismissOffline}
        onDismissRefresh={vi.fn()}
        onUpdate={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/offline · cached shell and local simulator remain available/i),
    ).toBeVisible();
    expect(
      screen.getByText(/connected tiles and provider refreshes still require a network/i),
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Dismiss offline-ready message' }));
    expect(dismissOffline).toHaveBeenCalledOnce();
  });

  it('offers an explicit update action and dismissal', async () => {
    const user = userEvent.setup();
    const update = vi.fn();
    const dismiss = vi.fn();
    render(
      <PwaStatusView
        needRefresh
        offlineReady={false}
        online
        onDismissOfflineReady={vi.fn()}
        onDismissRefresh={dismiss}
        onUpdate={update}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Update app' }));
    await user.click(screen.getByRole('button', { name: 'Dismiss update message' }));
    expect(update).toHaveBeenCalledOnce();
    expect(dismiss).toHaveBeenCalledOnce();
  });
});
