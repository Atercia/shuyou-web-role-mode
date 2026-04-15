# 开发经验日志

> 记录项目开发过程中踩过的坑、学到的经验，供后续参考。

---

## 2026-04-15 肉鸽模式重构

### 🕳️ 踩过的坑

#### 1. 路由重构遗漏
**问题**：将 `/plaza` 改为 `/challenge` 后，碎片内部场景的返回按钮仍然指向 `/plaza`，导致白屏。

**原因**：只修改了路由配置和导航链接，遗漏了 `FragmentInteriorView.vue` 和 `PlazaElementView.vue` 中的返回逻辑。

**解决**：全局搜索 `/plaza` 字符串，统一替换为 `/challenge`。

```typescript
// 错误
router.push('/plaza')

// 正确
router.push('/challenge')
```

---

#### 2. Three.js 对象未添加到场景
**问题**：广场建筑（博物馆、工坊等）没有3D实体显示。

**原因**：`PlazaElement` 构造函数创建了 `this.mesh` Group，但 **从未调用 `scene.add(this.mesh)`**。

**排查方法**：
1. 检查 `PlazaScene.vue` 确认调用了 `createPlazaElements()`
2. 检查 `PlazaElement` 类确认建筑模型已创建
3. 对比 `MemoryFragment` 和 `Book` 类，发现它们都调用了 `scene.add(this.mesh)`
4. 定位到 `PlazaElement` 缺少这行代码

**解决**：
```typescript
constructor(scene: THREE.Scene, config: PlazaElementConfig) {
  // ... 其他代码 ...
  
  // 关键：将 mesh 添加到场景中！
  this.scene.add(this.mesh)
}
```

**经验**：Three.js 中创建的对象必须显式添加到场景中才能渲染。

---

#### 3. DOM 标签导致页面滚动条
**问题**：广场中标签在视口外时导致 body 出现滚动条，WASD 移动与滚动冲突。

**原因分析**：
- 标签使用 `position: fixed` 定位
- 只检测 `position.z < 1`（是否在相机前方）
- 未检测视口边界，标签位置可能为负或超出窗口

**三层防护解决方案**：

**第一层：视口边界检测**
```typescript
const isInViewport = position.z < 1 && 
                     x >= -margin && 
                     x <= renderer.domElement.clientWidth + margin &&
                     y >= -margin && 
                     y <= renderer.domElement.clientHeight + margin
```

**第二层：位置限制（Clamp）**
```typescript
const clampedX = Math.max(0, Math.min(x, renderer.domElement.clientWidth))
const clampedY = Math.max(0, Math.min(y, renderer.domElement.clientHeight))
```

**第三层：CSS 全局防护**
```css
body { overflow: hidden; }
```

---

#### 4. 远处标签堆积
**问题**：远处所有对象的标签都显示，导致标签重叠堆积。

**原因**：只检测是否在相机前方，没有距离限制。

**解决**：添加距离检测
```typescript
const maxLabelDistance = 30 // 碎片/书籍
const maxLabelDistance = 40 // 建筑

if (characterPosition) {
  const distance = this.mesh.position.distanceTo(characterPosition)
  if (distance > maxLabelDistance) {
    this.labelElement.style.display = 'none'
    return
  }
}
```

---

### 💡 学到的经验

#### 1. 路由重构 checklist
- [ ] 修改 `router/index.ts` 路由配置
- [ ] 修改 `App.vue` 导航链接
- [ ] 修改所有页面中的 `router.push()` 调用
- [ ] 修改所有 `<router-link>` 的 `to` 属性
- [ ] 全局搜索旧路由字符串确保无遗漏

---

#### 2. Three.js 对象生命周期
```
创建几何体/材质 → 创建 Mesh → 添加到场景 → 渲染
     ↑___________________________________________|
                    不要忘记这一步！
```

**调试技巧**：
- 在 Chrome DevTools 中查看 `scene.children`
- 使用 `console.log(mesh.parent)` 确认对象是否已添加到场景

---

#### 3. DOM 标签与 3D 场景同步的最佳实践

**必须检测的条件**：
1. 是否在相机前方 (`position.z < 1`)
2. 是否在视口范围内 (x/y 边界检测)
3. 是否在合理距离内 (距离检测)
4. 位置是否溢出 (clamp 到视口内)

**性能优化**：
- 距离检测优先，超出距离直接返回不计算投影
- 使用 `display: none` 而非 `visibility: hidden`，避免布局计算

---

#### 4. 肉鸽模式设计要点

**随机性控制**：
- 碎片位置：随机但避开中心区域
- 碎片类型：按概率分布（普通50%、稀有25%、史诗15%、传说10%）
- 建筑位置：固定位置，但类型可轮换

**进度保存**：
- 隐喻碎片收集状态持久化
- 挑战历史记录
- 用户年龄系统

---

#### 5. TypeScript 类型安全

**枚举 vs 字符串字面量**：
```typescript
// 推荐：使用枚举
enum FragmentRarity {
  Common = 'common',
  Rare = 'rare'
}

// 避免：字符串字面量容易出错
const rarity: string = 'commmon' // 拼写错误不会报错
```

**类型守卫**：
```typescript
if (child instanceof THREE.Mesh) {
  child.geometry.dispose()
  // TypeScript 知道 child 是 Mesh，可以安全访问
}
```

---

### 🛠️ 代码规范建议

1. **构造函数必须完成对象初始化**
   - 创建对象 → 配置属性 → 添加到父容器

2. **dispose 方法必须清理所有资源**
   - 移除 DOM 元素
   - 从场景中移除
   - 释放几何体和材质

3. **更新方法参数设计**
   - 需要角色位置时作为可选参数传入
   - 保持向后兼容

4. **CSS 全局样式谨慎使用**
   - 使用 `:global()` 明确标识
   - 添加注释说明用途

---

### 📚 相关文件

- `src/game/PlazaElement.ts` - 广场建筑类
- `src/game/MemoryFragment.ts` - 碎片类
- `src/game/Book.ts` - 书籍类
- `src/components/PlazaScene.vue` - 广场场景组件
- `src/router/index.ts` - 路由配置

---

*最后更新：2026-04-15*
