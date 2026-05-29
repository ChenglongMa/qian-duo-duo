<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import {
  createEntryRequestSchema,
  updateEntryRequestSchema,
  type Category,
  type CreateEntryRequest,
  type Entry,
  type EntryType,
  type Merchant,
  type NamedMasterData,
  type UpdateEntryRequest
} from '@qdd/shared';

import { amountExpressionAllows, evaluateAmountExpression } from '../lib/amount-expression';

const props = defineProps<{
  ledgerBaseCurrency: string;
  categories: Category[];
  members: NamedMasterData[];
  merchants: Merchant[];
  projects: NamedMasterData[];
  recentCategoryIds: string[];
  recentMerchantIds: string[];
  recentProjectIds: string[];
  initialEntry?: Entry | null;
  submitting?: boolean;
}>();

const emit = defineEmits<{
  save: [payload: CreateEntryRequest | UpdateEntryRequest];
  cancel: [];
}>();

const fieldErrors = ref<Record<string, string>>({});

const form = reactive({
  type: 'Expense' as EntryType,
  occurredDate: '',
  occurredTime: '',
  amountExpression: '',
  originalCurrency: '',
  fxRate: '',
  categoryId: '',
  memberId: '',
  merchantId: '',
  projectId: '',
  note: ''
});

const isEditing = computed(() => Boolean(props.initialEntry));
const title = computed(() => (isEditing.value ? 'Edit entry' : 'New entry'));
const saveLabel = computed(() => (isEditing.value ? 'Save changes' : 'Save entry'));

const keypadKeys = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'];

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

function localDate(value: Date): string {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

function localTime(value: Date): string {
  return `${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

function resetForNewEntry(): void {
  const now = new Date();
  form.type = 'Expense';
  form.occurredDate = localDate(now);
  form.occurredTime = localTime(now);
  form.amountExpression = '';
  form.originalCurrency = props.ledgerBaseCurrency;
  form.fxRate = '';
  form.categoryId = props.categories[0]?.id ?? '';
  form.memberId = props.members[0]?.id ?? '';
  form.merchantId = '';
  form.projectId = '';
  form.note = '';
  fieldErrors.value = {};
}

function applyEntry(entry: Entry): void {
  const occurredAt = new Date(entry.occurredAt);
  form.type = entry.type;
  form.occurredDate = localDate(occurredAt);
  form.occurredTime = localTime(occurredAt);
  form.amountExpression = entry.originalAmount;
  form.originalCurrency = entry.originalCurrency;
  form.fxRate = entry.fxRate === '1.00000000' && entry.originalCurrency === props.ledgerBaseCurrency ? '' : entry.fxRate;
  form.categoryId = entry.categoryId ?? '';
  form.memberId = entry.memberId ?? '';
  form.merchantId = entry.merchantId ?? '';
  form.projectId = entry.projectId ?? '';
  form.note = entry.note;
  fieldErrors.value = {};
}

watch(
  () => [props.initialEntry, props.ledgerBaseCurrency, props.categories, props.members] as const,
  () => {
    if (props.initialEntry) {
      applyEntry(props.initialEntry);
    } else {
      resetForNewEntry();
    }
  },
  { immediate: true }
);

function optionMap<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

const categoryById = computed(() => optionMap(props.categories));
const merchantById = computed(() => optionMap(props.merchants));
const projectById = computed(() => optionMap(props.projects));

const recentCategories = computed(() =>
  props.recentCategoryIds.flatMap((id) => {
    const category = categoryById.value.get(id);
    return category ? [category] : [];
  })
);

const recentMerchants = computed(() =>
  props.recentMerchantIds.flatMap((id) => {
    const merchant = merchantById.value.get(id);
    return merchant ? [merchant] : [];
  })
);

const recentProjects = computed(() =>
  props.recentProjectIds.flatMap((id) => {
    const project = projectById.value.get(id);
    return project ? [project] : [];
  })
);

function setFieldError(field: string, message: string): void {
  fieldErrors.value = {
    ...fieldErrors.value,
    [field]: message
  };
}

function clearFieldError(field: string): void {
  const next = { ...fieldErrors.value };
  delete next[field];
  fieldErrors.value = next;
}

function handleAmountInput(event: Event): void {
  const target = event.target as HTMLInputElement;
  if (!amountExpressionAllows(target.value)) {
    target.value = form.amountExpression;
    setFieldError('amount', 'Use digits, decimals, spaces, and + - * / only.');
    return;
  }

  form.amountExpression = target.value;
  clearFieldError('amount');
}

function appendAmountToken(token: string): void {
  const next = '+-*/'.includes(token) ? `${form.amountExpression.trim()} ${token} ` : `${form.amountExpression}${token}`;
  if (!amountExpressionAllows(next)) {
    setFieldError('amount', 'Use digits, decimals, spaces, and + - * / only.');
    return;
  }

  form.amountExpression = next;
  clearFieldError('amount');
}

function evaluateAmount(): void {
  const result = evaluateAmountExpression(form.amountExpression);
  if (!result.ok) {
    setFieldError('amount', result.message);
    return;
  }

  form.amountExpression = result.value;
  clearFieldError('amount');
}

function pressKey(key: string): void {
  if (key === '=') {
    evaluateAmount();
    return;
  }

  appendAmountToken(key);
}

function clearAmount(): void {
  form.amountExpression = '';
  clearFieldError('amount');
}

function backspaceAmount(): void {
  form.amountExpression = form.amountExpression.slice(0, -1);
  clearFieldError('amount');
}

function localDateTimeToIso(dateValue: string, timeValue: string): string | undefined {
  if (!dateValue) {
    return undefined;
  }

  const [year, month, day] = dateValue.split('-').map((part) => Number(part));
  const [hour = 12, minute = 0] = (timeValue || '12:00').split(':').map((part) => Number(part));
  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) {
    return undefined;
  }

  return new Date(year, month - 1, day, hour, minute, 0, 0).toISOString();
}

function submit(): void {
  fieldErrors.value = {};
  const amount = evaluateAmountExpression(form.amountExpression);
  if (!amount.ok) {
    setFieldError('amount', amount.message);
    return;
  }

  const occurredAt = localDateTimeToIso(form.occurredDate, form.occurredTime);
  const normalizedCurrency = form.originalCurrency.trim().toUpperCase();

  if (normalizedCurrency !== props.ledgerBaseCurrency && form.fxRate.trim() === '') {
    setFieldError('fxRate', 'FX rate is required for foreign-currency entries.');
    return;
  }

  const payload = {
    type: form.type,
    occurredAt,
    originalAmount: amount.value,
    originalCurrency: normalizedCurrency,
    fxRate: form.fxRate.trim() === '' ? undefined : form.fxRate.trim(),
    categoryId: form.categoryId,
    memberId: form.memberId,
    merchantId: form.merchantId || null,
    projectId: form.projectId || null,
    note: form.note
  };

  const result = isEditing.value ? updateEntryRequestSchema.safeParse(payload) : createEntryRequestSchema.safeParse(payload);
  if (!result.success) {
    fieldErrors.value = Object.fromEntries(
      result.error.issues.map((issue) => [String(issue.path[0] ?? 'form'), issue.message])
    );
    return;
  }

  emit('save', result.data);
}
</script>

<template>
  <form
    class="entry-form"
    :aria-label="title"
    novalidate
    @submit.prevent="submit"
  >
    <div class="section-heading compact-heading">
      <p class="eyebrow">
        Entry
      </p>
      <h2>
        {{ title }}
      </h2>
    </div>

    <div class="segmented-control">
      <label>
        <input
          v-model="form.type"
          type="radio"
          value="Expense"
        >
        Expense
      </label>
      <label>
        <input
          v-model="form.type"
          type="radio"
          value="Income"
        >
        Income
      </label>
    </div>

    <div class="form-row two-columns">
      <div>
        <label for="entry-date">Entry date</label>
        <input
          id="entry-date"
          v-model="form.occurredDate"
          type="date"
          aria-describedby="entry-date-error"
        >
      </div>
      <div>
        <label for="entry-time">Entry time</label>
        <input
          id="entry-time"
          v-model="form.occurredTime"
          type="time"
        >
      </div>
      <p
        v-if="fieldErrors.occurredAt"
        id="entry-date-error"
        class="field-error span-columns"
      >
        {{ fieldErrors.occurredAt }}
      </p>
    </div>

    <div class="form-row">
      <label for="entry-amount">Amount</label>
      <input
        id="entry-amount"
        :value="form.amountExpression"
        inputmode="decimal"
        :aria-invalid="fieldErrors.amount ? 'true' : 'false'"
        aria-describedby="entry-amount-error"
        @input="handleAmountInput"
      >
      <div
        class="keypad"
        aria-label="Amount keypad"
      >
        <button
          v-for="key in keypadKeys"
          :key="key"
          type="button"
          class="keypad-button"
          @click="pressKey(key)"
        >
          {{ key }}
        </button>
        <button
          type="button"
          class="keypad-button wide"
          @click="backspaceAmount"
        >
          Backspace
        </button>
        <button
          type="button"
          class="keypad-button wide"
          @click="clearAmount"
        >
          Clear
        </button>
      </div>
      <p
        v-if="fieldErrors.amount"
        id="entry-amount-error"
        class="field-error"
      >
        {{ fieldErrors.amount }}
      </p>
    </div>

    <div class="form-row two-columns">
      <div>
        <label for="entry-currency">Currency</label>
        <input
          id="entry-currency"
          v-model="form.originalCurrency"
          maxlength="3"
          :aria-invalid="fieldErrors.originalCurrency ? 'true' : 'false'"
          aria-describedby="entry-currency-error"
        >
      </div>
      <div>
        <label for="entry-fx-rate">FX rate</label>
        <input
          id="entry-fx-rate"
          v-model="form.fxRate"
          inputmode="decimal"
          :placeholder="form.originalCurrency === ledgerBaseCurrency ? '1.0' : ''"
          :aria-invalid="fieldErrors.fxRate ? 'true' : 'false'"
          aria-describedby="entry-fx-error"
        >
      </div>
      <p
        v-if="fieldErrors.originalCurrency"
        id="entry-currency-error"
        class="field-error span-columns"
      >
        {{ fieldErrors.originalCurrency }}
      </p>
      <p
        v-if="fieldErrors.fxRate"
        id="entry-fx-error"
        class="field-error span-columns"
      >
        {{ fieldErrors.fxRate }}
      </p>
    </div>

    <div class="form-row">
      <label for="entry-category">Category</label>
      <select
        id="entry-category"
        v-model="form.categoryId"
        :aria-invalid="fieldErrors.categoryId ? 'true' : 'false'"
        aria-describedby="entry-category-error"
      >
        <option value="">
          Select category
        </option>
        <option
          v-for="category in categories"
          :key="category.id"
          :value="category.id"
        >
          {{ category.name }}
        </option>
      </select>
      <div
        v-if="recentCategories.length > 0"
        class="chip-row"
        aria-label="Recent categories"
      >
        <button
          v-for="category in recentCategories"
          :key="category.id"
          type="button"
          class="chip-button"
          @click="form.categoryId = category.id"
        >
          {{ category.name }}
        </button>
      </div>
      <p
        v-if="fieldErrors.categoryId"
        id="entry-category-error"
        class="field-error"
      >
        {{ fieldErrors.categoryId }}
      </p>
    </div>

    <div class="form-row">
      <label for="entry-member">Member</label>
      <select
        id="entry-member"
        v-model="form.memberId"
        :aria-invalid="fieldErrors.memberId ? 'true' : 'false'"
        aria-describedby="entry-member-error"
      >
        <option value="">
          Select member
        </option>
        <option
          v-for="member in members"
          :key="member.id"
          :value="member.id"
        >
          {{ member.name }}
        </option>
      </select>
      <p
        v-if="fieldErrors.memberId"
        id="entry-member-error"
        class="field-error"
      >
        {{ fieldErrors.memberId }}
      </p>
    </div>

    <div class="form-row two-columns">
      <div>
        <label for="entry-merchant">Merchant</label>
        <select
          id="entry-merchant"
          v-model="form.merchantId"
        >
          <option value="">
            None
          </option>
          <option
            v-for="merchant in merchants"
            :key="merchant.id"
            :value="merchant.id"
          >
            {{ merchant.name }}
          </option>
        </select>
      </div>
      <div>
        <label for="entry-project">Project</label>
        <select
          id="entry-project"
          v-model="form.projectId"
        >
          <option value="">
            None
          </option>
          <option
            v-for="project in projects"
            :key="project.id"
            :value="project.id"
          >
            {{ project.name }}
          </option>
        </select>
      </div>
      <div
        v-if="recentMerchants.length > 0"
        class="chip-row"
        aria-label="Recent merchants"
      >
        <button
          v-for="merchant in recentMerchants"
          :key="merchant.id"
          type="button"
          class="chip-button"
          @click="form.merchantId = merchant.id"
        >
          {{ merchant.name }}
        </button>
      </div>
      <div
        v-if="recentProjects.length > 0"
        class="chip-row"
        aria-label="Recent projects"
      >
        <button
          v-for="project in recentProjects"
          :key="project.id"
          type="button"
          class="chip-button"
          @click="form.projectId = project.id"
        >
          {{ project.name }}
        </button>
      </div>
    </div>

    <div class="form-row">
      <label for="entry-note">Note</label>
      <textarea
        id="entry-note"
        v-model="form.note"
        rows="3"
        :aria-invalid="fieldErrors.note ? 'true' : 'false'"
        aria-describedby="entry-note-error"
      />
      <p
        v-if="fieldErrors.note"
        id="entry-note-error"
        class="field-error"
      >
        {{ fieldErrors.note }}
      </p>
    </div>

    <div class="button-row">
      <button
        type="submit"
        :disabled="submitting"
      >
        {{ saveLabel }}
      </button>
      <button
        v-if="isEditing"
        type="button"
        class="secondary-button"
        @click="emit('cancel')"
      >
        Cancel
      </button>
    </div>
  </form>
</template>
