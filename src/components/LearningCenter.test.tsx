import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LearningCenter } from './LearningCenter';

describe('LearningCenter', () => {
  it('documents all seven capabilities with inputs, rules, outputs, and limitations', async () => {
    const user = userEvent.setup();
    render(<LearningCenter />);

    const guide = screen.getByRole('region', { name: 'How FutureATC Lab works' });
    const modules = within(guide).getAllByRole('group');
    expect(modules).toHaveLength(7);

    const collision = within(guide).getByText('2. Collision projection').closest('summary');
    expect(collision).not.toBeNull();
    if (collision === null) return;
    await user.click(collision);

    expect(within(guide).getByText(/cannot establish actual collision danger/i)).toBeVisible();
    expect(within(guide).getByRole('heading', { name: 'Five-minute demo path' })).toBeVisible();
    expect(within(guide).getByRole('heading', { name: 'Plain-language glossary' })).toBeVisible();
    expect(within(guide).getByRole('heading', { name: 'Sources and attribution' })).toBeVisible();
    expect(within(guide).getByRole('heading', { name: 'System boundary' })).toBeVisible();
  });
});
