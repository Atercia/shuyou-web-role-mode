import * as THREE from 'three'

export class Character {
  private mesh: THREE.Group
  private scene: THREE.Scene
  private velocity: THREE.Vector3
  private isGrounded: boolean
  private readonly gravity: number = 0.015
  private readonly groundLevel: number = 0
  private facingDirection: number = 0

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.velocity = new THREE.Vector3(0, 0, 0)
    this.isGrounded = true
    this.mesh = new THREE.Group()
    
    this.createMesh()
    scene.add(this.mesh)
  }

  private createMesh() {
    // 身体
    const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.5)
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.y = 1.4
    body.castShadow = true
    this.mesh.add(body)

    // 头部
    const headGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6)
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 })
    const head = new THREE.Mesh(headGeometry, headMaterial)
    head.position.y = 2.4
    head.castShadow = true
    this.mesh.add(head)

    // 眼睛
    const eyeGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.05)
    const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 })
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
    leftEye.position.set(-0.15, 2.4, 0.3)
    this.mesh.add(leftEye)
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
    rightEye.position.set(0.15, 2.4, 0.3)
    this.mesh.add(rightEye)

    // 手臂
    const armGeometry = new THREE.BoxGeometry(0.25, 0.8, 0.25)
    const armMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1 })
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial)
    leftArm.position.set(-0.6, 1.4, 0)
    leftArm.castShadow = true
    this.mesh.add(leftArm)
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial)
    rightArm.position.set(0.6, 1.4, 0)
    rightArm.castShadow = true
    this.mesh.add(rightArm)

    // 腿
    const legGeometry = new THREE.BoxGeometry(0.3, 0.8, 0.3)
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F4F })
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial)
    leftLeg.position.set(-0.25, 0.4, 0)
    leftLeg.castShadow = true
    this.mesh.add(leftLeg)
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial)
    rightLeg.position.set(0.25, 0.4, 0)
    rightLeg.castShadow = true
    this.mesh.add(rightLeg)
  }

  move(x: number, z: number) {
    // 更新朝向
    if (x !== 0 || z !== 0) {
      this.facingDirection = Math.atan2(x, z)
      this.mesh.rotation.y = this.facingDirection
    }

    // 计算新位置
    const newX = this.mesh.position.x + x
    const newZ = this.mesh.position.z + z

    // 简单的边界检测（广场边界）
    const boundary = 24
    if (newX >= -boundary && newX <= boundary) {
      this.mesh.position.x = newX
    }
    if (newZ >= -boundary && newZ <= boundary) {
      this.mesh.position.z = newZ
    }

    // 添加行走动画效果
    this.animateWalk()
  }

  jump(force: number) {
    if (this.isGrounded) {
      this.velocity.y = force
      this.isGrounded = false
    }
  }

  update() {
    // 应用重力
    if (!this.isGrounded) {
      this.velocity.y -= this.gravity
    }

    // 更新垂直位置
    this.mesh.position.y += this.velocity.y

    // 地面检测
    if (this.mesh.position.y <= this.groundLevel) {
      this.mesh.position.y = this.groundLevel
      this.velocity.y = 0
      this.isGrounded = true
    }
  }

  getPosition(): THREE.Vector3 {
    return this.mesh.position.clone()
  }

  private animateWalk() {
    // 简单的行走摆动动画
    const time = Date.now() * 0.01
    this.mesh.children.forEach((child, index) => {
      if (index === 3 || index === 4) { // 手臂
        child.rotation.x = Math.sin(time) * 0.3
      }
      if (index === 5 || index === 6) { // 腿
        child.rotation.x = Math.sin(time + Math.PI) * 0.3
      }
    })
  }

  dispose() {
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
