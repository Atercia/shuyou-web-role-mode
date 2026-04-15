import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { MetaphorFragment, ChallengeRecord } from '@/types/metaphor'
import { MetaphorType, FragmentCategory, METAPHOR_CONFIG } from '@/types/metaphor'

const CHALLENGE_DURATION = 20 * 60 * 1000 // 20分钟（毫秒）

export const useChallengeStore = defineStore('challenge', () => {
  // State
  const currentChallenge = ref<ChallengeRecord | null>(null)
  const challengeHistory = ref<ChallengeRecord[]>([])
  const timeRemaining = ref(CHALLENGE_DURATION)
  const isPaused = ref(false)
  let timerInterval: number | null = null

  // Getters
  const isInChallenge = computed(() => currentChallenge.value !== null)
  const formattedTime = computed(() => {
    const minutes = Math.floor(timeRemaining.value / 60000)
    const seconds = Math.floor((timeRemaining.value % 60000) / 1000)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })
  const isTimeLow = computed(() => timeRemaining.value < 60000) // 少于1分钟
  const currentFragments = computed(() => currentChallenge.value?.fragmentsCollected || [])
  const collectedCount = computed(() => currentFragments.value.length)

  // Actions
  function startChallenge() {
    const challenge: ChallengeRecord = {
      id: `challenge-${Date.now()}`,
      startTime: new Date(),
      duration: 0,
      fragmentsCollected: [],
      isCompleted: false,
      score: 0
    }
    currentChallenge.value = challenge
    timeRemaining.value = CHALLENGE_DURATION
    isPaused.value = false
    startTimer()
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval)
    timerInterval = window.setInterval(() => {
      if (!isPaused.value && timeRemaining.value > 0) {
        timeRemaining.value -= 100
        if (timeRemaining.value <= 0) {
          endChallenge(true)
        }
      }
    }, 100)
  }

  function pauseTimer() {
    isPaused.value = true
  }

  function resumeTimer() {
    isPaused.value = false
  }

  function endChallenge(timeUp: boolean = false) {
    if (!currentChallenge.value) return

    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }

    const endTime = new Date()
    const duration = Math.floor((endTime.getTime() - currentChallenge.value.startTime.getTime()) / 1000)

    currentChallenge.value.endTime = endTime
    currentChallenge.value.duration = duration
    currentChallenge.value.isCompleted = true
    currentChallenge.value.score = calculateScore(currentChallenge.value)

    challengeHistory.value.push({ ...currentChallenge.value })
  }

  function calculateScore(challenge: ChallengeRecord): number {
    let score = 0
    challenge.fragmentsCollected.forEach(fragment => {
      // 基础分数
      const rarityScore = {
        common: 10,
        uncommon: 25,
        rare: 50,
        legendary: 100
      }
      score += rarityScore[fragment.rarity]
      // 完整度加成
      score += Math.floor(fragment.completeness / 10)
      // 隐喻数量加成
      score += fragment.metaphors.length * 5
    })
    return score
  }

  function collectFragment(fragment: MetaphorFragment) {
    if (!currentChallenge.value) return
    fragment.challengeId = currentChallenge.value.id
    currentChallenge.value.fragmentsCollected.push(fragment)
  }

  function clearCurrentChallenge() {
    currentChallenge.value = null
    timeRemaining.value = CHALLENGE_DURATION
    isPaused.value = false
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  // 生成随机碎片（肉鸽模式）
  function generateRandomFragment(): MetaphorFragment {
    const fragmentNames = [
      { name: '真理与幻想之钥匙', metaphors: [MetaphorType.TRUTH, MetaphorType.DREAM] },
      { name: '爱之回响', metaphors: [MetaphorType.LOVE, MetaphorType.MEMORY] },
      { name: '自由之翼', metaphors: [MetaphorType.FREEDOM, MetaphorType.COURAGE] },
      { name: '生死轮回', metaphors: [MetaphorType.LIFE_DEATH, MetaphorType.DESTINY] },
      { name: '时光碎片', metaphors: [MetaphorType.TIME, MetaphorType.MEMORY] },
      { name: '希望火种', metaphors: [MetaphorType.HOPE, MetaphorType.COURAGE] },
      { name: '正义之剑', metaphors: [MetaphorType.JUSTICE, MetaphorType.SACRIFICE] },
      { name: '美的凝视', metaphors: [MetaphorType.BEAUTY, MetaphorType.LOVE] },
      { name: '智慧之泉', metaphors: [MetaphorType.WISDOM, MetaphorType.TRUTH] },
      { name: '友谊之链', metaphors: [MetaphorType.FRIENDSHIP, MetaphorType.LOVE] },
      { name: '牺牲之光', metaphors: [MetaphorType.SACRIFICE, MetaphorType.HOPE] },
      { name: '命运之轮', metaphors: [MetaphorType.DESTINY, MetaphorType.TIME] },
      { name: '心灵镜像', metaphors: [MetaphorType.MEMORY, MetaphorType.TRUTH] },
      { name: '勇气徽章', metaphors: [MetaphorType.COURAGE, MetaphorType.FREEDOM] },
      { name: '永恒瞬间', metaphors: [MetaphorType.TIME, MetaphorType.BEAUTY] },
      { name: '灵魂契约', metaphors: [MetaphorType.LOVE, MetaphorType.SACRIFICE] },
      { name: '真理追寻者', metaphors: [MetaphorType.TRUTH, MetaphorType.WISDOM] },
      { name: '梦境编织者', metaphors: [MetaphorType.DREAM, MetaphorType.HOPE] },
      { name: '生命赞歌', metaphors: [MetaphorType.LIFE_DEATH, MetaphorType.HOPE] },
      { name: '自由之路', metaphors: [MetaphorType.FREEDOM, MetaphorType.JUSTICE] }
    ]

    // 修复：确保所有隐喻类型都有效
    const validMetaphors = Object.values(MetaphorType)
    const validFragmentNames = fragmentNames.map(f => ({
      ...f,
      metaphors: f.metaphors.filter(m => validMetaphors.includes(m))
    })).filter(f => f.metaphors.length > 0)

    const selected = validFragmentNames[Math.floor(Math.random() * validFragmentNames.length)]

    // 随机稀有度
    const rarityRoll = Math.random()
    let rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
    if (rarityRoll < 0.5) rarity = 'common'
    else if (rarityRoll < 0.75) rarity = 'uncommon'
    else if (rarityRoll < 0.9) rarity = 'rare'
    else rarity = 'legendary'

    // 随机完整度
    const completeness = Math.floor(Math.random() * 71) + 30

    // 确定分类
    const category = determineCategory(selected.metaphors)

    return {
      id: `fragment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: selected.name,
      description: generateDescription(selected.name, selected.metaphors),
      category,
      metaphors: selected.metaphors,
      rarity,
      completeness,
      icon: getFragmentIcon(category),
      obtainedAt: new Date(),
      challengeId: currentChallenge.value?.id || ''
    }
  }

  function determineCategory(metaphors: MetaphorType[]): FragmentCategory {
    const emotionMetaphors = [MetaphorType.LOVE, MetaphorType.HOPE, MetaphorType.COURAGE, MetaphorType.SACRIFICE]
    const cognitionMetaphors = [MetaphorType.TRUTH, MetaphorType.WISDOM, MetaphorType.DREAM]
    const existenceMetaphors = [MetaphorType.LIFE_DEATH, MetaphorType.DESTINY, MetaphorType.TIME]
    const socialMetaphors = [MetaphorType.FRIENDSHIP, MetaphorType.JUSTICE]

    if (metaphors.some(m => emotionMetaphors.includes(m))) return FragmentCategory.EMOTION
    if (metaphors.some(m => cognitionMetaphors.includes(m))) return FragmentCategory.COGNITION
    if (metaphors.some(m => existenceMetaphors.includes(m))) return FragmentCategory.EXISTENCE
    if (metaphors.some(m => socialMetaphors.includes(m))) return FragmentCategory.SOCIAL
    return FragmentCategory.NATURE
  }

  function generateDescription(name: string, metaphors: MetaphorType[]): string {
    const descriptions = [
      `蕴含着${metaphors.length > 1 ? '多重' : ''}隐喻力量的神秘碎片`,
      `闪烁着${metaphors.map(m => METAPHOR_CONFIG[m].name).join('与')}光芒的记忆残片`,
      `承载着深刻${metaphors.length > 1 ? '内涵' : '意义'}的隐喻结晶`,
      `散发着${metaphors.map(m => METAPHOR_CONFIG[m].name).join('、')}气息的知识碎片`
    ]
    return descriptions[Math.floor(Math.random() * descriptions.length)]
  }

  function getFragmentIcon(category: FragmentCategory): string {
    const icons: Record<FragmentCategory, string[]> = {
      [FragmentCategory.EMOTION]: ['💝', '💕', '💖', '💗'],
      [FragmentCategory.COGNITION]: ['💎', '🔮', '💠', '🧿'],
      [FragmentCategory.EXISTENCE]: ['🌌', '✨', '🔆', '💫'],
      [FragmentCategory.SOCIAL]: ['🤝', '👥', '💫', '🌟'],
      [FragmentCategory.NATURE]: ['🌿', '🍃', '🌸', '💐']
    }
    const categoryIcons = icons[category]
    return categoryIcons[Math.floor(Math.random() * categoryIcons.length)]
  }

  // 生成一批随机碎片（用于挑战场景）
  function generateChallengeFragments(count: number = 8): MetaphorFragment[] {
    const fragments: MetaphorFragment[] = []
    for (let i = 0; i < count; i++) {
      fragments.push(generateRandomFragment())
    }
    return fragments
  }

  return {
    currentChallenge,
    challengeHistory,
    timeRemaining,
    isPaused,
    isInChallenge,
    formattedTime,
    isTimeLow,
    currentFragments,
    collectedCount,
    startChallenge,
    endChallenge,
    pauseTimer,
    resumeTimer,
    collectFragment,
    clearCurrentChallenge,
    generateRandomFragment,
    generateChallengeFragments
  }
})
