<template>
  <div class="flex h-full" @keydown.delete.prevent="onDeleteKey" tabindex="-1">

    <!-- ── Sidebar gauche ── -->
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
          <button @click="mode = 'edit'"
            class="flex-1 py-1.5 text-xs font-medium transition-colors"
            :class="mode === 'edit' ? 'bg-brand-500 text-slate-900' : 'text-slate-400 hover:bg-slate-700'">
            ✏️ Édition
          </button>
          <button @click="mode = 'service'"
            class="flex-1 py-1.5 text-xs font-medium transition-colors"
            :class="mode === 'service' ? 'bg-brand-500 text-slate-900' : 'text-slate-400 hover:bg-slate-700'">
            🍽 Service
          </button>
        </div>
      </div>

      <!-- Mode édition : ajouter une table -->
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
        <button @click="addTable" class="btn-primary w-full justify-center text-sm"
          :disabled="!selectedRoomId || !newTable.name">
          Ajouter
        </button>
      </div>

      <!-- Liste des tables -->
      <div class="flex-1 overflow-y-auto p-3 space-y-1">
        <div v-if="!currentTables.length" class="text-xs text-slate-500 text-center py-4">
          Aucune table dans cette salle
        </div>
        <div v-else v-for="table in currentTables" :key="table.id"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm group cursor-pointer"
          :class="selectedTableId === table.id
            ? 'bg-brand-500/20 border border-brand-500/30 text-brand-300'
            : 'text-slate-300 hover:bg-slate-700'"
          @click="selectedTableId = table.id">
          <!-- Indicateur statut en mode service -->
          <span v-if="mode === 'service'" class="w-2 h-2 rounded-full shrink-0"
            :style="{ background: tableStatusColor(table.id) }"></span>
          <span class="flex-1 truncate">{{ table.name }}</span>
          <span class="text-xs text-slate-500">{{ table.capacity }}p</span>
          <button v-if="mode === 'edit'" @click.stop="askDeleteTable(table.id, table.name)"
            class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Enregistrer le plan -->
      <div v-if="mode === 'edit' && hasUnsavedChanges" class="p-3 border-t border-slate-700">
        <button @click="saveLayout" class="btn-primary w-full justify-center text-sm" :disabled="saving">
          {{ saving ? 'Enregistrement...' : '💾 Enregistrer le plan' }}
        </button>
      </div>
    </div>

    <!-- ── Canvas ── -->
    <div class="flex-1 relative overflow-hidden bg-slate-950">
      <FloorPlanCanvas
        v-if="selectedRoomId && currentRoom"
        :room="currentRoom"
        :tables="currentTables"
        :mode="mode"
        :selected-table-id="selectedTableId"
        :bookings="todayBookings"
        @table-moved="handleTableMoved"
        @table-selected="handleTableSelected"
      />
      <div v-else class="flex items-center justify-center h-full text-slate-600">
        Sélectionnez une salle pour afficher le plan
      </div>

      <!-- Hint Suppr en mode édition -->
      <div v-if="mode === 'edit' && selectedTableId"
        class="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-800/90 border border-slate-600 rounded-lg text-xs text-slate-400 pointer-events-none">
        <kbd class="font-mono bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">Suppr</kbd>
        pour supprimer la table sélectionnée
      </div>
    </div>

    <!-- ── Panneau service (droite) ── -->
    <Transition name="slide-right">
      <div v-if="mode === 'service' && selectedTable"
        class="w-72 border-l border-slate-700 flex flex-col shrink-0 bg-slate-800/50">

        <!-- Header table -->
        <div class="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h3 class="font-semibold text-slate-100">{{ selectedTable.name }}</h3>
            <p class="text-xs text-slate-400">{{ selectedTable.capacity }} places</p>
          </div>
          <button @click="selectedTableId = null" class="btn-ghost p-1.5">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-4">

          <!-- Réservation en cours sur cette table -->
          <div v-if="tableBooking">
            <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Réservation en cours</div>
            <div class="card p-3 space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-medium text-slate-100">
                  {{ tableBooking.customer?.lastName }} {{ tableBooking.customer?.firstName }}
                  <span v-if="tableBooking.customer?.vip" class="text-amber-400 text-xs ml-1">⭐</span>
                </span>
                <span class="text-xs font-mono text-slate-400">{{ tableBooking.startTime }}</span>
              </div>
              <div class="text-sm text-slate-400">{{ tableBooking.pax }} couvert(s)</div>
              <div v-if="tableBooking.notes" class="text-xs text-slate-500 italic">{{ tableBooking.notes }}</div>

              <!-- Actions rapides statut -->
              <div class="grid grid-cols-2 gap-1.5 pt-1">
                <button v-for="action in statusActions" :key="action.status"
                  @click="changeStatus(tableBooking!.id, action.status)"
                  class="py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors"
                  :class="tableBooking.status === action.status
                    ? 'bg-brand-500/30 border-brand-500/50 text-brand-300'
                    : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500'">
                  {{ action.icon }} {{ action.label }}
                </button>
              </div>

              <!-- Désaffecter -->
              <button @click="unassignTable(tableBooking!.id)"
                class="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors pt-1">
                Retirer de cette table
              </button>
            </div>
          </div>

          <!-- Table libre : proposer des réservations à affecter -->
          <div v-else>
            <div class="flex items-center gap-2 mb-2">
              <span class="w-2 h-2 rounded-full bg-slate-600"></span>
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Table libre</span>
            </div>

            <div v-if="unassignedBookings.length" class="space-y-1.5">
              <div class="text-xs text-slate-500 mb-2">Affecter une réservation :</div>
              <button
                v-for="b in unassignedBookings"
                :key="b.id"
                @click="assignBooking(b.id)"
                class="w-full card px-3 py-2 text-left hover:border-brand-500/50 hover:bg-slate-700/50 transition-all"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-slate-100">
                    {{ b.customer?.lastName }} {{ b.customer?.firstName }}
                  </span>
                  <span class="text-xs font-mono text-slate-400">{{ b.startTime }}</span>
                </div>
                <div class="flex items-center gap-2 mt-0.5">
                  <span class="text-xs text-slate-400">{{ b.pax }}p</span>
                  <span class="text-xs" :class="b.pax > selectedTable.capacity ? 'text-red-400' : 'text-slate-500'">
                    {{ b.pax > selectedTable.capacity ? '⚠ dépasse la capacité' : '' }}
                  </span>
                </div>
              </button>
            </div>

            <div v-else class="text-xs text-slate-500 text-center py-4">
              Aucune réservation sans table pour ce service
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Modale confirmation suppression ── -->
    <Transition name="fade">
      <div v-if="deleteModal.visible"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="deleteModal.visible = false">
        <div class="card w-full max-w-sm p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-slate-100">Supprimer la table</h3>
              <p class="text-sm text-slate-400">{{ deleteModal.tableName }}</p>
            </div>
          </div>
          <p class="text-sm text-slate-300 mb-5">
            Cette action est irréversible. Les réservations liées à cette table seront désaffectées.
          </p>
          <div class="flex gap-3">
            <button @click="deleteModal.visible = false" class="btn-secondary flex-1 justify-center">
              Annuler
            </button>
            <button @click="confirmDeleteTable" class="btn-danger flex-1 justify-center">
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/lib/api'
import { useRestaurantStore } from '@/stores/restaurant'
import { useBookingsStore } from '@/stores/bookings'
import type { Table, Booking } from '@/types'
import { BOOKING_STATUS_LABELS } from '@/types'
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

// Modale de suppression
const deleteModal = reactive({ visible: false, tableId: '', tableName: '' })

// ── Computed ──────────────────────────────

const currentRoom = computed(() => rooms.value.find((r) => r.id === selectedRoomId.value))
const currentTables = computed(() => currentRoom.value?.tables || [])
const todayBookings = computed(() => mode.value === 'service' ? bookingsStore.bookings : [])

const selectedTable = computed(() =>
  selectedTableId.value ? currentTables.value.find((t) => t.id === selectedTableId.value) ?? null : null
)

// Réservation actuellement sur la table sélectionnée
const tableBooking = computed((): Booking | null => {
  if (!selectedTableId.value) return null
  return todayBookings.value.find(
    (b) => b.bookingTables?.some((bt) => bt.tableId === selectedTableId.value)
      && !['CANCELLED', 'NO_SHOW', 'DONE'].includes(b.status)
  ) ?? null
})

// Réservations sans table affectée pour aujourd'hui
const unassignedBookings = computed((): Booking[] =>
  todayBookings.value.filter(
    (b) => !b.bookingTables?.length
      && !['CANCELLED', 'NO_SHOW', 'DONE'].includes(b.status)
  )
)

// Couleur de statut pour les indicateurs dans la liste
const statusBgColors: Record<string, string> = {
  RESERVED: '#3b82f6',
  CONFIRMED: '#6366f1',
  ARRIVED: '#f59e0b',
  SEATED: '#22c55e',
  DONE: '#475569',
}

function tableStatusColor(tableId: string): string {
  const booking = todayBookings.value.find(
    (b) => b.bookingTables?.some((bt) => bt.tableId === tableId)
      && !['CANCELLED', 'NO_SHOW', 'DONE'].includes(b.status)
  )
  return booking ? (statusBgColors[booking.status] ?? '#475569') : '#1e293b'
}

const statusActions = [
  { status: 'CONFIRMED', label: 'Confirmé', icon: '✓' },
  { status: 'ARRIVED', label: 'Arrivés', icon: '🚪' },
  { status: 'SEATED', label: 'Assis', icon: '🪑' },
  { status: 'DONE', label: 'Parti', icon: '👋' },
]

// ── Watchers ──────────────────────────────

watch(rooms, (r) => {
  if (r.length && !selectedRoomId.value) selectedRoomId.value = r[0].id
}, { immediate: true })

watch(mode, (m) => {
  if (m === 'service') bookingsStore.fetchByDate(restaurantId.value, dayjs().format('YYYY-MM-DD'))
  selectedTableId.value = null
})

// ── Clavier ──────────────────────────────

function onDeleteKey() {
  if (mode.value === 'edit' && selectedTableId.value) {
    const table = currentTables.value.find((t) => t.id === selectedTableId.value)
    if (table) askDeleteTable(table.id, table.name)
  }
}

// ── Actions tables ────────────────────────

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
  } catch (e) { console.error(e) }
}

function askDeleteTable(tableId: string, tableName: string) {
  deleteModal.tableId = tableId
  deleteModal.tableName = tableName
  deleteModal.visible = true
}

async function confirmDeleteTable() {
  await api.delete(`/rooms/${selectedRoomId.value}/tables/${deleteModal.tableId}`)
  if (selectedTableId.value === deleteModal.tableId) selectedTableId.value = null
  deleteModal.visible = false
  await restaurantStore.fetchOne(restaurantId.value)
}

function handleTableMoved(tableId: string, x: number, y: number, rotation: number) {
  pendingPositions.value.set(tableId, { x, y, rotation })
  hasUnsavedChanges.value = true
}

function handleTableSelected(tableId: string) {
  selectedTableId.value = selectedTableId.value === tableId ? null : tableId
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
  } finally { saving.value = false }
}

// ── Actions service ───────────────────────

async function changeStatus(bookingId: string, status: string) {
  await bookingsStore.updateStatus(restaurantId.value, bookingId, status)
}

async function assignBooking(bookingId: string) {
  if (!selectedTableId.value) return
  const booking = todayBookings.value.find((b) => b.id === bookingId)
  const existingTableIds = booking?.bookingTables?.map((bt) => bt.tableId) ?? []
  await bookingsStore.update(restaurantId.value, bookingId, {
    tableIds: [...existingTableIds, selectedTableId.value],
  })
  await bookingsStore.fetchByDate(restaurantId.value, dayjs().format('YYYY-MM-DD'))
}

async function unassignTable(bookingId: string) {
  if (!selectedTableId.value) return
  const booking = todayBookings.value.find((b) => b.id === bookingId)
  const remaining = (booking?.bookingTables ?? [])
    .map((bt) => bt.tableId)
    .filter((id) => id !== selectedTableId.value)
  await bookingsStore.update(restaurantId.value, bookingId, { tableIds: remaining })
  await bookingsStore.fetchByDate(restaurantId.value, dayjs().format('YYYY-MM-DD'))
}
</script>

<style scoped>
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.2s ease;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
