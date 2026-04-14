<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import PlazaScene from '@/components/PlazaScene.vue'
import InteractionPrompt from '@/components/InteractionPrompt.vue'
import { useSceneStore } from '@/stores/scene'
import { useUserStore } from '@/stores/user'
import { useKeyboardControls } from '@/composables/useKeyboardControls'
import type { FragmentConfig } from '@/game/MemoryFragment'
import type { BookConfig } from '@/game/Book'

const router = useRouter()
const sceneStore = useSceneStore()
const userStore = useUserStore()
const { isKeyPressed } = useKeyboardControls()
const containerRef = ref<HTMLDivElement>()
const plazaSceneRef = ref<InstanceType<typeof PlazaScene>>()

// 当前靠近的碎片
const currentFragment = ref<FragmentConfig | null>(null)
const showFragmentPrompt = ref(false)

// 当前靠近的书籍
const currentBook = ref<BookConfig | null>(null)
const showBookPrompt = ref(false)

// 帮助提示显示状态
const showHelp = ref(false)

// 空格键检测间隔
let checkInterval: number

onMounted(() => {
  if (containerRef.value) {
    containerRef.value.focus()
  }

  // 监听空格键进入碎片或书籍
  checkInterval = window.setInterval(() => {
    if (isKeyPressed('Space')) {
      if (currentFragment.value) {
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

const enterFragment = (fragment: FragmentConfig) => {
  // 清除间隔防止重复触发
  clearInterval(checkInterval)

  // 增加年龄（碎片用时）
  userStore.addWeeks(fragment.estimatedWeeks)

  // 生成独一无二的场景
  const sceneId = sceneStore.generateAndEnterScene({
    fragmentId: fragment.id,
    fragmentName: fragment.name,
    fragmentSize: fragment.size,
    dangerLevel: fragment.dangerLevel,
    fragmentColor: fragment.color
  })

  // 进入场景
  router.push({
    path: '/fragment-interior',
    query: { sceneId }
  })
}

const enterBook = (book: BookConfig) => {
  // 清除间隔防止重复触发
  clearInterval(checkInterval)

  // 增加年龄（书籍用时）
  userStore.addWeeks(book.estimatedWeeks)

  // 进入书籍场景
  router.push({
    path: '/book-interior',
    query: {
      bookId: book.id,
      bookName: book.name,
      bookColor: book.color.toString(16)
    }
  })
}

const toggleHelp = () => {
  showHelp.value = !showHelp.value
}
</script>

<template>
  <div class="plaza-container">
    <!-- 左上角年龄显示 -->
    <div class="age-display">
      <div class="age-label">年龄</div>
      <div class="age-value">{{ userStore.formattedAge }}</div>
    </div>

    <!-- 右上角帮助按钮 -->
    <button class="help-button" @click="toggleHelp">
      <span class="help-icon">?</span>
      <span>帮助</span>
    </button>

    <!-- 帮助提示面板 -->
    <div v-if="showHelp" class="help-panel">
      <div class="help-header">
        <h3>🏛️ 广场探索 - 操作指南</h3>
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
          <span>跳跃 / 交互</span>
        </div>
      </div>
      <p class="hint">寻找发光的记忆碎片和书籍，靠近后按空格键进入探索</p>
      <p class="hint">每完成一个碎片或书籍，年龄会增长对应的周数</p>
    </div>

    <div ref="containerRef" class="scene-wrapper" tabindex="0">
      <PlazaScene
        ref="plazaSceneRef"
        @fragment-nearby="handleFragmentNearby"
        @fragment-leave="handleFragmentLeave"
        @book-nearby="handleBookNearby"
        @book-leave="handleBookLeave"
      />
    </div>

    <!-- 碎片交互提示 -->
    <InteractionPrompt
      :visible="showFragmentPrompt"
      :title="currentFragment?.name || '记忆碎片'"
      :description="`用时: ${currentFragment?.estimatedWeeks || 0}周 | 危险等级: ${currentFragment ? '★'.repeat(currentFragment.dangerLevel) : ''}`"
      action-key="空格"
      type="door"
    />

    <!-- 书籍交互提示 -->
    <InteractionPrompt
      :visible="showBookPrompt"
      :title="currentBook?.name || '知识书籍'"
      :description="`用时: ${currentBook?.estimatedWeeks || 0}周 | 包含5个知识点`"
      action-key="空格"
      type="npc"
    />
  </div>
</template>

<style scoped>
.plaza-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 1rem;
  box-sizing: border-box;
  position: relative;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #16213e 100%);
}

/* 左上角年龄显示 - 玻璃拟态风格 */
.age-display {
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
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.age-display:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 30px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.age-label {
  font-size: 0.7rem;
  opacity: 0.7;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.age-value {
  font-size: 1.3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 右上角帮助按钮 - 玻璃拟态 */
.help-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
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
  z-index: 100;
  transition: all 0.3s ease;
}

.help-button:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.help-icon {
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

/* 帮助面板 - 玻璃拟态 */
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

/* 场景容器 - 霓虹边框效果 */
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
