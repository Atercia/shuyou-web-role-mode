export type PlazaElementType = 'museum' | 'workshop' | 'temple' | 'market'

export interface PlazaElementConfig {
  id: string
  name: string
  type: PlazaElementType
  description: string
  color: number
  position: { x: number; z: number }
  estimatedWeeks: number
}

export const PLAZA_ELEMENT_TYPE_META: Record<PlazaElementType, { label: string; icon: string; actionText: string }> = {
  museum: { label: '文博场馆', icon: '🏛️', actionText: '参观' },
  workshop: { label: '研学工坊', icon: '🔧', actionText: '体验' },
  temple: { label: '范式神殿', icon: '⛩️', actionText: '朝圣' },
  market: { label: '知识市集', icon: '🏪', actionText: '逛市集' }
}
