<template>
  <RouterLink
    :to="to"
    class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
    :class="isActive
      ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700'"
  >
    <component :is="iconComponent" class="w-5 h-5 shrink-0" />
    <span class="hidden lg:block">{{ label }}</span>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import IconHome from '@/components/icons/IconHome.vue'
import IconCalendar from '@/components/icons/IconCalendar.vue'
import IconMap from '@/components/icons/IconMap.vue'
import IconUsers from '@/components/icons/IconUsers.vue'
import IconChart from '@/components/icons/IconChart.vue'
import IconSettings from '@/components/icons/IconSettings.vue'

const props = defineProps<{ to: string; icon: string; label: string }>()
const route = useRoute()

const isActive = computed(() => route.path === props.to || (props.to !== '/' && route.path.startsWith(props.to)))

const iconMap: Record<string, any> = {
  home: IconHome,
  calendar: IconCalendar,
  map: IconMap,
  users: IconUsers,
  chart: IconChart,
  settings: IconSettings,
}
const iconComponent = computed(() => iconMap[props.icon])
</script>
