<template>
  <div class="card p-4 text-center">
    <div class="text-2xl mb-1">{{ icon }}</div>
    <div class="text-2xl font-bold" :class="color">{{ value }}</div>
    <div class="text-xs text-slate-400 mt-1">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; value: number; icon: string; color: string }>()
</script>
