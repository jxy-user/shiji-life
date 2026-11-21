# Qoder 任务：审查并部署 M5「现实行动与阶段总结」

> 用法：把本文件「任务正文」以下的内容整段复制给 Qoder。

---

## 任务正文

### 背景

M5（现实行动、日记、阶段总结）已完成并提交。这是把「拾己 · LIFE」从纯回顾型产品延伸到现实微行动的关键一步：玩家把确认过的认知转化为小行动、带回现实执行、完成后复盘写日记、最后由微光基于全阶段数据生成叙事性总结。

开始前：`git pull`，阅读 `AGENTS.md`、`README.md`、`docs/ROADMAP_AND_ACCEPTANCE.md` 的 M5 小节、`docs/DECISIONS_AND_OPEN_QUESTIONS.md` 里关于 M5 直接落地的决策（跳过 M4 真 AI，因 Qoder Sites Free 仅支持静态托管）。

存档已升级到 **v4**（新增 `actions`、`journalEntries`、`chapterSummaries`），迁移链是 v1 → v2 → v3 → v4，这是本轮审查重点。

### 一、构建验证（真实执行，粘贴原始输出）

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

### 二、功能验收

准备：完成 3 个事件并确认至少 1 条认知卡片（可在控制台构造一份含认知的 v4 存档，或用 M3 的流程跑通一次）。

1. **从认知转化行动**：在「人生档案」点一张认知卡片的「转化为行动」→ 填标题、频率（一次性/每日/每周/自定义）、截止日期、提醒时间 → 保存 → 行动出现在「我的行动」列表，状态为「待办」。
2. **手动新建行动**：直接进「我的行动」页点「新建行动」→ 不选关联认知 → 同样可用。
3. **状态切换**：列表里把行动从「待办」→「进行中」→「完成」；「完成」时弹出复盘对话框（发生了什么、感受如何、符合预期吗？）。
4. **复盘自动入日记**：提交复盘后，日记里新增一条「行动复盘」类型条目，关联该行动与其关联认知。
5. **日记页**：时间线展示，三个筛选标签（全部 / 自由记录 / 行动复盘 / 关联认知），点「新建日记」可选类型并关联行动/认知/经历，条目支持行内编辑与删除。
6. **档案页「阶段总结」区**：点「生成新的阶段总结」→ 基于当前章节的经历、认知、行动、日记自动生成叙事草稿 → 可编辑后保存 → 卡片出现在列表，显示「已编辑 / 微光生成」标记与时间。
7. **旧档迁移**：用 v3 存档启动（参考 `src/stores/useGameStore.test.ts` 的 v3 样例），进度、经历、认知全保留，`actions`、`journalEntries`、`chapterSummaries` 补空数组。
8. 手机 390px 走完：创建行动 → 切状态 → 复盘 → 看日记 → 生成总结 → 编辑总结；直接访问 `/#/actions`、`/#/journal`、`/#/archive` 无白屏。

### 二·七、复审意见的修复（请逐条复核）

1. **候选重复生成与重复入档**：M3 已修复（稳定 id `${reflectionId}-${ruleKey}` + `handledIds` 过滤），本轮复核不再重复生成候选的同时不会重复写入认知。
2. **v1 存档无法从首页继续**：M3 已修复（`savePeek` 分版本放宽），本轮复核 v1→v2→v3→v4 全链路可继续。
3. **双击事件导致理由/授权 UI 消失**：M3 已修复（幂等分支返回既有 id + 函数式更新）。
4. **候选区读屏播报**：M3 已修复（常驻 `role="status"` 直播区）。
5. **ArchivePage hooks 顺序**：`if (!save) return` 已移至所有 `useState`/`useMemo` 之后，避免条件性调用 Hook。

测试共 80 项，新增：M5 行动/日记/总结 CRUD、v3→v4 迁移保留旧数据、hooks 顺序正确。

### 三、代码审查（只报告，不擅自改）

- `src/game/saveSchema.ts`：v4 schema 是否包含 `actions[]`、`journalEntries[]`、`chapterSummaries[]`；`createInitialSave` 是否补齐三个空数组；Zod 校验上限是否合理（行动 200、日记 500、总结 20）。
- `src/game/saveVersion.ts`：`SAVE_VERSION` 是否为 4。
- `src/services/saveService.ts`：`migrateSave` 是否实现 v1→v2→v3→v4 链式迁移；v3→v4 仅补三个空数组，不改动既有字段；未知版本是否拒绝且不覆盖原始数据。
- `src/services/savePeek.ts`：`hasPlayableSave` 是否按版本放宽（v4 需要三个新数组字段存在）。
- `src/stores/useGameStore.ts`：8 个 M5 action（`createAction`、`updateActionStatus`、`deleteAction`、`completeAction`、`addJournalEntry`、`updateJournalEntry`、`deleteJournalEntry`、`upsertChapterSummary`、`deleteChapterSummary`）是否全部走 `commit`/`mutate` 单次写盘；`completeAction` 是否原子更新行动状态与写入日记；`upsertChapterSummary` 是否按 chapter 去重、编辑后标记 `isEdited: true`。
- `src/pages/ActionsPage.tsx`：行动卡片状态按钮（待办/进行中/暂停/完成并复盘）交互完整；复盘对话框提交后关闭、列表更新、日记联动。
- `src/pages/JournalPage.tsx`：三类日记筛选、新建对话框关联下拉（行动/认知/经历）、行内编辑、删除二次确认。
- `src/pages/ArchivePage.tsx`：「阶段总结」区生成逻辑（`generateChapterSummary`）是否汇总四类数据；编辑保存后标记 `isEdited`；删除二次确认；无存档时回到首页、hooks 顺序正确。
- `src/app/App.tsx`：新增 `/actions`、`/journal` 懒加载路由；HashRouter 保持不变。
- 文案红线：不能出现「你应该」「必须完成」「打卡」「连续天数」等打卡/施压措辞；行动复盘提示只问发生/感受/预期，不评价。
- 可访问性：对话框 `role="dialog"`、表单 `label` 关联、按钮 `aria-label`、动态内容有 `aria-live` 兜底。

### 四、部署与部署后验证

1. 首页可打开，`/#/actions`、`/#/journal`、`/#/archive` 不白屏。
2. 有认知卡片时，「转化为行动」→ 列表出现 → 切状态 → 复盘 → 日记出现条目。
3. 手动新建行动、新建日记（三类型）、生成/编辑/删除阶段总结，刷新后全保留。
4. 手机视口可完成整个 M5 流程。
5. 公网链接：`https://shiji-life-ne4ii85id3h.qoder.xn--website%2A%2A(,-cy0zr9fopi10jtzjbkh3m4b5w9a3c9bod7gwl8b/`

### 明确不做

- 不接入真实 AI，不新增网络请求。
- 不改变「行动完成才触发复盘、复盘才入日记」的流程。
- 不重构目录、不升级依赖、不引入新库。
- 不为了让测试通过而修改断言。
- 不提交密钥或真实个人信息。

### 汇报格式

```
A. 命令结果：五条命令的真实输出摘要
B. 功能验收：九条逐条通过 / 未通过 + 现象
C. 审查发现：严重 / 一般 / 建议，每条 文件:行号 + 一句话
D. 部署：公网链接 + 五项部署后验证
E. 修复建议：最小改动方案，等确认后再改
```