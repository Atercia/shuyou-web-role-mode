<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import type { MetaphorFragment } from '@/types/inventory'
import { useInventoryStore } from '@/stores/inventory'

interface Props {
  visible: boolean
  fragment: MetaphorFragment | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const inventoryStore = useInventoryStore()

// 监听空格键关闭
const handleKeyDown = (event: KeyboardEvent) => {
  if (!props.visible) return
  if (event.code === 'Space') {
    event.preventDefault()
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

const getRarityStars = (rarity: string) => {
  const stars = {
    common: '⭐',
    uncommon: '⭐⭐',
    rare: '⭐⭐⭐',
    legendary: '⭐⭐⭐⭐'
  }
  return stars[rarity as keyof typeof stars] || '⭐'
}

const getCompletenessBar = (value: number) => {
  return Math.round(value)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="reward">
      <div v-if="visible && fragment" class="reward-overlay" @click="emit('close')">
        <div class="reward-container" @click.stop>
          <div class="reward-header">
            <span class="reward-icon">🎁</span>
            <h2>获得隐喻碎片</h2>
          </div>

          <div class="fragment-card" :style="{ borderColor: inventoryStore.getFragmentRarityColor(fragment.rarity) }">
            <div class="fragment-icon">{{ fragment.icon }}</div>
            <div class="fragment-info">
              <h3 class="fragment-name">{{ fragment.name }}</h3>
              <p class="fragment-description">{{ fragment.description }}</p>
              
              <div class="fragment-stats">
                <div class="stat-row">
                  <span class="stat-label">稀有度</span>
                  <span class="stat-value rarity" :style="{ color: inventoryStore.getFragmentRarityColor(fragment.rarity) }">
                    {{ getRarityStars(fragment.rarity) }}
                    {{ inventoryStore.getFragmentRarityName(fragment.rarity) }}
                  </span>
                </div>
                
                <div class="stat-row">
                  <span class="stat-label">完整度</span>
                  <div class="completeness-bar">
                    <div 
                      class="completeness-fill" 
                      :style="{ width: getCompletenessBar(fragment.completenessValue) + '%' }"
                    ></div>
                    <span class="completeness-text">
                      {{ inventoryStore.getCompletenessName(fragment.completeness) }} ({{ fragment.completenessValue }}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="reward-hint">
            <span class="key">空格</span>
            <span>键确认</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.reward-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.reward-container {
  width: 90%;
  max-width: 500px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #9b59b6;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(155, 89, 182, 0.3);
}

.reward-header {
  text-align: center;
  margin-bottom: 24px;
}

.reward-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 12px;
  animation: bounce 1s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.reward-header h2 {
  margin: 0;
  color: #fff;
  font-size: 1.8rem;
  text-shadow: 0 0 20px rgba(155, 89, 182, 0.5);
}

.fragment-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.fragment-icon {
  font-size: 5rem;
  text-align: center;
  margin-bottom: 16px;
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
}

.fragment-info {
  text-align: center;
}

.fragment-name {
  margin: 0 0 8px 0;
  color: #fff;
  font-size: 1.5rem;
}

.fragment-description {
  margin: 0 0 20px 0;
  color: #aaa;
  font-size: 0.95rem;
  line-height: 1.5;
}

.fragment-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.stat-label {
  color: #888;
  font-size: 0.9rem;
}

.stat-value {
  font-weight: 600;
}

.stat-value.rarity {
  display: flex;
  align-items: center;
  gap: 8px;
}

.completeness-bar {
  position: relative;
  width: 150px;
  height: 24px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 12px;
  overflow: hidden;
}

.completeness-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  border-radius: 12px;
  transition: width 0.5s ease;
}

.completeness-text {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.reward-hint {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #888;
}

.key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  font-weight: bold;
  color: #fff;
}

/* 动画 */
.reward-enter-active,
.reward-leave-active {
  transition: all 0.4s ease;
}

.reward-enter-from,
.reward-leave-to {
  opacity: 0;
}

.reward-enter-from .reward-container,
.reward-leave-to .reward-container {
  transform: scale(0.9);
}
</style>
