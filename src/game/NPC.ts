import * as THREE from 'three'

export interface NPCConfig {
  id: string
  name: string
  color: number
  position: { x: number; z: number }
  dialogue: string[]
}

export class NPC {
  private mesh: THREE.Group
  private scene: THREE.Scene
  private config: NPCConfig
  private labelSprite: THREE.Sprite | null = null
  private animationTime: number = 0
  private isHighlighted: boolean = false

  constructor(scene: THREE.Scene, config: NPCConfig) {
    this.scene = scene
    this.config = config
    this.mesh = new THREE.Group()

    this.createMesh()
    this.createLabel()
    this.setPosition(config.position.x, config.position.z)
  }

  private createMesh() {
    // 身体
    const bodyGeometry = new THREE.CapsuleGeometry(0.4, 1.2, 4, 8)
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: this.config.color })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.y = 1
    body.castShadow = true
    this.mesh.add(body)

    // 头部
    const headGeometry = new THREE.SphereGeometry(0.35, 16, 16)
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac })
    const head = new THREE.Mesh(headGeometry, headMaterial)
    head.position.y = 2
    head.castShadow = true
    this.mesh.add(head)

    // 眼睛
    const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8)
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
    leftEye.position.set(-0.12, 2.05, 0.3)
    this.mesh.add(leftEye)

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
    rightEye.position.set(0.12, 2.05, 0.3)
    this.mesh.add(rightEye)

    // 头顶标识
    const markerGeometry = new THREE.SphereGeometry(0.15, 8, 8)
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 })
    const marker = new THREE.Mesh(markerGeometry, markerMaterial)
    marker.position.y = 2.6
    this.mesh.add(marker)

    this.scene.add(this.mesh)
  }

  private createLabel() {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.width = 256
    canvas.height = 64

    context.fillStyle = 'rgba(0, 0, 0, 0.7)'
    context.roundRect(0, 0, 256, 64, 10)
    context.fill()

    context.font = 'bold 24px Arial'
    context.fillStyle = '#ffffff'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(this.config.name, 128, 32)

    const texture = new THREE.CanvasTexture(canvas)
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
    this.labelSprite = new THREE.Sprite(spriteMaterial)
    this.labelSprite.scale.set(2, 0.5, 1)
    this.labelSprite.position.y = 3.2
    this.mesh.add(this.labelSprite)
  }

  setPosition(x: number, z: number) {
    this.mesh.position.set(x, 0, z)
  }

  getPosition(): THREE.Vector3 {
    return this.mesh.position.clone()
  }

  getConfig(): NPCConfig {
    return this.config
  }

  update(deltaTime: number, cameraPosition?: THREE.Vector3) {
    this.animationTime += deltaTime

    // 待机动画 - 轻微上下浮动（只影响Y轴偏移，不改变基础位置）
    const floatY = Math.sin(this.animationTime * 1.5) * 0.05

    // 标签始终面向相机
    if (this.labelSprite) {
      this.labelSprite.position.y = 3.2 + floatY
      if (cameraPosition) {
        this.labelSprite.lookAt(cameraPosition)
      }
    }
  }

  checkInteraction(characterPosition: THREE.Vector3, interactionRadius: number = 3): boolean {
    const distance = this.mesh.position.distanceTo(characterPosition)
    return distance <= interactionRadius
  }

  setHighlighted(highlighted: boolean) {
    this.isHighlighted = highlighted
    this.mesh.children.forEach((child, index) => {
      if (index === 0 && child instanceof THREE.Mesh) {
        const material = child.material as THREE.MeshLambertMaterial
        if (highlighted) {
          material.emissive = new THREE.Color(0x444444)
        } else {
          material.emissive = new THREE.Color(0x000000)
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

export function generateNPCs(): NPCConfig[] {
  return [
    {
      id: 'npc-1',
      name: '神秘商人',
      color: 0x8b4513,
      position: { x: -8, z: -8 },
      dialogue: ['欢迎光临！', '我有一些稀有的物品...', '想要看看吗？']
    },
    {
      id: 'npc-2',
      name: '智慧老者',
      color: 0x4169e1,
      position: { x: 8, z: -8 },
      dialogue: ['年轻人...', '这个碎片中隐藏着秘密', '你需要找到三把钥匙']
    },
    {
      id: 'npc-3',
      name: '守护精灵',
      color: 0x32cd32,
      position: { x: 0, z: 8 },
      dialogue: ['这里是记忆的核心', '小心选择你的道路', '每个门都通向不同的地方']
    }
  ]
}
