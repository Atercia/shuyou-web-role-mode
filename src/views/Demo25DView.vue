<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Scene25D from '@/components/Scene25D.vue'

const containerRef = ref<HTMLDivElement>()
</script>

<template>
  <div class="demo-container">
    <h2>2.5D 场景 Demo</h2>
    <div ref="containerRef" class="scene-wrapper">
      <Scene25D />
    </div>
    <div class="controls">
      <p>使用鼠标左键旋转视角，右键平移，滚轮缩放</p>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.scene-wrapper {
  width: 100%;
  max-width: 1200px;
  height: 600px;
  border: 2px solid #42b883;
  border-radius: 8px;
  overflow: hidden;
  margin: 1rem 0;
}

.controls {
  color: #666;
  font-size: 14px;
}
</style>
