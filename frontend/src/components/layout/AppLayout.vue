<template>
  <div class="flex h-screen overflow-hidden bg-slate-900">
    <AppSidebar />
    <main class="flex-1 overflow-y-auto">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { RouterView } from 'vue-router'
import { useRestaurantStore } from '@/stores/restaurant'
import AppSidebar from './AppSidebar.vue'

const route = useRoute()
const restaurantStore = useRestaurantStore()

// Load restaurant data when restaurantId changes
watch(
  () => route.params.restaurantId as string,
  (id) => {
    if (id) restaurantStore.fetchOne(id)
  },
  { immediate: true },
)
</script>
