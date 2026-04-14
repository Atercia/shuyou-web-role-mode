import type { FragmentRarity } from './inventory'

// 条件类型
export enum ConditionType {
  // 拥有特定ID的碎片
  HAS_FRAGMENT = 'has_fragment',
  // 拥有特定稀有度的碎片（至少一个）
  HAS_RARITY = 'has_rarity',
  // 拥有特定名称的碎片
  HAS_FRAGMENT_NAME = 'has_fragment_name',
  // 背包中碎片数量达到要求
  FRAGMENT_COUNT = 'fragment_count',
  // 拥有特定物品
  HAS_ITEM = 'has_item',
  // 与特定NPC交互过
  NPC_INTERACTED = 'npc_interacted',
  // 与至少N个NPC交互过
  NPC_INTERACTED_COUNT = 'npc_interacted_count'
}

// 单个进入条件
export interface DoorCondition {
  type: ConditionType
  // 条件描述（显示给玩家）
  description: string
  // 条件参数
  params: {
    // 碎片ID、物品ID、NPC ID等
    id?: string
    // 碎片名称（模糊匹配）
    name?: string
    // 稀有度
    rarity?: FragmentRarity
    // 数量要求
    count?: number
    // 比较操作符（用于数量比较）
    operator?: 'gte' | 'lte' | 'eq' | 'gt' | 'lt'
  }
}

// 条件组（满足其中至少一个即可）
export interface ConditionGroup {
  // 组描述
  description: string
  // 条件列表（OR关系）
  conditions: DoorCondition[]
}

// 门进入要求
export interface DoorRequirement {
  // 条件组列表（AND关系，所有组都必须满足）
  groups: ConditionGroup[]
  // 不满足时的提示信息
  failureMessage: string
  // 满足时的提示信息
  successMessage: string
}

// 检查条件的结果
export interface ConditionCheckResult {
  // 是否满足
  satisfied: boolean
  // 各条件组的检查结果
  groupResults: {
    groupIndex: number
    description: string
    satisfied: boolean
    // 该组中满足的条件
    matchedConditions: number
    totalConditions: number
  }[]
  // 未满足的条件组描述
  unmetGroups: string[]
}
