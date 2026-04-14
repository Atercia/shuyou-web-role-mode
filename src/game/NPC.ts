import * as THREE from 'three'

export interface PhilosophicalScenario {
  context: string
  question: string
  choices: {
    key: 'a' | 's' | 'd'
    label: string
    text: string
  }[]
  metaphorFragment: string
}

export interface NPCConfig {
  id: string
  name: string
  color: number
  position: { x: number; z: number }
  scenario: PhilosophicalScenario
}

export class NPC {
  private mesh: THREE.Group
  private scene: THREE.Scene
  private config: NPCConfig
  private labelSprite: THREE.Sprite | null = null
  private animationTime: number = 0
  private isHighlighted: boolean = false
  private isInteracted: boolean = false
  private originalMaterials: Map<THREE.Mesh, THREE.Material> = new Map()
  private interactionCircle: THREE.Mesh | null = null

  constructor(scene: THREE.Scene, config: NPCConfig) {
    this.scene = scene
    this.config = config
    this.mesh = new THREE.Group()

    this.createMesh()
    this.createLabel()
    this.createInteractionCircle()
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
    this.originalMaterials.set(body, bodyMaterial)

    // 头部
    const headGeometry = new THREE.SphereGeometry(0.35, 16, 16)
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffdbac })
    const head = new THREE.Mesh(headGeometry, headMaterial)
    head.position.y = 2
    head.castShadow = true
    this.mesh.add(head)
    this.originalMaterials.set(head, headMaterial)

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

  private createInteractionCircle() {
    // 创建交互范围圆圈（半径3）
    const circleGeometry = new THREE.RingGeometry(2.8, 3, 32)
    const circleMaterial = new THREE.MeshBasicMaterial({
      color: 0x4ecdc4,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    })
    this.interactionCircle = new THREE.Mesh(circleGeometry, circleMaterial)
    this.interactionCircle.rotation.x = -Math.PI / 2
    this.interactionCircle.position.y = 0.05
    this.scene.add(this.interactionCircle)
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
    // 更新交互圆圈位置
    if (this.interactionCircle) {
      this.interactionCircle.position.x = x
      this.interactionCircle.position.z = z
    }
  }

  getPosition(): THREE.Vector3 {
    return this.mesh.position.clone()
  }

  getConfig(): NPCConfig {
    return this.config
  }

  hasInteracted(): boolean {
    return this.isInteracted
  }

  markAsInteracted() {
    this.isInteracted = true
    this.applyEtherealEffect()
  }

  private applyEtherealEffect() {
    // 应用虚幻效果 - 透明度和发光
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh && this.originalMaterials.has(child)) {
        const originalMat = this.originalMaterials.get(child) as THREE.MeshLambertMaterial
        const newMaterial = new THREE.MeshLambertMaterial({
          color: originalMat.color,
          transparent: true,
          opacity: 0.4
        })
        child.material = newMaterial
      }
    })

    // 标签也变淡
    if (this.labelSprite) {
      this.labelSprite.material.opacity = 0.4
    }
  }

  update(deltaTime: number, cameraPosition?: THREE.Vector3) {
    this.animationTime += deltaTime

    // 待机动画 - 轻微上下浮动（只影响Y轴偏移，不改变基础位置）
    const floatY = Math.sin(this.animationTime * 1.5) * 0.05

    // 已交互的NPC有更慢的浮动和旋转
    if (this.isInteracted) {
      this.mesh.rotation.y += deltaTime * 0.2
    }

    // 标签始终面向相机
    if (this.labelSprite) {
      this.labelSprite.position.y = 3.2 + floatY
      if (cameraPosition) {
        this.labelSprite.lookAt(cameraPosition)
      }
    }
  }

  checkInteraction(characterPosition: THREE.Vector3, interactionRadius: number = 3): boolean {
    // 已交互的NPC不能再交互
    if (this.isInteracted) return false

    const distance = this.mesh.position.distanceTo(characterPosition)
    return distance <= interactionRadius
  }

  setHighlighted(highlighted: boolean) {
    this.isHighlighted = highlighted
    // 已交互的NPC不高亮
    if (this.isInteracted) return

    // NPC身体高亮
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

    // 交互圆圈高亮
    if (this.interactionCircle) {
      const material = this.interactionCircle.material as THREE.MeshBasicMaterial
      if (highlighted) {
        material.opacity = 0.8
        material.color.setHex(0xffff00) // 高亮时变为黄色
      } else {
        material.opacity = 0.3
        material.color.setHex(0x4ecdc4) // 默认青色
      }
    }
  }

  dispose() {
    this.scene.remove(this.mesh)
    if (this.interactionCircle) {
      this.scene.remove(this.interactionCircle)
      this.interactionCircle.geometry.dispose()
      this.interactionCircle.material.dispose()
    }
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
      name: '存在之影',
      color: 0x8b4513,
      position: { x: -8, z: -8 },
      scenario: {
        context: '你站在一片虚无之中，面前是一面镜子，镜中映出的却不是你现在的模样，而是你从未成为的那个自己。',
        question: '你会如何面对这个"可能的你"？',
        choices: [
          { key: 'a', label: 'A', text: '伸手触碰镜面，试图与他和解' },
          { key: 's', label: 'S', text: '转身离去，坚信当下的选择才是真实' },
          { key: 'd', label: 'D', text: '凝视良久，接受遗憾作为生命的一部分' }
        ],
        metaphorFragment: '存在主义之镜'
      }
    },
    {
      id: 'npc-2',
      name: '时间旅者',
      color: 0x4169e1,
      position: { x: 8, z: -8 },
      scenario: {
        context: '你发现了一枚可以倒流时间的沙漏，但每倒流一秒，你的记忆就会消失一部分。',
        question: '你会如何使用这份力量？',
        choices: [
          { key: 'a', label: 'A', text: '倒流时间拯救所爱之人，哪怕忘记自己是谁' },
          { key: 's', label: 'S', text: '保留记忆，接受过去无法改变的事实' },
          { key: 'd', label: 'D', text: '只倒流一瞬间，在记忆与改变之间寻找平衡' }
        ],
        metaphorFragment: '时间悖论之沙'
      }
    },
    {
      id: 'npc-3',
      name: '真理守门人',
      color: 0x32cd32,
      position: { x: 0, z: 8 },
      scenario: {
        context: '你面前有两扇门：一扇通往绝对真理，但会让你失去所有情感；一扇通往永恒幸福，但建立在虚假之上。',
        question: '你会推开哪一扇门？',
        choices: [
          { key: 'a', label: 'A', text: '选择真理之门，用理性超越情感的束缚' },
          { key: 's', label: 'S', text: '选择幸福之门，相信感受比真实更重要' },
          { key: 'd', label: 'D', text: '两扇都不选，在矛盾中保持清醒的痛苦' }
        ],
        metaphorFragment: '真理与幻象之钥'
      }
    }
  ]
}
