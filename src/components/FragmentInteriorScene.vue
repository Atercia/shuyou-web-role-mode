<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useKeyboardControls } from '@/composables/useKeyboardControls'
import { Character } from '@/game/Character'
import { Door, generateDoors, type DoorConfig } from '@/game/Door'
import { NPC, generateNPCs, type NPCConfig } from '@/game/NPC'

const canvasRef = ref<HTMLCanvasElement>()
const emit = defineEmits<{
  nearDoor: [door: DoorConfig | null]
  nearNPC: [npc: NPCConfig | null]
  exit: []
}>()

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
let nearbyDoor: Door | null = null
let nearbyNPC: NPC | null = null
const { isKeyPressed } = useKeyboardControls()

onMounted(() => {
  if (!canvasRef.value) return

  initScene()
  createPlaza()
  createDoors()
  createNPCs()
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
  doors.forEach(d => d.dispose())
  npcs.forEach(n => n.dispose())
  controls?.dispose()
  renderer?.dispose()
})

function initScene() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x2d1b4e)
  scene.fog = new THREE.Fog(0x2d1b4e, 20, 60)

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

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
  directionalLight.position.set(20, 30, 10)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  scene.add(directionalLight)

  // 紫色点光源营造神秘氛围
  const pointLight1 = new THREE.PointLight(0x9b59b6, 0.8, 30)
  pointLight1.position.set(-10, 10, -10)
  scene.add(pointLight1)

  const pointLight2 = new THREE.PointLight(0x3498db, 0.8, 30)
  pointLight2.position.set(10, 10, 10)
  scene.add(pointLight2)
}

function createPlaza() {
  // 神秘风格的地面
  const groundGeometry = new THREE.PlaneGeometry(40, 40)
  const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x3d2b5e })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  // 装饰性圆环
  const ringGeometry = new THREE.RingGeometry(8, 10, 32)
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x9b59b6,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  })
  const ring = new THREE.Mesh(ringGeometry, ringMaterial)
  ring.rotation.x = -Math.PI / 2
  ring.position.y = 0.02
  scene.add(ring)

  // 中心发光柱
  const pillarGeometry = new THREE.CylinderGeometry(1, 1, 8, 8)
  const pillarMaterial = new THREE.MeshPhongMaterial({
    color: 0x9b59b6,
    emissive: 0x9b59b6,
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.8
  })
  const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial)
  pillar.position.y = 4
  scene.add(pillar)
}

function createDoors() {
  const doorConfigs = generateDoors()
  doorConfigs.forEach(config => {
    const door = new Door(scene, config)
    doors.push(door)
  })
}

function createNPCs() {
  const npcConfigs = generateNPCs()
  npcConfigs.forEach(config => {
    const npc = new NPC(scene, config)
    npcs.push(npc)
  })
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

  if (closestDoor && nearbyDoor !== closestDoor) {
    nearbyDoor?.setHighlighted(false)
    nearbyDoor = closestDoor
    nearbyDoor.setHighlighted(true)
    emit('nearDoor', closestDoor.getConfig())
  } else if (!foundDoor && nearbyDoor) {
    nearbyDoor.setHighlighted(false)
    nearbyDoor = null
    emit('nearDoor', null)
  }

  // 检查NPC交互
  let foundNPC = false
  let closestNPC: NPC | null = null
  let closestNPCDistance = Infinity

  for (const npc of npcs) {
    const distance = npc.getPosition().distanceTo(charPos)
    if (distance <= 3 && distance < closestNPCDistance) {
      closestNPCDistance = distance
      closestNPC = npc
      foundNPC = true
    }
  }

  if (closestNPC && nearbyNPC !== closestNPC) {
    nearbyNPC?.setHighlighted(false)
    nearbyNPC = closestNPC
    nearbyNPC.setHighlighted(true)
    emit('nearNPC', closestNPC.getConfig())
  } else if (!foundNPC && nearbyNPC) {
    nearbyNPC.setHighlighted(false)
    nearbyNPC = null
    emit('nearNPC', null)
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
