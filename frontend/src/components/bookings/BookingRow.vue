<template>
  <div class="card px-4 py-3 flex items-center gap-3 hover:border-slate-600 transition-colors group">
    <!-- Period + time -->
    <div class="shrink-0 text-center w-14">
      <div class="text-xs text-slate-500">{{ booking.period === 'LUNCH' ? '☀️' : '🌙' }}</div>
      <div class="text-sm font-mono font-medium text-slate-200">{{ booking.startTime }}</div>
    </div>

    <!-- Pax -->
    <div class="shrink-0 w-8 text-center">
      <span class="text-sm font-semibold text-slate-100">{{ booking.pax }}</span>
      <div class="text-xs text-slate-500">cvt</div>
    </div>

    <!-- Customer info -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="font-medium text-slate-100">
          {{ booking.customer?.lastName?.toUpperCase() }} {{ booking.customer?.firstName }}
        </span>
        <span v-if="booking.customer?.vip" class="text-xs text-amber-400">⭐ VIP</span>
        <span v-if="booking.waitingList" class="badge bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Attente</span>
      </div>
      <div class="flex items-center gap-3 mt-0.5">
        <span v-if="booking.customer?.phone" class="text-xs text-slate-400">{{ booking.customer.phone }}</span>
        <span v-if="booking.notes" class="text-xs text-slate-500 truncate max-w-xs italic">{{ booking.notes }}</span>
      </div>
    </div>

    <!-- Tables assigned -->
    <div v-if="booking.bookingTables?.length" class="hidden md:flex items-center gap-1 shrink-0">
      <span v-for="bt in booking.bookingTables" :key="bt.id" class="text-xs bg-slate-700 border border-slate-600 rounded px-1.5 py-0.5 text-slate-300">
        {{ bt.table?.name }}
      </span>
    </div>

    <!-- Status -->
    <div class="shrink-0">
      <select
        :value="booking.status"
        @change="$emit('status-change', booking.id, ($event.target as HTMLSelectElement).value)"
        class="text-xs bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
      >
        <option v-for="(label, value) in BOOKING_STATUS_LABELS" :key="value" :value="value">{{ label }}</option>
      </select>
    </div>

    <!-- Actions -->
    <div class="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button @click="$emit('edit', booking)" class="btn-ghost p-1.5">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
      </button>
      <button @click="$emit('delete', booking.id)" class="btn-danger p-1.5">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Booking } from '@/types'
import { BOOKING_STATUS_LABELS } from '@/types'

defineProps<{ booking: Booking }>()
defineEmits<{
  edit: [booking: Booking]
  delete: [id: string]
  'status-change': [id: string, status: string]
}>()
</script>
