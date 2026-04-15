<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMetaphorStore } from '@/stores/metaphor'
import { useInventoryStore } from '@/stores/inventory'
import { useUserStore } from '@/stores/user'
import { FragmentCategory, FRAGMENT_CATEGORY_CONFIG } from '@/types/metaphor'
import { MetaphorType, METAPHOR_CONFIG } from '@/types/metaphor'
import type { MetaphorFragment } from '@/types/metaphor'

type ViewTab = 'fragments' | 'skilltree' | 'metaphors'

const metaphorStore = useMetaphorStore()
const inventoryStore = useInventoryStore()
const userStore = useUserStore()

const currentTab = ref<ViewTab>('fragments')
const selectedCategory = ref<FragmentCategory | null>(null)
const selectedMetaphor = ref<MetaphorType | null>(null)

const allFragments = computed(() => metaphorStore.allFragments)
const hasFragments = computed(() => allFragments.value.length > 0)

// 碎片标签页数据
const rarityStats = computed(() => {
  const stats = { common: 0, uncommon: 0, rare: 0, legendary: 0 }
  allFragments.value.forEach(f => stats[f.rarity]++)
  return stats
})

const categoryStats = computed(() => metaphorStore.categoryStats)

// 技能树数据
const skillTreeData = computed(() => metaphorStore.getSkillTreeData())

// 隐喻总览数据
const metaphorOverviewData = computed(() => metaphorStore.getMetaphorOverviewData())

const totalUnlockProgress = computed(() => metaphorStore.totalUnlockProgress)

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

function getCategoryProgress(category: FragmentCategory): number {
  const fragments = metaphorStore.getFragmentsByCategory(category)
  if (fragments.length === 0) return 0
  // 每个类别最多显示20个碎片作为100%
  return Math.min(100, Math.floor(fragments.length / 20 * 100))
}

function getMetaphorProgress(type: MetaphorType): number {
  const fragments = metaphorStore.getFragmentsByMetaphor(type)
  // 每3个碎片解锁25%，最多100%
  return Math.min(100, Math.floor(fragments.length / 3 * 25))
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
</script>

<template>
  <div class="achievement-page">
    <div class="achievement-header">
      <div class="header-left">
        <span class="header-icon">🏆</span>
        <div>
          <h1>成就馆</h1>
          <p class="header-sub">探索你的隐喻碎片收集之旅</p>
        </div>
      </div>
      <router-link to="/" class="back-btn">← 返回首页</router-link>
    </div>

    <!-- 总体统计 -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-value">{{ userStore.formattedAge }}</div>
        <div class="stat-label">探索年龄</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ allFragments.length }}</div>
        <div class="stat-label">碎片总数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ metaphorStore.unlockedMetaphors.length }}</div>
        <div class="stat-label">已解锁隐喻</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalUnlockProgress }}%</div>
        <div class="stat-label">总收集进度</div>
      </div>
    </div>

    <!-- 标签页导航 -->
    <div class="tab-navigation">
      <button
        class="tab-btn"
        :class="{ active: currentTab === 'fragments' }"
        @click="currentTab = 'fragments'"
      >
        <span class="tab-icon">💎</span>
        <span>碎片收集</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: currentTab === 'skilltree' }"
        @click="currentTab = 'skilltree'"
      >
        <span class="tab-icon">🌳</span>
        <span>技能树</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: currentTab === 'metaphors' }"
        @click="currentTab = 'metaphors'"
      >
        <span class="tab-icon">🔮</span>
        <span>核心隐喻</span>
      </button>
    </div>

    <!-- 碎片收集标签页 -->
    <div v-if="currentTab === 'fragments'" class="tab-content">
      <div v-if="hasFragments" class="fragments-view">
        <!-- 稀有度分布 -->
        <div class="section">
          <h3 class="section-title">✨ 稀有度分布</h3>
          <div class="rarity-chart">
            <div
              v-for="(count, rarity) in rarityStats"
              :key="rarity"
              class="rarity-bar"
            >
              <span class="rarity-name" :style="{ color: rarityColors[rarity] }">
                {{ rarityNames[rarity] }}
              </span>
              <div class="rarity-track">
                <div
                  class="rarity-fill"
                  :style="{
                    width: allFragments.length > 0 ? (count / allFragments.length * 100) + '%' : '0%',
                    backgroundColor: rarityColors[rarity]
                  }"
                ></div>
              </div>
              <span class="rarity-count">{{ count }}</span>
            </div>
          </div>
        </div>

        <!-- 类型分布 -->
        <div class="section">
          <h3 class="section-title">📊 类型分布</h3>
          <div class="category-overview">
            <div
              v-for="category in Object.values(FragmentCategory)"
              :key="category"
              class="category-stat"
              :style="{ '--category-color': FRAGMENT_CATEGORY_CONFIG[category].color }"
            >
              <div class="category-icon">{{ FRAGMENT_CATEGORY_CONFIG[category].icon }}</div>
              <div class="category-info">
                <div class="category-name">{{ FRAGMENT_CATEGORY_CONFIG[category].name }}</div>
                <div class="category-progress">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{ width: getCategoryProgress(category) + '%' }"
                    ></div>
                  </div>
                  <span class="progress-text">{{ categoryStats[category].total }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 碎片列表 -->
        <div class="section">
          <h3 class="section-title">🎒 碎片记录</h3>
          <div class="fragment-cards">
            <div
              v-for="fragment in allFragments"
              :key="fragment.id"
              class="fragment-card"
              :style="{ borderLeftColor: rarityColors[fragment.rarity] }"
            >
              <div class="fragment-header">
                <span class="fragment-icon">{{ fragment.icon }}</span>
                <div class="fragment-title">
                  <h4>{{ fragment.name }}</h4>
                  <span
                    class="rarity-badge"
                    :style="{ backgroundColor: rarityColors[fragment.rarity] }"
                  >
                    {{ rarityNames[fragment.rarity] }}
                  </span>
                </div>
              </div>
              <p class="fragment-desc">{{ fragment.description }}</p>
              <div class="fragment-footer">
                <div class="fragment-metaphors">
                  <span
                    v-for="metaphor in fragment.metaphors"
                    :key="metaphor"
                    class="metaphor-tag"
                    :style="{
                      backgroundColor: METAPHOR_CONFIG[metaphor].color + '30',
                      color: METAPHOR_CONFIG[metaphor].color
                    }"
                  >
                    {{ METAPHOR_CONFIG[metaphor].icon }} {{ METAPHOR_CONFIG[metaphor].name }}
                  </span>
                </div>
                <div class="completeness-bar">
                  <div class="completeness-label">
                    <span>完整度</span>
                    <span>{{ fragment.completeness }}%</span>
                  </div>
                  <div class="completeness-track">
                    <div
                      class="completeness-fill"
                      :style="{ width: fragment.completeness + '%' }"
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
        <p>前往研学挑战，收集隐喻碎片吧！</p>
        <router-link to="/challenge" class="go-challenge-btn">开始挑战 →</router-link>
      </div>
    </div>

    <!-- 技能树标签页 -->
    <div v-if="currentTab === 'skilltree'" class="tab-content">
      <div class="skilltree-view">
        <div class="skilltree-header">
          <h3>🌳 碎片技能树</h3>
          <p>按类型分类的碎片收集进度</p>
        </div>

        <div class="skilltree-grid">
          <div
            v-for="node in skillTreeData"
            :key="node.category"
            class="skilltree-node"
            :class="{ 'has-fragments': node.count > 0 }"
            :style="{ '--node-color': node.config.color }"
            @click="selectedCategory = selectedCategory === node.category ? null : node.category"
          >
            <div class="node-header">
              <div class="node-icon">{{ node.config.icon }}</div>
              <div class="node-info">
                <div class="node-name">{{ node.config.name }}</div>
                <div class="node-count">{{ node.count }} 个碎片</div>
              </div>
            </div>
            <div class="node-progress">
              <div class="progress-track">
                <div
                  class="progress-fill"
                  :style="{ width: getCategoryProgress(node.category) + '%' }"
                ></div>
              </div>
              <span class="progress-percent">{{ getCategoryProgress(node.category) }}%</span>
            </div>

            <!-- 展开的碎片列表 -->
            <div v-if="selectedCategory === node.category && node.fragments.length > 0" class="node-fragments">
              <div
                v-for="fragment in node.fragments"
                :key="fragment.id"
                class="node-fragment-item"
                :style="{ borderLeftColor: rarityColors[fragment.rarity] }"
              >
                <span class="item-icon">{{ fragment.icon }}</span>
                <span class="item-name">{{ fragment.name }}</span>
                <span class="item-rarity" :style="{ color: rarityColors[fragment.rarity] }">
                  {{ rarityNames[fragment.rarity] }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 核心隐喻标签页 -->
    <div v-if="currentTab === 'metaphors'" class="tab-content">
      <div class="metaphors-view">
        <div class="metaphors-header">
          <h3>🔮 核心隐喻总览</h3>
          <p>探索15个核心隐喻概念，收集关联碎片解锁深度理解</p>
        </div>

        <div class="metaphors-progress">
          <div class="progress-label">
            <span>总收集进度</span>
            <span>{{ totalUnlockProgress }}%</span>
          </div>
          <div class="progress-track large">
            <div
              class="progress-fill"
              :style="{ width: totalUnlockProgress + '%' }"
            ></div>
          </div>
          <div class="progress-stats">
            <span>{{ metaphorStore.unlockedMetaphors.length }} / {{ Object.values(MetaphorType).length }} 个隐喻</span>
          </div>
        </div>

        <div class="metaphors-grid">
          <div
            v-for="data in metaphorOverviewData"
            :key="data.type"
            class="metaphor-card"
            :class="{ unlocked: data.stats.isUnlocked }"
            :style="{ '--metaphor-color': data.config.color }"
            @click="selectedMetaphor = selectedMetaphor === data.type ? null : data.type"
          >
            <div class="metaphor-header">
              <div class="metaphor-icon">{{ data.config.icon }}</div>
              <div class="metaphor-info">
                <div class="metaphor-name">{{ data.config.name }}</div>
                <div class="metaphor-desc">{{ data.config.description }}</div>
              </div>
            </div>
            <div class="metaphor-stats">
              <div class="stat-item">
                <span class="stat-label">关联碎片</span>
                <span class="stat-value">{{ data.stats.count }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">解锁进度</span>
                <span class="stat-value">{{ data.stats.unlockProgress }}%</span>
              </div>
            </div>
            <div class="metaphor-progress-bar">
              <div
                class="progress-fill"
                :style="{ width: data.stats.unlockProgress + '%' }"
              ></div>
            </div>

            <!-- 展开的碎片列表 -->
            <div v-if="selectedMetaphor === data.type && data.fragments.length > 0" class="metaphor-fragments">
              <div
                v-for="fragment in data.fragments"
                :key="fragment.id"
                class="metaphor-fragment-item"
              >
                <span class="item-icon">{{ fragment.icon }}</span>
                <span class="item-name">{{ fragment.name }}</span>
                <div class="item-metaphors">
                  <span
                    v-for="m in fragment.metaphors"
                    :key="m"
                    class="mini-tag"
                    :style="{ backgroundColor: METAPHOR_CONFIG[m].color }"
                  >
                    {{ METAPHOR_CONFIG[m].name }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
  grid-template-columns: repeat(4, 1fr);
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
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.08);
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

/* 标签页导航 */
.tab-navigation {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 0.5rem;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.05);
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.tab-icon {
  font-size: 1.1rem;
}

/* 标签页内容 */
.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 碎片收集视图 */
.fragments-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
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
  opacity: 0.9;
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

.rarity-name {
  font-size: 0.9rem;
  font-weight: 600;
  min-width: 50px;
}

.rarity-track {
  flex: 1;
  height: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  overflow: hidden;
}

.rarity-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.5s ease;
}

.rarity-count {
  font-size: 0.9rem;
  min-width: 30px;
  text-align: right;
  opacity: 0.7;
}

.category-overview {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
}

.category-stat {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s;
}

.category-stat:hover {
  border-color: var(--category-color);
  transform: translateY(-2px);
}

.category-icon {
  font-size: 2rem;
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: 0.85rem;
  opacity: 0.8;
  margin-bottom: 0.25rem;
}

.category-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--category-color);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--category-color);
  min-width: 30px;
  text-align: right;
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
}

.fragment-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.fragment-icon {
  font-size: 1.8rem;
}

.fragment-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.fragment-title h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.rarity-badge {
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

.fragment-footer {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fragment-metaphors {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}

.metaphor-tag {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.completeness-bar {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 0.5rem;
}

.completeness-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  opacity: 0.7;
  margin-bottom: 0.25rem;
}

.completeness-track {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.completeness-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  border-radius: 2px;
  transition: width 0.5s ease;
}

.fragment-time {
  font-size: 0.75rem;
  opacity: 0.4;
  text-align: right;
}

/* 技能树视图 */
.skilltree-view {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.5rem;
}

.skilltree-header {
  margin-bottom: 1.5rem;
}

.skilltree-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.skilltree-header p {
  margin: 0;
  opacity: 0.6;
  font-size: 0.9rem;
}

.skilltree-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.skilltree-node {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.skilltree-node:hover {
  border-color: var(--node-color);
  transform: translateY(-2px);
}

.skilltree-node.has-fragments {
  border-left: 3px solid var(--node-color);
}

.node-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.node-icon {
  font-size: 2rem;
}

.node-info {
  flex: 1;
}

.node-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--node-color);
}

.node-count {
  font-size: 0.8rem;
  opacity: 0.6;
}

.node-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-track {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-track.large {
  height: 10px;
  border-radius: 5px;
}

.progress-percent {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--node-color);
  min-width: 40px;
  text-align: right;
}

.node-fragments {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.node-fragment-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 0.5rem;
  border-left: 2px solid;
}

.item-icon {
  font-size: 1.2rem;
}

.item-name {
  flex: 1;
  font-size: 0.85rem;
}

.item-rarity {
  font-size: 0.75rem;
  font-weight: 600;
}

/* 隐喻视图 */
.metaphors-view {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.5rem;
}

.metaphors-header {
  margin-bottom: 1.5rem;
}

.metaphors-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.metaphors-header p {
  margin: 0;
  opacity: 0.6;
  font-size: 0.9rem;
}

.metaphors-progress {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.progress-stats {
  margin-top: 0.75rem;
  text-align: center;
  font-size: 0.85rem;
  opacity: 0.7;
}

.metaphors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.metaphor-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  opacity: 0.6;
}

.metaphor-card.unlocked {
  opacity: 1;
  border-left: 3px solid var(--metaphor-color);
}

.metaphor-card:hover {
  border-color: var(--metaphor-color);
  transform: translateY(-2px);
}

.metaphor-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.metaphor-icon {
  font-size: 2rem;
}

.metaphor-info {
  flex: 1;
}

.metaphor-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--metaphor-color);
}

.metaphor-desc {
  font-size: 0.8rem;
  opacity: 0.6;
  margin: 0;
}

.metaphor-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  opacity: 0.6;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--metaphor-color);
}

.metaphor-progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.metaphor-fragments {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.metaphor-fragment-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 0.5rem;
}

.item-metaphors {
  display: flex;
  gap: 0.25rem;
}

.mini-tag {
  font-size: 0.65rem;
  padding: 1px 6px;
  border-radius: 8px;
  color: white;
}

/* 空状态 */
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

.go-challenge-btn {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s;
}

.go-challenge-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(255, 107, 107, 0.4);
}

@media (max-width: 768px) {
  .achievement-page {
    padding: 1rem;
  }

  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .category-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .fragment-cards {
    grid-template-columns: 1fr;
  }

  .skilltree-grid,
  .metaphors-grid {
    grid-template-columns: 1fr;
  }

  .achievement-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .tab-navigation {
    flex-wrap: wrap;
  }
}
</style>
