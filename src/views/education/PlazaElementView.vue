<script setup lang="ts">
import { useRoute } from 'vue-router'
import { PLAZA_ELEMENT_TYPE_META, type PlazaElementType } from '@/types/plazaElement'

const route = useRoute()

const elementType = route.params.type as PlazaElementType
const elementName = (route.query.elementName as string) || PLAZA_ELEMENT_TYPE_META[elementType]?.label || '广场场景'
const elementId = route.query.elementId as string

const meta = PLAZA_ELEMENT_TYPE_META[elementType]
</script>

<template>
  <div class="plaza-element-scene">
    <div class="scene-header">
      <div class="header-content">
        <span class="scene-icon">{{ meta?.icon || '📍' }}</span>
        <div>
          <h1>{{ elementName }}</h1>
          <p class="scene-type">{{ meta?.label || elementType }}</p>
        </div>
      </div>
      <router-link to="/challenge" class="back-btn">← 返回挑战</router-link>
    </div>
    <div class="scene-body">
      <div class="placeholder">
        <div class="placeholder-icon">{{ meta?.icon || '📍' }}</div>
        <h2>{{ elementName }}</h2>
        <p class="placeholder-id">ID: {{ elementId }}</p>
        <p>场景内容建设中，敬请期待...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.plaza-element-scene {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.scene-header {
  padding: 1.5rem 2rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #16213e 100%);
  border-bottom: 1px solid rgba(255, 215, 0, 0.3);
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

.scene-type {
  margin: 0;
  opacity: 0.7;
  font-size: 0.85rem;
  color: #ffd700;
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
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.placeholder-id {
  opacity: 0.4;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
}

.placeholder p {
  opacity: 0.6;
  font-size: 0.95rem;
}
</style>
