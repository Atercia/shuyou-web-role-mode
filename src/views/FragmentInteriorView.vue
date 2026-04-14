<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useFragmentStore } from '@/stores/fragment'
import FragmentInteriorScene from '@/components/FragmentInteriorScene.vue'
import InteractionPrompt from '@/components/InteractionPrompt.vue'
import PhilosophicalDialogue from '@/components/PhilosophicalDialogue.vue'
import FloatingText from '@/components/FloatingText.vue'
import { useKeyboardControls } from '@/composables/useKeyboardControls'

const router = useRouter()
const containerRef = ref<HTMLDivElement>()
const fragmentStore = useFragmentStore()

// 从store中解构响应式状态
const { hasNearbyDoor, hasNearbyNPC, currentNPCName, currentNPCScenario } = storeToRefs(fragmentStore)

const { isKeyPressed } = useKeyboardControls()

// 本地状态
const showPhilosophicalDialogue = ref(false)
const showFloatingText = ref(false)
const floatingText = ref('')

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
  // 哲学对话显示中，不响应空格
  if (showPhilosophicalDialogue.value) return

  // 悬浮文字显示中，不响应空格
  if (showFloatingText.value) return

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

    // 显示悬浮文字
    const fragment = fragmentStore.nearbyNPC.scenario.metaphorFragment
    floatingText.value = `${fragmentStore.nearbyNPC.name} 给了你「${fragment}」`
    showFloatingText.value = true
  }
}

const handleFloatingTextComplete = () => {
  showFloatingText.value = false
  floatingText.value = ''
}

const handleExit = () => {
  router.push('/plaza')
}
</script>

<template>
  <div class="interior-container">
    <div class="header">
      <h2>🌌 记忆碎片内部</h2>
      <button class="exit-btn" @click="handleExit">离开碎片</button>
    </div>

    <div ref="containerRef" class="scene-wrapper" tabindex="0">
      <FragmentInteriorScene />
    </div>

    <!-- 交互提示 - 使用Pinia store状态 -->
    <InteractionPrompt
      :visible="hasNearbyDoor && !showPhilosophicalDialogue && !showFloatingText"
      :title="fragmentStore.nearbyDoor?.name || ''"
      description="这扇门通向未知的领域"
      action-key="空格"
      type="door"
    />

    <InteractionPrompt
      :visible="hasNearbyNPC && !showPhilosophicalDialogue && !showFloatingText"
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

    <!-- 悬浮文字提醒 -->
    <FloatingText
      :visible="showFloatingText"
      :text="floatingText"
      :duration="3000"
      @complete="handleFloatingTextComplete"
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

.header h2 {
  margin: 0;
  color: #fff;
  font-size: 1.5rem;
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
