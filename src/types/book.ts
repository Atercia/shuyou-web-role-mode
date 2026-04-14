// 书籍类型定义

// 知识点
export interface KnowledgePoint {
  id: string
  title: string
  content: string
  icon: string
}

// 书籍配置
export interface BookConfig {
  id: string
  name: string
  description: string
  color: number
  position: { x: number; z: number }
  size: number
  estimatedWeeks: number  // 用时（周）
  knowledgePoints: KnowledgePoint[]
}

// 书籍场景配置
export interface BookSceneConfig {
  id: string
  bookName: string
  bookColor: number
  knowledgePoints: KnowledgePoint[]
}

// 知识点状态
export interface KnowledgePointState {
  id: string
  isRead: boolean
  isHovered: boolean
}
