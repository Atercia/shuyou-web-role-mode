# 弹窗组件自适应设计规范

## 设计原则

### 1. 容器布局规范

所有弹窗组件必须遵循以下布局结构：

```css
/* 遮罩层 */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;           /* 边缘留白 */
  overflow: auto;          /* 支持滚动 */
  z-index: 1000+;
}

/* 内容容器 */
.container {
  width: 100%;
  max-width: 500px;        /* 根据内容调整 */
  max-height: calc(100vh - 32px);  /* 限制最大高度 */
  display: flex;
  flex-direction: column;
  overflow: hidden;        /* 内部控制滚动 */
}
```

### 2. 内容区域划分

```css
/* 头部 - 固定 */
.header {
  flex-shrink: 0;
  padding: 16px 20px;
}

/* 内容区 - 可滚动 */
.body {
  flex-shrink: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px;
}

/* 底部 - 固定 */
.footer {
  flex-shrink: 0;
  padding: 16px 20px;
}
```

### 3. 响应式断点

```css
/* 小宽度屏幕 */
@media (max-width: 480px) {
  .container {
    padding: 16px;
    max-height: calc(100vh - 24px);
  }
  /* 字体缩小 10-15% */
  /* 间距缩小 20-30% */
}

/* 小高度屏幕 */
@media (max-height: 600px) {
  /* 进一步压缩间距 */
  /* 减小图标尺寸 */
}
```

### 4. 尺寸规范

| 元素 | 默认尺寸 | 小屏幕尺寸 |
|------|---------|-----------|
| 容器内边距 | 24px | 16px |
| 标题字体 | 1.5rem | 1.3rem |
| 正文字体 | 1rem | 0.9rem |
| 小字体 | 0.9rem | 0.8rem |
| 图标尺寸 | 4rem | 3rem |
| 按钮高度 | 40px | 36px |
| 间距 | 16-24px | 10-16px |

### 5. 颜色规范

```css
/* 背景 */
--modal-bg: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
--modal-border: rgba(255, 255, 255, 0.1);

/* 文字 */
--text-primary: #fff;
--text-secondary: #aaa;
--text-muted: #888;

/* 强调色 */
--accent-purple: #9b59b6;
--accent-blue: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* 状态色 */
--success: #4caf50;
--warning: #ff9800;
--error: #f44336;
```

## 已优化的弹窗组件

1. **PhilosophicalDialogue** - 哲学对话弹窗
2. **RewardModal** - 奖励弹窗
3. **FragmentModal** - 碎片确认弹窗

## 优化要点

### 解决显示不全的问题

1. **max-height 限制**: 防止弹窗超出视口
2. **overflow-y: auto**: 内容区域可滚动
3. **flex-shrink 控制**: 固定头部/底部，内容区自适应
4. **min-height: 0**: 确保 flex 子元素可以正确收缩

### 响应式适配

1. **双维度适配**: 同时考虑宽度和高度
2. **渐进式压缩**: 小屏幕逐步减小尺寸
3. **保持可读性**: 字体不小于 0.8rem
4. **触控友好**: 按钮不小于 36px

### 视觉层次

1. **固定区域**: 标题、操作按钮始终可见
2. **滚动区域**: 详细内容可滚动查看
3. **视觉反馈**: 选中状态、hover效果
