# 拾己 · LIFE｜G PC 桌面 UI 规范

> 状态：当前实现规范。
> 平台：仅 PC，视口锁定 1280；移动端不再适配。
> 编码：规范由 Qoder 落地为组件与样式，见 `docs/QODER_USAGE.md`。
> 技术：React 19、React Router 7、Vite 7、TypeScript、Zustand、Zod、CSS Modules。
> 视觉：洛圣都日光 · 城市拼贴。
> 机器可读合同：`specs/gta-ui/style-contract-g.yaml`。

## 1. 实现原则

1. 桌面原生重排，不缩放移动概念图。
2. 功能、可访问名称与领域规则稳定，视觉由统一 G 令牌驱动。
3. 新旅程使用 `shiji.life.v2`，不读取或迁移 v1。
4. 装饰不能承担唯一信息表达，拿掉装饰后流程仍完整。
5. 本地优先、隐私优先、无外部字体或资产请求。

## 2. 布局合同

| 令牌 | 值 | 说明 |
|---|---:|---|
| `--g-sidebar-width` | 224px | 完整桌面侧栏 |
| `--g-sidebar-compact` | 72px | 960–1199px 图标栏 |
| `--g-archive-height` | 64px | 不透明顶部档案条 |
| `--g-content-max` | 1320px | 主内容最大宽度 |
| `--g-context-width` | 304px | 上下文栏 |

断点：

- `≥1200px`：完整侧栏与桌面内容网格。
- `960–1199px`：72px 侧栏；隐藏品牌文字、导航文字与存储说明，保留可访问名称。
- `<960px`：不提供移动布局；视口锁定 `width=1280`，窗口过窄时保持紧凑侧栏。
- 仅支持 PC，最小设计宽度 1280。

主内容区使用 `minmax(0, 1fr)`，防止长文本和表格撑破布局。页面标题、操作区和内容区在桌面左对齐。

## 3. 设计令牌

令牌定义于 `src/styles/tokens.css`。

### 3.1 颜色

```css
--g-paper: #f4ebd8;
--g-paper-deep: #e8ddc6;
--g-paper-light: #fff8e9;
--g-ink: #141414;
--g-ink-soft: #5b564c;
--g-sun: #f2b705;
--g-signal: #d6422b;
--g-signal-deep: #a93222;
--g-sky: #a9c9d8;
--g-asphalt: #4a4a45;
--g-grass: #7c8b5a;
--g-grass-deep: #4f5e35;
--g-warn: #c58f47;
--g-disabled: #8c8277;
```

信号红只用于图钉、编号与小印章。需要文字级信号红时使用 `--g-signal-deep`，苔绿文字使用 `--g-grass-deep`；删除、失败和警告使用墨色或琥珀。

### 3.2 几何与材质

- 小圆角 4px，卡片 8px，对话框 10px。
- 主边框 2px 墨色。
- 硬阴影 `4px 4px 0 rgba(20,20,20,.35)`。
- 半调网点为 6px 网格的径向渐变，装饰透明度约 32%。
- 撕纸边使用 `clip-path`，不做图片纹理。
- 禁止玻璃模糊、渐变光晕、紫粉配色、纯白卡片与大圆角。

### 3.3 字体

```css
--g-font-display: "Noto Sans SC", "Source Han Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif;
--g-font-body: "Noto Sans SC", "Source Han Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif;
--g-font-mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
```

正文 16px / 1.75，标题 900 字重，页面标题 `clamp(34px, 4vw, 52px)`。不请求外部字体。

### 3.4 间距与动态

间距为 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px。

- 快速反馈 120ms。
- 页面入场 220ms；封面拼贴 360ms。
- 动效只改变透明度与 transform。
- `prefers-reduced-motion: reduce` 时所有动画和过渡降至 0.01ms。

## 4. 壳层

实现：`src/components/shell/Shell.tsx`、`Shell.module.css`。

### 4.1 JourneyLayout

- 跳过链接指向 `#main-content`。
- 左侧墨色品牌与六项主导航。
- 当前导航黄底墨字，带 2px 边框和硬阴影。
- 存档状态同时显示彩色圆点与文字，不只依赖颜色。
- 64px 档案条显示返回、页面编号、标题、天数、时段与精力。
- 主内容 `tabIndex={-1}`，路由变化时回到顶部。

### 4.2 OnboardingLayout

- 68px 纸底页眉，包含品牌、本地保存说明和设置入口。
- 开始、序章、建角共用内容容器和存储提示。
- 不显示旅程侧栏。

### 4.3 PageHeading

- 页面编号、主标题、说明与操作区。
- 桌面底部对齐；窄屏改为纵向排列。

## 5. 共享组件

| 文件 | 组件 | 合同 |
|---|---|---|
| `GPrimitives.tsx` | `PaperSheet` | 纸面、可选撕边与半调 |
|  | `PaperButton` | 48px 默认高度、44px 小尺寸、四种意图 |
|  | `PaperTag` | 可交互时 44px，支持 `aria-pressed` |
|  | `Stamp` | 状态章，不做胶囊 |
|  | `Pin` | 装饰图钉，`aria-hidden` |
|  | `Halftone` | 装饰网点，`aria-hidden` |
|  | `EmptyPaper` | 标题、说明、可选下一步 |
| `ArtImage.tsx` | `ArtImage` | 强制 `artKey` 与 `sizes`，输出响应式图片 |
| `FormPrimitives.tsx` | `Field` / `ChoiceGroup` / `SwitchRow` | 持久标签、字段错误、键盘可操作 |
| `Feedback.tsx` | `ModalSheet` / `ConfirmDialog` | 原生 `<dialog>`、Escape、Tab/Shift+Tab 焦点约束与返回 |
|  | `ToastRegion` / `StorageNotice` | 非阻塞反馈与明确存储状态 |
| `DialoguePanel.tsx` | `DialoguePanel` | 全局微光脚本浮层 |

受控 `ModalSheet` 不使用原生 `close` 事件调用父级 `onClose`，避免父级关闭时重复回调和覆盖路由参数。用户关闭通过取消事件、关闭按钮或遮罩完成。

## 6. 页面合同

### 6.1 开始 `/`

- 桌面封面拼贴：角色/存档卡、夜雨房间、原创地图与城市周报。
- 有可继续存档才显示继续入口。
- 存储损坏与不可用分别提示，不静默覆盖。
- 主操作使用阳光黄纸按钮。

### 6.2 序章 `/prologue`

- 五幕夜雨叙事，保留选择、回复与进度点。
- 支持空格推进和明确的操作按钮。
- 跳过序章仍需完成建角，不直接生成不完整存档。

### 6.3 建角 `/create`

- 昵称、四头像、人生状态与探索主题。
- 头像使用 `ArtImage`，显示尺寸约 88–112px。
- 空昵称回退为「旅人」，昵称最大 8 字。
- 主题可跳过；提交后创建全新 v2。

### 6.4 城市 `/city`

- 原创 CSS/SVG 城市地图，八个地点：广场、家、校园、街区、公园、工作室、港口、远方。
- 地图热点与语义地点索引提供等价入口。
- 显示天数、时段、精力和探索记录。
- 微光邀请可关闭；不展示金钱、通缉或任务感叹号。

### 6.5 场景 `/scene/:sceneId`

- 场景插画、标题、叙事、行动记录与事件入口。
- 无效地点显示明确的空状态，不访问不存在的数据。
- 探索状态与进度写入 v2。

### 6.6 事件 `/event/:eventId`

- 三个选择，每个选择可附加理由。
- 完成时立即显示结果，并生成唯一经历。
- 授权使用提交时快照，不跟随之后修改的默认设置。
- 刷新后保持完成状态，不重复创建经历。

### 6.7 阶段回顾 `/reflection`

- 固定阈值：三条已授权且未删除的经历，覆盖两个场景类别。
- 授权账本允许逐条撤回。
- 猜测卡片支持确认、否认与改写。
- 来源授权撤回或观察变化时提示需要重新判断。
- 私人日记不参与阈值，也不自动成为认知来源。

### 6.8 人生档案 `/archive`

- 顶部角色条，经历时间线，深链接与阶段总结。
- 经历支持授权切换、软删除与恢复。
- 可将经历转化为行动，保留来源标签。
- 认知索引区分猜测、已确认、已否认与已改写。
- 总结可生成和编辑，保存到 v2。

### 6.9 日记 `/journal`

- 左侧日期/类型索引，右侧读者与编辑器。
- 四种筛选：全部、自由记录、行动复盘、关联认知。
- 支持 `?new=1`、`?scene=` 与 `?id=`。
- 新建成功后设置 `?id=`，编辑后保持当前 id。
- 可选关联场景、行动或认知。
- 删除使用 `ConfirmDialog`；日记始终是私人记录。

### 6.10 现实行动 `/actions`

- 筛选待办、进行中、暂停和已完成。
- 合法转移：
  - 待办 → 进行中 / 暂停。
  - 进行中 → 暂停 / 已完成。
  - 暂停 → 进行中。
  - 已完成 → 待办。
- 完成时自动生成至多一条复盘日记。
- 再次完成不会重复生成同一行动的复盘。
- 支持 `?new=1`、`?title=` 与 `?insight=`。
- 删除行动保留日记并解除关联。

### 6.11 设置 `/settings`

- 默认经历授权与邀请开关。
- 只读阈值尺，不提供虚假可调控件。
- 显示真实经历、认知、行动、日记与存储占用状态。
- 两步确认后仅清除 v2，v1 保持原样。

### 6.12 微光对话

- 作为全局浮层接入，不单独占路由。
- 头像 44px，显示讲述者层级与当前脚本。
- 可键盘推进；关闭或完成后恢复焦点。

## 7. 数据与状态合同

### 7.1 领域层

- `src/domain/types.ts`：Profile、Progress、Experience、Insight、Action、Journal 等领域类型。
- `schema.ts`：Zod 校验存档和表单。
- `actionStateMachine.ts`：行动合法转移的唯一实现。
- `selectors.ts`：回顾资格、可用经历与派生统计。

### 7.2 状态层

- `gameStore.ts`：持久化领域状态与业务操作。
- `uiStore.ts`：Toast、对话等临时 UI 状态，不写入存档。
- `persistence.ts`：只访问 `shiji.life.v2`。
- 存储状态为 `ready | broken | unavailable`。
- 浏览器 `storage` 事件同步同源其他标签页的 v2 状态。

### 7.3 业务不变量

- 事件完成幂等。
- 每条经历独立授权，授权时间可追踪。
- 私人日记不进入回顾或城市周报。
- 行动复盘至多一条。
- 删除行动不删除私人日记。
- 新旅程覆盖 v2，不触碰 v1。

## 8. 响应式图片

- 源插画：`assets/img/` 下 15 张 JPG。
- 生成脚本：`scripts/optimize-assets.mjs`。
- 输出：`assets/img/webp/` 下 37 个 WebP。
- 映射：`src/data/assets.ts`。
- 渲染：`src/components/g/ArtImage.tsx`。

脚本清理并重建 WebP 目录；不要手工编辑生成文件。调整尺寸后运行：

```bash
npm run assets:optimize
npm run build
```

所有页面插图必须通过 `ArtImage`，不能退回原始 JPG 或遗漏 `sizes`。

## 9. 可访问性

- 文本对比度至少 4.5:1。
- 可点击目标至少 44×44px。
- 图标按钮有可访问名称，装饰图标 `aria-hidden`。
- 焦点可见，不因硬阴影或装饰被遮挡。
- 对话框使用原生语义，支持 Escape、Tab 焦点约束与焦点返回。
- 表单错误与字段关联，状态反馈使用 `aria-live`。
- 地图提供语义地点索引，不只依赖图形热点。
- 减少动态效果偏好得到尊重。

## 10. 性能与部署

目标：

- 初始 JS gzip ≤200KB。
- 路由 chunk gzip ≤60KB。
- LCP ≤2.5s，CLS ≤0.1，INP ≤200ms。

实现策略：

- 路由级 `React.lazy` 与 Suspense。
- React、Router、状态依赖分包。
- 响应式 WebP 与明确图片尺寸。
- 无外部字体、分析脚本或第三方图片请求。
- Vite 构建、`public/_redirects` SPA 回退与缺失资源 404。
- BrowserRouter 使用 `import.meta.env.BASE_URL` 作为 basename，支持 `VITE_BASE_URL` 子路径部署。

## 11. 验证清单

- [x] `npm run check` 全部通过。
- [x] Chromium 与 Firefox 完成核心旅程。
- [x] 深链接刷新可直接进入页面。
- [x] 每条路由通过 axe 自动检查。
- [x] 1440×900、1280×800、1024×768 桌面视觉检查通过。
- [x] 视口锁定 1280；1024×768 与 200% 缩放无内容丢失（不再验收移动端）。
- [x] 键盘可完成新建、事件、日记、行动和重置。
- [x] 控制台无错误，缺失图片返回 404 而非 HTML。
- [x] `dist/` 不含旧运行代码、参考图、字体 CDN 或技能归档。
- [x] v1 从未被读取、迁移或清除。
- [x] 初始与路由 JS、LCP、CLS、INP 均满足性能预算。
- [x] `/shiji/` 子路径深链接、资源与缺失资源 404 验证通过。

## 12. 当前验证记录

2026-11-25：

- 类型检查、Lint 与 36 项单元/组件测试通过。
- Chromium 与 Firefox 共 61 项 E2E 通过；Firefox 的 Core Web Vitals 用例按设计跳过，指标在 Chromium 测量。
- 12 条路由、两个关键对话框、键盘焦点约束与减少动态效果检查通过。
- 生产包包含 72 个文件，使用 34 个响应式 WebP；源变体共 37 个，未使用的变体不进入 `dist/`。
