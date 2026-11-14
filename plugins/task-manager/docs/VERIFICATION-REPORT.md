# 验证报告

日期：2026-11-14。插件 0.1.0 开发预览；DSH npm 0.2.2-rc.1，Node 24.22.1，Linux。**总体结论：BLOCKED，尚不能发布为已验收版本。**

## 已执行检查

| 检查 | 实际结果 |
|---|---|
| `npm run check` | Host、Client、core JS 语法检查退出码 0 |
| `npm test` | 22 个核心用例全部通过，0 失败、0 跳过 |
| `DSH_BIN=/path/to/dsh npm run test:host` | 真实 DSH 安装、认证 API、禁用/重新启用及重启持久化通过；见 evidence/host.txt |
| `npm pack --dry-run --json` | 已执行；实际包清单检查包含 manifest、patch、Host/Client、core、locale、icon、README、docs；不包含用户数据 |
| SP 官方样本 | hash 固定，1 项目、2 主任务、1 子任务的 golden test 和重复导入通过 |
| 核心规模检查 | 20 项目、2,000 主任务、5,000 子任务；最近一次校验+mutation 97.1 ms。不是浏览器冷启动、P95 或内存性能结果 |
| 独立审查 | 独立 Agent 复跑初始 21 用例，通过；发现并修复非法 view 参数、滚动与反馈、重复提交防护。最终新增安全用例由主开发运行通过 |

真实宿主测试会建立唯一临时 DSH_HOME，用官方 CLI 安装；在同一测试进程中启动 HTTP 服务、交换官方 launch token 获取 cookie，然后调用宿主认证 API。日志不保存 token/cookie。测试结束清理独立 Profile，不操作用户数据。

## V-001～V-030 的整体状态

以下用例包含 UI 操作或现场证据，不能仅凭核心单测全部标为 PASS。

| 用例 | 已验证层 | 整体状态 / 还缺什么 |
|---|---|---|
| V-001 | Host 安装、启停、重启、boot graph | BLOCKED：入口点击、界面、卸载及重复注册 |
| V-002/003/004/005 | 项目 CRUD、重名、排序、归档和级联原子逻辑 | BLOCKED：对应界面和确认弹窗 |
| V-006/007/008 | 默认值、校验、四状态、保存逻辑 | BLOCKED：三视图显示、输入、脚本安全的浏览器验证 |
| V-009 | 独立顺序与分组限制 | BLOCKED：三视图实际拖拽与重启回显 |
| V-010/011/012 | 两级、独立完成、进度输入、父子迁移 | BLOCKED：界面进度和项目范围回显 |
| V-013/014 | 分组所用字段/不变量已测 | BLOCKED：标准 seed 的实际卡片与数量 |
| V-015/016 | 状态与象限独立；Host API 与重启回读 | BLOCKED：真实 UI 拖拽、列表/矩阵/看板回显 |
| V-017/018 | UI 源码已实现筛选和完成显示 | BLOCKED：实际 Scope/开关操作 |
| V-019 | Host 独立存储与进程重启恢复 | BLOCKED：浏览器刷新与用户 Session 切换 |
| V-020/021 | 原生 JSON 往返、来源映射、幂等、Host 预览 | BLOCKED：真实文件选择/下载/确认流程 |
| V-022 | 官方 SP 4.5 golden test、父子顺序与幂等 | BLOCKED：真实导入预览与三视图操作；其他版本未适配 |
| V-023/024 | 未知格式、无效关系、重复 ID、写失败回滚 | BLOCKED：UI 错误提示与实际介质中断故障注入 |
| V-025 | 核心无网络依赖 | NOT_RUN：实际断网浏览器完整流程 |
| V-026 | 7,020 实体核心检查 | BLOCKED：浏览器冷启动/P95/内存/拖拽 |
| V-027 | Host 停用与重新启用、持久化 | BLOCKED：实际 UI 清理和其他插件隔离现场检查 |
| V-028 | 表单、选择器、排序按钮源码 | NOT_RUN：完整键盘/焦点路径 |
| V-029 | 写失败、重复 requestId、并发 revision 冲突 | BLOCKED：双窗口与前端故障提示的实际操作 |
| V-030 | 原型污染/非法 view 拒绝、导入字段白名单、匿名 API 401 | BLOCKED：浏览器网络/日志及脚本内容实际运行检查 |

## 环境阻塞

交互浏览器无法访问隔离 exec 服务的 localhost（连接拒绝）。同进程启动 DSH + headless Chromium 时，Chromium 在创建 process singleton socket 处因 `Operation not permitted` 退出；没有得到插件页面截图。未绕过环境限制，未用仿真页面充当 DSH 验收证据。

因此 Gate 0、视觉验收和独立 QA 全量 P0 放行仍然 BLOCKED。用户要求继续后只推进源码、真实 Host API 与核心测试，不取消发布门槛。

## 已修复的测试/审查发现

- 存储域名称不能用连字符，改为 `mingtaocao_task_manager`。
- rc.1 独立 RPC 通道注册遇到 Cordis 服务注入错误，改用官方认证的 `connection.fetch` 注册。
- 原生导出对象与状态共享引用，改为复制后返回，避免调用方改动当前状态。
- 非法 `view=constructor/__proto__/toString` 可命中对象原型，改为显式白名单，新增回归用例。
- 只在 mutation 成功后显示已保存；导入预览和读取不表示入库。
- 看板列独立滚动、拖拽落点提示、每组分页、子任务索引已加入；布局效果待实际 UI 验证。
- 快速重复提交的锁定分支统一返回 false；详情草稿保留原 revision，冲突不会静默写入。

下一步按 IMPLEMENTATION.md 和 EXECUTION.md，在可访问的真实 DSH 测试 Profile 中完成所有 UI 用例，再放行。
