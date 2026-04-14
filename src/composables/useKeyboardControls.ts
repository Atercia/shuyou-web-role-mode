import { ref, onMounted, onUnmounted } from 'vue'

export function useKeyboardControls() {
  const keys = ref<Set<string>>(new Set())

  const handleKeyDown = (event: KeyboardEvent) => {
    keys.value.add(event.code)
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    keys.value.delete(event.code)
  }

  const isKeyPressed = (code: string): boolean => {
    return keys.value.has(code)
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
  })

  return {
    keys,
    isKeyPressed
  }
}
