<template>
  <div class="space-y-2">

    <!-- Onglets salles -->
    <div v-if="rooms.length > 1" class="flex gap-1 flex-wrap">
      <button
        v-for="room in rooms"
        :key="room.id"
        @click="selectedRoomId = room.id"
        class="px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
        :class="selectedRoomId === room.id
          ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
          : 'text-slate-400 hover:bg-slate-700 border border-transparent'"
      >
        {{ room.name }}
      </button>
    </div>

    <!-- Mini canvas -->
    <div class="relative rounded-lg overflow-hidden bg-slate-950 border border-slate-700 cursor-pointer"
      ref="miniContainerRef"
      :style="{ height: '180px' }">

      <v-stage v-if="miniContainerWidth > 0" :config="miniStageConfig">
        <v-layer>
          <v-rect :config="{ x: 0, y: 0, width: miniStageConfig.width, height: miniStageConfig.height, fill: '#020617' }" />
          <v-group
            v-for="table in currentRoom?.tables ?? []"
            :key="table.id"
            :config="{ x: table.x * miniScale, y: table.y * miniScale, rotation: table.rotation }"
            @click="() => toggleTable(table.id)"
          >
            <v-rect
              v-if="table.shape !== 'CIRCLE'"
              :config="tableRectConfig(table, false)"
            />
            <v-circle
              v-else
              :config="tableCircleConfig(table, false)"
            />
            <v-text :config="tableLabelConfig(table, false)" />
          </v-group>
        </v-layer>
      </v-stage>

      <!-- Bouton plein écran -->
      <button
        @click.stop="isFullscreen = true"
        class="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800/90 border border-slate-600 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
        title="Plein écran"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </button>

      <!-- Aucune table -->
      <div v-if="!currentRoom?.tables?.length"
        class="absolute inset-0 flex items-center justify-center text-xs text-slate-600">
        Aucune table dans cette salle
      </div>
    </div>

    <!-- Légende -->
    <div class="flex items-center gap-4 text-xs text-slate-500">
      <span class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded bg-slate-700 border border-slate-500 inline-block"></span> Libre
      </span>
      <span class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded border inline-block" style="background:rgba(245,158,11,0.25);border-color:rgba(245,158,11,0.6)"></span> Sélectionnée
      </span>
      <span class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded border inline-block" style="background:rgba(239,68,68,0.15);border-color:rgba(239,68,68,0.4)"></span> Occupée
      </span>
    </div>

    <!-- Plein écran (Teleport) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isFullscreen"
          class="fixed inset-0 z-[200] bg-slate-900 flex flex-col">

          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700 shrink-0">
            <div class="flex items-center gap-4">
              <h3 class="font-semibold text-slate-100">Sélection des tables</h3>
              <!-- Onglets salles -->
              <div v-if="rooms.length > 1" class="flex gap-1">
                <button
                  v-for="room in rooms"
                  :key="room.id"
                  @click="selectedRoomId = room.id"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  :class="selectedRoomId === room.id
                    ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                    : 'text-slate-400 hover:bg-slate-700 border border-transparent'"
                >
                  {{ room.name }}
                </button>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <!-- Légende -->
              <div class="hidden md:flex items-center gap-4 text-xs text-slate-500">
                <span class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded bg-slate-700 border border-slate-500 inline-block"></span> Libre
                </span>
                <span class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded border inline-block" style="background:rgba(245,158,11,0.25);border-color:rgba(245,158,11,0.6)"></span> Sélectionnée
                </span>
                <span class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded border inline-block" style="background:rgba(239,68,68,0.15);border-color:rgba(239,68,68,0.4)"></span> Occupée
                </span>
              </div>
              <div class="text-sm text-slate-400">
                {{ modelValue.length }} table(s) sélectionnée(s)
              </div>
              <button @click="isFullscreen = false" class="btn-primary">
                Confirmer
              </button>
            </div>
          </div>

          <!-- Canvas plein écran -->
          <div class="flex-1 relative overflow-hidden bg-slate-950 cursor-pointer" ref="fullContainerRef">
            <v-stage v-if="fullContainerSize.width > 0" :config="fullStageConfig">
              <v-layer>
                <v-rect :config="{ x: 0, y: 0, width: fullStageConfig.width, height: fullStageConfig.height, fill: '#020617' }" />
                <v-group
                  v-for="table in currentRoom?.tables ?? []"
                  :key="table.id + '-full'"
                  :config="{ x: table.x * fullScale, y: table.y * fullScale, rotation: table.rotation }"
                  @click="() => toggleTable(table.id)"
                >
                  <v-rect
                    v-if="table.shape !== 'CIRCLE'"
                    :config="tableRectConfig(table, true)"
                  />
                  <v-circle
                    v-else
                    :config="tableCircleConfig(table, true)"
                  />
                  <v-text :config="tableLabelConfig(table, true)" />
                  <v-text :config="tablePaxConfig(table, true)" />
                </v-group>
              </v-layer>
            </v-stage>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { Room, Table } from '@/types'

const props = defineProps<{
  rooms: Room[]
  modelValue: string[]        // tableIds sélectionnées
  busyTableIds?: string[]     // tables déjà occupées (autre résa)
}>()

const emit = defineEmits<{ 'update:modelValue': [ids: string[]] }>()

// ── State ─────────────────────────────────

const selectedRoomId = ref(props.rooms[0]?.id ?? '')
const isFullscreen = ref(false)

const miniContainerRef = ref<HTMLElement>()
const fullContainerRef = ref<HTMLElement>()
const miniContainerWidth = ref(0)
const fullContainerSize = ref({ width: 0, height: 0 })

const currentRoom = computed(() => props.rooms.find((r) => r.id === selectedRoomId.value))

watch(() => props.rooms, (r) => {
  if (r.length && !selectedRoomId.value) selectedRoomId.value = r[0].id
}, { immediate: true })

// ── Scaling ───────────────────────────────

const MINI_HEIGHT = 180

const miniScale = computed(() => {
  const room = currentRoom.value
  if (!room || !miniContainerWidth.value) return 1
  const sx = miniContainerWidth.value / room.canvasWidth
  const sy = MINI_HEIGHT / room.canvasHeight
  return Math.min(sx, sy, 1)
})

const miniStageConfig = computed(() => ({
  width: miniContainerWidth.value,
  height: MINI_HEIGHT,
}))

const fullScale = computed(() => {
  const room = currentRoom.value
  if (!room || !fullContainerSize.value.width) return 1
  const sx = fullContainerSize.value.width / room.canvasWidth
  const sy = fullContainerSize.value.height / room.canvasHeight
  return Math.min(sx, sy, 0.95)
})

const fullStageConfig = computed(() => ({
  width: fullContainerSize.value.width,
  height: fullContainerSize.value.height,
}))

// ── ResizeObserver ────────────────────────

let miniObserver: ResizeObserver
let fullObserver: ResizeObserver

onMounted(() => {
  if (miniContainerRef.value) {
    miniObserver = new ResizeObserver((entries) => {
      miniContainerWidth.value = entries[0].contentRect.width
    })
    miniObserver.observe(miniContainerRef.value)
    miniContainerWidth.value = miniContainerRef.value.getBoundingClientRect().width
  }
})

watch(isFullscreen, (val) => {
  if (!val) return
  // Wait for DOM
  setTimeout(() => {
    if (fullContainerRef.value) {
      const rect = fullContainerRef.value.getBoundingClientRect()
      fullContainerSize.value = { width: rect.width, height: rect.height }
      fullObserver = new ResizeObserver((entries) => {
        const { width, height } = entries[0].contentRect
        fullContainerSize.value = { width, height }
      })
      fullObserver.observe(fullContainerRef.value)
    }
  }, 50)
}, { flush: 'post' })

onUnmounted(() => {
  miniObserver?.disconnect()
  fullObserver?.disconnect()
})

// ── Table colors ──────────────────────────

function tableColor(tableId: string) {
  if (props.modelValue.includes(tableId)) return { fill: 'rgba(245,158,11,0.25)', stroke: 'rgba(245,158,11,0.8)', strokeWidth: 2 }
  if (props.busyTableIds?.includes(tableId)) return { fill: 'rgba(239,68,68,0.15)', stroke: 'rgba(239,68,68,0.5)', strokeWidth: 1 }
  return { fill: '#1e293b', stroke: '#334155', strokeWidth: 1 }
}

// ── Konva configs ─────────────────────────

function tableRectConfig(table: Table, full: boolean) {
  const scale = full ? fullScale.value : miniScale.value
  const colors = tableColor(table.id)
  return {
    x: 0,
    y: 0,
    width: table.width * scale,
    height: table.height * scale,
    fill: colors.fill,
    stroke: colors.stroke,
    strokeWidth: colors.strokeWidth,
    cornerRadius: 4,
  }
}

function tableCircleConfig(table: Table, full: boolean) {
  const scale = full ? fullScale.value : miniScale.value
  const colors = tableColor(table.id)
  return {
    x: (table.width / 2) * scale,
    y: (table.height / 2) * scale,
    radius: (Math.min(table.width, table.height) / 2) * scale,
    fill: colors.fill,
    stroke: colors.stroke,
    strokeWidth: colors.strokeWidth,
  }
}

function tableLabelConfig(table: Table, full: boolean) {
  const scale = full ? fullScale.value : miniScale.value
  const w = table.width * scale
  const h = table.height * scale
  return {
    x: 0,
    y: h / 2 - (full ? 8 : 6),
    width: w,
    text: table.name,
    fontSize: full ? 13 : 9,
    fontStyle: 'bold',
    fill: '#f1f5f9',
    align: 'center',
    listening: false,
  }
}

function tablePaxConfig(table: Table, full: boolean) {
  const scale = full ? fullScale.value : miniScale.value
  const w = table.width * scale
  const h = table.height * scale
  return {
    x: 0,
    y: h / 2 + 4,
    width: w,
    text: `${table.capacity}p`,
    fontSize: 10,
    fill: '#94a3b8',
    align: 'center',
    listening: false,
  }
}

// ── Actions ───────────────────────────────

function toggleTable(tableId: string) {
  const current = [...props.modelValue]
  const idx = current.indexOf(tableId)
  if (idx === -1) current.push(tableId)
  else current.splice(idx, 1)
  emit('update:modelValue', current)
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
