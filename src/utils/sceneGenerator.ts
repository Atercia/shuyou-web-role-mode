import {
  SceneTheme,
  THEME_CONFIGS,
  type SceneTemplateConfig,
  type SceneGenerationParams,
  type SceneThemeConfig
} from '@/types/scene'
import type { NPCConfig, PhilosophicalScenario } from '@/game/NPC'
import type { DoorConfig } from '@/game/Door'
import type { DoorRequirement } from '@/types/door'
import { ConditionType } from '@/types/door'

// 哲学主题库
const PHILOSOPHICAL_THEMES = [
  {
    name: '存在之影',
    contexts: [
      '你站在一片虚无之中，面前是一面镜子，镜中映出的却不是你现在的模样，而是你从未成为的那个自己。',
      '深夜的图书馆里，你发现自己写的每一本书都在自动改写结局，而主角都是同一个陌生人。',
      '你醒来发现世界所有人都认识你，但你却完全不记得他们，包括镜中的自己。'
    ],
    questions: [
      '你会如何面对这个"可能的你"？',
      '当记忆可以被随意改写，什么才是真正的自我？',
      '如果所有人都记得你，唯独你忘记了自己，你还存在吗？'
    ],
    fragments: ['存在主义之镜', '记忆迷宫', '自我碎片']
  },
  {
    name: '时间旅者',
    contexts: [
      '你发现了一枚可以倒流时间的沙漏，但每倒流一秒，你的记忆就会消失一部分。',
      '你遇到了未来的自己，他告诉你必须做出一个违背现在所有信念的选择。',
      '时间在你面前分裂成无数条河流，每条都通向不同的结局。'
    ],
    questions: [
      '你会如何使用这份力量？',
      '当未来的你背叛了现在的你，谁才是真正的你？',
      '如果所有选择都是正确的，那么选择本身还有意义吗？'
    ],
    fragments: ['时间悖论之沙', '命运分岔', '永恒瞬间']
  },
  {
    name: '真理守门人',
    contexts: [
      '你面前有两扇门：一扇通往绝对真理，但会让你失去所有情感；一扇通往永恒幸福，但建立在虚假之上。',
      '一个声音告诉你，你所经历的一切都是模拟，只有痛苦是真实的。',
      '你发现了世界的源代码，发现所有人的命运都是预设的程序。'
    ],
    questions: [
      '你会推开哪一扇门？',
      '如果痛苦是唯一的真实，你愿意拥抱它还是逃离它？',
      '当你知道一切都是预设，你还会努力改变吗？'
    ],
    fragments: ['真理与幻象之钥', '痛苦真实', '自由意志']
  },
  {
    name: '道德困境者',
    contexts: [
      '你可以拯救一个人或拯救一百个人，但那个人是你最爱的人。',
      '你发现了一个可以治愈所有疾病的秘密，但代价是牺牲一个无辜的生命。',
      '一个按钮摆在你面前，按下它可以消除世界上所有的恶，但也会消除所有的善。'
    ],
    questions: [
      '你会如何选择？',
      '一个人的生命和一百个人的生命，哪个更重？',
      '没有恶的世界，还是真实的世界？'
    ],
    fragments: ['道德天平', '牺牲之种', '善恶边界']
  },
  {
    name: '意义追寻者',
    contexts: [
      '你被告知生命本身没有任何意义，所有的意义都是人类自己编织的谎言。',
      '你完成了所有的人生目标，却发现内心依然空虚。',
      '宇宙在你眼前展开，你看到了无限，也感受到了自己的渺小。'
    ],
    questions: [
      '你会如何继续生活？',
      '当目标达成后，什么才能填补内心的空洞？',
      '在无限的宇宙中，渺小的你如何寻找意义？'
    ],
    fragments: ['意义之网', '虚空填充', '微光星辰']
  }
]

// 门名称库
const DOOR_NAMES = [
  '回忆之门', '挑战之门', '秘密之门', '觉醒之门', '遗忘之门',
  '重生之门', '审判之门', '抉择之门', '命运之门', '虚空之门',
  '智慧之门', '勇气之门', '牺牲之门', '希望之门', '绝望之门'
]

// 门颜色库
const DOOR_COLORS = [
  0xff6b6b, 0x4ecdc4, 0xffe66d, 0x9b59b6, 0x3498db,
  0xe74c3c, 0x2ecc71, 0xf39c12, 0x1abc9c, 0x34495e
]

// 根据碎片大小计算NPC和门数量
function calculateEntityCount(fragmentSize: number): { npcCount: number; doorCount: number } {
  // 碎片大小范围通常是 0.5 - 2.0
  // 基础数量
  let baseCount = Math.floor(fragmentSize * 2)
  
  // 确保至少1个NPC和1个门
  const npcCount = Math.max(1, Math.min(baseCount, 5))
  const doorCount = Math.max(1, Math.min(baseCount - 1, 4))
  
  return { npcCount, doorCount }
}

// 随机选择主题
function getRandomTheme(): SceneTheme {
  const themes = Object.values(SceneTheme)
  return themes[Math.floor(Math.random() * themes.length)]
}

// 生成随机位置（在圆环上均匀分布）
function generatePosition(index: number, total: number, radius: number, offsetAngle: number = 0): { x: number; z: number } {
  const angle = (index / total) * Math.PI * 2 + offsetAngle
  return {
    x: Math.cos(angle) * radius,
    z: Math.sin(angle) * radius
  }
}

// 生成交错位置（用于NPC和门错开分布）
function generateStaggeredPosition(index: number, total: number, radius: number, isDoor: boolean = false): { x: number; z: number } {
  // NPC和门错开半个角度间隔，确保不会重叠
  const offsetAngle = isDoor ? (Math.PI / total) : 0
  const angle = (index / total) * Math.PI * 2 + offsetAngle + (Math.random() * 0.3 - 0.15) // 添加随机偏移
  const actualRadius = radius + (Math.random() * 2 - 1) // 半径也添加随机偏移
  return {
    x: Math.cos(angle) * actualRadius,
    z: Math.sin(angle) * actualRadius
  }
}

// 生成哲学情境
function generatePhilosophicalScenario(themeIndex: number): PhilosophicalScenario {
  const theme = PHILOSOPHICAL_THEMES[themeIndex % PHILOSOPHICAL_THEMES.length]
  
  const contextIndex = Math.floor(Math.random() * theme.contexts.length)
  const questionIndex = Math.floor(Math.random() * theme.questions.length)
  const fragmentIndex = Math.floor(Math.random() * theme.fragments.length)
  
  return {
    context: theme.contexts[contextIndex],
    question: theme.questions[questionIndex],
    choices: [
      { key: 'a', label: 'A', text: generateChoiceText(themeIndex, 0) },
      { key: 's', label: 'S', text: generateChoiceText(themeIndex, 1) },
      { key: 'd', label: 'D', text: generateChoiceText(themeIndex, 2) }
    ],
    metaphorFragment: theme.fragments[fragmentIndex]
  }
}

// 生成选择文本
function generateChoiceText(themeIndex: number, choiceIndex: number): string {
  const choices = [
    ['伸手触碰镜面，试图与他和解', '倒流时间拯救所爱之人', '选择真理之门', '拯救最爱的人', '创造自己的意义'],
    ['转身离去，坚信当下的选择', '保留记忆接受过去', '选择幸福之门', '拯救一百个人', '接受生命的虚无'],
    ['凝视良久，接受遗憾', '在记忆与改变间平衡', '两扇都不选', '寻找第三条路', '在渺小中寻找伟大']
  ]
  return choices[choiceIndex][themeIndex % choices[0].length]
}

// 生成NPC配置
function generateNPCs(count: number, theme: SceneTheme): NPCConfig[] {
  const npcs: NPCConfig[] = []
  const usedThemeIndices: number[] = []
  
  for (let i = 0; i < count; i++) {
    // 选择未使用的主题
    let themeIndex = Math.floor(Math.random() * PHILOSOPHICAL_THEMES.length)
    while (usedThemeIndices.includes(themeIndex) && usedThemeIndices.length < PHILOSOPHICAL_THEMES.length) {
      themeIndex = (themeIndex + 1) % PHILOSOPHICAL_THEMES.length
    }
    usedThemeIndices.push(themeIndex)
    
    const philosophicalTheme = PHILOSOPHICAL_THEMES[themeIndex]
    const position = generateStaggeredPosition(i, count, 10 + Math.random() * 3, false)
    
    // 根据主题选择颜色
    const colors = [0x8b4513, 0x4169e1, 0x32cd32, 0xff6347, 0x9370db]
    
    npcs.push({
      id: `npc-${Date.now()}-${i}`,
      name: philosophicalTheme.name,
      color: colors[themeIndex % colors.length],
      position,
      scenario: generatePhilosophicalScenario(themeIndex)
    })
  }
  
  return npcs
}

// 生成门配置
function generateDoors(count: number, theme: SceneTheme, dangerLevel: number): DoorConfig[] {
  const doors: DoorConfig[] = []
  
  for (let i = 0; i < count; i++) {
    const position = generateStaggeredPosition(i, count, 18 + Math.random() * 4, true)
    const nameIndex = Math.floor(Math.random() * DOOR_NAMES.length)
    
    // 根据危险等级调整门的要求
    const requirement: DoorRequirement = {
      groups: [
        {
          description: `与至少${dangerLevel}个NPC完成哲学对话`,
          conditions: [
            {
              type: ConditionType.NPC_INTERACTED_COUNT,
              description: `交互NPC数量达到${dangerLevel}`,
              params: { count: dangerLevel, operator: 'gte' }
            }
          ]
        }
      ],
      successMessage: `${DOOR_NAMES[nameIndex]}认可了你的智慧，缓缓打开...`,
      failureMessage: `${DOOR_NAMES[nameIndex]}紧闭着，你需要与更多哲学引导者对话。`
    }
    
    doors.push({
      id: `door-${Date.now()}-${i}`,
      name: DOOR_NAMES[nameIndex],
      color: DOOR_COLORS[nameIndex % DOOR_COLORS.length],
      position,
      targetScene: `scene-${Date.now()}-${i}`,
      requirement
    })
  }
  
  return doors
}

// 生成装饰
function generateDecorations(theme: SceneTheme, count: number): SceneTemplateConfig['decorations'] {
  const decorations: SceneTemplateConfig['decorations'] = []
  const types: Array<'pillar' | 'ring' | 'crystal' | 'obelisk'> = ['pillar', 'ring', 'crystal', 'obelisk']
  
  for (let i = 0; i < count; i++) {
    decorations.push({
      type: types[i % types.length],
      position: generatePosition(i, count, 6 + Math.random() * 4),
      color: DOOR_COLORS[i % DOOR_COLORS.length]
    })
  }
  
  return decorations
}

// 主生成函数
export function generateSceneConfig(params: SceneGenerationParams): SceneTemplateConfig {
  const { fragmentId, fragmentName, fragmentSize, dangerLevel, fragmentColor } = params
  
  // 计算NPC和门数量
  const { npcCount, doorCount } = calculateEntityCount(fragmentSize)
  
  // 选择主题
  const theme = getRandomTheme()
  
  // 生成场景ID
  const sceneId = `scene-${fragmentId}-${Date.now()}`
  
  // 生成NPC
  const npcs = generateNPCs(npcCount, theme)
  
  // 生成门
  const doors = generateDoors(doorCount, theme, dangerLevel)
  
  // 生成装饰
  const decorations = generateDecorations(theme, Math.floor(fragmentSize) + 1)
  
  return {
    id: sceneId,
    name: `${fragmentName}的内在世界`,
    theme,
    sourceFragmentId: fragmentId,
    npcs,
    doors,
    size: 30 + fragmentSize * 10,
    decorations
  }
}

// 获取主题配置
export function getThemeConfig(theme: SceneTheme): SceneThemeConfig {
  return THEME_CONFIGS[theme]
}

// 场景缓存管理
class SceneCache {
  private cache = new Map<string, SceneTemplateConfig>()
  
  get(sceneId: string): SceneTemplateConfig | undefined {
    return this.cache.get(sceneId)
  }
  
  set(sceneId: string, config: SceneTemplateConfig): void {
    this.cache.set(sceneId, config)
  }
  
  has(sceneId: string): boolean {
    return this.cache.has(sceneId)
  }
  
  clear(): void {
    this.cache.clear()
  }
}

export const sceneCache = new SceneCache()
