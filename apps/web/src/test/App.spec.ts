import { render, screen } from '@testing-library/vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App.vue';

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ authenticated: false }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the QianDuoDuo bookkeeping shell', () => {
    render(App);

    expect(screen.getByRole('heading', { name: 'QianDuoDuo' })).toBeTruthy();
    expect(screen.getByText('Milestone 2A')).toBeTruthy();
  });
});
