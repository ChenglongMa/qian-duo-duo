<script setup lang="ts">
import type { CategoryTreeNode, LoginRequest } from '@qdd/shared';

import CategoryTree from './components/CategoryTree.vue';
import LoginForm from './components/LoginForm.vue';

const sampleCategories: CategoryTreeNode[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    ledgerId: '22222222-2222-4222-8222-222222222222',
    stableKey: 'household',
    parentId: null,
    name: 'Household',
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
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    ledgerId: '22222222-2222-4222-8222-222222222222',
    stableKey: 'travel',
    parentId: null,
    name: 'Travel',
    sortOrder: 2,
    status: 'inactive',
    createdAt: '2026-05-29T00:00:00.000Z',
    updatedAt: '2026-05-29T00:00:00.000Z',
    version: 1,
    deletedAt: null,
    children: []
  }
];

function handleLogin(payload: LoginRequest): void {
  void payload;
}
</script>

<template>
  <main class="app-shell">
    <section
      class="workspace-header"
      aria-labelledby="app-title"
    >
      <div>
        <p class="eyebrow">
          Private household ledger
        </p>
        <h1 id="app-title">
          QianDuoDuo
        </h1>
      </div>
      <span class="status-pill">Milestone 1</span>
    </section>

    <section class="workspace-grid">
      <section
        class="tool-panel"
        aria-labelledby="login-title"
      >
        <div class="section-heading">
          <p class="eyebrow">
            Admin session
          </p>
          <h2 id="login-title">
            Sign in
          </h2>
        </div>
        <LoginForm @submit="handleLogin" />
      </section>

      <section
        class="tool-panel"
        aria-labelledby="category-title"
      >
        <div class="section-heading">
          <p class="eyebrow">
            Master data
          </p>
          <h2 id="category-title">
            Category tree
          </h2>
        </div>
        <CategoryTree :nodes="sampleCategories" />
      </section>
    </section>
  </main>
</template>
