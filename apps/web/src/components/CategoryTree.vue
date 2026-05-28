<script setup lang="ts">
import type { CategoryTreeNode } from '@qdd/shared';

defineProps<{
  nodes: CategoryTreeNode[];
}>();
</script>

<template>
  <ul class="category-tree">
    <li
      v-for="node in nodes"
      :key="node.id"
      class="category-tree__item"
      :class="{ 'category-tree__item--inactive': node.status === 'inactive' }"
    >
      <div class="category-tree__row">
        <span class="category-tree__name">{{ node.name }}</span>
        <span class="category-tree__key">{{ node.stableKey }}</span>
      </div>
      <CategoryTree
        v-if="node.children.length > 0"
        :nodes="node.children"
      />
    </li>
  </ul>
</template>
