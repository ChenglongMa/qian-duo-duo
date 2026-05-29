<script setup lang="ts">
import { computed } from 'vue';
import type {
  Category,
  Entry,
  EntryListQuery,
  EntrySortBy,
  EntrySortDirection,
  Merchant,
  NamedMasterData
} from '@qdd/shared';

const props = defineProps<{
  entries: Entry[];
  categories: Category[];
  members: NamedMasterData[];
  merchants: Merchant[];
  projects: NamedMasterData[];
  filters: EntryListQuery;
}>();

const emit = defineEmits<{
  updateFilters: [filters: EntryListQuery];
  edit: [entry: Entry];
  clone: [entry: Entry];
  delete: [entry: Entry];
}>();

function byId<T extends { id: string; name: string }>(items: T[]): Map<string, string> {
  return new Map(items.map((item) => [item.id, item.name]));
}

const categoryNames = computed(() => byId(props.categories));
const memberNames = computed(() => byId(props.members));
const merchantNames = computed(() => byId(props.merchants));
const projectNames = computed(() => byId(props.projects));

function entryLabel(entry: Entry): string {
  return entry.note || `${entry.type} ${entry.originalAmount}`;
}

function displayDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function patchFilters(patch: Partial<EntryListQuery>): void {
  emit('updateFilters', {
    ...props.filters,
    ...patch
  });
}

function selectValue(event: Event): string {
  return (event.target as HTMLSelectElement).value;
}

function changeType(event: Event): void {
  const value = selectValue(event);
  patchFilters({ type: value === '' ? undefined : (value as EntryListQuery['type']) });
}

function changeCategory(event: Event): void {
  patchFilters({ categoryId: selectValue(event) || undefined });
}

function changeSortBy(event: Event): void {
  patchFilters({ sortBy: selectValue(event) as EntrySortBy });
}

function changeSortDirection(event: Event): void {
  patchFilters({ sortDirection: selectValue(event) as EntrySortDirection });
}
</script>

<template>
  <section
    class="entry-list"
    aria-labelledby="entry-list-title"
  >
    <div class="section-heading compact-heading">
      <p class="eyebrow">
        Entries
      </p>
      <h2 id="entry-list-title">
        Ledger activity
      </h2>
    </div>

    <div class="filter-bar">
      <label>
        Type
        <select
          :value="filters.type ?? ''"
          @change="changeType"
        >
          <option value="">
            All
          </option>
          <option value="Expense">
            Expense
          </option>
          <option value="Income">
            Income
          </option>
        </select>
      </label>

      <label>
        Category
        <select
          :value="filters.categoryId ?? ''"
          @change="changeCategory"
        >
          <option value="">
            All
          </option>
          <option
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
      </label>

      <label>
        Sort
        <select
          :value="filters.sortBy"
          @change="changeSortBy"
        >
          <option value="occurredAt">
            Date
          </option>
          <option value="baseAmount">
            Amount
          </option>
          <option value="createdAt">
            Created
          </option>
          <option value="updatedAt">
            Updated
          </option>
        </select>
      </label>

      <label>
        Direction
        <select
          :value="filters.sortDirection"
          @change="changeSortDirection"
        >
          <option value="desc">
            Desc
          </option>
          <option value="asc">
            Asc
          </option>
        </select>
      </label>
    </div>

    <div class="entry-table-wrap">
      <table class="entry-table">
        <thead>
          <tr>
            <th scope="col">
              Date
            </th>
            <th scope="col">
              Type
            </th>
            <th scope="col">
              Amount
            </th>
            <th scope="col">
              Category
            </th>
            <th scope="col">
              Member
            </th>
            <th scope="col">
              Merchant
            </th>
            <th scope="col">
              Project
            </th>
            <th scope="col">
              Note
            </th>
            <th scope="col">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="entry in entries"
            :key="entry.id"
          >
            <td>{{ displayDate(entry.occurredAt) }}</td>
            <td>{{ entry.type }}</td>
            <td class="amount-cell">
              {{ entry.baseAmount }} {{ entry.baseCurrency }}
              <span v-if="entry.originalCurrency !== entry.baseCurrency">
                ({{ entry.originalAmount }} {{ entry.originalCurrency }})
              </span>
            </td>
            <td>{{ entry.categoryId ? categoryNames.get(entry.categoryId) ?? 'Unknown' : 'None' }}</td>
            <td>{{ entry.memberId ? memberNames.get(entry.memberId) ?? 'Unknown' : 'None' }}</td>
            <td>{{ entry.merchantId ? merchantNames.get(entry.merchantId) ?? 'None' : 'None' }}</td>
            <td>{{ entry.projectId ? projectNames.get(entry.projectId) ?? 'None' : 'None' }}</td>
            <td>{{ entry.note }}</td>
            <td>
              <div class="table-actions">
                <button
                  type="button"
                  class="secondary-button compact-button"
                  :aria-label="`Edit ${entryLabel(entry)}`"
                  @click="emit('edit', entry)"
                >
                  Edit
                </button>
                <button
                  type="button"
                  class="secondary-button compact-button"
                  :aria-label="`Clone ${entryLabel(entry)}`"
                  @click="emit('clone', entry)"
                >
                  Clone
                </button>
                <button
                  type="button"
                  class="danger-button compact-button"
                  :aria-label="`Soft delete ${entryLabel(entry)}`"
                  @click="emit('delete', entry)"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="entries.length === 0">
            <td
              colspan="9"
              class="empty-cell"
            >
              No entries
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
