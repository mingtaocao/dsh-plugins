# 兼容性与公开数据依据

## DSH

运行测试：npm `@deepseek-ai/dsh@0.2.2-rc.1`，Node 24.22.1，Linux x86_64。官方 checkout `39163dd30f703a79079e2d2446545cff3c453738` 的版本为 rc.3，只用于定位文档；实际接口由安装的 rc.1 类型和 Host 集成测试确认。尚未确认用户本机的 DSH 版本或桌面模式。

Host 使用 `storageDomain.open`、全局单快照 `get/set` 与 `connection.fetch.register`。客户端使用 `main`、`sidebar.panellist`、`locale` 和宿主 React。所有 UI 都在 Slot 中渲染，未修改宿主源码或注入独立 iframe。

## Super Productivity

首版仅支持含 `data` 的包装备份，且 `crossModelVersion === 4.5`。不是对当前软件所有导出格式的支持声明。

- 官方仓库：https://github.com/super-productivity/super-productivity
- 固定 commit：`e04f440fbf56cd4dd2e8c4a3f8505d73fc454714`
- 真实官方 E2E 样本：`e2e/fixtures/test-backup.json`
- 本地副本：`tests/fixtures/sp-official-4.5.json`
- SHA256：`992aca4e81c887f2cd1524b84c05a8edfcb1129f3239c1825e0d3b31d5806c43`
- 样本授权：MIT，Johannes Millan；完整声明保存在 `tests/fixtures/SP-LICENSE.txt`。
- 官方类型参考：同 commit 的 `src/app/features/tasks/task.model.ts`。

样本含 1 项目、2 主任务、1 子任务。测试校验原始 hash，再校验映射及重复导入，不以自行拼凑的样本代替公开证据。

| 源字段 | 本地映射 | 校验 |
|---|---|---|
| project.ids/entities | Project/source | ID 清单一致、重复检查 |
| project.title | name | 必填、长度、重名检查 |
| project.taskIds/backlogTaskIds | 顶层 list/board/matrixOrder | 保留相对顺序；属于合法项目的其余活动任务追加末尾，不丢弃 |
| project.isArchived | archivedAt | 布尔；时间为本地迁移时间，不伪装历史原值 |
| task.projectId | projectId | 子任务缺省时继承父项目；显式不一致拒绝 |
| task.parentId/subTaskIds | parentId + 子任务顺序 | 双向一致、两级、不能孤儿或循环 |
| task.isDone | todo/done | 仅接受布尔，不能推断 doing |
| task.notes | notes | 纯文本；不执行 HTML |
| task.created | createdAt | 有限毫秒时间戳 |
| task.dueDay | dueDate | 真实 YYYY-MM-DD 日期 |
| 无已验证的象限字段 | false/false | 不从优先级、标签推断 |
| archiveYoung/archiveOld.task | 不导入 | 预览列出跳过数量 |
| 计时、标签、配置、其他字段 | 不导入 | 预览列出未支持字段或模块名，不保存字段内容 |

SP 没有已核实的准确完成时间映射：本地 `completedAt` 使用导入时间，`completionTimeEstimated=true` 标明估算；用户恢复再完成后重新记录真实本地操作时间。

裸状态快照、未知 crossModelVersion、结构不完整、引用断裂和异常字段类型一律拒绝，原库不变。未来新增适配必须先补官方公开样本与 golden test，不能放宽为“猜测结构也导入”。

旧版 DSH 原生 v1 备份里的 `blocked` 导入时转为 `todo`；新导出只包含 todo/doing/done。
