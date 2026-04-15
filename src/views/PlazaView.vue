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
import type { PlazaElementConfig } from '@/types/plazaElement'
import { PLAZA_ELEMENT_TYPE_META } from '@/types/plazaElement'

const router = useRouter()
const sceneStore = useSceneStore()
const userStore = useUserStore()
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

let checkInterval: number

onMounted(() => {
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
  clearInterval(checkInterval)
  userStore.addWeeks(fragment.estimatedWeeks)
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
  clearInterval(checkInterval)
  userStore.addWeeks(book.estimatedWeeks)
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
  clearInterval(checkInterval)
  userStore.addWeeks(element.estimatedWeeks)
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
</script>

<template>
  <div class="plaza-container">
    <div class="age-display">
      <div class="age-label">年龄</div>
      <div class="age-value">{{ userStore.formattedAge }}</div>
    </div>

    <div class="top-right-buttons">
      <button class="help-button" @click="toggleHelp">
        <span class="help-icon">?</span>
        <span>帮助</span>
      </button>
      <router-link to="/" class="back-button">
        <span class="back-icon">←</span>
        <span>返回</span>
      </router-link>
    </div>

    <div v-if="showHelp" class="help-panel">
      <div class="help-header">
        <h3>🎓 教育研学广场 - 操作指南</h3>
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
      <div class="help-section">
        <h4>🏛️ 场景元素</h4>
        <div class="element-list">
          <div class="element-item">
            <span class="element-icon">💎</span>
            <span>记忆碎片 — 靠近后按空格进入碎片内部探索</span>
          </div>
          <div class="element-item">
            <span class="element-icon">📖</span>
            <span>知识书籍 — 靠近后按空格阅读知识点</span>
          </div>
          <div class="element-item">
            <span class="element-icon">🏛️</span>
            <span>文博场馆 — 参观华夏文明与自然探索馆</span>
          </div>
          <div class="element-item">
            <span class="element-icon">🔧</span>
            <span>研学工坊 — 体验陶艺与非遗传承技艺</span>
          </div>
          <div class="element-item">
            <span class="element-icon">⛩️</span>
            <span>范式神殿 — 朝觐科学范式与哲学思辨殿堂</span>
          </div>
          <div class="element-item">
            <span class="element-icon">🏪</span>
            <span>知识市集 — 交换智慧与技能的集市</span>
          </div>
        </div>
      </div>
      <p class="hint">每完成一次探索，年龄会增长对应的周数</p>
      <p class="hint">收集的隐喻碎片可在首页「成就馆」中查看</p>
    </div>

    <div ref="containerRef" class="scene-wrapper" tabindex="0">
      <PlazaScene
        ref="plazaSceneRef"
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
      :description="`用时: ${currentFragment?.estimatedWeeks || 0}周 | 危险等级: ${currentFragment ? '★'.repeat(currentFragment.dangerLevel) : ''}`"
      action-key="空格"
      type="door"
    />

    <InteractionPrompt
      :visible="showBookPrompt"
      :title="currentBook?.name || '知识书籍'"
      :description="`用时: ${currentBook?.estimatedWeeks || 0}周 | 包含5个知识点`"
      action-key="空格"
      type="npc"
    />

    <InteractionPrompt
      :visible="showPlazaElementPrompt"
      :title="currentPlazaElement?.name || '广场建筑'"
      :description="`${PLAZA_ELEMENT_TYPE_META[currentPlazaElement?.type || 'museum']?.label || ''} | 用时: ${currentPlazaElement?.estimatedWeeks || 0}周 | ${currentPlazaElement?.description || ''}`"
      action-key="空格"
      type="plaza-element"
      :plaza-element-type="currentPlazaElement?.type"
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

.top-right-buttons {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 100;
}

.help-button {
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

.help-button:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.back-button {
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
  text-decoration: none;
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.back-button:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.back-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%);
  border-radius: 50%;
  font-weight: bold;
  font-size: 0.85rem;
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

.element-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.element-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  padding: 0.3rem 0;
}

.element-icon {
  font-size: 1rem;
  flex-shrink: 0;
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
