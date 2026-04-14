import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { DoorConfig } from '@/game/Door'
import type { NPCConfig } from '@/game/NPC'

export const useFragmentStore = defineStore('fragment', () => {
  // State
  const nearbyDoor = ref<DoorConfig | null>(null)
  const nearbyNPC = ref<NPCConfig | null>(null)
  const interactedNPCs = ref<Set<string>>(new Set())

  // Getters
  const hasNearbyDoor = computed(() => nearbyDoor.value !== null)
  const hasNearbyNPC = computed(() => nearbyNPC.value !== null)
  const currentNPCName = computed(() => nearbyNPC.value?.name || '')
  const currentNPCScenario = computed(() => nearbyNPC.value?.scenario || null)

  // Actions
  function setNearbyDoor(door: DoorConfig | null) {
    nearbyDoor.value = door
    // 如果靠近门，清空NPC状态
    if (door) {
      nearbyNPC.value = null
    }
  }

  function setNearbyNPC(npc: NPCConfig | null) {
    // 如果NPC已经交互过，不设置
    if (npc && interactedNPCs.value.has(npc.id)) {
      nearbyNPC.value = null
      return
    }
    nearbyNPC.value = npc
    // 如果靠近NPC，清空门状态
    if (npc) {
      nearbyDoor.value = null
    }
  }

  function markNPCAsInteracted(npcId: string) {
    interactedNPCs.value.add(npcId)
    // 如果当前正在交互的是这个NPC，清空状态
    if (nearbyNPC.value?.id === npcId) {
      nearbyNPC.value = null
    }
  }

  function isNPCInteracted(npcId: string): boolean {
    return interactedNPCs.value.has(npcId)
  }

  function reset() {
    nearbyDoor.value = null
    nearbyNPC.value = null
    // 不清除 interactedNPCs，因为这是持久状态
  }

  return {
    nearbyDoor,
    nearbyNPC,
    interactedNPCs,
    hasNearbyDoor,
    hasNearbyNPC,
    currentNPCName,
    currentNPCScenario,
    setNearbyDoor,
    setNearbyNPC,
    markNPCAsInteracted,
    isNPCInteracted,
    reset
  }
})
