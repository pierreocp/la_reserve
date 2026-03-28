import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/lib/api'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!token.value)

  async function fetchMe() {
    try {
      const { data } = await api.get<User>('/auth/me')
      user.value = data
    } catch {
      logout()
    }
  }

  async function login(email: string, password: string) {
    const { data } = await api.post<{ user: User; token: string }>('/auth/login', { email, password })
    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
  }

  async function register(email: string, password: string, firstName: string, lastName: string) {
    const { data } = await api.post<{ user: User; token: string }>('/auth/register', {
      email,
      password,
      firstName,
      lastName,
    })
    token.value = data.token
    user.value = data.user
    localStorage.setItem('token', data.token)
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  // Init: load user if token exists
  if (token.value) fetchMe()

  return { user, token, isAuthenticated, fetchMe, login, register, logout }
})
