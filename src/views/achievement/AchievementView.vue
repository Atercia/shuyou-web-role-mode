<script setup lang="ts">
import { computed } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { useUserStore } from '@/stores/user'
import { FragmentRarity, FragmentCompleteness } from '@/types/inventory'
import type { MetaphorFragment } from '@/types/inventory'

const inventoryStore = useInventoryStore()
const userStore = useUserStore()

const fragments = computed(() => inventoryStore.fragments)
const hasFragments = computed(() => fragments.value.length > 0)

const rarityStats = computed(() => {
  const stats: Record<string, number> = {}
  Object.values(FragmentRarity).forEach(r => { stats[r] = 0 })
  fragments.value.forEach(f => { stats[f.rarity]++ })
  return stats
})

const completenessStats = computed(() => {
  const stats: Record<string, number> = {}
  Object.values(FragmentCompleteness).forEach(c => { stats[c] = 0 })
  fragments.value.forEach(f => { stats[f.completeness]++ })
  return stats
})

const avgCompleteness = computed(() => {
  if (fragments.value.length === 0) return 0
  const total = fragments.value.reduce((sum, f) => sum + f.completenessValue, 0)
  return Math.round(total / fragments.value.length)
})

function getRarityColor(rarity: FragmentRarity): string {
  return inventoryStore.getFragmentRarityColor(rarity)
}

function getRarityName(rarity: FragmentRarity): string {
  return inventoryStore.getFragmentRarityName(rarity)
}

function getCompletenessName(completeness: FragmentCompleteness): string {
  return inventoryStore.getCompletenessName(completeness)
}

function formatDate(date: Date): string {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getCompletenessBarColor(value: number): string {
  if (value >= 90) return '#4caf50'
  if (value >= 70) return '#8bc34a'
  if (value >= 50) return '#ff9800'
  return '#f44336'
}
</script>

<template>
  <div class="achievement-page">
    <div class="achievement-header">
      <div class="header-left">
        <span class="header-icon">🏆</span>
        <div>
          <h1>成就馆</h1>
          <p class="header-sub">隐喻碎片记录与成就</p>
        </div>
      </div>
      <router-link to="/" class="back-btn">← 返回首页</router-link>
    </div>

    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-value">{{ userStore.formattedAge }}</div>
        <div class="stat-label">探索年龄</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ fragments.length }}</div>
        <div class="stat-label">碎片总数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ avgCompleteness }}%</div>
        <div class="stat-label">平均完整度</div>
      </div>
    </div>

    <div v-if="hasFragments" class="achievement-content">
      <div class="rarity-breakdown">
        <h3>稀有度分布</h3>
        <div class="rarity-bars">
          <div v-for="rarity in Object.values(FragmentRarity)" :key="rarity" class="rarity-row">
            <span class="rarity-name" :style="{ color: getRarityColor(rarity as FragmentRarity) }">
              {{ getRarityName(rarity as FragmentRarity) }}
            </span>
            <div class="rarity-bar-track">
              <div
                class="rarity-bar-fill"
                :style="{
                  width: fragments.length > 0 ? (rarityStats[rarity] / fragments.length * 100) + '%' : '0%',
                  backgroundColor: getRarityColor(rarity as FragmentRarity)
                }"
              ></div>
            </div>
            <span class="rarity-count">{{ rarityStats[rarity] }}</span>
          </div>
        </div>
      </div>

      <div class="completeness-breakdown">
        <h3>完整度分布</h3>
        <div class="completeness-chips">
          <div
            v-for="c in Object.values(FragmentCompleteness)"
            :key="c"
            class="completeness-chip"
            :style="{ borderColor: getCompletenessBarColor(c === FragmentCompleteness.Complete ? 95 : c === FragmentCompleteness.MostlyComplete ? 80 : c === FragmentCompleteness.Partial ? 60 : 40) }"
          >
            <span class="chip-name">{{ getCompletenessName(c as FragmentCompleteness) }}</span>
            <span class="chip-count">{{ completenessStats[c] }}</span>
          </div>
        </div>
      </div>

      <div class="fragment-list">
        <h3>碎片记录</h3>
        <div class="fragment-cards">
          <div
            v-for="fragment in fragments"
            :key="fragment.id"
            class="fragment-card"
            :style="{ borderLeftColor: getRarityColor(fragment.rarity) }"
          >
            <div class="fragment-card-header">
              <span class="fragment-icon">{{ fragment.icon }}</span>
              <div class="fragment-card-title">
                <h4>{{ fragment.name }}</h4>
                <span class="fragment-rarity-badge" :style="{ backgroundColor: getRarityColor(fragment.rarity) }">
                  {{ getRarityName(fragment.rarity) }}
                </span>
              </div>
            </div>
            <p class="fragment-desc">{{ fragment.description }}</p>
            <div class="fragment-card-footer">
              <div class="completeness-bar">
                <div class="completeness-bar-label">
                  <span>完整度</span>
                  <span>{{ fragment.completenessValue }}%</span>
                </div>
                <div class="completeness-bar-track">
                  <div
                    class="completeness-bar-fill"
                    :style="{
                      width: fragment.completenessValue + '%',
                      backgroundColor: getCompletenessBarColor(fragment.completenessValue)
                    }"
                  ></div>
                </div>
              </div>
              <span class="fragment-time">{{ formatDate(fragment.obtainedAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">🔮</div>
      <h3>尚无碎片记录</h3>
      <p>前往教育研学广场探索，收集隐喻碎片吧！</p>
      <router-link to="/plaza" class="go-explore-btn">前往广场 →</router-link>
    </div>
  </div>
</template>

<style scoped>
.achievement-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #16213e 100%);
  color: white;
  padding: 2rem;
}

.achievement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  font-size: 2.5rem;
}

.achievement-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-sub {
  margin: 0;
  opacity: 0.6;
  font-size: 0.9rem;
}

.back-btn {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
  font-size: 0.9rem;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
  backdrop-filter: blur(10px);
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.achievement-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.rarity-breakdown h3,
.completeness-breakdown h3,
.fragment-list h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.rarity-bars {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rarity-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.rarity-name {
  font-size: 0.85rem;
  font-weight: 600;
  min-width: 40px;
  text-align: right;
}

.rarity-bar-track {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.rarity-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.rarity-count {
  font-size: 0.85rem;
  min-width: 24px;
  opacity: 0.7;
}

.completeness-chips {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.completeness-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid;
  background: rgba(255, 255, 255, 0.05);
}

.chip-name {
  font-size: 0.85rem;
}

.chip-count {
  font-weight: 700;
  font-size: 0.9rem;
}

.fragment-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.fragment-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 3px solid;
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.3s;
}

.fragment-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.fragment-card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.fragment-icon {
  font-size: 1.8rem;
}

.fragment-card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.fragment-card-title h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.fragment-rarity-badge {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 10px;
  color: white;
  font-weight: 600;
}

.fragment-desc {
  margin: 0 0 0.75rem 0;
  font-size: 0.85rem;
  opacity: 0.7;
  line-height: 1.4;
}

.fragment-card-footer {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.completeness-bar-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  opacity: 0.7;
}

.completeness-bar-track {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.completeness-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s ease;
}

.fragment-time {
  font-size: 0.75rem;
  opacity: 0.4;
  text-align: right;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.empty-state h3 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  opacity: 0.8;
}

.empty-state p {
  opacity: 0.5;
  margin-bottom: 1.5rem;
}

.go-explore-btn {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s;
}

.go-explore-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .achievement-page {
    padding: 1rem;
  }

  .stats-overview {
    grid-template-columns: 1fr;
  }

  .fragment-cards {
    grid-template-columns: 1fr;
  }

  .achievement-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>
