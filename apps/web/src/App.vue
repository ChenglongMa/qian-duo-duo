<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import type {
  Category,
  CreateEntryRequest,
  Entry,
  EntryListQuery,
  Ledger,
  LoginRequest,
  Merchant,
  NamedMasterData,
  UpdateEntryRequest
} from '@qdd/shared';

import {
  cloneEntry,
  createEntry,
  deleteEntry,
  listEntries,
  updateEntry
} from './api/entries';
import { fetchCurrentSession, login as loginRequest } from './api/auth';
import {
  createCategory,
  createLedger,
  createMerchant,
  createProject,
  listCategories,
  listLedgers,
  listMembers,
  listMerchants,
  listProjects
} from './api/master-data';
import EntryForm from './components/EntryForm.vue';
import EntryList from './components/EntryList.vue';
import LoginForm from './components/LoginForm.vue';

const csrfToken = ref('');
const authenticated = ref(false);
const loading = ref(true);
const busy = ref(false);
const message = ref('');

const ledgers = ref<Ledger[]>([]);
const selectedLedgerId = ref('');
const categories = ref<Category[]>([]);
const members = ref<NamedMasterData[]>([]);
const merchants = ref<Merchant[]>([]);
const projects = ref<NamedMasterData[]>([]);
const entries = ref<Entry[]>([]);
const editingEntry = ref<Entry | null>(null);

const entryFilters = ref<EntryListQuery>({
  sortBy: 'occurredAt',
  sortDirection: 'desc'
});

const ledgerForm = reactive({
  name: 'Household',
  baseCurrency: 'AUD',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
});

const categoryForm = reactive({
  stableKey: 'food',
  name: 'Food'
});

const merchantForm = reactive({
  name: ''
});

const projectForm = reactive({
  name: ''
});

const selectedLedger = computed(() => ledgers.value.find((ledger) => ledger.id === selectedLedgerId.value) ?? null);
const baseCurrency = computed(() => selectedLedger.value?.baseCurrency ?? 'AUD');

function uniqueRecentIds(field: 'categoryId' | 'merchantId' | 'projectId'): string[] {
  const seen = new Set<string>();
  const recent: string[] = [];
  for (const entry of entries.value) {
    const id = entry[field];
    if (id && !seen.has(id)) {
      seen.add(id);
      recent.push(id);
    }
    if (recent.length >= 5) {
      break;
    }
  }

  return recent;
}

const recentCategoryIds = computed(() => uniqueRecentIds('categoryId'));
const recentMerchantIds = computed(() => uniqueRecentIds('merchantId'));
const recentProjectIds = computed(() => uniqueRecentIds('projectId'));

async function initializeSession(): Promise<void> {
  loading.value = true;
  try {
    const session = await fetchCurrentSession();
    authenticated.value = session.authenticated;
    csrfToken.value = session.authenticated ? session.csrfToken : '';
    if (session.authenticated) {
      await refreshLedgers();
    }
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Unable to load the session.';
  } finally {
    loading.value = false;
  }
}

async function handleLogin(payload: LoginRequest): Promise<void> {
  busy.value = true;
  message.value = '';
  try {
    const session = await loginRequest(payload);
    authenticated.value = true;
    csrfToken.value = session.csrfToken;
    await refreshLedgers();
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Sign in failed.';
  } finally {
    busy.value = false;
  }
}

async function refreshLedgers(): Promise<void> {
  const response = await listLedgers();
  ledgers.value = response.ledgers;
  if (!selectedLedgerId.value && response.ledgers[0]) {
    selectedLedgerId.value = response.ledgers[0].id;
  }
}

async function refreshLedgerData(): Promise<void> {
  if (!selectedLedgerId.value) {
    categories.value = [];
    members.value = [];
    merchants.value = [];
    projects.value = [];
    entries.value = [];
    return;
  }

  const ledgerId = selectedLedgerId.value;
  const [categoryResponse, memberResponse, merchantResponse, projectResponse, entryResponse] = await Promise.all([
    listCategories(ledgerId),
    listMembers(ledgerId),
    listMerchants(ledgerId),
    listProjects(ledgerId),
    listEntries(ledgerId, entryFilters.value)
  ]);

  categories.value = categoryResponse.categories;
  members.value = memberResponse.members;
  merchants.value = merchantResponse.merchants;
  projects.value = projectResponse.projects;
  entries.value = entryResponse.entries;
}

watch(
  () => selectedLedgerId.value,
  async () => {
    editingEntry.value = null;
    await refreshLedgerData();
  }
);

watch(
  () => entryFilters.value,
  async () => {
    await refreshLedgerData();
  },
  { deep: true }
);

async function submitLedger(): Promise<void> {
  busy.value = true;
  message.value = '';
  try {
    const response = await createLedger(
      {
        name: ledgerForm.name,
        baseCurrency: ledgerForm.baseCurrency.trim().toUpperCase(),
        timezone: ledgerForm.timezone
      },
      csrfToken.value
    );
    await refreshLedgers();
    selectedLedgerId.value = response.ledger.id;
    message.value = 'Ledger created.';
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Unable to create ledger.';
  } finally {
    busy.value = false;
  }
}

async function submitCategory(): Promise<void> {
  if (!selectedLedgerId.value) {
    return;
  }

  busy.value = true;
  message.value = '';
  try {
    await createCategory(
      selectedLedgerId.value,
      {
        stableKey: categoryForm.stableKey,
        name: categoryForm.name
      },
      csrfToken.value
    );
    await refreshLedgerData();
    message.value = 'Category created.';
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Unable to create category.';
  } finally {
    busy.value = false;
  }
}

async function submitMerchant(): Promise<void> {
  if (!selectedLedgerId.value || merchantForm.name.trim() === '') {
    return;
  }

  busy.value = true;
  message.value = '';
  try {
    await createMerchant(selectedLedgerId.value, { name: merchantForm.name }, csrfToken.value);
    merchantForm.name = '';
    await refreshLedgerData();
    message.value = 'Merchant created.';
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Unable to create merchant.';
  } finally {
    busy.value = false;
  }
}

async function submitProject(): Promise<void> {
  if (!selectedLedgerId.value || projectForm.name.trim() === '') {
    return;
  }

  busy.value = true;
  message.value = '';
  try {
    await createProject(selectedLedgerId.value, { name: projectForm.name }, csrfToken.value);
    projectForm.name = '';
    await refreshLedgerData();
    message.value = 'Project created.';
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Unable to create project.';
  } finally {
    busy.value = false;
  }
}

async function saveEntry(payload: CreateEntryRequest | UpdateEntryRequest): Promise<void> {
  if (!selectedLedgerId.value) {
    return;
  }

  busy.value = true;
  message.value = '';
  try {
    if (editingEntry.value) {
      await updateEntry(selectedLedgerId.value, editingEntry.value.id, payload as UpdateEntryRequest, csrfToken.value);
      message.value = 'Entry updated.';
    } else {
      await createEntry(selectedLedgerId.value, payload as CreateEntryRequest, csrfToken.value);
      message.value = 'Entry created.';
    }
    editingEntry.value = null;
    await refreshLedgerData();
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Unable to save entry.';
  } finally {
    busy.value = false;
  }
}

async function cloneSelectedEntry(entry: Entry): Promise<void> {
  if (!selectedLedgerId.value) {
    return;
  }

  busy.value = true;
  message.value = '';
  try {
    await cloneEntry(selectedLedgerId.value, entry.id, csrfToken.value);
    await refreshLedgerData();
    message.value = 'Entry cloned.';
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Unable to clone entry.';
  } finally {
    busy.value = false;
  }
}

async function softDeleteEntry(entry: Entry): Promise<void> {
  if (!selectedLedgerId.value) {
    return;
  }

  busy.value = true;
  message.value = '';
  try {
    await deleteEntry(selectedLedgerId.value, entry.id, csrfToken.value);
    if (editingEntry.value?.id === entry.id) {
      editingEntry.value = null;
    }
    await refreshLedgerData();
    message.value = 'Entry deleted.';
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Unable to delete entry.';
  } finally {
    busy.value = false;
  }
}

function updateFilters(filters: EntryListQuery): void {
  entryFilters.value = filters;
}

onMounted(() => {
  void initializeSession();
});
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
      <span class="status-pill">Milestone 2A</span>
    </section>

    <p
      v-if="message"
      class="app-message"
      role="status"
    >
      {{ message }}
    </p>

    <section
      v-if="loading"
      class="tool-panel"
    >
      Loading
    </section>

    <section
      v-else-if="!authenticated"
      class="workspace-grid single-column"
    >
      <section
        class="tool-panel narrow-panel"
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
    </section>

    <section
      v-else
      class="bookkeeping-layout"
    >
      <aside class="sidebar-panel">
        <form
          class="compact-form"
          aria-label="Create ledger"
          @submit.prevent="submitLedger"
        >
          <div class="section-heading compact-heading">
            <p class="eyebrow">
              Ledger
            </p>
            <h2>Create ledger</h2>
          </div>
          <div class="form-row">
            <label for="ledger-name">Ledger name</label>
            <input
              id="ledger-name"
              v-model="ledgerForm.name"
            >
          </div>
          <div class="form-row">
            <label for="ledger-currency">Base currency</label>
            <input
              id="ledger-currency"
              v-model="ledgerForm.baseCurrency"
              maxlength="3"
            >
          </div>
          <div class="form-row">
            <label for="ledger-timezone">Timezone</label>
            <input
              id="ledger-timezone"
              v-model="ledgerForm.timezone"
            >
          </div>
          <button
            type="submit"
            :disabled="busy"
          >
            Create ledger
          </button>
        </form>

        <div class="form-row">
          <label for="ledger-select">Current ledger</label>
          <select
            id="ledger-select"
            v-model="selectedLedgerId"
          >
            <option
              v-for="ledger in ledgers"
              :key="ledger.id"
              :value="ledger.id"
            >
              {{ ledger.name }} · {{ ledger.baseCurrency }}
            </option>
          </select>
        </div>

        <form
          class="compact-form"
          aria-label="Create category"
          @submit.prevent="submitCategory"
        >
          <div class="section-heading compact-heading">
            <p class="eyebrow">
              Category
            </p>
            <h2>Create category</h2>
          </div>
          <div class="form-row">
            <label for="category-key">Category key</label>
            <input
              id="category-key"
              v-model="categoryForm.stableKey"
            >
          </div>
          <div class="form-row">
            <label for="category-name">Category name</label>
            <input
              id="category-name"
              v-model="categoryForm.name"
            >
          </div>
          <button
            type="submit"
            :disabled="busy || !selectedLedgerId"
          >
            Create category
          </button>
        </form>

        <form
          class="compact-form"
          aria-label="Create merchant"
          @submit.prevent="submitMerchant"
        >
          <div class="section-heading compact-heading">
            <p class="eyebrow">
              Merchant
            </p>
            <h2>Create merchant</h2>
          </div>
          <div class="form-row">
            <label for="merchant-name">Merchant name</label>
            <input
              id="merchant-name"
              v-model="merchantForm.name"
            >
          </div>
          <button
            type="submit"
            class="secondary-button"
            :disabled="busy || !selectedLedgerId"
          >
            Add merchant
          </button>
        </form>

        <form
          class="compact-form"
          aria-label="Create project"
          @submit.prevent="submitProject"
        >
          <div class="section-heading compact-heading">
            <p class="eyebrow">
              Project
            </p>
            <h2>Create project</h2>
          </div>
          <div class="form-row">
            <label for="project-name">Project name</label>
            <input
              id="project-name"
              v-model="projectForm.name"
            >
          </div>
          <button
            type="submit"
            class="secondary-button"
            :disabled="busy || !selectedLedgerId"
          >
            Add project
          </button>
        </form>
      </aside>

      <section class="entry-workspace">
        <section
          class="tool-panel"
          aria-labelledby="entry-form-title"
        >
          <h2
            id="entry-form-title"
            class="visually-hidden"
          >
            Entry form
          </h2>
          <EntryForm
            :ledger-base-currency="baseCurrency"
            :categories="categories"
            :members="members"
            :merchants="merchants"
            :projects="projects"
            :recent-category-ids="recentCategoryIds"
            :recent-merchant-ids="recentMerchantIds"
            :recent-project-ids="recentProjectIds"
            :initial-entry="editingEntry"
            :submitting="busy"
            @save="saveEntry"
            @cancel="editingEntry = null"
          />
        </section>

        <section class="tool-panel list-panel">
          <EntryList
            :entries="entries"
            :categories="categories"
            :members="members"
            :merchants="merchants"
            :projects="projects"
            :filters="entryFilters"
            @update-filters="updateFilters"
            @edit="editingEntry = $event"
            @clone="cloneSelectedEntry"
            @delete="softDeleteEntry"
          />
        </section>
      </section>
    </section>
  </main>
</template>
