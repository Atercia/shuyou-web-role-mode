# 变更日志

所有项目的显著变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 计划中
- 碎片合成系统
- 完整度修复功能
- 碎片使用效果
- 三门内部场景
- 存档功能

---

## [0.5.0] - 2026-04-14

### 新增
- 隐喻碎片稀有度系统（普通/稀有/史诗/传说）
- 碎片完整度机制（30-100%，四个等级）
- 碎片生成算法（概率分布）
- 奖励弹窗组件（RewardModal）
- 稀有度星级显示
- 完整度进度条
- 背包系统（Inventory Store）
- 背包面板组件（InventoryPanel）
- 背包UI（左侧滑出，按稀有度排序）
- 空格键确认关闭弹窗

### 技术细节
- 新增 `inventory.ts` 类型定义文件
- 新增 `inventory.ts` Pinia store
- 新增 `RewardModal.vue` 奖励弹窗
- 新增 `InventoryPanel.vue` 背包面板
- TypeScript枚举类型（FragmentRarity, FragmentCompleteness）
- 计算属性实现碎片自动排序
- 动态样式绑定稀有度颜色

### 游戏设计
- 稀有度概率：普通50% / 稀有25% / 史诗15% / 传说10%
- 完整度等级：碎片(30-49%) / 残缺(50-69%) / 较完整(70-89%) / 完整(90-100%)
- 背包容量20格，自动按稀有度排序

---

## [0.4.0] - 2026-04-14

### 新增
- 碎片内部情境广场场景
- 三门系统（回忆之门、挑战之门、秘密之门）
- 三个哲学NPC（存在之影、时间旅者、真理守门人）
- 哲学对话系统（存在主义、时间哲学、认识论）
- NPC交互圆圈（青色，高亮变黄）
- NPC虚幻效果（交互后透明度40%）
- 交互提示组件（InteractionPrompt）
- 哲学对话弹窗（PhilosophicalDialogue）
- Pinia状态管理重构

### 技术细节
- 新增 `FragmentInteriorScene.vue` 情境广场组件
- 新增 `Door.ts` 门类
- 新增 `NPC.ts` NPC类（含哲学情境数据）
- 新增 `fragment.ts` Pinia store
- 使用Pinia替代Vue emit进行组件通信
- MeshBasicMaterial发光效果实现
- NPC待机动画（轻微浮动）

### 游戏设计
- 三门不同颜色对应不同目标场景
- 每个NPC对应一个哲学领域的深度思考
- A/S/D三个选择对应不同哲学立场
- 每个NPC只能交互一次

### 问题修复
- 修复Vue emit在`<script setup>`中不触发的问题
- 修复MeshBasicMaterial emissive属性错误

---

## [0.3.0] - 2026-04-14

### 新增
- 记忆碎片系统核心功能
- 碎片随机生成（8-12个）
- 碎片视觉效果（水晶、光晕、悬浮动画）
- 碎片标签显示（"xxx的记忆碎片"）
- 颜色等级系统（5种颜色对应5个危险等级）
- 碎片交互检测（距离检测）
- 交互确认弹窗组件
- 弹窗显示碎片信息（用时、危险等级、大小）

### 技术细节
- 新增 `MemoryFragment.ts` 碎片类
- 新增 `FragmentModal.vue` 弹窗组件
- 使用 Sprite + CanvasTexture 实现文字标签
- 使用 Teleport 实现弹窗挂载
- 组件间事件通信机制

### 游戏设计
- 碎片大小影响用时（越大越长）
- 颜色直观表示危险等级
- 随机位置生成增加探索乐趣

---

## [0.2.0] - 2026-04-14

### 新增
- 广场场景（50x50 绿色地面）
- 场景装饰（7个建筑物、6棵树）
- 可操控角色系统
- 角色外观（头、身体、手臂、腿）
- 角色动画（行走摆臂）
- 键盘控制系统（WASD + 空格）
- 角色物理（重力、跳跃）
- 第三人称相机跟随
- 相机平滑插值

### 技术细节
- 新增 `Character.ts` 角色类
- 新增 `useKeyboardControls.ts` composable
- 新增 `PlazaScene.vue` 场景组件
- 新增 `PlazaView.vue` 页面视图
- 使用 lerp 实现平滑相机跟随
- 边界检测限制角色移动范围

### 优化
- 组件化设计，逻辑分离
- 使用 Composition API

---

## [0.1.0] - 2026-04-14

### 新增
- 项目初始架构
- Vue3 + Vite + TypeScript 环境
- Three.js 3D 渲染引擎集成
- Vue Router 路由配置
- Pinia 状态管理
- ESLint + Prettier 代码规范
- 基础 2.5D 场景 Demo
- 相机控制系统（OrbitControls）

### 技术细节
- 使用 `<script setup>` 语法
- 配置路径别名 `@`
- 初始化 Git 仓库

### 问题修复
- Vite 5 与 Node.js 16 不兼容，降级到 Vite 4.5.3

---

## 版本说明

### 版本号规则
- **主版本号**: 重大更新，不兼容的 API 修改
- **次版本号**: 功能新增，向下兼容
- **修订号**: 问题修复，向下兼容

### 提交类型
- `feat`: 新功能
- `fix`: 修复
- `docs`: 文档
- `style`: 格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具
