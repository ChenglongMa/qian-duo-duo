<script setup lang="ts">
type ServiceState = {
  name: string;
  state: string;
  detail: string;
};

const serviceStates: ServiceState[] = [
  {
    name: 'API',
    state: 'Ready',
    detail: '/health'
  },
  {
    name: 'Postgres',
    state: 'Compose',
    detail: 'qdd_dev'
  },
  {
    name: 'Redis',
    state: 'Compose',
    detail: '6379'
  }
];
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
      <span class="status-pill">Milestone 0</span>
    </section>

    <section
      class="status-grid"
      aria-label="Service status"
    >
      <article
        v-for="service in serviceStates"
        :key="service.name"
        class="status-card"
      >
        <div class="status-card__topline">
          <h2>{{ service.name }}</h2>
          <span>{{ service.state }}</span>
        </div>
        <p>{{ service.detail }}</p>
      </article>
    </section>
  </main>
</template>
