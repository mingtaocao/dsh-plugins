/** Native React/Slots page. Host RPC is the only durable source for every view. */
window.__ModuleLoader__.load({
  id: "@mingtaocao/dsh-task-manager",
  factory(require) {
    const React = require("react"),
      h = React.createElement;
    const zh = {
      skippedArchives: "跳过的历史归档任务",
      unsupported: "未导入的字段或模块",
      more: "显示更多",
      title: "任务管理",
      list: "列表",
      board: "看板",
      matrix: "四象限",
      all: "所有项目",
      projects: "项目",
      archived: "已归档",
      newProject: "新建项目",
      newTask: "添加任务",
      taskTitle: "任务名称",
      projectName: "项目名称",
      create: "创建",
      save: "保存",
      cancel: "取消",
      close: "关闭",
      rename: "编辑项目",
      archive: "归档",
      restore: "恢复",
      remove: "删除",
      confirm: "确认删除",
      deleteProject: "删除项目及其全部任务？建议先导出备份。",
      deleteTask: "删除此任务及其子任务？建议先导出备份。",
      description: "描述",
      notes: "备注",
      status: "状态",
      priority: "优先级",
      dueDate: "截止日期",
      important: "重要",
      urgent: "紧急",
      todo: "待办",
      doing: "进行中",
      blocked: "阻塞",
      done: "完成",
      low: "低",
      normal: "普通",
      high: "高",
      q1: "重要且紧急",
      q2: "重要不紧急",
      q3: "不重要但紧急",
      q4: "不重要不紧急",
      showDone: "显示已完成",
      anyStatus: "全部状态",
      noProjects: "创建第一个项目",
      empty: "暂无任务",
      selectProject: "请先选择活动项目",
      details: "任务详情",
      subtasks: "子任务",
      addChild: "添加子任务",
      export: "导出 JSON",
      import: "导入 JSON",
      preview: "导入预览",
      importConfirm: "确认合并导入",
      counts: "新增项目 / 主任务 / 子任务 / 跳过",
      importNote:
        "仅合并，不覆盖现有任务。支持 DSH 原生 JSON；仅支持已核实的 SP 4.5 包装备份。文件上限 20 MiB。",
      refresh: "刷新",
      loading: "正在加载…",
      busy: "处理中…",
      up: "上移",
      down: "下移",
      error: "操作失败",
      saved: "已保存",
      invalidFile: "文件上限 20 MiB",
      discard: "放弃尚未保存的修改？",
      complete: "标记完成",
      reopen: "恢复待办",
      countsDetail: "主任务 / 子任务",
      move: "移动象限",
      inherited: "象限与项目跟随父任务",
      retry: "重试",
      chooseFile: "选择 JSON 文件",
    };
    const en = {
      skippedArchives: "Skipped archive tasks",
      unsupported: "Unsupported fields or sections",
      more: "Show more",
      title: "Task manager",
      list: "List",
      board: "Board",
      matrix: "Matrix",
      all: "All projects",
      projects: "Projects",
      archived: "Archived",
      newProject: "New project",
      newTask: "Add task",
      taskTitle: "Task title",
      projectName: "Project name",
      create: "Create",
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      rename: "Edit project",
      archive: "Archive",
      restore: "Restore",
      remove: "Delete",
      confirm: "Confirm deletion",
      deleteProject:
        "Delete this project and all tasks? Export a backup first.",
      deleteTask: "Delete this task and its subtasks? Export a backup first.",
      description: "Description",
      notes: "Notes",
      status: "Status",
      priority: "Priority",
      dueDate: "Due date",
      important: "Important",
      urgent: "Urgent",
      todo: "To do",
      doing: "In progress",
      blocked: "Blocked",
      done: "Done",
      low: "Low",
      normal: "Normal",
      high: "High",
      q1: "Important and urgent",
      q2: "Important, not urgent",
      q3: "Urgent, not important",
      q4: "Neither important nor urgent",
      showDone: "Show completed",
      anyStatus: "All statuses",
      noProjects: "Create your first project",
      empty: "No tasks",
      selectProject: "Choose an active project first",
      details: "Task details",
      subtasks: "Subtasks",
      addChild: "Add subtask",
      export: "Export JSON",
      import: "Import JSON",
      preview: "Import preview",
      importConfirm: "Merge import",
      counts: "New projects / tasks / subtasks / skipped",
      importNote:
        "Merges without replacing existing tasks. Supports DSH native JSON and verified SP 4.5 wrapped backups. Limit: 20 MiB.",
      refresh: "Refresh",
      loading: "Loading…",
      busy: "Working…",
      up: "Move up",
      down: "Move down",
      error: "Operation failed",
      saved: "Saved",
      invalidFile: "File limit: 20 MiB",
      discard: "Discard unsaved changes?",
      complete: "Mark done",
      reopen: "Reopen",
      countsDetail: "Tasks / subtasks",
      move: "Move quadrant",
      inherited: "Project and quadrant follow the parent task",
      retry: "Retry",
      chooseFile: "Choose JSON file",
    };
    const css = `.mtt{height:100%;min-height:0;display:flex;flex-direction:column;font-family:inherit;font-size:14px;line-height:1.5;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base)}.mtt *{box-sizing:border-box}.mtt button,.mtt input,.mtt select,.mtt textarea{font:inherit;color:inherit;border:.5px solid var(--dsw-alias-border-l3);border-radius:6px;background:var(--dsw-alias-bg-base);padding:6px 9px}.mtt button{cursor:pointer}.mtt button:hover,.mtt button[aria-pressed=true]{background:var(--dsw-alias-interactive-bg-hover)}.mtt button:disabled{opacity:.55;cursor:default}.mtt :focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}.mtt-head{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:18px 22px;border-bottom:.5px solid var(--dsw-alias-border-l3)}.mtt h1{font-size:20px;margin:0 auto 0 0}.mtt h2{font-size:15px;margin:0}.mtt h3{font-size:14px;margin:0}.mtt-body{display:flex;flex:1;min-height:0}.mtt-projects{width:205px;flex-shrink:0;overflow:auto;padding:16px 12px;border-right:.5px solid var(--dsw-alias-border-l3)}.mtt-projects>button{display:block;width:100%;text-align:left;margin-bottom:5px}.mtt-main{flex:1;min-width:0;display:flex;flex-direction:column}.mtt-tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:14px 18px}.mtt-tools input{min-width:150px;flex:1}.mtt-content{flex:1;min-height:0;overflow:auto;padding:0 18px 20px}.mtt-columns{height:100%;grid-template-rows:minmax(0,1fr);display:grid;grid-template-columns:repeat(4,minmax(210px,1fr));gap:12px;min-height:200px}.mtt-matrix{grid-template-rows:repeat(2,minmax(160px,1fr));min-height:360px;grid-template-columns:repeat(2,minmax(230px,1fr))}.mtt-group{background:var(--dsw-alias-bg-layer-1);border:.5px solid var(--dsw-alias-border-l3);border-radius:10px;padding:12px;min-height:0;overflow-y:auto;overscroll-behavior:contain}.mtt-group>h2{margin-bottom:12px}.mtt [data-drop=true]{outline:1px dashed var(--dsw-alias-brand-primary);outline-offset:-2px}.mtt-card{border:.5px solid var(--dsw-alias-border-l3);border-radius:8px;background:var(--dsw-alias-bg-base);padding:12px;margin-bottom:9px;overflow-wrap:anywhere}.mtt-row{display:flex;gap:7px;align-items:center}.mtt-row.wrap{flex-wrap:wrap}.mtt-task-title{border:0!important;padding:0!important;background:none!important;text-align:left;flex:1;min-width:0}.mtt-done .mtt-task-title{text-decoration:line-through;color:var(--dsw-alias-label-tertiary)}.mtt-meta{font-size:12px;color:var(--dsw-alias-label-secondary);margin:6px 0}.mtt-card select{max-width:100%;font-size:12px}.mtt-child{margin-top:8px;padding-left:12px;border-left:.5px solid var(--dsw-alias-border-l3)}.mtt-detail{width:340px;flex-shrink:0;border-left:.5px solid var(--dsw-alias-border-l3);padding:18px;overflow:auto}.mtt label.field{display:flex;flex-direction:column;gap:5px;margin:12px 0}.mtt textarea{resize:vertical;min-height:90px;width:100%}.mtt-check{display:flex;gap:6px;align-items:center}.mtt-message{padding:8px 20px;color:var(--dsw-alias-label-secondary)}.mtt-error{color:var(--dsw-alias-state-error-primary)}.mtt-dialog{height:auto;display:block;max-height:90vh;overflow:auto;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);border:.5px solid var(--dsw-alias-border-l2);border-radius:12px;padding:24px;max-width:560px;width:90vw}.mtt-dialog::backdrop{background:var(--dsw-alias-bg-layer-3);opacity:.7}.mtt-dialog pre{white-space:pre-wrap}.mtt-empty{padding:24px 0;color:var(--dsw-alias-label-tertiary)}@media(max-width:1050px){.mtt-projects{width:170px}.mtt-detail{position:absolute;right:0;top:0;bottom:0;max-width:95%;background:var(--dsw-alias-bg-base);z-index:2}.mtt-body{position:relative}}@media(max-width:650px){.mtt-projects{width:130px}.mtt-head{padding:12px}.mtt-matrix{grid-template-rows:repeat(2,minmax(160px,1fr));min-height:360px;grid-template-columns:1fr}.mtt-content{padding:0 10px 12px}}`;
    const statuses = ["todo", "doing", "blocked", "done"];
    const quads = [
      [true, true, "q1"],
      [true, false, "q2"],
      [false, true, "q3"],
      [false, false, "q4"],
    ];
    const qkey = (t) =>
      quads.find((q) => q[0] === t.important && q[1] === t.urgent)[2];
    function Button({ children, ...props }) {
      return h("button", { type: "button", ...props }, children);
    }
    function Field({ label, children }) {
      return h(
        "label",
        { className: "field" },
        h("span", null, label),
        children,
      );
    }
    function Dialog({ title, onClose, children, error }) {
      const ref = React.useRef();
      React.useEffect(() => {
        const node = ref.current,
          prior = document.activeElement;
        node.showModal();
        return () => {
          node.close();
          if (prior?.isConnected) prior.focus();
        };
      }, []);
      return h(
        "dialog",
        {
          ref,
          className: "mtt mtt-dialog",
          onCancel: (e) => {
            e.preventDefault();
            onClose();
          },
          "aria-label": title,
        },
        h("h2", null, title),
        error ? h("p", { role: "alert", className: "mtt-error" }, error) : null,
        children,
      );
    }
    function Page({ t, api, model }) {
      const snapshot = React.useSyncExternalStore(
        model.subscribe,
        model.getSnapshot,
      );
      const [scope, setScope] = React.useState("all"),
        [view, setView] = React.useState("list"),
        [status, setStatus] = React.useState("all"),
        [archived, setArchived] = React.useState(false),
        [showDone, setShowDone] = React.useState(false),
        [selected, setSelected] = React.useState(null),
        [dialog, setDialog] = React.useState(null),
        [title, setTitle] = React.useState(""),
        [error, setError] = React.useState(""),
        [busy, setBusy] = React.useState(false),
        [notice, setNotice] = React.useState("");
      const [createProject, setCreateProject] = React.useState("");
      const fileRef = React.useRef(),
        lock = React.useRef(false),
        detailDirty = React.useRef(false);
      const detailRevision = React.useRef(null),
        draftKey = React.useRef(null);
      React.useEffect(() => {
        api.refresh().catch((e) => setError(e.message));
      }, [api]);
      async function run(action, saved = false) {
        if (lock.current) return false;
        lock.current = true;
        setBusy(true);
        setError("");
        setNotice("");
        try {
          const value = await action();
          setNotice(saved ? t("saved") : "");
          return value;
        } catch (e) {
          setError(e.message);
          return false;
        } finally {
          lock.current = false;
          setBusy(false);
        }
      }
      const change = (op, args, revision) =>
        run(async () => {
          const result = await api.mutate(op, args, revision);
          if (!detailDirty.current)
            detailRevision.current = result.state.revision;
          return result;
        }, true);
      const [dragTarget, setDragTarget] = React.useState(null);
      const [limits, setLimits] = React.useState({});
      const state = snapshot.state;
      const projects = (state?.projects ?? [])
        .filter((p) => !!p.archivedAt === archived)
        .sort((a, b) => a.order - b.order);
      const current = state?.projects.find((p) => p.id === scope);
      const visible = new Set(
        projects
          .filter((p) => scope === "all" || p.id === scope)
          .map((p) => p.id),
      );
      const roots = (state?.tasks ?? []).filter(
        (task) =>
          task.parentId === null &&
          visible.has(task.projectId) &&
          (status === "all" || task.status === status),
      );
      const childMap = React.useMemo(() => {
        const map = new Map();
        for (const task of state?.tasks ?? []) {
          if (task.parentId === null) continue;
          const rows = map.get(task.parentId) ?? [];
          rows.push(task);
          map.set(task.parentId, rows);
        }
        for (const rows of map.values())
          rows.sort((a, b) => a.listOrder - b.listOrder);
        return map;
      }, [state]);
      const children = (id) => childMap.get(id) ?? [];
      function limited(items, key, render) {
        const limit = limits[key] ?? 100;
        return h(
          React.Fragment,
          null,
          items.slice(0, limit).map(render),
          items.length > limit
            ? h(
                Button,
                {
                  onClick: () =>
                    setLimits((values) => ({ ...values, [key]: limit + 100 })),
                },
                t("more") +
                  ` (${Math.min(limit, items.length)}/${items.length})`,
              )
            : null,
        );
      }
      const task = state?.tasks.find((task) => task.id === selected);
      function open(id) {
        if (detailDirty.current && !window.confirm(t("discard"))) return;
        detailDirty.current = false;
        detailRevision.current = snapshot.state?.revision;
        draftKey.current = snapshot.state?.tasks.find(
          (x) => x.id === id,
        )?.updatedAt;
        setSelected(id);
      }
      function sort(items, id, direction, sortView) {
        const ids = items.map((x) => x.id),
          i = ids.indexOf(id),
          j = i + direction;
        if (j < 0 || j >= ids.length) return;
        [ids[i], ids[j]] = [ids[j], ids[i]];
        return change("reorder", { view: sortView, ids });
      }
      function drop(e, group, beforeId) {
        setDragTarget(null);
        e.preventDefault();
        e.stopPropagation();
        const id = e.dataTransfer.getData("text/x-mt-task");
        if (!id || id === beforeId || archived) return;
        change("task.drop", { id, view, beforeId, ...group });
      }
      function quadrantSelect(item) {
        return h(
          "select",
          {
            "aria-label": t("move"),
            value: qkey(item),
            disabled: busy || archived,
            onChange: (e) => {
              const q = quads.find((q) => q[2] === e.target.value);
              change("task.update", {
                id: item.id,
                important: q[0],
                urgent: q[1],
              });
            },
          },
          quads.map((q) => h("option", { key: q[2], value: q[2] }, t(q[2]))),
        );
      }
      function card(item, group = {}) {
        const subs = children(item.id),
          project = state.projects.find((p) => p.id === item.projectId);
        return h(
          "article",
          {
            key: item.id,
            className: "mtt-card " + (item.status === "done" ? "mtt-done" : ""),
            "data-task-id": item.id,
            "data-drop": dragTarget === item.id,
            onDragEnd: () => setDragTarget(null),
            draggable: !busy && !archived,
            onDragStart: (e) => {
              e.dataTransfer.setData("text/x-mt-task", item.id);
              e.dataTransfer.effectAllowed = "move";
            },
            onDragOver: (e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragTarget(item.id);
            },
            onDrop: (e) => drop(e, group, item.id),
          },
          h(
            "div",
            { className: "mtt-row" },
            h("input", {
              type: "checkbox",
              checked: item.status === "done",
              disabled: busy || archived,
              "aria-label": t(item.status === "done" ? "reopen" : "complete"),
              onChange: (e) =>
                change("task.update", {
                  id: item.id,
                  status: e.target.checked ? "done" : "todo",
                }),
            }),
            h(
              Button,
              { className: "mtt-task-title", onClick: () => open(item.id) },
              item.title,
            ),
          ),
          h(
            "div",
            { className: "mtt-meta" },
            [
              scope === "all" ? project?.name : null,
              item.priority !== "normal" ? t(item.priority) : null,
              item.dueDate,
              subs.length
                ? `${subs.filter((s) => s.status === "done").length}/${subs.length}`
                : null,
            ]
              .filter(Boolean)
              .join(" / "),
          ),
          h(
            "div",
            { className: "mtt-row wrap" },
            h(
              "select",
              {
                "aria-label": t("status"),
                value: item.status,
                disabled: busy || archived,
                onChange: (e) =>
                  change("task.update", {
                    id: item.id,
                    status: e.target.value,
                  }),
              },
              statuses.map((s) => h("option", { key: s, value: s }, t(s))),
            ),
            quadrantSelect(item),
          ),
          h(
            "div",
            { className: "mtt-row", style: { marginTop: 7 } },
            ...[-1, 1].map((d) =>
              h(
                Button,
                {
                  key: d,
                  disabled: busy || archived,
                  "aria-label": t(d < 0 ? "up" : "down"),
                  onClick: () => {
                    const key = {
                      list: "listOrder",
                      board: "boardOrder",
                      matrix: "matrixOrder",
                    }[view];
                    const items = roots
                      .filter(
                        (x) =>
                          x.projectId === item.projectId &&
                          (view !== "board" || x.status === item.status) &&
                          (view !== "matrix" || qkey(x) === qkey(item)),
                      )
                      .sort((a, b) => a[key] - b[key]);
                    sort(items, item.id, d, view);
                  },
                },
                d < 0 ? "↑" : "↓",
              ),
            ),
          ),
          subs.length
            ? h(
                "details",
                null,
                h(
                  "summary",
                  null,
                  t("subtasks") +
                    ` ${subs.filter((s) => s.status === "done").length}/${subs.length}`,
                ),
                subs.map((s) =>
                  h(
                    "div",
                    { key: s.id, className: "mtt-child mtt-row" },
                    h("input", {
                      type: "checkbox",
                      checked: s.status === "done",
                      disabled: busy || archived,
                      "aria-label": s.title,
                      onChange: (e) =>
                        change("task.update", {
                          id: s.id,
                          status: e.target.checked ? "done" : "todo",
                        }),
                    }),
                    h(
                      Button,
                      {
                        className: "mtt-task-title",
                        onClick: () => open(s.id),
                      },
                      s.title,
                    ),
                  ),
                ),
              )
            : null,
        );
      }
      function group(label, items, changes) {
        const key = view === "board" ? "boardOrder" : "matrixOrder";
        return h(
          "section",
          {
            key: label,
            className: "mtt-group",
            "data-drop": dragTarget === "group-" + label,
            onDragOver: (e) => {
              e.preventDefault();
              setDragTarget("group-" + label);
            },
            onDragLeave: () => setDragTarget(null),
            onDrop: (e) => drop(e, changes),
          },
          h("h2", null, label + " " + items.length),
          limited(
            items.sort((a, b) => a[key] - b[key]),
            view + label,
            (x) => card(x, changes),
          ),
          !items.length ? h("p", { className: "mtt-empty" }, t("empty")) : null,
        );
      }
      function detail(item) {
        if (!detailDirty.current) draftKey.current = item.updatedAt;
        return h(
          "aside",
          { className: "mtt-detail", "aria-label": t("details"), key: item.id },
          h(
            "div",
            { className: "mtt-row" },
            h("h2", null, t("details")),
            h(Button, { onClick: () => open(null) }, t("close")),
          ),
          h(
            "form",
            {
              key: item.id + draftKey.current,
              onChange: () => {
                if (!detailDirty.current)
                  detailRevision.current = snapshot.state.revision;
                detailDirty.current = true;
              },
              onKeyDown: (e) => {
                if (e.key === "Escape") open(null);
              },
              onSubmit: async (e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget),
                  args = {
                    id: item.id,
                    title: data.get("title"),
                    description: data.get("description"),
                    notes: data.get("notes"),
                    status: data.get("status"),
                    priority: data.get("priority"),
                    dueDate: data.get("dueDate") || null,
                  };
                if (item.parentId === null) {
                  args.projectId = data.get("projectId");
                  args.important = data.has("important");
                  args.urgent = data.has("urgent");
                }
                const result = await change(
                  "task.update",
                  args,
                  detailRevision.current,
                );
                if (result !== false) {
                  detailDirty.current = false;
                  detailRevision.current = result.state.revision;
                }
              },
            },
            h(
              Field,
              { label: t("taskTitle") },
              h("input", {
                name: "title",
                defaultValue: item.title,
                required: true,
                maxLength: 200,
                disabled: archived,
              }),
            ),
            item.parentId === null
              ? h(
                  Field,
                  { label: t("projects") },
                  h(
                    "select",
                    {
                      name: "projectId",
                      defaultValue: item.projectId,
                      disabled: archived,
                    },
                    state.projects
                      .filter((p) => !p.archivedAt)
                      .map((p) =>
                        h("option", { key: p.id, value: p.id }, p.name),
                      ),
                  ),
                )
              : h("p", null, t("inherited")),
            h(
              Field,
              { label: t("status") },
              h(
                "select",
                {
                  name: "status",
                  defaultValue: item.status,
                  disabled: archived,
                },
                statuses.map((s) => h("option", { key: s, value: s }, t(s))),
              ),
            ),
            h(
              Field,
              { label: t("priority") },
              h(
                "select",
                {
                  name: "priority",
                  defaultValue: item.priority,
                  disabled: archived,
                },
                ["low", "normal", "high"].map((s) =>
                  h("option", { key: s, value: s }, t(s)),
                ),
              ),
            ),
            h(
              Field,
              { label: t("dueDate") },
              h("input", {
                name: "dueDate",
                type: "date",
                defaultValue: item.dueDate ?? "",
                disabled: archived,
              }),
            ),
            item.parentId === null
              ? h(
                  "div",
                  { className: "mtt-row" },
                  ...["important", "urgent"].map((k) =>
                    h(
                      "label",
                      { key: k, className: "mtt-check" },
                      h("input", {
                        type: "checkbox",
                        name: k,
                        defaultChecked: item[k],
                        disabled: archived,
                      }),
                      t(k),
                    ),
                  ),
                )
              : null,
            h(
              Field,
              { label: t("description") },
              h("textarea", {
                name: "description",
                defaultValue: item.description,
                maxLength: 100000,
                disabled: archived,
              }),
            ),
            h(
              Field,
              { label: t("notes") },
              h("textarea", {
                name: "notes",
                defaultValue: item.notes,
                maxLength: 100000,
                disabled: archived,
              }),
            ),
            h(
              "button",
              { type: "submit", disabled: busy || archived },
              t("save"),
            ),
          ),
          item.parentId === null
            ? h(
                "section",
                null,
                h("h3", null, t("subtasks")),
                children(item.id).map((s) =>
                  h(
                    "div",
                    { key: s.id, className: "mtt-child" },
                    h(Button, { onClick: () => open(s.id) }, s.title),
                    h(
                      "div",
                      { className: "mtt-row" },
                      h("span", null, t(s.status)),
                      ...[-1, 1].map((d) =>
                        h(
                          Button,
                          {
                            key: d,
                            disabled: busy || archived,
                            "aria-label": t(d < 0 ? "up" : "down"),
                            onClick: () =>
                              sort(children(item.id), s.id, d, "list"),
                          },
                          d < 0 ? "↑" : "↓",
                        ),
                      ),
                    ),
                  ),
                ),
                h(
                  "form",
                  {
                    onSubmit: async (e) => {
                      e.preventDefault();
                      const f = e.currentTarget;
                      const result = await change("task.create", {
                        projectId: item.projectId,
                        parentId: item.id,
                        title: new FormData(f).get("child"),
                      });
                      if (result !== false) f.reset();
                    },
                  },
                  h(
                    Field,
                    { label: t("addChild") },
                    h("input", {
                      name: "child",
                      required: true,
                      maxLength: 200,
                      disabled: archived,
                    }),
                  ),
                  h(
                    "button",
                    { type: "submit", disabled: busy || archived },
                    t("addChild"),
                  ),
                ),
              )
            : null,
          h(
            Button,
            {
              disabled: busy || archived,
              onClick: () => setDialog({ kind: "deleteTask", id: item.id }),
            },
            t("remove"),
          ),
        );
      }
      const dialogView = () => {
        if (!dialog) return null;
        const close = () => {
          if (!busy) setDialog(null);
        };
        if (["project", "rename"].includes(dialog.kind)) {
          const p = dialog.kind === "rename" ? current : null;
          return h(
            Dialog,
            { title: t(p ? "rename" : "newProject"), onClose: close, error },
            h(
              "form",
              {
                onSubmit: async (e) => {
                  e.preventDefault();
                  const d = new FormData(e.currentTarget);
                  const result = await change(
                    p ? "project.update" : "project.create",
                    p
                      ? {
                          id: p.id,
                          name: d.get("name"),
                          description: d.get("description"),
                        }
                      : { name: d.get("name") },
                  );
                  if (result !== false) setDialog(null);
                },
              },
              h(
                Field,
                { label: t("projectName") },
                h("input", {
                  name: "name",
                  autoFocus: true,
                  required: true,
                  maxLength: 200,
                  defaultValue: p?.name ?? "",
                }),
              ),
              p
                ? h(
                    Field,
                    { label: t("description") },
                    h("textarea", {
                      name: "description",
                      defaultValue: p.description,
                    }),
                  )
                : null,
              h(
                "div",
                { className: "mtt-row" },
                h("button", { type: "submit", disabled: busy }, t("save")),
                h(Button, { disabled: busy, onClick: close }, t("cancel")),
              ),
            ),
          );
        }
        if (dialog.kind === "preview")
          return h(
            Dialog,
            { title: t("preview"), onClose: close, error },
            h("p", null, t("importNote")),
            h(
              "p",
              null,
              dialog.preview.diagnostics.format +
                " / " +
                dialog.preview.diagnostics.version,
            ),
            h("p", null, t("counts")),
            h(
              "pre",
              null,
              `${dialog.preview.projects} / ${dialog.preview.tasks} / ${dialog.preview.subtasks} / ${dialog.preview.skipped}`,
            ),
            h(
              "p",
              null,
              t("archived") +
                ": " +
                dialog.preview.archived +
                " / " +
                t("done") +
                ": " +
                dialog.preview.completed,
            ),
            h(
              "pre",
              null,
              t("skippedArchives") +
                ": " +
                dialog.preview.diagnostics.skippedEntities +
                "\n" +
                t("unsupported") +
                ": " +
                dialog.preview.diagnostics.unsupported.join(", "),
            ),
            h(
              Button,
              {
                disabled: busy,
                onClick: async () => {
                  const r = await change("import", { input: dialog.input });
                  if (r !== false) setDialog(null);
                },
              },
              t("importConfirm"),
            ),
            h(Button, { disabled: busy, onClick: close }, t("cancel")),
          );
        const p = state.projects.find((p) => p.id === dialog.id),
          item = state.tasks.find((t) => t.id === dialog.id),
          related = state.tasks.filter((x) =>
            dialog.kind === "deleteProject"
              ? x.projectId === dialog.id
              : x.parentId === dialog.id,
          );
        return h(
          Dialog,
          { title: t("confirm"), onClose: close, error },
          h("p", null, t(dialog.kind)),
          h("strong", null, p?.name ?? item?.title),
          h(
            "p",
            null,
            t("countsDetail") +
              `: ${related.filter((x) => x.parentId === null).length} / ${related.filter((x) => x.parentId !== null).length}`,
          ),
          h(
            Button,
            {
              disabled: busy,
              onClick: async () => {
                const r = await change(
                  dialog.kind === "deleteProject"
                    ? "project.delete"
                    : "task.delete",
                  { id: dialog.id, confirm: true },
                );
                if (r !== false) {
                  setDialog(null);
                  if (dialog.kind === "deleteProject") setScope("all");
                  if (item) {
                    detailDirty.current = false;
                    open(null);
                  }
                }
              },
            },
            t("confirm"),
          ),
          h(Button, { disabled: busy, onClick: close }, t("cancel")),
        );
      };
      return h(
        "div",
        { className: "mtt", "data-task-manager": "" },
        h("style", null, css),
        h(
          "header",
          { className: "mtt-head" },
          h("h1", null, t("title")),
          ["list", "board", "matrix"].map((v) =>
            h(
              Button,
              { key: v, "aria-pressed": view === v, onClick: () => setView(v) },
              t(v),
            ),
          ),
          h(
            Button,
            {
              disabled: busy || !state,
              onClick: () =>
                run(async () => {
                  const data = await api.call("export");
                  const url = URL.createObjectURL(
                    new Blob([JSON.stringify(data, null, 2)], {
                      type: "application/json",
                    }),
                  );
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "dsh-tasks.json";
                  a.click();
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                }),
            },
            t("export"),
          ),
          h(
            Button,
            { disabled: busy, onClick: () => fileRef.current.click() },
            t("import"),
          ),
          h("input", {
            type: "file",
            accept: ".json,application/json",
            ref: fileRef,
            hidden: true,
            "aria-label": t("chooseFile"),
            onChange: (e) => {
              const file = e.target.files[0];
              e.target.value = "";
              if (!file) return;
              run(async () => {
                if (file.size > 20 * 1024 * 1024) throw Error(t("invalidFile"));
                const input = await file.text();
                const preview = await api.call("preview", { input });
                setDialog({ kind: "preview", input, preview });
              });
            },
          }),
        ),
        error || snapshot.error
          ? h(
              "div",
              { role: "alert", className: "mtt-message mtt-error" },
              error || snapshot.error,
              h(
                Button,
                { disabled: busy, onClick: () => run(() => api.refresh()) },
                t("retry"),
              ),
            )
          : null,
        h(
          "div",
          { className: "mtt-message", role: "status", "aria-live": "polite" },
          busy ? t("busy") : !state ? t("loading") : notice,
        ),
        h(
          "div",
          { className: "mtt-body" },
          h(
            "nav",
            { className: "mtt-projects", "aria-label": t("projects") },
            h(
              Button,
              {
                "aria-pressed": scope === "all",
                onClick: () => setScope("all"),
              },
              t("all"),
            ),
            projects.map((p) =>
              h(
                Button,
                {
                  key: p.id,
                  "aria-pressed": scope === p.id,
                  onClick: () => setScope(p.id),
                },
                p.name,
              ),
            ),
            h(
              Button,
              { disabled: busy, onClick: () => setDialog({ kind: "project" }) },
              t("newProject"),
            ),
            h(
              "label",
              { className: "mtt-check" },
              h("input", {
                type: "checkbox",
                checked: archived,
                onChange: (e) => {
                  setArchived(e.target.checked);
                  setScope("all");
                },
              }),
              t("archived"),
            ),
          ),
          h(
            "main",
            { className: "mtt-main" },
            current
              ? h(
                  "div",
                  { className: "mtt-tools" },
                  h("h2", null, current.name),
                  h(
                    Button,
                    {
                      disabled: busy,
                      onClick: () => setDialog({ kind: "rename" }),
                    },
                    t("rename"),
                  ),
                  h(
                    Button,
                    {
                      disabled: busy,
                      onClick: () =>
                        change("project.update", {
                          id: current.id,
                          archived: !current.archivedAt,
                        }),
                    },
                    t(current.archivedAt ? "restore" : "archive"),
                  ),
                  h(
                    Button,
                    {
                      disabled: busy,
                      onClick: () =>
                        setDialog({ kind: "deleteProject", id: current.id }),
                    },
                    t("remove"),
                  ),
                  ...[-1, 1].map((d) =>
                    h(
                      Button,
                      {
                        key: d,
                        disabled: busy,
                        "aria-label": t(d < 0 ? "up" : "down"),
                        onClick: () =>
                          sort(
                            [...state.projects].sort(
                              (a, b) => a.order - b.order,
                            ),
                            current.id,
                            d,
                            "project",
                          ),
                      },
                      d < 0 ? "↑" : "↓",
                    ),
                  ),
                )
              : null,
            h(
              "form",
              {
                className: "mtt-tools",
                onSubmit: async (e) => {
                  e.preventDefault();
                  const targetProject = scope === "all" ? createProject : scope;
                  if (!targetProject || archived) {
                    setError(t("selectProject"));
                    return;
                  }
                  const r = await change("task.create", {
                    projectId: targetProject,
                    title,
                  });
                  if (r !== false) setTitle("");
                },
              },
              scope === "all"
                ? h(
                    "select",
                    {
                      "aria-label": t("projects"),
                      value: createProject,
                      onChange: (e) => setCreateProject(e.target.value),
                      disabled: busy || archived,
                    },
                    h("option", { value: "" }, t("selectProject")),
                    projects.map((p) =>
                      h("option", { key: p.id, value: p.id }, p.name),
                    ),
                  )
                : null,
              h("input", {
                "aria-label": t("taskTitle"),
                placeholder: t("taskTitle"),
                value: title,
                onChange: (e) => setTitle(e.target.value),
                required: true,
                maxLength: 200,
                disabled: busy || archived,
              }),
              h(
                "button",
                { type: "submit", disabled: busy || archived },
                t("newTask"),
              ),
              h(
                "select",
                {
                  "aria-label": t("status"),
                  value: status,
                  onChange: (e) => setStatus(e.target.value),
                },
                h("option", { value: "all" }, t("anyStatus")),
                statuses.map((s) => h("option", { key: s, value: s }, t(s))),
              ),
              view === "matrix"
                ? h(
                    "label",
                    { className: "mtt-check" },
                    h("input", {
                      type: "checkbox",
                      checked: showDone,
                      onChange: (e) => setShowDone(e.target.checked),
                    }),
                    t("showDone"),
                  )
                : null,
              h(
                Button,
                { disabled: busy, onClick: () => run(() => api.refresh()) },
                t("refresh"),
              ),
            ),
            h(
              "div",
              { className: "mtt-content" },
              !projects.length
                ? h(
                    Button,
                    { onClick: () => setDialog({ kind: "project" }) },
                    t("noProjects"),
                  )
                : view === "list"
                  ? roots.length
                    ? limited(
                        roots.sort((a, b) => a.listOrder - b.listOrder),
                        "list",
                        (x) => card(x),
                      )
                    : h("p", { className: "mtt-empty" }, t("empty"))
                  : view === "board"
                    ? h(
                        "div",
                        { className: "mtt-columns" },
                        statuses.map((s) =>
                          group(
                            t(s),
                            roots.filter((x) => x.status === s),
                            { status: s },
                          ),
                        ),
                      )
                    : h(
                        "div",
                        { className: "mtt-columns mtt-matrix" },
                        quads.map((q) =>
                          group(
                            t(q[2]),
                            roots.filter(
                              (x) =>
                                (showDone || x.status !== "done") &&
                                qkey(x) === q[2],
                            ),
                            { important: q[0], urgent: q[1] },
                          ),
                        ),
                      ),
            ),
          ),
          task ? detail(task) : null,
        ),
        dialogView(),
      );
    }
    return {
      inject: ["slots", "locale", "layout", "connection"],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register("mtTasks", { zh, en }));
        const t = ctx.locale.bind("mtTasks");
        let snapshot = { state: null, error: "" },
          sequence = 0,
          active = true;
        const listeners = new Set();
        const publish = (state, error = "") => {
          if (
            !active ||
            (state &&
              snapshot.state &&
              state.revision < snapshot.state.revision)
          )
            return;
          snapshot = { state, error };
          for (const fn of listeners) fn();
        };
        const model = {
          getSnapshot: () => snapshot,
          subscribe: (fn) => {
            listeners.add(fn);
            return () => listeners.delete(fn);
          },
        };
        const call = async (endpoint, payload = {}) => {
          const response = await fetch(
            new URL("api/mt-tasks", document.baseURI),
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ endpoint, payload }),
            },
          );
          if (!response.ok) throw Error(`DSH HTTP ${response.status}`);
          const result = await response.json();
          if (!result.ok)
            throw Object.assign(Error(result.error.message), {
              code: result.error.code,
            });
          return result.value;
        };
        const api = {
          call,
          refresh: async () => {
            const request = ++sequence;
            try {
              const s = await call("snapshot");
              if (request === sequence) publish(s);
              return s;
            } catch (e) {
              if (request === sequence) publish(snapshot.state, e.message);
              throw e;
            }
          },
          mutate: async (op, args, revision = snapshot.state?.revision) => {
            const request = ++sequence;
            try {
              const result = await call("mutate", {
                requestId: crypto.randomUUID(),
                revision,
                op,
                args,
              });
              publish(result.state);
              return result;
            } catch (e) {
              if (e.code === "CONFLICT") await api.refresh();
              throw e;
            }
          },
        };
        ctx.effect(() => {
          const refresh = () => {
            if (active) api.refresh().catch(() => {});
          };
          window.addEventListener("focus", refresh);
          const dispose = ctx.on("connection/reset", refresh);
          return () => {
            active = false;
            sequence++;
            listeners.clear();
            window.removeEventListener("focus", refresh);
            dispose();
          };
        });
        ctx.slots.inject("main", () =>
          ctx.slots.register(
            {
              name: "main",
              key: "mt-tasks",
              locale: "mtTasks",
              inject: () => ({ api, model }),
            },
            Page,
          ),
        );
        ctx.slots.inject("sidebar.panellist", () =>
          ctx.slots.register(
            {
              name: "sidebar.panellist",
              id: "mt-tasks",
              order: 20,
              label: () => t("title"),
              locale: "mtTasks",
            },
            ({ size }) =>
              h(
                "svg",
                {
                  width: size ?? 20,
                  height: size ?? 20,
                  viewBox: "0 0 24 24",
                  "aria-hidden": true,
                },
                h("path", {
                  d: "m4 6 2 2 3-4M12 6h8M4 13h5m3 0h8M4 19h5m3 0h8",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: 1.5,
                }),
              ),
          ),
        );
      },
    };
  },
});
