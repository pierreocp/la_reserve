<template>
  <div class="flex h-full">
    <!-- Sidebar -->
    <div class="w-64 border-r border-slate-700 flex flex-col shrink-0">
      <!-- Room selector -->
      <div class="p-4 border-b border-slate-700">
        <label class="label">Salle</label>
        <select v-model="selectedRoomId" class="input text-sm">
          <option v-for="room in rooms" :key="room.id" :value="room.id">
            {{ room.name }} {{ room.floor > 0 ? `(étage ${room.floor})` : '(RDC)' }}
          </option>
        </select>
      </div>

      <!-- Mode toggle -->
      <div class="p-4 border-b border-slate-700">
        <div class="flex rounded-lg overflow-hidden border border-slate-600">
          <button
            @click="mode = 'edit'"
            class="flex-1 py-1.5 text-xs font-medium transition-colors"
            :class="mode === 'edit' ? 'bg-brand-500 text-slate-900' : 'text-slate-400 hover:bg-slate-700'"
          >
            ✏️ Édition
          </button>
          <button
            @click="mode = 'service'"
            class="flex-1 py-1.5 text-xs font-medium transition-colors"
            :class="mode === 'service' ? 'bg-brand-500 text-slate-900' : 'text-slate-400 hover:bg-slate-700'"
          >
            🍽 Service
          </button>
        </div>
      </div>

      <!-- Edit mode: add table controls -->
      <div v-if="mode === 'edit'" class="p-4 space-y-3 border-b border-slate-700">
        <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ajouter une table</div>
        <div>
          <label class="label">Nom</label>
          <input v-model="newTable.name" type="text" class="input text-sm" placeholder="Table 1" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="label">Capacité</label>
            <input v-model.number="newTable.capacity" type="number" min="1" max="30" class="input text-sm" />
          </div>
          <div>
            <label class="label">Forme</label>
            <select v-model="newTable.shape" class="input text-sm">
              <option value="RECTANGLE">Rectangle</option>
              <option value="SQUARE">Carré</option>
              <option value="CIRCLE">Rond</option>
            </select>
          </div>
        </div>
        <button @click="addTable" class="btn-primary w-full justify-center text-sm" :disabled="!selectedRoomId || !newTable.name">
          Ajouter
        </button>
      </div>

      <!-- Table list -->
      <div class="flex-1 overflow-y-auto p-3 space-y-1">
        <div v-if="!currentTables.length" class="text-xs text-slate-500 text-center py-4">
          Aucune table dans cette salle
        </div>
        <div
          v-else
          v-for="table in currentTables"
          :key="table.id"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm group"
          :class="selectedTableId === table.id ? 'bg-brand-500/20 border border-brand-500/30 text-brand-300' : 'text-slate-300 hover:bg-slate-700'"
          @click="selectedTableId = table.id"
        >
          <span class="flex-1 truncate">{{ table.name }}</span>
          <span class="text-xs text-slate-500">{{ table.capacity }}p</span>
          <button
            v-if="mode === 'edit'"
            @click.stop="removeTable(table.id)"
            class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <!-- Save layout button -->
      <div v-if="mode === 'edit' && hasUnsavedChanges" class="p-3 border-t border-slate-700">
        <button @click="saveLayout" class="btn-primary w-full justify-center text-sm" :disabled="saving">
          {{ saving ? 'Enregistrement...' : '💾 Enregistrer le plan' }}
        </button>
      </div>
    </div>

    <!-- Canvas -->
    <div class="flex-1 relative overflow-hidden bg-slate-950" ref="canvasContainer">
      <FloorPlanCanvas
        v-if="selectedRoomId && currentRoom"
        :room="currentRoom"
        :tables="currentTables"
        :mode="mode"
        :selected-table-id="selectedTableId"
        :bookings="todayBookings"
        @table-moved="handleTableMoved"
        @table-selected="selectedTableId = $event"
      />
      <div v-else class="flex items-center justify-center h-full text-slate-600">
        Sélectionnez une salle pour afficher le plan
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/lib/api'
import { useRestaurantStore } from '@/stores/restaurant'
import { useBookingsStore } from '@/stores/bookings'
import type { Table, Room } from '@/types'
import FloorPlanCanvas from '@/components/floorplan/FloorPlanCanvas.vue'
import { getTableDimensions } from '@/utils/tableSize'
import dayjs from 'dayjs'

const route = useRoute()
const restaurantStore = useRestaurantStore()
const bookingsStore = useBookingsStore()

const restaurantId = computed(() => route.params.restaurantId as string)
const rooms = computed(() => restaurantStore.current?.rooms || [])
const selectedRoomId = ref<string | null>(null)
const selectedTableId = ref<string | null>(null)
const mode = ref<'edit' | 'service'>('edit')
const saving = ref(false)
const hasUnsavedChanges = ref(false)

const newTable = ref({ name: '', capacity: 2, shape: 'RECTANGLE' as const })
const pendingPositions = ref<Map<string, { x: number; y: number; rotation: number }>>(new Map())

const currentRoom = computed(() => rooms.value.find((r) => r.id === selectedRoomId.value))
const currentTables = computed(() => currentRoom.value?.tables || [])

const todayBookings = computed(() => {
  if (mode.value !== 'service') return []
  return bookingsStore.bookings
})

watch(rooms, (r) => {
  if (r.length && !selectedRoomId.value) selectedRoomId.value = r[0].id
}, { immediate: true })

watch(mode, (m) => {
  if (m === 'service') {
    bookingsStore.fetchByDate(restaurantId.value, dayjs().format('YYYY-MM-DD'))
  }
})

async function addTable() {
  if (!selectedRoomId.value || !newTable.value.name) return
  try {
    const { width, height } = getTableDimensions(newTable.value.capacity, newTable.value.shape)
    await api.post(`/rooms/${selectedRoomId.value}/tables`, {
      name: newTable.value.name,
      capacity: newTable.value.capacity,
      shape: newTable.value.shape,
      width,
      height,
      x: 80 + Math.random() * 500,
      y: 80 + Math.random() * 300,
    })
    newTable.value = { name: '', capacity: 2, shape: 'RECTANGLE' }
    await restaurantStore.fetchOne(restaurantId.value)
  } catch (e) {
    console.error(e)
  }
}

async function removeTable(tableId: string) {
  if (!confirm('Supprimer cette table ?')) return
  await api.delete(`/rooms/${selectedRoomId.value}/tables/${tableId}`)
  await restaurantStore.fetchOne(restaurantId.value)
}

function handleTableMoved(tableId: string, x: number, y: number, rotation: number) {
  pendingPositions.value.set(tableId, { x, y, rotation })
  hasUnsavedChanges.value = true
}

async function saveLayout() {
  if (!selectedRoomId.value || pendingPositions.value.size === 0) return
  saving.value = true
  try {
    const tables = Array.from(pendingPositions.value.entries()).map(([id, pos]) => ({ id, ...pos }))
    await api.put(`/rooms/${selectedRoomId.value}/tables/bulk-positions`, { tables })
    pendingPositions.value.clear()
    hasUnsavedChanges.value = false
    await restaurantStore.fetchOne(restaurantId.value)
  } finally {
    saving.value = false
  }
}
</script>
