# v0.4.0 - 碎片内部场景与哲学交互系统

## 迭代信息

- **版本**: v0.4.0
- **日期**: 2026-04-14
- **状态**: ✅ 已完成
- **提交**: `feat: add fragment interior scene with doors and NPCs interaction`

## 目标

实现碎片内部的情境广场，包含三门、三NPC、哲学对话和交互系统。

## 实现内容

### 1. 情境广场场景

#### 场景元素
- **神秘紫色调氛围**：紫色背景 + 雾效
- **中心发光柱**：带有发光效果的圆柱
- **装饰性圆环**：地面上的紫色圆环
- **点光源照明**：营造神秘氛围

### 2. 三门系统

| 门 | 名称 | 颜色 | 位置 | 目标场景 |
|---|---|---|---|---|
| 左门 | 回忆之门 | 红色 | (-12, 0) | memory-scene-1 |
| 右门 | 挑战之门 | 青色 | (12, 0) | challenge-scene |
| 上门 | 秘密之门 | 金色 | (0, -15) | secret-scene |

#### 门特性
- 传送门波动动画效果
- 颜色渐变动画
- 悬浮标题显示（始终面向相机）
- 高亮交互效果

### 3. 三个哲学NPC

| NPC | 名称 | 哲学主题 | 隐喻碎片 |
|---|---|---|---|
| 1 | 存在之影 | 存在主义 - 面对"可能的自己" | 存在主义之镜 |
| 2 | 时间旅者 | 时间哲学 - 记忆与改变的权衡 | 时间悖论之沙 |
| 3 | 真理守门人 | 认识论 - 真理与幸福的抉择 | 真理与幻象之钥 |

#### NPC特性
- 胶囊体身体 + 球体头部
- 交互范围圆圈（青色，高亮变黄）
- 待机动画（轻微浮动）
- 已交互后变虚幻（透明度40%）

### 4. 哲学对话系统

#### 对话流程
1. 靠近NPC → 显示交互提示
2. 按空格 → 弹出哲学情境弹窗
3. 显示：情境描述 + 哲学之问 + 三个选择（A/S/D）
4. 做出选择 → 获得隐喻碎片

#### 哲学情境示例（存在之影）
```typescript
{
  context: '你站在一片虚无之中，面前是一面镜子，镜中映出的却不是你现在的模样，而是你从未成为的那个自己。',
  question: '你会如何面对这个"可能的你"？',
  choices: [
    { key: 'a', text: '伸手触碰镜面，试图与他和解' },
    { key: 's', text: '转身离去，坚信当下的选择才是真实' },
    { key: 'd', text: '凝视良久，接受遗憾作为生命的一部分' }
  ]
}
```

### 5. 状态管理（Pinia）

#### Fragment Store
```typescript
// State
nearbyDoor: DoorConfig | null
nearbyNPC: NPCConfig | null
interactedNPCs: Set<string>

// Getters
hasNearbyDoor: boolean
hasNearbyNPC: boolean

// Actions
setNearbyDoor(door)
setNearbyNPC(npc)
markNPCAsInteracted(npcId)
```

### 6. 技术实现

#### 交互检测
```typescript
function checkInteractions() {
  // 找到最近的可交互对象
  let closestNPC = null
  let closestDistance = Infinity
  
  for (const npc of npcs) {
    if (npc.checkInteraction(charPos, 3)) {
      const distance = npc.getPosition().distanceTo(charPos)
      if (distance < closestDistance) {
        closestDistance = distance
        closestNPC = npc
      }
    }
  }
  
  // 更新Pinia store
  if (closestNPC) {
    fragmentStore.setNearbyNPC(closestNPC.getConfig())
  }
}
```

## 新增文件

```
src/
├── components/
│   ├── FragmentInteriorScene.vue   # 情境广场场景
│   ├── InteractionPrompt.vue        # 交互提示组件
│   ├── PhilosophicalDialogue.vue    # 哲学对话弹窗
│   ├── RewardModal.vue              # 奖励弹窗
│   └── InventoryPanel.vue           # 背包面板
├── game/
│   ├── Door.ts                      # 门类
│   └── NPC.ts                       # NPC类（含哲学情境）
├── stores/
│   ├── fragment.ts                  # 碎片状态管理
│   └── inventory.ts                 # 背包状态管理
└── types/
    └── inventory.ts                 # 类型定义
```

## 运行效果

访问 `/fragment-interior` 路径：
- 神秘紫色调的广场场景
- 三个发光传送门（左/右/上）
- 三个哲学NPC（带交互圆圈）
- 靠近NPC触发哲学对话
- 选择后获得隐喻碎片

## 技术亮点

### 1. 组件通信
使用Pinia替代Vue emit：
```typescript
// 场景组件
fragmentStore.setNearbyNPC(config)

// 视图组件
const { hasNearbyNPC } = storeToRefs(fragmentStore)
```

### 2. 交互圆圈
```typescript
private createInteractionCircle() {
  const circleGeometry = new THREE.RingGeometry(2.8, 3, 32)
  const circleMaterial = new THREE.MeshBasicMaterial({
    color: 0x4ecdc4,
    transparent: true,
    opacity: 0.3
  })
  // ...
}
```

### 3. 虚幻效果
```typescript
private applyEtherealEffect() {
  this.mesh.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const newMaterial = new THREE.MeshLambertMaterial({
        color: originalMat.color,
        transparent: true,
        opacity: 0.4  // 虚幻透明度
      })
      child.material = newMaterial
    }
  })
}
```

## 遇到的问题

### 问题 1: Vue emit不触发
**原因**: Vue 3 `<script setup>` 中 emit 可能不工作
**解决**: 使用Pinia进行状态管理

### 问题 2: MeshBasicMaterial没有emissive
**原因**: 只有Lambert/Phong材质支持emissive
**解决**: 直接修改color属性

## 下一步

- 实现三门对应的内部场景
- 添加更多哲学NPC
- 实现碎片合成系统
