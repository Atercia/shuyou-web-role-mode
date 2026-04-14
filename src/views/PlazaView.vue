<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PlazaScene from '@/components/PlazaScene.vue'

const containerRef = ref<HTMLDivElement>()

onMounted(() => {
  // 确保canvas可以获得焦点来接收键盘事件
  if (containerRef.value) {
    containerRef.value.focus()
  }
})
</script>

<template>
  <div class="plaza-container">
    <div class="controls-info">
      <h2>🏛️ 广场探索</h2>
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
          <span>跳跃</span>
        </div>
      </div>
      <p class="hint">点击场景区域开始游戏</p>
    </div>
    <div ref="containerRef" class="scene-wrapper" tabindex="0">
      <PlazaScene />
    </div>
  </div>
</template>

<style scoped>
.plaza-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 1rem;
  box-sizing: border-box;
}

.controls-info {
  text-align: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.controls-info h2 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.key-bindings {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.key-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 6px;
  font-weight: bold;
  font-size: 14px;
}

.hint {
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.scene-wrapper {
  flex: 1;
  border: 3px solid #667eea;
  border-radius: 12px;
  overflow: hidden;
  outline: none;
}

.scene-wrapper:focus {
  border-color: #764ba2;
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
}
</style>
