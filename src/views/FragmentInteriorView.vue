<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useFragmentStore } from '@/stores/fragment'
import { useInventoryStore } from '@/stores/inventory'
import FragmentInteriorScene from '@/components/FragmentInteriorScene.vue'
import InteractionPrompt from '@/components/InteractionPrompt.vue'
import PhilosophicalDialogue from '@/components/PhilosophicalDialogue.vue'
import RewardModal from '@/components/RewardModal.vue'
import InventoryPanel from '@/components/InventoryPanel.vue'
import { useKeyboardControls } from '@/composables/useKeyboardControls'
import type { MetaphorFragment } from '@/types/inventory'

const router = useRouter()
const containerRef = ref<HTMLDivElement>()
const fragmentStore = useFragmentStore()
const inventoryStore = useInventoryStore()

// 从store中解构响应式状态
const { hasNearbyDoor, hasNearbyNPC, currentNPCName, currentNPCScenario } = storeToRefs(fragmentStore)

const { isKeyPressed } = useKeyboardControls()

// 本地状态
const showPhilosophicalDialogue = ref(false)
const showRewardModal = ref(false)
const showInventory = ref(false)
const currentReward = ref<MetaphorFragment | null>(null)

// 监听空格键确认
let checkInterval: number
onMounted(() => {
  if (containerRef.value) {
    containerRef.value.focus()
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
    // 确认进入门
    const confirmed = confirm(`确定要进入「${fragmentStore.nearbyDoor?.name}」吗？`)
    if (confirmed) {
      alert(`进入 ${fragmentStore.nearbyDoor?.name}...`)
      // TODO: 切换到对应场景
    }
  } else if (hasNearbyNPC.value) {
    // 开始哲学对话
    showPhilosophicalDialogue.value = true
  }
}

const handlePhilosophicalChoice = (choiceKey: 'a' | 's' | 'd') => {
  // 关闭哲学对话
  showPhilosophicalDialogue.value = false

  // 标记NPC已交互
  if (fragmentStore.nearbyNPC) {
    fragmentStore.markNPCAsInteracted(fragmentStore.nearbyNPC.id)

    // 生成隐喻碎片
    const baseFragment = fragmentStore.nearbyNPC.scenario.metaphorFragment
    const fragment = inventoryStore.generateFragment(
      baseFragment,
      `${fragmentStore.nearbyNPC.name}给予的哲学隐喻`,
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
  router.push('/plaza')
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
        <h2>🌌 记忆碎片内部</h2>
        <button class="inventory-btn" @click="toggleInventory">
          🎒 背包 ({{ inventoryStore.fragmentCount }})
        </button>
      </div>
      <button class="exit-btn" @click="handleExit">离开碎片</button>
    </div>

    <div ref="containerRef" class="scene-wrapper" tabindex="0">
      <FragmentInteriorScene />
    </div>

    <!-- 交互提示 - 使用Pinia store状态 -->
    <InteractionPrompt
      :visible="hasNearbyDoor && !showPhilosophicalDialogue && !showRewardModal"
      :title="fragmentStore.nearbyDoor?.name || ''"
      description="这扇门通向未知的领域"
      action-key="空格"
      type="door"
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
  background: linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 100%);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header h2 {
  margin: 0;
  color: #fff;
  font-size: 1.5rem;
}

.inventory-btn {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  transition: opacity 0.3s;
}

.inventory-btn:hover {
  opacity: 0.9;
}

.exit-btn {
  padding: 0.5rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.exit-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.scene-wrapper {
  flex: 1;
  overflow: hidden;
  outline: none;
}
</style>
