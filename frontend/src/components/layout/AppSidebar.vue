<template>
  <aside class="w-16 lg:w-56 bg-slate-800 border-r border-slate-700 flex flex-col shrink-0 transition-all duration-200">
    <!-- Logo -->
    <div class="h-14 flex items-center justify-center lg:justify-start px-4 border-b border-slate-700">
      <span class="text-brand-500 font-bold text-lg hidden lg:block">La Réserve</span>
      <span class="text-brand-500 font-bold text-lg lg:hidden">R</span>
    </div>

    <!-- Restaurant name -->
    <div class="px-3 py-3 border-b border-slate-700" v-if="restaurant">
      <div class="hidden lg:block text-xs text-slate-500 uppercase tracking-wider mb-1">Restaurant</div>
      <div class="text-sm font-medium text-slate-200 truncate hidden lg:block">{{ restaurant.name }}</div>
      <RouterLink
        to="/"
        class="text-xs text-brand-500 hover:text-brand-400 hidden lg:block mt-0.5 transition-colors"
      >
        Changer →
      </RouterLink>
    </div>

    <!-- Nav -->
    <nav class="flex-1 p-2 space-y-0.5 overflow-y-auto">
      <NavItem
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        :icon="item.icon"
        :label="item.label"
      />
    </nav>

    <!-- User -->
    <div class="p-2 border-t border-slate-700">
      <button
        @click="handleLogout"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors text-sm"
      >
        <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span class="hidden lg:block">Déconnexion</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useRestaurantStore } from '@/stores/restaurant'
import { useAuthStore } from '@/stores/auth'
import NavItem from './NavItem.vue'

const route = useRoute()
const router = useRouter()
const restaurantStore = useRestaurantStore()
const authStore = useAuthStore()

const restaurant = computed(() => restaurantStore.current)
const restaurantId = computed(() => route.params.restaurantId as string)

const navItems = computed(() => [
  {
    name: 'dashboard',
    to: `/r/${restaurantId.value}`,
    icon: 'home',
    label: 'Accueil',
  },
  {
    name: 'bookings',
    to: `/r/${restaurantId.value}/bookings`,
    icon: 'calendar',
    label: 'Réservations',
  },
  {
    name: 'floor-plan',
    to: `/r/${restaurantId.value}/floor-plan`,
    icon: 'map',
    label: 'Plan de salle',
  },
  {
    name: 'customers',
    to: `/r/${restaurantId.value}/customers`,
    icon: 'users',
    label: 'Clients',
  },
  {
    name: 'stats',
    to: `/r/${restaurantId.value}/stats`,
    icon: 'chart',
    label: 'Statistiques',
  },
  {
    name: 'settings',
    to: `/r/${restaurantId.value}/settings`,
    icon: 'settings',
    label: 'Paramètres',
  },
])

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>
