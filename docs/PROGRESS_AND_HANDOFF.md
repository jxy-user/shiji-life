# 进度与协作交接

> 更新于 2026-11-23。**开始任何开发前先读这一页**，再读 `AGENTS.md` 与对应章节。
> 以 `git log` 为最终事实；本文记录的是「为什么这样做」与「还差什么」。

## 一分钟了解

《拾己 · LIFE》是一款 2D 互动人生探索游戏：玩家在「未完成之城」自由生活、经历事件、做出选择；经历积累到阈值后，AI 引路人「微光 Lumi」邀请回顾，提出**带证据的候选观察**；只有玩家确认的内容才写入人生档案。

当前主入口是**人生线**：从 18 岁到 60 岁，11 个重大抉择，每选一项推进一段新剧情，结束后逐条回放并给出倾向总结（`/life`、`/life/replay`）。旧的「未完成之城」城市生活（开场、建角、城市、人物、回顾、认知、行动、日记）仍保留，从首页底部入口进入。移动端已支持 PWA（可安装、可离线）。

- 路由使用 **HashRouter**（`/#/city`），原因：Qoder Sites 静态托管没有 SPA 回退。
- 部署在 **Qoder Sites**（公网链接由 Qoder 生成，会随部署变化）。
- 仓库当前为 **公开**，提交作者使用 GitHub noreply 邮箱，无密钥入库。

## 进度表

| 里程碑 | 状态 | 内容 | 主要位置 |
|---|---|---|---|
| M0 骨架 | ✅ | Vite/React/TS/Tailwind、路由、设计令牌、开始页 | `src/app`、`src/index.css` |
| M1 首章可玩 | ✅ | 开场五幕、建角、城市地图、四个场景、微光登场、本地存档 | `src/pages/{Prologue,Create,City,Scene}Page.tsx` |
| M2 事件与经历 | ✅ | 5 个事件、选择结果、可选理由、经历记录与授权、档案 | `src/data/events.ts`、`EventPage.tsx`、`ArchivePage.tsx` |
| M3 阶段回顾 | ✅ | 阈值/冷却、授权优先、候选观察、确认与改写、认知卡片 | `src/game/reflection.ts`、`insightRules.ts`、`ReflectionPage.tsx` |
| M4 真实 AI | ⏸️ | 服务端适配层、prompt 版本、输出校验 | 暂缓（需付费计划），架构已就绪 |
| M5 行动与日记 | ✅ | 现实行动、日记、阶段总结、存档 v4 | `src/pages/{Actions,Journal}Page.tsx`、store actions、saveSchema v4 |
| PWA 移动端 | ✅ | 可安装、离线缓存、更新提示；manifest 单一来源、SW 仅生产注册、存储禁用安全降级、安装卡桌面置右下、同一时间只显示一个提示 | `vite.config.ts`、`src/hooks/usePWA.ts`、`src/services/preferences.ts`、`PWANotifications.tsx` |
| PC 端适配 | ✅ | 桌面浏览器大屏布局：开始页双栏、档案双栏、行动单列清单、各页容器加宽 | `src/pages/*`、`src/components/layout/StatusBar.tsx`、`src/components/city/CityMap.tsx` |
| 仅桌面端 | ✅ | viewport 固定 `width=1280`；移除移动端 PWA 安装引导与 `preferences.ts`；只保留更新/离线提示 | `index.html`、`src/hooks/usePWA.ts`、`src/components/pwa/PWANotifications.tsx` |
| UI 视觉重构 | ✅ | 去 AI 模板感：统一线性图标、编辑式排版、去卡片与渐变、方角按钮、克制动效 | `src/components/ui/Icon.tsx`、`src/index.css`、`src/pages/*` |
| 视觉基调（墨色暖光） | ✅ | 2026-11-24 删除 GTA6 霓虹风（粉/青绿/扫描线/网格/发光）；改为墨色底、暖白字、金铜点缀，标题回到宋体；场景/地图/微光 SVG 同步换色。首页门厅由 Qoder 设计 | `src/index.css`、`src/components/{city,scene,lumi}`、`LifePage.tsx`、`LifeReplayPage.tsx` |
| 交互动画 | ✅ | 文字→动画：人生线分段播放（场景→问题→选项，结果分两段浮现，可跳过）、年龄轴、11 个节点线条绘制图标、选项火花/高亮、结果倾向徽章；回放时间轴、进度条、倾向标签云；场景页行动结果摘要 | `src/components/life/*`、`LifePage.tsx`、`LifeReplayPage.tsx`、`ScenePage.tsx` |
| 电影感 | ✅ | 宽银幕黑边（上下 6.5vh）+ 深暗角 + 流动胶片颗粒 + 偶发划痕（`CinemaFrame`）、节点标题卡（黑场 1.4s，金线/年龄缩放/「第 N 幕」）、场景/问题/结果逐字打字机、结果前 420ms 黑场、镜头缓推（kenburns 1.10）、转场淡入（cine-in）；回放结尾做居中片尾字幕 | `src/components/effects/CinemaFrame.tsx`、`src/components/life/Typewriter.tsx`、`src/index.css`、`LifePage.tsx`、`LifeReplayPage.tsx` |
| 音效与未知感 | ✅ | Web Audio 合成音效（标题闷响/选项轻点/选中上扬/结果和弦/片尾 ding），首次点击后解锁，**带持久化开关**；**结果页不再显示选择倾向标签**（避免玩家预知类别），倾向统计只在最终回放出现 | `src/services/sound.ts`、`SoundToggle.tsx`、`LifePage.tsx`、`LifeReplayPage.tsx` |
| 可访问性与时序 | ✅ | 标题卡（1.4s）结束后才开始「场景→问题→选项」；隐藏阶段按钮 `disabled`；打字机不接 `aria-live`，改为打完一次性 `sr-only` 播报 | `LifePage.tsx`、`Typewriter.tsx` |
| 关系与行动力 | ✅ | 恋爱模拟器式骨架（非恋爱主题）：每日 3 行动力、3 位角色、理解度阶段、对话事件、人物页；存档 v5 | `src/data/characters.ts`、`src/game/relationships.ts`、`PeoplePage.tsx`、`ScenePage.tsx`、store v5 |
| 人生线 18→60 | ✅ | 单线重大抉择：11 个节点、每选推进一段新剧情、结束时逐条回放并给出倾向总结；独立存档 `shiji-life:life:v1` | `src/data/lifeStory.ts`、`LifePage.tsx`、`LifeReplayPage.tsx`、`useLifeStore.ts` |

## 常用命令

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm run lint
npm test
npm run build      # 路由级代码分割，首屏约 96 KB gzip
```

交付前必须四条全过：`typecheck`、`lint`、`test`、`build`。

## 目录与职责

| 位置 | 职责 | 注意 |
|---|---|---|
| `src/game/saveSchema.ts` | 存档模型（v5）与全部 Zod 契约 | 改字段必须升版 + 迁移 |
| `src/game/relationships.ts` | 关系阶段与行动力常量（无 zod 依赖） | 阶段只描述理解程度，不是好感 |
| `src/game/saveVersion.ts` / `saveEnums.ts` | 无依赖常量 | 首屏轻量判断用，**不要**从这里引 zod |
| `src/services/storage.ts` | 唯一的 localStorage 访问点 | 读写异常必须兜住，禁止让页面白屏 |
| `src/services/saveService.ts` | 读写校验、v1→v2→v3→v4→v5 迁移 | 迁移只补默认值，不改写已有内容 |
| `src/data/characters.ts` | 城市角色定义（名字、场景、介绍） | 角色是居民，不是攻略对象 |
| `src/services/savePeek.ts` | 首屏「有没有可继续存档」 | 轻量检查，不含 zod |
| `src/services/experienceService.ts` | 经历查询：可见 / 可分析 | M4 只能从 `getEligibleExperiences` 取数 |
| `src/stores/useGameStore.ts` | 全部游戏状态变更的入口 | 事件完成必须是**一次写盘**（`completeEvent`） |
| `src/stores/useUiStore.ts` | 写盘失败提示 | 故意不含 zod，保证首屏轻量 |
| `src/game/reflection.ts` | 回顾触发与冷却 | 阈值是可配置产品参数 |
| `src/game/insightRules.ts` | mock 观察生成器 | 必须带证据；M4 只替换这里 |
| `src/pages/ReflectionPage.tsx` | 回顾流程 | 确认前的内容不得出现在档案 |
| `src/index.css` | 设计令牌 | 含 Qoder Sites 的 `--site-*` 变量，改动前先和 Qoder 协调 |

## 存档模型（v5 当前）

### v4（当前）
- `profile`、`chapter`、`currentScene`、`gameDay`、`timeSlot`、`energy`、`flags`、`visitedScenes`
- `experiences[]`：选择、结果、类型、`choiceTags`、`analysisConsent`（默认 **关闭**）、可选 `playerReason`
- `seenEventIds[]`：一次性事件
- `reflections[]`：邀请状态、冷却游戏日、完成时间
- `candidateInsights[]`：候选观察（pending / confirmed / rejected），带 `evidenceIds`
- `insights[]`：玩家确认的认知卡片
- `actions[]`：`id`、`title`、`linkedInsightId?`、`frequency`（once/daily/weekly/custom）、`dueDate?`、`reminderTime?`、`status`（todo/in_progress/done/paused）、`createdAt`、`updatedAt`、`completedAt?`
- `journalEntries[]`：`id`、`type`（action_review/free/insight_link）、`content`、`linkedActionId?`、`linkedInsightId?`、`linkedExperienceIds?`、`createdAt`、`updatedAt`
- `chapterSummaries[]`：`id`、`chapter`、`content`、`generatedAt`、`isEdited`、`editedAt?`
- `relationships[]`（v5）：`characterId`、`affinity`（理解度 0–100）、`stage`（stranger/acquaintance/trusted/understood）、`metAtGameDay`、`updatedAt`
- `actionPoints`（v5）：当日剩余行动力（0–3），跨天恢复
- `settings`：`analysisConsentDefault`、`reflectionThreshold`（3）、`minExperienceTypes`（2）、`invitationsEnabled`

迁移规则：只迁移明确识别到的版本（1 → 2 → 3 → 4 → 5）；`0`、负数、小数、高于当前的版本一律拒绝，且**不覆盖原始字符串**。v3→v4 仅给三个新数组补 `[]`；v4→v5 仅补 `relationships: []` 与 `actionPoints: 3`，不改动既有数据。

## 产品红线（改代码前必读）

1. 不做心理诊断、不打人格标签；观察只陈述事实与猜测，并明写「这只是猜测」。
2. 只有玩家确认的内容进入认知档案；否认不留痕、不惩罚。
3. AI（当前是 mock 规则）只能读取**已授权且未删除**的经历，输出必须带证据 id。
4. AI 不得修改游戏状态；所有状态变化走 store action。
5. 玩家可拒绝回顾、撤回授权、删除经历与认知卡片；拒绝后有冷却，不重复劝说。
6. 不使用羞耻、恐惧、损失厌恶或社交比较驱动。
7. 不新增社交、排行榜、付费、经济系统、多人在线。

## 未决事项与已知限制

- **M4 真实 AI 暂缓**：Qoder Sites 当前为 Free 计划，仅支持静态站点；服务端函数、数据库、存储均需付费/高级计划。架构已就绪（`insightRules.ts` 为生成器预留接口），赛后可接入。
- **事件引擎没有多节点图**：当前一个选择对应一段结果，随即汇合回场景。与「有限分支 + 汇合」在体验上等价，但若要做多段分支，需要扩展 `eventSchema`。
- **内容量**：5 个事件，候选规则最多产出 2 条观察；演示时玩法种类有限。
- **默认授权关闭**：因此回顾页面设计了「先授权再一起看」的流程；不要为了演示顺畅偷偷改成默认开启。
- 章节完成卡与回顾邀请卡同页出现时，自动滚动会定位到章节卡（视觉上会把邀请卡顶上去），属于已知的小问题。
- 首屏判断是轻量版：极少数「字段齐全但内部结构损坏」的存档会走到城市页再弹出提示，这是有意为之（不把 zod 放进首包）。

## 协作约定

1. **先读文档再动手**：`AGENTS.md` → 本文 → 对应 PRD 章节。
2. **小步提交**，提交信息用 `feat(m3): …` / `fix(m2): …` 格式；不要用「改动1」这类信息。
3. **改存档必须**：升 `SAVE_VERSION`、在 `migrateSave` 里写显式迁移、补迁移测试。
4. **改事件完成路径必须**保持一次写盘与幂等，不允许退回分步 `commit`；幂等分支必须返回既有经历 id。
5. **候选观察 id 必须稳定**（会话 + 规则 key），否则重新生成会造成重复候选与重复认知。
6. **测试优先**：bug 用失败测试复现再修。
7. **提交前**跑四条命令并贴真实输出。
8. **交接审查**：每个里程碑完成后用 `docs/QODER_M*_REVIEW_PROMPT.md` 交给 Qoder 审查与部署，不要跳过。
9. 不直接改 `public/` 素材与设计令牌而不通知；设计与部署由 Qoder 维护。

## 下一步建议顺序

1. **主页面设计**：由 Qoder 负责，Claude 只需保持 `/life`、`/life/replay`、旧版城市入口可用，不主动改首页视觉。
2. **人生线内容与回放打磨**：补足节点文案的差异感；回放当前每条停留 6 秒（约 1 分钟），可加入年份推进与转场；保持「不做评判」的收尾。
3. **关系玩法验收（旧版）**：城市 → 人物 → 打招呼 / 角色事件 → 理解度阶段推进；确认 v4→v5 迁移不丢进度。
4. **M5 + PC 端验收与部署**：运行 `docs/QODER_M5_REVIEW_PROMPT.md` 交给 Qoder 审查并部署。
5. **PWA 部署验证**：部署后分别用「全新浏览器」和「已有安装态」各验一次。
6. M4 真实 AI（赛后，需升级 Qoder Sites 计划）。
