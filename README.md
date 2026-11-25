# 拾己 · LIFE｜未完成之城

一个以「洛圣都日光 · 城市拼贴」为视觉语言的 PC 桌面生活叙事应用。当前版本使用 React、Vite 与 TypeScript 完整重建，数据只保存在本机浏览器，不上传个人经历。

## 用 Qoder 构建

本项目的编码工作主要使用 **Qoder** 完成：页面、组件、动效、状态、测试与修复；构建与部署使用 **Qoder Sites**。完整说明见 [`docs/QODER_USAGE.md`](docs/QODER_USAGE.md)，可核验的提交与部署证据见 [`docs/QODER_EVIDENCE.md`](docs/QODER_EVIDENCE.md)。

## 运行

要求 Node.js 20.19+，推荐 Node.js 24 LTS。

```bash
npm install
npm run dev
```

开发地址默认为 `http://127.0.0.1:5173`。

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

`npm run check` 会依次执行类型检查、Lint、单元/组件测试与生产构建。最终可部署产物在 `dist/`。浏览器验收使用：

```bash
npm run check
npm run test:e2e
```

Playwright 会启动生产预览，并分别在 Chromium 与 Firefox 运行旅程、可访问性、桌面视觉、性能与部署测试。

## 页面

| 页面 | 路由 |
| --- | --- |
| 开始 | `/` |
| 序章 | `/prologue` |
| 新建旅程 | `/create` |
| 城市 | `/city` |
| 场景 | `/scene/:sceneId` |
| 事件 | `/event/:eventId` |
| 阶段回顾 | `/reflection` |
| 人生档案 | `/archive` |
| 私人日记 | `/journal` |
| 现实行动 | `/actions` |
| 设置 | `/settings` |

城市包含中央广场、家、校园、街区、公园、工作室、港口与远方八个目的地。微光对话作为全局浮层接入旅程。

## 已实现的功能

- 全新旅程、继续旅程、序章与角色登记。
- 城市地图、场景探索、事件三选一及幂等落盘。
- 逐条经历授权、撤回授权、软删除与恢复。
- 三经历、两场景类别的阶段回顾阈值。
- 认知猜测、确认、否认与改写，并提示来源观察已变化。
- 日记新建、编辑、筛选、场景关联、行动复盘关联与删除。
- 行动完整状态机：待办、进行中、暂停、已完成、再做一次。
- 完成行动时自动生成至多一条复盘日记。
- 默认授权、邀请开关、本地数据统计、存储状态与仅清空 v2 的重置。
- 路由深链接、原生对话框、键盘操作、焦点返回与减少动态效果支持。

## 数据与隐私

- 当前存档键为 `shiji.life.v2`，通过 Zod 校验。
- 不读取、不迁移旧版 `shiji.life.v1`。
- 新建旅程只覆盖 v2；设置中的重置也只清除 v2。
- 每条经历独立保存授权状态，私人日记不进入城市周报或阶段回顾。
- 存储状态明确区分为可读取、存档损坏与存储不可用。

## 桌面布局（仅 PC）

- 视口锁定 `width=1280`，移动端不做单独适配。
- 内容最大宽度 1320px；`≥1600px` 时放宽到 1480px。
- `≥1200px`：224px 墨色侧栏。
- `960–1199px`：72px 紧凑侧栏。
- 顶部档案条 64px，交互目标不小于 44px。

## 视觉与资产

G 方向使用米白新闻纸、墨黑、阳光黄、信号红、天空蓝与苔绿，结合半调网点、撕纸边、胶带、硬阴影和原创代码地图。信号红只用于图钉、编号与小印章；产品警告使用琥珀色。禁止玻璃拟态、紫粉配色、emoji、外部字体 CDN 与官方游戏资产。

15 张头像与场景插画由 Sharp 生成响应式 WebP。源图位于 `assets/img/`，变体位于 `assets/img/webp/`。

```bash
npm run assets:optimize
```

页面通过 `ArtImage` 输出 `src`、`srcSet` 与 `sizes`。城市地图、纹理、印章与图形元素均由 CSS/SVG 代码生成。

## 工程结构

```text
src/
├─ app/                 # 路由与受保护页面
├─ components/          # G 原语、表单、反馈、桌面壳层
├─ data/                # 地点、事件、对话、认知与资产映射
├─ domain/              # 类型、Zod schema、状态机与选择器
├─ features/            # 按业务页面拆分
├─ store/               # Zustand 游戏状态、临时 UI 状态与持久化
└─ styles/              # 全局令牌、基础样式与动态效果
tests/
├─ unit/                # 领域与状态测试
├─ components/          # React 交互测试
└─ e2e/                 # Playwright 浏览器验收
scripts/
└─ optimize-assets.mjs  # 响应式 WebP 生成
```

主要依赖为 React 19、React Router 7、Vite 7、Zustand 5、Zod 4 与 Lucide React。测试使用 Vitest、Testing Library、Playwright 与 axe；不使用外部 UI 组件库或字体服务。

## 部署

生产构建使用 BrowserRouter，部署在 **Qoder Sites**（静态托管）。`public/_redirects` 已提供 SPA 回退与缺失资源 404：

```text
/assets/* /404.html 404
/* /index.html 200
```

将 `dist/` 完整上传到静态站点根目录。部署到子路径时，在构建前设置 `VITE_BASE_URL`；Windows PowerShell 使用：

```powershell
$env:VITE_BASE_URL = '/shiji/'
npm run build
npm run preview -- --port 4174
```

Git Bash 需要避免 MSYS 自动改写路径：

```bash
MSYS_NO_PATHCONV=1 VITE_BASE_URL=/shiji/ npm run build
MSYS_NO_PATHCONV=1 VITE_BASE_URL=/shiji/ npm run preview -- --port 4174
```

预览地址为 `http://127.0.0.1:4174/shiji/`。构建和预览必须使用相同的 `VITE_BASE_URL`；Router basename、资源地址和深链接回退都依赖该值。其他托管平台需自行配置与 `public/_redirects` 等价的规则。

## 设计文档

- `docs/QODER_USAGE.md`：Qoder 在项目中的使用方式与分工。
- `GTA_UI_DIRECTION.md`：G 视觉方向与保留的 H 档案。
- `GTA_G_UI_SPEC.md`：桌面信息架构、设计令牌与组件合同。
- `MOTION_SYSTEM.md`：动效系统与节拍规则。
- `specs/gta-ui/style-contract-g.yaml`：机器可读的 G 视觉合同。
