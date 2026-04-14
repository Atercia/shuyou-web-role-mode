<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  visible: boolean
  title: string
  description?: string
  actionKey?: string
  type: 'door' | 'npc'
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  actionKey: '空格'
})

const icon = computed(() => {
  return props.type === 'door' ? '🚪' : '👤'
})

const actionText = computed(() => {
  return props.type === 'door' ? '进入' : '对话'
})
</script>

<template>
  <Transition name="prompt">
    <div v-if="visible" class="interaction-prompt">
      <div class="prompt-content" :class="type">
        <div class="icon">{{ icon }}</div>
        <div class="info">
          <h4>{{ title }}</h4>
          <p v-if="description" class="description">{{ description }}</p>
          <div class="action-hint">
            <span class="key">{{ actionKey }}</span>
            <span>键{{ actionText }}</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.interaction-prompt {
  position: fixed;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

.prompt-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 28px;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(30, 30, 50, 0.95) 100%);
  border-radius: 16px;
  border: 2px solid;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.prompt-content.door {
  border-color: #ff6b6b;
  box-shadow: 0 10px 40px rgba(255, 107, 107, 0.3);
}

.prompt-content.npc {
  border-color: #4ecdc4;
  box-shadow: 0 10px 40px rgba(78, 205, 196, 0.3);
}

.icon {
  font-size: 3rem;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
}

.info {
  color: white;
}

.info h4 {
  margin: 0 0 6px 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.description {
  margin: 0 0 10px 0;
  font-size: 0.95rem;
  color: #aaa;
  max-width: 300px;
}

.action-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
}

.key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  font-weight: bold;
  font-size: 0.9rem;
  box-shadow: 0 4px 10px rgba(102, 126, 234, 0.4);
}

/* 动画 */
.prompt-enter-active,
.prompt-leave-active {
  transition: all 0.3s ease;
}

.prompt-enter-from,
.prompt-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>
