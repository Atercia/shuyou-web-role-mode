import * as THREE from 'three'

export interface FragmentConfig {
  id: string
  name: string
  color: number
  size: number
  duration: number // 用时（分钟）
  dangerLevel: number // 危险等级 1-5
  position: { x: number; z: number }
}

export class MemoryFragment {
  private mesh: THREE.Group
  private scene: THREE.Scene
  private config: FragmentConfig
  private labelSprite: THREE.Sprite | null = null
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
    // 创建文字标签
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.width = 512
    canvas.height = 128

    // 背景
    context.fillStyle = 'rgba(0, 0, 0, 0.7)'
    context.roundRect(0, 0, 512, 128, 20)
    context.fill()

    // 文字
    context.font = 'bold 32px Arial'
    context.fillStyle = '#ffffff'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(`${this.config.name}的记忆碎片`, 256, 64)

    const texture = new THREE.CanvasTexture(canvas)
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
    this.labelSprite = new THREE.Sprite(spriteMaterial)
    this.labelSprite.scale.set(4, 1, 1)
    this.labelSprite.position.y = this.config.size + 2
    this.mesh.add(this.labelSprite)
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

    // 旋转动画
    this.mesh.rotation.y += deltaTime * 0.5
    this.mesh.rotation.x = Math.sin(this.animationTime) * 0.1

    // 标签始终面向相机
    if (this.labelSprite) {
      this.labelSprite.position.y = this.config.size + 2 + floatY
    }
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

  dispose() {
    this.scene.remove(this.mesh)
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose())
        } else {
          child.material.dispose()
        }
      }
    })
    if (this.labelSprite) {
      this.labelSprite.material.map?.dispose()
      this.labelSprite.material.dispose()
    }
  }
}

// 碎片配置生成器
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
    dangerLevel: colorConfig.danger,
    position: { x, z }
  }
}
