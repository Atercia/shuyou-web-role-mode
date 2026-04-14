<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useKeyboardControls } from '@/composables/useKeyboardControls'
import { useFragmentStore } from '@/stores/fragment'
import { useSceneStore } from '@/stores/scene'
import { Character } from '@/game/Character'
import { Door } from '@/game/Door'
import { NPC } from '@/game/NPC'
import { THEME_CONFIGS, type SceneTemplateConfig, type SceneThemeConfig } from '@/types/scene'

interface Props {
  sceneConfig: SceneTemplateConfig | null
}

const props = defineProps<Props>()

const canvasRef = ref<HTMLCanvasElement>()
const fragmentStore = useFragmentStore()
const sceneStore = useSceneStore()

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let animationId: number
let lastTime = 0

// 游戏对象
let character: Character
const doors: Door[] = []
const npcs: NPC[] = []
let sceneNearbyDoor: Door | null = null
let sceneNearbyNPC: NPC | null = null
const { isKeyPressed } = useKeyboardControls()

// 监听场景配置变化
watch(() => props.sceneConfig, (newConfig) => {
  if (newConfig && scene) {
    rebuildScene(newConfig)
  }
})

onMounted(() => {
  if (!canvasRef.value) return

  initScene()
  
  if (props.sceneConfig) {
    initSceneWithTheme(props.sceneConfig)
    buildScene(props.sceneConfig)
  }

  character = new Character(scene)

  const animate = (time: number) => {
    animationId = requestAnimationFrame(animate)
    const deltaTime = (time - lastTime) / 1000
    lastTime = time

    updateCharacter()
    updateDoors(deltaTime)
    updateNPCs(deltaTime)
    checkInteractions()
    updateCamera()

    controls.update()
    renderer.render(scene, camera)
  }
  animate(0)

  const handleResize = () => {
    if (!canvasRef.value) return
    camera.aspect = canvasRef.value.clientWidth / canvasRef.value.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(canvasRef.value.clientWidth, canvasRef.value.clientHeight)
  }
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  cleanupScene()
  controls?.dispose()
  renderer?.dispose()
})

function cleanupScene() {
  doors.forEach(d => d.dispose())
  npcs.forEach(n => n.dispose())
  doors.length = 0
  npcs.length = 0
}

function rebuildScene(config: SceneTemplateConfig) {
  cleanupScene()
  
  while(scene.children.length > 0){ 
    scene.remove(scene.children[0])
  }
  
  initSceneWithTheme(config)
  buildScene(config)
}

function initScene() {
  scene = new THREE.Scene()
  
  camera = new THREE.PerspectiveCamera(
    45,
    canvasRef.value!.clientWidth / canvasRef.value!.clientHeight,
    0.1,
    1000
  )
  camera.position.set(15, 15, 15)

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value!,
    antialias: true
  })
  renderer.setSize(canvasRef.value!.clientWidth, canvasRef.value!.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.maxPolarAngle = Math.PI / 2 - 0.1
}

function initSceneWithTheme(config: SceneTemplateConfig) {
  // 使用字符串键获取主题配置
  const themeConfig = THEME_CONFIGS[config.theme as string]
  
  if (!themeConfig) {
    console.error('Theme not found:', config.theme)
    return
  }
  
  // 设置背景和雾
  scene.background = new THREE.Color(themeConfig.backgroundColor)
  scene.fog = new THREE.Fog(themeConfig.fogColor, 10, Math.max(config.size * 2, 100))

  // 环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, themeConfig.ambientLight)
  scene.add(ambientLight)

  // 方向光
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
  directionalLight.position.set(20, 30, 10)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  scene.add(directionalLight)

  // 半球光
  const hemisphereLight = new THREE.HemisphereLight(
    0xffffff, 
    themeConfig.groundColor, 
    0.8
  )
  scene.add(hemisphereLight)

  // 点光源
  themeConfig.pointLights.forEach(light => {
    const pointLight = new THREE.PointLight(light.color, light.intensity, 80)
    pointLight.position.set(light.position.x, light.position.y, light.position.z)
    scene.add(pointLight)
  })
}

function buildScene(config: SceneTemplateConfig) {
  const themeConfig = THEME_CONFIGS[config.theme as string]
  if (!themeConfig) return
  
  // 创建地面
  createGround(config.size, themeConfig.groundColor)
  
  // 创建装饰
  createDecorations(config.decorations || [])
  
  // 创建门
  config.doors.forEach(doorConfig => {
    const door = new Door(scene, doorConfig)
    doors.push(door)
  })
  
  // 创建NPC
  config.npcs.forEach(npcConfig => {
    const npc = new NPC(scene, npcConfig)
    npcs.push(npc)
  })
}

function createGround(size: number, color: number) {
  const groundGeometry = new THREE.PlaneGeometry(size, size)
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color,
    roughness: 0.8,
    metalness: 0.1
  })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)
}

function createDecorations(decorations: SceneTemplateConfig['decorations']) {
  decorations?.forEach(decoration => {
    switch (decoration.type) {
      case 'pillar':
        createPillar(decoration.position, decoration.color)
        break
      case 'ring':
        createRing(decoration.position, decoration.color)
        break
      case 'crystal':
        createCrystal(decoration.position, decoration.color)
        break
      case 'obelisk':
        createObelisk(decoration.position, decoration.color)
        break
    }
  })
}

function createPillar(position: { x: number; z: number }, color?: number) {
  const geometry = new THREE.CylinderGeometry(0.5, 0.5, 6, 8)
  const material = new THREE.MeshPhongMaterial({
    color: color || 0x9b59b6,
    emissive: color || 0x9b59b6,
    emissiveIntensity: 0.2,
    transparent: true,
    opacity: 0.8
  })
  const pillar = new THREE.Mesh(geometry, material)
  pillar.position.set(position.x, 3, position.z)
  scene.add(pillar)
}

function createRing(position: { x: number; z: number }, color?: number) {
  const geometry = new THREE.RingGeometry(3, 4, 32)
  const material = new THREE.MeshBasicMaterial({
    color: color || 0x9b59b6,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  })
  const ring = new THREE.Mesh(geometry, material)
  ring.rotation.x = -Math.PI / 2
  ring.position.set(position.x, 0.02, position.z)
  scene.add(ring)
}

function createCrystal(position: { x: number; z: number }, color?: number) {
  const geometry = new THREE.OctahedronGeometry(1)
  const material = new THREE.MeshPhongMaterial({
    color: color || 0x9b59b6,
    emissive: color || 0x9b59b6,
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.9
  })
  const crystal = new THREE.Mesh(geometry, material)
  crystal.position.set(position.x, 2, position.z)
  scene.add(crystal)
}

function createObelisk(position: { x: number; z: number }, color?: number) {
  const geometry = new THREE.ConeGeometry(0.8, 5, 4)
  const material = new THREE.MeshLambertMaterial({ color: color || 0x4a4a4a })
  const obelisk = new THREE.Mesh(geometry, material)
  obelisk.position.set(position.x, 2.5, position.z)
  obelisk.castShadow = true
  scene.add(obelisk)
}

function updateDoors(deltaTime: number) {
  doors.forEach(door => door.update(deltaTime, camera.position))
}

function updateNPCs(deltaTime: number) {
  npcs.forEach(npc => npc.update(deltaTime, camera.position))
}

function checkInteractions() {
  if (!character) return
  const charPos = character.getPosition()

  // 检查门交互
  let foundDoor = false
  let closestDoor: Door | null = null
  let closestDoorDistance = Infinity

  for (const door of doors) {
    const distance = door.getPosition().distanceTo(charPos)
    if (distance <= 4 && distance < closestDoorDistance) {
      closestDoorDistance = distance
      closestDoor = door
      foundDoor = true
    }
  }

  if (closestDoor && sceneNearbyDoor !== closestDoor) {
    sceneNearbyDoor?.setHighlighted(false)
    sceneNearbyDoor = closestDoor
    sceneNearbyDoor.setHighlighted(true)
    fragmentStore.setNearbyDoor(closestDoor.getConfig())
  } else if (!foundDoor && sceneNearbyDoor) {
    sceneNearbyDoor.setHighlighted(false)
    sceneNearbyDoor = null
    fragmentStore.setNearbyDoor(null)
  }

  // 检查NPC交互
  let foundNPC = false
  let closestNPC: NPC | null = null
  let closestNPCDistance = Infinity

  for (const npc of npcs) {
    if (npc.checkInteraction(charPos, 3)) {
      const distance = npc.getPosition().distanceTo(charPos)
      if (distance < closestNPCDistance) {
        closestNPCDistance = distance
        closestNPC = npc
        foundNPC = true
      }
    }
  }

  if (closestNPC) {
    if (sceneNearbyNPC !== closestNPC) {
      const config = closestNPC.getConfig()
      sceneNearbyNPC?.setHighlighted(false)
      sceneNearbyNPC = closestNPC
      sceneNearbyNPC.setHighlighted(true)
      fragmentStore.setNearbyNPC(config)
    }
  } else if (sceneNearbyNPC) {
    sceneNearbyNPC.setHighlighted(false)
    sceneNearbyNPC = null
    fragmentStore.setNearbyNPC(null)
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
  const targetPos = new THREE.Vector3(charPos.x + 15, charPos.y + 15, charPos.z + 15)
  camera.position.lerp(targetPos, 0.05)
  controls.target.lerp(charPos, 0.1)
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
