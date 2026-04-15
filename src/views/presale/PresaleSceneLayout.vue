<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  title: string
  icon: string
  description: string
  gradient?: string
}>()

const gradient = props.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
</script>

<template>
  <div class="presale-scene">
    <div class="scene-header" :style="{ background: gradient }">
      <div class="header-content">
        <span class="scene-icon">{{ icon }}</span>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
      </div>
      <router-link to="/" class="back-btn">← 返回首页</router-link>
    </div>
    <div class="scene-body">
      <div class="placeholder">
        <div class="placeholder-icon">{{ icon }}</div>
        <h2>{{ title }}</h2>
        <p>场景内容建设中，敬请期待...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.presale-scene {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.scene-header {
  padding: 2rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.scene-icon {
  font-size: 2.5rem;
}

.header-content h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.header-content p {
  margin: 0;
  opacity: 0.8;
  font-size: 0.9rem;
}

.back-btn {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s;
  font-size: 0.9rem;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.scene-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #16213e 100%);
}

.placeholder {
  text-align: center;
  color: white;
}

.placeholder-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.placeholder h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #fff 0%, #a0a0c0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.placeholder p {
  opacity: 0.6;
  font-size: 0.95rem;
}
</style>
