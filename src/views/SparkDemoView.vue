<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SparkPlazaScene from '@/components/SparkPlazaScene.vue'
import { useChallengeStore } from '@/stores/challenge'
import { useInventoryStore } from '@/stores/inventory'
import type { FragmentConfig } from '@/game/MemoryFragment'
import type { BookConfig } from '@/types/book'
import type { PlazaElementConfig } from '@/types/plazaElement'
import { FragmentCategory } from '@/types/metaphor'

const router = useRouter()
const challengeStore = useChallengeStore()
const inventoryStore = useInventoryStore()

const showFragmentModal = ref(false)
const showBookModal = ref(false)
const showPlazaElementModal = ref(false)
const currentFragment = ref<FragmentConfig | null>(null)
const currentBook = ref<BookConfig | null>(null)
const currentPlazaElement = ref<PlazaElementConfig | null>(null)
const isLoading = ref(true)
const sceneReady = ref(false)

onMounted(() => {
  // Start challenge if not started
  if (!challengeStore.isInChallenge) {
    challengeStore.startChallenge()
  }
  // Simulate loading completion
  setTimeout(() => {
    isLoading.value = false
    // 延迟显示场景，确保 DOM 完全渲染
    setTimeout(() => {
      sceneReady.value = true
    }, 100)
  }, 500)
})

function onFragmentNearby(fragment: FragmentConfig) {
  currentFragment.value = fragment
  showFragmentModal.value = true
}

function onFragmentLeave() {
  showFragmentModal.value = false
  currentFragment.value = null
}

function collectFragment() {
  if (currentFragment.value) {
    // Convert FragmentConfig to inventory MetaphorFragment
    const metaphorFragment = inventoryStore.generateFragment(
      currentFragment.value.name,
      `A ${currentFragment.value.name} fragment`,
      '💎'
    )
    challengeStore.collectFragment({
      id: metaphorFragment.id,
      name: metaphorFragment.name,
      description: metaphorFragment.description,
      category: FragmentCategory.COGNITION,
      metaphors: [],
      rarity: metaphorFragment.rarity,
      completeness: metaphorFragment.completenessValue,
      icon: metaphorFragment.icon,
      obtainedAt: metaphorFragment.obtainedAt,
      challengeId: challengeStore.currentChallenge?.id || ''
    })
    showFragmentModal.value = false
    currentFragment.value = null
  }
}

function onBookNearby(book: BookConfig) {
  currentBook.value = book
  showBookModal.value = true
}

function onBookLeave() {
  showBookModal.value = false
  currentBook.value = null
}

function readBook() {
  if (currentBook.value) {
    router.push(`/book-interior`)
  }
}

function onPlazaElementNearby(element: PlazaElementConfig) {
  currentPlazaElement.value = element
  showPlazaElementModal.value = true
}

function onPlazaElementLeave() {
  showPlazaElementModal.value = false
  currentPlazaElement.value = null
}

function enterPlazaElement() {
  if (currentPlazaElement.value) {
    router.push(`/plaza-element/${currentPlazaElement.value.id}`)
  }
}

function leaveChallenge() {
  challengeStore.endChallenge()
  router.push('/challenge-result')
}
</script>

<template>
  <div class="spark-demo-view">
    <!-- Loading Screen -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>加载 3D 场景中...</p>
    </div>

    <!-- Timer Overlay -->
    <div v-if="!isLoading" class="timer-overlay">
      <div class="timer" :class="{ 'warning': challengeStore.timeRemaining < 300000 }">
        <span class="timer-icon">⏱️</span>
        <span class="timer-text">{{ challengeStore.formattedTime }}</span>
      </div>
      <div class="collection-stats">
        <span class="stat">碎片: {{ challengeStore.collectedCount }}</span>
        <span class="stat">书籍: {{ challengeStore.currentFragments.length }}</span>
      </div>
      <button class="leave-btn" @click="leaveChallenge">结束挑战</button>
    </div>

    <!-- Spark 3D Scene - 使用 visibility 而非 display 确保尺寸可用 -->
    <div 
      class="scene-wrapper"
      :class="{ 'scene-hidden': isLoading || !sceneReady, 'scene-visible': !isLoading && sceneReady }"
    >
      <SparkPlazaScene
        class="scene-container"
        @fragment-nearby="onFragmentNearby"
        @fragment-leave="onFragmentLeave"
        @book-nearby="onBookNearby"
        @book-leave="onBookLeave"
        @plaza-element-nearby="onPlazaElementNearby"
        @plaza-element-leave="onPlazaElementLeave"
      />
    </div>

    <!-- Fragment Modal -->
    <div v-if="showFragmentModal && currentFragment" class="modal-overlay" @click="onFragmentLeave">
      <div class="modal" @click.stop>
        <h3>{{ currentFragment.name }}</h3>
        <p class="description">一个神秘的碎片，蕴含着未知的力量...</p>
        <div class="metaphor-tags">
          <span class="tag">神秘</span>
          <span class="tag">珍贵</span>
        </div>
        <div class="actions">
          <button class="btn-primary" @click="collectFragment">收集碎片</button>
          <button class="btn-secondary" @click="onFragmentLeave">离开</button>
        </div>
      </div>
    </div>

    <!-- Book Modal -->
    <div v-if="showBookModal && currentBook" class="modal-overlay" @click="onBookLeave">
      <div class="modal" @click.stop>
        <h3>📚 {{ currentBook.name }}</h3>
        <p class="author">一本充满智慧的书籍</p>
        <p class="description">{{ currentBook.description }}</p>
        <div class="actions">
          <button class="btn-primary" @click="readBook">阅读书籍</button>
          <button class="btn-secondary" @click="onBookLeave">离开</button>
        </div>
      </div>
    </div>

    <!-- Plaza Element Modal -->
    <div v-if="showPlazaElementModal && currentPlazaElement" class="modal-overlay" @click="onPlazaElementLeave">
      <div class="modal" @click.stop>
        <h3>{{ currentPlazaElement.name }}</h3>
        <p class="description">{{ currentPlazaElement.description }}</p>
        <div class="actions">
          <button class="btn-primary" @click="enterPlazaElement">进入探索</button>
          <button class="btn-secondary" @click="onPlazaElementLeave">离开</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.spark-demo-view {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  color: white;
  font-size: 1.2rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 关键修复：使用 visibility 而非 display，确保 canvas 始终有尺寸 */
.scene-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.scene-hidden {
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.scene-visible {
  visibility: visible;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.scene-container {
  width: 100%;
  height: 100%;
}

.timer-overlay {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 100;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px 20px;
  border-radius: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.timer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.timer.warning {
  color: #e74c3c;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.timer-icon {
  font-size: 1.2rem;
}

.collection-stats {
  display: flex;
  gap: 15px;
  font-size: 0.9rem;
  color: #555;
}

.stat {
  background: #f0f0f0;
  padding: 5px 10px;
  border-radius: 15px;
}

.leave-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s;
}

.leave-btn:hover {
  background: #c0392b;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 15px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.modal .author {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.modal .description {
  color: #555;
  line-height: 1.6;
  margin-bottom: 20px;
}

.metaphor-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 20px;
}

.tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn-primary, .btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f0f0f0;
  color: #555;
}

.btn-secondary:hover {
  background: #e0e0e0;
}
</style>
