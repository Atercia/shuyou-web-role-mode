// 隐喻碎片稀有度
export enum FragmentRarity {
  Common = 'common',      // 普通
  Uncommon = 'uncommon',  // 稀有
  Rare = 'rare',          // 史诗
  Legendary = 'legendary' // 传说
}

// 隐喻碎片完整度
export enum FragmentCompleteness {
  Fragmented = 'fragmented',   // 碎片 (30-50%)
  Partial = 'partial',         // 残缺 (51-70%)
  MostlyComplete = 'mostly',   // 较完整 (71-90%)
  Complete = 'complete'        // 完整 (91-100%)
}

// 隐喻碎片
export interface MetaphorFragment {
  id: string
  name: string
  description: string
  rarity: FragmentRarity
  completeness: FragmentCompleteness
  completenessValue: number // 具体百分比 30-100
  icon: string
  obtainedAt: Date
}

// 背包物品
export interface InventoryItem {
  id: string
  type: 'fragment' | 'key' | 'tool' | 'potion'
  name: string
  description: string
  icon: string
  quantity: number
  metadata?: Record<string, any>
}

// 背包状态
export interface InventoryState {
  items: InventoryItem[]
  fragments: MetaphorFragment[]
  maxSlots: number
}
