<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  visible: boolean
  text: string
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  duration: 3000
})

const emit = defineEmits<{
  complete: []
}>()

const opacity = ref(1)
const translateY = ref(0)

onMounted(() => {
  if (props.visible) {
    // 开始动画
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / props.duration, 1)

      // 向上浮动
      translateY.value = -progress * 50

      // 渐隐
      if (progress > 0.6) {
        opacity.value = 1 - (progress - 0.6) / 0.4
      }

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        emit('complete')
      }
    }
    animate()
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="float">
      <div
        v-if="visible"
        class="floating-text"
        :style="{
          opacity: opacity,
          transform: `translate(-50%, ${translateY}px)`
        }"
      >
        <div class="text-content">
          <span class="icon">✨</span>
          <span class="text">{{ text }}</span>
          <span class="icon">✨</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.floating-text {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 2000;
  pointer-events: none;
}

.text-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 32px;
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.9) 0%, rgba(102, 126, 234, 0.9) 100%);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(155, 89, 182, 0.5), 0 0 60px rgba(155, 89, 182, 0.3);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.icon {
  font-size: 1.5rem;
  animation: sparkle 1s ease-in-out infinite;
}

.icon:last-child {
  animation-delay: 0.5s;
}

.text {
  color: #fff;
  font-size: 1.3rem;
  font-weight: 600;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

@keyframes sparkle {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

/* 动画 */
.float-enter-active,
.float-leave-active {
  transition: all 0.3s ease;
}

.float-enter-from,
.float-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px) !important;
}
</style>
