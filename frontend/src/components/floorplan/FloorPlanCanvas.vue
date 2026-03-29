<template>
  <div class="w-full h-full" ref="containerRef">
    <v-stage
      :config="stageConfig"
      @mousedown="handleStageClick"
    >
      <!-- Background grid -->
      <v-layer>
        <v-rect :config="{ x: 0, y: 0, width: stageConfig.width, height: stageConfig.height, fill: '#0f172a' }" />
        <!-- Grid lines (every 50px) -->
        <template v-for="i in gridLinesH" :key="`h${i}`">
          <v-line :config="{ points: [0, i * 50, stageConfig.width, i * 50], stroke: '#1e293b', strokeWidth: 1 }" />
        </template>
        <template v-for="i in gridLinesV" :key="`v${i}`">
          <v-line :config="{ points: [i * 50, 0, i * 50, stageConfig.height], stroke: '#1e293b', strokeWidth: 1 }" />
        </template>
      </v-layer>

      <!-- Tables layer -->
      <v-layer>
        <template v-for="table in tables" :key="table.id">
          <TableShape
            :table="table"
            :selected="selectedTableId === table.id"
            :mode="mode"
            :booking="getTableBooking(table.id)"
            @dragend="(pos) => $emit('table-moved', table.id, pos.x, pos.y, table.rotation)"
            @click="$emit('table-selected', table.id)"
          />
        </template>
      </v-layer>
    </v-stage>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Table, Booking, Room } from '@/types'
import TableShape from './TableShape.vue'

const props = defineProps<{
  room: Room
  tables: Table[]
  mode: 'edit' | 'service'
  selectedTableId: string | null
  bookings: Booking[]
}>()

defineEmits<{
  'table-moved': [tableId: string, x: number, y: number, rotation: number]
  'table-selected': [tableId: string]
}>()

const containerRef = ref<HTMLElement>()
const containerSize = ref({ width: 800, height: 600 })

const stageConfig = computed(() => ({
  width: containerSize.value.width,
  height: containerSize.value.height,
}))

const gridLinesH = computed(() => Math.ceil(containerSize.value.height / 50))
const gridLinesV = computed(() => Math.ceil(containerSize.value.width / 50))

function getTableBooking(tableId: string): Booking | undefined {
  return props.bookings.find((b) =>
    b.bookingTables?.some((bt) => bt.tableId === tableId) &&
    !['CANCELLED', 'NO_SHOW', 'DONE'].includes(b.status),
  )
}

function handleStageClick() {
  // Deselect when clicking on empty space
}

// Observe container size
let resizeObserver: ResizeObserver
onMounted(() => {
  if (containerRef.value) {
    resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      containerSize.value = { width, height }
    })
    resizeObserver.observe(containerRef.value)
    const rect = containerRef.value.getBoundingClientRect()
    containerSize.value = { width: rect.width, height: rect.height }
  }
})

onUnmounted(() => resizeObserver?.disconnect())
</script>
