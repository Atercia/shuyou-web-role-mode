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
  padding: 16px;
  overflow: auto;
}

.reward-container {
  width: 100%;
  max-width: 500px;
  max-height: calc(100vh - 32px);
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #9b59b6;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(155, 89, 182, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.reward-header {
  text-align: center;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.reward-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 8px;
  animation: bounce 1s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.reward-header h2 {
  margin: 0;
  color: #fff;
  font-size: 1.5rem;
  text-shadow: 0 0 20px rgba(155, 89, 182, 0.5);
}

.fragment-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  overflow-y: auto;
  flex-shrink: 1;
  min-height: 0;
}

.fragment-icon {
  font-size: 4rem;
  text-align: center;
  margin-bottom: 12px;
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
}

.fragment-info {
  text-align: center;
}

.fragment-name {
  margin: 0 0 6px 0;
  color: #fff;
  font-size: 1.3rem;
}

.fragment-description {
  margin: 0 0 16px 0;
  color: #aaa;
  font-size: 0.9rem;
  line-height: 1.5;
}

.fragment-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.stat-label {
  color: #888;
  font-size: 0.85rem;
}

.stat-value {
  font-weight: 600;
  font-size: 0.9rem;
}

.stat-value.rarity {
  display: flex;
  align-items: center;
  gap: 6px;
}

.completeness-bar {
  position: relative;
  width: 120px;
  height: 22px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 11px;
  overflow: hidden;
  flex-shrink: 0;
}

.completeness-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  border-radius: 11px;
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
  font-size: 0.75rem;
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
  flex-shrink: 0;
  padding-top: 8px;
}

.key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  font-weight: bold;
  font-size: 0.9rem;
  color: #fff;
}

/* 响应式适配 */
@media (max-width: 480px) {
  .reward-container {
    padding: 16px;
    max-height: calc(100vh - 24px);
  }

  .reward-icon {
    font-size: 2.5rem;
  }

  .reward-header h2 {
    font-size: 1.3rem;
  }

  .fragment-card {
    padding: 16px;
  }

  .fragment-icon {
    font-size: 3rem;
  }

  .fragment-name {
    font-size: 1.1rem;
  }

  .stat-row {
    padding: 8px 12px;
  }

  .completeness-bar {
    width: 100px;
    height: 20px;
  }
}

@media (max-height: 600px) {
  .reward-container {
    padding: 16px;
  }

  .reward-header {
    margin-bottom: 12px;
  }

  .reward-icon {
    font-size: 2.5rem;
    margin-bottom: 4px;
  }

  .fragment-card {
    padding: 16px;
    margin-bottom: 12px;
  }

  .fragment-icon {
    font-size: 3rem;
    margin-bottom: 8px;
  }
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
