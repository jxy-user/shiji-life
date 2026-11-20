# 拾己 · LIFE

> 以模拟人生为外壳，以自我认知为核心，以现实行动为落点的 2D 互动人生探索游戏。

玩家在「未完成之城」里自由生活、探索区域、与 NPC 互动并做出选择。系统在玩家授权的范围内记录经历；AI 引路人「微光 Lumi」在阶段节点邀请玩家回顾，提出有证据、可被纠正的观察。只有玩家亲口确认的内容，才会进入正式认知档案。

**这不是心理测评、诊断或治疗工具，也不会给玩家贴标签。**

## 当前状态

M1（首章可玩）已完成：开场、角色创建、城市地图、四个可进入区域、微光首次对话、本地存档与章节完成反馈。
人生档案、日记、现实行动、阶段回顾仍是占位页（M3 起实现）。

产品与技术基线见 `docs/`，开发总则见 `AGENTS.md`。

> 路由使用 HashRouter（地址形如 `/#/city`）。原因：Qoder Sites 为静态托管，直接访问 `/city` 会 404。

## 技术栈

| 层 | 选型 |
|---|---|
| 构建 | Vite 8 + TypeScript 7 |
| 界面 | React 19 + Tailwind CSS 4 |
| 路由 | React Router 7 |
| 状态 | Zustand 5 |
| 校验 | Zod 4 |
| 测试 | Vitest 5 + Testing Library |
| 静态检查 | oxlint |

## 开始开发

```bash
npm install        # 安装依赖
npm run dev        # 启动开发服务器，默认 http://localhost:5173
```

## 常用命令

```bash
npm run dev        # 开发服务器（支持局域网访问）
npm run build      # 类型检查 + 生产构建，产物在 dist/
npm run preview    # 预览构建产物
npm run typecheck  # 仅类型检查
npm run lint       # 静态检查
npm test           # 单元测试（单次）
npm run test:watch # 单元测试（监听）
```

交付前应至少跑通：`npm run typecheck && npm run lint && npm test && npm run build`。

## 环境变量

当前版本**不需要任何环境变量**，也没有后端密钥。

接入真实 AI（M4）时的硬性约束：

- 模型密钥只放在服务端环境变量中，**禁止**写入前端代码、`VITE_` 前缀变量或仓库；
- 本地如需配置，复制 `.env.example` 为 `.env`（该文件已被 `.gitignore` 忽略）。

## 目录结构

```text
├── AGENTS.md              # AI 协作总则（每次任务的必读上下文）
├── docs/                  # 产品、技术、玩法、路线图文档
├── public/                # 静态资源（favicon 等）
├── src/
│   ├── app/               # 应用入口与路由表
│   ├── components/        # 通用 UI
│   ├── pages/             # 页面（占位页随里程碑逐步替换）
│   ├── services/          # 数据访问层（当前为 localStorage 存档）
│   ├── stores/            # 全局状态（Zustand）
│   ├── test/              # 测试初始化
│   └── types/             # 领域类型（经历、认知卡片、区域等权威定义）
└── vitest.config.ts
```

## 设计约定

- 视觉基调：温暖、克制、轻奇幻、生活化；不使用测评仪表盘、分数或排名。
- 叙事文字用宋体栈，界面文字用黑体栈，避免加载网络字体。
- 颜色与字体令牌集中在 `src/index.css` 的 `@theme` 中，组件里不写死色值。
- 正文小字对比度不低于 4.5:1；交互元素保留可见焦点环；尊重 `prefers-reduced-motion`。

## 隐私原则（摘要）

详见 `docs/PRODUCT_PRD.md` 第 8 节与 `docs/AI_REFLECTION_SYSTEM.md`。

- 只收集完成功能所需的经历数据，日记默认不进入任何分析。
- 玩家可随时拒绝回顾、撤回授权、删除经历或关闭分析。
- 游戏规则由前端引擎决定，AI 不得修改游戏状态或写入正式认知档案。

## 文档索引

1. `AGENTS.md`：项目总规则与 AI 协作方式
2. `docs/PROJECT_CONTEXT.md`：产品背景与已确认决策
3. `docs/PRODUCT_PRD.md`：完整产品需求
4. `docs/TECHNICAL_PRD.md`：技术架构、模块、数据与接口
5. `docs/GAMEPLAY_AND_STORY.md`：城市、章节、NPC 与事件设计
6. `docs/AI_REFLECTION_SYSTEM.md`：阶段反馈与人生回响系统
7. `docs/ROADMAP_AND_ACCEPTANCE.md`：里程碑、优先级与验收标准
8. `docs/DECISIONS_AND_OPEN_QUESTIONS.md`：已确认事项与待决事项
