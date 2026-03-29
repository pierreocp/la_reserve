import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/lib/api'
import type { Customer } from '@/types'

export const useCustomersStore = defineStore('customers', () => {
  const customers = ref<Customer[]>([])
  const selected = ref<Customer | null>(null)
  const loading = ref(false)

  async function fetchAll(restaurantId: string, search?: string) {
    loading.value = true
    try {
      const { data } = await api.get<Customer[]>(`/restaurants/${restaurantId}/customers`, {
        params: { ...(search && { search }) },
      })
      customers.value = data
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(restaurantId: string, id: string) {
    const { data } = await api.get<Customer>(`/restaurants/${restaurantId}/customers/${id}`)
    selected.value = data
    return data
  }

  async function create(restaurantId: string, payload: Partial<Customer>) {
    const { data } = await api.post<Customer>(`/restaurants/${restaurantId}/customers`, payload)
    customers.value.push(data)
    return data
  }

  async function update(restaurantId: string, id: string, payload: Partial<Customer>) {
    const { data } = await api.put<Customer>(`/restaurants/${restaurantId}/customers/${id}`, payload)
    const idx = customers.value.findIndex((c) => c.id === id)
    if (idx !== -1) customers.value[idx] = data
    if (selected.value?.id === id) selected.value = data
    return data
  }

  async function remove(restaurantId: string, id: string) {
    await api.delete(`/restaurants/${restaurantId}/customers/${id}`)
    customers.value = customers.value.filter((c) => c.id !== id)
    if (selected.value?.id === id) selected.value = null
  }

  return { customers, selected, loading, fetchAll, fetchOne, create, update, remove }
})
