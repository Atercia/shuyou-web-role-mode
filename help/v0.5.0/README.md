# v0.5.0 - 隐喻碎片系统与背包功能

## 迭代信息

- **版本**: v0.5.0
- **日期**: 2026-04-14
- **状态**: ✅ 已完成
- **提交**: `feat: add reward modal with fragment rarity/completeness, inventory system`

## 目标

完善隐喻碎片系统，添加稀有度、完整度机制，实现角色背包功能。

## 实现内容

### 1. 隐喻碎片系统

#### 稀有度等级
| 等级 | 概率 | 颜色 | 星级 |
|------|------|------|------|
| 普通 (Common) | 50% | 灰色 #9e9e9e | ⭐ |
| 稀有 (Uncommon) | 25% | 绿色 #4caf50 | ⭐⭐ |
| 史诗 (Rare) | 15% | 蓝色 #2196f3 | ⭐⭐⭐ |
| 传说 (Legendary) | 10% | 橙色 #ff9800 | ⭐⭐⭐⭐ |

#### 完整度系统
| 等级 | 范围 | 名称 |
|------|------|------|
| 碎片 | 30-49% | Fragmented |
| 残缺 | 50-69% | Partial |
| 较完整 | 70-89% | Mostly Complete |
| 完整 | 90-100% | Complete |

#### 碎片生成算法
```typescript
function generateFragment(baseName: string): MetaphorFragment {
  // 随机稀有度
  const rarityRoll = Math.random()
  let rarity: FragmentRarity
  if (rarityRoll < 0.5) rarity = 'common'
  else if (rarityRoll < 0.75) rarity = 'uncommon'
  else if (rarityRoll < 0.9) rarity = 'rare'
  else rarity = 'legendary'

  // 随机完整度 30-100
  const completenessValue = Math.floor(Math.random() * 71) + 30
  
  return {
    id: `fragment-${Date.now()}`,
    name: baseName,
    rarity,
    completenessValue,
    // ...
  }
}
```

### 2. 奖励弹窗 (RewardModal)

#### 功能特性
- 空格键确认关闭
- 显示碎片图标和名称
- 稀有度星级显示
- 完整度进度条
- 动画效果（弹跳图标）

#### 界面元素
```
🎁 获得隐喻碎片

┌─────────────────────────────┐
│          🔮                 │
│      存在主义之镜            │
│                             │
│  稀有度: ⭐⭐ 稀有           │
│  完整度: [██████░░░] 65%    │
│           残缺              │
└─────────────────────────────┘

      [空格] 键确认
```

### 3. 背包系统

#### Inventory Store
```typescript
export const useInventoryStore = defineStore('inventory', () => {
  const items = ref<InventoryItem[]>([])
  const fragments = ref<MetaphorFragment[]>([])
  const maxSlots = ref(20)
  
  // 按稀有度排序
  const sortedFragments = computed(() => {
    return [...fragments.value].sort((a, b) => 
      rarityOrder[b.rarity] - rarityOrder[a.rarity]
    )
  })
  
  return { items, fragments, addFragment, removeFragment }
})
```

#### 背包面板 (InventoryPanel)

**位置**: 界面左侧滑出

**功能**:
- 隐喻碎片列表（按稀有度排序）
- 彩色边框标识稀有度
- 完整度进度条
- 物品列表
- 格子统计（已用/总数）

**界面**:
```
┌──────────────┐
│ 🎒 背包       │
├──────────────┤
│ 💎 隐喻碎片 3 │
├──────────────┤
│ 🔮 存在主义   │
│ ⭐⭐ [████░░] │
├──────────────┤
│ 🔮 时间悖论   │
│ ⭐⭐⭐ [█████░]│
├──────────────┤
│ 📦 物品 0     │
├──────────────┤
│ 已用: 3/20   │
└──────────────┘
```

### 4. 交互流程优化

#### 完整流程
1. 靠近NPC → 显示交互提示
2. 按空格 → 打开哲学对话
3. 选择A/S/D → 关闭对话
4. 生成隐喻碎片（随机稀有度/完整度）
5. 显示奖励弹窗
6. 按空格关闭 → 碎片存入背包
7. NPC变虚幻
8. 点击背包按钮查看

#### 状态管理
```typescript
// Fragment Store
- nearbyNPC: 当前靠近的NPC
- interactedNPCs: 已交互NPC集合

// Inventory Store  
- fragments: 已收集的碎片
- items: 其他物品
```

## 新增文件

```
src/
├── types/
│   └── inventory.ts          # 类型定义
│       - FragmentRarity
│       - FragmentCompleteness
│       - MetaphorFragment
│       - InventoryItem
│
├── stores/
│   └── inventory.ts          # 背包状态管理
│       - generateFragment()
│       - addFragment()
│       - getFragmentRarityColor()
│
├── components/
│   ├── RewardModal.vue       # 奖励弹窗
│   │   - 空格键关闭
│   │   - 稀有度星级
│   │   - 完整度进度条
│   │
│   └── InventoryPanel.vue    # 背包面板
│       - 左侧滑出
│       - 碎片列表
│       - 按稀有度排序
│
└── views/
    └── FragmentInteriorView.vue  # 更新
        - 整合RewardModal
        - 整合InventoryPanel
        - 背包按钮
```

## 技术亮点

### 1. 类型系统
```typescript
export enum FragmentRarity {
  Common = 'common',
  Uncommon = 'uncommon',
  Rare = 'rare',
  Legendary = 'legendary'
}

export enum FragmentCompleteness {
  Fragmented = 'fragmented',
  Partial = 'partial',
  MostlyComplete = 'mostly',
  Complete = 'complete'
}
```

### 2. 计算属性排序
```typescript
const sortedFragments = computed(() => {
  const rarityOrder = {
    legendary: 4, rare: 3, uncommon: 2, common: 1
  }
  return [...fragments.value].sort((a, b) => 
    rarityOrder[b.rarity] - rarityOrder[a.rarity]
  )
})
```

### 3. 动态样式
```vue
<div 
  class="fragment-item"
  :class="`rarity-${fragment.rarity}`"
  :style="{ borderColor: getRarityColor(fragment.rarity) }"
>
```

## 运行效果

1. 与NPC对话完成哲学选择
2. 弹出奖励弹窗显示碎片信息
3. 按空格确认，碎片存入背包
4. 点击"🎒 背包"按钮查看收集
5. 碎片按稀有度排序显示

## 下一步

- 碎片合成系统（低稀有度合成高稀有度）
- 完整度修复功能
- 碎片使用效果
- 交易/赠送系统
