import { ref, reactive, type Ref } from 'vue'
import * as THREE from 'three'

// 可交互对象接口
export interface Interactable {
  checkInteraction: (position: THREE.Vector3, radius: number) => boolean
  setHighlighted: (highlighted: boolean) => void
  getConfig: () => any
  dispose: () => void
  update?: (deltaTime: number, ...args: any[]) => void
  updateLabelScreenPosition?: (camera: THREE.Camera, renderer: THREE.WebGLRenderer, characterPosition?: THREE.Vector3) => void
}

// 场景管理器配置
export interface SceneManagerConfig {
  interactionRadius?: number
  maxLabelDistance?: number
}

// 场景管理器 - 统一管理所有可交互对象
export function useSceneManager(config: SceneManagerConfig = {}) {
  const { interactionRadius = 4, maxLabelDistance = 40 } = config
  
  // 存储所有可交互对象
  const interactables = ref<Interactable[]>([])
  
  // 当前附近的对象
  const nearbyObject = ref<Interactable | null>(null)
  
  // 添加可交互对象
  function addInteractable(object: Interactable) {
    interactables.value.push(object)
  }
  
  // 批量添加
  function addInteractables(objects: Interactable[]) {
    interactables.value.push(...objects)
  }
  
  // 检查交互 - 统一入口
  function checkInteractions(characterPosition: THREE.Vector3): Interactable | null {
    let found: Interactable | null = null
    
    for (const obj of interactables.value) {
      if (obj.checkInteraction(characterPosition, interactionRadius)) {
        found = obj
        break
      }
    }
    
    // 处理高亮状态变化
    if (found !== nearbyObject.value) {
      if (nearbyObject.value) {
        nearbyObject.value.setHighlighted(false)
      }
      if (found) {
        found.setHighlighted(true)
      }
      nearbyObject.value = found
    }
    
    return found
  }
  
  // 更新所有对象
  function updateAll(deltaTime: number) {
    interactables.value.forEach(obj => {
      obj.update?.(deltaTime)
    })
  }
  
  // 更新所有标签
  function updateAllLabels(camera: THREE.Camera, renderer: THREE.WebGLRenderer, characterPosition?: THREE.Vector3) {
    interactables.value.forEach(obj => {
      obj.updateLabelScreenPosition?.(camera, renderer, characterPosition)
    })
  }
  
  // 清理所有对象
  function disposeAll() {
    interactables.value.forEach(obj => obj.dispose())
    interactables.value = []
    nearbyObject.value = null
  }
  
  // 获取特定类型的对象
  function getByType<T extends Interactable>(typeGuard: (obj: Interactable) => obj is T): T[] {
    return interactables.value.filter(typeGuard) as T[]
  }
  
  return {
    interactables,
    nearbyObject,
    addInteractable,
    addInteractables,
    checkInteractions,
    updateAll,
    updateAllLabels,
    disposeAll,
    getByType
  }
}

// 标签管理器 - 统一管理所有标签
export interface LabelData {
  id: string | number
  text: string
  x: number
  y: number
  visible: boolean
}

export function useLabelManager() {
  const labels = reactive<LabelData[]>([])
  
  // 注册标签
  function registerLabel(id: string | number, text: string) {
    const existing = labels.find(l => l.id === id)
    if (!existing) {
      labels.push({ id, text, x: 0, y: 0, visible: false })
    }
  }
  
  // 批量注册
  function registerLabels(items: Array<{ id: string | number; text: string }>) {
    items.forEach(item => registerLabel(item.id, item.text))
  }
  
  // 更新标签位置
  function updateLabelPosition(
    id: string | number,
    worldPos: THREE.Vector3,
    camera: THREE.Camera,
    offsetY: number = 0
  ) {
    const label = labels.find(l => l.id === id)
    if (!label) return
    
    const pos = worldPos.clone()
    pos.y += offsetY
    const screenPos = pos.project(camera)
    
    const isInFront = screenPos.z < 1
    if (isInFront) {
      const x = (screenPos.x * 0.5 + 0.5) * 100
      const y = (-screenPos.y * 0.5 + 0.5) * 100
      const isInViewport = x >= -10 && x <= 110 && y >= -10 && y <= 110
      
      label.x = x
      label.y = y
      label.visible = isInViewport
    } else {
      label.visible = false
    }
  }
  
  // 隐藏所有标签
  function hideAll() {
    labels.forEach(l => l.visible = false)
  }
  
  return {
    labels,
    registerLabel,
    registerLabels,
    updateLabelPosition,
    hideAll
  }
}

// 渲染管理器
export function useRenderManager() {
  let renderer: THREE.WebGLRenderer | null = null
  let sparkRenderer: any = null
  let useSpark = false
  
  function init(
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    sparkRendererClass?: any
  ) {
    // 创建 Three.js 渲染器
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setClearColor(0x87ceeb, 1)
    
    // 尝试初始化 Spark
    if (sparkRendererClass) {
      try {
        sparkRenderer = new sparkRendererClass({
          renderer,
          sortRadial: true
        })
        if (sparkRenderer && typeof sparkRenderer.render === 'function') {
          useSpark = true
          console.log('✅ SparkRenderer initialized')
        }
      } catch (e) {
        console.warn('⚠️ SparkRenderer failed:', e)
      }
    }
    
    return { renderer, sparkRenderer, useSpark }
  }
  
  function render(scene: THREE.Scene, camera: THREE.Camera) {
    if (!renderer) return
    
    if (useSpark && sparkRenderer) {
      try {
        sparkRenderer.render(scene, camera)
        return
      } catch (e) {
        console.warn('Spark render failed, fallback to Three.js')
      }
    }
    renderer.render(scene, camera)
  }
  
  function dispose() {
    sparkRenderer?.dispose?.()
    renderer?.dispose()
    renderer = null
    sparkRenderer = null
    useSpark = false
  }
  
  return {
    init,
    render,
    dispose,
    get renderer() { return renderer },
    get sparkRenderer() { return sparkRenderer },
    get useSpark() { return useSpark }
  }
}
