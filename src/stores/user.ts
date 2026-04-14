import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 用户年龄存储
export const useUserStore = defineStore('user', () => {
  // State - 初始年龄9岁，以周为单位存储
  const ageInWeeks = ref<number>(9 * 52) // 9岁 = 9 * 52周

  // Getters
  const formattedAge = computed(() => {
    const totalWeeks = ageInWeeks.value
    const years = Math.floor(totalWeeks / 52)
    const remainingWeeks = totalWeeks % 52
    const months = Math.floor(remainingWeeks / 4)
    const weeks = remainingWeeks % 4

    const parts: string[] = []
    if (years > 0) parts.push(`${years}年`)
    if (months > 0) parts.push(`${months}个月`)
    if (weeks > 0) parts.push(`${weeks}周`)

    return parts.length > 0 ? parts.join('') : '0周'
  })

  // Actions
  function addWeeks(weeks: number) {
    ageInWeeks.value += weeks
  }

  function resetAge() {
    ageInWeeks.value = 9 * 52
  }

  return {
    // State
    ageInWeeks,
    // Getters
    formattedAge,
    // Actions
    addWeeks,
    resetAge
  }
})
