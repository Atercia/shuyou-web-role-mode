<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useKeyboardControls } from '@/composables/useKeyboardControls'
import { Character } from '@/game/Character'
import { MemoryFragment, generateRandomFragment, type FragmentConfig } from '@/game/MemoryFragment'
import { Book, generateBooks } from '@/game/Book'
import type { BookConfig } from '@/types/book'
import { PlazaElement, generatePlazaElements } from '@/game/PlazaElement'
import type { PlazaElementConfig } from '@/types/plazaElement'

const canvasRef = ref<HTMLCanvasElement>()
const emit = defineEmits<{
  fragmentNearby: [fragment: FragmentConfig]
  fragmentLeave: []
  bookNearby: [book: BookConfig]
  bookLeave: []
  plazaElementNearby: [element: PlazaElementConfig]
  plazaElementLeave: []
}>()

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let animationId: number
let lastTime = 0

let character: Character
const fragments: MemoryFragment[] = []
const books: Book[] = []
const plazaElements: PlazaElement[] = []
let nearbyFragment: MemoryFragment | null = null
let nearbyBook: Book | null = null
let nearbyPlazaElement: PlazaElement | null = null
const { isKeyPressed } = useKeyboardControls()

onMounted(() => {
  if (!canvasRef.value) return

  initScene()
  createPlaza()
  createFragments()
  createBooks()
  createPlazaElements()
  character = new Character(scene)

  const animate = (time: number) => {
    animationId = requestAnimationFrame(animate)

    const deltaTime = (time - lastTime) / 1000
    lastTime = time

    updateCharacter()
    updateFragments(deltaTime)
    updateBooks(deltaTime, time)
    updatePlazaElements(deltaTime)
    updateLabels()
    checkFragmentInteraction()
    checkBookInteraction()
    checkPlazaElementInteraction()
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
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  fragments.forEach(fragment => fragment.dispose())
  books.forEach(book => book.dispose())
  plazaElements.forEach(el => el.dispose())
  controls?.dispose()
  renderer?.dispose()
})

function initScene() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x87ceeb)

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

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(20, 30, 10)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  directionalLight.shadow.camera.near = 0.1
  directionalLight.shadow.camera.far = 100
  directionalLight.shadow.camera.left = -30
  directionalLight.shadow.camera.right = 30
  directionalLight.shadow.camera.top = 30
  directionalLight.shadow.camera.bottom = -30
  scene.add(directionalLight)
}

function createPlaza() {
  // 扩大广场面积到 120x120
  const groundGeometry = new THREE.PlaneGeometry(120, 120)
  const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90ee90 })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  const gridHelper = new THREE.GridHelper(120, 120, 0x228b22, 0x228b22)
  gridHelper.position.y = 0.01
  scene.add(gridHelper)

  // 扩大障碍物分布范围
  const obstacles = [
    { x: -20, z: -20, width: 4, depth: 4, height: 5, color: 0x8b4513 },
    { x: 20, z: -20, width: 3, depth: 5, height: 4, color: 0xa0522d },
    { x: -20, z: 20, width: 5, depth: 3, height: 6, color: 0xcd853f },
    { x: 20, z: 20, width: 4, depth: 4, height: 3, color: 0xdeb887 },
    { x: 0, z: -30, width: 6, depth: 3, height: 4, color: 0xbc8f8f },
    { x: -30, z: 0, width: 3, depth: 6, height: 5, color: 0xf4a460 },
    { x: 30, z: 0, width: 4, depth: 4, height: 7, color: 0xd2691e },
    { x: -35, z: -35, width: 3, depth: 3, height: 4, color: 0x8b4513 },
    { x: 35, z: -35, width: 4, depth: 4, height: 5, color: 0xa0522d },
    { x: -35, z: 35, width: 5, depth: 3, height: 4, color: 0xcd853f },
    { x: 35, z: 35, width: 3, depth: 5, height: 6, color: 0xdeb887 }
  ]

  obstacles.forEach((obs) => {
    const geometry = new THREE.BoxGeometry(obs.width, obs.height, obs.depth)
    const material = new THREE.MeshLambertMaterial({ color: obs.color })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(obs.x, obs.height / 2, obs.z)
    mesh.castShadow = true
    mesh.receiveShadow = true
    scene.add(mesh)
  })

  // 扩大树木分布范围
  const trees = [
    { x: -15, z: -10 },
    { x: 15, z: -10 },
    { x: -10, z: 15 },
    { x: 10, z: 15 },
    { x: -25, z: 25 },
    { x: 25, z: -25 },
    { x: -40, z: -15 },
    { x: 40, z: 15 },
    { x: -15, z: 40 },
    { x: 15, z: -40 },
    { x: -50, z: 0 },
    { x: 50, z: 0 },
    { x: 0, z: -50 },
    { x: 0, z: 50 }
  ]

  trees.forEach((tree) => {
    createTree(tree.x, tree.z)
  })
}

function createTree(x: number, z: number) {
  const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 2, 8)
  const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 })
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
  trunk.position.set(x, 1, z)
  trunk.castShadow = true
  scene.add(trunk)

  const leavesGeometry = new THREE.ConeGeometry(2, 4, 8)
  const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228b22 })
  const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial)
  leaves.position.set(x, 3.5, z)
  leaves.castShadow = true
  scene.add(leaves)
}

function createFragments() {
  const fragmentCount = 8 + Math.floor(Math.random() * 5)

  for (let i = 0; i < fragmentCount; i++) {
    const config = generateRandomFragment(i)
    const fragment = new MemoryFragment(scene, config)
    fragments.push(fragment)
  }
}

function createBooks() {
  const bookConfigs = generateBooks()
  
  for (const config of bookConfigs) {
    const book = new Book(scene, config)
    books.push(book)
  }
}

function createPlazaElements() {
  const elementConfigs = generatePlazaElements()

  for (const config of elementConfigs) {
    const element = new PlazaElement(scene, config)
    plazaElements.push(element)
  }
}

function updateBooks(deltaTime: number, time: number) {
  books.forEach(book => {
    book.update(deltaTime, time)
    book.updateLabelScreenPosition(camera, renderer)
  })
}

function updatePlazaElements(deltaTime: number) {
  plazaElements.forEach(el => {
    el.update(deltaTime)
    el.updateLabelScreenPosition(camera, renderer)
  })
}

function checkBookInteraction() {
  if (!character) return

  const charPos = character.getPosition()
  let foundNearby = false

  for (const book of books) {
    const isNearby = book.checkInteraction(charPos, 4)

    if (isNearby) {
      foundNearby = true
      if (nearbyBook !== book) {
        if (nearbyBook) {
          nearbyBook.setHighlighted(false)
          emit('bookLeave')
        }
        nearbyBook = book
        nearbyBook.setHighlighted(true)
        emit('bookNearby', book.getConfig())
      }
      break
    }
  }

  if (!foundNearby && nearbyBook) {
    nearbyBook.setHighlighted(false)
    nearbyBook = null
    emit('bookLeave')
  }
}

function checkPlazaElementInteraction() {
  if (!character) return

  const charPos = character.getPosition()
  let foundNearby = false

  for (const el of plazaElements) {
    const isNearby = el.checkInteraction(charPos, 4)

    if (isNearby) {
      foundNearby = true
      if (nearbyPlazaElement !== el) {
        if (nearbyPlazaElement) {
          nearbyPlazaElement.setHighlighted(false)
          emit('plazaElementLeave')
        }
        nearbyPlazaElement = el
        nearbyPlazaElement.setHighlighted(true)
        emit('plazaElementNearby', el.getConfig())
      }
      break
    }
  }

  if (!foundNearby && nearbyPlazaElement) {
    nearbyPlazaElement.setHighlighted(false)
    nearbyPlazaElement = null
    emit('plazaElementLeave')
  }
}

function updateFragments(deltaTime: number) {
  fragments.forEach((fragment) => {
    fragment.update(deltaTime)
  })
}

function updateLabels() {
  const charPos = character?.getPosition()
  
  fragments.forEach((fragment) => {
    fragment.updateLabelScreenPosition(camera, renderer, charPos)
  })
  
  books.forEach((book) => {
    book.updateLabelScreenPosition(camera, renderer, charPos)
  })

  plazaElements.forEach((el) => {
    el.updateLabelScreenPosition(camera, renderer, charPos)
  })
}

function checkFragmentInteraction() {
  if (!character) return

  const charPos = character.getPosition()
  let foundNearby = false

  for (const fragment of fragments) {
    const isNearby = fragment.checkInteraction(charPos, 4)

    if (isNearby) {
      foundNearby = true
      if (nearbyFragment !== fragment) {
        if (nearbyFragment) {
          nearbyFragment.setHighlighted(false)
          emit('fragmentLeave')
        }
        nearbyFragment = fragment
        nearbyFragment.setHighlighted(true)
        emit('fragmentNearby', fragment.getConfig())
      }
      break
    }
  }

  if (!foundNearby && nearbyFragment) {
    nearbyFragment.setHighlighted(false)
    nearbyFragment = null
    emit('fragmentLeave')
  }
}

function updateCharacter() {
  if (!character) return

  const moveSpeed = 0.15
  const jumpForce = 0.3

  let moveX = 0
  let moveZ = 0

  if (isKeyPressed('KeyW') || isKeyPressed('ArrowUp')) {
    moveZ -= moveSpeed
  }
  if (isKeyPressed('KeyS') || isKeyPressed('ArrowDown')) {
    moveZ += moveSpeed
  }
  if (isKeyPressed('KeyA') || isKeyPressed('ArrowLeft')) {
    moveX -= moveSpeed
  }
  if (isKeyPressed('KeyD') || isKeyPressed('ArrowRight')) {
    moveX += moveSpeed
  }

  if (isKeyPressed('Space')) {
    character.jump(jumpForce)
  }

  if (moveX !== 0 || moveZ !== 0) {
    character.move(moveX, moveZ)
  }

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

/* 防止标签导致滚动条 */
:global(body) {
  overflow: hidden;
  margin: 0;
  padding: 0;
}

/* 确保标签不会导致布局溢出 */
:global([class*="label"]) {
  max-width: 100vw;
  max-height: 100vh;
}
</style>
