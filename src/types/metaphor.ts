// 核心隐喻类型
export enum MetaphorType {
  LOVE = 'love',           // 爱
  FREEDOM = 'freedom',     // 自由
  LIFE_DEATH = 'lifeDeath', // 生死
  TRUTH = 'truth',         // 真理
  DREAM = 'dream',         // 梦想
  TIME = 'time',           // 时间
  MEMORY = 'memory',       // 记忆
  COURAGE = 'courage',     // 勇气
  HOPE = 'hope',           // 希望
  JUSTICE = 'justice',     // 正义
  BEAUTY = 'beauty',       // 美
  WISDOM = 'wisdom',       // 智慧
  FRIENDSHIP = 'friendship', // 友谊
  SACRIFICE = 'sacrifice', // 牺牲
  DESTINY = 'destiny'      // 命运
}

// 隐喻信息
export interface MetaphorInfo {
  id: MetaphorType
  name: string
  icon: string
  description: string
  color: string
}

// 隐喻类型配置
export const METAPHOR_CONFIG: Record<MetaphorType, MetaphorInfo> = {
  [MetaphorType.LOVE]: {
    id: MetaphorType.LOVE,
    name: '爱',
    icon: '❤️',
    description: '连接心灵的永恒力量',
    color: '#ff6b6b'
  },
  [MetaphorType.FREEDOM]: {
    id: MetaphorType.FREEDOM,
    name: '自由',
    icon: '🕊️',
    description: '挣脱束缚，追寻真我',
    color: '#4ecdc4'
  },
  [MetaphorType.LIFE_DEATH]: {
    id: MetaphorType.LIFE_DEATH,
    name: '生死',
    icon: '☯️',
    description: '生命循环的终极奥秘',
    color: '#2d3436'
  },
  [MetaphorType.TRUTH]: {
    id: MetaphorType.TRUTH,
    name: '真理',
    icon: '💎',
    description: '超越表象的真实本质',
    color: '#74b9ff'
  },
  [MetaphorType.DREAM]: {
    id: MetaphorType.DREAM,
    name: '梦想',
    icon: '🌙',
    description: '心灵深处的渴望与愿景',
    color: '#a29bfe'
  },
  [MetaphorType.TIME]: {
    id: MetaphorType.TIME,
    name: '时间',
    icon: '⏳',
    description: '流动不息的永恒河流',
    color: '#fd79a8'
  },
  [MetaphorType.MEMORY]: {
    id: MetaphorType.MEMORY,
    name: '记忆',
    icon: '📸',
    description: '过去的回响，自我的印记',
    color: '#00b894'
  },
  [MetaphorType.COURAGE]: {
    id: MetaphorType.COURAGE,
    name: '勇气',
    icon: '🦁',
    description: '面对恐惧的无畏之心',
    color: '#e17055'
  },
  [MetaphorType.HOPE]: {
    id: MetaphorType.HOPE,
    name: '希望',
    icon: '🌟',
    description: '黑暗中的指引之光',
    color: '#ffeaa7'
  },
  [MetaphorType.JUSTICE]: {
    id: MetaphorType.JUSTICE,
    name: '正义',
    icon: '⚖️',
    description: '平衡与公平的永恒追求',
    color: '#0984e3'
  },
  [MetaphorType.BEAUTY]: {
    id: MetaphorType.BEAUTY,
    name: '美',
    icon: '🌸',
    description: '触动灵魂的和谐体验',
    color: '#fdcb6e'
  },
  [MetaphorType.WISDOM]: {
    id: MetaphorType.WISDOM,
    name: '智慧',
    icon: '🦉',
    description: '洞察本质的深刻理解',
    color: '#6c5ce7'
  },
  [MetaphorType.FRIENDSHIP]: {
    id: MetaphorType.FRIENDSHIP,
    name: '友谊',
    icon: '🤝',
    description: '灵魂之间的真诚羁绊',
    color: '#00cec9'
  },
  [MetaphorType.SACRIFICE]: {
    id: MetaphorType.SACRIFICE,
    name: '牺牲',
    icon: '🔥',
    description: '为爱付出的崇高选择',
    color: '#d63031'
  },
  [MetaphorType.DESTINY]: {
    id: MetaphorType.DESTINY,
    name: '命运',
    icon: '🧵',
    description: '编织生命的无形之线',
    color: '#b2bec3'
  }
}

// 碎片类型（技能树分类）
export enum FragmentCategory {
  EMOTION = 'emotion',       // 情感类
  COGNITION = 'cognition',   // 认知类
  EXISTENCE = 'existence',   // 存在类
  SOCIAL = 'social',         // 社会类
  NATURE = 'nature'          // 自然类
}

// 碎片类型配置
export const FRAGMENT_CATEGORY_CONFIG: Record<FragmentCategory, { name: string; icon: string; color: string }> = {
  [FragmentCategory.EMOTION]: {
    name: '情感类',
    icon: '💝',
    color: '#ff6b6b'
  },
  [FragmentCategory.COGNITION]: {
    name: '认知类',
    icon: '🧠',
    color: '#74b9ff'
  },
  [FragmentCategory.EXISTENCE]: {
    name: '存在类',
    icon: '🌌',
    color: '#a29bfe'
  },
  [FragmentCategory.SOCIAL]: {
    name: '社会类',
    icon: '🤝',
    color: '#00b894'
  },
  [FragmentCategory.NATURE]: {
    name: '自然类',
    icon: '🌿',
    color: '#00cec9'
  }
}

// 隐喻关联的碎片
export interface MetaphorFragment {
  id: string
  name: string
  description: string
  category: FragmentCategory
  metaphors: MetaphorType[]  // 关联的隐喻类型
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
  completeness: number  // 30-100
  icon: string
  obtainedAt: Date
  challengeId: string  // 所属挑战ID
}

// 挑战记录
export interface ChallengeRecord {
  id: string
  startTime: Date
  endTime?: Date
  duration: number  // 实际用时（秒）
  fragmentsCollected: MetaphorFragment[]
  isCompleted: boolean  // 是否完成（时间到或主动结束）
  score: number  // 挑战得分
}

// 隐喻收集进度
export interface MetaphorProgress {
  type: MetaphorType
  collectedCount: number
  fragments: string[]  // 碎片ID列表
  isUnlocked: boolean
  unlockProgress: number  // 0-100
}
