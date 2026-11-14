# DSH Plugins

个人开发与维护的 DSH 插件集合。采用单仓库、多插件（Monorepo）管理。

> 当前状态：仓库结构初始化中。插件入口、配置和构建方案须以实际 DSH 官方接口为准，尚未验证可运行。

## 插件

| 插件 | 目录 | 目标 | 状态 |
| --- | --- | --- | --- |
| HTML Library | [plugins/html-library](plugins/html-library/README.md) | 管理、阅读本地 HTML 知识文件 | 规划中 |
| Task Manager | [plugins/task-manager](plugins/task-manager/README.md) | 多项目任务、看板与四象限 | 规划中 |

## 开发流程

先验证 DSH 插件 API 和扩展机制，再明确需求和验收条件、设计、拆分任务、编码、自动化测试、实际 DSH 加载验收。

详见 [开发规范](docs/DEVELOPMENT.md) 和 [验证 TODO](docs/VERIFICATION.md)。

## 声明

本仓库当前只包含插件工作区骨架，不提供可安装包。未添加开源许可证；公开可见不等于授权复用。
