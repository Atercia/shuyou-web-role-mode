<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useKeyboardControls } from '@/composables/useKeyboardControls'
import { useSceneManager, useLabelManager, useRenderManager } from '@/composables/useSceneManager'
import { createGaussianEffects } from '@/composables/useGaussianEffects'
import { Character } from '@/game/Character'
import { MemoryFragment, generateRandomFragment, type FragmentConfig } from '@/game/MemoryFragment'
import { Book, generateBooks } from '@/game/Book'
import type { BookConfig } from '@/types/book'
import { PlazaElement, generatePlazaElements } from '@/game/PlazaElement'
import type { PlazaElementConfig } from '@/types/plazaElement'

// 动态导入 Spark
let SplatMesh: any
let SparkRenderer: any

const canvasRef = ref<HTMLCanvasElement>()
const emit = defineEmits<{
  fragmentNearby: [fragment: FragmentConfig]
  fragmentLeave: []
  bookNearby: [book: BookConfig]
  bookLeave: []
  plazaElementNearby: [element: PlazaElementConfig]
  plazaElementLeave: []
}>()

// 使用组合式函数管理场景
const sceneManager = useSceneManager({ interactionRadius: 4 })
const labelManager = useLabelManager()
const renderManager = useRenderManager()

// 场景状态
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let controls: OrbitControls
let animationId: number
let lastTime = 0
let character: Character
let gaussianEffects: ReturnType<typeof createGaussianEffects> | null = null

// 高斯泼溅位置配置
const GAUSSIAN_POSITIONS = [
  { x: -40, y: 3, z: -40, label: '🔮 3DGS 高斯泼溅 #1' },
  { x: 40, y: 3, z: -40, label: '🔮 3DGS 高斯泼溅 #2' },
  { x: -40, y: 3, z: 40, label: '🔮 3DGS 高斯泼溅 #3' },
  { x: 40, y: 3, z: 40, label: '🔮 3DGS 高斯泼溅 #4' }
]

const { isKeyPressed } = useKeyboardControls()

onMounted(async () => {
  await new Promise(resolve => setTimeout(resolve, 100))
  if (!canvasRef.value) return

  // 确保 canvas 尺寸
  const rect = canvasRef.value.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) {
    canvasRef.value.style.width = '100vw'
    canvasRef.value.style.height = '100vh'
  }

  // 加载 Spark
  try {
    const spark = await import('@sparkjsdev/spark')
    SplatMesh = spark.SplatMesh
    SparkRenderer = spark.SparkRenderer
    console.log('✅ Spark 2.0 loaded')
  } catch (e) {
    console.warn('⚠️ Spark not available')
  }

  // 初始化场景
  initScene()
  
  // 创建场景元素
  createPlaza()
  createGameEntities()
  createGaussianVisualization()
  
  // 初始化角色
  character = new Character(scene)
  
  // 启动循环
  startRenderLoop()
  
  // 加载真实 Gaussian 资源
  if (SparkRenderer) {
    loadGaussianScenery().catch(console.warn)
  }

  // 窗口调整
  const handleResize = () => {
    if (!canvasRef.value || !camera || !renderManager.renderer) return
    const width = canvasRef.value.clientWidth
    const height = canvasRef.value.clientHeight
    if (width === 0 || height === 0) return
    
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderManager.renderer.setSize(width, height)
  }
  window.addEventListener('resize', handleResize)
  handleResize()
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  sceneManager.disposeAll()
  gaussianEffects?.disposeAll()
  renderManager.dispose()
  controls?.dispose()
})

function initScene() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x87ceeb)

  const canvas = canvasRef.value!
  const width = canvas.clientWidth || window.innerWidth
  const height = canvas.clientHeight || window.innerHeight

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
  camera.position.set(15, 15, 15)

  const { renderer } = renderManager.init(canvas, width, height, SparkRenderer)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.maxPolarAngle = Math.PI / 2 - 0.1

  // 灯光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
  dirLight.position.set(20, 30, 10)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.set(2048, 2048)
  scene.add(dirLight)
}

function startRenderLoop() {
  const animate = (time: number) => {
    animationId = requestAnimationFrame(animate)
    const deltaTime = (time - lastTime) / 1000
    lastTime = time

    // 更新游戏逻辑
    updateGameLogic(deltaTime, time)
    
    // 渲染
    controls.update()
    renderManager.render(scene, camera)
  }
  animate(0)
}

function updateGameLogic(deltaTime: number, time: number) {
  // 更新角色
  updateCharacter()
  
  // 更新所有可交互对象
  sceneManager.updateAll(deltaTime)
  
  // 更新高斯效果
  gaussianEffects?.updateAll(time)
  
  // 检查交互
  const nearby = sceneManager.checkInteractions(character.getPosition())
  emitInteractionEvents(nearby)
  
  // 更新相机
  updateCamera()
  
  // 更新标签
  updateLabels()
}

function emitInteractionEvents(nearby: ReturnType<typeof sceneManager.checkInteractions>) {
  // 根据对象类型触发不同事件
  if (!nearby) {
    emit('fragmentLeave')
    emit('bookLeave')
    emit('plazaElementLeave')
    return
  }
  
  const config = nearby.getConfig()
  if ('rarity' in config) {
    emit('fragmentNearby', config as FragmentConfig)
  } else if ('author' in config) {
    emit('bookNearby', config as BookConfig)
  } else {
    emit('plazaElementNearby', config as PlazaElementConfig)
  }
}

function updateCharacter() {
  if (!character) return

  const moveSpeed = 0.15
  let moveX = 0, moveZ = 0

  if (isKeyPressed('KeyW') || isKeyPressed('ArrowUp')) moveZ -= moveSpeed
  if (isKeyPressed('KeyS') || isKeyPressed('ArrowDown')) moveZ += moveSpeed
  if (isKeyPressed('KeyA') || isKeyPressed('ArrowLeft')) moveX -= moveSpeed
  if (isKeyPressed('KeyD') || isKeyPressed('ArrowRight')) moveX += moveSpeed

  if (isKeyPressed('Space')) character.jump(0.3)
  if (moveX !== 0 || moveZ !== 0) character.move(moveX, moveZ)
  
  character.update()
}

function updateCamera() {
  if (!character) return
  const charPos = character.getPosition()
  camera.position.lerp(new THREE.Vector3(charPos.x + 15, charPos.y + 15, charPos.z + 15), 0.05)
  controls.target.lerp(charPos, 0.1)
}

function updateLabels() {
  const charPos = character?.getPosition()
  
  // 更新游戏元素标签
  sceneManager.updateAllLabels(camera, renderManager.renderer!, charPos)
  
  // 更新高斯泼溅标签
  GAUSSIAN_POSITIONS.forEach((pos, index) => {
    labelManager.updateLabelPosition(index, new THREE.Vector3(pos.x, pos.y + 5, pos.z), camera)
  })
}

function createPlaza() {
  // 地面
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 120),
    new THREE.MeshLambertMaterial({ color: 0x90ee90 })
  )
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  // 网格
  const grid = new THREE.GridHelper(120, 120, 0x228b22, 0x228b22)
  grid.position.y = 0.01
  scene.add(grid)

  // 障碍物
  const obstacles = [
    { x: -20, z: -20, w: 4, d: 4, h: 5, c: 0x8b4513 },
    { x: 20, z: -20, w: 3, d: 5, h: 4, c: 0xa0522d },
    { x: -20, z: 20, w: 5, d: 3, h: 6, c: 0xcd853f },
    { x: 20, z: 20, w: 4, d: 4, h: 3, c: 0xdeb887 },
    { x: 0, z: -30, w: 6, d: 3, h: 4, c: 0xbc8f8f },
    { x: -30, z: 0, w: 3, d: 6, h: 5, c: 0xf4a460 },
    { x: 30, z: 0, w: 4, d: 4, h: 7, c: 0xd2691e },
    { x: -35, z: -35, w: 3, d: 3, h: 4, c: 0x8b4513 },
    { x: 35, z: -35, w: 4, d: 4, h: 5, c: 0xa0522d },
    { x: -35, z: 35, w: 5, d: 3, h: 4, c: 0xcd853f },
    { x: 35, z: 35, w: 3, d: 5, h: 6, c: 0xdeb887 }
  ]

  obstacles.forEach(o => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(o.w, o.h, o.d),
      new THREE.MeshLambertMaterial({ color: o.c })
    )
    mesh.position.set(o.x, o.h / 2, o.z)
    mesh.castShadow = true
    scene.add(mesh)
  })

  // 树木
  const treePositions = [
    { x: -15, z: -10 }, { x: 15, z: -10 }, { x: -10, z: 15 }, { x: 10, z: 15 },
    { x: -25, z: 25 }, { x: 25, z: -25 }, { x: -40, z: -15 }, { x: 40, z: 15 },
    { x: -15, z: 40 }, { x: 15, z: -40 }, { x: -50, z: 0 }, { x: 50, z: 0 },
    { x: 0, z: -50 }, { x: 0, z: 50 }
  ]
  treePositions.forEach(p => createTree(p.x, p.z))
}

function createTree(x: number, z: number) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.5, 2, 8),
    new THREE.MeshLambertMaterial({ color: 0x8b4513 })
  )
  trunk.position.set(x, 1, z)
  trunk.castShadow = true
  scene.add(trunk)

  const leaves = new THREE.Mesh(
    new THREE.ConeGeometry(2, 4, 8),
    new THREE.MeshLambertMaterial({ color: 0x228b22 })
  )
  leaves.position.set(x, 3.5, z)
  leaves.castShadow = true
  scene.add(leaves)
}

function createGameEntities() {
  // 创建碎片
  const fragments = Array.from({ length: 8 + Math.floor(Math.random() * 5) }, (_, i) =>
    new MemoryFragment(scene, generateRandomFragment(i))
  )
  sceneManager.addInteractables(fragments)

  // 创建书籍
  const books = generateBooks().map(config => new Book(scene, config))
  sceneManager.addInteractables(books)

  // 创建广场元素
  const elements = generatePlazaElements().map(config => new PlazaElement(scene, config))
  sceneManager.addInteractables(elements)
}

function createGaussianVisualization() {
  // 注册标签
  labelManager.registerLabels(GAUSSIAN_POSITIONS.map((p, i) => ({
    id: i,
    text: p.label
  })))

  // 创建效果
  gaussianEffects = createGaussianEffects(
    scene,
    GAUSSIAN_POSITIONS.map((p, i) => ({
      position: { x: p.x, y: p.y, z: p.z },
      colorHue: i * 0.25
    }))
  )
}

async function loadGaussianScenery() {
  if (!SplatMesh) return
  
  console.log('🔄 Loading Gaussian assets...')
  
  for (const pos of GAUSSIAN_POSITIONS) {
    try {
      const splat = new SplatMesh({
        url: 'https://sparkjs.dev/assets/splats/butterfly.spz'
      })
      splat.position.set(pos.x, pos.y - 1, pos.z)
      splat.scale.set(3, 3, 3)
      scene.add(splat)
    } catch (e) {
      console.warn('Failed to load splat at', pos)
    }
  }
}
</script>

<template>
  <div class="scene-container">
    <canvas ref="canvasRef" class="scene-canvas" tabindex="0" />
    
    <!-- 高斯泼溅标签 -->
    <div
      v-for="label in labelManager.labels"
      :key="label.id"
      class="gaussian-label"
      :class="{ 'label-visible': label.visible }"
      :style="{ left: label.x + '%', top: label.y + '%' }"
    >
      {{ label.text }}
    </div>
  </div>
</template>

<style scoped>
.scene-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.scene-canvas {
  width: 100%;
  height: 100%;
  display: block;
  outline: none;
  background-color: #87ceeb;
}

.gaussian-label {
  position: absolute;
  color: white;
  background: rgba(102, 126, 234, 0.9);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  pointer-events: none;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  transform: translate(-50%, -100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;
}

.gaussian-label.label-visible {
  opacity: 1;
}

:global(body) {
  overflow: hidden;
  margin: 0;
  padding: 0;
}
</style>
