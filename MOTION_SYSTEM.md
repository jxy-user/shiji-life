# 拾己 · LIFE｜动画体系设计

> 状态：现行设计稿（2026-11-25）
> 视觉语言：洛圣都日光 · 城市拼贴（`specs/gta-ui/style-contract-g.yaml`）
> 编码：动效由 Qoder 使用 GSAP 落地，见 `docs/QODER_USAGE.md`。
> 机器可读合同：`specs/gta-ui/motion-contract.yaml`
> 调研依据：`MOTION_RESEARCH.md`

---

## 1. 设计原则

1. **Change explains**：每段动画只讲一个动词。说不清「它改变了什么」的动画，删掉。
2. **静音可读、无动画可读**：拿掉动效后流程与信息必须完整；动画不能是唯一表达。
3. **一拍一反馈**：单次交互的动画不超过一拍（约 0.52s）；页面级才允许 0.36–2.2s。
4. **输入优先**：超过 400ms 的转场必须可 Esc/点击跳过；幕布不得拦截指针。
5. **只动合成器属性**：`transform` / `opacity` / `clip-path`；禁止 `left/top/width/height`。
6. **同源令牌**：JS 只从 `src/motion/tokens.ts` 取值，CSS 只从 `src/styles/tokens.css` 取值。
7. **reduced-motion 是终态而非常数**：动画关闭时直接渲染最终帧，不是渲染一个「很快的动画」。

---

## 2. 动效语法：9 个动词

| 动词 | 语义（回答什么变了） | 表现 | 实现 | 时长 / ease | 音效 | 降级 |
|---|---|---|---|---|---|---|
| `drop` 落纸 | 一个区块被「放到桌上」 | 淡入 + 上浮 22px | `gsap.fromTo` opacity/y | 360ms / power2.out | paper-drop | clearProps 直显 |
| `type` 上字 | 文字被排上去 | clip-path 从左揭示 | rAF + `inset()` | 24–40ms/字 | type（30ms 节流） | 全文直显 |
| `stamp` 盖章 | 状态被确认 | 1.6→1 缩放 + 回正 −6° | `gsap.to` scale/rotate | 260ms / power4.in | stamp | 直显（保留静态 rotate） |
| `pin` 图钉锁定 | 选项被选中/提交锁定 | 被选项回弹，其余压暗 | scale .96→1；兄弟 opacity .42 | 220ms / back.out | option-hover | 直显 |
| `reveal` 遮罩揭示 | 结果/内容被揭开 | clip-path 横向或纵向揭开 | `inset()` keyframes / GSAP | 300–420ms | paper-drop | clipPath none |
| `flood` 套色漫过 | 章节换场 | 色场纵向涨满 → 翻场 → 退场 | scaleY + backgroundColor | ≈2200ms / power3.in | curtain、motif | 不渲染幕布，直接 onDone |
| `strike` 划线划掉 | 删除/否认/退出索引 | 划线擦过 + 降饱和 | 伪元素 scaleX；filter | 220ms | tick | 直显 |
| `drift` 微漂 | 环境有生命 | Ken Burns 缓推 / 呼吸 | CSS keyframes | 8–14s 循环 | 无 | 停止循环 |
| `align` 对位重排 | 列表换了顺序 | FLIP 平滑换位 | 读 rect → transform → clearProps（`useFlip`） | 220ms | tick | 直排 |

**动词归属**：`stamp` 只用于「状态被确认」（事件完成、认知判断、行动完成）；`flood` 只属于章节层；`drift` 只做环境底噪，不承载信息。

---

## 3. 六个层次

| 层 | 范围 | 时长 | 可打断 | 阻塞指针 | reduced |
|---|---|---|---|---|---|
| **L0 微交互** | hover / focus / press / toast | 120ms | — | 否 | 直显 |
| **L1 组件反馈** | 开关 / tab / 状态章 / 选项 pin | 220ms | 是 | 否 | 直显 |
| **L2 页面入场** | 每页 `[data-motion]` | 360ms | 是 | 否 | clearProps |
| **L3 节点转场** | 事件揭晓 / 对话开合 / 列表 FLIP | 220–420ms | 是（Esc/Space 跳终态） | 否 | 直显 |
| **L4 章节过场** | `ChapterCurtain` | ≈2200ms（上限 2400） | 是（Esc/跳过按钮） | **否**（根 `pointer-events:none`） | 不渲染 |
| **L5 开屏** | `IntroGate` | 首访 ≈10600ms / 复访 ≈1600ms | 是（跳过常驻） | 是（有意禁焦点） | 不渲染 |

**与 huashu 节奏法的映射**：L4/L5 是 film 级，内部按 hook → burst → hero → stop → resolve 排 beat；L1–L3 是 UI 级，一拍（≈0.52s）内必须结束；同一页同时运行的 timeline 不超过 3 条。

---

## 4. 页面覆盖面矩阵

### 4.1 页面与全局浮层

| 位置 | 触发 | 表现 | 动词 | 实现 | 时长 | 音效 | 降级 |
|---|---|---|---|---|---|---|---|
| **开始 `/`** | 首访进入（IntroGate 已看过后） | 刊头、标题、说明、按钮依次落纸；太阳呼吸 | drop + drift | `usePageMotion(.1)` + `g-breathe` | 360ms 起 | paper-drop | clearProps |
| | 点击「开始新的旅程」（有存档） | 确认对话框：遮罩淡入 + 纸面 0.96→1 | reveal | 原生 `<dialog>` + CSS | 220ms | paper-drop | 直显 |
| | 复访 | 封面拼贴 1.6s 轻推后交棒 | drop | `cover-enter` | 1600ms | motif | 直显 |
| **序章 `/prologue`** | 进入 | 夜雨图 Ken Burns、窗户辉光呼吸、进度点 | drift | CSS keyframes | 循环 | 无 | 停 |
| | 每一幕推进（Space/继续） | 新幕标题上浮淡入 + 正文打字机（标点停顿） | type + drop | `key={beat.code}` + `beat-title-in` + `Typewriter` | 360ms / 32ms·字 | type | 全文直显 |
| | 第 2 幕「把信读完」 | 信纸展开：scaleY 0→1 + 折痕位移 | reveal | `letter-unfold` | 360ms | paper-drop | 直显 |
| | 第 5 幕「推门」 | 导航到建角页 + CHAPTER 01 墨场幕布 | flood | `openCurtain({theme:'rain'})` | 2200ms | curtain、motif | 直接 onDone |
| **建角 `/create`** | 进入 | 表单区块依次落纸 | drop | `usePageMotion(.08)` | 360ms | paper-drop | clearProps |
| | 选择头像 | 选中头像 1.12→1 回弹 | pin | `avatar-pop` | 220ms | option-hover | 直显 |
| | 提交 | toast + CHAPTER 01 幕布 → 城市 | flood | 同上 | 2200ms | stamp、curtain | 直接 onDone |
| **城市 `/city`** | 进入 | 地图框、语义索引、待办依次落纸；广场热点脉冲 | drop + drift | `usePageMotion(.08)` | 360ms | paper-drop | clearProps |
| | 章 2 解锁（3 条经历 + 2 类场景） | CHAPTER 02 黄场幕布，播完自动接「雨停之后」对白 | flood + type | `onDone` 回调（已替换硬编码 `setTimeout(400)`） | 2200ms | motif | 直接开对白 |
| | 悬停/聚焦地点热点 | 图钉抬升 2px、硬阴影加深；focus-visible 显式描边 | pin | CSS transition | 120ms | 无 | 直显 |
| | 点击地点 | 以热点为锚点推近地图（scale 1.5 + 淡出）320ms 后进入场景；修饰键 / reduced 直接走原生链接 | align | `.canvasZooming` + `--zoom-x/y` | 320ms | whoosh | 直接导航 |
| | 微光邀请条关闭 | 标题换成「微光暂时不邀请」，做一次短促换行 | drop | `inviteTitleSwap` + `invite-title-in` | 220ms | tick | 直显 |
| **场景 `/scene/:id`** | 进入 | 速写淡入 + Ken Burns；现场纸、行动列表依次落纸 | drop + drift | `usePageMotion(.1)` | 360ms | paper-drop | clearProps |
| | 首次到访 | 对应场景的首访对白浮层弹出 | reveal + type | `DialoguePanel` | 360ms | paper-drop | 直显 |
| | 点击行动（记录/行动/相遇） | 按 kind 跳转；相遇页带 `?from=` 返回锚 | — | 路由 | — | 无 | — |
| **事件 `/event/:id`** | 进入 | 速写、004 编号、选项表单落纸 | drop | `usePageMotion(.1)` | 360ms | paper-drop | clearProps |
| | 选择选项 | 选中项回弹并锁定，其余压暗；已选时提交可用 | pin | `data-state` + CSS | 220ms | option-hover | 直显 |
| | **提交后揭晓（当前缺失，本次补齐）** | ① 表单 `clip-path: inset(0 0 100% 0)` 上收 300ms → ② 空拍 280ms → ③「已完成」章 `stamp` → ④ 结果纸自上而下 `reveal` 360ms → ⑤ 结果正文 `type` 32ms/字 | reveal + stamp + type | `EventResultTimeline`（GSAP timeline） | 约 1.6s | paper-drop → stamp | 直接渲染结果 |
| | 完整结果页刷新 | 直接渲染（幂等），不重播揭晓 | — | 条件渲染 | — | 无 | — |
| **阶段回顾 `/reflection`** | 进入 | 阈值尺、授权账本、认知卡落纸 | drop | `usePageMotion` | 360ms | paper-drop | clearProps |
| | 确认/否认/改写判断 | 认知卡盖章「已确认 / 已否认 / 已改写」 | stamp | `Stamp` + CSS | 260ms | stamp | 直显 |
| | 撤回授权 | 对应行划线 + 降饱和；依据失效提示从上方 8px 滑入 | strike + drop | `[data-consent='off']` + `stale-in` | 220ms | tick | 直显 |
| **档案 `/archive`** | 进入 | 角色条、时间线、认知索引落纸 | drop | `usePageMotion` | 360ms | paper-drop | clearProps |
| | 选中经历 | 上浮选中态 + 详情纸淡入 | pin + drop | CSS + `key` | 220ms | option-hover | 直显 |
| | 软删除 / 恢复 | 条目划线 420ms + 降饱和后移入「已收起」；恢复用 FLIP 归位 | strike + align | `[data-striking]` + `entry-strike` + FLIP | 420ms | tick | 直移 |
| **[日记 `/journal`** | 进入 | 左侧索引与右侧编辑器落纸 | drop | `usePageMotion` | 360ms | paper-drop | clearProps |
| | 切换筛选 | 换筛选整列重铺（`key={filter}`），条目带 `data-flip-key` 标记 | align | `list-resettle` | 220ms | tick | 直排 |
| | 保存日记 | toast + 条目插入列表 | drop | `Toast` + FLIP | 220ms | paper-drop | 直显 |
| **行动 `/actions`** | 进入 | 筛选条与行动卡落纸 | drop | `usePageMotion` | 360ms | paper-drop | clearProps |
| | 状态迁移 | 卡片滑入新列，状态点变形 | align + pin | FLIP + CSS | 260ms | tick | 直排 |
| | 完成行动 | 详情区状态章落定 + 完成双音（587→880Hz）；其它状态轻换行 | stamp | `detailTop[data-status]` + `action-stamp`；`sfx('impact')`+`sfx('complete')` | 260ms | impact + complete | 直显 |
| **设置 `/settings`** | **进入（当前无入场，本次补）** | 标题 + 四张纸依次落纸 | drop | 新增 `usePageMotion(.08)` | 360ms | paper-drop | clearProps |
| | 开关切换 | 轨道变色、圆点位移；短 tick | pin | CSS | 120ms | tick | 直显 |
| | 清空数据 | 两步确认对话框 | reveal | `ConfirmDialog` | 220ms | paper-drop | 直显 |
| **微光对话（全局）** | 打开 | 面板右侧滑入 + 1.5° 回正；头像 44px | drop | `dialogue-in` | 360ms | paper-drop | 直显 |
| | **关闭（当前缺失，本次补）** | 反向 12px 右出 150ms（exit 更快）后再卸载 | drop | 新增 `dialogue-out` + `closing` 态 | 150ms | 无 | 直接卸载 |
| | 换台词 | 旧行右收 90ms → 新行打字机；▼ 提示 | type | `Typewriter` + key | 32ms/字 | type | 全文直显 |
| | 关闭后 | 焦点返回触发元素 | — | 已有实现 | — | — | — |
| **Toast** | 出现 | 12px 上浮 | drop | `toast-in` | 220ms | paper-drop | 直显 |

### 4.2 八个场景（同一 `ScenePage`，参数化）

> 原则：不新增 8 套组件。场景差异只通过 `data-scene` 属性、`objectPosition`、字速三个参数表达。

| 场景 | 差异触发 | 表现 | 动词 | 时长 |
|---|---|---|---|---|
| 中央广场 plaza | 热点脉冲 + 「现场记录 004」小卡 | 脉冲环 2.6s；小卡落纸、老人速写入图 | drift + drop | 循环 / 360ms |
| 家 home | 首次与再次到访 | 速写 Ken Burns 幅度最小（1.03→1.05），叙事更静 | drift | 14s |
| 校园 school | 首次到访对白前 | 对白打开前留 120ms 空拍（人多，慢半拍） | — | +120ms |
| 街区 blocks | 热点排列 | 偶数热点 −1.5° 斜贴（已有），hover 回正 | pin | 120ms |
| 公园 park | 「晒一会儿」行动 | 苔绿状态点、长椅速写；行动按钮 hover 抬 2px | pin | 120ms |
| 工作室 studio | 「写一篇」入口 | 入口按钮 hover 抬 2px 硬阴影加深 | pin | 120ms |
| 港口 harbor | 「问问船夫」 | 天空蓝边条 0→1 划出 | strike | 220ms |
| 远方 far | 旁白 lede | 文案 40ms/字慢排（比其它场景慢 25%） | type | 40ms/字 |

### 4.3 四个事件（同一 `EventResultTimeline`，artKey + 强调色参数化）

| 事件 | 揭晓表现 | 动词 | 音效 |
|---|---|---|---|
| `bench` 长椅上的老人 | 遮罩上收 →「已完成」章 → 结果自上而下揭开；速写 `saturate(.58)` 轻推 1.02 | reveal + stamp | paper-drop → stamp |
| `bread` 面包店 | 同上；面包速写 Ken Burns 起 | reveal + drift | paper-drop → stamp |
| `window` 窗 | 同上；天空蓝边条 `scaleX` 0→1 划出 | reveal + strike | paper-drop → stamp |
| `boatman` 船夫 | 同上；港口速写偏 2° 回正 | reveal + stamp | paper-drop → stamp |

规则：**每个事件只允许一次 `stamp`**；揭晓全程用 `clip-path` 不用 `display`，保证 CLS 不反弹。

### 4.4 两个章节（同一 `ChapterCurtain`，theme 参数化）

| 章 | 色场 | 字色 | 节奏 | 音效 | 字速 |
|---|---|---|---|---|---|
| 01 雨 | 墨 `#141414` | 纸 `#f4ebd8` | 100 BPM，略慢 | curtain（低频 120/60Hz）+ 标题落点 chime | 32ms |
| 02 日光 | 黄 `#F2B705` | 墨 `#141414` | 125 BPM，略快（×0.92） | motif（D-F-A-D 上行）+ 标题落点 chime | 28ms |

实现：`createCurtainTimeline(root, onDone, theme)`；`curtainThemeOf(payload)` 缺省按标题含「雨停」判 `sun`，其余 `rain`。CSS 用 `[data-curtain-theme='sun']` 覆写字色与跳过按钮配色。**雨章多一层撕纸边**：`.g-curtain-torn` 用 26 段 `clip-path` 锯齿，随色场前缘升起、退场时同速移出；chime 在 timeline 1.24s（标题落定）由 `ChapterCurtain` 用 `tl.call` 挂上，受「每场一次」限制。

---

## 5. 技术实现路径

### 5.1 目录与职责

```
src/motion/
├─ tokens.ts                # 唯一数值源（beat/chapter/ease/stagger）
├─ useReducedMotion.ts      # 订阅媒体查询，jsdom 默认 true
├─ usePageMotion.ts         # L2：容器内 [data-motion] 依次落纸
├─ useFlip.ts               # align：列表 FLIP 换位（行动 / 档案）
├─ motionStore.ts           # 首访记忆（shiji.motion.v1）
├─ curtainStore.ts          # 幕布负载：theme + onDone
├─ components/
│  ├─ IntroGate.tsx         # L5 开屏
│  ├─ ChapterCurtain.tsx    # L4 章节幕布（pointer-events:none）
│  ├─ EventResultTimeline.tsx # 事件四段式揭晓
│  └─ Typewriter.tsx        # type 动词（标点停顿）
├─ films/
│  ├─ introSting.ts         # 开屏 timeline（5 个 scene label）
│  └─ chapterCurtain.ts     # 章节 timeline（4 个 scene label，theme 参数化）
└─ sound/SfxEngine.ts       # Web Audio 合成 12 cue，0 音频文件
```

### 5.2 关键实现约束

- **不新增依赖**：GSAP 3.15 + @gsap/react 已在包内；不引入 Lottie/Rive/View Transition 封装。
- **GSAP 终态清理**：所有 `useGSAP` timeline 结束必须 `clearProps:'transform,opacity'`（或还原设计值），否则视觉基线与 reduced-motion 断言会漂。
- **幕布穿透**：`.g-curtain-root { pointer-events:none }`，只给 `.g-film-skip` 恢复 `pointer-events:auto`。
- **幕布衔接**：调用方传 `onDone`，不再用 `setTimeout` 猜测时长。
- **打字机**：全文留在 DOM（读屏与复制拿全文），视觉用 `clip-path` 揭示；标点停顿由权重表实现。
- **音效**：`type` 30ms 节流；`impact`/`chime` 每场最多一次；`AudioContext` 懒创建 + 用户手势 `resume`。

### 5.3 覆盖缺口清单（按批次）

| # | 缺口 | 处理 |
|---|---|---|
| 1 | 幕布拦截指针、6.5s 过长、无 onDone | **B1 已修**：穿透 + 2.2s + Esc/跳过 + onDone |
| 2 | `usePageMotion` 0.55s 偏拖 | **B1 已修**：0.36s、stagger .06 |
| 3 | 缺少 beat/chapter/exit/stamp 令牌 | **B1 已修**：`tokens.ts` |
| 4 | 打字机无标点停顿 | **B2 已修**：`pauseAfter` 权重表（，120 / 。280 / …500） |
| 5 | `SfxEngine` 仅 6 cue | **B2 已修**：12 cue + impact/chime 每场限次 + type 节流 |
| 6 | `ArtImage` 无淡入 | **B2 已修**：`g-art-loaded` 解码后淡入 |
| 7 | `PageHeading` 不在入场序列；设置页无入场 | **B3 已修** |
| 8 | 地图热点无 focus-visible | **B3 已修**：`data-scene` + 焦点描边 |
| 9 | 事件结果无揭晓；对话无退场 | **B4 已修**：`EventResultTimeline` + `dialogue-out` |
| 10 | 复访开屏短版未实现 | **B4 已修**：刊头 `stamp-sign` 短签名 |
| 11 | 合同与 motion E2E 未建 | **B5 已建**：合同 + 4 条动效用例 |
| 12 | 选项选中无反馈、模态硬切、认知判断无盖章、档案换条硬切、地图热点直出 | **B6 已修**：`choice-pin` / `dialog-in` + backdrop / `stamp-settle` / `detail-in` / `hotspot-in` 逐点 stagger / `list-resettle` |
| 13 | `strike`、`align` 动词无完整落地；八场景无差异化字速 | **B7 已补**：撤销授权划线 + 降饱和；`useFlip` 驱动行动/档案列表换位；远方 lede 40ms/字慢排 |

---

## 6. 分批实施

| 批次 | 范围 | 状态 |
|---|---|---|
| **B1 地基修复** | tokens / usePageMotion / chapterCurtain / ChapterCurtain / curtainStore / motion.css / 三个调用点 | 已完成：幕布可穿透、Esc 可跳、≈2.2s |
| **B2 文字与声音** | Typewriter 标点、SfxEngine 扩 cue、ArtImage 淡入 | 已完成：标点停顿实测生效、单测全过 |
| **B3 页面补全** | Settings 入场、PageHeading 入序列、CityMap focus | 已完成：键盘可聚焦、标题随页入场 |
| **B4 节点揭晓** | EventResultTimeline、对话退场、复访短版 | 已完成：揭晓可复现、关对话有退场 |
| **B5 合同与验证** | motion-contract.yaml、`tests/e2e/motion.spec.ts` | 已完成：4 条动效用例全绿 |
| **B6 组件级动效** | 选项 pin、模态揭晓、认知盖章、档案详情、地图热点入场、筛选重铺 | 已完成：双端 E2E 全绿 |
| **B7 划线与大场景** | 授权撤销划线（strike）、行动/档案列表 FLIP（align）、远方场景慢排字速 | 已完成：FLIP 位移实测生效 |
| **B8 细节收尾** | 序章换幕标题、邀请条换题、staleNotice 滑入、档案软删除划线、行动完成盖章、日记列表 FLIP 标记 | 已完成：双端 69 项全绿 |
| **B9 三项增强** | 雨章撕纸转场（SVG clip-path 锯齿边）、地图热点 zoom-in（锚点推近后导航）、章节标题 chime 落点 | 已完成：截帧确认撕纸边与缩放；连续两轮双端 69 项零 flaky |

---

## 7. 验证

### 7.1 不破坏现有验收的红线

1. `tests/e2e/accessibility.spec.ts`：reduced 下遍历 `body *` 断言 animation/transition ≤0.001s。新增动画只能走 CSS keyframes 或 GSAP `clearProps`，禁内联时长。
2. `tests/e2e/visual.spec.ts`：截图 `animations:'disabled'`，最终态不得有 transform 残留。
3. `tests/e2e/performance.spec.ts`：LCP ≤2500ms、CLS ≤0.1、INP（p90）≤200ms。
4. `npm run check`：typecheck + lint + 37 项单测 + 生产构建。

### 7.2 已建测试（`tests/e2e/motion.spec.ts`）

- `chapter curtain never blocks pointer and finishes quickly`
- `chapter curtain can be dismissed by escape`
- `event result reveals with a mask and settles without clipped content`
- `micro-dialogue closes with a short exit`
- `page timelines stay under budget`（longtask ≤2 次、单次 ≤50ms）

### 7.3 验收清单

- [ ] `npm run check` 全绿
- [ ] `npm run test:e2e` 61 项 + 新增 4 项，Chromium/Firefox 双跑
- [ ] 初始 JS gzip ≤200KB，单路由块 ≤60KB
- [ ] DevTools Performance 录 `/event/bench` 提交，无 >50ms 长任务
- [ ] `prefers-reduced-motion: reduce` 下 `/city`、`/event`、`/settings` 无位移
- [ ] 幕布播放期间目标页按钮可点击
- [ ] 章节 01 与 02 幕布截图可辨（墨场 vs 黄场）

---

## 8. 风险与取舍

| # | 风险 | 缓解 |
|---|---|---|
| 1 | 幕布吞指针 | 根 `pointer-events:none`，仅跳过按钮 auto |
| 2 | 长动画拖慢叙事 | 幕布压到 2.2s 且可跳；合同锁 2400ms 上限 |
| 3 | reduced 覆盖不全 | 统一 keyframes / clearProps；E2E 扩新路由 |
| 4 | 视觉基线漂移 | 只改最终态；B5 统一重录并注明静态 rotate |
| 5 | 动效过载 | 9 动词 + stamp 限语义 + impact/chime 每场一次 + dead-time 规则 |
| 6 | CLS 反弹 | 揭晓用 clip-path 不用 display；图片保留显式宽高 |
| 7 | 跨浏览器 clip-path 差异 | 整数百分比 + `-webkit-` 前缀 |
| 8 | jsdom 与浏览器差异 | jsdom 下 reduced 默认 true，走直显路径 |
| 9 | 音效爆音 | type 节流 30ms；同场 impact/chime 限次 |
| 10 | 猜测时长导致竞态 | 一律用 onDone 回调，禁用 `setTimeout` 衔接 |
