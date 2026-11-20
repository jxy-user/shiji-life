# Qoder 任务：审查并部署 M2「事件与经历」

> 用法：把本文件「任务正文」以下的内容整段复制给 Qoder。

---

## 任务正文

### 背景

M2（事件与经历）已完成并提交。本轮职责是**验证、审查、部署**，不是重写。

开始前：`git pull`，然后阅读 `AGENTS.md`、`README.md`、`docs/ROADMAP_AND_ACCEPTANCE.md` 的 M2 小节，以及 `docs/AI_REFLECTION_SYSTEM.md` 第 3、5 节（触发阈值与信息可信度）。

注意：存档已升级到 **v2**（新增 `experiences`、`seenEventIds`），`saveService.migrateSave` 里有 v1 → v2 的迁移，这是本轮审查的重点之一。

### 一、构建验证（真实执行，粘贴原始输出）

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

### 二、功能验收

1. 城市 → 校园 → 场景页应出现「这里发生了一件事 · 那个没有发出的消息」卡片。
2. 点进去，四个选项都不应有对错暗示；随便选一个，出现「选择之后」的结果文案。
3. **新经历默认不授权**：结果页开关应显示「不用于回顾」，设置页的默认开关应处于关闭状态。
4. 去「家」的事件页完成一次选择，应出现「当时是怎么想的」输入框；不填写直接离开可以正常完成，填写后点保存才写入。点「去人生档案看看」，能看到这条经历（类型、场景、游戏内时间、选择、结果，以及你写下的理由）。
5. 档案页里撤回授权 → 按钮变为「已撤回授权」；点「删除」→ 变为「再次点击确认删除」→ 再点一次后记录消失。
6. 回到该场景再进事件页，应显示「这件事已经过去了。」，不再重复记录。
7. **旧存档兼容**：把下面这段 JSON 写进 localStorage 的 `shiji-life:save:v1`，刷新后应能继续玩，天数/精力/昵称都保留，且不会报错：

```json
{"version":1,"profile":{"nickname":"旧玩家","avatarId":"ink","lifeStage":null,"explorationTopic":null},"chapter":"chapter_01","currentScene":"park","gameDay":3,"timeSlot":"noon","energy":45,"flags":{"lumiMet":true},"visitedScenes":["plaza","park"],"prologueDone":true,"createdAt":"2026-11-01T10:00:00.000Z","updatedAt":"2026-11-01T10:00:00.000Z"}
```

8. 390px 手机视口下，事件页、档案页、设置页排版正常。
9. 直接访问 `/#/event/campus_001`、`/#/archive`、`/#/settings` 能打开。
10. 设置页打开「新经历默认允许用于回顾」后，**只有之后**的事件默认授权，已有经历不变。
11. 首屏体积：`npm run build` 输出中，入口 JS 应远小于 React 运行时块；校验库（zod）不应出现在首屏加载的块里。

### 三、代码审查（只报告，不擅自改）

- `src/game/eventSchema.ts`：校验是否覆盖了所有内容字段；结果文案长度、选项数量、效果数值范围是否有限制。
- `src/data/events.ts`：四个事件是否真的「没有对错」；文案里是否有评价玩家的措辞（这是产品红线）。
- `src/stores/useGameStore.ts`：`recordExperience` / `setExperienceConsent` / `deleteExperience` 是否都走 action；删除是否同时收回授权；是否有任何路径可以让 AI 直接写入。
- `src/services/saveService.ts`：迁移是否只补齐字段、不改写已有内容；迁移失败是否会返回残缺数据。
- `src/pages/ArchivePage.tsx`：软删除的记录是否确实从界面与后续数据中排除；二次确认是否可被误触。
- 可访问性：授权开关是否使用 `role="switch"` 与 `aria-checked`；结果区 `aria-live` 是否常驻；删除的二次确认不会让键盘用户迷失。
- 测试有效性：41 个用例里，事件数据校验、迁移、授权与删除是否真的在验证行为。

### 四、部署与部署后验证

部署到 Qoder Sites，给出链接，并确认：

1. 首页可打开；
2. `/#/event/campus_001` 可直接访问；
3. 完成一次事件并刷新，经历仍在；
4. 不登录、不装任何东西就能玩到事件。

### 明确不做

- 不改变产品定位、文案口径与已确认决策；不新增功能。
- 不调整事件内容与选项（内容由产品侧统一维护）。
- 不重构目录、不升级依赖、不引入新库。
- 不为了让测试看起来更好而修改断言。
- 不提交密钥、`.env` 或真实个人信息。

### 汇报格式

```
A. 命令结果：五条命令的真实输出摘要
B. 功能验收：十一条逐条通过 / 未通过 + 现象
C. 审查发现：严重 / 一般 / 建议，每条 文件:行号 + 一句话
D. 部署：公网链接 + 四项部署后验证
E. 修复建议：最小改动方案，等确认后再改
```
