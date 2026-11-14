# 实现记录与后续 TODO

## 当前适配

目标：npm DSH 0.2.2-rc.1，Node 24.22.1，Linux；不是用户本机的现有 Profile。官方源码参考 commit `39163dd30f703a79079e2d2446545cff3c453738`，最终运行检查以安装的 rc.1 类型和代码为准。

- `package.json.dsh.bundle.patch` + `cordis.patch.yml` 插入 Host 行；`./client` 通过 `window.__ModuleLoader__.load` 注册，React 来自宿主模块表。
- `main` keyed slot `mt-tasks` 提供原生页面；`sidebar.panellist` 提供侧栏入口。locale 与注册均由 Cordis 生命周期清理。
- `ctx.storageDomain.open` 打开独立单快照域 `mingtaocao_task_manager`。schemaVersion 1；未知版本拒绝，不自动清库。存储目录由宿主配置决定，不写用户工作区。
- `ctx.connection.fetch.register` 注册 `/api/mt-tasks` POST，沿用宿主信任与认证机制，只有 owner Peer 可访问。默认不发送任务到外部网络。
- TaskService 串行化写入，校验 revision 和 requestId；一次事务替换全快照，持久化成功后才刷新前端。保存失败维持原值；客户端不进行乐观落库。
- 父子移动/删除和导入均为同一快照写操作。源 ID 与本地 UUID 分离，导入幂等；列表、看板、矩阵顺序独立。
- UI 共用一个 Host 快照。重新连接与窗口聚焦时重读；请求按 revision 防止旧响应覆盖新数据。正在编辑的详情保留草稿及其 revision，冲突时要求重新打开，不静默覆盖。
- 每组先显示 100 张卡片，按需加载更多；子任务索引由快照一次生成。真实 UI 性能尚未验证。

官方定义：DSH `docs/subsystems/web-client.md`，`packages/client/ui-layout/src/client/index.ts`、`packages/client/ui-sidebar/src/client/contract/slots.ts`；已安装的 `dsh-storage-domain/lib/types/{index,spec,domain}.d.ts` 和 `dsh-client-connection/lib/types/rpc.d.ts`。

## 移除阻塞状态

2026-11-14 按用户要求只保留 todo/doing/done；看板改三列，移除阻塞文案、筛选项和样式。Host 启动时在注册接口前校验并持久化旧 blocked→todo 迁移，revision 递增一次，后续加载不重复迁移。保存失败中止启动。旧版原生备份走相同映射；新编辑和拖拽拒绝 blocked。

## 执行状态

左侧导航调整：列表、看板、四象限入口统一放在项目列表上方，项目区域独立滚动；顶部显示当前视图标题，导入导出收进右上角「…」菜单。真实宿主已验证三视图切换、选中态、项目/状态筛选保留与键盘操作，见 UI-DESIGN.md。

2026-11-14 本机视觉迭代：参考用户已安装的 Super Productivity 的项目列表、看板、右侧详情和任务菜单。新增紧凑列表行、标签选择器、原生 Popover 任务菜单及单处子任务进度；缩窄项目栏并调整列宽。验证范围与截图见 [UI-DESIGN.md](UI-DESIGN.md)。本轮不解除完整发布验收门槛，前轮发现的草稿保存冲突和跨面板草稿丢失仍未修复。

用户在浏览器验证受阻后要求继续；本轮继续源码和服务层测试。原执行规范的 **Gate 0 与发布准入仍为 BLOCKED**，不能将下方源码已实现视为完整验收通过。

- [x] 两份原始开发依据纳入仓库。
- [x] DEV-000 源码与 Host 接入；真实 API、启停重启集成检查。
- [x] DEV-010/011/020/021/022 数据服务、项目、任务、子任务、排序源码及核心测试。
- [x] DEV-030/031/032/033 三视图、筛选、详情与非拖拽操作源码。
- [x] DEV-040 原生 JSON 备份、预览、幂等合并、失败回滚。
- [x] DEV-041 SP 4.5 官方 fixture 的限定适配与 golden test；不承诺其他版本。
- [ ] DEV-050 实际宿主浏览器离线、键盘、隐私及生命周期验收。
- [ ] DEV-051 真实浏览器 7,020 实体冷启动、P95、内存与拖拽基准。
- [ ] DEV-052 独立 QA 全量运行 V-001～V-030 并放行。

## 在可访问 DSH 的环境继续

1. `npm ci && npm run check && npm test`。
2. 配置 `DSH_BIN`，运行 `npm run test:host`。
3. 在独立测试 Web Profile 使用插件管理页面安装当前目录，查看侧栏及中英文插件元数据。
4. 按 EXECUTION.md 的标准 seed 建立 P_DSH/P_LOCALPM、T_A～T_D、S_A1/S_A2；三视图截图与存储断言逐条留证。
5. 核心链路：创建任务 → 看板待办 → 进行中 → 矩阵 Q1 → 一个子任务完成 → 父子一起换项目 → 导出/导入新测试库 → 重启回读。
6. 执行 V-001～V-030。每项记录实际操作、预期/实际值、证据路径、PASS/FAIL/BLOCKED/NOT_RUN，不用源码检查替代 UI 结果。
7. 修复实际缺陷后复测；全部 P0 通过再解除草稿状态并发布。

紧凑布局补充：默认状态和 Q4 不常驻卡片，辅助信息合并一行；共享 ActionMenu 提供任务、备份和项目选项。常驻归档复选框改为项目菜单入口，保留只读查看与恢复。真实宿主的尺寸、导入导出、归档恢复、分类、排序、拖拽及子任务验收见 UI-DESIGN.md 的最新记录。
