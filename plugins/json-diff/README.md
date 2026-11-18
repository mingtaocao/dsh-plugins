# 文件对比

在 DSH 侧栏打开「文件对比」，左边粘贴原文，右边粘贴新版。点「对比」或按 Ctrl+Enter（macOS 用 ⌘+Enter）。结果按行对齐，左侧的 − 标出删除内容，右侧的 + 标出新增内容，修改行并排显示。长文档可勾选「只看差异」隐藏相同行。

默认使用 JSON 模式。结果按统一缩进显示，保留字段顺序、重复键和大整数的原始写法。行号对应格式化后的结果。选择「纯文本」可比较原始行，包括空格和标点。每侧最多支持 50 万字符、5000 行；大段无共同内容时界面会提示分段。

## 安装

在仓库根目录运行 `dsh plugin --profile web add ./plugins/json-diff`，重新打开 DSH Web 工作区。此插件通过 `sidebar.panellist` 和 `main` 注册面板，比较在浏览器内完成，粘贴内容只保存在面板内存中。

在插件目录运行 `npm test` 验证比较逻辑。

已在 DSH Web rc4 和 Chromium 中验证侧栏打开、逐行对比、只看差异、快捷键和错误后重新比较。在临时 web profile 中也验证了禁用配置和卸载。卸载命令为 `dsh plugin --profile web remove dsh-json-diff`。
