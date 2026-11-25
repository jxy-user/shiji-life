# 备份：Claude 版本（人生线 + SVG 门厅）

此目录保存的是 2026-11-25 之前的旧版本资料，**不参与构建**。

## 代码备份

完整代码保存在 git tag：

```bash
git show backup/claude-life-line --stat
# 或检出到临时目录查看：
git archive backup/claude-life-line | tar -x -C /tmp/claude-life-line
```

对应提交：`89f4212 光效优化2`（我的最后一版）。

该版本包含：

- 门厅：`src/pages/StartPage.tsx`、`src/components/start/DoorScene.tsx`（SVG 城门、水面/倒影、四项增强）
- 人生线：`src/pages/LifePage.tsx`、`src/data/lifeStory.ts`、`src/stores/useLifeStore.ts`
- 回放：`src/pages/LifeReplayPage.tsx`
- 电影感/音效：`src/components/effects/*`、`src/services/sound.ts`
- 文档：`archive/claude-life-line/docs/`、`AGENTS.md`、`README.md`

## 说明

当前仓库主线是另一位创作者的版本（`features/`、`motion/`、`store/` 结构，GTA-G 桌面 UI 与动画体系）。本备份仅为留存，不再维护。
