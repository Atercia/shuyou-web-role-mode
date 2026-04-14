<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

interface ConditionDetail {
  description: string
  satisfied: boolean
}

interface ConditionStatus {
  canEnter: boolean
  summary: string
  details: ConditionDetail[]
}

interface Props {
  visible: boolean
  doorName: string
  conditionStatus: ConditionStatus | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

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

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="panel">
      <div v-if="visible" class="condition-overlay" @click="handleClose">
        <div class="condition-container" @click.stop>
          <!-- 头部 -->
          <div class="condition-header">
            <div class="door-icon">🚪</div>
            <div class="door-info">
              <h3>{{ doorName }}</h3>
              <span class="door-status" :class="{ 'status-locked': !conditionStatus?.canEnter }">
                {{ conditionStatus?.canEnter ? '🔓 可以进入' : '🔒 条件未满足' }}
              </span>
            </div>
          </div>

          <!-- 状态说明 -->
          <div class="status-message" :class="{ 'message-success': conditionStatus?.canEnter, 'message-failure': !conditionStatus?.canEnter }">
            <p>{{ conditionStatus?.summary || '无进入限制' }}</p>
          </div>

          <!-- 条件列表 -->
          <div v-if="conditionStatus?.details.length" class="conditions-section">
            <h4>进入条件</h4>
            <div class="conditions-list">
              <div
                v-for="(detail, index) in conditionStatus.details"
                :key="index"
                class="condition-item"
                :class="{ 'condition-met': detail.satisfied, 'condition-unmet': !detail.satisfied }"
              >
                <span class="condition-icon">
                  {{ detail.satisfied ? '✅' : '❌' }}
                </span>
                <span class="condition-text">{{ detail.description }}</span>
              </div>
            </div>
          </div>

          <!-- 提示 -->
          <div class="hint">
            <span class="hint-key">按 [空格] 键关闭</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.condition-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.condition-container {
  width: 100%;
  max-width: 500px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #4a5568;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.condition-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.door-icon {
  font-size: 2.5rem;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.door-info h3 {
  margin: 0;
  color: #fff;
  font-size: 1.4rem;
}

.door-status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
  margin-top: 4px;
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.door-status.status-locked {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.status-message {
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 0.95rem;
  line-height: 1.6;
}

.message-success {
  background: rgba(76, 175, 80, 0.15);
  border: 1px solid rgba(76, 175, 80, 0.3);
  color: #a5d6a7;
}

.message-failure {
  background: rgba(244, 67, 54, 0.15);
  border: 1px solid rgba(244, 67, 54, 0.3);
  color: #ef9a9a;
}

.status-message p {
  margin: 0;
}

.conditions-section {
  margin-bottom: 20px;
}

.conditions-section h4 {
  margin: 0 0 12px 0;
  color: #fff;
  font-size: 1rem;
}

.conditions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.condition-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.condition-item.condition-met {
  background: rgba(76, 175, 80, 0.1);
  border-color: rgba(76, 175, 80, 0.3);
}

.condition-item.condition-unmet {
  background: rgba(244, 67, 54, 0.1);
  border-color: rgba(244, 67, 54, 0.3);
}

.condition-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.condition-text {
  color: #e0e0e0;
  font-size: 0.9rem;
}

.condition-item.condition-met .condition-text {
  color: #a5d6a7;
}

.condition-item.condition-unmet .condition-text {
  color: #ef9a9a;
}

.hint {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.hint-key {
  color: #888;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 动画 */
.panel-enter-active,
.panel-leave-active {
  transition: all 0.3s ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
}

.panel-enter-from .condition-container,
.panel-leave-to .condition-container {
  transform: scale(0.95) translateY(10px);
}
</style>
