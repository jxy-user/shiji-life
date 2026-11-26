# 证据截图

论坛提交时可直接使用这四张图，互相印证。

| 文件 | 拍的是什么 | 可核验点 |
|---|---|---|
| `01-site-running.png` | 生产构建运行中的开始页（本地 preview，与线上同构建） | `npm run build && npm run preview` |
| `02-github-commits.png` | GitHub 提交页 | Qoder 提交身份 `ab926340053`：`9180acd`、`2819d5d` |
| `03-qoder-workspace.png` | Qoder 应用中的 `shiji-life` 工作区、任务记录与 Qoder Sites 链接 | 工作区名、任务记录、站点地址 |
| `04-deploy-record.png` | Qoder Sites 发布记录与 `dist/index.html` 哈希对比 | `indexSha256` 与构建产物一致 |

## 在论坛里怎么用

1. 先放 **02**：证明 Qoder 以独立提交身份完成了核心代码。
2. 再放 **03**：证明项目在 Qoder 工作区里，并且有 Qoder Sites 链接。
3. 再放 **04**：证明线上发布的就是当前仓库构建（哈希一致）。
4. 最后放 **01** 或线上站点截图：证明实际可玩。

更完整的文字说明见 [`../QODER_EVIDENCE.md`](../QODER_EVIDENCE.md) 与 [`../QODER_USAGE.md`](../QODER_USAGE.md)。
