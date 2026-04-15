import * as THREE from 'three'
import type { PlazaElementConfig, PlazaElementType } from '@/types/plazaElement'

const TYPE_BUILDERS: Record<PlazaElementType, (group: THREE.Group, config: PlazaElementConfig) => void> = {
  museum: (group, config) => {
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.3, 2),
      new THREE.MeshLambertMaterial({ color: 0xd4c5a9 })
    )
    base.position.y = 0.15
    base.castShadow = true
    group.add(base)

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(2.2, 1.5, 4),
      new THREE.MeshLambertMaterial({ color: config.color })
    )
    roof.position.y = 1.8
    roof.rotation.y = Math.PI / 4
    roof.castShadow = true
    group.add(roof)

    const pillar1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 1.2, 8),
      new THREE.MeshLambertMaterial({ color: 0xf5f5dc })
    )
    pillar1.position.set(-1, 0.9, 0.7)
    pillar1.castShadow = true
    group.add(pillar1)

    const pillar2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 1.2, 8),
      new THREE.MeshLambertMaterial({ color: 0xf5f5dc })
    )
    pillar2.position.set(1, 0.9, 0.7)
    pillar2.castShadow = true
    group.add(pillar2)

    const pediment = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.4, 0.1),
      new THREE.MeshLambertMaterial({ color: 0xf5f5dc })
    )
    pediment.position.set(0, 1.5, 0.95)
    group.add(pediment)
  },

  workshop: (group, config) => {
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 1.5, 2),
      new THREE.MeshLambertMaterial({ color: 0x8b7355 })
    )
    base.position.y = 0.75
    base.castShadow = true
    group.add(base)

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.2, 2.3),
      new THREE.MeshLambertMaterial({ color: config.color })
    )
    roof.position.y = 1.6
    roof.castShadow = true
    group.add(roof)

    const chimney = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.25, 1, 8),
      new THREE.MeshLambertMaterial({ color: 0x654321 })
    )
    chimney.position.set(0.8, 2.1, -0.5)
    chimney.castShadow = true
    group.add(chimney)

    const door = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 1, 0.1),
      new THREE.MeshLambertMaterial({ color: 0x4a3728 })
    )
    door.position.set(0, 0.5, 1.01)
    group.add(door)

    const anvil = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.3, 0.4),
      new THREE.MeshLambertMaterial({ color: 0x696969 })
    )
    anvil.position.set(-0.8, 0.15, 1.2)
    anvil.castShadow = true
    group.add(anvil)
  },

  temple: (group, config) => {
    const steps = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 0.3, 3),
      new THREE.MeshLambertMaterial({ color: 0xe8e0d0 })
    )
    steps.position.y = 0.15
    steps.castShadow = true
    group.add(steps)

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 2, 2),
      new THREE.MeshLambertMaterial({ color: config.color })
    )
    body.position.y = 1.3
    body.castShadow = true
    group.add(body)

    const topRoof = new THREE.Mesh(
      new THREE.ConeGeometry(1.8, 1.2, 4),
      new THREE.MeshLambertMaterial({ color: 0xc9a84c })
    )
    topRoof.position.y = 2.9
    topRoof.rotation.y = Math.PI / 4
    topRoof.castShadow = true
    group.add(topRoof)

    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffd700 })
    )
    orb.position.y = 3.6
    group.add(orb)

    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 2, 8),
        new THREE.MeshLambertMaterial({ color: 0xf0ead6 })
      )
      pillar.position.set(Math.cos(angle) * 1, 1.3, Math.sin(angle) * 1)
      pillar.castShadow = true
      group.add(pillar)
    }
  },

  market: (group, config) => {
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.8, 1.5),
      new THREE.MeshLambertMaterial({ color: 0xdeb887 })
    )
    counter.position.y = 0.4
    counter.castShadow = true
    group.add(counter)

    const canopyPole1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8),
      new THREE.MeshLambertMaterial({ color: 0x8b4513 })
    )
    canopyPole1.position.set(-1.3, 1.65, -0.6)
    canopyPole1.castShadow = true
    group.add(canopyPole1)

    const canopyPole2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8),
      new THREE.MeshLambertMaterial({ color: 0x8b4513 })
    )
    canopyPole2.position.set(1.3, 1.65, -0.6)
    canopyPole2.castShadow = true
    group.add(canopyPole2)

    const canopyPole3 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8),
      new THREE.MeshLambertMaterial({ color: 0x8b4513 })
    )
    canopyPole3.position.set(-1.3, 1.65, 0.6)
    canopyPole3.castShadow = true
    group.add(canopyPole3)

    const canopyPole4 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8),
      new THREE.MeshLambertMaterial({ color: 0x8b4513 })
    )
    canopyPole4.position.set(1.3, 1.65, 0.6)
    canopyPole4.castShadow = true
    group.add(canopyPole4)

    const canopy = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.1, 1.8),
      new THREE.MeshLambertMaterial({ color: config.color, transparent: true, opacity: 0.85 })
    )
    canopy.position.y = 2.9
    canopy.castShadow = true
    group.add(canopy)

    for (let i = 0; i < 3; i++) {
      const good = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.4, 0.4),
        new THREE.MeshLambertMaterial({
          color: [0xff6347, 0x4682b4, 0x32cd32][i]
        })
      )
      good.position.set(-0.8 + i * 0.8, 1, 0)
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

  public updateLabelScreenPosition(camera: THREE.Camera, renderer: THREE.WebGLRenderer): void {
    if (!this.labelElement) return

    const position = new THREE.Vector3(
      this.mesh.position.x,
      -0.5,
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
      position: { x: -18, z: -5 },
      estimatedWeeks: 2
    },
    {
      id: 'museum-2',
      name: '自然探索馆',
      type: 'museum',
      description: '感受大自然的鬼斧神工与生命奥秘',
      color: 0x2e8b57,
      position: { x: 18, z: 5 },
      estimatedWeeks: 2
    },
    {
      id: 'workshop-1',
      name: '陶艺工坊',
      type: 'workshop',
      description: '亲手体验陶瓷制作的匠心工艺',
      color: 0xcd853f,
      position: { x: -5, z: -18 },
      estimatedWeeks: 1
    },
    {
      id: 'workshop-2',
      name: '非遗传承坊',
      type: 'workshop',
      description: '学习非物质文化遗产的精妙技艺',
      color: 0x8b0000,
      position: { x: 5, z: 18 },
      estimatedWeeks: 1
    },
    {
      id: 'temple-1',
      name: '科学范式殿',
      type: 'temple',
      description: '朝觐科学范式演变的宏伟殿堂',
      color: 0x4169e1,
      position: { x: 0, z: -20 },
      estimatedWeeks: 3
    },
    {
      id: 'temple-2',
      name: '哲学思辨殿',
      type: 'temple',
      description: '在思辨的殿堂中探寻真理之光',
      color: 0x6a0dad,
      position: { x: 0, z: 20 },
      estimatedWeeks: 3
    },
    {
      id: 'market-1',
      name: '知识集市',
      type: 'market',
      description: '在知识的集市中交换智慧与见闻',
      color: 0xff6347,
      position: { x: -15, z: 12 },
      estimatedWeeks: 1
    },
    {
      id: 'market-2',
      name: '技能交易场',
      type: 'market',
      description: '以技能会友，在交流中共同成长',
      color: 0xff8c00,
      position: { x: 15, z: -12 },
      estimatedWeeks: 1
    }
  ]
}
