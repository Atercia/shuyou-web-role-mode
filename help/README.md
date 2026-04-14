# 2.5D 风格项目 - 原型迭代文档

## 项目概述

本项目是一个基于 Vue3 + Three.js 的 2.5D 风格原型项目，采用渐进式开发方式，逐步构建完整的游戏体验。

## 文档结构

```
help/
├── README.md              # 本文档 - 项目说明和导航
├── ITERATIONS.md          # 迭代记录总览
├── v0.1.0/                # 初始环境搭建
├── v0.2.0/                # 广场场景与角色控制
├── v0.3.0/                # 记忆碎片系统
└── CHANGELOG.md           # 变更日志
```

## 快速开始

### 技术栈
- **Vue 3** - 前端框架 (Composition API)
- **Vite** - 构建工具
- **TypeScript** - 类型系统
- **Three.js** - 3D 渲染引擎
- **Pinia** - 状态管理
- **Vue Router** - 路由管理

### 安装运行
```bash
npm install
npm run dev
```

### 访问地址
- 首页: http://localhost:5173/
- 2.5D Demo: http://localhost:5173/demo
- 广场探索: http://localhost:5173/plaza

## 迭代版本

| 版本 | 日期 | 主要内容 | 状态 |
|------|------|----------|------|
| v0.1.0 | 2026-04-14 | 初始环境搭建 | ✅ 已完成 |
| v0.2.0 | 2026-04-14 | 广场场景与角色控制 | ✅ 已完成 |
| v0.3.0 | 2026-04-14 | 记忆碎片系统 | ✅ 已完成 |

## 核心功能

### 已实现
1. ✅ Vue3 + Vite + Three.js 基础环境
2. ✅ 2.5D 场景渲染
3. ✅ 可操控角色（WASD移动 + 空格跳跃）
4. ✅ 记忆碎片系统
5. ✅ 碎片交互弹窗

### 待开发
- [ ] 碎片内部场景
- [ ] 角色属性系统
- [ ] 背包系统
- [ ] 任务系统
- [ ] 存档功能

## 项目结构

```
src/
├── components/        # Vue 组件
│   ├── PlazaScene.vue
│   ├── Scene25D.vue
│   └── FragmentModal.vue
├── composables/       # 组合式函数
│   └── useKeyboardControls.ts
├── game/             # 游戏逻辑
│   ├── Character.ts
│   └── MemoryFragment.ts
├── router/           # 路由配置
├── stores/           # Pinia 状态
├── views/            # 页面视图
└── assets/           # 静态资源
```

## 参与贡献

请查看 [ITERATIONS.md](./ITERATIONS.md) 了解详细的迭代记录和开发思路。
