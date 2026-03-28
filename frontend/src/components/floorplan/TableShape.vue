<template>
  <v-group
    :config="groupConfig"
    @dragend="handleDragEnd"
    @click="$emit('click')"
  >
    <!-- Table body -->
    <v-rect
      v-if="table.shape !== 'CIRCLE'"
      :config="rectConfig"
    />
    <v-circle
      v-else
      :config="circleConfig"
    />

    <!-- Table name -->
    <v-text :config="labelConfig" />

    <!-- Pax count (small) -->
    <v-text :config="paxConfig" />

    <!-- Booking customer name (service mode) -->
    <v-text v-if="booking && mode === 'service'" :config="customerConfig" />

    <!-- Selection indicator -->
    <v-rect v-if="selected" :config="selectionConfig" />
  </v-group>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Table, Booking } from '@/types'

const props = defineProps<{
  table: Table
  selected: boolean
  mode: 'edit' | 'service'
  booking?: Booking
}>()

const emit = defineEmits<{
  dragend: [pos: { x: number; y: number }]
  click: []
}>()

// Color based on booking status in service mode
const fillColor = computed(() => {
  if (props.mode === 'edit') {
    return props.selected ? '#6366f1' : '#1e293b'
  }
  if (!props.booking) return '#1e293b' // libre
  const statusColors: Record<string, string> = {
    RESERVED: '#1d4ed8',
    CONFIRMED: '#4338ca',
    ARRIVED: '#d97706',
    SEATED: '#15803d',
    DONE: '#374151',
    WAITING: '#a16207',
  }
  return statusColors[props.booking.status] || '#1e293b'
})

const strokeColor = computed(() => {
  if (props.selected) return '#f59e0b'
  if (props.booking) return 'transparent'
  return '#334155'
})

const groupConfig = computed(() => ({
  x: props.table.x,
  y: props.table.y,
  rotation: props.table.rotation,
  draggable: props.mode === 'edit',
}))

const rectConfig = computed(() => ({
  x: 0,
  y: 0,
  width: props.table.width,
  height: props.table.height,
  fill: fillColor.value,
  stroke: strokeColor.value,
  strokeWidth: props.selected ? 2 : 1,
  cornerRadius: props.table.shape === 'SQUARE' ? 4 : 6,
  shadowColor: props.selected ? '#f59e0b' : 'transparent',
  shadowBlur: props.selected ? 8 : 0,
}))

const circleConfig = computed(() => ({
  x: props.table.width / 2,
  y: props.table.height / 2,
  radius: Math.min(props.table.width, props.table.height) / 2,
  fill: fillColor.value,
  stroke: strokeColor.value,
  strokeWidth: props.selected ? 2 : 1,
  shadowColor: props.selected ? '#f59e0b' : 'transparent',
  shadowBlur: props.selected ? 8 : 0,
}))

const labelConfig = computed(() => ({
  x: 0,
  y: props.table.height / 2 - 10,
  width: props.table.width,
  text: props.table.name,
  fontSize: 13,
  fontStyle: 'bold',
  fill: '#f1f5f9',
  align: 'center',
  listening: false,
}))

const paxConfig = computed(() => ({
  x: 0,
  y: props.table.height / 2 + 4,
  width: props.table.width,
  text: `${props.table.capacity}p`,
  fontSize: 10,
  fill: '#94a3b8',
  align: 'center',
  listening: false,
}))

const customerConfig = computed(() => ({
  x: 2,
  y: 4,
  width: props.table.width - 4,
  text: props.booking ? `${props.booking.customer?.lastName || ''}`.substring(0, 10) : '',
  fontSize: 9,
  fill: '#fcd34d',
  align: 'center',
  listening: false,
}))

const selectionConfig = computed(() => ({
  x: -2,
  y: -2,
  width: props.table.width + 4,
  height: props.table.height + 4,
  stroke: '#f59e0b',
  strokeWidth: 1.5,
  cornerRadius: 8,
  dash: [4, 3],
  fill: 'transparent',
  listening: false,
}))

function handleDragEnd(e: any) {
  emit('dragend', { x: e.target.x(), y: e.target.y() })
}
</script>
