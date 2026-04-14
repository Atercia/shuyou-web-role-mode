import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { 
  MetaphorFragment, 
  InventoryItem, 
  FragmentRarity, 
  FragmentCompleteness 
} from '@/types/inventory'

export const useInventoryStore = defineStore('inventory', () => {
  // State
  const items = ref<InventoryItem[]>([])
  const fragments = ref<MetaphorFragment[]>([])
  const maxSlots = ref(20)

  // Getters
  const fragmentCount = computed(() => fragments.value.length)
  const itemCount = computed(() => items.value.length)
  const totalSlots = computed(() => items.value.length + fragments.value.length)
  const isFull = computed(() => totalSlots.value >= maxSlots.value)

  const fragmentsByRarity = computed(() => {
    return (rarity: FragmentRarity) => 
      fragments.value.filter(f => f.rarity === rarity)
  })

  const getFragmentRarityColor = (rarity: FragmentRarity): string => {
    const colors = {
      common: '#9e9e9e',      // 灰色
      uncommon: '#4caf50',    // 绿色
      rare: '#2196f3',        // 蓝色
      legendary: '#ff9800'    // 橙色
    }
    return colors[rarity]
  }

  const getFragmentRarityName = (rarity: FragmentRarity): string => {
    const names = {
      common: '普通',
      uncommon: '稀有',
      rare: '史诗',
      legendary: '传说'
    }
    return names[rarity]
  }

  const getCompletenessName = (completeness: FragmentCompleteness): string => {
    const names = {
      fragmented: '碎片',
      partial: '残缺',
      mostlyComplete: '较完整',
      complete: '完整'
    }
    return names[completeness]
  }

  // Actions
  function addFragment(fragment: MetaphorFragment) {
    fragments.value.push(fragment)
  }

  function addItem(item: InventoryItem) {
    const existing = items.value.find(i => i.id === item.id)
    if (existing) {
      existing.quantity += item.quantity
    } else {
      items.value.push(item)
    }
  }

  function removeFragment(fragmentId: string) {
    const index = fragments.value.findIndex(f => f.id === fragmentId)
    if (index > -1) {
      fragments.value.splice(index, 1)
    }
  }

  function removeItem(itemId: string, quantity: number = 1) {
    const index = items.value.findIndex(i => i.id === itemId)
    if (index > -1) {
      const item = items.value[index]
      item.quantity -= quantity
      if (item.quantity <= 0) {
        items.value.splice(index, 1)
      }
    }
  }

  function hasItem(itemId: string): boolean {
    return items.value.some(i => i.id === itemId)
  }

  function hasFragment(fragmentId: string): boolean {
    return fragments.value.some(f => f.id === fragmentId)
  }

  function generateFragment(
    baseName: string,
    description: string,
    icon: string
  ): MetaphorFragment {
    // 随机稀有度
    const rarityRoll = Math.random()
    let rarity: FragmentRarity
    if (rarityRoll < 0.5) rarity = 'common'
    else if (rarityRoll < 0.75) rarity = 'uncommon'
    else if (rarityRoll < 0.9) rarity = 'rare'
    else rarity = 'legendary'

    // 随机完整度 30-100
    const completenessValue = Math.floor(Math.random() * 71) + 30
    
    let completeness: FragmentCompleteness
    if (completenessValue < 50) completeness = 'fragmented'
    else if (completenessValue < 70) completeness = 'partial'
    else if (completenessValue < 90) completeness = 'mostlyComplete'
    else completeness = 'complete'

    return {
      id: `fragment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: baseName,
      description,
      rarity,
      completeness,
      completenessValue,
      icon,
      obtainedAt: new Date()
    }
  }

  function reset() {
    items.value = []
    fragments.value = []
  }

  return {
    items,
    fragments,
    maxSlots,
    fragmentCount,
    itemCount,
    totalSlots,
    isFull,
    fragmentsByRarity,
    getFragmentRarityColor,
    getFragmentRarityName,
    getCompletenessName,
    addFragment,
    addItem,
    removeFragment,
    removeItem,
    hasItem,
    hasFragment,
    generateFragment,
    reset
  }
})
