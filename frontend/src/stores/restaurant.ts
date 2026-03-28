import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/lib/api'
import type { Restaurant, Room, Staff } from '@/types'

export const useRestaurantStore = defineStore('restaurant', () => {
  const restaurants = ref<Restaurant[]>([])
  const current = ref<Restaurant | null>(null)
  const currentRoom = ref<Room | null>(null)
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try {
      const { data } = await api.get<Restaurant[]>('/restaurants')
      restaurants.value = data
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: string) {
    loading.value = true
    try {
      const { data } = await api.get<Restaurant>(`/restaurants/${id}`)
      current.value = data
      if (data.rooms?.length) currentRoom.value = data.rooms[0]
    } finally {
      loading.value = false
    }
  }

  async function create(payload: Partial<Restaurant>) {
    const { data } = await api.post<Restaurant>('/restaurants', payload)
    restaurants.value.push(data)
    return data
  }

  async function update(id: string, payload: Partial<Restaurant>) {
    const { data } = await api.put<Restaurant>(`/restaurants/${id}`, payload)
    const idx = restaurants.value.findIndex((r) => r.id === id)
    if (idx !== -1) restaurants.value[idx] = data
    if (current.value?.id === id) current.value = data
    return data
  }

  async function remove(id: string) {
    await api.delete(`/restaurants/${id}`)
    restaurants.value = restaurants.value.filter((r) => r.id !== id)
    if (current.value?.id === id) current.value = null
  }

  function setCurrentRoom(room: Room) {
    currentRoom.value = room
  }

  return { restaurants, current, currentRoom, loading, fetchAll, fetchOne, create, update, remove, setCurrentRoom }
})
