# DSH Plugins

个人开发与维护的 DSH 插件集合。采用单仓库、多插件（Monorepo）管理。

> 当前状态：HTML Library 与 Task Manager 均已有开发预览源码及自动化测试；完整宿主界面验收尚未通过。

## 插件

| 插件 | 目录 | 目标 | 状态 |
| --- | --- | --- | --- |
| HTML Library | [plugins/html-library](plugins/html-library/README.md) | 本地 HTML 知识库：浏览阅读、中文检索、收藏与标签 | 开发预览，待真实宿主验收 |
| Task Manager | [plugins/task-manager](plugins/task-manager/README.md) | 多项目任务、看板与四象限 | 开发预览，待 UI 验收 |
| 文件对比 | [plugins/json-diff](plugins/json-diff/README.md) | 左右粘贴 JSON 或纯文本，逐行查看差异 | 开发预览 |

## 开发流程

先验证 DSH 插件 API 和扩展机制，再明确需求和验收条件、设计、拆分任务、编码、自动化测试、实际 DSH 加载验收。

详见 [开发规范](docs/DEVELOPMENT.md) 和 [验证 TODO](docs/VERIFICATION.md)。

## 声明

Task Manager 可从插件目录在测试 Profile 加载，当前不提供已验收发布包。未添加开源许可证；公开可见不等于授权复用。
