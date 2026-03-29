<template>
  <div class="flex h-full">
    <!-- Calendar sidebar -->
    <div class="w-72 border-r border-slate-700 p-4 shrink-0 overflow-y-auto">
      <MiniCalendar v-model="selectedDate" />

      <div class="mt-4">
        <button @click="showBookingModal = true" class="btn-primary w-full justify-center">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
          Nouvelle réservation
        </button>
      </div>

      <!-- Period filter -->
      <div class="mt-4 space-y-1">
        <button
          v-for="p in periodOptions"
          :key="p.value"
          @click="filterPeriod = filterPeriod === p.value ? null : p.value"
          class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
          :class="filterPeriod === p.value ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'text-slate-400 hover:bg-slate-700'"
        >
          <span>{{ p.icon }}</span>
          {{ p.label }}
          <span class="ml-auto text-xs font-mono">{{ p.count }}</span>
        </button>
      </div>
    </div>

    <!-- Bookings list -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-semibold text-slate-100 capitalize">{{ formattedDate }}</h2>
        <p class="text-sm text-slate-400">{{ filteredBookings.length }} réservation(s) · {{ totalCovers }} couvert(s)</p>
      </div>

      <div v-if="bookingsStore.loading" class="text-center py-12 text-slate-400">Chargement...</div>

      <div v-else-if="!filteredBookings.length" class="text-center py-12 text-slate-500">
        Aucune réservation pour cette journée
      </div>

      <div v-else class="space-y-2">
        <BookingRow
          v-for="booking in sortedBookings"
          :key="booking.id"
          :booking="booking"
          @edit="editBooking"
          @delete="deleteBooking"
          @status-change="(id, status) => bookingsStore.updateStatus(restaurantId, id, status)"
        />
      </div>
    </div>

    <!-- Booking modal -->
    <BookingModal
      v-if="showBookingModal"
      :restaurant-id="restaurantId"
      :initial-date="selectedDate"
      :booking="editingBooking"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'
import { useBookingsStore } from '@/stores/bookings'
import type { Booking, BookingPeriod } from '@/types'
import MiniCalendar from '@/components/bookings/MiniCalendar.vue'
import BookingRow from '@/components/bookings/BookingRow.vue'
import BookingModal from '@/components/bookings/BookingModal.vue'

dayjs.locale('fr')

const route = useRoute()
const bookingsStore = useBookingsStore()

const restaurantId = computed(() => route.params.restaurantId as string)
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))
const filterPeriod = ref<BookingPeriod | null>(null)
const showBookingModal = ref(false)
const editingBooking = ref<Booking | null>(null)

const formattedDate = computed(() => dayjs(selectedDate.value).format('dddd D MMMM YYYY'))

const filteredBookings = computed(() => {
  if (!filterPeriod.value) return bookingsStore.bookings
  return bookingsStore.bookings.filter((b) => b.period === filterPeriod.value)
})

const sortedBookings = computed(() => [...filteredBookings.value].sort((a, b) => a.startTime.localeCompare(b.startTime)))

const totalCovers = computed(() =>
  filteredBookings.value.filter((b) => !b.waitingList && !['CANCELLED', 'NO_SHOW'].includes(b.status)).reduce((s, b) => s + b.pax, 0),
)

const periodOptions = computed(() => [
  { value: 'LUNCH' as BookingPeriod, label: 'Midi', icon: '☀️', count: bookingsStore.bookings.filter((b) => b.period === 'LUNCH').length },
  { value: 'DINNER' as BookingPeriod, label: 'Soir', icon: '🌙', count: bookingsStore.bookings.filter((b) => b.period === 'DINNER').length },
])

watch(
  [restaurantId, selectedDate],
  ([id, date]) => {
    if (id) bookingsStore.fetchByDate(id, date)
  },
  { immediate: true },
)

function editBooking(booking: Booking) {
  editingBooking.value = booking
  showBookingModal.value = true
}

async function deleteBooking(id: string) {
  if (confirm('Supprimer cette réservation ?')) {
    await bookingsStore.remove(restaurantId.value, id)
  }
}

function closeModal() {
  showBookingModal.value = false
  editingBooking.value = null
}

function handleSaved() {
  closeModal()
  bookingsStore.fetchByDate(restaurantId.value, selectedDate.value)
}
</script>
