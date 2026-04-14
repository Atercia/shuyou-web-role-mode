<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FragmentInteriorScene from '@/components/FragmentInteriorScene.vue'
import InteractionPrompt from '@/components/InteractionPrompt.vue'
import type { DoorConfig } from '@/game/Door'
import type { NPCConfig } from '@/game/NPC'
import { useKeyboardControls } from '@/composables/useKeyboardControls'

const route = useRoute()
const router = useRouter()
const containerRef = ref<HTMLDivElement>()

const { isKeyPressed } = useKeyboardControls()

// 交互状态
const nearDoor = ref<DoorConfig | null>(null)
const nearNPC = ref<NPCConfig | null>(null)
const showDialogue = ref(false)
const currentDialogue = ref<string[]>([])
const currentDialogueIndex = ref(0)

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
})

const handleSpaceConfirm = () => {
  if (showDialogue.value) {
    // 对话中，下一句或关闭
    if (currentDialogueIndex.value < currentDialogue.value.length - 1) {
      currentDialogueIndex.value++
    } else {
      showDialogue.value = false
      currentDialogueIndex.value = 0
    }
    return
  }

  if (nearDoor.value) {
    // 确认进入门
    const confirmed = confirm(`确定要进入「${nearDoor.value.name}」吗？`)
    if (confirmed) {
      alert(`进入 ${nearDoor.value.name}...`)
      // TODO: 切换到对应场景
    }
  } else if (nearNPC.value) {
    // 开始对话
    currentDialogue.value = nearNPC.value.dialogue
    currentDialogueIndex.value = 0
    showDialogue.value = true
  }
}

const handleNearDoor = (door: DoorConfig) => {
  nearDoor.value = door
  nearNPC.value = null
}

const handleNearNPC = (npc: NPCConfig) => {
  nearNPC.value = npc
  nearDoor.value = null
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
        @near-door="handleNearDoor"
        @near-npc="handleNearNPC"
        @exit="handleExit"
      />
    </div>

    <!-- 交互提示 -->
    <InteractionPrompt
      :visible="!!nearDoor && !showDialogue"
      :title="nearDoor?.name || ''"
      description="这扇门通向未知的领域"
      action-key="空格"
      type="door"
    />

    <InteractionPrompt
      :visible="!!nearNPC && !showDialogue"
      :title="nearNPC?.name || ''"
      description="似乎有话要对你说..."
      action-key="空格"
      type="npc"
    />

    <!-- 对话弹窗 -->
    <Teleport to="body">
      <Transition name="dialogue">
        <div v-if="showDialogue" class="dialogue-overlay" @click="showDialogue = false">
          <div class="dialogue-box" @click.stop>
            <div class="speaker">
              <span class="speaker-icon">👤</span>
              <span class="speaker-name">{{ nearNPC?.name }}</span>
            </div>
            <div class="dialogue-content">
              <p>{{ currentDialogue[currentDialogueIndex] }}</p>
            </div>
            <div class="dialogue-hint">
              <span class="hint-text">
                {{ currentDialogueIndex < currentDialogue.length - 1 ? '按空格键继续' : '按空格键结束' }}
              </span>
              <div class="progress-dots">
                <span
                  v-for="(_, index) in currentDialogue"
                  :key="index"
                  class="dot"
                  :class="{ active: index === currentDialogueIndex }"
                />
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
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

/* 对话弹窗样式 */
.dialogue-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 60px;
  z-index: 200;
}

.dialogue-box {
  width: 90%;
  max-width: 800px;
  background: linear-gradient(135deg, #2d1b4e 0%, #1a1a2e 100%);
  border: 2px solid #9b59b6;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.speaker {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(155, 89, 182, 0.3);
}

.speaker-icon {
  font-size: 2rem;
}

.speaker-name {
  color: #9b59b6;
  font-size: 1.2rem;
  font-weight: 600;
}

.dialogue-content {
  min-height: 80px;
  margin-bottom: 20px;
}

.dialogue-content p {
  color: #fff;
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
}

.dialogue-hint {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hint-text {
  color: #aaa;
  font-size: 0.9rem;
}

.progress-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s;
}

.dot.active {
  background: #9b59b6;
  transform: scale(1.2);
}

/* 动画 */
.dialogue-enter-active,
.dialogue-leave-active {
  transition: all 0.3s ease;
}

.dialogue-enter-from,
.dialogue-leave-to {
  opacity: 0;
}

.dialogue-enter-from .dialogue-box,
.dialogue-leave-to .dialogue-box {
  transform: translateY(20px);
}
</style>
