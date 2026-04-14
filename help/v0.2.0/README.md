# v0.2.0 - 广场场景与角色控制

## 迭代信息

- **版本**: v0.2.0
- **日期**: 2026-04-14
- **状态**: ✅ 已完成
- **提交**: `feat: add plaza scene with controllable character (WASD + Space)`

## 目标

创建一个可交互的广场场景，玩家可以控制角色在其中移动和探索。

## 实现内容

### 1. 广场场景 (PlazaScene.vue)

#### 场景元素
- **地面**: 50x50 绿色广场
- **网格**: 辅助定位的网格线
- **建筑物**: 7个不同大小和颜色的方块建筑
- **树木**: 6棵装饰性树木

#### 场景设计
```typescript
// 建筑物配置
const obstacles = [
  { x: -10, z: -10, width: 3, depth: 3, height: 4, color: 0x8B4513 },
  { x: 10, z: -10, width: 2, depth: 4, height: 3, color: 0xA0522D },
  // ...
]

// 树木位置
const trees = [
  { x: -8, z: -5 },
  { x: 8, z: -5 },
  // ...
]
```

### 2. 角色系统 (Character.ts)

#### 角色构成
- **头部**: 金色方块 + 黑色眼睛
- **身体**: 蓝色方块
- **手臂**: 蓝色长条
- **腿部**: 深灰色长条

#### 角色能力
- ✅ 前后左右移动 (WASD)
- ✅ 跳跃 (空格键)
- ✅ 重力系统
- ✅ 行走动画

#### 代码结构
```typescript
export class Character {
  private mesh: THREE.Group
  private velocity: THREE.Vector3
  private isGrounded: boolean
  
  move(x: number, z: number) {
    // 移动逻辑 + 朝向更新
  }
  
  jump(force: number) {
    // 跳跃逻辑
  }
  
  update() {
    // 物理更新（重力）
  }
}
```

### 3. 键盘控制系统

#### useKeyboardControls composable
```typescript
export function useKeyboardControls() {
  const keys = ref<Set<string>>(new Set())
  
  const isKeyPressed = (code: string): boolean => {
    return keys.value.has(code)
  }
  
  // 支持按键：
  // - W / ArrowUp: 前进
  // - S / ArrowDown: 后退
  // - A / ArrowLeft: 左转
  // - D / ArrowRight: 右转
  // - Space: 跳跃
}
```

### 4. 相机系统

#### 第三人称跟随
- 相机始终跟随角色
- 平滑插值移动
- 支持鼠标拖拽旋转视角

```typescript
function updateCamera() {
  const charPos = character.getPosition()
  const targetPos = new THREE.Vector3(
    charPos.x + 15, 
    charPos.y + 15, 
    charPos.z + 15
  )
  camera.position.lerp(targetPos, 0.05)
  controls.target.lerp(charPos, 0.1)
}
```

## 新增文件

```
src/
├── components/
│   └── PlazaScene.vue          # 广场场景组件
├── composables/
│   └── useKeyboardControls.ts  # 键盘控制逻辑
├── game/
│   └── Character.ts            # 角色类
└── views/
    └── PlazaView.vue           # 广场页面
```

## 运行效果

访问 `/plaza` 路径：
- 绿色广场场景
- 可控制的小人角色
- 建筑物和树木装饰
- WASD 移动，空格跳跃
- 相机跟随角色

## 技术亮点

### 1. 组件化设计
- 将键盘逻辑抽离为 composable
- 角色逻辑封装为独立类
- 场景和视图分离

### 2. 物理系统
```typescript
// 重力应用
if (!this.isGrounded) {
  this.velocity.y -= this.gravity
}

// 地面检测
if (this.mesh.position.y <= this.groundLevel) {
  this.mesh.position.y = this.groundLevel
  this.velocity.y = 0
  this.isGrounded = true
}
```

### 3. 动画系统
```typescript
// 摆臂动画
const time = Date.now() * 0.01
this.mesh.children.forEach((child, index) => {
  if (index === 3 || index === 4) { // 手臂
    child.rotation.x = Math.sin(time) * 0.3
  }
  if (index === 5 || index === 6) { // 腿
    child.rotation.x = Math.sin(time + Math.PI) * 0.3
  }
})
```

## 遇到的问题

### 问题 1: 键盘事件不响应
**原因**: canvas 元素没有获取焦点  
**解决**: 添加 `tabindex="0"` 属性

### 问题 2: 相机会穿入地下
**解决**: 设置 `controls.maxPolarAngle = Math.PI / 2 - 0.1`

## 性能优化

- 使用 `lerp` 实现平滑相机跟随
- 限制角色移动范围（边界检测）
- 使用 `requestAnimationFrame` 优化动画

## 下一步

添加游戏核心机制 - 记忆碎片系统，让广场有可探索的目标。
