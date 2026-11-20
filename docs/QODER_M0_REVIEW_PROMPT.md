# Qoder 任务：审查并部署 M0 项目骨架

> 用法：把本文件「任务正文」以下的内容整段复制给 Qoder。

---

## 任务正文

### 背景

《拾己 · LIFE》的 M0（项目骨架）已由另一名工程师完成，代码在本仓库中（若你尚未同步，先执行 `git pull`）。本轮你的职责是**审查、调试与部署**，不是重写。

开始前请先阅读：

1. `AGENTS.md`（项目总则与不可破坏原则）
2. `README.md`（技术栈、命令、目录结构）
3. `docs/PROJECT_CONTEXT.md`、`docs/TECHNICAL_PRD.md` 第 2–4 节、`docs/ROADMAP_AND_ACCEPTANCE.md` 的 M0 小节

技术栈：Vite 8 + React 19 + TypeScript 7 + Tailwind CSS 4 + React Router 7 + Zustand 5 + Vitest 5。要求 Node.js 22 或以上。

### 本次范围

**1. 构建验证（必须真实执行，粘贴原始输出，不许只写「通过」）**

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

任一条失败，先定位根因再修复；修复范围仅限于让它恢复通过，不做顺手重构。

**2. 代码审查（本轮只报告，不擅自改代码）**

重点检查：

- 是否符合 `AGENTS.md` 第 5、7 节的工程与 AI 约束。
- `src/services/storage.ts`：页面是否绕过了它直接访问 localStorage。
- `src/types/game.ts`：经历类型是否统一为 `event / social / action / inner`，与 `docs/AI_REFLECTION_SYSTEM.md` 一致。
- 可访问性：语义标签、焦点环、正文对比度、`prefers-reduced-motion`。
- 响应式：390px / 768px / 1440px 下是否有横向溢出或文字截断。
- 测试有效性：断言是否真的验证了行为，而不是空跑。

**3. 部署到 Qoder Sites，拿到公网链接**

**4. 部署后验证（本轮最关键的一项）**

- 首页能正常打开。
- 在地址栏**直接**访问 `/archive`、`/city` 这类深层路径，是否返回 404。
- 用手机视口打开一次，确认排版正常。

如果深层路径 404，说明静态托管没有 SPA 回退。**只报告现象与原因，不要自行把 `BrowserRouter` 改成 `HashRouter`**，等确认后再改。

### 明确不做

- 不改变产品定位、已确认决策与文案口径。
- 不新增功能（社交、排行榜、付费、多人在线一律不做）。
- 不重构目录结构、不升级依赖、不引入新依赖。
- 不为了「让测试通过」而修改或删除测试断言。
- 不提交任何密钥、`.env` 或真实个人信息。

### 汇报格式

```
A. 命令结果：四条命令的真实输出摘要
B. 审查发现：严重 / 一般 / 建议 三级，每条给 文件:行号 + 一句话说明
C. 部署：公网链接 + 深层路径验证结果 + 手机视口截图结论
D. 修复建议：若发现问题，给出最小改动的方案，等我确认后再动手
```
