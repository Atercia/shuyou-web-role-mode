<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BookScene from '@/components/BookScene.vue'
import InteractionPrompt from '@/components/InteractionPrompt.vue'
import type { BookSceneConfig, KnowledgePoint } from '@/types/book'

const router = useRouter()
const route = useRoute()
const containerRef = ref<HTMLDivElement>()

// 当前靠近的知识点
const currentKnowledgePoint = ref<KnowledgePoint | null>(null)
const showPrompt = ref(false)

// 已阅读的知识点
const readKnowledgePoints = ref<Set<string>>(new Set())

// 书籍信息
const bookName = computed(() => route.query.bookName as string || '未知书籍')
const bookColor = computed(() => {
  const colorHex = route.query.bookColor as string
  return colorHex ? parseInt(colorHex, 16) : 0x9b59b6
})

// 构建场景配置
const sceneConfig = computed<BookSceneConfig>(() => {
  const bookId = route.query.bookId as string
  
  // 根据书籍ID生成知识点
  const knowledgePoints: KnowledgePoint[] = generateKnowledgePoints(bookId)
  
  return {
    id: `book-scene-${bookId}`,
    bookName: bookName.value,
    bookColor: bookColor.value,
    knowledgePoints
  }
})

function generateKnowledgePoints(bookId: string): KnowledgePoint[] {
  // 根据书籍ID返回对应的知识点
  const pointsMap: Record<string, KnowledgePoint[]> = {
    'book-1': [
      { id: 'kp-1-1', title: '存在主义', content: '存在先于本质，人是自己选择的总和。每一个选择都在定义我们是谁。', icon: '🤔' },
      { id: 'kp-1-2', title: '认识论', content: '我们如何知道我们知道的？知识的来源和界限是什么？', icon: '🧠' },
      { id: 'kp-1-3', title: '伦理学', content: '什么是善？什么是恶？道德判断的基础是什么？', icon: '⚖️' },
      { id: 'kp-1-4', title: '逻辑学', content: '推理的基本规则和谬误。如何构建有效的论证？', icon: '📐' },
      { id: 'kp-1-5', title: '美学', content: '什么是美？艺术的价值在哪里？审美体验的本质是什么？', icon: '🎨' }
    ],
    'book-2': [
      { id: 'kp-2-1', title: '时间的箭头', content: '为什么时间只能向前流动？熵增定律如何定义时间的方向？', icon: '⏰' },
      { id: 'kp-2-2', title: '相对论', content: '时间和空间是相互关联的。速度越快，时间越慢。', icon: '🌌' },
      { id: 'kp-2-3', title: '黑洞', content: '时间在其中停止的奇异天体。事件视界内，时间指向中心。', icon: '⚫' },
      { id: 'kp-2-4', title: '大爆炸', content: '宇宙和时间的起点。约138亿年前，时间从此开始。', icon: '💥' },
      { id: 'kp-2-5', title: '时间旅行', content: '科幻还是可能的物理现实？虫洞和闭合类时曲线。', icon: '🚀' }
    ],
    'book-3': [
      { id: 'kp-3-1', title: '潜意识', content: '影响我们行为的隐藏力量。梦境、口误和潜意识欲望。', icon: '🌊' },
      { id: 'kp-3-2', title: '认知偏差', content: '我们思维中的系统性错误。确认偏差、锚定效应等。', icon: '🔄' },
      { id: 'kp-3-3', title: '情绪智力', content: '理解和管理情绪的能力。自我觉察、自我调节、同理心。', icon: '💝' },
      { id: 'kp-3-4', title: '记忆机制', content: '我们如何存储和回忆信息。编码、存储、提取三阶段。', icon: '📚' },
      { id: 'kp-3-5', title: '人格理论', content: '是什么让我们成为独特的个体？特质论、类型论、人本主义。', icon: '🎭' }
    ]
  }
  
  return pointsMap[bookId] || pointsMap['book-1']
}

onMounted(() => {
  if (containerRef.value) {
    containerRef.value.focus()
  }
})

const handleKnowledgePointNearby = (point: KnowledgePoint) => {
  currentKnowledgePoint.value = point
  showPrompt.value = true
}

const handleKnowledgePointLeave = () => {
  currentKnowledgePoint.value = null
  showPrompt.value = false
}

const handleKnowledgePointRead = (point: KnowledgePoint) => {
  // 标记为已阅读
  readKnowledgePoints.value.add(point.id)
  
  // 显示知识点内容（可以用弹窗或提示）
  alert(`📖 ${point.title}\n\n${point.content}`)
}

const handleExit = () => {
  router.push('/')
}

// 计算阅读进度
const readProgress = computed(() => {
  return `${readKnowledgePoints.value.size} / 5`
})
</script>

<template>
  <div ref="containerRef" class="book-interior-container" tabindex="0">
    <div class="header">
      <div class="header-left">
        <h2>📚 {{ bookName }}</h2>
        <span class="progress">已阅读: {{ readProgress }}</span>
      </div>
      <button class="exit-btn" @click="handleExit">离开书籍</button>
    </div>

    <div class="scene-wrapper">
      <BookScene
        :scene-config="sceneConfig"
        @knowledge-point-nearby="handleKnowledgePointNearby"
        @knowledge-point-leave="handleKnowledgePointLeave"
        @knowledge-point-read="handleKnowledgePointRead"
      />
    </div>

    <!-- 知识点交互提示 -->
    <InteractionPrompt
      :visible="showPrompt"
      :title="currentKnowledgePoint?.icon + ' ' + (currentKnowledgePoint?.title || '知识点')"
      description="按空格阅读此知识点"
      action-key="空格"
      type="npc"
    />
  </div>
</template>

<style scoped>
.book-interior-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 1rem;
  box-sizing: border-box;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #2d1b4e 100%);
  position: relative;
}

/* 添加微妙的光点背景 */
.book-interior-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(1px 1px at 50px 100px, rgba(155, 89, 182, 0.4), transparent),
    radial-gradient(1px 1px at 150px 50px, rgba(102, 126, 234, 0.3), transparent),
    radial-gradient(2px 2px at 250px 150px, rgba(155, 89, 182, 0.3), transparent),
    radial-gradient(1px 1px at 350px 80px, rgba(102, 126, 234, 0.4), transparent);
  background-size: 400px 200px;
  pointer-events: none;
  opacity: 0.5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(155, 89, 182, 0.3);
  border-radius: 16px;
  margin-bottom: 1rem;
  position: relative;
  z-index: 10;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.header h2 {
  margin: 0;
  color: #fff;
  font-size: 1.4rem;
  font-weight: 600;
  background: linear-gradient(135deg, #fff 0%, #d0d0f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.progress {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  background: rgba(155, 89, 182, 0.15);
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid rgba(155, 89, 182, 0.3);
  font-weight: 500;
}

.exit-btn {
  padding: 0.6rem 1.25rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.exit-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.scene-wrapper {
  flex: 1;
  border: 1px solid rgba(155, 89, 182, 0.25);
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  z-index: 1;
  box-shadow: 
    0 0 40px rgba(155, 89, 182, 0.1),
    inset 0 0 80px rgba(155, 89, 182, 0.05);
}
</style>
