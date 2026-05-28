import { render, screen } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';

import App from '../App.vue';

describe('App', () => {
  it('renders the QianDuoDuo master data shell', () => {
    render(App);

    expect(screen.getByRole('heading', { name: 'QianDuoDuo' })).toBeTruthy();
    expect(screen.getByText('Milestone 1')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Category tree' })).toBeTruthy();
  });
});
