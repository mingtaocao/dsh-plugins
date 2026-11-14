# Task Manager — 开发预览

DSH 原生 Web 插件，任务数据由 Host 统一持久化，不依赖聊天会话。

已实现源码：多项目创建/改名/排序/归档/恢复/删除，任务详情与待办/进行中/完成三状态，两级子任务，列表/看板/四象限，拖拽与按钮排序，项目范围与状态筛选，本地 JSON 备份/幂等合并导入。新任务默认待办、`important=false`、`urgent=false`；父子任务独立完成。

**当前不是已完成验收的发布版本。** 核心自动化测试、真实 DSH Host API 与停用/重新启用/重启持久化已通过；实际浏览器中的界面、拖拽、主题与键盘操作已有定向验证，完整验收仍未完成。详见 [验证报告](docs/VERIFICATION-REPORT.md)。

## 安装到 DSH

先在 `plugins/task-manager` 目录执行 `npm ci` 安装本插件依赖。然后在 DSH 的 **插件 → 添加插件 → 本地目录** 中选择本仓库的 `plugins/task-manager`。需要支持 `storageDomain`、`connection.fetch`、`main`、`sidebar.panellist` 的 Web Profile。测试基线为 npm 发布的 DSH `0.2.2-rc.1`，不保证其他预发布版本。

安装后从侧栏「任务管理」进入。先创建项目，再新建任务；也可在所有项目视图选择新任务所属项目。卡片「…」中的状态和象限选择器可替代拖拽；详情在右侧打开。右上角「…」提供导入导出，导入先显示预览，再确认合并，不替换现有数据。项目旁的「…」提供归档入口；归档仅隐藏项目和任务，支持恢复。

已移除阻塞状态和看板列。加载旧数据或导入旧版原生备份时，`blocked` 任务自动转为 `todo`，保留任务内容、关系与顺序。

停用不会删除插件存储域 `mingtaocao_task_manager` 中的数据；建议先导出备份再升级或卸载。没有“替换全部”、云同步、今日任务、Backlog 模块、计时或周期任务。

## JSON 兼容范围

- DSH：`format=dsh-task-manager`、`schemaVersion=1`，保留项目、任务、子任务、归档、状态、象限与各视图顺序。
- Super Productivity：仅支持官方公开 fixture 核实的 **`crossModelVersion=4.5`、含 `data` 的包装备份**。映射项目、活动主任务、子任务、完成状态、备注、截止日期和排序；未知版本或裸快照拒绝导入。
- SP 历史归档任务不导入，预览显示数量；标签、计时、规划、配置及其他未支持字段列入诊断。源文件中的 Inbox 项目是普通导入项目，不会生成独立 Inbox/Backlog 模块。
- SP 已完成任务无已核实的完成时间时，以导入时间记录并设置 `completionTimeEstimated=true`，不冒充原始完成时间。
- 单文件最大 20 MiB，总实体最大 20,000。来源 ID 去重，不按标题合并；同名不同来源项目拒绝导入并提示先重命名。

样本来源、hash、字段依据及许可证见 [兼容性说明](docs/COMPATIBILITY.md)。

## 开发与测试

Node >=24.9；在此目录执行：

```sh
npm ci
npm run check
npm test
npm pack --dry-run
```

真实宿主集成检查需要已安装的 DSH CLI：

```sh
DSH_BIN=/absolute/path/to/dsh npm run test:host
```

脚本使用临时独立 `DSH_HOME`，通过官方 CLI 安装，验证认证 API 和启用/停用/重新启用、重启持久化，结束后删除测试数据。不会接触用户工作 Profile。它不等同于浏览器端 E2E。

## 开发依据

- [完整需求](docs/REQUIREMENTS.md)
- [分析开发测试规范](docs/EXECUTION.md)
- [实现与后续步骤](docs/IMPLEMENTATION.md)
- [验证报告与未通过项](docs/VERIFICATION-REPORT.md)
