import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { MetaphorType, METAPHOR_CONFIG, type MetaphorFragment, type MetaphorProgress } from '@/types/metaphor'
import { FragmentCategory, FRAGMENT_CATEGORY_CONFIG } from '@/types/metaphor'

export const useMetaphorStore = defineStore('metaphor', () => {
  // State
  const allFragments = ref<MetaphorFragment[]>([])
  const metaphorProgress = ref<Map<MetaphorType, MetaphorProgress>>(new Map())

  // Getters
  const totalFragments = computed(() => allFragments.value.length)

  const fragmentsByCategory = computed(() => {
    const result: Record<FragmentCategory, MetaphorFragment[]> = {
      [FragmentCategory.EMOTION]: [],
      [FragmentCategory.COGNITION]: [],
      [FragmentCategory.EXISTENCE]: [],
      [FragmentCategory.SOCIAL]: [],
      [FragmentCategory.NATURE]: []
    }
    allFragments.value.forEach(f => {
      result[f.category].push(f)
    })
    return result
  })

  const fragmentsByMetaphor = computed(() => {
    const result: Record<MetaphorType, MetaphorFragment[]> = {} as Record<MetaphorType, MetaphorFragment[]>
    Object.values(MetaphorType).forEach(type => {
      result[type] = []
    })
    allFragments.value.forEach(f => {
      f.metaphors.forEach(m => {
        if (result[m]) {
          result[m].push(f)
        }
      })
    })
    return result
  })

  const categoryStats = computed(() => {
    const stats: Record<FragmentCategory, { total: number; unlocked: number }> = {
      [FragmentCategory.EMOTION]: { total: 0, unlocked: 0 },
      [FragmentCategory.COGNITION]: { total: 0, unlocked: 0 },
      [FragmentCategory.EXISTENCE]: { total: 0, unlocked: 0 },
      [FragmentCategory.SOCIAL]: { total: 0, unlocked: 0 },
      [FragmentCategory.NATURE]: { total: 0, unlocked: 0 }
    }

    allFragments.value.forEach(f => {
      stats[f.category].total++
    })

    return stats
  })

  const metaphorStats = computed(() => {
    const stats: Record<MetaphorType, { count: number; unlockProgress: number; isUnlocked: boolean }> = {} as Record<MetaphorType, { count: number; unlockProgress: number; isUnlocked: boolean }>

    Object.values(MetaphorType).forEach(type => {
      const fragments = fragmentsByMetaphor.value[type] || []
      const count = fragments.length
      // 解锁进度：每收集3个碎片解锁25%，最多100%
      const unlockProgress = Math.min(100, Math.floor(count / 3) * 25)
      const isUnlocked = count > 0

      stats[type] = {
        count,
        unlockProgress,
        isUnlocked
      }
    })

    return stats
  })

  const unlockedMetaphors = computed(() => {
    return Object.values(MetaphorType).filter(type => metaphorStats.value[type].isUnlocked)
  })

  const totalUnlockProgress = computed(() => {
    const total = Object.values(MetaphorType).length
    const unlocked = unlockedMetaphors.value.length
    return Math.floor((unlocked / total) * 100)
  })

  // Actions
  function addFragment(fragment: MetaphorFragment) {
    allFragments.value.push(fragment)
    updateMetaphorProgress(fragment)
  }

  function addFragments(fragments: MetaphorFragment[]) {
    fragments.forEach(f => addFragment(f))
  }

  function updateMetaphorProgress(fragment: MetaphorFragment) {
    fragment.metaphors.forEach(metaphorType => {
      const existing = metaphorProgress.value.get(metaphorType)
      if (existing) {
        existing.collectedCount++
        existing.fragments.push(fragment.id)
        existing.unlockProgress = Math.min(100, Math.floor(existing.collectedCount / 3) * 25)
        existing.isUnlocked = true
      } else {
        metaphorProgress.value.set(metaphorType, {
          type: metaphorType,
          collectedCount: 1,
          fragments: [fragment.id],
          isUnlocked: true,
          unlockProgress: 25
        })
      }
    })
  }

  function getFragmentsByMetaphor(type: MetaphorType): MetaphorFragment[] {
    return allFragments.value.filter(f => f.metaphors.includes(type))
  }

  function getFragmentsByCategory(category: FragmentCategory): MetaphorFragment[] {
    return allFragments.value.filter(f => f.category === category)
  }

  function hasFragment(fragmentId: string): boolean {
    return allFragments.value.some(f => f.id === fragmentId)
  }

  function reset() {
    allFragments.value = []
    metaphorProgress.value.clear()
  }

  // 获取技能树数据
  function getSkillTreeData() {
    return Object.values(FragmentCategory).map(category => ({
      category,
      config: FRAGMENT_CATEGORY_CONFIG[category],
      fragments: fragmentsByCategory.value[category],
      count: fragmentsByCategory.value[category].length
    }))
  }

  // 获取隐喻总览数据
  function getMetaphorOverviewData() {
    return Object.values(MetaphorType).map(type => ({
      type,
      config: METAPHOR_CONFIG[type],
      stats: metaphorStats.value[type],
      fragments: fragmentsByMetaphor.value[type] || []
    }))
  }

  return {
    allFragments,
    metaphorProgress,
    totalFragments,
    fragmentsByCategory,
    fragmentsByMetaphor,
    categoryStats,
    metaphorStats,
    unlockedMetaphors,
    totalUnlockProgress,
    addFragment,
    addFragments,
    getFragmentsByMetaphor,
    getFragmentsByCategory,
    hasFragment,
    reset,
    getSkillTreeData,
    getMetaphorOverviewData
  }
})
