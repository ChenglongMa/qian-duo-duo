<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { loginRequestSchema, type LoginRequest } from '@qdd/shared';

const emit = defineEmits<{
  submit: [payload: LoginRequest];
}>();

const form = reactive({
  username: '',
  password: ''
});

const fieldErrors = ref<Record<string, string>>({});

const hasErrors = computed(() => Object.keys(fieldErrors.value).length > 0);

function submit(): void {
  const result = loginRequestSchema.safeParse(form);
  if (!result.success) {
    fieldErrors.value = Object.fromEntries(
      result.error.issues.map((issue) => [String(issue.path[0] ?? 'form'), issue.message])
    );
    return;
  }

  fieldErrors.value = {};
  emit('submit', result.data);
}
</script>

<template>
  <form
    class="login-form"
    aria-label="Admin login"
    novalidate
    @submit.prevent="submit"
  >
    <div class="form-row">
      <label for="admin-username">Admin username</label>
      <input
        id="admin-username"
        v-model="form.username"
        autocomplete="username"
        :aria-invalid="fieldErrors.username ? 'true' : 'false'"
        aria-describedby="admin-username-error"
      >
      <p
        v-if="fieldErrors.username"
        id="admin-username-error"
        class="field-error"
      >
        {{ fieldErrors.username }}
      </p>
    </div>

    <div class="form-row">
      <label for="admin-password">Password</label>
      <input
        id="admin-password"
        v-model="form.password"
        type="password"
        autocomplete="current-password"
        :aria-invalid="fieldErrors.password ? 'true' : 'false'"
        aria-describedby="admin-password-error"
      >
      <p
        v-if="fieldErrors.password"
        id="admin-password-error"
        class="field-error"
      >
        {{ fieldErrors.password }}
      </p>
    </div>

    <p
      v-if="hasErrors && !fieldErrors.username && !fieldErrors.password"
      class="field-error"
      role="alert"
    >
      Check the login fields.
    </p>

    <button type="submit">
      Sign in
    </button>
  </form>
</template>
