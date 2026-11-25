# 拾己 · LIFE

> 一款以「人生抉择」为核心的网页互动叙事游戏：从 18 岁走到 60 岁，做出 11 个重大抉择，最后回看这一生。

## 当前状态

主线已完成，结构为：

```
门厅（推门）→ 人生线 18→60（11 个抉择）→ 回放（逐条播报 + 关键词）
```

- **门厅**：SVG（可缩放矢量图）绘制的旧城门，镜头由远及近，推门后进入人生线
- **人生线**：11 个年龄节点，每选一项推进一段剧情；分段动画 + 打字机 + 音效
- **回放**：逐条播放所有选择，结尾给出倾向关键词

**这不是心理测评、诊断或治疗工具，也不会给玩家贴标签，不给选择打分。**

## 技术栈

| 层 | 选型 |
|---|---|
| 构建 | Vite 8 + TypeScript 7 |
| 界面 | React 19 + Tailwind CSS 4 |
| 路由 | React Router 7（HashRouter 哈希路由） |
| 状态 | Zustand 5 |
| 测试 | Vitest 5 + Testing Library |
| 静态检查 | oxlint |
| 离线 | vite-plugin-pwa（渐进式网页应用） |

## 开始开发

```bash
npm install        # 安装依赖
npm run dev        # 启动开发服务器，默认 http://localhost:5173
```

## 常用命令

```bash
npm run dev        # 开发服务器
npm run build      # 类型检查 + 生产构建，产物在 dist/
npm run preview    # 预览构建产物
npm run typecheck  # 仅类型检查
npm run lint       # 静态检查
npm test           # 单元测试（单次）
npm run test:watch # 单元测试（监听）
```

交付前应至少跑通：`npm run typecheck && npm run lint && npm test && npm run build`。

## 目录结构

```text
├── AGENTS.md              # AI 协作总则
├── docs/                  # 产品、技术、玩法、路线图文档
├── public/                # 静态资源（图标等）
├── src/
│   ├── app/               # 应用入口与路由表
│   ├── components/
│   │   ├── effects/       # 电影画框、火花、极光
│   │   ├── life/          # 人生线图标、年龄轴、打字机、音效开关
│   │   ├── pwa/           # 更新/离线提示
│   │   ├── start/         # 门厅城门场景
│   │   └── ui/            # 线性图标
│   ├── data/lifeStory.ts  # 11 个节点与选项
│   ├── pages/             # 门厅、人生线、回放
│   ├── services/sound.ts  # Web Audio 合成音效
│   ├── stores/useLifeStore.ts # 人生线存档
│   └── test/              # 测试初始化
└── vitest.config.ts
```

## 设计约定

- 视觉基调：墨色 + 暖光；标题用宋体，界面用系统无衬线。
- 颜色与字体令牌集中在 `src/index.css` 的 `@theme` 中，组件里不写死色值。
- 正文小字对比度不低于 4.5:1；交互元素保留可见焦点环；尊重 `prefers-reduced-motion`（减少动态效果）。
- 动画优先，文字尽量以播放方式呈现；不过度堆叠光效。

## 隐私原则（摘要）

- 所有数据只保存在本设备浏览器（`localStorage`），没有后端，也不上传。
- 玩家可以在门厅页脚「清除本地数据」，一次清空人生进度、旧版存档与音效偏好。
- 选择前不透露结果或归类；倾向统计只在最终回放出现。

## 已移除

旧版「未完成之城」城市生活（城市/场景/事件/档案/行动/日记/人物/回顾/建角/开场）已于 2026-11-25 删除。相关旧文档保留在 `docs/` 作为历史资料，并已标注「已移除」或「已过时」。

## 文档索引

0. `docs/PROGRESS_AND_HANDOFF.md`：**进度与协作交接**——多人协作前先读这一页
1. `AGENTS.md`：项目总规则与 AI 协作方式
2. `docs/PRODUCT_PRD.md`：产品定位、旅程、页面与验收
3. `docs/GAMEPLAY_AND_STORY.md`：11 个节点、选项与结局
4. `docs/PROJECT_CONTEXT.md`：背景与已确认决策
5. `docs/ROADMAP_AND_ACCEPTANCE.md`：里程碑与验收标准
6. `docs/TECHNICAL_PRD.md`：技术架构（部分旧模块已过时）
7. `docs/AI_REFLECTION_SYSTEM.md`：旧版回顾系统（**已移除**，保留原则作参考）
8. `docs/DECISIONS_AND_OPEN_QUESTIONS.md`：已确认事项与待决事项
