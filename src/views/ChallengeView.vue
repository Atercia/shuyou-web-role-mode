<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import PlazaScene from '@/components/PlazaScene.vue'
import InteractionPrompt from '@/components/InteractionPrompt.vue'
import { useChallengeStore } from '@/stores/challenge'
import { useMetaphorStore } from '@/stores/metaphor'
import { useSceneStore } from '@/stores/scene'
import { useKeyboardControls } from '@/composables/useKeyboardControls'
import type { FragmentConfig } from '@/game/MemoryFragment'
import type { BookConfig } from '@/types/book'
import type { PlazaElementConfig } from '@/types/plazaElement'
import { PLAZA_ELEMENT_TYPE_META } from '@/types/plazaElement'
import type { MetaphorFragment } from '@/types/metaphor'

const router = useRouter()
const challengeStore = useChallengeStore()
const metaphorStore = useMetaphorStore()
const sceneStore = useSceneStore()
const { isKeyPressed } = useKeyboardControls()

const containerRef = ref<HTMLDivElement>()
const plazaSceneRef = ref<InstanceType<typeof PlazaScene>>()

const currentFragment = ref<FragmentConfig | null>(null)
const showFragmentPrompt = ref(false)

const currentBook = ref<BookConfig | null>(null)
const showBookPrompt = ref(false)

const currentPlazaElement = ref<PlazaElementConfig | null>(null)
const showPlazaElementPrompt = ref(false)

const showHelp = ref(false)
const showExitConfirm = ref(false)

let checkInterval: number

onMounted(() => {
  // 开始新挑战
  if (!challengeStore.isInChallenge) {
    challengeStore.startChallenge()
  }

  if (containerRef.value) {
    containerRef.value.focus()
  }

  checkInterval = window.setInterval(() => {
    if (isKeyPressed('Space')) {
      if (currentPlazaElement.value) {
        enterPlazaElement(currentPlazaElement.value)
      } else if (currentFragment.value) {
        enterFragment(currentFragment.value)
      } else if (currentBook.value) {
        enterBook(currentBook.value)
      }
    }
  }, 100)
})

onUnmounted(() => {
  if (checkInterval) clearInterval(checkInterval)
})

// 监听时间结束
watch(() => challengeStore.timeRemaining, (newVal) => {
  if (newVal <= 0 && challengeStore.isInChallenge) {
    endChallengeAndShowResult()
  }
})

const handleFragmentNearby = (fragment: FragmentConfig) => {
  currentFragment.value = fragment
  showFragmentPrompt.value = true
}

const handleFragmentLeave = () => {
  currentFragment.value = null
  showFragmentPrompt.value = false
}

const handleBookNearby = (book: BookConfig) => {
  currentBook.value = book
  showBookPrompt.value = true
}

const handleBookLeave = () => {
  currentBook.value = null
  showBookPrompt.value = false
}

const handlePlazaElementNearby = (element: PlazaElementConfig) => {
  currentPlazaElement.value = element
  showPlazaElementPrompt.value = true
}

const handlePlazaElementLeave = () => {
  currentPlazaElement.value = null
  showPlazaElementPrompt.value = false
}

const enterFragment = (fragment: FragmentConfig) => {
  // 生成隐喻碎片并收集
  const metaphorFragment = challengeStore.generateRandomFragment()
  challengeStore.collectFragment(metaphorFragment)
  metaphorStore.addFragment(metaphorFragment)

  clearInterval(checkInterval)
  const sceneId = sceneStore.generateAndEnterScene({
    fragmentId: fragment.id,
    fragmentName: fragment.name,
    fragmentSize: fragment.size,
    dangerLevel: fragment.dangerLevel,
    fragmentColor: fragment.color
  })
  router.push({
    path: '/fragment-interior',
    query: { sceneId }
  })
}

const enterBook = (book: BookConfig) => {
  // 生成隐喻碎片并收集
  const metaphorFragment = challengeStore.generateRandomFragment()
  challengeStore.collectFragment(metaphorFragment)
  metaphorStore.addFragment(metaphorFragment)

  clearInterval(checkInterval)
  router.push({
    path: '/book-interior',
    query: {
      bookId: book.id,
      bookName: book.name,
      bookColor: book.color.toString(16)
    }
  })
}

const enterPlazaElement = (element: PlazaElementConfig) => {
  // 生成隐喻碎片并收集
  const metaphorFragment = challengeStore.generateRandomFragment()
  challengeStore.collectFragment(metaphorFragment)
  metaphorStore.addFragment(metaphorFragment)

  clearInterval(checkInterval)
  router.push({
    path: `/plaza-element/${element.type}`,
    query: {
      elementId: element.id,
      elementName: element.name,
      elementType: element.type
    }
  })
}

const toggleHelp = () => {
  showHelp.value = !showHelp.value
}

const confirmExit = () => {
  showExitConfirm.value = true
  challengeStore.pauseTimer()
}

const cancelExit = () => {
  showExitConfirm.value = false
  challengeStore.resumeTimer()
}

const endChallengeAndShowResult = () => {
  challengeStore.endChallenge()
  router.push('/challenge-result')
}
</script>

<template>
  <div class="challenge-container">
    <!-- 倒计时显示 -->
    <div class="timer-display" :class="{ 'time-low': challengeStore.isTimeLow }">
      <div class="timer-label">剩余时间</div>
      <div class="timer-value">{{ challengeStore.formattedTime }}</div>
    </div>

    <!-- 收集数量 -->
    <div class="collect-display">
      <div class="collect-label">已收集</div>
      <div class="collect-value">{{ challengeStore.collectedCount }}</div>
    </div>

    <div class="top-right-buttons">
      <button class="help-button" @click="toggleHelp">
        <span class="help-icon">?</span>
        <span>帮助</span>
      </button>
      <button class="exit-button" @click="confirmExit">
        <span class="exit-icon">✕</span>
        <span>结束</span>
      </button>
    </div>

    <!-- 帮助面板 -->
    <div v-if="showHelp" class="help-panel">
      <div class="help-header">
        <h3>⚔️ 研学挑战 - 操作指南</h3>
        <button class="close-btn" @click="toggleHelp">×</button>
      </div>
      <div class="key-bindings">
        <div class="key-item">
          <span class="key">W</span>
          <span>前进</span>
        </div>
        <div class="key-item">
          <span class="key">S</span>
          <span>后退</span>
        </div>
        <div class="key-item">
          <span class="key">A</span>
          <span>左转</span>
        </div>
        <div class="key-item">
          <span class="key">D</span>
          <span>右转</span>
        </div>
        <div class="key-item">
          <span class="key">空格</span>
          <span>交互</span>
        </div>
      </div>
      <div class="help-section">
        <h4>🎮 游戏规则</h4>
        <div class="rule-list">
          <div class="rule-item">
            <span class="rule-icon">⏱️</span>
            <span>挑战限时20分钟，时间结束自动结算</span>
          </div>
          <div class="rule-item">
            <span class="rule-icon">💎</span>
            <span>每次挑战的碎片和书籍都是随机生成的</span>
          </div>
          <div class="rule-item">
            <span class="rule-icon">🎯</span>
            <span>靠近元素按空格交互，收集隐喻碎片</span>
          </div>
          <div class="rule-item">
            <span class="rule-icon">🏆</span>
            <span>碎片关联不同隐喻，可在成就馆查看</span>
          </div>
        </div>
      </div>
      <p class="hint">收集的碎片会自动保存到成就馆</p>
    </div>

    <!-- 退出确认弹窗 -->
    <div v-if="showExitConfirm" class="exit-modal">
      <div class="exit-modal-content">
        <h3>⚠️ 确认结束挑战？</h3>
        <p>提前结束将立即进入结算界面</p>
        <div class="exit-actions">
          <button class="cancel-btn" @click="cancelExit">继续挑战</button>
          <button class="confirm-btn" @click="endChallengeAndShowResult">结束挑战</button>
        </div>
      </div>
    </div>

    <div ref="containerRef" class="scene-wrapper" tabindex="0">
      <PlazaScene
        ref="plazaSceneRef"
        :rogue-mode="true"
        @fragment-nearby="handleFragmentNearby"
        @fragment-leave="handleFragmentLeave"
        @book-nearby="handleBookNearby"
        @book-leave="handleBookLeave"
        @plaza-element-nearby="handlePlazaElementNearby"
        @plaza-element-leave="handlePlazaElementLeave"
      />
    </div>

    <InteractionPrompt
      :visible="showFragmentPrompt"
      :title="currentFragment?.name || '记忆碎片'"
      :description="`危险等级: ${currentFragment ? '★'.repeat(currentFragment.dangerLevel) : ''}`"
      action-key="空格"
      type="door"
    />

    <InteractionPrompt
      :visible="showBookPrompt"
      :title="currentBook?.name || '知识书籍'"
      :description="`包含隐喻碎片`"
      action-key="空格"
      type="npc"
    />

    <InteractionPrompt
      :visible="showPlazaElementPrompt"
      :title="currentPlazaElement?.name || '广场建筑'"
      :description="`${PLAZA_ELEMENT_TYPE_META[currentPlazaElement?.type || 'museum']?.label || ''} | ${currentPlazaElement?.description || ''}`"
      action-key="空格"
      type="plaza-element"
      :plaza-element-type="currentPlazaElement?.type"
    />
  </div>
</template>

<style scoped>
.challenge-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 1rem;
  box-sizing: border-box;
  position: relative;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #16213e 100%);
}

.timer-display {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 0.75rem 1.25rem;
  color: white;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  z-index: 100;
  transition: all 0.3s ease;
}

.timer-display.time-low {
  background: rgba(255, 107, 107, 0.2);
  border-color: rgba(255, 107, 107, 0.5);
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.timer-label {
  font-size: 0.7rem;
  opacity: 0.7;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.timer-value {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: 'Courier New', monospace;
}

.time-low .timer-value {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.collect-display {
  position: absolute;
  top: 1rem;
  left: 9rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 0.75rem 1.25rem;
  color: white;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  z-index: 100;
}

.collect-label {
  font-size: 0.7rem;
  opacity: 0.7;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.collect-value {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #00cec9 0%, #81ecec 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.top-right-buttons {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 100;
}

.help-button, .exit-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 0.6rem 1rem;
  color: white;
  font-size: 0.85rem;
  cursor: pointer;
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.help-button:hover, .exit-button:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.exit-button {
  background: rgba(255, 107, 107, 0.2);
  border-color: rgba(255, 107, 107, 0.3);
}

.exit-button:hover {
  background: rgba(255, 107, 107, 0.3);
}

.help-icon, .exit-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  font-weight: bold;
  font-size: 0.85rem;
}

.exit-icon {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

.help-panel {
  position: absolute;
  top: 4rem;
  right: 1rem;
  background: rgba(20, 20, 40, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 1.25rem;
  color: white;
  box-shadow: 
    0 10px 40px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  z-index: 100;
  min-width: 300px;
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.help-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.help-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #fff 0%, #a0a0c0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 100, 100, 0.3);
  transform: rotate(90deg);
}

.key-bindings {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.key-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
}

.key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8rem;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.hint {
  margin: 0.75rem 0 0 0;
  font-size: 0.8rem;
  opacity: 0.7;
  line-height: 1.5;
  text-align: center;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.help-section {
  margin-bottom: 0.75rem;
}

.help-section h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  opacity: 0.9;
}

.rule-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rule-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  padding: 0.3rem 0;
}

.rule-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.exit-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.exit-modal-content {
  background: rgba(30, 30, 60, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  color: white;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.exit-modal-content h3 {
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
}

.exit-modal-content p {
  margin: 0 0 1.5rem 0;
  opacity: 0.7;
}

.exit-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.cancel-btn, .confirm-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: none;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.confirm-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.4);
}

.scene-wrapper {
  flex: 1;
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 16px;
  overflow: hidden;
  outline: none;
  margin-top: 3.5rem;
  box-shadow: 
    0 0 30px rgba(102, 126, 234, 0.1),
    inset 0 0 60px rgba(102, 126, 234, 0.05);
  transition: all 0.3s ease;
}

.scene-wrapper:focus {
  border-color: rgba(102, 126, 234, 0.6);
  box-shadow: 
    0 0 40px rgba(102, 126, 234, 0.2),
    inset 0 0 80px rgba(102, 126, 234, 0.1);
}
</style>
