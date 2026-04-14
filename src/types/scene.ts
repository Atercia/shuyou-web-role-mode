import type { DoorConfig } from '@/game/Door'
import type { NPCConfig } from '@/game/NPC'

// 场景主题类型
export enum SceneTheme {
  MYSTERY = 'mystery',      // 神秘紫色调
  MEMORY = 'memory',        // 回忆金色调
  CHALLENGE = 'challenge',  // 挑战红色调
  SECRET = 'secret',        // 秘密蓝色调
  VOID = 'void'             // 虚空黑色调
}

// 场景主题配置
export interface SceneThemeConfig {
  name: string
  backgroundColor: number
  fogColor: number
  groundColor: number
  ambientLight: number
  pointLights: {
    color: number
    position: { x: number; y: number; z: number }
    intensity: number
  }[]
}

// 场景模板配置
export interface SceneTemplateConfig {
  // 场景唯一标识
  id: string
  // 场景名称
  name: string
  // 主题
  theme: SceneTheme
  // 来源碎片ID
  sourceFragmentId: string
  // NPC配置
  npcs: NPCConfig[]
  // 门配置
  doors: DoorConfig[]
  // 场景大小（影响可探索范围）
  size: number
  // 特殊装饰
  decorations?: {
    type: 'pillar' | 'ring' | 'crystal' | 'obelisk'
    position: { x: number; z: number }
    color?: number
  }[]
}

// 场景生成参数
export interface SceneGenerationParams {
  // 来源碎片ID
  fragmentId: string
  // 碎片名称
  fragmentName: string
  // 碎片大小（影响NPC和门数量）
  fragmentSize: number
  // 危险等级（影响难度）
  dangerLevel: number
  // 碎片颜色
  fragmentColor: number
}

// 场景管理状态
export interface SceneState {
  // 当前场景ID
  currentSceneId: string | null
  // 已访问的场景ID集合
  visitedScenes: Set<string>
  // 场景配置缓存
  sceneConfigs: Map<string, SceneTemplateConfig>
}

// 主题配置映射 - 使用字符串键确保兼容性
export const THEME_CONFIGS: Record<string, SceneThemeConfig> = {
  mystery: {
    name: '神秘领域',
    backgroundColor: 0x2d1b4e,
    fogColor: 0x2d1b4e,
    groundColor: 0x3d2b5e,
    ambientLight: 0.6,
    pointLights: [
      { color: 0x9b59b6, position: { x: -10, y: 10, z: -10 }, intensity: 1.2 },
      { color: 0x3498db, position: { x: 10, y: 10, z: 10 }, intensity: 1.2 },
      { color: 0xffffff, position: { x: 0, y: 20, z: 0 }, intensity: 0.5 }
    ]
  },
  memory: {
    name: '回忆殿堂',
    backgroundColor: 0x4a3c28,
    fogColor: 0x4a3c28,
    groundColor: 0x5a4c38,
    ambientLight: 0.7,
    pointLights: [
      { color: 0xffd700, position: { x: 0, y: 15, z: 0 }, intensity: 1.5 },
      { color: 0xffa500, position: { x: -8, y: 8, z: -8 }, intensity: 1.0 },
      { color: 0xffffff, position: { x: 8, y: 8, z: 8 }, intensity: 0.8 }
    ]
  },
  challenge: {
    name: '试炼之地',
    backgroundColor: 0x3d1f1f,
    fogColor: 0x3d1f1f,
    groundColor: 0x4d2f2f,
    ambientLight: 0.5,
    pointLights: [
      { color: 0xff4444, position: { x: 0, y: 12, z: 0 }, intensity: 1.3 },
      { color: 0xff6600, position: { x: 10, y: 8, z: -10 }, intensity: 1.0 },
      { color: 0xff0000, position: { x: -10, y: 8, z: 10 }, intensity: 0.8 }
    ]
  },
  secret: {
    name: '隐秘空间',
    backgroundColor: 0x1a2a3a,
    fogColor: 0x1a2a3a,
    groundColor: 0x2a3a4a,
    ambientLight: 0.4,
    pointLights: [
      { color: 0x00ffff, position: { x: -5, y: 10, z: 5 }, intensity: 1.2 },
      { color: 0x0088ff, position: { x: 5, y: 10, z: -5 }, intensity: 1.2 },
      { color: 0x00ffcc, position: { x: 0, y: 15, z: 0 }, intensity: 0.8 }
    ]
  },
  void: {
    name: '虚空之境',
    backgroundColor: 0x1a1a2a,
    fogColor: 0x1a1a2a,
    groundColor: 0x2a2a3a,
    ambientLight: 0.4,
    pointLights: [
      { color: 0x8888ff, position: { x: 0, y: 20, z: 0 }, intensity: 1.0 },
      { color: 0x6666aa, position: { x: -15, y: 5, z: 15 }, intensity: 0.8 },
      { color: 0x444488, position: { x: 15, y: 5, z: -15 }, intensity: 0.6 }
    ]
  }
}
