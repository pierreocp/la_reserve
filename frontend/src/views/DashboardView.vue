<template>
  <div class="p-6">
    <!-- Header with date nav -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <button @click="changeDate(-1)" class="btn-ghost p-2">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div class="text-center">
          <h1 class="text-xl font-bold text-slate-100 capitalize">{{ formattedDate }}</h1>
          <button @click="goToday" class="text-xs text-brand-500 hover:text-brand-400 transition-colors" v-if="!isToday">
            → Aujourd'hui
          </button>
          <span class="text-xs text-brand-500" v-else>Aujourd'hui</span>
        </div>
        <button @click="changeDate(1)" class="btn-ghost p-2">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <RouterLink :to="`/r/${restaurantId}/bookings`" class="btn-primary text-sm">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        Nouvelle réservation
      </RouterLink>
    </div>

    <div v-if="loading" class="text-center py-12 text-slate-400">Chargement...</div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Lunch service -->
      <ServiceBlock
        period="LUNCH"
        label="Service du Midi"
        :bookings="lunchBookings"
        :restaurant-id="restaurantId"
        :date="currentDate"
        @status-change="handleStatusChange"
      />

      <!-- Dinner service -->
      <ServiceBlock
        period="DINNER"
        label="Service du Soir"
        :bookings="dinnerBookings"
        :restaurant-id="restaurantId"
        :date="currentDate"
        @status-change="handleStatusChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'
import { useBookingsStore } from '@/stores/bookings'
import ServiceBlock from '@/components/dashboard/ServiceBlock.vue'

dayjs.locale('fr')

const route = useRoute()
const bookingsStore = useBookingsStore()

const restaurantId = computed(() => route.params.restaurantId as string)
const currentDate = ref(dayjs().format('YYYY-MM-DD'))
const loading = ref(false)

const formattedDate = computed(() => dayjs(currentDate.value).format('dddd D MMMM YYYY'))
const isToday = computed(() => currentDate.value === dayjs().format('YYYY-MM-DD'))

const lunchBookings = computed(() => bookingsStore.bookings.filter((b) => b.period === 'LUNCH'))
const dinnerBookings = computed(() => bookingsStore.bookings.filter((b) => b.period === 'DINNER'))

async function loadBookings() {
  loading.value = true
  try {
    await bookingsStore.fetchByDate(restaurantId.value, currentDate.value)
  } finally {
    loading.value = false
  }
}

function changeDate(delta: number) {
  currentDate.value = dayjs(currentDate.value).add(delta, 'day').format('YYYY-MM-DD')
}

function goToday() {
  currentDate.value = dayjs().format('YYYY-MM-DD')
}

async function handleStatusChange(bookingId: string, status: string) {
  await bookingsStore.updateStatus(restaurantId.value, bookingId, status)
}

watch([restaurantId, currentDate], loadBookings, { immediate: true })
</script>
