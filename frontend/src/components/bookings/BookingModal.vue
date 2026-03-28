<template>
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="card w-full max-w-2xl max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-700 flex items-center justify-between shrink-0">
        <h3 class="text-lg font-semibold text-slate-100">
          {{ booking ? 'Modifier la réservation' : 'Nouvelle réservation' }}
        </h3>
        <button @click="$emit('close')" class="btn-ghost p-1.5">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <!-- Body -->
      <div class="overflow-y-auto flex-1 px-6 py-4">
        <form @submit.prevent="handleSubmit" id="booking-form">
          <div class="grid grid-cols-2 gap-x-6 gap-y-4">

            <!-- ── Colonne gauche : réservation ── -->
            <div class="space-y-4">
              <div>
                <label class="label">Date *</label>
                <input v-model="form.date" type="date" class="input" required />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Période *</label>
                  <select v-model="form.period" class="input" @change="updateTimes">
                    <option value="LUNCH">☀️ Midi</option>
                    <option value="DINNER">🌙 Soir</option>
                  </select>
                </div>
                <div>
                  <label class="label">Couverts *</label>
                  <input v-model.number="form.pax" type="number" min="1" max="99" class="input" required />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Heure début</label>
                  <input v-model="form.startTime" type="time" class="input" required />
                </div>
                <div>
                  <label class="label">Heure fin</label>
                  <input v-model="form.endTime" type="time" class="input" required />
                </div>
              </div>

              <div>
                <label class="label">Statut</label>
                <select v-model="form.status" class="input">
                  <option v-for="(label, value) in BOOKING_STATUS_LABELS" :key="value" :value="value">{{ label }}</option>
                </select>
              </div>

              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="form.waitingList" type="checkbox" class="w-4 h-4 accent-brand-500" />
                <span class="text-sm text-slate-300">Liste d'attente</span>
              </label>

              <div>
                <label class="label">Notes</label>
                <textarea v-model="form.notes" class="input resize-none" rows="3" placeholder="Allergies, occasions spéciales..."></textarea>
              </div>

              <!-- ── Table(s) ── -->
              <div v-if="availableTables.length">
                <label class="label">Table(s)</label>
                <div class="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
                  <button
                    v-for="t in availableTables"
                    :key="t.id"
                    type="button"
                    @click="toggleTable(t.id)"
                    class="flex items-center justify-between px-3 py-1.5 rounded-lg border text-sm transition-colors"
                    :class="form.tableIds.includes(t.id)
                      ? 'bg-brand-500/20 border-brand-500/50 text-brand-300'
                      : 'bg-slate-700/40 border-slate-600 text-slate-300 hover:border-slate-500'"
                  >
                    <span class="font-medium">{{ t.name }}</span>
                    <span class="text-xs text-slate-500 ml-2">{{ t.capacity }}p</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- ── Colonne droite : client ── -->
            <div class="space-y-4">
              <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-1">Client</div>

              <!-- Recherche client existant -->
              <div class="relative" ref="searchRef">
                <label class="label">Rechercher un client existant</label>
                <input
                  v-model="customerSearch"
                  type="text"
                  class="input"
                  placeholder="Nom, prénom, téléphone..."
                  autocomplete="off"
                  @input="onCustomerSearch"
                  @focus="showSuggestions = customerResults.length > 0"
                />
                <!-- Dropdown suggestions -->
                <div
                  v-if="showSuggestions && customerResults.length"
                  class="absolute z-10 left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden"
                >
                  <button
                    v-for="c in customerResults"
                    :key="c.id"
                    type="button"
                    @click="selectCustomer(c)"
                    class="w-full px-3 py-2 flex items-center gap-3 hover:bg-slate-700 transition-colors text-left"
                  >
                    <div class="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-xs font-semibold text-slate-300 shrink-0">
                      {{ c.firstName[0] }}{{ c.lastName?.[0] || '' }}
                    </div>
                    <div class="min-w-0">
                      <div class="text-sm text-slate-100 truncate">
                        {{ c.lastName }} {{ c.firstName }}
                        <span v-if="c.vip" class="text-amber-400 text-xs ml-1">⭐</span>
                      </div>
                      <div class="text-xs text-slate-400 truncate">{{ c.phone || c.email || '' }}</div>
                    </div>
                  </button>
                </div>
              </div>

              <div class="border-t border-slate-700 pt-3 space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="label">Prénom *</label>
                    <input v-model="form.customerFirstName" type="text" class="input" required />
                  </div>
                  <div>
                    <label class="label">Nom</label>
                    <input v-model="form.customerLastName" type="text" class="input" />
                  </div>
                </div>

                <div>
                  <label class="label">Téléphone</label>
                  <input v-model="form.customerPhone" type="tel" class="input" placeholder="06 12 34 56 78" />
                </div>

                <div>
                  <label class="label">Email</label>
                  <input v-model="form.customerEmail" type="email" class="input" placeholder="client@exemple.com" />
                </div>
              </div>
            </div>
          </div>

          <div v-if="error" class="mt-4 text-sm text-red-400 bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2">
            {{ error }}
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-slate-700 flex justify-end gap-3 shrink-0">
        <button type="button" @click="$emit('close')" class="btn-secondary">Annuler</button>
        <button type="submit" form="booking-form" class="btn-primary" :disabled="saving">
          {{ saving ? 'Enregistrement...' : (booking ? 'Enregistrer' : 'Créer la réservation') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'
import { api } from '@/lib/api'
import { useBookingsStore } from '@/stores/bookings'
import { useRestaurantStore } from '@/stores/restaurant'
import type { Booking, Customer, Table } from '@/types'
import { BOOKING_STATUS_LABELS } from '@/types'

const props = defineProps<{
  restaurantId: string
  initialDate?: string
  booking?: Booking | null
}>()

const emit = defineEmits<{ close: []; saved: [] }>()
const bookingsStore = useBookingsStore()
const restaurantStore = useRestaurantStore()

const saving = ref(false)
const error = ref('')
const searchRef = ref<HTMLElement>()

// Customer search
const customerSearch = ref('')
const customerResults = ref<Customer[]>([])
const showSuggestions = ref(false)
let searchTimer: ReturnType<typeof setTimeout>

// Available tables (all tables across rooms)
const availableTables = ref<Table[]>([])

const form = reactive({
  date: props.initialDate || dayjs().format('YYYY-MM-DD'),
  period: 'DINNER' as 'LUNCH' | 'DINNER',
  pax: 2,
  startTime: '19:30',
  endTime: '21:30',
  status: 'RESERVED' as string,
  notes: '',
  waitingList: false,
  customerId: '' as string | undefined,
  customerFirstName: '',
  customerLastName: '',
  customerPhone: '',
  customerEmail: '',
  tableIds: [] as string[],
})

// Populate form when editing
watch(
  () => props.booking,
  (b) => {
    if (b) {
      form.date = dayjs(b.date).format('YYYY-MM-DD')
      form.period = b.period
      form.pax = b.pax
      form.startTime = b.startTime
      form.endTime = b.endTime
      form.status = b.status
      form.notes = b.notes || ''
      form.waitingList = b.waitingList
      form.customerId = b.customerId
      form.customerFirstName = b.customer?.firstName || ''
      form.customerLastName = b.customer?.lastName || ''
      form.customerPhone = b.customer?.phone || ''
      form.customerEmail = b.customer?.email || ''
      form.tableIds = b.bookingTables?.map((bt) => bt.tableId) || []
    }
  },
  { immediate: true },
)

// Load all tables from the restaurant rooms
onMounted(async () => {
  const rooms = restaurantStore.current?.rooms || []
  availableTables.value = rooms.flatMap((r) => r.tables || [])
})

function updateTimes() {
  if (form.period === 'LUNCH') {
    form.startTime = '12:30'
    form.endTime = '14:30'
  } else {
    form.startTime = '19:30'
    form.endTime = '21:30'
  }
}

function toggleTable(tableId: string) {
  const idx = form.tableIds.indexOf(tableId)
  if (idx === -1) form.tableIds.push(tableId)
  else form.tableIds.splice(idx, 1)
}

// Customer search autocomplete
function onCustomerSearch() {
  clearTimeout(searchTimer)
  if (!customerSearch.value.trim()) {
    customerResults.value = []
    showSuggestions.value = false
    return
  }
  searchTimer = setTimeout(async () => {
    try {
      const { data } = await api.get<Customer[]>(`/restaurants/${props.restaurantId}/customers`, {
        params: { search: customerSearch.value },
      })
      customerResults.value = data.slice(0, 6)
      showSuggestions.value = data.length > 0
    } catch {
      customerResults.value = []
    }
  }, 250)
}

function selectCustomer(c: Customer) {
  form.customerId = c.id
  form.customerFirstName = c.firstName
  form.customerLastName = c.lastName || ''
  form.customerPhone = c.phone || ''
  form.customerEmail = c.email || ''
  customerSearch.value = `${c.lastName || ''} ${c.firstName}`.trim()
  showSuggestions.value = false
}

// Close suggestions on outside click
function handleOutsideClick(e: MouseEvent) {
  if (searchRef.value && !searchRef.value.contains(e.target as Node)) {
    showSuggestions.value = false
  }
}
onMounted(() => document.addEventListener('mousedown', handleOutsideClick))
onUnmounted(() => document.removeEventListener('mousedown', handleOutsideClick))

async function handleSubmit() {
  saving.value = true
  error.value = ''
  try {
    const payload = { ...form }
    // Don't send customerId if we're creating inline
    if (!form.customerId) delete payload.customerId
    if (props.booking) {
      await bookingsStore.update(props.restaurantId, props.booking.id, payload)
    } else {
      await bookingsStore.create(props.restaurantId, payload)
    }
    emit('saved')
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Erreur lors de l\'enregistrement'
  } finally {
    saving.value = false
  }
}
</script>
