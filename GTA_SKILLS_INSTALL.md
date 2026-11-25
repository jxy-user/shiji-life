# GTA 方向｜技能安装与参考记录

> 日期：2026-11-24
> 目标：为 GTA-inspired UI 方向安装可用的游戏 UI 技能，并建立参考图包；后续再装图片转代码技能用于 1:1 还原。
> 说明：GitHub 上没有现成的「GTA 专属视觉 SKILL.md」；本次安装通用游戏 UI 工作流，GTA 风格由项目自己的 `GTA_UI_DIRECTION.md` + 参考包定义。

## 0. 图片转代码 / 视觉转代码技能（第二批）

用于把 G 概念图 1:1 还原进 MVP，不二次设计。

| 技能 | 来源 | commit | 用途 |
|---|---|---|---|
| `image-to-code` | [yuzhworkhard-wq/image-to-code](https://github.com/yuzhworkhard-wq/image-to-code)（MIT） | `886c882` | 390/750px 等比还原、layers.manifest、透明切图 |
| `image-to-ui` | [XuToWei/Image-To-UI](https://github.com/XuToWei/Image-To-UI)（MIT） | `3aa6527` | 游戏 UI 截图 → 结构/坐标/组件 JSON |
| `imagegen-frontend-mobile` | [Leonxlnx/imagegen-skills](https://github.com/Leonxlnx/imagegen-skills)（MIT） | `beb16b0` | 移动端 image-first → 前端 |

安装位置：`C:\Users\admin\.qoder\skills`

完整 vendor：`风格/.vendor/image-to-code`、`image-to-ui`、`leonx-imagegen`

> 也评估过 [oil-oil/draw-ui](https://github.com/oil-oil/draw-ui)（无许可，572★）和 [santowilem/skills](https://github.com/santowilem/skills) 的 clone-ui（无许可，24★）：工作流很好，但没装。`Anionex/agent-vision-toolkit`（MIT，1269★）需要 `VISION_API_KEY`，Qoder Read 已能看图，暂不装。

还原手册：`GTA_G_RESTORE_PLAN.md`

## 1. 已安装技能

| 技能 | 来源 | 版本 | 安装位置 |
|---|---|---|---|
| `game-ui-workflow` | [guiguiyan930-source/game-ui-design-workflow](https://github.com/guiguiyan930-source/game-ui-design-workflow)（MIT） | `1ec6046` | `C:\Users\admin\.qoder\skills\game-ui-workflow` |
| `game-ui-product-design` | 同上 | `1ec6046` | `C:\Users\admin\.qoder\skills\game-ui-product-design` |
| `game-ui-specification` | 同上 | `1ec6046` | `C:\Users\admin\.qoder\skills\game-ui-specification` |
| `game-ui-extension` | 同上 | `1ec6046` | `C:\Users\admin\.qoder\skills\game-ui-extension` |
| `game-ui-page-generator` | 同上 | `1ec6046` | `C:\Users\admin\.qoder\skills\game-ui-page-generator` |
| `game-ui-component-breakdown` | 同上 | `1ec6046` | `C:\Users\admin\.qoder\skills\game-ui-component-breakdown` |
| `game-ui-sprite-sheet-splitter` | 同上 | `1ec6046` | `C:\Users\admin\.qoder\skills\game-ui-sprite-sheet-splitter` |
| `game-ui-asset-pipeline` | 同上 | `1ec6046` | `C:\Users\admin\.qoder\skills\game-ui-asset-pipeline` |
| `image-prompt` | [veryCoolTimo/imagegen-skills](https://github.com/veryCoolTimo/imagegen-skills)（MIT） | `e5bacac` | `C:\Users\admin\.qoder\skills\image-prompt` |

验证：

```text
python scripts/validate_skills.py
OK: validated 8 skill(s)
```

完整 vendor 仓库保留在 `风格/.vendor/`，因为 `scripts/init_project.py`、`validate_project.py`、`templates/`、`schemas/`、`config/` 不在单个 skill 目录内。

## 2. 参考图包

位置：`风格/refs/gta/`

| 目录 | 内容 | 数量 |
|---|---|---|
| `gta5/` | 官方封面、fan loading art、Los Santos 地图 | 3 |
| `gta6/` | Rockstar 官方 GTA VI key art / trailer stills / 场景图 | 10 |
| `hud/` | `GTA-VI-Inspired-HUD` 的 loading screen / minimap / money row / sunset drive / landing page | 6 |

- 来源与版权说明：`风格/refs/gta/SOURCES.md`
- 参考板：`风格/refs/gta/REFERENCE_BOARD.jpg`
- 使用边界：仅内部风格分析；不进入产品 bundle；不复用 Rockstar 角色、logo、武器、字体、UI。

## 3. 风格文档

- 双方向说明：`风格/GTA_UI_DIRECTION.md`
- 风格契约 G：`风格/specs/gta-ui/style-contract-g.yaml`
- 风格契约 H：`风格/specs/gta-ui/style-contract-h.yaml`
- 页面提示词可继续沿用 `UI_PROMPT_LIBRARY_B.md` 的结构，按 G/H 风格契约替换视觉段。

## 4. 生成记录

- 画布：`https://flowith.io/conv/c798d891-d766-43f0-b043-ce742e5369c7`
- G 三页：Flowith Seedream 5.5，9:16，2K。
- H 开始页：Flowith Seedream 5.5，9:16，2K。
- H 城市 / 档案：Flowith 当日 20 张额度用尽，改用 ImageGen（以 H 开始页/城市页为风格参考），再上传回同一画布。
- 结果文件：`风格/ui-concepts-gta/`
- 对照总览：`风格/ui-concepts-gta/GTA风格_双方向_对比总览.jpg`

## 5. 已知限制

1. 参考图含 GTA 官方的武器/成人化构图，只作为内部风格分析；生成图已明确排除武器、通缉、犯罪、评分、金钱排名。
2. G 城市页的地图是原创的洛杉矶式城市，不是 GTA 的 Los Santos 复刻；图中仍有少量模型自由发挥的地名，落地需按项目六区重排。
3. H 档案页的小字仍有模型截断（如「第一份工」），正式落地必须用代码排版，不依赖图内文字。
4. 本轮未改 MVP 代码；G/H 只是方向验证。
