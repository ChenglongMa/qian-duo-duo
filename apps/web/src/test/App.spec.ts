import { render, screen } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';

import App from '../App.vue';

describe('App', () => {
  it('renders the QianDuoDuo bootstrap screen', () => {
    render(App);

    expect(screen.getByRole('heading', { name: 'QianDuoDuo' })).toBeTruthy();
    expect(screen.getByText('Milestone 0')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'API' })).toBeTruthy();
  });
});
