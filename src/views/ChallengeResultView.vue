<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useChallengeStore } from '@/stores/challenge'
import { useMetaphorStore } from '@/stores/metaphor'
import { FragmentCategory, FRAGMENT_CATEGORY_CONFIG } from '@/types/metaphor'
import { MetaphorType, METAPHOR_CONFIG } from '@/types/metaphor'

const router = useRouter()
const challengeStore = useChallengeStore()
const metaphorStore = useMetaphorStore()

const challenge = computed(() => challengeStore.currentChallenge)
const fragments = computed(() => challenge.value?.fragmentsCollected || [])

const rarityStats = computed(() => {
  const stats = { common: 0, uncommon: 0, rare: 0, legendary: 0 }
  fragments.value.forEach(f => stats[f.rarity]++)
  return stats
})

const categoryStats = computed(() => {
  const stats: Record<FragmentCategory, number> = {
    [FragmentCategory.EMOTION]: 0,
    [FragmentCategory.COGNITION]: 0,
    [FragmentCategory.EXISTENCE]: 0,
    [FragmentCategory.SOCIAL]: 0,
    [FragmentCategory.NATURE]: 0
  }
  fragments.value.forEach(f => stats[f.category]++)
  return stats
})

const metaphorStats = computed(() => {
  const stats: Record<MetaphorType, number> = {} as Record<MetaphorType, number>
  Object.values(MetaphorType).forEach(type => stats[type] = 0)
  fragments.value.forEach(f => {
    f.metaphors.forEach(m => stats[m]++)
  })
  return stats
})

const totalMetaphors = computed(() => {
  return Object.values(metaphorStats.value).reduce((a, b) => a + b, 0)
})

const rarityColors = {
  common: '#9e9e9e',
  uncommon: '#4caf50',
  rare: '#2196f3',
  legendary: '#ff9800'
}

const rarityNames = {
  common: '普通',
  uncommon: '稀有',
  rare: '史诗',
  legendary: '传说'
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}分${secs}秒`
}

function goHome() {
  challengeStore.clearCurrentChallenge()
  router.push('/')
}

function startNewChallenge() {
  challengeStore.clearCurrentChallenge()
  router.push('/challenge')
}

function goToAchievements() {
  challengeStore.clearCurrentChallenge()
  router.push('/achievement')
}
</script>

<template>
  <div class="result-container">
    <div class="result-header">
      <h1>🏆 挑战结算</h1>
      <p class="result-subtitle">本次研学挑战成果</p>
    </div>

    <div v-if="challenge" class="result-content">
      <!-- 总体统计 -->
      <div class="stats-grid">
        <div class="stat-card highlight">
          <div class="stat-icon">💎</div>
          <div class="stat-value">{{ fragments.length }}</div>
          <div class="stat-label">收集碎片</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-value">{{ challenge.score }}</div>
          <div class="stat-label">总得分</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-value">{{ formatDuration(challenge.duration) }}</div>
          <div class="stat-label">用时</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🔮</div>
          <div class="stat-value">{{ totalMetaphors }}</div>
          <div class="stat-label">隐喻关联</div>
        </div>
      </div>

      <!-- 稀有度分布 -->
      <div class="section">
        <h2 class="section-title">
          <span class="section-icon">✨</span>
          稀有度分布
        </h2>
        <div class="rarity-chart">
          <div
            v-for="(count, rarity) in rarityStats"
            :key="rarity"
            class="rarity-bar"
            :style="{ '--rarity-color': rarityColors[rarity as keyof typeof rarityColors] }"
          >
            <div class="rarity-label">
              <span class="rarity-name">{{ rarityNames[rarity as keyof typeof rarityNames] }}</span>
              <span class="rarity-count">{{ count }}</span>
            </div>
            <div class="rarity-track">
              <div
                class="rarity-fill"
                :style="{
                  width: fragments.length > 0 ? (count / fragments.length * 100) + '%' : '0%'
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 类型分布 -->
      <div class="section">
        <h2 class="section-title">
          <span class="section-icon">📊</span>
          碎片类型
        </h2>
        <div class="category-grid">
          <div
            v-for="(count, category) in categoryStats"
            :key="category"
            class="category-card"
            :style="{ '--category-color': FRAGMENT_CATEGORY_CONFIG[category as FragmentCategory].color }"
          >
            <div class="category-icon">{{ FRAGMENT_CATEGORY_CONFIG[category as FragmentCategory].icon }}</div>
            <div class="category-name">{{ FRAGMENT_CATEGORY_CONFIG[category as FragmentCategory].name }}</div>
            <div class="category-count">{{ count }}</div>
          </div>
        </div>
      </div>

      <!-- 隐喻关联 -->
      <div class="section">
        <h2 class="section-title">
          <span class="section-icon">🔮</span>
          隐喻关联
        </h2>
        <div class="metaphor-grid">
          <div
            v-for="(count, type) in metaphorStats"
            :key="type"
            v-show="count > 0"
            class="metaphor-item"
            :style="{ '--metaphor-color': METAPHOR_CONFIG[type as MetaphorType].color }"
          >
            <div class="metaphor-icon">{{ METAPHOR_CONFIG[type as MetaphorType].icon }}</div>
            <div class="metaphor-info">
              <div class="metaphor-name">{{ METAPHOR_CONFIG[type as MetaphorType].name }}</div>
              <div class="metaphor-count">{{ count }} 个碎片</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 收集的碎片列表 -->
      <div v-if="fragments.length > 0" class="section">
        <h2 class="section-title">
          <span class="section-icon">🎒</span>
          本次收集
        </h2>
        <div class="fragments-list">
          <div
            v-for="fragment in fragments"
            :key="fragment.id"
            class="fragment-item"
            :style="{ borderLeftColor: rarityColors[fragment.rarity] }"
          >
            <div class="fragment-icon">{{ fragment.icon }}</div>
            <div class="fragment-info">
              <div class="fragment-name">{{ fragment.name }}</div>
              <div class="fragment-meta">
                <span class="rarity-badge" :style="{ backgroundColor: rarityColors[fragment.rarity] }">
                  {{ rarityNames[fragment.rarity] }}
                </span>
                <span class="completeness">完整度 {{ fragment.completeness }}%</span>
              </div>
              <div class="fragment-metaphors">
                <span
                  v-for="metaphor in fragment.metaphors"
                  :key="metaphor"
                  class="metaphor-tag"
                  :style="{ backgroundColor: METAPHOR_CONFIG[metaphor].color + '30', color: METAPHOR_CONFIG[metaphor].color }"
                >
                  {{ METAPHOR_CONFIG[metaphor].icon }} {{ METAPHOR_CONFIG[metaphor].name }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">😔</div>
        <p>本次挑战没有收集到任何碎片</p>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="result-actions">
      <button class="action-btn secondary" @click="goHome">
        <span>🏠</span> 返回首页
      </button>
      <button class="action-btn primary" @click="startNewChallenge">
        <span>⚔️</span> 再次挑战
      </button>
      <button class="action-btn secondary" @click="goToAchievements">
        <span>🏆</span> 查看成就
      </button>
    </div>
  </div>
</template>

<style scoped>
.result-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #16213e 100%);
  color: white;
  padding: 2rem;
  box-sizing: border-box;
}

.result-header {
  text-align: center;
  margin-bottom: 2rem;
}

.result-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.result-subtitle {
  margin: 0;
  opacity: 0.6;
  font-size: 1rem;
}

.result-content {
  max-width: 1000px;
  margin: 0 auto 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.08);
}

.stat-card.highlight {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 237, 78, 0.1) 100%);
  border-color: rgba(255, 215, 0, 0.3);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.5rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-icon {
  font-size: 1.2rem;
}

.rarity-chart {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rarity-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.rarity-label {
  display: flex;
  justify-content: space-between;
  min-width: 100px;
  font-size: 0.9rem;
}

.rarity-name {
  color: var(--rarity-color);
  font-weight: 600;
}

.rarity-count {
  opacity: 0.7;
}

.rarity-track {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.rarity-fill {
  height: 100%;
  background: var(--rarity-color);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
}

.category-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  transition: all 0.3s;
}

.category-card:hover {
  transform: translateY(-4px);
  border-color: var(--category-color);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.category-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.category-name {
  font-size: 0.85rem;
  opacity: 0.8;
  margin-bottom: 0.25rem;
}

.category-count {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--category-color);
}

.metaphor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
}

.metaphor-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 0.75rem;
  transition: all 0.3s;
}

.metaphor-item:hover {
  border-color: var(--metaphor-color);
  background: rgba(255, 255, 255, 0.08);
}

.metaphor-icon {
  font-size: 1.5rem;
}

.metaphor-info {
  flex: 1;
}

.metaphor-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--metaphor-color);
}

.metaphor-count {
  font-size: 0.75rem;
  opacity: 0.6;
}

.fragments-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.fragment-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 3px solid;
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s;
}

.fragment-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(4px);
}

.fragment-icon {
  font-size: 2rem;
}

.fragment-info {
  flex: 1;
}

.fragment-name {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.fragment-meta {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.rarity-badge {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 10px;
  color: white;
  font-weight: 600;
}

.completeness {
  font-size: 0.75rem;
  opacity: 0.6;
}

.fragment-metaphors {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.metaphor-tag {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  opacity: 0.6;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  max-width: 1000px;
  margin: 0 auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

@media (max-width: 768px) {
  .result-container {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .metaphor-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .result-actions {
    flex-direction: column;
  }
}
</style>
