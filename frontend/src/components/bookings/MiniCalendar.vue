<template>
  <div class="select-none">
    <!-- Month nav -->
    <div class="flex items-center justify-between mb-3">
      <button @click="prevMonth" class="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
      </button>
      <span class="text-sm font-medium text-slate-200 capitalize">{{ monthLabel }}</span>
      <button @click="nextMonth" class="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>

    <!-- Day headers -->
    <div class="grid grid-cols-7 mb-1">
      <div v-for="d in dayHeaders" :key="d" class="text-center text-xs text-slate-500 py-1 font-medium">{{ d }}</div>
    </div>

    <!-- Days grid -->
    <div class="grid grid-cols-7 gap-0.5">
      <div v-for="(day, i) in calendarDays" :key="i" class="aspect-square flex items-center justify-center">
        <button
          v-if="day"
          @click="selectDay(day)"
          class="w-7 h-7 rounded-lg text-xs transition-colors"
          :class="dayClass(day)"
        >
          {{ day.date() }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/fr'

dayjs.locale('fr')

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const viewMonth = ref(dayjs(props.modelValue).startOf('month'))
const today = dayjs().format('YYYY-MM-DD')

const monthLabel = computed(() => viewMonth.value.format('MMMM YYYY'))
const dayHeaders = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

const calendarDays = computed((): (Dayjs | null)[] => {
  const start = viewMonth.value.startOf('month')
  const end = viewMonth.value.endOf('month')
  const days: (Dayjs | null)[] = []

  // Pad start (Mon=0)
  const startDow = (start.day() + 6) % 7
  for (let i = 0; i < startDow; i++) days.push(null)

  for (let d = start; !d.isAfter(end); d = d.add(1, 'day')) {
    days.push(d)
  }
  return days
})

function prevMonth() { viewMonth.value = viewMonth.value.subtract(1, 'month') }
function nextMonth() { viewMonth.value = viewMonth.value.add(1, 'month') }
function selectDay(day: Dayjs) { emit('update:modelValue', day.format('YYYY-MM-DD')) }

function dayClass(day: Dayjs) {
  const key = day.format('YYYY-MM-DD')
  if (key === props.modelValue) return 'bg-brand-500 text-slate-900 font-semibold'
  if (key === today) return 'text-brand-400 border border-brand-500/40 hover:bg-slate-700'
  return 'text-slate-300 hover:bg-slate-700'
}
</script>
