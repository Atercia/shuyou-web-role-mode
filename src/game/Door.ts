import * as THREE from 'three'

export interface DoorConfig {
  id: string
  name: string
  color: number
  position: { x: number; z: number }
  targetScene: string
}

export class Door {
  private mesh: THREE.Group
  private scene: THREE.Scene
  private config: DoorConfig
  private labelSprite: THREE.Sprite | null = null
  private frameMesh: THREE.Mesh | null = null
  private portalMesh: THREE.Mesh | null = null
  private animationTime: number = 0

  constructor(scene: THREE.Scene, config: DoorConfig) {
    this.scene = scene
    this.config = config
    this.mesh = new THREE.Group()

    this.createMesh()
    this.createLabel()
    this.setPosition(config.position.x, config.position.z)
  }

  private createMesh() {
    // 门框
    const frameGeometry = new THREE.BoxGeometry(3, 4, 0.5)
    const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x4a4a4a })
    this.frameMesh = new THREE.Mesh(frameGeometry, frameMaterial)
    this.frameMesh.position.y = 2
    this.frameMesh.castShadow = true
    this.mesh.add(this.frameMesh)

    // 门内传送门效果
    const portalGeometry = new THREE.PlaneGeometry(2.2, 3.2)
    const portalMaterial = new THREE.MeshBasicMaterial({
      color: this.config.color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    })
    this.portalMesh = new THREE.Mesh(portalGeometry, portalMaterial)
    this.portalMesh.position.set(0, 2, 0.3)
    this.mesh.add(this.portalMesh)

    // 门内发光核心
    const coreGeometry = new THREE.PlaneGeometry(1.5, 2.5)
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4
    })
    const core = new THREE.Mesh(coreGeometry, coreMaterial)
    core.position.set(0, 2, 0.35)
    this.mesh.add(core)

    // 门楣装饰
    const topGeometry = new THREE.BoxGeometry(3.5, 0.5, 0.7)
    const topMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 })
    const top = new THREE.Mesh(topGeometry, topMaterial)
    top.position.y = 4.25
    top.castShadow = true
    this.mesh.add(top)

    // 两侧柱子
    const pillarGeometry = new THREE.BoxGeometry(0.4, 4, 0.6)
    const pillarMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 })

    const leftPillar = new THREE.Mesh(pillarGeometry, pillarMaterial)
    leftPillar.position.set(-1.3, 2, 0)
    leftPillar.castShadow = true
    this.mesh.add(leftPillar)

    const rightPillar = new THREE.Mesh(pillarGeometry, pillarMaterial)
    rightPillar.position.set(1.3, 2, 0)
    rightPillar.castShadow = true
    this.mesh.add(rightPillar)

    this.scene.add(this.mesh)
  }

  private createLabel() {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.width = 256
    canvas.height = 64

    context.fillStyle = 'rgba(0, 0, 0, 0.8)'
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
    this.labelSprite.scale.set(3, 0.75, 1)
    this.labelSprite.position.y = 5.2
    this.mesh.add(this.labelSprite)
  }

  setPosition(x: number, z: number) {
    this.mesh.position.set(x, 0, z)
    // 让门面向中心
    const angle = Math.atan2(-x, -z)
    this.mesh.rotation.y = angle
  }

  getPosition(): THREE.Vector3 {
    return this.mesh.position.clone()
  }

  getConfig(): DoorConfig {
    return this.config
  }

  update(deltaTime: number, cameraPosition?: THREE.Vector3) {
    this.animationTime += deltaTime

    // 传送门波动效果
    if (this.portalMesh) {
      const scale = 1 + Math.sin(this.animationTime * 3) * 0.02
      this.portalMesh.scale.set(scale, scale, 1)

      // 颜色渐变效果
      const material = this.portalMesh.material as THREE.MeshBasicMaterial
      const hue = (this.animationTime * 0.1) % 1
      const color = new THREE.Color().setHSL(hue, 0.5, 0.5)
      material.color.lerp(color, 0.05)
    }

    // 标签始终面向相机
    if (this.labelSprite && cameraPosition) {
      this.labelSprite.lookAt(cameraPosition)
    }
  }

  checkInteraction(characterPosition: THREE.Vector3, interactionRadius: number = 4): boolean {
    const distance = this.mesh.position.distanceTo(characterPosition)
    return distance <= interactionRadius
  }

  setHighlighted(highlighted: boolean) {
    if (this.portalMesh) {
      const material = this.portalMesh.material as THREE.MeshBasicMaterial
      if (highlighted) {
        material.opacity = 1
        // MeshBasicMaterial 没有 emissive，直接改变颜色
        material.color.setHex(0xffffff)
      } else {
        material.opacity = 0.8
        material.color.setHex(this.config.color)
      }
    }
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

export function generateDoors(): DoorConfig[] {
  return [
    {
      id: 'door-1',
      name: '回忆之门',
      color: 0xff6b6b,
      position: { x: -12, z: 0 },
      targetScene: 'memory-scene-1'
    },
    {
      id: 'door-2',
      name: '挑战之门',
      color: 0x4ecdc4,
      position: { x: 12, z: 0 },
      targetScene: 'challenge-scene'
    },
    {
      id: 'door-3',
      name: '秘密之门',
      color: 0xffe66d,
      position: { x: 0, z: -15 },
      targetScene: 'secret-scene'
    }
  ]
}
