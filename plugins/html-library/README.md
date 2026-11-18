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
- 默认禁脚本、远程资源、表单、嵌套 iframe；需要页面脚本或外部链接时使用系统浏览器打开。
- 右侧浏览器图标由宿主调用系统打开操作，打开原文件的 `file://` URL，不使用端口地址。

预览限制：单文件 8 MiB、资源总计 32 MiB、128 个不同资源。大文档或复杂动态页面请用系统浏览器。
外部 SVG 的 use 引用、复杂 data srcset 组合与非 UTF-8 外部 CSS 仍需额外兼容性验证。

## 文件操作

展开右侧“文档详情”，编辑文件名并点“重命名”。

- 仅支持已索引 HTML/HTM/XHTML 文件在原文件夹内改名。
- 不覆盖已有文件，拒绝路径穿越和文件软链接重命名。
- 收藏、标签、阅读记录同步迁移，新文件名在重新扫描和重启后有效。
- 文件内容、页面标题、其他页面指向该文件的链接不自动改写。
- 只有显式提交重命名会变动源目录；预览和搜索只读。

本轮不包含文件删除、文件夹重命名、移动和内容编辑。

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

阅读位置、栏宽拖拽和全局快捷键尚未实现。历史验收及当前桌面验证见 `VERIFICATION-V1.1.md`。
