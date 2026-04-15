<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useFragmentStore } from '@/stores/fragment'
import { useInventoryStore } from '@/stores/inventory'
import { useSceneStore } from '@/stores/scene'
import DynamicScene from '@/components/DynamicScene.vue'
import InteractionPrompt from '@/components/InteractionPrompt.vue'
import PhilosophicalDialogue from '@/components/PhilosophicalDialogue.vue'
import RewardModal from '@/components/RewardModal.vue'
import InventoryPanel from '@/components/InventoryPanel.vue'

import { useKeyboardControls } from '@/composables/useKeyboardControls'
import { getDoorConditionSummary } from '@/utils/doorConditionChecker'
import { SceneTheme } from '@/types/scene'
import type { MetaphorFragment } from '@/types/inventory'

const router = useRouter()
const route = useRoute()
const containerRef = ref<HTMLDivElement>()
const fragmentStore = useFragmentStore()
const inventoryStore = useInventoryStore()
const sceneStore = useSceneStore()

// 从store中解构响应式状态
const { hasNearbyDoor, hasNearbyNPC, currentNPCName, currentNPCScenario } = storeToRefs(fragmentStore)

const { isKeyPressed } = useKeyboardControls()

// 本地状态
const showPhilosophicalDialogue = ref(false)
const showRewardModal = ref(false)
const showInventory = ref(false)
const currentReward = ref<MetaphorFragment | null>(null)

// 获取当前场景配置
const currentSceneConfig = computed(() => sceneStore.currentSceneConfig)

// 计算当前门的条件状态
const doorConditionStatus = computed(() => {
  const door = fragmentStore.nearbyDoor
  if (!door?.requirement) return null
  return getDoorConditionSummary(door.requirement, inventoryStore, fragmentStore)
})

// 是否可以进入门
const canEnterDoor = computed(() => {
  return doorConditionStatus.value?.canEnter ?? true
})

// 获取主题名称
function getThemeName(theme: SceneTheme): string {
  const themeNames: Record<SceneTheme, string> = {
    [SceneTheme.MYSTERY]: '神秘领域',
    [SceneTheme.MEMORY]: '回忆殿堂',
    [SceneTheme.CHALLENGE]: '试炼之地',
    [SceneTheme.SECRET]: '隐秘空间',
    [SceneTheme.VOID]: '虚空之境'
  }
  return themeNames[theme] || '未知领域'
}

// 监听空格键确认
let checkInterval: number
onMounted(() => {
  if (containerRef.value) {
    containerRef.value.focus()
  }

  // 从URL获取场景ID
  const sceneId = route.query.sceneId as string
  console.log('FragmentInteriorView mounted, sceneId from URL:', sceneId)
  if (sceneId) {
    const success = sceneStore.enterScene(sceneId)
    console.log('enterScene result:', success)
    console.log('currentSceneConfig:', sceneStore.currentSceneConfig)
  }

  checkInterval = window.setInterval(() => {
    if (isKeyPressed('Space')) {
      handleSpaceConfirm()
    }
  }, 100)
})

onUnmounted(() => {
  if (checkInterval) clearInterval(checkInterval)
  // 重置store状态
  fragmentStore.reset()
})

const handleSpaceConfirm = () => {
  // 奖励弹窗显示中，只响应空格关闭奖励弹窗
  if (showRewardModal.value) {
    handleRewardClose()
    return
  }

  // 哲学对话显示中，不响应空格
  if (showPhilosophicalDialogue.value) return

  if (hasNearbyDoor.value) {
    const door = fragmentStore.nearbyDoor
    if (!door) return

    // 检查进入条件 - 只有满足条件才能进入
    if (canEnterDoor.value) {
      // 可以进入
      const confirmed = confirm(`确定要进入「${door.name}」吗？\n\n${doorConditionStatus.value?.summary || ''}`)
      if (confirmed) {
        alert(`进入 ${door.name}...`)
        // TODO: 切换到对应场景
      }
    }
    // 不满足条件时不响应空格，条件已在提示中显示
  } else if (hasNearbyNPC.value) {
    // 开始哲学对话
    showPhilosophicalDialogue.value = true
  }
}

const handlePhilosophicalChoice = (choiceKey: 'a' | 's' | 'd') => {
  // 关闭哲学对话
  showPhilosophicalDialogue.value = false

  // 先保存NPC数据（因为markNPCAsInteracted会将nearbyNPC设为null）
  const npc = fragmentStore.nearbyNPC
  if (npc) {
    const npcId = npc.id
    const npcName = npc.name
    const baseFragment = npc.scenario.metaphorFragment

    // 标记NPC已交互（这会将nearbyNPC设为null）
    fragmentStore.markNPCAsInteracted(npcId)

    // 生成隐喻碎片
    const fragment = inventoryStore.generateFragment(
      baseFragment,
      `${npcName}给予的哲学隐喻`,
      '🔮'
    )

    // 添加到背包
    inventoryStore.addFragment(fragment)

    // 显示奖励
    currentReward.value = fragment
    showRewardModal.value = true
  }
}

const handleRewardClose = () => {
  showRewardModal.value = false
  currentReward.value = null
}

const handleExit = () => {
  router.push('/challenge')
}

const toggleInventory = () => {
  showInventory.value = !showInventory.value
}
</script>

<template>
  <div class="interior-container">
    <!-- 背包面板 -->
    <InventoryPanel
      :visible="showInventory"
      @close="showInventory = false"
    />

    <div class="header">
      <div class="header-left">
        <div class="fragment-info">
          <h2>🌌 {{ currentSceneConfig?.name || '记忆碎片内部' }}</h2>
          <span class="fragment-meta" v-if="currentSceneConfig">
            主题: {{ getThemeName(currentSceneConfig.theme) }} | 
            NPC: {{ currentSceneConfig.npcs.length }} | 
            门: {{ currentSceneConfig.doors.length }}
          </span>
        </div>
        <button class="inventory-btn" @click="toggleInventory">
          🎒 背包 ({{ inventoryStore.fragmentCount }})
        </button>
      </div>
      <button class="exit-btn" @click="handleExit">离开碎片</button>
    </div>

    <div ref="containerRef" class="scene-wrapper" tabindex="0">
      <DynamicScene :scene-config="currentSceneConfig" />
    </div>

    <!-- 交互提示 - 使用Pinia store状态 -->
    <InteractionPrompt
      :visible="hasNearbyDoor && !showPhilosophicalDialogue && !showRewardModal"
      :title="fragmentStore.nearbyDoor?.name || ''"
      :description="doorConditionStatus?.canEnter ? '条件已满足，可以进入' : '尚未满足进入条件'"
      :action-key="doorConditionStatus?.canEnter ? '空格' : undefined"
      :type="doorConditionStatus?.canEnter ? 'door' : 'door-locked'"
      :conditions="doorConditionStatus?.details"
    />

    <InteractionPrompt
      :visible="hasNearbyNPC && !showPhilosophicalDialogue && !showRewardModal"
      :title="currentNPCName"
      description="似乎有话要对你说..."
      action-key="空格"
      type="npc"
    />

    <!-- 哲学对话弹窗 -->
    <PhilosophicalDialogue
      :visible="showPhilosophicalDialogue"
      :npc-name="currentNPCName"
      :scenario="currentNPCScenario"
      @choice="handlePhilosophicalChoice"
      @close="showPhilosophicalDialogue = false"
    />

    <!-- 奖励弹窗 -->
    <RewardModal
      :visible="showRewardModal"
      :fragment="currentReward"
      @close="handleRewardClose"
    />


  </div>
</template>

<style scoped>
.interior-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #2d1b4e 100%);
  position: relative;
}

/* 添加星空背景效果 */
.interior-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, rgba(255,255,255,0.3), transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.2), transparent),
    radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.3), transparent),
    radial-gradient(2px 2px at 160px 120px, rgba(255,255,255,0.2), transparent),
    radial-gradient(1px 1px at 230px 80px, rgba(255,255,255,0.3), transparent);
  background-size: 250px 150px;
  pointer-events: none;
  opacity: 0.6;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header h2 {
  margin: 0;
  color: #fff;
  font-size: 1.4rem;
  font-weight: 600;
  background: linear-gradient(135deg, #fff 0%, #c0c0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.fragment-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fragment-meta {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.inventory-btn {
  padding: 0.6rem 1.2rem;
  background: rgba(102, 126, 234, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.4);
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
}

.inventory-btn:hover {
  background: rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.exit-btn {
  padding: 0.6rem 1.5rem;
  background: rgba(255, 100, 100, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 100, 100, 0.3);
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 100, 100, 0.15);
}

.exit-btn:hover {
  background: rgba(255, 100, 100, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 100, 100, 0.25);
}

.scene-wrapper {
  flex: 1;
  overflow: hidden;
  outline: none;
  position: relative;
  z-index: 1;
}
</style>
