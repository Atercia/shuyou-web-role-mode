<script setup lang="ts">
import { computed } from 'vue'
import type { FragmentConfig } from '@/game/MemoryFragment'

const props = defineProps<{
  fragment: FragmentConfig | null
  visible: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const dangerText = computed(() => {
  if (!props.fragment) return ''
  const levels = ['安全', '低危', '中等', '高危', '极危']
  return levels[props.fragment.dangerLevel - 1] || '未知'
})

const dangerColor = computed(() => {
  if (!props.fragment) return '#999'
  const colors = ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336']
  return colors[props.fragment.dangerLevel - 1] || '#999'
})

const formatColor = (color: number) => {
  return '#' + color.toString(16).padStart(6, '0')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible && fragment" class="modal-overlay" @click="emit('cancel')">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>发现记忆碎片</h3>
            <button class="close-btn" @click="emit('cancel')">×</button>
          </div>

          <div class="modal-body">
            <div class="fragment-preview" :style="{ backgroundColor: formatColor(fragment.color) }">
              <span class="fragment-icon">💎</span>
            </div>

            <h4 class="fragment-name">{{ fragment.name }}的记忆碎片</h4>

            <div class="info-grid">
              <div class="info-item">
                <span class="label">预计用时</span>
                <span class="value">{{ fragment.duration }} 分钟</span>
              </div>
              <div class="info-item">
                <span class="label">危险等级</span>
                <span class="value danger" :style="{ color: dangerColor }">
                  {{ fragment.dangerLevel }}级 - {{ dangerText }}
                </span>
              </div>
              <div class="info-item">
                <span class="label">碎片大小</span>
                <span class="value">{{ fragment.size.toFixed(2) }}</span>
              </div>
            </div>

            <div class="warning" v-if="fragment.dangerLevel >= 4">
              ⚠️ 警告：该碎片危险等级较高，请谨慎进入！
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click="emit('cancel')">离开</button>
            <button class="btn-confirm" @click="emit('confirm')">进入碎片</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  margin: 0;
  color: #fff;
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 1.8rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.modal-body {
  padding: 24px;
  text-align: center;
}

.fragment-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
}

.fragment-icon {
  font-size: 2.5rem;
}

.fragment-name {
  color: #fff;
  margin: 0 0 20px 0;
  font-size: 1.2rem;
}

.info-grid {
  display: grid;
  gap: 12px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.label {
  color: #999;
  font-size: 0.9rem;
}

.value {
  color: #fff;
  font-weight: 600;
}

.value.danger {
  font-weight: 700;
}

.warning {
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.5);
  color: #ff6b6b;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.9rem;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-footer button {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-confirm {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.btn-confirm:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* 动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}
</style>
