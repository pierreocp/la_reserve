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
            <!-- Left column -->
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

              <div class="flex items-center gap-3">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input v-model="form.waitingList" type="checkbox" class="w-4 h-4 accent-brand-500" />
                  <span class="text-sm text-slate-300">Liste d'attente</span>
                </label>
              </div>

              <div>
                <label class="label">Notes</label>
                <textarea v-model="form.notes" class="input resize-none" rows="3" placeholder="Allergies, occasions spéciales..."></textarea>
              </div>
            </div>

            <!-- Right column — customer -->
            <div class="space-y-4">
              <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-1">Client</div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Prénom *</label>
                  <input v-model="form.customerFirstName" type="text" class="input" required />
                </div>
                <div>
                  <label class="label">Nom *</label>
                  <input v-model="form.customerLastName" type="text" class="input" required />
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
import { ref, reactive, watch } from 'vue'
import dayjs from 'dayjs'
import { useBookingsStore } from '@/stores/bookings'
import type { Booking } from '@/types'
import { BOOKING_STATUS_LABELS } from '@/types'

const props = defineProps<{
  restaurantId: string
  initialDate?: string
  booking?: Booking | null
}>()

const emit = defineEmits<{ close: []; saved: [] }>()
const bookingsStore = useBookingsStore()

const saving = ref(false)
const error = ref('')

const form = reactive({
  date: props.initialDate || dayjs().format('YYYY-MM-DD'),
  period: 'DINNER' as 'LUNCH' | 'DINNER',
  pax: 2,
  startTime: '19:30',
  endTime: '21:30',
  status: 'RESERVED' as string,
  notes: '',
  waitingList: false,
  customerFirstName: '',
  customerLastName: '',
  customerPhone: '',
  customerEmail: '',
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
      form.customerFirstName = b.customer?.firstName || ''
      form.customerLastName = b.customer?.lastName || ''
      form.customerPhone = b.customer?.phone || ''
      form.customerEmail = b.customer?.email || ''
    }
  },
  { immediate: true },
)

function updateTimes() {
  if (form.period === 'LUNCH') {
    form.startTime = '12:30'
    form.endTime = '14:30'
  } else {
    form.startTime = '19:30'
    form.endTime = '21:30'
  }
}

async function handleSubmit() {
  saving.value = true
  error.value = ''
  try {
    if (props.booking) {
      await bookingsStore.update(props.restaurantId, props.booking.id, form)
    } else {
      await bookingsStore.create(props.restaurantId, form)
    }
    emit('saved')
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Erreur lors de l\'enregistrement'
  } finally {
    saving.value = false
  }
}
</script>
