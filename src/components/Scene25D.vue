<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const canvasRef = ref<HTMLCanvasElement>()
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let animationId: number

onMounted(() => {
  if (!canvasRef.value) return

  // 初始化场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a1a2e)

  // 初始化相机 - 使用等轴测视角
  camera = new THREE.PerspectiveCamera(
    45,
    canvasRef.value.clientWidth / canvasRef.value.clientHeight,
    0.1,
    1000
  )
  camera.position.set(20, 20, 20)
  camera.lookAt(0, 0, 0)

  // 初始化渲染器
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  })
  renderer.setSize(canvasRef.value.clientWidth, canvasRef.value.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  // 添加控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05

  // 添加灯光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(10, 20, 10)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  scene.add(directionalLight)

  // 创建地面网格
  const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222)
  scene.add(gridHelper)

  // 创建2.5D风格的方块
  createBlocks()

  // 动画循环
  const animate = () => {
    animationId = requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()

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
  controls?.dispose()
  renderer?.dispose()
})

function createBlocks() {
  // 创建不同高度的方块来模拟2.5D效果
  const blockPositions = [
    { x: -3, z: -3, height: 2, color: 0xe74c3c },
    { x: 0, z: -3, height: 3, color: 0x3498db },
    { x: 3, z: -3, height: 1.5, color: 0x2ecc71 },
    { x: -3, z: 0, height: 2.5, color: 0xf39c12 },
    { x: 0, z: 0, height: 4, color: 0x9b59b6 },
    { x: 3, z: 0, height: 2, color: 0x1abc9c },
    { x: -3, z: 3, height: 1, color: 0xe67e22 },
    { x: 0, z: 3, height: 2.5, color: 0x34495e },
    { x: 3, z: 3, height: 3.5, color: 0x16a085 }
  ]

  blockPositions.forEach(pos => {
    const geometry = new THREE.BoxGeometry(1.5, pos.height, 1.5)
    const material = new THREE.MeshLambertMaterial({ color: pos.color })
    const block = new THREE.Mesh(geometry, material)
    block.position.set(pos.x, pos.height / 2, pos.z)
    block.castShadow = true
    block.receiveShadow = true
    scene.add(block)
  })
}
</script>

<template>
  <canvas ref="canvasRef" class="scene-canvas"></canvas>
</template>

<style scoped>
.scene-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
