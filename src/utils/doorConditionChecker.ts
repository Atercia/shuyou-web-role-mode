import type {
  DoorRequirement,
  DoorCondition,
  ConditionGroup,
  ConditionCheckResult,
  ConditionType
} from '@/types/door'
import type { FragmentRarity } from '@/types/inventory'
import { useInventoryStore } from '@/stores/inventory'
import { useFragmentStore } from '@/stores/fragment'

// 检查单个条件
function checkSingleCondition(
  condition: DoorCondition,
  inventoryStore: ReturnType<typeof useInventoryStore>,
  fragmentStore: ReturnType<typeof useFragmentStore>
): boolean {
  const { type, params } = condition

  switch (type) {
    case 'has_fragment': {
      // 检查是否拥有特定ID的碎片
      return params.id ? inventoryStore.hasFragment(params.id) : false
    }

    case 'has_fragment_name': {
      // 检查是否拥有特定名称的碎片（模糊匹配）
      if (!params.name) return false
      return inventoryStore.fragments.some(f =>
        f.name.includes(params.name!)
      )
    }

    case 'has_rarity': {
      // 检查是否拥有特定稀有度的碎片（达到数量要求）
      if (!params.rarity) return false
      const count = inventoryStore.fragments.filter(
        f => f.rarity === params.rarity
      ).length
      return compare(count, params.count ?? 1, params.operator ?? 'gte')
    }

    case 'fragment_count': {
      // 检查碎片总数
      const count = inventoryStore.fragmentCount
      return compare(count, params.count ?? 0, params.operator ?? 'gte')
    }

    case 'has_item': {
      // 检查是否拥有特定物品
      return params.id ? inventoryStore.hasItem(params.id) : false
    }

    case 'npc_interacted': {
      // 检查是否与特定NPC交互过
      return params.id ? fragmentStore.isNPCInteracted(params.id) : false
    }

    case 'npc_interacted_count': {
      // 检查交互过的NPC数量
      const count = fragmentStore.interactedNPCs.size
      return compare(count, params.count ?? 0, params.operator ?? 'gte')
    }

    default:
      return false
  }
}

// 比较函数
function compare(
  value: number,
  target: number,
  operator: 'gte' | 'lte' | 'eq' | 'gt' | 'lt'
): boolean {
  switch (operator) {
    case 'gte': return value >= target
    case 'lte': return value <= target
    case 'eq': return value === target
    case 'gt': return value > target
    case 'lt': return value < target
    default: return false
  }
}

// 检查条件组（组内条件是OR关系）
function checkConditionGroup(
  group: ConditionGroup,
  inventoryStore: ReturnType<typeof useInventoryStore>,
  fragmentStore: ReturnType<typeof useFragmentStore>
): {
  satisfied: boolean
  matchedConditions: number
  totalConditions: number
} {
  let matchedConditions = 0

  for (const condition of group.conditions) {
    if (checkSingleCondition(condition, inventoryStore, fragmentStore)) {
      matchedConditions++
    }
  }

  // 组内条件是OR关系，至少满足一个即可
  return {
    satisfied: matchedConditions > 0,
    matchedConditions,
    totalConditions: group.conditions.length
  }
}

// 检查门的进入条件
export function checkDoorRequirement(
  requirement: DoorRequirement | undefined,
  inventoryStore: ReturnType<typeof useInventoryStore>,
  fragmentStore: ReturnType<typeof useFragmentStore>
): ConditionCheckResult {
  // 如果没有要求，默认允许进入
  if (!requirement) {
    return {
      satisfied: true,
      groupResults: [],
      unmetGroups: []
    }
  }

  const groupResults: ConditionCheckResult['groupResults'] = []
  const unmetGroups: string[] = []

  // 检查组（组之间是AND关系，所有组都必须满足）
  for (let i = 0; i < requirement.groups.length; i++) {
    const group = requirement.groups[i]
    const result = checkConditionGroup(group, inventoryStore, fragmentStore)

    groupResults.push({
      groupIndex: i,
      description: group.description,
      satisfied: result.satisfied,
      matchedConditions: result.matchedConditions,
      totalConditions: result.totalConditions
    })

    if (!result.satisfied) {
      unmetGroups.push(group.description)
    }
  }

  // 所有组都必须满足
  const satisfied = unmetGroups.length === 0

  return {
    satisfied,
    groupResults,
    unmetGroups
  }
}

// 获取条件状态文本（用于UI显示）
export function getConditionStatusText(
  condition: DoorCondition,
  inventoryStore: ReturnType<typeof useInventoryStore>,
  fragmentStore: ReturnType<typeof useFragmentStore>
): { text: string; satisfied: boolean } {
  const satisfied = checkSingleCondition(condition, inventoryStore, fragmentStore)

  return {
    text: condition.description,
    satisfied
  }
}

// 获取门的条件概览（用于交互提示）
export function getDoorConditionSummary(
  requirement: DoorRequirement | undefined,
  inventoryStore: ReturnType<typeof useInventoryStore>,
  fragmentStore: ReturnType<typeof useFragmentStore>
): {
  canEnter: boolean
  summary: string
  details: { description: string; satisfied: boolean }[]
} {
  if (!requirement) {
    return {
      canEnter: true,
      summary: '无进入限制',
      details: []
    }
  }

  const result = checkDoorRequirement(requirement, inventoryStore, fragmentStore)
  const details: { description: string; satisfied: boolean }[] = []

  for (const group of requirement.groups) {
    const groupResult = result.groupResults.find(r => r.description === group.description)
    details.push({
      description: group.description,
      satisfied: groupResult?.satisfied ?? false
    })
  }

  return {
    canEnter: result.satisfied,
    summary: result.satisfied
      ? requirement.successMessage
      : requirement.failureMessage,
    details
  }
}
