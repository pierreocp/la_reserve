import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/lib/api'
import type { Booking, BookingPeriod } from '@/types'

export const useBookingsStore = defineStore('bookings', () => {
  const bookings = ref<Booking[]>([])
  const loading = ref(false)

  async function fetchByDate(restaurantId: string, date: string, period?: BookingPeriod) {
    loading.value = true
    try {
      const { data } = await api.get<Booking[]>(`/restaurants/${restaurantId}/bookings`, {
        params: { date, ...(period && { period }) },
      })
      bookings.value = data
    } finally {
      loading.value = false
    }
  }

  async function create(restaurantId: string, payload: Record<string, any>) {
    const { data } = await api.post<Booking>(`/restaurants/${restaurantId}/bookings`, payload)
    bookings.value.push(data)
    return data
  }

  async function update(restaurantId: string, id: string, payload: Record<string, any>) {
    const { data } = await api.put<Booking>(`/restaurants/${restaurantId}/bookings/${id}`, payload)
    const idx = bookings.value.findIndex((b) => b.id === id)
    if (idx !== -1) bookings.value[idx] = data
    return data
  }

  async function remove(restaurantId: string, id: string) {
    await api.delete(`/restaurants/${restaurantId}/bookings/${id}`)
    bookings.value = bookings.value.filter((b) => b.id !== id)
  }

  async function updateStatus(restaurantId: string, id: string, status: string) {
    return update(restaurantId, id, { status })
  }

  return { bookings, loading, fetchByDate, create, update, remove, updateStatus }
})
