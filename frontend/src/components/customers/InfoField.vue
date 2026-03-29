<template>
  <div v-if="value">
    <div class="label">{{ label }}</div>
    <div class="text-sm text-slate-200">{{ value }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; value?: string | null }>()
</script>
