# Qoder 使用证据（可核验）

> 本页只列**能在仓库里直接验证**的证据，不依赖口头说明。
> 所有命令在项目根目录执行。

## 1. Qoder 的提交记录

Qoder 以独立提交身份 `ab926340053` 提交了核心实现，不是只改了文档：

| 提交 | 时间 | 说明 | 规模 |
|---|---|---|---|
| `9180acd` | 2026-11-25 16:48 +0800 | 重建 GTA-G 桌面版 UI 与动画体系 | 225 个文件，+18365 / −14192 |
| `2819d5d` | 2026-11-25 18:30 +0800 | 加入环境音乐播放器 | 音频引擎、播放器 Dock 与曲目 |

验证：

```bash
git log --author="ab926340053" --format="%h %ad %s" --date=iso
git show --stat 9180acd | tail -5
git show --stat 2819d5d | tail -5
```

提交邮箱为 `ab926340053@users.noreply.github.com`，与人类提交（`Jxy`）区分明显。

## 2. Qoder Sites 部署记录

仓库根目录的 `.拾己 · LIFE.qoder.site` 是 **Qoder Sites 的发布记录**，包含站点与发布 ID、产物哈希：

| 字段 | 值 |
|---|---|
| projectId | `01a1f735-87ed-7372-a6e9-36d4d5f916de` |
| siteId | `01a1f735-87ef-727c-9c8f-637821c40df2` |
| deploymentId | `01a212c8-034e-7a25-954d-69b4b84ebcde` |
| releaseId | `01a212c9-1ae9-784a-a1bf-5b0de3b081f2` |
| artifactSha256 | `0098a6cd3a46a28ea3a6d9c838ea8a79d73591aad5ccb0de061b8045e76df12f` |
| indexSha256 | `234a845ba7436c65f19e3a195fb563f666cfe8a49283936296255f2dc9aaa57d` |

**哈希校验**：当前构建的 `dist/index.html` 与发布记录中的 `indexSha256` 完全一致（2026-11-25 验证）：

```bash
npm run build
sha256sum dist/index.html
# 234a845ba7436c65f19e3a195fb563f666cfe8a49283936296255f2dc9aaa57d
```

这说明线上部署的就是此仓库的构建产物，而不是另做的静态页。

## 3. 机器可读的设计合同

Qoder 直接读取 `specs/gta-ui/` 下的合同并落成代码，合同先于实现存在：

- `specs/gta-ui/style-contract-g.yaml`：视觉、布局、令牌与断点。
- `specs/gta-ui/motion-contract.yaml`：动效节拍与可跳过规则。
- `specs/gta-ui/style-contract-h.yaml`：人生档案方向的备用合同。

合同与实现的对应关系：

| 合同内容 | 实现位置 |
|---|---|
| 设计令牌（paper / ink / sun / signal） | `src/styles/tokens.css` |
| 组件合同（PaperSheet / PaperButton / Stamp / Pin） | `src/components/g/GPrimitives.tsx` |
| 动效节拍（fast / normal / cover / beat） | `src/motion/tokens.ts` |
| 11 个页面与路由 | `src/app/App.tsx`、`src/features/*` |
| 状态、存档与校验 | `src/store/*`、`src/domain/schema.ts` |
| 桌面外壳与导航 | `src/components/shell/Shell.tsx` |

## 4. 可复现的检查

```bash
npm run check        # tsc --noEmit + eslint --max-warnings=0 + 51 项测试 + 生产构建
npm run test:e2e     # Playwright：旅程、可访问性、视觉、性能、部署
```

`npm run check` 的完整通过是每次 Qoder 改动后的验收门槛，失败项会回到 Qoder 继续修，直到全绿。

## 5. 使用说明

分工、使用方式与人的判断见 [`QODER_USAGE.md`](QODER_USAGE.md)。
