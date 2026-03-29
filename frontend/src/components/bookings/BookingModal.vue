<template>
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="card w-full max-w-3xl max-h-[90vh] flex flex-col">

      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-700 flex items-center justify-between shrink-0">
        <h3 class="text-lg font-semibold text-slate-100">
          {{ booking ? 'Modifier la réservation' : 'Nouvelle réservation' }}
        </h3>
        <button @click="$emit('close')" class="btn-ghost p-1.5">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="overflow-y-auto flex-1 px-6 py-5 space-y-5">
        <form @submit.prevent="handleSubmit" id="booking-form" class="space-y-5">

          <!-- ── Ligne 1 : infos essentielles ── -->
          <div class="grid grid-cols-[1fr_72px_100px_100px_1fr] gap-3 items-end">
            <div>
              <label class="label">Date *</label>
              <input v-model="form.date" type="date" class="input" required />
            </div>
            <div>
              <label class="label">Couverts *</label>
              <input v-model.number="form.pax" type="number" min="1" max="99" class="input text-center" required />
            </div>
            <div>
              <label class="label">Début</label>
              <input v-model="form.startTime" type="time" class="input" required />
            </div>
            <div>
              <label class="label">Fin</label>
              <input v-model="form.endTime" type="time" class="input" required />
            </div>
            <div>
              <label class="label">Statut</label>
              <select v-model="form.status" class="input">
                <option v-for="(lbl, val) in BOOKING_STATUS_LABELS" :key="val" :value="val">{{ lbl }}</option>
              </select>
            </div>
          </div>

          <!-- ── Ligne 2 : période déduite + liste d'attente ── -->
          <div class="flex items-center gap-4">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
              :class="period === 'LUNCH' ? 'bg-amber-500/15 text-amber-300' : 'bg-indigo-500/15 text-indigo-300'">
              {{ period === 'LUNCH' ? '☀️ Service du midi' : '🌙 Service du soir' }}
            </span>
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input v-model="form.waitingList" type="checkbox" class="w-4 h-4 accent-brand-500" />
              <span class="text-sm text-slate-300">Liste d'attente</span>
            </label>
          </div>

          <!-- ── Zone centrale : table | client ── -->
          <div class="grid gap-x-6" :class="rooms.length ? 'grid-cols-2' : 'grid-cols-1'">

            <!-- Tables -->
            <div v-if="rooms.length" class="space-y-2">
              <label class="label">Table(s)</label>
              <TableFloorPicker
                v-model="form.tableIds"
                :rooms="rooms"
                :busy-table-ids="busyTableIds"
              />
            </div>

            <!-- Client -->
            <div class="space-y-3">
              <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Client</div>

              <!-- Autocomplete -->
              <div class="relative" ref="searchRef">
                <input
                  v-model="customerSearch"
                  type="text"
                  class="input"
                  placeholder="Rechercher un client existant..."
                  autocomplete="off"
                  @input="onCustomerSearch"
                  @focus="showSuggestions = customerResults.length > 0"
                />
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

          <!-- ── Notes full width ── -->
          <div>
            <label class="label">Notes</label>
            <textarea v-model="form.notes" class="input resize-none" rows="2" placeholder="Allergies, occasion spéciale, préférences..."></textarea>
          </div>

          <div v-if="error" class="text-sm text-red-400 bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2">
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
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import dayjs from 'dayjs'
import { api } from '@/lib/api'
import { useBookingsStore } from '@/stores/bookings'
import { useRestaurantStore } from '@/stores/restaurant'
import type { Booking, Customer } from '@/types'
import { BOOKING_STATUS_LABELS } from '@/types'
import TableFloorPicker from '@/components/floorplan/TableFloorPicker.vue'

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

const form = reactive({
  date: props.initialDate || dayjs().format('YYYY-MM-DD'),
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

// Période déduite de l'heure de début (pas de saisie manuelle)
const period = computed<'LUNCH' | 'DINNER'>(() =>
  form.startTime < '16:00' ? 'LUNCH' : 'DINNER',
)

// Rooms + busy tables for floor picker
const rooms = computed(() => restaurantStore.current?.rooms ?? [])
const busyTableIds = computed(() =>
  (bookingsStore.bookings ?? [])
    .filter((b) =>
      b.id !== props.booking?.id &&
      dayjs(b.date).format('YYYY-MM-DD') === form.date &&
      b.period === period.value,
    )
    .flatMap((b) => b.bookingTables?.map((bt) => bt.tableId) ?? []),
)

// Populate form when editing
watch(
  () => props.booking,
  (b) => {
    if (b) {
      form.date = dayjs(b.date).format('YYYY-MM-DD')
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
    const payload = { ...form, period: period.value }
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
