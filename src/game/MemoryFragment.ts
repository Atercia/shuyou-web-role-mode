import * as THREE from 'three'

export interface FragmentConfig {
  id: string
  name: string
  color: number
  size: number
  duration: number // 用时（秒）
  estimatedWeeks: number // 用时（周）
  dangerLevel: number // 危险等级 1-5
  position: { x: number; z: number }
}

export class MemoryFragment {
  private mesh: THREE.Group
  private scene: THREE.Scene
  private config: FragmentConfig
  private labelElement: HTMLElement | null = null
  private animationTime: number = 0
  private onInteract: (() => void) | null = null

  constructor(scene: THREE.Scene, config: FragmentConfig) {
    this.scene = scene
    this.config = config
    this.mesh = new THREE.Group()

    this.createMesh()
    this.createLabel()
    this.setPosition(config.position.x, config.position.z)
  }

  private createMesh() {
    // 创建水晶形状的几何体
    const geometry = new THREE.OctahedronGeometry(this.config.size, 0)
    const material = new THREE.MeshPhongMaterial({
      color: this.config.color,
      emissive: this.config.color,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.9,
      shininess: 100
    })
    const crystal = new THREE.Mesh(geometry, material)
    crystal.castShadow = true
    this.mesh.add(crystal)

    // 添加内部发光核心
    const coreGeometry = new THREE.OctahedronGeometry(this.config.size * 0.5, 0)
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6
    })
    const core = new THREE.Mesh(coreGeometry, coreMaterial)
    this.mesh.add(core)

    // 添加光晕效果
    const glowGeometry = new THREE.SphereGeometry(this.config.size * 1.5, 16, 16)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: this.config.color,
      transparent: true,
      opacity: 0.2
    })
    const glow = new THREE.Mesh(glowGeometry, glowMaterial)
    this.mesh.add(glow)

    this.scene.add(this.mesh)
  }

  private createLabel() {
    // 使用 DOM 元素创建标签，更清晰
    const label = document.createElement('div')
    label.className = 'fragment-label'
    label.textContent = `${this.config.name}的记忆碎片`
    label.style.cssText = `
      position: fixed;
      color: #fff;
      font-size: 14px;
      font-weight: bold;
      text-shadow: 0 2px 4px rgba(0,0,0,0.8);
      pointer-events: none;
      transform: translate(-50%, 0);
      margin-top: 8px;
      white-space: nowrap;
      background: rgba(0,0,0,0.7);
      padding: 6px 14px;
      border-radius: 6px;
      border: 1px solid rgba(255,255,255,0.3);
      z-index: 100;
      display: none;
    `
    document.body.appendChild(label)
    this.labelElement = label
  }

  public updateLabelScreenPosition(camera: THREE.Camera, renderer: THREE.WebGLRenderer): void {
    if (!this.labelElement) return

    // 使用碎片的基准位置（不包含悬浮动画），标签固定在底部
    const baseY = this.config.size + 1
    const position = new THREE.Vector3(
      this.mesh.position.x,
      baseY - this.config.size - 0.5, // 固定在底部下方
      this.mesh.position.z
    )

    position.project(camera)

    const x = (position.x * 0.5 + 0.5) * renderer.domElement.clientWidth
    const y = (-position.y * 0.5 + 0.5) * renderer.domElement.clientHeight

    if (position.z < 1) {
      this.labelElement.style.display = 'block'
      this.labelElement.style.left = `${x}px`
      this.labelElement.style.top = `${y}px`
    } else {
      this.labelElement.style.display = 'none'
    }
  }

  setPosition(x: number, z: number) {
    this.mesh.position.set(x, this.config.size + 1, z)
  }

  getPosition(): THREE.Vector3 {
    return this.mesh.position.clone()
  }

  getConfig(): FragmentConfig {
    return this.config
  }

  update(deltaTime: number) {
    this.animationTime += deltaTime

    // 悬浮动画
    const floatY = Math.sin(this.animationTime * 2) * 0.3
    this.mesh.position.y = this.config.size + 1 + floatY
  }

  // 检测角色是否在交互范围内
  checkInteraction(characterPosition: THREE.Vector3, interactionRadius: number = 3): boolean {
    const distance = this.mesh.position.distanceTo(characterPosition)
    return distance <= interactionRadius
  }

  // 高亮效果
  setHighlighted(highlighted: boolean) {
    this.mesh.children.forEach((child, index) => {
      if (child instanceof THREE.Mesh && index === 0) {
        const material = child.material as THREE.MeshPhongMaterial
        if (highlighted) {
          material.emissiveIntensity = 0.8
        } else {
          material.emissiveIntensity = 0.3
        }
      }
    })
  }

  // 清理资源
  dispose() {
    if (this.labelElement && this.labelElement.parentNode) {
      this.labelElement.parentNode.removeChild(this.labelElement)
      this.labelElement = null
    }
    this.scene.remove(this.mesh)
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose())
        } else {
          child.material.dispose()
        }
      }
    })
  }
}

// 生成随机碎片配置
export function generateRandomFragment(id: number): FragmentConfig {
  const names = ['爱丽丝', ' Bob', ' Charlie', ' Diana', ' Eve', ' Frank', ' Grace', ' Henry']
  const colors = [
    { color: 0xff6b6b, danger: 1, name: '红色' },
    { color: 0x4ecdc4, danger: 2, name: '青色' },
    { color: 0x45b7d1, danger: 3, name: '蓝色' },
    { color: 0x96ceb4, danger: 4, name: '绿色' },
    { color: 0xffeaa7, danger: 5, name: '金色' }
  ]

  const colorConfig = colors[Math.floor(Math.random() * colors.length)]
  const size = 0.5 + Math.random() * 1.0 // 0.5 - 1.5
  const duration = Math.floor(10 + size * 20) // 大小越大，用时越长
  const estimatedWeeks = Math.floor(1 + size * 3) // 1-4周

  // 随机位置（避开中心区域和建筑物）
  let x, z
  do {
    x = (Math.random() - 0.5) * 40
    z = (Math.random() - 0.5) * 40
  } while (Math.abs(x) < 5 && Math.abs(z) < 5) // 避开中心区域

  return {
    id: `fragment-${id}`,
    name: names[Math.floor(Math.random() * names.length)],
    color: colorConfig.color,
    size: size,
    duration: duration,
    estimatedWeeks: estimatedWeeks,
    dangerLevel: colorConfig.danger,
    position: { x, z }
  }
}
