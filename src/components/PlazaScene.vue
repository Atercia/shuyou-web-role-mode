<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useKeyboardControls } from '@/composables/useKeyboardControls'
import { Character } from '@/game/Character'
import { MemoryFragment, generateRandomFragment, type FragmentConfig } from '@/game/MemoryFragment'

const canvasRef = ref<HTMLCanvasElement>()
const emit = defineEmits<{
  fragmentNearby: [fragment: FragmentConfig]
}>()

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let animationId: number
let lastTime = 0

// 游戏对象
let character: Character
const fragments: MemoryFragment[] = []
let nearbyFragment: MemoryFragment | null = null
const { isKeyPressed } = useKeyboardControls()

onMounted(() => {
  if (!canvasRef.value) return

  // 初始化场景
  initScene()

  // 创建广场
  createPlaza()

  // 创建记忆碎片
  createFragments()

  // 创建角色
  character = new Character(scene)

  // 动画循环
  const animate = (time: number) => {
    animationId = requestAnimationFrame(animate)

    const deltaTime = (time - lastTime) / 1000
    lastTime = time

    // 更新角色
    updateCharacter()

    // 更新碎片
    updateFragments(deltaTime)

    // 检测碎片交互
    checkFragmentInteraction()

    // 更新相机跟随角色
    updateCamera()

    controls.update()
    renderer.render(scene, camera)
  }
  animate(0)

  // 响应式调整
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
  // 清理碎片
  fragments.forEach(fragment => fragment.dispose())
  controls?.dispose()
  renderer?.dispose()
})

function initScene() {
  // 场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x87ceeb) // 天空蓝

  // 相机
  camera = new THREE.PerspectiveCamera(
    45,
    canvasRef.value!.clientWidth / canvasRef.value!.clientHeight,
    0.1,
    1000
  )
  camera.position.set(15, 15, 15)

  // 渲染器
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value!,
    antialias: true
  })
  renderer.setSize(canvasRef.value!.clientWidth, canvasRef.value!.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  // 控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.maxPolarAngle = Math.PI / 2 - 0.1 // 防止相机进入地下

  // 灯光
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
  // 创建广场地面
  const groundGeometry = new THREE.PlaneGeometry(50, 50)
  const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90ee90 })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  // 添加网格辅助线
  const gridHelper = new THREE.GridHelper(50, 50, 0x228b22, 0x228b22)
  gridHelper.position.y = 0.01
  scene.add(gridHelper)

  // 创建一些装饰性的方块（建筑物/障碍物）
  const obstacles = [
    { x: -10, z: -10, width: 3, depth: 3, height: 4, color: 0x8b4513 },
    { x: 10, z: -10, width: 2, depth: 4, height: 3, color: 0xa0522d },
    { x: -10, z: 10, width: 4, depth: 2, height: 5, color: 0xcd853f },
    { x: 10, z: 10, width: 3, depth: 3, height: 2, color: 0xdeb887 },
    { x: 0, z: -15, width: 5, depth: 2, height: 3, color: 0xbc8f8f },
    { x: -15, z: 0, width: 2, depth: 5, height: 4, color: 0xf4a460 },
    { x: 15, z: 0, width: 3, depth: 3, height: 6, color: 0xd2691e }
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

  // 添加一些树木
  const trees = [
    { x: -8, z: -5 },
    { x: 8, z: -5 },
    { x: -5, z: 8 },
    { x: 5, z: 8 },
    { x: -12, z: 12 },
    { x: 12, z: -12 }
  ]

  trees.forEach((tree) => {
    createTree(tree.x, tree.z)
  })
}

function createTree(x: number, z: number) {
  // 树干
  const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 2, 8)
  const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 })
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
  trunk.position.set(x, 1, z)
  trunk.castShadow = true
  scene.add(trunk)

  // 树冠
  const leavesGeometry = new THREE.ConeGeometry(2, 4, 8)
  const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228b22 })
  const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial)
  leaves.position.set(x, 3.5, z)
  leaves.castShadow = true
  scene.add(leaves)
}

function createFragments() {
  // 生成8-12个随机碎片
  const fragmentCount = 8 + Math.floor(Math.random() * 5)

  for (let i = 0; i < fragmentCount; i++) {
    const config = generateRandomFragment(i)
    const fragment = new MemoryFragment(scene, config)
    fragments.push(fragment)
  }
}

function updateFragments(deltaTime: number) {
  fragments.forEach((fragment) => {
    fragment.update(deltaTime)
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
        // 取消之前的高亮
        if (nearbyFragment) {
          nearbyFragment.setHighlighted(false)
        }
        // 高亮新的碎片
        nearbyFragment = fragment
        nearbyFragment.setHighlighted(true)
        // 发送事件
        emit('fragmentNearby', fragment.getConfig())
      }
      break
    }
  }

  if (!foundNearby && nearbyFragment) {
    nearbyFragment.setHighlighted(false)
    nearbyFragment = null
  }
}

function updateCharacter() {
  if (!character) return

  // 移动速度
  const moveSpeed = 0.15
  const jumpForce = 0.3

  // 计算移动方向
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

  // 跳跃
  if (isKeyPressed('Space')) {
    character.jump(jumpForce)
  }

  // 应用移动
  if (moveX !== 0 || moveZ !== 0) {
    character.move(moveX, moveZ)
  }

  // 更新角色物理
  character.update()
}

function updateCamera() {
  if (!character) return

  const charPos = character.getPosition()
  // 相机跟随角色，保持一定距离
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
