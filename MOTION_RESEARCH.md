# 拾己 · LIFE｜动画体系调研报告

> 日期：2026-11-25
> 范围：对话叙事类应用与叙事游戏的动画实现方案；huashu-motion 技能的能力边界与可复用模式。
> 结论先行：**GSAP 编舞 + CSS `clip-path`/SVG mask 转场 + Web Audio 合成音效**，零新增运行时依赖、零二进制资产；huashu-motion 只移植方法论（不引入离线渲染链）。

---

## 1. huashu-motion：可移植 vs 仅离线

huashu-motion 是「HTML + GSAP 逐帧渲染电影」的导演工具，一个 composition 一支片。本项目的开屏 `src/motion/films/introSting.ts` 与章节卡 `chapterCurtain.ts` 就是它的移植产物。要把它用到**运行时产品**，需要区分两类能力。

### 1.1 可移植（运行时语义，本次采用）

| 方法论 | 内容 | 本项目落点 |
|---|---|---|
| Change explains | 每段动画一个动词（gather / split / align / connect / filter / reveal），不解释的装饰即噪音 | 9 动词语法（`MOTION_SYSTEM.md` §2） |
| 四层选型 | Format → Language → Techniques → Look & Sound，逐层决定 | 文档结构按此排布 |
| 节奏法 | hook 3s 内、climb 分步、burst 在 30–60%、hero 压最强点、stop 0.5–1.6s 后砸回、resolve 收尾；默认 100–125 BPM；events-per-bar 密度表；超 2 小节无新事件 = dead time | L4/L5 幕布与开屏的 beat 结构；UI 层「一次交互不超过一拍」 |
| contrast schedule | 每个 section 边界至少改两项（景别/速度/ease 家族/相机/密度/底色/织体） | 章节 theme 差异化（雨/日光） |
| easing 语义 | 入场落点在 30–40% 时长；**exit 比 enter 快**；stagger 30–60ms UI、15–25ms 字母；anticipation 2–6% | `tokens.ts` 的 `ease.exit`、`ease.stamp`、`stagger.char` |
| 技术库 | mask reveal（yPercent + overflow hidden）、scale slam、type-on、draw-on、pill highlight、flood、push-through、match cut、color-field flip、camera push/pull/drift/parallax | `reveal` / `stamp` / `type` / `flood` / `drift` 动词 |
| 音效落点 | 打在**视觉落定帧**（back.out≈45%、expo.out≈30–40%），不是 tween 起点；30s 内 8–15 击；重复必变化 | `SfxEngine` 与揭晓时间轴的 45% 落点 |
| 性能硬约束 | 只动 transform + opacity；禁 layout 动画；任何帧可 seek；装饰层不盖字 | 全部动词只动 transform/opacity/clip-path |

### 1.2 仅离线（本次不引入）

`om studio / inbox / look / done / undo`（评论闭环）、`om render`（mp4/webm 导出、motion blur）、`om sound / voice / samples`（音轨与配音合成）、`om still / qa / swatch`（抽帧与质量检查）、ffmpeg 频谱与 LUFS 母版、ABC 乐谱。这些依赖浏览器逐帧渲染或音频工具链，属于「做一支片」而非「做一个应用」。

### 1.3 已知缺口

huashu-motion 通篇不讲 `prefers-reduced-motion`，只要求「静音可读」。移植进产品必须自补：`src/motion/useReducedMotion.ts` + `src/styles/base.css` 的全局降级（所有 animation/transition 压至 0.01ms）已经覆盖；新增动画必须走 CSS keyframes 或 GSAP `fromTo` + `clearProps`，不得内联时长。

---

## 2. 同类项目与叙事游戏模式

### 2.1 开屏 / 启动

- **主流做法**：等 `document.fonts.ready` 与首屏图 `img.decode()` 后再动，避免字体替换抖动；时长 900–1600ms；首访与复访两版；skip 固定右上且可键盘触达；boot 期间 `overflow:hidden` 且禁焦点；状态机 `boot → intro → idle`。
- **案例**：Journey 把「进入」本身当开场；Gris 用逐章解锁的颜色；Disco Elysium 黑屏 + 单行字 + 环境音；Apple 产品页用滚动驱动而非时间线。
- **本项目取用**：保留首访 10.6s 的拼贴 sting；补复访短版（约 1.6s 的 cover-in）；skip 常驻右上；`IntroGate` 已有 `introSeenAt` 记忆。

### 2.2 剧情 / 对白

- **打字机**：中文按字、英文按词用 rAF 推进；视觉层 `aria-hidden` 分片，另放全文给屏幕阅读器，绝不逐字写进 `aria-live`。
- **停顿**：标点加权（，+120ms / 。+280ms / …+500ms）。
- **旁白 vs 对白**：旁白居中、低对比、慢约 20%；对白带姓名牌、立绘轻微上浮。
- **选项**：本行播完才出现，stagger 60–80ms，支持数字键。
- **三件套**：文字速度 / 自动前进 / 跳过已读（Ren'Py 范式）。
- **案例**：Disco Elysium 用排版与颜色区分「技能内心声部」；80 Days 用 ink 段落 + 选项；Citizen Sleeper 用骰子结果分支；Florence 几乎无文字。
- **本项目取用**：`Typewriter` 加标点权重表；`speaker` 决定字速（旁白更慢）；选项 stagger .08（已有）。

### 2.3 角色交互

- **生命感三要素**：错相 idle（呼吸 8–12s ±2px、眨眼 3–6s）、入场位移 + 淡入、状态章盖章（1.15→1 + 2° + 音效）。
- **技术阶梯**：spritesheet < 分层图 + CSS/GSAP < Live2D/Spine/Rive。VA-11 HALL-A、Coffee Talk 证明「静态立绘 + 浮动 + 表情切换」就够。
- **本项目取用**：头像/速写 `drift` 微漂；`Stamp` 加 `stamp` 动词；不引入 Rive/Lottie（无设计工链、需外部二进制资产）。

### 2.4 场景转场

- **时长分级**：日常 200–300ms 淡入淡出；wipe/clip-path 300–500ms；SVG mask 撕纸 600–900ms；章节卡 800–1500ms；**只有章节级才放长动画**；任何 >400ms 必须可被输入打断直接到终态。
- **地图缩放**：scale + 视差 + `transform-origin` 锚定地点。
- **技术**：`clip-path` / SVG mask / GSAP 最可控；同元素跨版式移动用 GSAP Flip。
- **本项目取用**：L3 节点 ≤420ms 可打断；L4 幕布压到约 2.2s 且 Esc/跳过可断；地图进入用遮罩揭示锚定热点。

### 2.5 选项反馈与节点结算

- **状态机**：`idle → hover → pressed → committed → resolving → done`，用 `data-state` 驱动；提交幂等；先遮后揭（0.3s + 音效）制造节拍。
- **案例**：Persona 5 选项斜切与高对比选中态；Ace Attorney 证物「Present」确认；Citizen Sleeper 骰子入槽结算。
- **本项目取用**：`ChoiceGroup` 加 `data-state`；`EventPage` 四段式揭晓。

---

## 3. 技术选型结论

### 3.1 View Transitions API

- 支持度（2026-11）：Chrome/Edge 111+、Safari / iOS 18+、Firefox 144+；全球约 93%，Baseline 仍为 low。
- React 19.3+ 提供 `<ViewTransition>`；React Router 7 已**弃用** `viewTransition` prop；后退/`popstate` 不触发动画；`prefers-reduced-motion` 需自处理。
- **结论：不作主方案**。它适合路由级一次性交叉淡入与共享元素，不适合对话内部逐 beat 动画（快照不可交互、不可中途改字）。仅作为后续可选增强，且不与 GSAP 包裹同一节点。

### 3.2 Rive vs Lottie vs GSAP

| | 体积 | 可控性 | 适用 |
|---|---|---|---|
| GSAP | 核心约 50KB gzip；2025-04 起全部免费含插件 | 最强：timeline、label、回调、与 React 状态耦合 | 编舞、转场、对白节拍 |
| Lottie | lottie-web 约 60–75KB gzip；JSON 体积大 | 弱 | 图标、loading（需 AE 资产） |
| Rive | runtime 约 40–50KB + `.riv` | 强（状态机） | 角色多状态（需 .riv 与编辑器） |

- **结论**：GSAP 已在依赖内，90% 动画用它；Lottie/Rive 均需外部二进制资产与设计工链，违背「纯本地无外部资产」约定，**不引入**。

---

## 4. 可复用模式清单

1. **先确保可读，再谈动效**：任何动画的最终态必须无 transform 残留、无低对比、无遮挡；`om still` 的「能不能当海报」标准转成「抽帧检查最终态」。
2. **静音可读**：动画不承担唯一信息表达；拿掉动效后流程仍完整。
3. **输入优先**：>400ms 的转场必须可 Esc/点击跳过；幕布不得拦截指针。
4. **一拍一反馈**：单次交互动画不超过一拍（约 0.48–0.6s）；连续两次交互无反馈即为节奏问题。
5. **一条主时间轴**：每页 timeline 上限 3 条，避免叠加抖动。
6. **同一个动词只讲一件事**：`stamp` 只用于「状态被确认」，不用于装饰。
7. **声音落在落定帧**：音效起点按 ease 的落点百分比反推，不放在 tween 起点。
8. **主题参数化**：章节差异只换参数（底色、BPM、织体、字速），不复制组件。

---

## 5. 来源

- huashu-motion 技能：`C:\Users\admin\.agents\skills\huashu-motion`（`references/director.md`、`rhythm.md`、`contract.md`、`sound.md`、`library/techniques.md`、`library/formats.md`）
- 本项目现有实现：`src/motion/films/introSting.ts`、`src/motion/films/chapterCurtain.ts`、`src/motion/sound/SfxEngine.ts`
- View Transitions 支持：caniuse.com/view-transitions；React Router「How to view transitions」
- GSAP 免费化：webflow.com/updates/gsap-becomes-free
- Ren'Py 阅读偏好（文字速度/自动/跳过已读）：renpy.org/doc/html/preferences.html
- Rive vs Lottie 体积对比：rive.app/blog/rive-as-a-lottie-alternative
