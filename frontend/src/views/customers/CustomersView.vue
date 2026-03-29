<template>
  <div class="flex h-full">
    <!-- Customers list -->
    <div class="w-80 border-r border-slate-700 flex flex-col shrink-0">
      <!-- Search + add -->
      <div class="p-4 border-b border-slate-700 space-y-3">
        <div class="relative">
          <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            v-model="search"
            type="text"
            class="input pl-9"
            placeholder="Rechercher..."
            @input="debouncedSearch"
          />
        </div>
        <button @click="showCreate = true" class="btn-primary w-full justify-center text-sm">
          Nouveau client
        </button>
      </div>

      <!-- List -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="customersStore.loading" class="p-4 text-center text-slate-400 text-sm">Chargement...</div>
        <div v-else-if="!customersStore.customers.length" class="p-4 text-center text-slate-500 text-sm">Aucun client</div>
        <button
          v-else
          v-for="c in customersStore.customers"
          :key="c.id"
          @click="selectCustomer(c.id)"
          class="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-700/50 transition-colors border-b border-slate-700/50 text-left"
          :class="customersStore.selected?.id === c.id ? 'bg-slate-700/80' : ''"
        >
          <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
               :class="c.vip ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-600 text-slate-300'">
            {{ c.firstName[0] }}{{ c.lastName[0] }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1">
              <span class="font-medium text-slate-100 text-sm truncate">{{ c.lastName }} {{ c.firstName }}</span>
              <span v-if="c.vip" class="text-xs text-amber-400 shrink-0">⭐</span>
            </div>
            <div class="text-xs text-slate-400 truncate">{{ c.phone || c.email || '—' }}</div>
          </div>
          <div class="text-xs text-slate-500 shrink-0">{{ c._count?.bookings || 0 }}x</div>
        </button>
      </div>
    </div>

    <!-- Customer detail -->
    <div class="flex-1 overflow-y-auto p-6">
      <div v-if="!customersStore.selected" class="flex items-center justify-center h-full text-slate-500">
        Sélectionnez un client
      </div>

      <CustomerDetail
        v-else
        :customer="customersStore.selected"
        :restaurant-id="restaurantId"
        @updated="handleUpdated"
        @deleted="handleDeleted"
      />
    </div>

    <!-- Create customer modal -->
    <div v-if="showCreate" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showCreate = false">
      <div class="card w-full max-w-md p-6">
        <h3 class="text-lg font-semibold text-slate-100 mb-4">Nouveau client</h3>
        <form @submit.prevent="handleCreate" class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Prénom *</label>
              <input v-model="createForm.firstName" type="text" class="input" required />
            </div>
            <div>
              <label class="label">Nom *</label>
              <input v-model="createForm.lastName" type="text" class="input" required />
            </div>
          </div>
          <div>
            <label class="label">Téléphone</label>
            <input v-model="createForm.phone" type="tel" class="input" />
          </div>
          <div>
            <label class="label">Email</label>
            <input v-model="createForm.email" type="email" class="input" />
          </div>
          <div class="flex items-center gap-2">
            <input v-model="createForm.vip" type="checkbox" id="vip" class="w-4 h-4 accent-brand-500" />
            <label for="vip" class="text-sm text-slate-300 cursor-pointer">Client VIP ⭐</label>
          </div>
          <div class="flex gap-3 pt-2">
            <button type="button" @click="showCreate = false" class="btn-secondary flex-1 justify-center">Annuler</button>
            <button type="submit" class="btn-primary flex-1 justify-center" :disabled="creating">
              {{ creating ? 'Création...' : 'Créer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCustomersStore } from '@/stores/customers'
import CustomerDetail from '@/components/customers/CustomerDetail.vue'

const route = useRoute()
const customersStore = useCustomersStore()
const restaurantId = computed(() => route.params.restaurantId as string)

const search = ref('')
const showCreate = ref(false)
const creating = ref(false)
const createForm = reactive({ firstName: '', lastName: '', phone: '', email: '', vip: false })

let debounceTimer: ReturnType<typeof setTimeout>
function debouncedSearch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => customersStore.fetchAll(restaurantId.value, search.value), 300)
}

onMounted(() => customersStore.fetchAll(restaurantId.value))

async function selectCustomer(id: string) {
  await customersStore.fetchOne(restaurantId.value, id)
}

async function handleCreate() {
  creating.value = true
  try {
    await customersStore.create(restaurantId.value, createForm)
    showCreate.value = false
  } finally {
    creating.value = false
  }
}

function handleUpdated() {
  customersStore.fetchAll(restaurantId.value, search.value)
}

function handleDeleted() {
  customersStore.fetchAll(restaurantId.value)
}
</script>
