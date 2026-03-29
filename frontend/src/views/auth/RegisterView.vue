<template>
  <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-brand-500">La Réserve</h1>
        <p class="text-slate-400 mt-2 text-sm">Créez votre compte</p>
      </div>

      <div class="card p-8">
        <h2 class="text-xl font-semibold text-slate-100 mb-6">Nouveau compte</h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Prénom</label>
              <input v-model="form.firstName" type="text" class="input" placeholder="Jean" required />
            </div>
            <div>
              <label class="label">Nom</label>
              <input v-model="form.lastName" type="text" class="input" placeholder="Dupont" required />
            </div>
          </div>

          <div>
            <label class="label">Email</label>
            <input v-model="form.email" type="email" class="input" placeholder="vous@exemple.com" required autocomplete="email" />
          </div>

          <div>
            <label class="label">Mot de passe</label>
            <input v-model="form.password" type="password" class="input" placeholder="8 caractères minimum" required minlength="8" autocomplete="new-password" />
          </div>

          <div v-if="error" class="text-sm text-red-400 bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2">
            {{ error }}
          </div>

          <button type="submit" class="btn-primary w-full justify-center py-2.5" :disabled="loading">
            <span v-if="loading">Création...</span>
            <span v-else>Créer mon compte</span>
          </button>
        </form>

        <p class="text-center text-sm text-slate-400 mt-6">
          Déjà un compte ?
          <RouterLink to="/login" class="text-brand-500 hover:text-brand-400 font-medium transition-colors">
            Se connecter
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({ firstName: '', lastName: '', email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  loading.value = true
  error.value = ''
  try {
    await authStore.register(form.email, form.password, form.firstName, form.lastName)
    router.push('/')
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Erreur lors de la création du compte'
  } finally {
    loading.value = false
  }
}
</script>
