<template>
  <div class="card overflow-hidden">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="text-lg">{{ period === 'LUNCH' ? '☀️' : '🌙' }}</span>
        <div>
          <h2 class="font-semibold text-slate-100">{{ label }}</h2>
          <p class="text-xs text-slate-400">
            {{ activeBookings.length }} réservation(s) · {{ totalCovers }} couvert(s)
            <span v-if="waitingCount" class="text-yellow-400"> · {{ waitingCount }} en attente</span>
          </p>
        </div>
      </div>
      <div v-if="vipBookings.length" class="flex items-center gap-1">
        <span class="text-xs text-amber-400 font-medium">⭐ {{ vipBookings.length }} VIP</span>
      </div>
    </div>

    <!-- Booking list -->
    <div class="divide-y divide-slate-700/50">
      <div v-if="!bookings.length" class="px-4 py-8 text-center text-slate-500 text-sm">
        Aucune réservation pour ce service
      </div>

      <div
        v-for="booking in sortedBookings"
        :key="booking.id"
        class="px-4 py-3 flex items-center gap-3 hover:bg-slate-700/30 transition-colors group"
      >
        <!-- Time -->
        <div class="text-sm font-mono text-slate-300 w-10 shrink-0">{{ booking.startTime }}</div>

        <!-- Pax -->
        <div class="flex items-center gap-1 text-slate-300 w-8 shrink-0">
          <svg class="w-3.5 h-3.5 text-slate-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>
          <span class="text-sm font-medium">{{ booking.pax }}</span>
        </div>

        <!-- Customer -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="font-medium text-slate-100 truncate">
              {{ booking.customer?.lastName }} {{ booking.customer?.firstName }}
            </span>
            <span v-if="booking.customer?.vip" class="text-xs text-amber-400">⭐</span>
            <span v-if="booking.waitingList" class="badge bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-xs">Attente</span>
          </div>
          <div v-if="booking.notes" class="text-xs text-slate-500 truncate mt-0.5">{{ booking.notes }}</div>
        </div>

        <!-- Status -->
        <div class="shrink-0">
          <select
            :value="booking.status"
            @change="$emit('status-change', booking.id, ($event.target as HTMLSelectElement).value)"
            class="text-xs bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500/50 cursor-pointer"
          >
            <option v-for="(label, value) in statusOptions" :key="value" :value="value">{{ label }}</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Booking, BookingPeriod } from '@/types'
import { BOOKING_STATUS_LABELS } from '@/types'

const props = defineProps<{
  period: BookingPeriod
  label: string
  bookings: Booking[]
  restaurantId: string
  date: string
}>()

defineEmits<{ 'status-change': [id: string, status: string] }>()

const activeBookings = computed(() => props.bookings.filter((b) => !['CANCELLED', 'NO_SHOW'].includes(b.status)))
const waitingCount = computed(() => props.bookings.filter((b) => b.waitingList).length)
const totalCovers = computed(() => activeBookings.value.filter((b) => !b.waitingList).reduce((s, b) => s + b.pax, 0))
const vipBookings = computed(() => activeBookings.value.filter((b) => b.customer?.vip))
const sortedBookings = computed(() => [...props.bookings].sort((a, b) => a.startTime.localeCompare(b.startTime)))

const statusOptions = BOOKING_STATUS_LABELS
</script>
