# 验收记录 · dsh-html-library 0.1.0

- 日期：2026-11-12（Asia/Shanghai）
- DSH：0.2.2-rc.1 · desktop profile（`DSH_PROFILE=desktop`）
- GUI：`http://127.0.0.1:51626`
- Node：v24.15.0（测试进程）
- 插件目录：`$HOME/mytao/work/project/test/dsh/dsh-html-library`

> 浏览器控制在本会话不可用（官方验证规范：不要另起浏览器、不要找 token、不要用截图工具补偿）。
> 因此下面区分两类结论：**已用机器证据确认的**，和**仍需肉眼确认的**。

## 1. 安装

`plugin_manager install_bundle`（target = 插件目录）返回：

```json
{ "stage": "enable", "target": "dsh-html-library", "enabled": true, "changed": true,
  "application": "applied", "warnings": [] }
```

- profile `package.json` 已记录 `dsh-html-library: link:…`，并加入 `dsh.profile.bundles`。
- 之后把插件行 `include:html-library` 停用再启用一次，强制加载改过的宿主模块；两次均 `application: applied`，无 warning。

## 2. 左侧栏入口与主面板（实时 Client 槽位）

`cordis_inspect_query` → Client `Slots.listSubTree`：

- `sidebar.panellist` occupants：
  `todos(order 30)`、**`html-library(order 40, active: true)`**、`plugins(0)`、`schedules(10)`。
- `main` occupants：
  `conversation`、`plugins`、`schedules`、`todos`、**`html-library(active: true)`**。

说明：客户端 bundle 已加载并完成两个注册；`sidebar.panellist` 的 `id` 与 `main` 的 `key` 相同
（都是 `html-library`），shell 点击图标时才能分发到本面板。该结论只证明**注册成功**，
不证明渲染后的视觉。

## 3. 宿主路由（运行中的进程）

```text
GET /api/dsh-html-library/health            -> 401  (connection 准入拦下，证明路由已注册且受鉴权)
GET /api/dsh-html-library/site/abc/x.html   -> 403  (静态路由已注册；未知根目录被拒绝)
GET /api/dsh-html-library-nope/health       -> 401  (不属于本插件，落回官方 /api)
```

未带浏览器会话的 `curl` 拿不到 JSON，这是**预期安全行为**；功能正确性由下一节的进程内测试覆盖。

## 4. 单测与真实入口装配（21 项全通过）

```bash
cd dsh-html-library && node --test test/*.test.mjs
```

```text
ℹ tests 21
ℹ pass 21
ℹ fail 0
```

覆盖：

| 文件 | 覆盖点 |
|---|---|
| `test/parse.test.mjs` | h1 > title > 文件名优先级、实体解码、跳过 script/style/SVG/hidden、摘要上限 |
| `test/library.test.mjs` | 递归索引与跳过噪声、exclude glob、中文标题/正文/小标题检索与多词 AND、目录/标签筛选、收藏+标签+阅读记录跨重启、删除文件→丢失墓碑保留元数据、移除目录不动磁盘、路径遍历/编码斜杠/未知根/软链接逃逸全部拒绝 |
| `test/routes.test.mjs` | 静态响应**字节与原文件完全一致**、CSP（`'self'` + 请求来源、无 frame-ancestors、`script-src 'none'`）/nosniff/no-store、CSS+SVG MIME、ETag 304、沙箱 `Origin: null` 的字体 CORS、非回环拒绝、JSON 信封与 405/401 分支 |
| `test/plugin.test.mjs` | `apply()` 真实入口：注册 11 条路由、启动扫描 4 篇 fixture、检索、静态取字节、数据落在 `$DSH_HOME/dsh-html-library/library.json` |

关键断言（样式保真）：

```js
assert.equal(Buffer.compare(response.body, original), 0);   // HTML 字节未改
assert.match(csp, /script-src 'none'/);
assert.match(csp, /default-src 'self' http:\/\/127\.0\.0\.1:50988/); // 相对资源兜底
```

样本 `fixtures/demo/`：内联 CSS + 内联 SVG 图（缓存笔记）、外链相对 CSS + SVG 资源（Harness 笔记）、
长文中文检索、只有 `<title>` 的 `.htm`。

## 4.5 运行中的界面产生的真实写入

安装后运行期间，数据文件里出现了一条**只能由界面产生**的记录：

```json
{ "id": "r08f552fe433f43d3",
  "path": "$HOME/mytao/work/project/test/local_html",
  "addedAt": "2026-11-12T14:20:40.075Z" }
```

链路是 `sidebar 图标 → 主面板 → POST /api/dsh-html-library/roots/add → library.json`，
说明客户端到宿主的真实通道已经打通（不只是单元测试里的 mock）。

该目录当时是空的，因此把 `fixtures/demo/` 复制了进去作为 3–5 篇样式保真样本。
随后用同一份库代码对**真实数据目录**做只读校验（不写回状态）：

```text
roots: local_html, count 4, missing 0
folders: "" (2), external-assets (1), legacy (1)
index: 8ms, docs 4
search 看门狗 -> 1 分布式锁的三次迭代
titles: 分布式锁的三次迭代 / Agent Harness 设计速览 / 缓存一致性：从 MESI 到 Caffeine / 工具链速记（只有 title 没有 h1）
```

运行中的插件由 Watcher（5s）自动收录这些文件；打开面板即可看到 4 篇文档。
删除 `local_html` 里的样本文件即可清空演示；「目录 → 移除」只删索引，不删文件。

### 真实页面（`local_html` 中现有的 answer-me-with-html 产出）

随后该目录里又加入了 3 篇真实生成页面（约 144–150 KB/篇），同一份库代码只读扫描：

```text
docs: 7, index: 9ms
- 分布式锁的三次迭代 | chinese-search.html | 3KB
- Agent Harness 设计速览 | external-assets/index.html | 2KB
- 缓存一致性：从 MESI 到 Caffeine | inline-styles.html | 6KB
- 工具链速记（只有 title 没有 h1） | legacy/note.htm | 1KB
- 隐锋 · 战术折刀外观提案 | stealth-knife-concept-v1-…html | 144KB
- Plugin 与 Skill 的区别 | plugin-vs-skill-…html | 149KB
- 文章发布链路：从本地 Markdown 到 GitHub | markdown-github-…html | 150KB
search "GitHub" -> 3
```

标题全部取自页面 `h1`；三篇大页面里除 SVG 命名空间与一个指向 GitHub 的文本链接外，
没有远程资源请求，所以在「禁脚本 + 禁远程资源」的 CSP 下仍是自包含渲染。
它们各有 2 个 `<script>`（通常是按钮/主题类增强脚本），按设计**不会执行**；
正文与样式不依赖这些脚本。

## 5. 实测基准（1000 篇）

```bash
node test/benchmark.mjs 1000
```

```text
generated 1000 files in 97ms
index: 84.6ms, docs=1000, rss +12.7MB
search over 200 runs: p50=0.17ms p95=0.62ms max=2.15ms
snapshot: 0.25ms
```

合成语料，每篇约 2KB（20 目录 × 50 篇），仅代表本机量级。

## 6. 显示资源

- `locale/zh.json`：`HTML 知识库` / `本地优先的 HTML 知识库…`
- `locale/en.json`：`HTML library` / `Local-first HTML knowledge library…`
- `icon.svg`：原创书本图标，XML 可解析，807 bytes（限制 256 KiB 以内）
- 安装结果 `warnings: []`，无元数据诊断。

**未验证**：插件管理器里标题/描述/图标、以及面板的实际渲染效果（需要浏览器控制）。

## 7. 仍需肉眼确认的清单（约 2 分钟）

1. 刷新 DSH 页面 → 左侧栏出现**书本图标**（「待办」之后），悬停标题「知识库」。
2. 点开 → 已经配置了 `local_html`（内含 4 篇样式样本）；也可点「目录」自行增删。
3. 左侧出现 4 篇文档与目录树；搜索「看门狗」应命中《分布式锁的三次迭代》并高亮。
4. 右栏预览：内联渐变背景、卡片、SVG 图是否与 Chrome 打开一致；外链样本
   `external-assets/index.html` 的 `style.css` 与 `architecture.svg` 是否生效
   （这是 CSP / 相对路由的视觉复验，也是沙箱 iframe 的关键一步）。
5. 点星标收藏、添加标签、刷新页面确认仍在；删除某个 fixture 文件 → 重新索引 → 出现「丢失」徽标。
6. 切换 DSH 明暗主题：面板跟随主题，HTML 内容不被强制改写。

## 8. 已知未覆盖

- 1000 篇基准是合成数据；真实目录的首次索引与搜索延迟需再记录一次。
- 阅读位置恢复未实现（沙箱 iframe 无法读 `scrollTop`）。
- 文件重命名后收藏/标签留在旧 id（按 `hash+size` 搬迁是后续项）。
- 依赖运行时 JS 的页面只显示静态部分（设计上的默认安全取舍）。
- 反向代理/远程部署：静态资源与 JSON 路由当前按本机回环准入。
