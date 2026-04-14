<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { PhilosophicalScenario } from '@/game/NPC'

interface Props {
  visible: boolean
  npcName: string
  scenario: PhilosophicalScenario | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  choice: [choiceKey: 'a' | 's' | 'd']
  close: []
}>()

const selectedChoice = ref<'a' | 's' | 'd' | null>(null)

// 监听键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
  if (!props.visible || selectedChoice.value) return

  const key = event.key.toLowerCase()
  if (key === 'a' || key === 's' || key === 'd') {
    selectedChoice.value = key as 'a' | 's' | 'd'
    emit('choice', key as 'a' | 's' | 'd')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

const handleClose = () => {
  selectedChoice.value = null
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialogue">
      <div v-if="visible && scenario" class="dialogue-overlay" @click="handleClose">
        <div class="dialogue-container" @click.stop>
          <!-- NPC 头像和名称 -->
          <div class="npc-header">
            <div class="npc-avatar">👤</div>
            <div class="npc-info">
              <h3>{{ npcName }}</h3>
              <span class="npc-title">哲学引导者</span>
            </div>
          </div>

          <!-- 情境描述 -->
          <div class="scenario-section">
            <div class="context-box">
              <p class="context-text">{{ scenario.context }}</p>
            </div>
            <div class="question-box">
              <span class="question-label">哲学之问</span>
              <p class="question-text">{{ scenario.question }}</p>
            </div>
          </div>

          <!-- 选择区域 -->
          <div class="choices-section">
            <div
              v-for="choice in scenario.choices"
              :key="choice.key"
              class="choice-item"
              :class="{ selected: selectedChoice === choice.key }"
            >
              <span class="choice-key">{{ choice.label }}</span>
              <span class="choice-text">{{ choice.text }}</span>
            </div>
          </div>

          <!-- 提示 -->
          <div class="hint">
            <span class="hint-key">按 A / S / D 做出你的选择</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialogue-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.dialogue-container {
  width: 100%;
  max-width: 700px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #9b59b6;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(155, 89, 182, 0.2);
}

.npc-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(155, 89, 182, 0.3);
}

.npc-avatar {
  font-size: 3rem;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(155, 89, 182, 0.2);
  border-radius: 50%;
}

.npc-info h3 {
  margin: 0;
  color: #fff;
  font-size: 1.5rem;
}

.npc-title {
  color: #9b59b6;
  font-size: 0.9rem;
}

.scenario-section {
  margin-bottom: 28px;
}

.context-box {
  background: rgba(155, 89, 182, 0.1);
  border-left: 4px solid #9b59b6;
  padding: 16px 20px;
  margin-bottom: 16px;
  border-radius: 0 8px 8px 0;
}

.context-text {
  color: #e0e0e0;
  font-size: 1.05rem;
  line-height: 1.7;
  margin: 0;
  font-style: italic;
}

.question-box {
  background: rgba(0, 0, 0, 0.3);
  padding: 16px 20px;
  border-radius: 8px;
}

.question-label {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-bottom: 8px;
}

.question-text {
  color: #fff;
  font-size: 1.15rem;
  margin: 0;
  font-weight: 500;
}

.choices-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.choice-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.choice-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(155, 89, 182, 0.5);
  transform: translateX(4px);
}

.choice-item.selected {
  background: rgba(155, 89, 182, 0.3);
  border-color: #9b59b6;
  box-shadow: 0 0 20px rgba(155, 89, 182, 0.3);
}

.choice-key {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  font-weight: bold;
  font-size: 1.1rem;
  color: #fff;
  flex-shrink: 0;
}

.choice-text {
  color: #e0e0e0;
  font-size: 1rem;
  line-height: 1.5;
}

.hint {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.hint-key {
  color: #888;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 动画 */
.dialogue-enter-active,
.dialogue-leave-active {
  transition: all 0.4s ease;
}

.dialogue-enter-from,
.dialogue-leave-to {
  opacity: 0;
}

.dialogue-enter-from .dialogue-container,
.dialogue-leave-to .dialogue-container {
  transform: scale(0.95) translateY(20px);
}
</style>
