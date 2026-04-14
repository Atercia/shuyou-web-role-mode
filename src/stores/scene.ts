import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { SceneTemplateConfig, SceneGenerationParams } from '@/types/scene'
import { generateSceneConfig, sceneCache } from '@/utils/sceneGenerator'

export const useSceneStore = defineStore('scene', () => {
  // State
  const currentSceneId = ref<string | null>(null)
  const currentSceneConfig = ref<SceneTemplateConfig | null>(null)
  const visitedScenes = ref<Set<string>>(new Set())
  const sceneHistory = ref<string[]>([])

  // Getters
  const hasActiveScene = computed(() => currentSceneId.value !== null)
  const visitedSceneCount = computed(() => visitedScenes.value.size)
  const canGoBack = computed(() => sceneHistory.value.length > 1)

  // Actions
  function generateAndEnterScene(params: SceneGenerationParams): string {
    // 生成场景配置
    const config = generateSceneConfig(params)
    
    // 缓存场景
    sceneCache.set(config.id, config)
    
    // 进入场景
    enterScene(config.id)
    
    return config.id
  }

  function enterScene(sceneId: string): boolean {
    // 从缓存获取场景配置
    const config = sceneCache.get(sceneId)
    if (!config) {
      console.error(`Scene ${sceneId} not found in cache`)
      return false
    }

    // 保存当前场景到历史
    if (currentSceneId.value) {
      sceneHistory.value.push(currentSceneId.value)
    }

    // 设置新场景
    currentSceneId.value = sceneId
    currentSceneConfig.value = config
    
    // 标记为已访问
    visitedScenes.value.add(sceneId)
    
    return true
  }

  function goBack(): boolean {
    if (!canGoBack.value) return false
    
    // 移除当前场景
    sceneHistory.value.pop()
    
    // 获取上一个场景
    const previousSceneId = sceneHistory.value[sceneHistory.value.length - 1]
    
    // 进入上一个场景（不添加到历史）
    const config = sceneCache.get(previousSceneId)
    if (config) {
      currentSceneId.value = previousSceneId
      currentSceneConfig.value = config
      return true
    }
    
    return false
  }

  function exitScene(): void {
    currentSceneId.value = null
    currentSceneConfig.value = null
    sceneHistory.value = []
  }

  function getSceneConfig(sceneId: string): SceneTemplateConfig | undefined {
    return sceneCache.get(sceneId)
  }

  function isSceneVisited(sceneId: string): boolean {
    return visitedScenes.value.has(sceneId)
  }

  function reset(): void {
    currentSceneId.value = null
    currentSceneConfig.value = null
    visitedScenes.value.clear()
    sceneHistory.value = []
    sceneCache.clear()
  }

  return {
    // State
    currentSceneId,
    currentSceneConfig,
    visitedScenes,
    sceneHistory,
    
    // Getters
    hasActiveScene,
    visitedSceneCount,
    canGoBack,
    
    // Actions
    generateAndEnterScene,
    enterScene,
    goBack,
    exitScene,
    getSceneConfig,
    isSceneVisited,
    reset
  }
})
