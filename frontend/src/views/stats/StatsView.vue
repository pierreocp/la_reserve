<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h1 class="text-xl font-bold text-slate-100 mb-6">Statistiques</h1>

    <!-- Filters -->
    <div class="card p-4 mb-6">
      <div class="flex flex-wrap items-end gap-4">
        <div>
          <label class="label">Du</label>
          <input v-model="dateFrom" type="date" class="input w-40" />
        </div>
        <div>
          <label class="label">Au</label>
          <input v-model="dateTo" type="date" class="input w-40" />
        </div>
        <div class="flex gap-2">
          <button @click="setPreset('week')" class="btn-ghost text-sm">7 jours</button>
          <button @click="setPreset('month')" class="btn-ghost text-sm">30 jours</button>
          <button @click="setPreset('quarter')" class="btn-ghost text-sm">3 mois</button>
        </div>
        <button @click="loadStats" class="btn-primary" :disabled="loading">
          {{ loading ? 'Chargement...' : 'Calculer' }}
        </button>
      </div>
    </div>

    <!-- Stats cards -->
    <div v-if="stats" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard label="Couverts Midi" :value="stats.lunchCovers" icon="☀️" color="text-amber-400" />
      <StatCard label="Couverts Soir" :value="stats.dinnerCovers" icon="🌙" color="text-indigo-400" />
      <StatCard label="Total couverts" :value="stats.totalCovers" icon="👥" color="text-brand-400" />
      <StatCard label="Réservations" :value="stats.totalBookings" icon="📋" color="text-green-400" />
    </div>

    <!-- By date table -->
    <div v-if="stats && Object.keys(stats.byDate).length" class="card overflow-hidden">
      <div class="px-4 py-3 border-b border-slate-700">
        <h2 class="font-medium text-slate-200 text-sm">Détail par jour</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-700">
              <th class="px-4 py-2 text-left text-xs text-slate-400 font-medium">Date</th>
              <th class="px-4 py-2 text-right text-xs text-slate-400 font-medium">Midi</th>
              <th class="px-4 py-2 text-right text-xs text-slate-400 font-medium">Soir</th>
              <th class="px-4 py-2 text-right text-xs text-slate-400 font-medium">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700/50">
            <tr v-for="(day, date) in stats.byDate" :key="date" class="hover:bg-slate-700/30">
              <td class="px-4 py-2 text-slate-300 capitalize">{{ formatDate(String(date)) }}</td>
              <td class="px-4 py-2 text-right text-amber-400">{{ day.lunch || '—' }}</td>
              <td class="px-4 py-2 text-right text-indigo-400">{{ day.dinner || '—' }}</td>
              <td class="px-4 py-2 text-right text-slate-100 font-medium">{{ (day.lunch || 0) + (day.dinner || 0) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="!stats && !loading" class="text-center py-12 text-slate-500">
      Sélectionnez une période pour afficher les statistiques
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'
import { api } from '@/lib/api'
import StatCard from '@/components/stats/StatCard.vue'

dayjs.locale('fr')

const route = useRoute()
const restaurantId = computed(() => route.params.restaurantId as string)

const dateFrom = ref(dayjs().subtract(30, 'day').format('YYYY-MM-DD'))
const dateTo = ref(dayjs().format('YYYY-MM-DD'))
const loading = ref(false)
const stats = ref<any>(null)

async function loadStats() {
  loading.value = true
  try {
    const { data } = await api.get(`/restaurants/${restaurantId.value}/stats`, {
      params: { from: dateFrom.value, to: dateTo.value },
    })
    stats.value = data
  } finally {
    loading.value = false
  }
}

function setPreset(preset: 'week' | 'month' | 'quarter') {
  dateTo.value = dayjs().format('YYYY-MM-DD')
  const days = { week: 7, month: 30, quarter: 90 }
  dateFrom.value = dayjs().subtract(days[preset], 'day').format('YYYY-MM-DD')
}

function formatDate(date: string) {
  return dayjs(date).format('ddd D MMM')
}

onMounted(loadStats)
</script>
