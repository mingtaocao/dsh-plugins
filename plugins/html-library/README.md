# dsh-html-library · 本地 HTML 文件管理与阅读

DSH 全局知识库插件。默认左侧目录树、右侧原生 HTML 阅读器，点击文件直接阅读。
搜索、收藏、标签与分类视图保留；不依赖 AI。

## 本地预览

- 宿主直接读取用户配置目录内的 HTML、CSS、图片和字体。
- 预览副本把相对资源转成内存 data URL，右侧 iframe 使用 `about:srcdoc`，不导航到 HTTP HTML 地址。
- 不创建 HTTP server 或新增监听端口。目录、索引、文件操作的数据通信复用 DSH 既有宿主通道。
- 生产插件不注册 `/site/...` HTML 静态服务；旧静态实现仅保留在显式兼容测试模式中。
- 原始 HTML/CSS 不写回、不转换为 Markdown。预览副本会解析并序列化 HTML，替换资源引用；这不是磁盘文件的逐字节副本。
- 本地 CSS `@import`、`url()`、图片 `src/srcset` 和字体会受根目录边界检查后打包；加载失败时显示资源错误详情。
- 打开文档即可在独立沙箱内运行内联脚本和知识目录里的 JavaScript，使用按钮、页签等控件。
- 交互预览时，宿主会在线下载固定脚本 `https://cdn.jsdelivr.net/npm/sm-crypto@0.3.13/dist/sm2.min.js`。Windows 下通过 Windows PowerShell 使用运行 DSH 的用户的系统代理设置（含 PAC 和绕过规则）。jsDelivr 超时或下载失败时，宿主会尝试从 unpkg.com 获取同版本脚本并校验 SHA-256；两个来源都失败时，阅读器会显示各自的原因。设置 `bundledSm2: false` 可关闭此功能。
- 需要联网或完整浏览器环境时，点「在 Chrome 中打开」。插件会在运行 DSH 的电脑上启动已安装的 Google Chrome，并显示可复制的原文件地址。

预览限制：单文件 8 MiB、资源总计 32 MiB、128 个不同资源。大文档或复杂动态页面请用系统浏览器。
外部 SVG 的 use 引用、复杂 data srcset 组合与非 UTF-8 外部 CSS 仍需额外兼容性验证。

## 文件操作

左侧目录树每行右侧都有「⋯」菜单。目录下可以新建文件夹或 HTML 文件（名称带扩展名，例如 `笔记.html`）。空文件夹也会出现在树中。

文件和子目录可以从菜单中删除。确认后，插件把所选项目连同子目录内容移到知识目录的 `.dsh-html-trash/removed-*/` 下，并保留原来的相对路径。需要恢复时，把对应文件或目录移回原位并刷新。根目录可以在「管理目录」中移出索引，磁盘内容会保留。

展开右侧「文档详情」，编辑文件名并点「重命名」。

- 仅支持已索引 HTML/HTM/XHTML 文件在原文件夹内改名。
- 不覆盖已有文件，拒绝路径穿越和文件软链接重命名。
- 收藏、标签、阅读记录同步迁移，新文件名在重新扫描和重启后有效。
- 文件内容、页面标题、其他页面指向该文件的链接不自动改写。
- 预览、搜索和扫描以只读方式访问源文件。

## 安装与开发

DSH bundle：`package.json` 中的 `dsh.bundle.patch` 和 `dsh.client`。
宿主入口 `index.js`、无构建客户端 `client.js`；React 从 DSH 模块表取得。

```sh
npm ci
npm test
node --check client.js
```

本地包更新后需在 DSH 插件管理中停用再启用知识库，使宿主模块与客户端一起加载。

目录和预览请求通过 DSH 的 `connection.fetch` 接口校验工作区会话。如果知识库提示会话失效，重新打开 DSH 工作区，再点「管理目录」会重新读取目录并进入管理页。如果仍出现旧版提示「请从 DSH 页面内访问」，请核对 DSH 加载的本地插件目录和版本，再停用并重新启用插件。

## 配置与数据

`cordis.patch.yml` 的配置包括 `roots`、`exclude`、`watchIntervalMs`，并支持
`maxDocuments`（默认 5000）和 `maxFileBytes`（默认 8 MiB）。默认每 5 秒补偿扫描。

目录、收藏、标签与阅读记录保存在 `$DSH_HOME/dsh-html-library/library.json`。
索引在内存里；冷启动重新扫描，同进程按 size + mtime 复用文件结果。

拖动目录树右侧的分隔线可以调整栏宽，当前浏览器会记住宽度。也可以用 Tab 聚焦分隔线，再按左右方向键调整。历史验收及当前桌面验证见 `VERIFICATION-V1.1.md`。
