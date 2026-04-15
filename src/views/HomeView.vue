<script setup lang="ts">
import { ref } from 'vue'

const presaleEntries = [
  {
    id: 'one-center-four-platforms',
    title: '一中心四平台体系',
    icon: '🏗️',
    description: '一中心四平台架构体系展示',
    color: '#667eea',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    route: '/presale/one-center-four-platforms'
  },
  {
    id: 'middle-platform',
    title: '中台',
    icon: '⚙️',
    description: '中台能力体系展示',
    color: '#f093fb',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    route: '/presale/middle-platform'
  },
  {
    id: 'ticketing',
    title: '票务体系',
    icon: '🎫',
    description: '票务系统体系展示',
    color: '#4facfe',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    route: '/presale/ticketing'
  },
  {
    id: 'safety-production',
    title: '安全生产体系',
    icon: '🛡️',
    description: '安全生产管理体系展示',
    color: '#43e97b',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    route: '/presale/safety-production'
  }
]

const hoveredEntry = ref<string | null>(null)
</script>

<template>
  <main class="home">
    <div class="home-header">
      <h1 class="home-title">书游 · 场景导航</h1>
      <p class="home-subtitle">基于 Vue3 + Three.js 的 2.5D 风格项目原型</p>
    </div>

    <div class="home-content">
      <section class="section">
        <h2 class="section-title">
          <span class="section-icon">🏛️</span>
          场景入口
        </h2>
        <div class="entry-cards">
          <router-link to="/challenge" class="entry-card challenge-card">
            <div class="card-icon">⚔️</div>
            <div class="card-body">
              <h3>研学挑战</h3>
              <p>进入肉鸽模式挑战，在20分钟内收集尽可能多的隐喻碎片</p>
            </div>
            <div class="card-arrow">→</div>
          </router-link>

          <router-link to="/achievement" class="entry-card achievement-card">
            <div class="card-icon">�</div>
            <div class="card-body">
              <h3>成就馆</h3>
              <p>查看积累的隐喻碎片记录与成就</p>
            </div>
            <div class="card-arrow">→</div>
          </router-link>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">
          <span class="section-icon">💼</span>
          售前板块
        </h2>
        <div class="presale-grid">
          <router-link
            v-for="entry in presaleEntries"
            :key="entry.id"
            :to="entry.route"
            class="presale-card"
            :style="{ '--card-gradient': entry.gradient, '--card-color': entry.color }"
            @mouseenter="hoveredEntry = entry.id"
            @mouseleave="hoveredEntry = null"
          >
            <div class="presale-icon">{{ entry.icon }}</div>
            <h3 class="presale-title">{{ entry.title }}</h3>
            <p class="presale-desc">{{ entry.description }}</p>
            <div class="presale-enter" :class="{ active: hoveredEntry === entry.id }">
              进入场景 →
            </div>
          </router-link>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.home {
  text-align: center;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.home-header {
  margin-bottom: 3rem;
}

.home-title {
  font-size: 2.2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.home-subtitle {
  color: var(--color-text);
  opacity: 0.6;
  font-size: 1rem;
}

.home-content {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.section-icon {
  font-size: 1.4rem;
}

.entry-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.25rem;
}

.entry-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 16px;
  text-decoration: none;
  color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.entry-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity 0.3s;
}

.entry-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

.challenge-card {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

.challenge-card:hover {
  box-shadow: 0 12px 40px rgba(255, 107, 107, 0.4);
}

.achievement-card {
  background: linear-gradient(135deg, #f7971e 0%, #ffd200 100%);
}

.achievement-card:hover {
  box-shadow: 0 12px 40px rgba(247, 151, 30, 0.4);
}

.card-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.card-body {
  flex: 1;
  text-align: left;
}

.card-body h3 {
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
}

.card-body p {
  font-size: 0.85rem;
  opacity: 0.85;
  line-height: 1.4;
}

.card-arrow {
  font-size: 1.5rem;
  opacity: 0.6;
  transition: all 0.3s;
  flex-shrink: 0;
}

.entry-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(4px);
}

.presale-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}

.presale-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.5rem;
  border-radius: 16px;
  text-decoration: none;
  color: white;
  background: var(--card-gradient);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.presale-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0);
  transition: background 0.3s;
}

.presale-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
}

.presale-card:hover::after {
  background: rgba(255, 255, 255, 0.05);
}

.presale-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
}

.presale-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.presale-desc {
  font-size: 0.8rem;
  opacity: 0.8;
  line-height: 1.4;
  margin-bottom: 1rem;
}

.presale-enter {
  font-size: 0.85rem;
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.3s;
  font-weight: 500;
}

.presale-enter.active {
  opacity: 1;
  transform: translateY(0);
}

.presale-card:hover .presale-enter {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 768px) {
  .home {
    padding: 1rem;
  }

  .home-title {
    font-size: 1.6rem;
  }

  .entry-cards {
    grid-template-columns: 1fr;
  }

  .presale-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .presale-grid {
    grid-template-columns: 1fr;
  }
}
</style>
