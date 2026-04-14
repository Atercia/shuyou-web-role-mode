<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useKeyboardControls } from '@/composables/useKeyboardControls'
import { Character } from '@/game/Character'
import type { BookSceneConfig, KnowledgePoint } from '@/types/book'

interface Props {
  sceneConfig: BookSceneConfig | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  knowledgePointNearby: [point: KnowledgePoint]
  knowledgePointLeave: []
  knowledgePointRead: [point: KnowledgePoint]
}>()

const canvasRef = ref<HTMLCanvasElement>()

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let animationId: number
let lastTime = 0

let character: Character
const knowledgePointMeshes: THREE.Mesh[] = []
const knowledgePointLabels: HTMLElement[] = []
let nearbyKnowledgePoint: KnowledgePoint | null = null

const { isKeyPressed } = useKeyboardControls()

onMounted(() => {
  if (!canvasRef.value || !props.sceneConfig) return

  initScene()
  buildScene()
  character = new Character(scene)

  const animate = (time: number) => {
    animationId = requestAnimationFrame(animate)
    const deltaTime = (time - lastTime) / 1000
    lastTime = time

    updateCharacter()
    updateKnowledgePoints(deltaTime, time)
    checkInteractions()
    updateCamera()
    updateLabels()

    controls.update()
    renderer.render(scene, camera)
  }
  animate(0)

  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeyDown)
  
  // 清理标签
  knowledgePointLabels.forEach(label => {
    if (label.parentNode) {
      label.parentNode.removeChild(label)
    }
  })
  
  controls?.dispose()
  renderer?.dispose()
})

function initScene() {
  scene = new THREE.Scene()
  
  // 使用书籍颜色作为背景
  const bgColor = props.sceneConfig?.bookColor || 0x2d1b4e
  scene.background = new THREE.Color(bgColor)
  scene.fog = new THREE.Fog(bgColor, 20, 100)

  camera = new THREE.PerspectiveCamera(
    45,
    canvasRef.value!.clientWidth / canvasRef.value!.clientHeight,
    0.1,
    1000
  )
  camera.position.set(0, 15, 25)

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value!,
    antialias: true
  })
  renderer.setSize(canvasRef.value!.clientWidth, canvasRef.value!.clientHeight)
  renderer.shadowMap.enabled = true

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.maxPolarAngle = Math.PI / 2 - 0.1

  // 灯光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(10, 20, 10)
  directionalLight.castShadow = true
  scene.add(directionalLight)
}

function buildScene() {
  if (!props.sceneConfig) return

  // 创建地面
  const groundGeometry = new THREE.PlaneGeometry(40, 40)
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x3d3d5c,
    roughness: 0.8 
  })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  // 创建5个整齐排列的知识点
  const points = props.sceneConfig.knowledgePoints
  const startX = -12
  const spacing = 6

  points.forEach((point, index) => {
    const x = startX + index * spacing
    const z = 0
    createKnowledgePoint(point, x, z, index)
  })
}

function createKnowledgePoint(point: KnowledgePoint, x: number, z: number, index: number) {
  const group = new THREE.Group()

  // 灯泡底座
  const baseGeometry = new THREE.CylinderGeometry(0.4, 0.5, 0.3, 16)
  const baseMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x888888,
    metalness: 0.8,
    roughness: 0.2
  })
  const base = new THREE.Mesh(baseGeometry, baseMaterial)
  base.position.y = 0.15
  base.receiveShadow = true
  group.add(base)

  // 灯泡螺纹
  const threadGeometry = new THREE.CylinderGeometry(0.35, 0.4, 0.4, 16)
  const threadMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xaaaaaa,
    metalness: 0.6,
    roughness: 0.4
  })
  const thread = new THREE.Mesh(threadGeometry, threadMaterial)
  thread.position.y = 0.5
  group.add(thread)

  // 灯泡玻璃 - 梨形
  const hue = (index * 60) % 360
  const color = new THREE.Color().setHSL(hue / 360, 0.8, 0.6)
  const bulbGeometry = new THREE.SphereGeometry(0.7, 32, 32)
  const bulbMaterial = new THREE.MeshPhongMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.8,
    shininess: 100
  })
  const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial)
  bulb.position.y = 1.2
  bulb.scale.y = 1.3
  bulb.castShadow = true
  group.add(bulb)

  // 灯丝（内部发光）
  const filamentGeometry = new THREE.TorusGeometry(0.25, 0.02, 8, 16)
  const filamentMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffaa,
    transparent: true,
    opacity: 0.9
  })
  const filament = new THREE.Mesh(filamentGeometry, filamentMaterial)
  filament.position.y = 1.2
  filament.rotation.x = Math.PI / 2
  group.add(filament)

  // 光晕效果
  const glowGeometry = new THREE.SphereGeometry(1.0, 32, 32)
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.15,
    side: THREE.BackSide
  })
  const glow = new THREE.Mesh(glowGeometry, glowMaterial)
  glow.position.y = 1.2
  group.add(glow)

  group.position.set(x, 0, z)
  scene.add(group)

  // 存储引用
  knowledgePointMeshes.push(bulb)
  bulb.userData = { point, index, group, bulb, glow }

  // 创建标签
  createLabel(point, index)
}

function createLabel(point: KnowledgePoint, index: number) {
  const label = document.createElement('div')
  label.className = 'knowledge-point-label'
  label.innerHTML = `
    <div style="font-size: 20px; margin-bottom: 2px;">${point.icon}</div>
    <div style="font-weight: bold; font-size: 13px;">${point.title}</div>
  `
  label.style.cssText = `
    position: fixed;
    color: #fff;
    text-align: center;
    pointer-events: none;
    transform: translate(-50%, 0);
    margin-top: 8px;
    background: rgba(0,0,0,0.7);
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.3);
    white-space: nowrap;
    z-index: 100;
  `
  document.body.appendChild(label)
  knowledgePointLabels.push(label)
}

function updateLabels() {
  knowledgePointMeshes.forEach((mesh, index) => {
    const label = knowledgePointLabels[index]
    if (!label) return

    // 固定在灯泡底部下方（灯泡在 y=0 地面）
    const position = mesh.parent!.position.clone()
    position.y = -0.3
    position.project(camera)

    const x = (position.x * 0.5 + 0.5) * renderer.domElement.clientWidth
    const y = (-position.y * 0.5 + 0.5) * renderer.domElement.clientHeight

    if (position.z < 1) {
      label.style.display = 'block'
      label.style.left = `${x}px`
      label.style.top = `${y}px`
    } else {
      label.style.display = 'none'
    }
  })
}

function updateKnowledgePoints(deltaTime: number, time: number) {
  // 知识点灯泡静止不动，只有轻微的光晕呼吸效果
  knowledgePointMeshes.forEach((mesh, index) => {
    const glow = mesh.userData.glow as THREE.Mesh
    
    // 轻微的光晕呼吸效果（很慢）
    if (glow) {
      const breathe = 0.15 + Math.sin(time * 0.5 + index) * 0.03
      const material = glow.material as THREE.MeshBasicMaterial
      material.opacity = breathe
    }
  })
}

function checkInteractions() {
  if (!character) return
  const charPos = character.getPosition()

  let foundPoint = false
  let closestPoint: KnowledgePoint | null = null
  let closestDistance = Infinity

  knowledgePointMeshes.forEach(mesh => {
    const distance = mesh.parent!.position.distanceTo(charPos)
    if (distance <= 3 && distance < closestDistance) {
      closestDistance = distance
      closestPoint = mesh.userData.point as KnowledgePoint
      foundPoint = true
    }
  })

  if (foundPoint && closestPoint !== nearbyKnowledgePoint) {
    nearbyKnowledgePoint = closestPoint
    emit('knowledgePointNearby', closestPoint)
  } else if (!foundPoint && nearbyKnowledgePoint) {
    nearbyKnowledgePoint = null
    emit('knowledgePointLeave')
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.code === 'Space' && nearbyKnowledgePoint) {
    emit('knowledgePointRead', nearbyKnowledgePoint)
  }
}

function updateCharacter() {
  if (!character) return
  const moveSpeed = 0.15
  const jumpForce = 0.3

  let moveX = 0
  let moveZ = 0

  if (isKeyPressed('KeyW') || isKeyPressed('ArrowUp')) moveZ -= moveSpeed
  if (isKeyPressed('KeyS') || isKeyPressed('ArrowDown')) moveZ += moveSpeed
  if (isKeyPressed('KeyA') || isKeyPressed('ArrowLeft')) moveX -= moveSpeed
  if (isKeyPressed('KeyD') || isKeyPressed('ArrowRight')) moveX += moveSpeed

  if (isKeyPressed('Space')) character.jump(jumpForce)

  if (moveX !== 0 || moveZ !== 0) character.move(moveX, moveZ)
  character.update()
}

function updateCamera() {
  if (!character) return
  const charPos = character.getPosition()
  const targetPos = new THREE.Vector3(charPos.x, charPos.y + 15, charPos.z + 20)
  camera.position.lerp(targetPos, 0.05)
  controls.target.lerp(charPos, 0.1)
}

function handleResize() {
  if (!canvasRef.value) return
  camera.aspect = canvasRef.value.clientWidth / canvasRef.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(canvasRef.value.clientWidth, canvasRef.value.clientHeight)
}
</script>

<template>
  <canvas ref="canvasRef" class="scene-canvas" tabindex="0"></canvas>
</template>

<style scoped>
.scene-canvas {
  width: 100%;
  height: 100%;
  display: block;
  outline: none;
}
</style>
