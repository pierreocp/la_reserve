<template>
  <div class="min-h-screen bg-slate-900 p-6">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-slate-100">Mes restaurants</h1>
          <p class="text-slate-400 text-sm mt-1">Bonjour {{ authStore.user?.firstName }} 👋</p>
        </div>
        <div class="flex items-center gap-3">
          <button @click="showCreate = true" class="btn-primary">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
            Nouveau restaurant
          </button>
          <button @click="authStore.logout(); $router.push('/login')" class="btn-ghost text-slate-400">
            Déconnexion
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="restaurantStore.loading" class="text-center py-12 text-slate-400">Chargement...</div>

      <!-- Empty state -->
      <div v-else-if="!restaurantStore.restaurants.length" class="text-center py-16">
        <div class="text-slate-600 text-6xl mb-4">🍽</div>
        <h2 class="text-xl font-semibold text-slate-300 mb-2">Aucun restaurant</h2>
        <p class="text-slate-400 mb-6">Créez votre premier restaurant pour commencer</p>
        <button @click="showCreate = true" class="btn-primary">Créer un restaurant</button>
      </div>

      <!-- Restaurant list -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          v-for="r in restaurantStore.restaurants"
          :key="r.id"
          @click="$router.push(`/r/${r.id}`)"
          class="card p-5 text-left hover:border-brand-500/50 hover:bg-slate-700/50 transition-all duration-150 group"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-lg">
              {{ r.name[0].toUpperCase() }}
            </div>
            <svg class="w-4 h-4 text-slate-600 group-hover:text-brand-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </div>
          <h3 class="font-semibold text-slate-100">{{ r.name }}</h3>
          <p v-if="r.city" class="text-sm text-slate-400 mt-0.5">{{ r.city }}</p>
          <p class="text-xs text-slate-500 mt-2">{{ r.rooms?.length || 0 }} salle(s)</p>
        </button>
      </div>
    </div>

    <!-- Create restaurant modal -->
    <div v-if="showCreate" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showCreate = false">
      <div class="card w-full max-w-md p-6">
        <h3 class="text-lg font-semibold text-slate-100 mb-4">Nouveau restaurant</h3>
        <form @submit.prevent="handleCreate" class="space-y-3">
          <div>
            <label class="label">Nom *</label>
            <input v-model="createForm.name" type="text" class="input" placeholder="Ma Brasserie" required />
          </div>
          <div>
            <label class="label">Ville</label>
            <input v-model="createForm.city" type="text" class="input" placeholder="Paris" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Téléphone</label>
              <input v-model="createForm.phone" type="text" class="input" placeholder="01 23 45 67 89" />
            </div>
            <div>
              <label class="label">Email</label>
              <input v-model="createForm.email" type="email" class="input" placeholder="contact@..." />
            </div>
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRestaurantStore } from '@/stores/restaurant'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const restaurantStore = useRestaurantStore()
const authStore = useAuthStore()

const showCreate = ref(false)
const creating = ref(false)
const createForm = reactive({ name: '', city: '', phone: '', email: '' })

onMounted(() => restaurantStore.fetchAll())

async function handleCreate() {
  creating.value = true
  try {
    const r = await restaurantStore.create(createForm)
    showCreate.value = false
    router.push(`/r/${r.id}`)
  } finally {
    creating.value = false
  }
}
</script>
