import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  // State
  const count = ref(0)
  const isLoading = ref(false)

  // Getters
  const doubleCount = computed(() => count.value * 2)

  // Actions
  function increment() {
    count.value++
  }

  function setLoading(value: boolean) {
    isLoading.value = value
  }

  return {
    count,
    isLoading,
    doubleCount,
    increment,
    setLoading
  }
})
