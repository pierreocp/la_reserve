<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-xl font-bold text-slate-100 mb-6">Paramètres</h1>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 border-b border-slate-700">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px"
        :class="activeTab === tab.id
          ? 'border-brand-500 text-brand-400'
          : 'border-transparent text-slate-400 hover:text-slate-200'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Restaurant tab -->
    <div v-if="activeTab === 'restaurant'" class="card p-5">
      <form @submit.prevent="saveRestaurant" class="space-y-4">
        <div>
          <label class="label">Nom du restaurant *</label>
          <input v-model="restForm.name" type="text" class="input" required />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">Adresse</label>
            <input v-model="restForm.address" type="text" class="input" />
          </div>
          <div>
            <label class="label">Ville</label>
            <input v-model="restForm.city" type="text" class="input" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">Téléphone</label>
            <input v-model="restForm.phone" type="tel" class="input" />
          </div>
          <div>
            <label class="label">Email</label>
            <input v-model="restForm.email" type="email" class="input" />
          </div>
        </div>
        <button type="submit" class="btn-primary" :disabled="saving">
          {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </form>
    </div>

    <!-- Staff tab -->
    <div v-if="activeTab === 'staff'" class="space-y-3">
      <div class="flex justify-between items-center">
        <p class="text-sm text-slate-400">{{ staff.length }} membre(s) du personnel</p>
        <button @click="showAddStaff = true" class="btn-primary text-sm">Ajouter</button>
      </div>
      <div class="card divide-y divide-slate-700">
        <div v-if="!staff.length" class="p-4 text-center text-slate-500 text-sm">Aucun personnel</div>
        <div v-for="s in staff" :key="s.id" class="flex items-center gap-3 px-4 py-3">
          <div class="w-3 h-3 rounded-full shrink-0" :style="{ background: s.color }"></div>
          <span class="flex-1 text-slate-200">{{ s.name }}</span>
          <button @click="removeStaff(s.id)" class="btn-danger p-1 text-xs">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>

      <div v-if="showAddStaff" class="card p-4">
        <form @submit.prevent="addStaff" class="flex gap-3 items-end">
          <div class="flex-1">
            <label class="label">Nom</label>
            <input v-model="newStaff.name" type="text" class="input" placeholder="Marie Martin" required />
          </div>
          <div>
            <label class="label">Couleur</label>
            <input v-model="newStaff.color" type="color" class="h-10 w-16 rounded-lg bg-transparent border border-slate-600 cursor-pointer" />
          </div>
          <button type="submit" class="btn-primary shrink-0">Ajouter</button>
          <button type="button" @click="showAddStaff = false" class="btn-ghost shrink-0">Annuler</button>
        </form>
      </div>
    </div>

    <!-- Rooms tab -->
    <div v-if="activeTab === 'rooms'" class="space-y-3">
      <div class="flex justify-between items-center">
        <p class="text-sm text-slate-400">{{ rooms.length }} salle(s)</p>
        <button @click="showAddRoom = true" class="btn-primary text-sm">Ajouter une salle</button>
      </div>
      <div class="card divide-y divide-slate-700">
        <div v-if="!rooms.length" class="p-4 text-center text-slate-500 text-sm">Aucune salle</div>
        <div v-for="room in rooms" :key="room.id" class="flex items-center gap-3 px-4 py-3">
          <span class="flex-1 text-slate-200">{{ room.name }}</span>
          <span class="text-xs text-slate-500">{{ room.floor === 0 ? 'RDC' : `Étage ${room.floor}` }}</span>
          <span class="text-xs text-slate-500">{{ room.tables?.length || 0 }} table(s)</span>
        </div>
      </div>

      <div v-if="showAddRoom" class="card p-4">
        <form @submit.prevent="addRoom" class="flex gap-3 items-end">
          <div class="flex-1">
            <label class="label">Nom</label>
            <input v-model="newRoom.name" type="text" class="input" placeholder="Salle principale" required />
          </div>
          <div>
            <label class="label">Étage</label>
            <input v-model.number="newRoom.floor" type="number" min="0" class="input w-20" />
          </div>
          <button type="submit" class="btn-primary shrink-0">Ajouter</button>
          <button type="button" @click="showAddRoom = false" class="btn-ghost shrink-0">Annuler</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/lib/api'
import { useRestaurantStore } from '@/stores/restaurant'

const route = useRoute()
const restaurantStore = useRestaurantStore()
const restaurantId = computed(() => route.params.restaurantId as string)

const activeTab = ref('restaurant')
const saving = ref(false)
const showAddStaff = ref(false)
const showAddRoom = ref(false)

const tabs = [
  { id: 'restaurant', label: 'Restaurant' },
  { id: 'staff', label: 'Personnel' },
  { id: 'rooms', label: 'Salles' },
]

const restForm = reactive({
  name: '',
  address: '',
  city: '',
  phone: '',
  email: '',
})

const newStaff = reactive({ name: '', color: '#6366f1' })
const newRoom = reactive({ name: '', floor: 0 })
const staff = ref<any[]>([])
const rooms = computed(() => restaurantStore.current?.rooms || [])

watch(
  () => restaurantStore.current,
  (r) => {
    if (r) Object.assign(restForm, { name: r.name, address: r.address || '', city: r.city || '', phone: r.phone || '', email: r.email || '' })
  },
  { immediate: true },
)

async function loadStaff() {
  const { data } = await api.get(`/restaurants/${restaurantId.value}/staff`)
  staff.value = data
}

async function saveRestaurant() {
  saving.value = true
  try {
    await restaurantStore.update(restaurantId.value, restForm)
  } finally {
    saving.value = false
  }
}

async function addStaff() {
  await api.post(`/restaurants/${restaurantId.value}/staff`, newStaff)
  newStaff.name = ''
  newStaff.color = '#6366f1'
  showAddStaff.value = false
  await loadStaff()
}

async function removeStaff(id: string) {
  if (!confirm('Supprimer ce membre du personnel ?')) return
  await api.delete(`/restaurants/${restaurantId.value}/staff/${id}`)
  await loadStaff()
}

async function addRoom() {
  await api.post(`/restaurants/${restaurantId.value}/rooms`, newRoom)
  newRoom.name = ''
  newRoom.floor = 0
  showAddRoom.value = false
  await restaurantStore.fetchOne(restaurantId.value)
}

onMounted(loadStaff)
</script>
