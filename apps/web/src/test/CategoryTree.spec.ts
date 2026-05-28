import { render, screen } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';
import type { CategoryTreeNode } from '@qdd/shared';

import CategoryTree from '../components/CategoryTree.vue';

describe('CategoryTree', () => {
  it('renders nested category names and stable keys', () => {
    const nodes: CategoryTreeNode[] = [
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
        deletedAt: null,
        children: [
          {
            id: '33333333-3333-4333-8333-333333333333',
            ledgerId: '22222222-2222-4222-8222-222222222222',
            stableKey: 'groceries',
            parentId: '11111111-1111-4111-8111-111111111111',
            name: 'Groceries',
            sortOrder: 1,
            status: 'active',
            createdAt: '2026-05-29T00:00:00.000Z',
            updatedAt: '2026-05-29T00:00:00.000Z',
            version: 1,
            deletedAt: null,
            children: []
          }
        ]
      }
    ];

    render(CategoryTree, { props: { nodes } });

    expect(screen.getByText('Food')).toBeTruthy();
    expect(screen.getByText('food')).toBeTruthy();
    expect(screen.getByText('Groceries')).toBeTruthy();
    expect(screen.getByText('groceries')).toBeTruthy();
  });
});
