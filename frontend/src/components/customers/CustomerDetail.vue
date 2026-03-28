<template>
  <div>
    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
             :class="customer.vip ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-300'">
          {{ customer.firstName[0] }}{{ customer.lastName[0] }}
        </div>
        <div>
          <h2 class="text-xl font-bold text-slate-100">{{ customer.lastName }} {{ customer.firstName }}</h2>
          <div class="flex items-center gap-2 mt-1">
            <span v-if="customer.vip" class="badge bg-amber-500/10 text-amber-400 border-amber-500/20">⭐ VIP</span>
            <span class="text-sm text-slate-400">{{ customer._count?.bookings || 0 }} réservation(s)</span>
          </div>
        </div>
      </div>
      <div class="flex gap-2">
        <button @click="editing = !editing" class="btn-secondary text-sm">
          {{ editing ? 'Annuler' : 'Modifier' }}
        </button>
        <button @click="handleDelete" class="btn-danger text-sm">Supprimer</button>
      </div>
    </div>

    <!-- Edit form -->
    <div v-if="editing" class="card p-4 mb-6">
      <form @submit.prevent="handleUpdate" class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">Prénom</label>
            <input v-model="editForm.firstName" type="text" class="input" />
          </div>
          <div>
            <label class="label">Nom</label>
            <input v-model="editForm.lastName" type="text" class="input" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label">Téléphone</label>
            <input v-model="editForm.phone" type="tel" class="input" />
          </div>
          <div>
            <label class="label">Email</label>
            <input v-model="editForm.email" type="email" class="input" />
          </div>
        </div>
        <div>
          <label class="label">Notes</label>
          <textarea v-model="editForm.notes" class="input resize-none" rows="2"></textarea>
        </div>
        <div class="flex items-center gap-2">
          <input v-model="editForm.vip" type="checkbox" id="vip-edit" class="w-4 h-4 accent-brand-500" />
          <label for="vip-edit" class="text-sm text-slate-300 cursor-pointer">Client VIP</label>
        </div>
        <button type="submit" class="btn-primary text-sm" :disabled="saving">
          {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </form>
    </div>

    <!-- Info grid -->
    <div v-else class="grid grid-cols-2 gap-4 mb-6">
      <InfoField label="Téléphone" :value="customer.phone" />
      <InfoField label="Email" :value="customer.email" />
      <InfoField label="Statut" :value="customer.status" />
      <InfoField label="Notes" :value="customer.notes" class="col-span-2" />
    </div>

    <!-- Booking history -->
    <div>
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Historique</h3>
      <div v-if="!customer.bookings?.length" class="text-sm text-slate-500">Aucune réservation</div>
      <div v-else class="space-y-2">
        <div v-for="b in customer.bookings" :key="b.id" class="flex items-center gap-3 text-sm py-2 border-b border-slate-700/50">
          <span class="text-slate-400 w-24 shrink-0">{{ formatDate(b.date) }}</span>
          <span class="text-slate-300">{{ b.pax }} cvt · {{ b.period === 'LUNCH' ? 'Midi' : 'Soir' }}</span>
          <span class="ml-auto badge text-xs" :class="statusColor(b.status)">{{ statusLabel(b.status) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import dayjs from 'dayjs'
import { useCustomersStore } from '@/stores/customers'
import type { Customer } from '@/types'
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '@/types'
import InfoField from './InfoField.vue'

const props = defineProps<{ customer: Customer & { bookings?: any[] }; restaurantId: string }>()
const emit = defineEmits<{ updated: []; deleted: [] }>()

const customersStore = useCustomersStore()
const editing = ref(false)
const saving = ref(false)
const editForm = reactive({ ...props.customer })

watch(() => props.customer, (c) => Object.assign(editForm, c), { deep: true })

async function handleUpdate() {
  saving.value = true
  try {
    await customersStore.update(props.restaurantId, props.customer.id, editForm)
    editing.value = false
    emit('updated')
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  if (!confirm(`Supprimer ${props.customer.firstName} ${props.customer.lastName} ?`)) return
  await customersStore.remove(props.restaurantId, props.customer.id)
  emit('deleted')
}

function formatDate(date: string) { return dayjs(date).format('DD/MM/YYYY') }
function statusLabel(status: string) { return BOOKING_STATUS_LABELS[status as keyof typeof BOOKING_STATUS_LABELS] || status }
function statusColor(status: string) { return BOOKING_STATUS_COLORS[status as keyof typeof BOOKING_STATUS_COLORS] || '' }
</script>
