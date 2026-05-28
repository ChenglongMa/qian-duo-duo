import { fireEvent, render, screen } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';

import LoginForm from '../components/LoginForm.vue';

describe('LoginForm', () => {
  it('emits a typed login payload when valid', async () => {
    const { emitted } = render(LoginForm);

    await fireEvent.update(screen.getByLabelText('Admin username'), 'admin');
    await fireEvent.update(screen.getByLabelText('Password'), 'CorrectHorse!2026');
    await fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(emitted('submit')?.[0]).toEqual([{ username: 'admin', password: 'CorrectHorse!2026' }]);
  });

  it('shows field errors for invalid input', async () => {
    render(LoginForm);

    await fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(screen.getByText(/Too small/i)).toBeTruthy();
  });
});
