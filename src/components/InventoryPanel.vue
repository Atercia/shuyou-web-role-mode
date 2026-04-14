<script setup lang="ts">
import { computed } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import type { MetaphorFragment, FragmentRarity } from '@/types/inventory'

const inventoryStore = useInventoryStore()

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const sortedFragments = computed(() => {
  const rarityOrder: Record<FragmentRarity, number> = {
    legendary: 4,
    rare: 3,
    uncommon: 2,
    common: 1
  }
  return [...inventoryStore.fragments].sort((a, b) => {
    return rarityOrder[b.rarity] - rarityOrder[a.rarity]
  })
})

const getRarityClass = (rarity: FragmentRarity) => {
  return `rarity-${rarity}`
}
</script>

<template>
  <Transition name="inventory">
    <div v-if="visible" class="inventory-panel">
      <div class="inventory-header">
        <h3>🎒 背包</h3>
        <button class="close-btn" @click="emit('close')">×</button>
      </div>

      <div class="inventory-content">
        <!-- 隐喻碎片区域 -->
        <div class="section">
          <h4 class="section-title">
            <span>💎 隐喻碎片</span>
            <span class="count">{{ inventoryStore.fragmentCount }}</span>
          </h4>
          
          <div v-if="sortedFragments.length === 0" class="empty-state">
            暂无隐喻碎片
          </div>
          
          <div v-else class="fragments-grid">
            <div
              v-for="fragment in sortedFragments"
              :key="fragment.id"
              class="fragment-item"
              :class="getRarityClass(fragment.rarity)"
            >
              <div class="fragment-icon">{{ fragment.icon }}</div>
              <div class="fragment-details">
                <div class="fragment-name">{{ fragment.name }}</div>
                <div class="fragment-meta">
                  <span 
                    class="rarity-badge"
                    :style="{ backgroundColor: inventoryStore.getFragmentRarityColor(fragment.rarity) }"
                  >
                    {{ inventoryStore.getFragmentRarityName(fragment.rarity) }}
                  </span>
                  <div class="completeness-indicator">
                    <div 
                      class="completeness-bar"
                      :style="{ width: fragment.completenessValue + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 其他物品区域 -->
        <div class="section">
          <h4 class="section-title">
            <span>📦 物品</span>
            <span class="count">{{ inventoryStore.itemCount }}</span>
          </h4>
          
          <div v-if="inventoryStore.items.length === 0" class="empty-state">
            暂无物品
          </div>
          
          <div v-else class="items-list">
            <div
              v-for="item in inventoryStore.items"
              :key="item.id"
              class="item-row"
            >
              <span class="item-icon">{{ item.icon }}</span>
              <span class="item-name">{{ item.name }}</span>
              <span class="item-quantity">×{{ item.quantity }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="inventory-footer">
        <div class="slots-info">
          已用: {{ inventoryStore.totalSlots }} / {{ inventoryStore.maxSlots }}
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.inventory-panel {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 320px;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border-right: 2px solid #9b59b6;
  z-index: 100;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.5);
}

.inventory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(155, 89, 182, 0.3);
}

.inventory-header h3 {
  margin: 0;
  color: #fff;
  font-size: 1.2rem;
}

.close-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.inventory-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 12px 0;
  color: #9b59b6;
  font-size: 0.95rem;
}

.count {
  background: rgba(155, 89, 182, 0.2);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.empty-state {
  text-align: center;
  color: #666;
  padding: 20px;
  font-size: 0.9rem;
}

.fragments-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fragment-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border-left: 4px solid;
  transition: all 0.3s;
}

.fragment-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.fragment-item.rarity-common { border-left-color: #9e9e9e; }
.fragment-item.rarity-uncommon { border-left-color: #4caf50; }
.fragment-item.rarity-rare { border-left-color: #2196f3; }
.fragment-item.rarity-legendary { border-left-color: #ff9800; }

.fragment-icon {
  font-size: 2rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.fragment-details {
  flex: 1;
}

.fragment-name {
  color: #fff;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.fragment-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rarity-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  color: #fff;
  font-weight: 600;
}

.completeness-indicator {
  flex: 1;
  height: 6px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 3px;
  overflow: hidden;
}

.completeness-bar {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  border-radius: 3px;
  transition: width 0.3s;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.item-icon {
  font-size: 1.5rem;
}

.item-name {
  flex: 1;
  color: #fff;
  font-size: 0.9rem;
}

.item-quantity {
  color: #9b59b6;
  font-weight: 600;
}

.inventory-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(155, 89, 182, 0.3);
}

.slots-info {
  text-align: center;
  color: #888;
  font-size: 0.85rem;
}

/* 动画 */
.inventory-enter-active,
.inventory-leave-active {
  transition: transform 0.3s ease;
}

.inventory-enter-from,
.inventory-leave-to {
  transform: translateX(-100%);
}
</style>
