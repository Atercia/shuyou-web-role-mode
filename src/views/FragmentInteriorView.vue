<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FragmentInteriorScene from '@/components/FragmentInteriorScene.vue'
import InteractionPrompt from '@/components/InteractionPrompt.vue'
import PhilosophicalDialogue from '@/components/PhilosophicalDialogue.vue'
import FloatingText from '@/components/FloatingText.vue'
import type { DoorConfig } from '@/game/Door'
import type { NPCConfig, PhilosophicalScenario } from '@/game/NPC'
import { useKeyboardControls } from '@/composables/useKeyboardControls'

const route = useRoute()
const router = useRouter()
const containerRef = ref<HTMLDivElement>()

const { isKeyPressed } = useKeyboardControls()

// 交互状态
const nearDoor = ref<DoorConfig | null>(null)
const nearNPC = ref<NPCConfig | null>(null)

// 哲学对话状态
const showPhilosophicalDialogue = ref(false)
const currentScenario = ref<PhilosophicalScenario | null>(null)
const currentNPCName = ref('')

// 悬浮文字状态
const showFloatingText = ref(false)
const floatingText = ref('')

// 已交互的NPC记录
const interactedNPCs = ref<Set<string>>(new Set())

// 场景引用
const sceneRef = ref<InstanceType<typeof FragmentInteriorScene> | null>(null)

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

  // 使用全局事件监听NPC靠近
  window.addEventListener('npc-near', (event: any) => {
    handleNearNPC(event.detail)
  })

  // 使用全局事件监听门靠近
  window.addEventListener('door-near', (event: any) => {
    handleNearDoor(event.detail)
  })
})

onUnmounted(() => {
  if (checkInterval) clearInterval(checkInterval)
})

const handleSpaceConfirm = () => {
  // 哲学对话显示中，不响应空格
  if (showPhilosophicalDialogue.value) return

  // 悬浮文字显示中，不响应空格
  if (showFloatingText.value) return

  if (nearDoor.value) {
    // 确认进入门
    const confirmed = confirm(`确定要进入「${nearDoor.value.name}」吗？`)
    if (confirmed) {
      alert(`进入 ${nearDoor.value.name}...`)
      // TODO: 切换到对应场景
    }
  } else if (nearNPC.value) {
    // 开始哲学对话
    currentScenario.value = nearNPC.value.scenario
    currentNPCName.value = nearNPC.value.name
    showPhilosophicalDialogue.value = true
  }
}

const handlePhilosophicalChoice = (choiceKey: 'a' | 's' | 'd') => {
  // 关闭哲学对话
  showPhilosophicalDialogue.value = false

  // 标记NPC已交互
  if (nearNPC.value) {
    interactedNPCs.value.add(nearNPC.value.id)
    // 通知场景组件标记NPC
    sceneRef.value?.markNPCAsInteracted(nearNPC.value.id)

    // 显示悬浮文字
    const fragment = nearNPC.value.scenario.metaphorFragment
    floatingText.value = `${nearNPC.value.name} 给了你「${fragment}」`
    showFloatingText.value = true
  }

  // 清空当前NPC
  nearNPC.value = null
}

const handleFloatingTextComplete = () => {
  showFloatingText.value = false
  floatingText.value = ''
}

const handleNearDoor = (door: DoorConfig | null) => {
  nearDoor.value = door
  if (door) {
    nearNPC.value = null
  }
}

const handleNearNPC = (npc: NPCConfig | null) => {
  // 如果NPC已经交互过，不触发
  if (npc && interactedNPCs.value.has(npc.id)) {
    nearNPC.value = null
    return
  }
  nearNPC.value = npc
  if (npc) {
    nearDoor.value = null
  }
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
      <FragmentInteriorScene
        ref="sceneRef"
        @near-door="handleNearDoor"
        @near-npc="handleNearNPC"
        @exit="handleExit"
      />
    </div>

    <!-- 交互提示 -->
    <InteractionPrompt
      :visible="!!nearDoor && !showPhilosophicalDialogue && !showFloatingText"
      :title="nearDoor?.name || ''"
      description="这扇门通向未知的领域"
      action-key="空格"
      type="door"
    />

    <InteractionPrompt
      :visible="!!nearNPC && !showPhilosophicalDialogue && !showFloatingText"
      :title="nearNPC?.name || ''"
      description="似乎有话要对你说..."
      action-key="空格"
      type="npc"
    />

    <!-- 哲学对话弹窗 -->
    <PhilosophicalDialogue
      :visible="showPhilosophicalDialogue"
      :npc-name="currentNPCName"
      :scenario="currentScenario"
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
