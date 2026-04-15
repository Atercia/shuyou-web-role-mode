import * as THREE from 'three'
import type { BookConfig, KnowledgePoint } from '@/types/book'

export type { BookConfig, KnowledgePoint }

export class Book {
  private scene: THREE.Scene
  private config: BookConfig
  private mesh: THREE.Group
  private isHighlighted: boolean = false
  private floatOffset: number = 0
  private labelElement: HTMLElement | null = null

  constructor(scene: THREE.Scene, config: BookConfig) {
    this.scene = scene
    this.config = config
    this.mesh = this.createMesh()
    this.scene.add(this.mesh)
    this.createLabel()
  }

  private createMesh(): THREE.Group {
    const group = new THREE.Group()

    // 书籍主体 - 长方体
    const bookGeometry = new THREE.BoxGeometry(1.2, 1.6, 0.3)
    const bookMaterial = new THREE.MeshLambertMaterial({
      color: this.config.color,
      emissive: this.config.color,
      emissiveIntensity: 0.2
    })
    const book = new THREE.Mesh(bookGeometry, bookMaterial)
    book.castShadow = true
    book.position.y = 0.8
    group.add(book)

    // 书籍封面边框
    const coverGeometry = new THREE.BoxGeometry(1.0, 1.4, 0.05)
    const coverMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8
    })
    const cover = new THREE.Mesh(coverGeometry, coverMaterial)
    cover.position.set(0, 0.8, 0.16)
    group.add(cover)

    // 书脊装饰
    const spineGeometry = new THREE.BoxGeometry(0.1, 1.6, 0.32)
    const spineMaterial = new THREE.MeshLambertMaterial({
      color: 0x333333
    })
    const spine = new THREE.Mesh(spineGeometry, spineMaterial)
    spine.position.set(-0.55, 0.8, 0)
    group.add(spine)

    // 悬浮光环
    const ringGeometry = new THREE.RingGeometry(1.5, 1.8, 32)
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: this.config.color,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.1
    group.add(ring)

    // 设置位置
    group.position.set(this.config.position.x, 0, this.config.position.z)

    return group
  }

  private createLabel(): void {
    const label = document.createElement('div')
    label.className = 'book-label'
    label.textContent = this.config.name
    label.style.cssText = `
      position: absolute;
      color: #fff;
      font-size: 14px;
      font-weight: bold;
      text-shadow: 0 2px 4px rgba(0,0,0,0.8);
      pointer-events: none;
      transform: translate(-50%, -100%);
      margin-top: -20px;
      white-space: nowrap;
      background: rgba(0,0,0,0.6);
      padding: 4px 12px;
      border-radius: 4px;
      border: 1px solid rgba(255,255,255,0.3);
    `
    document.body.appendChild(label)
    this.labelElement = label
    this.updateLabelPosition()
  }

  private updateLabelPosition(): void {
    if (!this.labelElement) return
    this.labelElement.style.display = 'none'
  }

  public updateLabelScreenPosition(camera: THREE.Camera, renderer: THREE.WebGLRenderer, characterPosition?: THREE.Vector3): void {
    if (!this.labelElement) return

    // 距离检测：如果提供了角色位置，只在一定距离内显示标签
    const maxLabelDistance = 30 // 最大显示标签距离
    if (characterPosition) {
      const distance = this.mesh.position.distanceTo(characterPosition)
      if (distance > maxLabelDistance) {
        this.labelElement.style.display = 'none'
        return
      }
    }

    // 使用书籍的基准位置（不包含悬浮动画），标签固定在底部
    const position = new THREE.Vector3(
      this.mesh.position.x,
      -0.5, // 固定在书籍底部下方
      this.mesh.position.z
    )

    position.project(camera)

    const x = (position.x * 0.5 + 0.5) * renderer.domElement.clientWidth
    const y = (-position.y * 0.5 + 0.5) * renderer.domElement.clientHeight

    // 检测是否在视口内（添加边界缓冲）
    const margin = 50 // 边界缓冲像素
    const isInViewport = position.z < 1 && 
                         x >= -margin && 
                         x <= renderer.domElement.clientWidth + margin &&
                         y >= -margin && 
                         y <= renderer.domElement.clientHeight + margin

    if (isInViewport) {
      this.labelElement.style.display = 'block'
      // 限制标签位置在视口内，防止滚动条
      const clampedX = Math.max(0, Math.min(x, renderer.domElement.clientWidth))
      const clampedY = Math.max(0, Math.min(y, renderer.domElement.clientHeight))
      this.labelElement.style.left = `${clampedX}px`
      this.labelElement.style.top = `${clampedY}px`
    } else {
      this.labelElement.style.display = 'none'
    }
  }

  public update(deltaTime: number, time: number): void {
    // 悬浮动画
    this.floatOffset += deltaTime * 2
    const floatY = Math.sin(this.floatOffset) * 0.1
    this.mesh.position.y = floatY

    // 旋转动画
    this.mesh.rotation.y += deltaTime * 0.5

    // 高亮效果
    if (this.isHighlighted) {
      const ring = this.mesh.children[3] as THREE.Mesh
      const material = ring.material as THREE.MeshBasicMaterial
      material.opacity = 0.6 + Math.sin(time * 5) * 0.2
    }
  }

  public checkInteraction(characterPos: THREE.Vector3, range: number): boolean {
    const distance = this.mesh.position.distanceTo(characterPos)
    return distance <= range
  }

  public setHighlighted(highlighted: boolean): void {
    this.isHighlighted = highlighted

    // 更新光环效果
    const ring = this.mesh.children[3] as THREE.Mesh
    const material = ring.material as THREE.MeshBasicMaterial
    material.opacity = highlighted ? 0.6 : 0.3
    material.color.setHex(highlighted ? 0xffff00 : this.config.color)

    // 更新书籍发光
    const book = this.mesh.children[0] as THREE.Mesh
    const bookMaterial = book.material as THREE.MeshLambertMaterial
    bookMaterial.emissiveIntensity = highlighted ? 0.5 : 0.2
  }

  public getPosition(): THREE.Vector3 {
    return this.mesh.position
  }

  public getConfig(): BookConfig {
    return this.config
  }

  public dispose(): void {
    if (this.labelElement) {
      document.body.removeChild(this.labelElement)
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

// 生成书籍配置
export function generateBooks(): BookConfig[] {
  const books: BookConfig[] = [
    {
      id: 'book-1',
      name: '哲学入门',
      description: '探索哲学的基本概念和思考方式',
      color: 0x9b59b6,
      position: { x: -35, z: -35 },
      size: 1,
      estimatedWeeks: 2,
      knowledgePoints: [
        { id: 'kp-1-1', title: '存在主义', content: '存在先于本质，人是自己选择的总和。', icon: '🤔' },
        { id: 'kp-1-2', title: '认识论', content: '我们如何知道我们知道的？', icon: '🧠' },
        { id: 'kp-1-3', title: '伦理学', content: '什么是善？什么是恶？', icon: '⚖️' },
        { id: 'kp-1-4', title: '逻辑学', content: '推理的基本规则和谬误。', icon: '📐' },
        { id: 'kp-1-5', title: '美学', content: '什么是美？艺术的价值在哪里？', icon: '🎨' }
      ]
    },
    {
      id: 'book-2',
      name: '时间简史',
      description: '探索时间的本质和宇宙的奥秘',
      color: 0x3498db,
      position: { x: 35, z: -35 },
      size: 1,
      estimatedWeeks: 3,
      knowledgePoints: [
        { id: 'kp-2-1', title: '时间的箭头', content: '为什么时间只能向前流动？', icon: '⏰' },
        { id: 'kp-2-2', title: '相对论', content: '时间和空间是相互关联的。', icon: '🌌' },
        { id: 'kp-2-3', title: '黑洞', content: '时间在其中停止的奇异天体。', icon: '⚫' },
        { id: 'kp-2-4', title: '大爆炸', content: '宇宙和时间的起点。', icon: '💥' },
        { id: 'kp-2-5', title: '时间旅行', content: '科幻还是可能的物理现实？', icon: '🚀' }
      ]
    },
    {
      id: 'book-3',
      name: '心理学导论',
      description: '理解人类心智和行为的科学',
      color: 0xe74c3c,
      position: { x: -35, z: 35 },
      size: 1,
      estimatedWeeks: 4,
      knowledgePoints: [
        { id: 'kp-3-1', title: '潜意识', content: '影响我们行为的隐藏力量。', icon: '🌊' },
        { id: 'kp-3-2', title: '认知偏差', content: '我们思维中的系统性错误。', icon: '🔄' },
        { id: 'kp-3-3', title: '情绪智力', content: '理解和管理情绪的能力。', icon: '💝' },
        { id: 'kp-3-4', title: '记忆机制', content: '我们如何存储和回忆信息。', icon: '📚' },
        { id: 'kp-3-5', title: '人格理论', content: '是什么让我们成为独特的个体？', icon: '🎭' }
      ]
    }
  ]

  return books
}
