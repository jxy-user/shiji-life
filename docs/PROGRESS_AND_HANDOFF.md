# 进度与协作交接

> 更新于 2026-11-25。**开始任何开发前先读这一页**。
> 以 `git log` 为最终事实；本文记录「为什么这样做」与「还差什么」。

## 一分钟了解

《拾己 · LIFE》是一款以「人生抉择」为核心的网页互动叙事游戏：玩家从 18 岁走到 60 岁，经历 11 个重大抉择，每选一项推进一段剧情，最后以一段回放动画呈现所有选择与倾向总结。

当前只有一条主线：

```
门厅（推门）→ 人生线 18→60（11 个抉择）→ 回放（逐条播报 + 关键词）
```

- 路由使用 **HashRouter**（`/#/life`），原因：Qoder Sites 静态托管没有 SPA 回退。
- 部署在 **Qoder Sites**（公网链接由 Qoder 生成）。
- 2026-11-25：**旧版「未完成之城」整套城市生活已删除**（城市/场景/事件/档案/行动/日记/人物/回顾/建角/开场），仓库只保留上面这条主线。旧代码可在 git 历史中找到。

## 进度表

| 模块 | 状态 | 内容 | 主要位置 |
|---|---|---|---|
| 门厅首屏 | ✅ | SVG 城门（拱石/壁柱/木门/丁达尔光带）、石材浮雕光照、木纹起伏、镶板倒角、铆钉锈迹、柱头回纹、台阶裂缝与磨损、地面倒影；**四项增强**：①门板光溢出/空气柔光/地面光斑衰减/雾漂移 ②最远层城市/屋顶轮廓/窗灯明暗/灯光映空 ③石面水渍与苔痕/木门划痕 ④前景虚化暗部/湿反射波纹/前景尘埃；镜头推近、推门火花、白幕字幕 | `pages/StartPage.tsx`、`components/start/DoorScene.tsx` |
| 人生线 | ✅ | 11 个年龄节点、分段动画（场景→问题→选项）、打字机、选择火花、音效 | `data/lifeStory.ts`、`pages/LifePage.tsx`、`components/life/*` |
| 回放 | ✅ | 逐条播放、时间轴、进度条、片尾关键词与倾向标签 | `pages/LifeReplayPage.tsx` |
| 电影感 | ✅ | 宽银幕黑边、暗角、流动颗粒、划痕、标题卡、镜头缓推、黑场转场 | `components/effects/CinemaFrame.tsx`、`src/index.css` |
| 音效 | ✅ | Web Audio 合成；首次交互解锁；持久化开关 | `services/sound.ts`、`components/life/SoundToggle.tsx` |
| PWA | ✅ | 可安装、离线缓存、更新/离线提示 | `vite.config.ts`、`hooks/usePWA.ts`、`components/pwa/PWANotifications.tsx` |
| 仅桌面端 | ✅ | viewport 固定 `width=1280`；无移动端安装引导 | `index.html` |

## 常用命令

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm run lint
npm test
npm run build
```

交付前四条全过：`typecheck`、`lint`、`test`、`build`。

## 目录与职责

| 位置 | 职责 | 注意 |
|---|---|---|
| `src/pages/StartPage.tsx` | 门厅：镜头、推门、白幕字幕 | 首页视觉由 Qoder 协作维护 |
| `src/components/start/DoorScene.tsx` | 城门 SVG 场景 | 光只从竖缝向门前地面投窄光带，**不向四周发散** |
| `src/pages/LifePage.tsx` | 人生线节点与结果 | 标题卡 1.4s 结束后才开始分段动画；选项在阶段未到时 disabled |
| `src/pages/LifeReplayPage.tsx` | 回放 | 要求 `finishedAt`；倾向统计只在这里出现 |
| `src/data/lifeStory.ts` | 11 个节点、选项、倾向统计 | 新增节点要同时补 `LifeGlyph` 图标 |
| `src/stores/useLifeStore.ts` | 人生线存档（`shiji-life:life:v1`） | 逐条校验 choices；`pendingChoice` 持久化结果 |
| `src/services/sound.ts` | 合成音效 | 首次 `pointerdown` 解锁；静音持久化 |
| `src/components/effects/CinemaFrame.tsx` | 宽银幕/暗角/颗粒 | 使用它的页面需自留 `pt/pb 8vh` |
| `src/index.css` | 设计令牌与动效 | 墨色暖光基调；标题宋体 |

## 产品红线（改代码前必读）

1. 不做心理诊断、不打人格标签，不给选择打分。
2. **玩家无法预知选择的结果或归类**：选择前不显示倾向、后果或提示；结果页也不显示倾向标签，倾向只在最终回放出现。
3. 结局只做事实性回放与倾向统计，并明写「这不是评判」。
4. 不使用羞耻、恐惧、损失厌恶或社交比较驱动。
5. 不新增社交、排行榜、付费、经济系统。

## 未决事项与已知限制

- 内容量固定：11 个节点、每个 3 个选项；扩充时注意保持节奏（约 1–2 分钟回放）。
- `SoftAurora`（WebGL 极光）在部分低端设备会自动降级为静态暖光。
- `docs/` 下其他文档（PRODUCT_PRD、TECHNICAL_PRD、GAMEPLAY 等）描述的是旧版城市模式，**作为历史资料保留，不再与代码同步**。
- 旧版删除前的完整代码见 git 历史（`89f4212` 及之前）。

## 协作约定

1. **先读文档再动手**：`AGENTS.md` → 本文。
2. **小步提交**，提交信息用 `feat(life): …` / `fix(door): …`。
3. **改存档必须**升版本并写迁移（当前 `shiji-life:life:v1`）。
4. **选择前不泄露结果/归类**（产品红线 2），改动结果页或回放时尤其注意。
5. 提交前跑四条命令并贴真实输出。
6. 每个里程碑完成后用 `docs/QODER_M*_REVIEW_PROMPT.md` 交给 Qoder 审查与部署。

## 下一步建议

1. **部署验证**：Qoder 拉取最新提交、重新构建并部署；确认门厅光效与人生线动画为最新版本。
2. **内容扩充**：增加节点时控制总量（建议 12–14 个），同步补图标。
3. **性能**：如需进一步减小首屏，可把 `SoftAurora` 改为更轻的 CSS 光晕；当前首屏 gzip 约 18 KB（不含 React）。
