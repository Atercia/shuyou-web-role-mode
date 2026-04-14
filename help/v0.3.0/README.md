# v0.3.0 - 记忆碎片系统

## 迭代信息

- **版本**: v0.3.0
- **日期**: 2026-04-14
- **状态**: ✅ 已完成
- **提交**: `feat: add memory fragments system with interaction modal`

## 目标

添加核心游戏机制 - 记忆碎片系统，让广场有可探索的目标。

## 实现内容

### 1. 记忆碎片设计

#### 碎片属性
```typescript
interface FragmentConfig {
  id: string           // 唯一标识
  name: string         // 拥有者名字
  color: number        // 颜色（对应危险等级）
  size: number         // 大小 0.5-1.5
  duration: number     // 预计用时（分钟）
  dangerLevel: number  // 危险等级 1-5
  position: { x, z }   // 位置坐标
}
```

#### 颜色等级系统
| 颜色 | 等级 | 危险度 | 说明 |
|------|------|--------|------|
| 🔴 红色 | 1 | 安全 | 新手友好 |
| 🔵 青色 | 2 | 低危 | 简单挑战 |
| 🔷 蓝色 | 3 | 中等 | 适中难度 |
| 🟢 绿色 | 4 | 高危 | 困难挑战 |
| 🟡 金色 | 5 | 极危 | 极限挑战 |

#### 大小与用时
- 大小范围: 0.5 - 1.5
- 用时计算: `10 + size * 20` 分钟
- 越大用时越长

### 2. 碎片渲染 (MemoryFragment.ts)

#### 视觉效果
```typescript
// 水晶主体
const geometry = new THREE.OctahedronGeometry(size, 0)
const material = new THREE.MeshPhongMaterial({
  color: config.color,
  emissive: config.color,
  emissiveIntensity: 0.3,
  transparent: true,
  opacity: 0.9,
  shininess: 100
})

// 发光核心
const coreGeometry = new THREE.OctahedronGeometry(size * 0.5, 0)

// 光晕效果
const glowGeometry = new THREE.SphereGeometry(size * 1.5, 16, 16)
```

#### 动画效果
```typescript
update(deltaTime: number) {
  // 悬浮动画
  const floatY = Math.sin(this.animationTime * 2) * 0.3
  this.mesh.position.y = this.config.size + 1 + floatY
  
  // 旋转动画
  this.mesh.rotation.y += deltaTime * 0.5
  this.mesh.rotation.x = Math.sin(this.animationTime) * 0.1
}
```

#### 标签显示
使用 CanvasTexture + Sprite 实现悬浮文字：
```typescript
const canvas = document.createElement('canvas')
const context = canvas.getContext('2d')!
// 绘制背景和文字...
const texture = new THREE.CanvasTexture(canvas)
const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
this.labelSprite = new THREE.Sprite(spriteMaterial)
```

### 3. 交互系统

#### 碰撞检测
```typescript
checkInteraction(characterPosition: THREE.Vector3, interactionRadius: number = 4): boolean {
  const distance = this.mesh.position.distanceTo(characterPosition)
  return distance <= interactionRadius
}
```

#### 高亮效果
```typescript
setHighlighted(highlighted: boolean) {
  if (highlighted) {
    material.emissiveIntensity = 0.8  // 更亮
  } else {
    material.emissiveIntensity = 0.3  // 正常
  }
}
```

### 4. 交互弹窗 (FragmentModal.vue)

#### 弹窗内容
- 碎片预览（颜色展示）
- 碎片名称
- 预计用时
- 危险等级（带颜色标识）
- 碎片大小
- 高危警告（4级以上）

#### 交互按钮
- **进入碎片** - 确认进入
- **离开** - 取消交互

#### 动画效果
```css
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}
```

### 5. 随机生成系统

```typescript
export function generateRandomFragment(id: number): FragmentConfig {
  const names = ['爱丽丝', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry']
  const colors = [
    { color: 0xff6b6b, danger: 1 },
    { color: 0x4ecdc4, danger: 2 },
    { color: 0x45b7d1, danger: 3 },
    { color: 0x96ceb4, danger: 4 },
    { color: 0xffeaa7, danger: 5 }
  ]
  
  // 随机位置（避开中心）
  do {
    x = (Math.random() - 0.5) * 40
    z = (Math.random() - 0.5) * 40
  } while (Math.abs(x) < 5 && Math.abs(z) < 5)
  
  return { ... }
}
```

## 新增文件

```
src/
├── components/
│   ├── PlazaScene.vue      # 更新：添加碎片系统
│   └── FragmentModal.vue   # 新增：交互弹窗
├── game/
│   └── MemoryFragment.ts   # 新增：碎片类
└── views/
    └── PlazaView.vue       # 更新：集成弹窗
```

## 运行效果

访问 `/plaza` 路径：
- 广场中随机分布 8-12 个发光碎片
- 碎片悬浮旋转，带有光晕效果
- 碎片上方显示"xxx的记忆碎片"
- 靠近碎片时高亮显示
- 自动弹出交互确认弹窗
- 显示用时和危险等级信息

## 技术亮点

### 1. 组件通信
```typescript
// PlazaScene 发射事件
emit('fragmentNearby', fragment.getConfig())

// PlazaView 接收处理
const handleFragmentNearby = (fragment: FragmentConfig) => {
  currentFragment.value = fragment
  showModal.value = true
}
```

### 2. Teleport 使用
```vue
<Teleport to="body">
  <div v-if="visible" class="modal-overlay">
    <!-- 弹窗内容 -->
  </div>
</Teleport>
```

### 3. 类型导出
```typescript
// MemoryFragment.ts
export interface FragmentConfig { ... }
export class MemoryFragment { ... }
export function generateRandomFragment(id: number): FragmentConfig { ... }
```

## 游戏设计思考

### 为什么用颜色表示危险等级？
- 直观易懂
- 符合玩家认知习惯
- 远处就能识别

### 大小和用时的关系？
- 大碎片 = 更多内容 = 更长时间
- 简单的正比关系，易于理解

### 随机生成的意义？
- 每次游戏都有新体验
- 增加探索乐趣
- 避免固定路线

## 遇到的问题

### 问题 1: 弹窗不显示在正确位置
**解决**: 使用 `Teleport to="body"` 将弹窗挂载到 body

### 问题 2: 标签文字模糊
**解决**: 增大 Canvas 分辨率，使用 `CanvasTexture`

### 问题 3: 碎片生成在建筑物内
**解决**: 添加位置检测，避开中心区域

## 性能考虑

- 碎片数量控制在 8-12 个
- 使用 `dispose()` 方法清理资源
- 碰撞检测距离限制

## 下一步

实现碎片内部场景，玩家可以真正"进入"碎片进行探索。
