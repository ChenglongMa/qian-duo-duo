import { fireEvent, render, screen } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';
import type { Category, Merchant, NamedMasterData } from '@qdd/shared';

import EntryForm from '../components/EntryForm.vue';

const categories: Category[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    ledgerId: '22222222-2222-4222-8222-222222222222',
    stableKey: 'food',
    parentId: null,
    name: 'Food',
    sortOrder: 1,
    status: 'active',
    createdAt: '2026-05-29T00:00:00.000Z',
    updatedAt: '2026-05-29T00:00:00.000Z',
    version: 1,
    deletedAt: null
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    ledgerId: '22222222-2222-4222-8222-222222222222',
    stableKey: 'groceries',
    parentId: null,
    name: 'Groceries',
    sortOrder: 2,
    status: 'active',
    createdAt: '2026-05-29T00:00:00.000Z',
    updatedAt: '2026-05-29T00:00:00.000Z',
    version: 1,
    deletedAt: null
  }
];

const members: NamedMasterData[] = [
  {
    id: '44444444-4444-4444-8444-444444444444',
    ledgerId: '22222222-2222-4222-8222-222222222222',
    name: 'Family',
    sortOrder: 1,
    status: 'active',
    createdAt: '2026-05-29T00:00:00.000Z',
    updatedAt: '2026-05-29T00:00:00.000Z',
    version: 1,
    deletedAt: null
  }
];

const merchants: Merchant[] = [
  {
    id: '55555555-5555-4555-8555-555555555555',
    ledgerId: '22222222-2222-4222-8222-222222222222',
    name: 'Market Lane',
    normalizedName: 'market lane',
    status: 'active',
    createdAt: '2026-05-29T00:00:00.000Z',
    updatedAt: '2026-05-29T00:00:00.000Z',
    version: 1,
    deletedAt: null
  }
];

const projects: NamedMasterData[] = [
  {
    id: '66666666-6666-4666-8666-666666666666',
    ledgerId: '22222222-2222-4222-8222-222222222222',
    name: 'Travel',
    sortOrder: 1,
    status: 'active',
    createdAt: '2026-05-29T00:00:00.000Z',
    updatedAt: '2026-05-29T00:00:00.000Z',
    version: 1,
    deletedAt: null
  }
];

function renderEntryForm() {
  return render(EntryForm, {
    props: {
      ledgerBaseCurrency: 'AUD',
      categories,
      members,
      merchants,
      projects,
      recentCategoryIds: [categories[1]?.id ?? ''],
      recentMerchantIds: [merchants[0]?.id ?? ''],
      recentProjectIds: [projects[0]?.id ?? '']
    }
  });
}

function firstSave(emitted: (name: string) => unknown[] | undefined): unknown {
  const saves = emitted('save') as Array<[unknown]> | undefined;
  return saves?.[0]?.[0];
}

describe('EntryForm', () => {
  it('rejects exponent input and evaluates keypad arithmetic', async () => {
    const { emitted } = renderEntryForm();
    const amount = screen.getByLabelText('Amount') as HTMLInputElement;

    await fireEvent.update(amount, '1e2');

    expect(amount.value).toBe('');
    expect(screen.getByText('Use digits, decimals, spaces, and + - * / only.')).toBeTruthy();

    await fireEvent.click(screen.getByRole('button', { name: '1' }));
    await fireEvent.click(screen.getByRole('button', { name: '+' }));
    await fireEvent.click(screen.getByRole('button', { name: '2' }));
    await fireEvent.click(screen.getByRole('button', { name: '=' }));

    expect(amount.value).toBe('3.0000');

    await fireEvent.click(screen.getByRole('button', { name: 'Save entry' }));

    expect(firstSave(emitted)).toMatchObject({
      originalAmount: '3.0000',
      originalCurrency: 'AUD',
      categoryId: categories[0]?.id,
      memberId: members[0]?.id
    });
  });

  it('uses noon local time when a date is provided without a time', async () => {
    const { emitted } = renderEntryForm();

    await fireEvent.update(screen.getByLabelText('Amount'), '10');
    await fireEvent.update(screen.getByLabelText('Entry date'), '2026-05-29');
    await fireEvent.update(screen.getByLabelText('Entry time'), '');
    await fireEvent.click(screen.getByRole('button', { name: 'Save entry' }));

    expect(firstSave(emitted)).toMatchObject({
      occurredAt: new Date(2026, 4, 29, 12, 0, 0, 0).toISOString()
    });
  });

  it('applies recent category, merchant, and project chips', async () => {
    const { emitted } = renderEntryForm();

    await fireEvent.update(screen.getByLabelText('Amount'), '4.50');
    await fireEvent.click(screen.getByRole('button', { name: 'Groceries' }));
    await fireEvent.click(screen.getByRole('button', { name: 'Market Lane' }));
    await fireEvent.click(screen.getByRole('button', { name: 'Travel' }));
    await fireEvent.click(screen.getByRole('button', { name: 'Save entry' }));

    expect(firstSave(emitted)).toMatchObject({
      categoryId: categories[1]?.id,
      merchantId: merchants[0]?.id,
      projectId: projects[0]?.id
    });
  });
});
