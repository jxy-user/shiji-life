# 技术 PRD｜拾己 · LIFE

版本：0.1.0  
定位：MVP 技术实现基线；先检查现有仓库，按需落地。

## 1. 技术目标

- 快速交付可玩的垂直切片。
- 产品规则可测试，剧情数据可配置。
- AI 能力与游戏引擎解耦。
- 后续可从本地存档平滑迁移到数据库。
- 保护玩家数据和 AI 密钥。
- 避免首版引入完整 2D 游戏引擎带来的复杂度。

## 2. 推荐技术栈

| 层 | 推荐 | 说明 |
|---|---|---|
| 前端 | React + TypeScript + Vite | Web 应用，组件化 |
| UI | Tailwind CSS | 快速构建界面 |
| 动效 | Framer Motion | 轻量转场和精灵动画 |
| 场景 | CSS/DOM + 2D 图片 | MVP 不做复杂寻路 |
| 状态管理 | Zustand 或 React Context | 先选一种，避免重复 |
| 数据校验 | Zod | 表单、API、LLM 输出校验 |
| 后端 | Node.js + TypeScript | REST API；若采用全栈框架可另行论证 |
| ORM | Prisma | 数据模型与迁移 |
| 数据库 | PostgreSQL | 正式持久化 |
| AI | Provider Adapter | 模型供应商可替换 |
| 测试 | Vitest + React Testing Library；API 集成测试 | 按项目需要选型 |

技术选型说明：如果当前仓库已经使用 Next.js、NestJS 或其他成熟栈，先分析复用价值，不要机械迁移。MVP 允许先做纯前端 mock 版，但 AI API Key 不得放在前端。

## 3. 建议仓库结构

```text
shiji-life/
├── AGENTS.md
├── README.md
├── docs/
├── public/
│   ├── images/
│   ├── characters/
│   └── audio/
├── src/
│   ├── app/                 # 应用入口、路由、全局布局
│   ├── components/          # 通用 UI
│   ├── features/
│   │   ├── onboarding/
│   │   ├── city/
│   │   ├── scenes/
│   │   ├── events/
│   │   ├── npc/
│   │   ├── guide/
│   │   ├── experiences/
│   │   ├── reflections/
│   │   ├── insights/
│   │   ├── journal/
│   │   └── actions/
│   ├── game/
│   │   ├── engine/
│   │   ├── rules/
│   │   ├── events/
│   │   └── state/
│   ├── data/                 # 静态 JSON/TS 内容
│   ├── services/
│   ├── stores/
│   ├── types/
│   └── utils/
├── server/                   # 若采用独立 API
│   ├── routes/
│   ├── services/
│   ├── ai/
│   └── middleware/
├── prisma/
│   └── schema.prisma
├── tests/
└── package.json
```

可根据实际框架调整，但必须保持功能模块边界清晰。

## 4. 核心架构边界

### 游戏引擎
负责：
- 事件触发条件。
- 选项合法性。
- 游戏时间、精力等状态变化。
- 分支跳转和剧情解锁。
- 存档一致性。

禁止让 LLM 决定上述规则。

### 经历服务
负责：
- 将游戏行为转成经历记录。
- 记录来源、授权状态和时间。
- 查询阶段回顾所需经历。
- 处理撤回授权和删除。

### AI 服务
负责：
- 读取已授权经历。
- 生成候选观察。
- 生成微光对话建议。
- 对输出做 schema 校验和证据 ID 校验。

AI 服务不能直接更新游戏状态或正式认知档案。

### 认知档案服务
负责：
- 保存玩家确认的认知。
- 修改、删除、撤销确认。
- 维护来源和版本历史。

只有玩家确认操作才能创建正式认知记录。

## 5. 核心数据模型（建议）

### User / PlayerProfile
- id
- nickname
- avatar_id
- life_stage（可选）
- exploration_topic（可选）
- created_at / updated_at

### GameSave
- id
- user_id
- chapter_id
- current_location_id
- game_day
- energy
- state_json
- updated_at

### LifeExperience
- id
- user_id
- event_id（nullable）
- location_id
- experience_type
- choice_id（nullable）
- player_reason（nullable）
- player_feeling（nullable）
- outcome_json
- analysis_consent
- created_at
- deleted_at（nullable）

### InsightCandidate
- id
- user_id
- title
- description
- hypothesis
- evidence_ids（建议关联表，不建议长期只存 JSON）
- status：pending / confirmed / modified / rejected / deleted
- prompt_version
- model_name（可选）
- created_at

### ReflectionSession
- id
- user_id
- trigger_type
- status：invited / accepted / postponed / declined / completed
- started_at / completed_at
- cooldown_until

### ReflectionMessage
- id
- session_id
- role
- content
- created_at

### SelfInsight
- id
- user_id
- category
- title
- content
- source_candidate_id
- status：confirmed / archived / deleted
- confirmed_at
- updated_at

### RealWorldAction
- id
- user_id
- insight_id（nullable）
- title
- description
- status：planned / in_progress / completed / paused / abandoned
- due_at（nullable）
- reflection（nullable）
- created_at / updated_at

实际数据库设计应补充外键、索引、用户隔离和迁移脚本。

## 6. API 边界（建议）

- `GET /api/player/profile`
- `PUT /api/player/profile`
- `GET /api/game/save`
- `PUT /api/game/save`
- `GET /api/events/:eventId`
- `POST /api/experiences`
- `GET /api/experiences`
- `PATCH /api/experiences/:id/consent`
- `DELETE /api/experiences/:id`
- `POST /api/reflections/evaluate`
- `POST /api/reflections/:id/respond`
- `POST /api/reflections/:id/messages`
- `POST /api/insights/:id/confirm`
- `PATCH /api/insights/:id`
- `DELETE /api/insights/:id`
- `POST /api/actions`
- `PATCH /api/actions/:id`

若 MVP 先用本地数据，可先定义相同接口的 service contract，避免 UI 直接耦合 localStorage。

## 7. 阶段回顾算法（MVP）

1. 查询玩家明确允许用于分析的有效经历。
2. 排除已删除、撤回授权、无效或重复记录。
3. 检查配置阈值：默认至少 5 条经历、至少 2 类。
4. 检查回顾冷却和玩家偏好。
5. 将最小必要经历摘要交给 AI 分析器。
6. AI 返回候选观察和 evidence IDs。
7. 服务端验证 evidence IDs 均属于当前用户且仍授权。
8. 若无有效观察，不打扰玩家。
9. 若有观察，创建候选项并邀请玩家。
10. 玩家确认后，写入 SelfInsight。

阈值是产品参数，不是心理学依据。可在配置中调整。

## 8. LLM 输出契约（建议）

```ts
type InsightAnalysisResult = {
  hasInsight: boolean;
  observations: Array<{
    title: string;
    description: string;
    hypothesis: string | null;
    evidenceIds: string[];
    uncertainty: string;
    questionForPlayer: string;
  }>;
  insufficientEvidenceReason?: string;
};
```

使用 Zod 校验：
- 限制字符串长度和观察条数。
- `evidenceIds` 必须来自输入白名单。
- 不允许输出诊断标签。
- `hasInsight=false` 时 observations 必须为空。
- 校验失败时安全降级，不展示原始模型输出。

## 9. 安全与隐私

- AI 调用必须在服务端。
- API 需要用户身份验证和数据所有权检查。
- 数据库查询必须按 user_id 隔离。
- 日记默认不进入 AI 上下文。
- 只发送玩家授权且与当前任务相关的最少数据。
- 日志不得记录 API Key、完整私人日记或不必要的敏感内容。
- 提供删除/撤回授权机制；删除后的数据不得继续用于未来分析。
- 防范 prompt injection：玩家输入和剧情文本均作为数据，不作为系统指令。
- AI 输出不可信，必须校验。
- 需要明确的数据保留、备份和删除策略；正式上线前补充隐私政策和法律审查。

## 10. 性能与可靠性

- 首屏和地图资源按需加载。
- 图片使用合理尺寸和压缩格式。
- 事件 JSON 在加载时做 schema 校验。
- 游戏状态更新采用确定性 reducer/service。
- AI 请求有超时、重试上限和错误提示。
- AI 不可用时，游戏主体仍可正常游玩。
- 本地存档定期保存，关键变更后即时保存。
- 数据库迁移可重复验证，避免破坏性迁移。

## 11. 测试策略

- 单元测试：事件分支、精力变化、回顾阈值、授权过滤、证据验证。
- 组件测试：角色创建、事件选择、回顾邀请、认知确认。
- 集成测试：经历写入 → 触发判断 → AI 候选 → 玩家确认 → 认知档案。
- 安全测试：跨用户读取、撤回授权后再次分析、伪造 evidence ID、超长输出。
- 端到端测试：新玩家完成首章。
