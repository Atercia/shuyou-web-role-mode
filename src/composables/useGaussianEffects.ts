import * as THREE from 'three'

export interface GaussianEffectConfig {
  position: { x: number; y: number; z: number }
  colorHue: number
  particleCount?: number
  radius?: number
}

export interface GaussianEffect {
  particles: THREE.Points
  core: THREE.Mesh
  update: (time: number) => void
  dispose: () => void
}

// 创建高斯泼溅可视化效果
export function createGaussianEffect(
  scene: THREE.Scene,
  config: GaussianEffectConfig
): GaussianEffect {
  const { position, colorHue, particleCount = 500, radius = 4 } = config
  
  // 创建粒子几何体
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)
  
  for (let i = 0; i < particleCount; i++) {
    // 高斯分布
    const u = Math.random()
    const v = Math.random()
    const theta = 2 * Math.PI * u
    const phi = Math.acos(2 * v - 1)
    const r = Math.cbrt(Math.random()) * radius
    
    positions[i * 3] = position.x + r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = position.y + r * Math.sin(phi) * Math.sin(theta) * 0.5
    positions[i * 3 + 2] = position.z + r * Math.cos(phi)
    
    // 颜色
    const hue = (colorHue + i / particleCount * 0.1) % 1
    const color = new THREE.Color().setHSL(hue, 0.8, 0.6)
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  
  // 粒子材质
  const material = new THREE.PointsMaterial({
    size: 0.3,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  })
  
  const particles = new THREE.Points(geometry, material)
  particles.userData = {
    originalY: position.y,
    phase: colorHue * Math.PI * 2,
    rotationSpeed: 0.2 + Math.random() * 0.3
  }
  scene.add(particles)
  
  // 发光核心
  const coreGeometry = new THREE.SphereGeometry(1.5, 32, 32)
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color().setHSL(colorHue, 0.8, 0.5),
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending
  })
  const core = new THREE.Mesh(coreGeometry, coreMaterial)
  core.position.set(position.x, position.y, position.z)
  core.userData = { phase: colorHue * Math.PI * 2 }
  scene.add(core)
  
  // 更新函数
  function update(time: number) {
    // 旋转粒子
    particles.rotation.y += particles.userData.rotationSpeed * 0.01
    
    // 浮动
    const floatOffset = Math.sin(time * 0.001 + particles.userData.phase) * 0.5
    particles.position.y = particles.userData.originalY + floatOffset
    
    // 核心脉动
    const scale = 1 + Math.sin(time * 0.002 + core.userData.phase) * 0.2
    core.scale.set(scale, scale, scale)
  }
  
  // 清理函数
  function dispose() {
    scene.remove(particles)
    scene.remove(core)
    geometry.dispose()
    material.dispose()
    coreGeometry.dispose()
    coreMaterial.dispose()
  }
  
  return { particles, core, update, dispose }
}

// 批量创建高斯泼溅效果
export function createGaussianEffects(
  scene: THREE.Scene,
  configs: GaussianEffectConfig[]
): {
  effects: GaussianEffect[]
  updateAll: (time: number) => void
  disposeAll: () => void
} {
  const effects = configs.map(config => createGaussianEffect(scene, config))
  
  function updateAll(time: number) {
    effects.forEach(effect => effect.update(time))
  }
  
  function disposeAll() {
    effects.forEach(effect => effect.dispose())
  }
  
  return { effects, updateAll, disposeAll }
}
