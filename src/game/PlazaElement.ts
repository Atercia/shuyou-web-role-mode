import * as THREE from 'three'
import type { PlazaElementConfig, PlazaElementType } from '@/types/plazaElement'

const TYPE_BUILDERS: Record<PlazaElementType, (group: THREE.Group, config: PlazaElementConfig) => void> = {
  museum: (group, config) => {
    // 博物馆 - 增大尺寸
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(5, 0.5, 3.5),
      new THREE.MeshLambertMaterial({ color: 0xd4c5a9 })
    )
    base.position.y = 0.25
    base.castShadow = true
    group.add(base)

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(3.5, 2.5, 4),
      new THREE.MeshLambertMaterial({ color: config.color })
    )
    roof.position.y = 2.5
    roof.rotation.y = Math.PI / 4
    roof.castShadow = true
    group.add(roof)

    // 四根柱子
    const pillarPositions = [[-2, 1.5], [2, 1.5], [-2, -1.5], [2, -1.5]]
    pillarPositions.forEach(([x, z]) => {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 2, 8),
        new THREE.MeshLambertMaterial({ color: 0xf5f5dc })
      )
      pillar.position.set(x, 1.2, z)
      pillar.castShadow = true
      group.add(pillar)
    })

    const pediment = new THREE.Mesh(
      new THREE.BoxGeometry(5, 0.6, 0.15),
      new THREE.MeshLambertMaterial({ color: 0xf5f5dc })
    )
    pediment.position.set(0, 2, 1.75)
    group.add(pediment)
  },

  workshop: (group, config) => {
    // 工坊 - 增大尺寸
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(4, 2.5, 3),
      new THREE.MeshLambertMaterial({ color: 0x8b7355 })
    )
    base.position.y = 1.25
    base.castShadow = true
    group.add(base)

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 0.3, 3.5),
      new THREE.MeshLambertMaterial({ color: config.color })
    )
    roof.position.y = 2.65
    roof.castShadow = true
    group.add(roof)

    const chimney = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.35, 1.5, 8),
      new THREE.MeshLambertMaterial({ color: 0x654321 })
    )
    chimney.position.set(1.2, 3.5, -0.8)
    chimney.castShadow = true
    group.add(chimney)

    const door = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1.5, 0.15),
      new THREE.MeshLambertMaterial({ color: 0x4a3728 })
    )
    door.position.set(0, 0.75, 1.51)
    group.add(door)

    const anvil = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.5, 0.6),
      new THREE.MeshLambertMaterial({ color: 0x696969 })
    )
    anvil.position.set(-1.2, 0.25, 1.8)
    anvil.castShadow = true
    group.add(anvil)
  },

  temple: (group, config) => {
    // 神殿 - 增大尺寸
    const steps = new THREE.Mesh(
      new THREE.BoxGeometry(5.5, 0.5, 4.5),
      new THREE.MeshLambertMaterial({ color: 0xe8e0d0 })
    )
    steps.position.y = 0.25
    steps.castShadow = true
    group.add(steps)

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(4, 3, 3),
      new THREE.MeshLambertMaterial({ color: config.color })
    )
    body.position.y = 2
    body.castShadow = true
    group.add(body)

    const topRoof = new THREE.Mesh(
      new THREE.ConeGeometry(2.8, 2, 4),
      new THREE.MeshLambertMaterial({ color: 0xc9a84c })
    )
    topRoof.position.y = 4.5
    topRoof.rotation.y = Math.PI / 4
    topRoof.castShadow = true
    group.add(topRoof)

    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffd700 })
    )
    orb.position.y = 5.5
    group.add(orb)

    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 3, 8),
        new THREE.MeshLambertMaterial({ color: 0xf0ead6 })
      )
      pillar.position.set(Math.cos(angle) * 1.6, 2, Math.sin(angle) * 1.6)
      pillar.castShadow = true
      group.add(pillar)
    }
  },

  market: (group, config) => {
    // 市集 - 增大尺寸
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 1.2, 2.5),
      new THREE.MeshLambertMaterial({ color: 0xdeb887 })
    )
    counter.position.y = 0.6
    counter.castShadow = true
    group.add(counter)

    const polePositions = [[-2, -1], [2, -1], [-2, 1], [2, 1]]
    polePositions.forEach(([x, z]) => {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 4, 8),
        new THREE.MeshLambertMaterial({ color: 0x8b4513 })
      )
      pole.position.set(x, 2.5, z)
      pole.castShadow = true
      group.add(pole)
    })

    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(5, 0.15, 3),
      new THREE.MeshLambertMaterial({ color: config.color, transparent: true, opacity: 0.85 })
    )
    canopy.position.y = 4.5
    canopy.castShadow = true
    group.add(canopy)

    for (let i = 0; i < 3; i++) {
      const good = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.6, 0.6),
        new THREE.MeshLambertMaterial({
          color: [0xff6347, 0x4682b4, 0x32cd32][i]
        })
      )
      good.position.set(-1.2 + i * 1.2, 1.5, 0)
      good.castShadow = true
      group.add(good)
    }
  }
}

export class PlazaElement {
  private mesh: THREE.Group
  private scene: THREE.Scene
  private config: PlazaElementConfig
  private labelElement: HTMLElement | null = null
  private animationTime: number = 0
  private glowRing: THREE.Mesh | null = null

  constructor(scene: THREE.Scene, config: PlazaElementConfig) {
    this.scene = scene
    this.config = config
    this.mesh = new THREE.Group()

    TYPE_BUILDERS[config.type](this.mesh, config)

    this.createGlowRing()
    this.createLabel()
    this.setPosition(config.position.x, config.position.z)

    // 关键：将 mesh 添加到场景中！
    this.scene.add(this.mesh)
  }

  private createGlowRing() {
    const ringGeometry = new THREE.RingGeometry(2.5, 2.8, 32)
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: this.config.color,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide
    })
    this.glowRing = new THREE.Mesh(ringGeometry, ringMaterial)
    this.glowRing.rotation.x = -Math.PI / 2
    this.glowRing.position.y = 0.05
    this.mesh.add(this.glowRing)
  }

  private createLabel() {
    const label = document.createElement('div')
    label.className = `plaza-element-label-${this.config.type}`
    label.textContent = this.config.name
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

  public updateLabelScreenPosition(camera: THREE.Camera, renderer: THREE.WebGLRenderer, characterPosition?: THREE.Vector3): void {
    if (!this.labelElement) return

    // 距离检测：如果提供了角色位置，只在一定距离内显示标签
    const maxLabelDistance = 40 // 建筑标签显示距离稍远
    if (characterPosition) {
      const distance = this.mesh.position.distanceTo(characterPosition)
      if (distance > maxLabelDistance) {
        this.labelElement.style.display = 'none'
        return
      }
    }

    const position = new THREE.Vector3(
      this.mesh.position.x,
      -0.5,
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

  setPosition(x: number, z: number) {
    this.mesh.position.set(x, 0, z)
  }

  getPosition(): THREE.Vector3 {
    return this.mesh.position.clone()
  }

  getConfig(): PlazaElementConfig {
    return this.config
  }

  update(deltaTime: number) {
    this.animationTime += deltaTime

    if (this.glowRing) {
      const material = this.glowRing.material as THREE.MeshBasicMaterial
      material.opacity = 0.2 + Math.sin(this.animationTime * 2) * 0.1
    }
  }

  checkInteraction(characterPosition: THREE.Vector3, interactionRadius: number = 4): boolean {
    const distance = this.mesh.position.distanceTo(characterPosition)
    return distance <= interactionRadius
  }

  setHighlighted(highlighted: boolean) {
    if (this.glowRing) {
      const material = this.glowRing.material as THREE.MeshBasicMaterial
      if (highlighted) {
        material.opacity = 0.7
        material.color.setHex(0xffff00)
      } else {
        material.opacity = 0.25
        material.color.setHex(this.config.color)
      }
    }
  }

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

export function generatePlazaElements(): PlazaElementConfig[] {
  return [
    {
      id: 'museum-1',
      name: '华夏文明馆',
      type: 'museum',
      description: '探索中华五千年文明的瑰宝与传承',
      color: 0xb8860b,
      position: { x: -25, z: -20 },
      estimatedWeeks: 2
    },
    {
      id: 'museum-2',
      name: '自然探索馆',
      type: 'museum',
      description: '感受大自然的鬼斧神工与生命奥秘',
      color: 0x2e8b57,
      position: { x: 25, z: 20 },
      estimatedWeeks: 2
    },
    {
      id: 'workshop-1',
      name: '陶艺工坊',
      type: 'workshop',
      description: '亲手体验陶瓷制作的匠心工艺',
      color: 0xcd853f,
      position: { x: -20, z: -25 },
      estimatedWeeks: 1
    },
    {
      id: 'workshop-2',
      name: '非遗传承坊',
      type: 'workshop',
      description: '学习非物质文化遗产的精妙技艺',
      color: 0x8b0000,
      position: { x: 20, z: 25 },
      estimatedWeeks: 1
    },
    {
      id: 'temple-1',
      name: '科学范式殿',
      type: 'temple',
      description: '朝觐科学范式演变的宏伟殿堂',
      color: 0x4169e1,
      position: { x: 0, z: -35 },
      estimatedWeeks: 3
    },
    {
      id: 'temple-2',
      name: '哲学思辨殿',
      type: 'temple',
      description: '在思辨的殿堂中探寻真理之光',
      color: 0x6a0dad,
      position: { x: 0, z: 35 },
      estimatedWeeks: 3
    },
    {
      id: 'market-1',
      name: '知识集市',
      type: 'market',
      description: '在知识的集市中交换智慧与见闻',
      color: 0xff6347,
      position: { x: -25, z: 20 },
      estimatedWeeks: 1
    },
    {
      id: 'market-2',
      name: '技能交易场',
      type: 'market',
      description: '以技能会友，在交流中共同成长',
      color: 0xff8c00,
      position: { x: 25, z: -20 },
      estimatedWeeks: 1
    }
  ]
}
