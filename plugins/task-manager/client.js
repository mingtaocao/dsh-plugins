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
      list: "全部任务",
      parentTask: "所属主任务",
      board: "看板",
      matrix: "四象限",
      views: "视图",
      navigation: "任务导航",
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
      completedOn: "完成于",
      completedEstimated: "完成于（估算）",
      countsDetail: "主任务 / 子任务",
      move: "移动象限",
      inherited: "象限与项目跟随父任务",
      retry: "重试",
      chooseFile: "选择 JSON 文件",
      taskActions: "任务操作",
      moreActions: "更多操作",
      projectMenu: "项目菜单",
      viewArchived: "查看归档项目",
      activeProjects: "返回活动项目",
      noArchivedProjects: "暂无归档项目",
      noActiveProjects: "暂无活动项目",
      quadrant: "象限",
      q1Short: "重要 · 紧急",
      q2Short: "重要 · 不急",
      q3Short: "紧急 · 不重要",
      q4Short: "不急 · 不重要",
    };
    const en = {
      skippedArchives: "Skipped archive tasks",
      unsupported: "Unsupported fields or sections",
      more: "Show more",
      title: "Task manager",
      list: "All tasks",
      parentTask: "Parent task",
      board: "Board",
      matrix: "Matrix",
      views: "Views",
      navigation: "Task navigation",
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
      completedOn: "Completed",
      completedEstimated: "Completed (estimated)",
      countsDetail: "Tasks / subtasks",
      move: "Move quadrant",
      inherited: "Project and quadrant follow the parent task",
      retry: "Retry",
      chooseFile: "Choose JSON file",
      taskActions: "Task actions",
      moreActions: "More actions",
      projectMenu: "Project menu",
      viewArchived: "View archived projects",
      activeProjects: "Back to active projects",
      noArchivedProjects: "No archived projects",
      noActiveProjects: "No active projects",
      quadrant: "Quadrant",
      q1Short: "Important · urgent",
      q2Short: "Important · not urgent",
      q3Short: "Urgent · not important",
      q4Short: "Not urgent · not important",
    };
    const css = `.mtt{height:100%;min-height:0;display:flex;flex-direction:column;font-family:inherit;font-size:14px;line-height:1.5;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base)}.mtt *{box-sizing:border-box}.mtt button,.mtt input,.mtt select,.mtt textarea{font:inherit;color:inherit;border:.5px solid var(--dsw-alias-border-l3);border-radius:6px;background:var(--dsw-alias-bg-base);padding:6px 9px}.mtt button{cursor:pointer}.mtt button:hover,.mtt button[aria-pressed=true]{background:var(--dsw-alias-interactive-bg-hover)}.mtt button:disabled{opacity:.55;cursor:default}.mtt :focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}.mtt-head{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:18px 22px;border-bottom:.5px solid var(--dsw-alias-border-l3)}.mtt h1{font-size:20px;margin:0 auto 0 0}.mtt h2{font-size:15px;margin:0}.mtt h3{font-size:14px;margin:0}.mtt-body{display:flex;flex:1;min-height:0}.mtt-projects{width:205px;flex-shrink:0;overflow:auto;padding:16px 12px;border-right:.5px solid var(--dsw-alias-border-l3)}.mtt-projects button{display:block;width:100%;text-align:left;margin-bottom:5px}.mtt-main{flex:1;min-width:0;display:flex;flex-direction:column}.mtt-tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:14px 18px}.mtt-tools input{min-width:150px;flex:1}.mtt-content{flex:1;min-height:0;overflow:auto;padding:0 18px 20px}.mtt-columns{height:100%;grid-template-rows:minmax(0,1fr);display:grid;grid-template-columns:repeat(3,minmax(210px,1fr));gap:12px;min-height:200px}.mtt-matrix{grid-template-rows:repeat(2,minmax(160px,1fr));min-height:360px;grid-template-columns:repeat(2,minmax(230px,1fr))}.mtt-group{background:var(--dsw-alias-bg-layer-1);border:.5px solid var(--dsw-alias-border-l3);border-radius:10px;padding:12px;min-height:0;overflow-y:auto;overscroll-behavior:contain}.mtt-group>h2{margin-bottom:12px}.mtt [data-drop=true]{outline:1px dashed var(--dsw-alias-brand-primary);outline-offset:-2px}.mtt-card{border:.5px solid var(--dsw-alias-border-l3);border-radius:8px;background:var(--dsw-alias-bg-base);padding:12px;margin-bottom:9px;overflow-wrap:anywhere}.mtt-row{display:flex;gap:7px;align-items:center}.mtt-row.wrap{flex-wrap:wrap}.mtt-task-title{border:0!important;padding:0!important;background:none!important;text-align:left;flex:1;min-width:0}.mtt-done .mtt-task-title{text-decoration:line-through;color:var(--dsw-alias-label-tertiary)}.mtt-meta{font-size:12px;color:var(--dsw-alias-label-secondary);margin:6px 0}.mtt-card select{max-width:100%;font-size:12px}.mtt-child{margin-top:8px;padding-left:12px;border-left:.5px solid var(--dsw-alias-border-l3)}.mtt-detail{width:340px;flex-shrink:0;border-left:.5px solid var(--dsw-alias-border-l3);padding:18px;overflow:auto}.mtt label.field{display:flex;flex-direction:column;gap:5px;margin:12px 0}.mtt textarea{resize:vertical;min-height:90px;width:100%}.mtt-check{display:flex;gap:6px;align-items:center}.mtt-message{padding:8px 20px;color:var(--dsw-alias-label-secondary)}.mtt-error{color:var(--dsw-alias-state-error-primary)}.mtt-dialog{height:auto;display:block;max-height:90vh;overflow:auto;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);border:.5px solid var(--dsw-alias-border-l2);border-radius:12px;padding:24px;max-width:560px;width:90vw}.mtt-dialog::backdrop{background:var(--dsw-alias-bg-layer-3);opacity:.7}.mtt-dialog pre{white-space:pre-wrap}.mtt-empty{padding:24px 0;color:var(--dsw-alias-label-tertiary)}@media(max-width:1050px){.mtt-projects{width:170px}.mtt-detail{position:absolute;right:0;top:0;bottom:0;max-width:95%;background:var(--dsw-alias-bg-base);z-index:2}.mtt-body{position:relative}}@media(max-width:650px){.mtt-projects{width:130px}.mtt-head{padding:12px}.mtt-matrix{grid-template-rows:repeat(2,minmax(160px,1fr));min-height:360px;grid-template-columns:1fr}.mtt-content{padding:0 10px 12px}}`;
    const cardCss = `
      .mtt{--mt-accent:var(--dsw-alias-brand-primary,#6558d9);--mt-muted:var(--dsw-alias-label-secondary,#737784);--mt-line:var(--dsw-alias-border-l3,#e6e8ef);--mt-surface:var(--dsw-alias-bg-base,#fff);--mt-tint:color-mix(in srgb,var(--mt-muted) 5%,var(--mt-surface))}
      .mtt-body{position:relative}
      .mtt-main{container-type:inline-size}
      .mtt-projects{display:flex;flex-direction:column;overflow:hidden;width:176px;padding:12px}
      .mtt-projects button{border:0;border-radius:6px;background:transparent;padding:7px 10px}
      .mtt-projects button[aria-pressed=true]{background:color-mix(in srgb,var(--mt-accent) 9%,var(--mt-surface));color:var(--mt-accent);font-weight:600}
      .mtt-views{flex-shrink:0;padding-bottom:10px;margin-bottom:8px;border-bottom:1px solid var(--mt-line)}
      .mtt-views>button{display:flex;align-items:center;gap:10px}
      .mtt-views .mtt-icon{width:15px;height:15px}
      .mtt-project-list{min-height:0;overflow:auto;scrollbar-width:thin}
      .mtt-project-list-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 2px 4px 10px}
      .mtt-project-list-heading>h2{font-size:11px;font-weight:500;color:var(--mt-muted)}
      .mtt-projects .mtt-archive-return{display:flex;align-items:center;gap:7px;font-size:11px;color:var(--mt-muted)}
      .mtt-archive-return>.mtt-icon{transform:rotate(180deg)}
      .mtt-head{padding:11px 20px;gap:8px}
      .mtt-head h1{font-size:17px;letter-spacing:-.3px}
      .mtt-project-heading{display:flex;align-items:center;gap:6px;padding:8px 20px 0;min-width:0}
      .mtt-project-heading>h2{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:500;color:var(--mt-muted)}
      .mtt-tools{padding:9px 20px;gap:8px}
      .mtt-tools input:not([type=checkbox]){border-radius:7px;padding:7px 10px}
      .mtt-tools input[type=checkbox]{min-width:0;flex:none;margin:0;width:13px;height:13px}
      .mtt-tools .mtt-check{font-size:12px;white-space:nowrap}
      .mtt-tools select,.mtt-tools button{font-size:12px}
      .mtt-message:empty{display:none}
      .mtt-message{font-size:11px;padding:5px 20px}
      .mtt-content{padding:5px 20px 16px}
      .mtt-project-folder{margin-bottom:8px;border:1px solid var(--mt-line);border-radius:7px;overflow:hidden}
      .mtt-project-folder>summary{display:flex;align-items:center;gap:8px;padding:10px 12px;list-style:none;cursor:pointer;font-size:13px;background:var(--mt-tint)}
      .mtt-project-folder>summary::-webkit-details-marker{display:none}
      .mtt-project-folder>summary>.mtt-icon:first-child{width:11px;height:11px;transition:transform .15s}
      .mtt-project-folder[open]>summary>.mtt-icon:first-child{transform:rotate(90deg)}
      .mtt-folder-name{flex:1;min-width:0;overflow-wrap:anywhere}
      .mtt-folder-tasks{padding:8px 8px 2px}
      .mtt-folder-tasks>.mtt-empty{padding:4px 8px 10px;margin:0;font-size:12px}
      .mtt-child-create{grid-column:1 / -1;display:flex;align-items:center;gap:6px;margin:7px 0 0 22px}
      .mtt-child-create input{flex:1;min-width:0;padding:5px 7px;font-size:12px}
      .mtt-child-create button{font-size:11px;padding:4px 7px}
      .mtt-card button.mtt-parent-ref{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border:0;padding:0;background:transparent;font-size:10px;color:var(--mt-muted)}
      .mtt-project-list>button{display:flex;align-items:center;gap:8px}
      .mtt-columns{grid-template-columns:repeat(3,minmax(170px,1fr));gap:12px}
      .mtt-matrix{grid-template-columns:repeat(2,minmax(230px,1fr))}
      .mtt-group{background:var(--mt-tint);border:0;border-radius:10px;padding:8px;scrollbar-width:thin}
      .mtt-group>h2{font-size:12px;font-weight:500;display:flex;align-items:center;gap:7px;padding:3px 4px 9px;margin:0;color:var(--mt-muted)}
      .mtt-count{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;border-radius:4px;background:color-mix(in srgb,var(--mt-muted) 8%,transparent);font-size:10px;font-variant-numeric:tabular-nums}
      .mtt-card{position:relative;padding:8px 10px;margin:0 0 6px;border:1px solid color-mix(in srgb,var(--mt-line) 75%,transparent);border-radius:7px;background:var(--mt-surface);box-shadow:0 1px 2px #00000003;transition:border-color .15s;overflow-wrap:anywhere}
      .mtt-card:hover{border-color:color-mix(in srgb,var(--mt-muted) 30%,var(--mt-line))}
      .mtt-card-top{display:flex;align-items:flex-start;gap:8px;min-height:20px}
      .mtt-card input[type=checkbox]{appearance:none;flex-shrink:0;width:14px;height:14px;min-width:14px;padding:0;margin:3px 0 0;border:1.4px solid color-mix(in srgb,var(--mt-muted) 55%,transparent);border-radius:4px;background:transparent;cursor:pointer;display:grid;place-content:center}
      .mtt-card input[type=checkbox]:checked{background:var(--mt-accent);border-color:var(--mt-accent)}
      .mtt-card input[type=checkbox]:checked::after{content:'';width:6px;height:3px;border-left:1.4px solid white;border-bottom:1.4px solid white;transform:translateY(-1px) rotate(-45deg)}
      .mtt-task-title{font-weight:400;line-height:20px;font-size:13px;overflow-wrap:anywhere}
      .mtt-card-top>.mtt-task-title{padding-right:20px!important}
      .mtt-card .mtt-task-title:hover{color:var(--mt-accent)}
      .mtt-done>.mtt-card-top>.mtt-task-title{color:var(--mt-muted)}
      .mtt-icon{width:14px;height:14px;flex-shrink:0;vertical-align:middle}
      .mtt button.mtt-menu-trigger{display:inline-grid;place-items:center;flex-shrink:0;width:28px;height:28px;padding:0;margin:0;border:0;border-radius:5px;background:transparent;color:var(--mt-muted);cursor:pointer}
      .mtt button.mtt-menu-trigger:hover{background:var(--mt-tint)}
      .mtt-menu-trigger .mtt-icon{width:18px;height:18px}
      .mtt button.mtt-project-menu{width:24px;height:24px}
      .mtt button.mtt-more{position:absolute;right:5px;top:6px;width:24px;height:24px;background:var(--mt-surface);opacity:0;transition:opacity .15s}
      .mtt-card:hover .mtt-more,.mtt-card:focus-within .mtt-more,.mtt-more[aria-expanded=true]{opacity:1}
      .mtt-card-secondary{display:flex;align-items:center;flex-wrap:wrap;gap:3px 8px;margin:3px 0 0 22px;font-size:10px;line-height:16px;color:var(--mt-muted)}
      .mtt-card-secondary:empty{display:none}
      .mtt-completed-at{color:var(--mt-muted);font-size:10px;line-height:16px;white-space:nowrap;font-variant-numeric:tabular-nums}
      .mtt-completed-full{display:block;font-size:12px;white-space:normal;margin:10px 0}
      .mtt-card-secondary>span{display:inline-flex;align-items:center;gap:4px;max-width:100%}
      .mtt-card-secondary .mtt-icon{width:11px;height:11px}
      .mtt-card-secondary>.mtt-project-tag{display:block;overflow:hidden;max-width:160px;text-overflow:ellipsis;white-space:nowrap}
      .mtt-project-tag>.mtt-icon{margin-right:4px;vertical-align:-1px}
      .mtt-priority[data-priority=high]{color:light-dark(#b86a28,#e1af75)}
      .mtt-chip{position:relative;display:inline-flex;align-items:center;gap:4px;max-width:100%;padding:0 3px;border-radius:3px;font-size:10px;line-height:16px;color:var(--mt-muted);background:transparent}
      .mtt-chip:hover{background:color-mix(in srgb,var(--mt-muted) 9%,var(--mt-surface))}
      .mtt-chip:focus-within{outline:2px solid var(--mt-accent);outline-offset:2px}
      .mtt-chip select{position:absolute;inset:0;opacity:0;width:100%;height:100%;padding:0;cursor:pointer}
      .mtt-chip[data-status=doing],.mtt-chip[data-quadrant=q2]{color:var(--mt-accent)}
      .mtt-chip[data-status=done]{color:light-dark(#43866b,#81bd9f)}
      .mtt-chip[data-quadrant=q1]{color:light-dark(#b15b58,#e69d98)}
      .mtt-status-dot{width:4px;height:4px;border-radius:50%;background:currentColor;flex-shrink:0}
      .mtt-chip .mtt-icon{width:10px;height:10px}
      .mtt-subtasks{margin-left:auto;min-width:0}
      .mtt-subtasks:first-child{margin-left:0}
      .mtt-subtasks>summary{list-style:none;display:flex;align-items:center;gap:3px;width:fit-content;max-width:100%;color:var(--mt-muted);font-size:10px;line-height:16px;cursor:pointer;border-radius:3px}
      .mtt-subtasks>summary::-webkit-details-marker{display:none}
      .mtt-subtasks>summary>.mtt-icon{width:10px;height:10px;transition:transform .15s}
      .mtt-subtasks[open]{flex-basis:100%;margin-left:0}
      .mtt-subtasks[open]>summary>.mtt-icon{transform:rotate(90deg)}
      .mtt-subtasks>.mtt-child{padding:3px 0 0 10px;margin-top:4px;gap:7px}
      .mtt-card .mtt-child .mtt-task-title{font-size:12px;font-weight:400;line-height:20px}
      .mtt-card .mtt-child:not(.mtt-done) .mtt-task-title{text-decoration:none;color:inherit}
      .mtt-card .mtt-child.mtt-done .mtt-task-title{color:var(--mt-muted);text-decoration:line-through}
      .mtt-card .mtt-child input[type=checkbox]{width:12px;height:12px;min-width:12px;margin-top:0}
      .mtt-action-menu:not(:popover-open){display:none}
      .mtt-action-menu{height:auto;display:block;position:fixed;inset:auto;margin:0;width:190px;max-width:calc(100vw - 16px);max-height:calc(100vh - 16px);overflow:auto;padding:5px;border:1px solid var(--mt-line);border-radius:8px;background:var(--mt-surface);color:var(--dsw-alias-label-primary);box-shadow:0 8px 24px #00000016}
      .mtt-menu-fields{padding:4px 7px 8px;border-bottom:1px solid var(--mt-line);margin-bottom:4px}
      .mtt-menu-field{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:11px;margin:3px 0}
      .mtt-action-menu::backdrop{background:transparent}
      .mtt-action-menu>button{display:flex;align-items:center;gap:9px;width:100%;padding:7px 9px;margin:0;border:0;background:transparent;border-radius:5px;font-size:12px;text-align:left}
      .mtt-action-menu>button:hover{background:var(--mt-tint)}
      .mtt-view-list .mtt-content .mtt-card{display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:12px}
      .mtt-view-list .mtt-card-top{grid-column:1;grid-row:1}
      .mtt-view-list .mtt-card-secondary{grid-column:2;grid-row:1;margin:0;padding-right:24px;align-self:center}
      .mtt-view-list .mtt-card:has(.mtt-subtasks[open]) .mtt-card-secondary{grid-column:1 / -1;grid-row:2;margin:3px 0 0 22px;padding-right:0}
      @container(max-width:560px){.mtt-view-list .mtt-content .mtt-card{display:block}.mtt-view-list .mtt-card-secondary{margin:3px 0 0 22px;padding-right:0}}
      @media(hover:none){.mtt button.mtt-more{opacity:1}}
      @media(prefers-reduced-motion:reduce){.mtt-card,.mtt-more,.mtt-subtasks>summary>.mtt-icon{transition:none}}
      @container(max-width:560px){.mtt-columns:not(.mtt-matrix){grid-template-columns:repeat(3,180px)}.mtt-matrix{grid-template-columns:1fr;grid-template-rows:auto;height:auto;min-height:100%}.mtt-matrix>.mtt-group{min-height:180px}}
    `;
    const statuses = ["todo", "doing", "done"];
    const quads = [
      [true, true, "q1"],
      [true, false, "q2"],
      [false, true, "q3"],
      [false, false, "q4"],
    ];
    const qkey = (t) =>
      quads.find((q) => q[0] === t.important && q[1] === t.urgent)[2];
    function compareListTasks(a, b) {
      const aDone = a.status === "done", bDone = b.status === "done";
      if (aDone !== bDone) return Number(aDone) - Number(bDone);
      if (aDone) {
        const byCompletion = Date.parse(a.completedAt) - Date.parse(b.completedAt);
        if (byCompletion) return byCompletion;
      }
      return a.listOrder - b.listOrder;
    }
    function Button({ children, ...props }) {
      return h("button", { type: "button", ...props }, children);
    }
    function Icon({ name }) {
      const paths = {
        chevron: "m6 4 4 4-4 4",
        flag: "M4 14V2h8l-2 3 2 3H4",
        up: "M8 13V3m-4 4 4-4 4 4",
        down: "M8 3v10m-4-4 4 4 4-4",
        detail: "M3 2h10v12H3zM6 5h4M6 8h4M6 11h2",
        calendar: "M3 4h10v10H3zM5 2v4m6-4v4M3 8h10",
        project: "M2 4h5l1 2h6v7H2z",
        list: "M3 4h1m3 0h6M3 8h1m3 0h6M3 12h1m3 0h6",
        board: "M2 3h12v10H2zM6 3v10m4-10v10",
        matrix: "M2 2h12v12H2zM8 2v12M2 8h12",
        download: "M8 2v8m-3-3 3 3 3-3M3 11v3h10v-3",
        upload: "M8 10V2m-3 3 3-3 3 3M3 11v3h10v-3",
        archive: "M2 2h12v4H2zM3 6v8h10V6M6 9h4",
        plus: "M8 3v10M3 8h10",
        edit: "m10 2 4 4-8 8H2v-4zM8 4l4 4",
        trash: "M3 4h10M6 4V2h4v2M4 4l1 10h6l1-10M7 7v4m2-4v4",
      };
      return h("svg", {
        className: "mtt-icon", viewBox: "0 0 16 16", fill: "none",
        stroke: "currentColor", strokeWidth: 1.4,
        strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true,
      }, name === "more"
        ? [4, 8, 12].map((cx) => h("circle", { key: cx, cx, cy: 8, r: 1, fill: "currentColor", stroke: "none" }))
        : h("path", { d: paths[name] }));
    }
    function ActionMenu({ label, children, buttonClass = "mtt-more", disabled = false }) {
      const id = React.useId(), menu = React.useRef(), trigger = React.useRef();
      const place = () => {
        const rect = trigger.current.getBoundingClientRect();
        const height = menu.current.offsetHeight || 160;
        const width = menu.current.offsetWidth || 190;
        menu.current.style.left = Math.max(8, Math.min(rect.right - width, innerWidth - width - 8)) + "px";
        menu.current.style.top = Math.max(8, Math.min(rect.bottom + 5, innerHeight - height - 8)) + "px";
      };
      return h(React.Fragment, null,
        h("button", {
          type: "button", ref: trigger, className: "mtt-menu-trigger " + buttonClass,
          "aria-label": label, title: label, disabled,
          popoverTarget: id,
          onClick: place,
        }, h(Icon, { name: "more" })),
        h("div", {
          ref: menu, id, popover: "auto", className: "mtt mtt-action-menu",
          role: "group", "aria-label": label,
          onToggle: (e) => {
            trigger.current?.setAttribute("aria-expanded", String(e.newState === "open"));
            if (e.newState === "open") place();
          },
          onClick: (e) => {
            if (e.target.closest("button:not(:disabled)")) menu.current.hidePopover();
          },
        }, children),
      );
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
      const dateLocale = document.documentElement.lang || navigator.language;
      const completionFormats = React.useMemo(() => {
        const options = {
          year: "numeric", month: "2-digit", day: "2-digit",
          hour: "2-digit", minute: "2-digit", hourCycle: "h23",
        };
        return {
          compact: new Intl.DateTimeFormat(dateLocale, options),
          full: new Intl.DateTimeFormat(dateLocale, { ...options, second: "2-digit" }),
        };
      }, [dateLocale]);
      function completionTime(item, full = false) {
        if (item.status !== "done" || !item.completedAt) return null;
        const date = new Date(item.completedAt);
        const label = t(item.completionTimeEstimated ? "completedEstimated" : "completedOn");
        return h("time", {
          className: "mtt-completed-at" + (full ? " mtt-completed-full" : ""),
          dateTime: item.completedAt,
          title: label + " " + completionFormats.full.format(date),
        }, label + " " + completionFormats[full ? "full" : "compact"].format(date));
      }
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
      const [expandedProjects, setExpandedProjects] = React.useState({});
      const [collapsedParents, setCollapsedParents] = React.useState({});
      const [addingChild, setAddingChild] = React.useState(null);
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
          rows.sort(compareListTasks);
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
        if (detailDirty.current && !window.confirm(t("discard"))) return false;
        detailDirty.current = false;
        detailRevision.current = snapshot.state?.revision;
        draftKey.current = snapshot.state?.tasks.find(
          (x) => x.id === id,
        )?.updatedAt;
        setSelected(id);
        return true;
      }
      function toggleArchived() {
        if (!open(null)) return;
        setArchived((value) => !value);
        setScope("all");
      }
      function sort(items, id, direction, sortView) {
        if (sortView === "list") items = items.filter((item) => item.status !== "done");
        const ids = items.map((x) => x.id),
          i = ids.indexOf(id),
          j = i + direction;
        if (i < 0 || j < 0 || j >= ids.length) return;
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
        return h("span", {
          className: "mtt-chip", "data-quadrant": qkey(item), title: t(qkey(item)),
        },
          h(Icon, { name: "flag" }),
          h("span", { "aria-hidden": true }, t(qkey(item) + "Short")),
          h("select", {
            "aria-label": t("move"), value: qkey(item), disabled: busy || archived,
            onChange: (e) => {
              const q = quads.find((q) => q[2] === e.target.value);
              change("task.update", { id: item.id, important: q[0], urgent: q[1] });
            },
          }, quads.map((q) => h("option", { key: q[2], value: q[2] }, t(q[2])))),
        );
      }
      function statusSelect(item) {
        return h("span", { className: "mtt-chip", "data-status": item.status },
          h("span", { className: "mtt-status-dot", "aria-hidden": true }),
          h("span", { "aria-hidden": true }, t(item.status)),
          h("select", {
            "aria-label": t("status"), value: item.status, disabled: busy || archived,
            onChange: (e) => change("task.update", { id: item.id, status: e.target.value }),
          }, statuses.map((s) => h("option", { key: s, value: s }, t(s)))),
        );
      }
      const orderKey = { list: "listOrder", board: "boardOrder", matrix: "matrixOrder" }[view];
      const orderGroupKey = (item) => JSON.stringify([
        item.projectId, view === "board" ? item.status : view === "matrix" ? qkey(item) : item.status === "done" ? "completed" : "active",
      ]);
      const orderGroups = new Map();
      for (const item of roots) {
        const key = orderGroupKey(item);
        if (!orderGroups.has(key)) orderGroups.set(key, []);
        orderGroups.get(key).push(item);
      }
      for (const items of orderGroups.values())
        items.sort(view === "list" ? compareListTasks : (a, b) => a[orderKey] - b[orderKey]);
      function card(item, group = {}) {
        const subs = children(item.id),
          completed = subs.filter((s) => s.status === "done").length,
          project = state.projects.find((p) => p.id === item.projectId);
        const siblings = orderGroups.get(orderGroupKey(item));
        const position = siblings.findIndex((x) => x.id === item.id);
        const automaticOrder = view === "list" && item.status === "done";
        return h("article", {
          key: item.id,
          className: "mtt-card " + (item.status === "done" ? "mtt-done" : ""),
          "data-task-id": item.id, "data-drop": dragTarget === item.id,
          onDragEnd: () => setDragTarget(null), draggable: !busy && !archived && !automaticOrder,
          onDragStart: (e) => {
            if (e.target.closest("[popover]")) { e.preventDefault(); return; }
            e.dataTransfer.setData("text/x-mt-task", item.id);
            e.dataTransfer.effectAllowed = "move";
          },
          onDragOver: (e) => { e.preventDefault(); e.stopPropagation(); setDragTarget(item.id); },
          onDrop: (e) => drop(e, group, item.id),
        },
          h("div", { className: "mtt-card-top" },
            h("input", {
              type: "checkbox", checked: item.status === "done", disabled: busy || archived,
              "aria-label": t(item.status === "done" ? "reopen" : "complete"),
              onChange: (e) => change("task.update", { id: item.id, status: e.target.checked ? "done" : "todo" }),
            }),
            h(Button, { className: "mtt-task-title", title: item.title, onClick: () => open(item.id) }, item.title),
            h(ActionMenu, { label: t("taskActions") + ": " + item.title },
              h("div", { className: "mtt-menu-fields" },
                h("label", { className: "mtt-menu-field" }, h("span", null, t("status")), statusSelect(item)),
                h("label", { className: "mtt-menu-field" }, h("span", null, t("quadrant")), quadrantSelect(item)),
              ),
              h(Button, { onClick: () => open(item.id) }, h(Icon, { name: "detail" }), t("details")),
              h(Button, { disabled: busy || archived, onClick: () => {
                setAddingChild(item.id);
                setCollapsedParents((values) => ({ ...values, [item.id]: false }));
              } }, h(Icon, { name: "plus" }), t("addChild")),
              ...[-1, 1].map((direction) => h(Button, {
                key: direction,
                disabled: busy || archived || automaticOrder || (direction < 0 ? position === 0 : position === siblings.length - 1),
                onClick: () => sort(siblings, item.id, direction, view),
              }, h(Icon, { name: direction < 0 ? "up" : "down" }), t(direction < 0 ? "up" : "down"))),
            ),
          ),
          h("div", { className: "mtt-card-secondary" },
            scope === "all" && view !== "list" && project ? h("span", { className: "mtt-project-tag", title: project.name }, h(Icon, { name: "project" }), project.name) : null,
            item.priority !== "normal" ? h("span", { className: "mtt-priority", "data-priority": item.priority }, t("priority") + " · " + t(item.priority)) : null,
            item.dueDate ? h("span", { className: "mtt-due" }, h(Icon, { name: "calendar" }), item.dueDate) : null,
            view !== "board" && item.status !== "todo" ? statusSelect(item) : null,
            view !== "matrix" && qkey(item) !== "q4" ? quadrantSelect(item) : null,
            view === "list" ? completionTime(item) : null,
            subs.length ? h("details", {
              className: "mtt-subtasks", open: !(collapsedParents[item.id] ?? (view !== "list")),
              onToggle: (e) => {
                if (e.target !== e.currentTarget) return;
                const collapsed = !e.currentTarget.open;
                setCollapsedParents((values) => values[item.id] === collapsed ? values : { ...values, [item.id]: collapsed });
              },
            },
              h("summary", { "aria-label": t("subtasks") + ` ${completed}/${subs.length}`, title: t("subtasks") },
                h(Icon, { name: "chevron" }),
                h("span", null, `${completed}/${subs.length}`),
              ),
              subs.map((s) => h("div", {
                key: s.id, className: "mtt-child mtt-row " + (s.status === "done" ? "mtt-done" : ""),
              },
                h("input", {
                  type: "checkbox", checked: s.status === "done", disabled: busy || archived,
                  "aria-label": s.title,
                  onChange: (e) => change("task.update", { id: s.id, status: e.target.checked ? "done" : "todo" }),
                }),
                h(Button, { className: "mtt-task-title", onClick: () => open(s.id) }, s.title),
                view === "list" ? h(Button, { className: "mtt-parent-ref", title: t("parentTask") + ": " + item.title, onClick: () => open(item.id) }, t("parentTask") + " · " + item.title) : null,
                view === "list" ? completionTime(s) : null,
              )),
            ) : null,
          ),
          addingChild === item.id ? h("form", {
            className: "mtt-child-create", "aria-label": t("addChild") + ": " + item.title,
            onKeyDown: (e) => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); setAddingChild(null); } },
            onSubmit: async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const result = await change("task.create", { projectId: item.projectId, parentId: item.id, title: new FormData(form).get("child") });
              if (result !== false) {
                form.reset();
                setCollapsedParents((values) => ({ ...values, [item.id]: false }));
                form.elements.namedItem("child")?.focus();
              }
            },
          },
            h("input", { name: "child", "aria-label": t("addChild"), placeholder: t("addChild"), required: true, maxLength: 200, autoFocus: true, disabled: busy || archived }),
            h("button", { type: "submit", disabled: busy || archived }, t("create")),
            h(Button, { onClick: () => setAddingChild(null) }, t("cancel")),
          ) : null,
        );
      }
      function projectFolder(project) {
        const items = roots.filter((item) => item.projectId === project.id).sort(compareListTasks);
        return h("details", {
          key: project.id, className: "mtt-project-folder", "data-project-id": project.id,
          open: expandedProjects[project.id] ?? false,
          onToggle: (e) => {
            if (e.target !== e.currentTarget) return;
            const expanded = e.currentTarget.open;
            setExpandedProjects((values) => values[project.id] === expanded ? values : { ...values, [project.id]: expanded });
          },
        },
          h("summary", null,
            h(Icon, { name: "chevron" }), h(Icon, { name: "project" }),
            h("span", { className: "mtt-folder-name" }, project.name),
            h("span", { className: "mtt-count" }, items.length),
          ),
          h("div", { className: "mtt-folder-tasks" },
            limited(items, "project-" + project.id, (item) => card(item)),
            !items.length ? h("p", { className: "mtt-empty" }, t("empty")) : null,
          ),
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
          h("h2", null, label, h("span", { className: "mtt-count" }, items.length)),
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
          completionTime(item, true),
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
                      completionTime(s),
                      ...[-1, 1].map((d) =>
                        h(
                          Button,
                          {
                            key: d,
                            disabled: busy || archived || s.status === "done",
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
        { className: "mtt mtt-view-" + view, "data-task-manager": "" },
        h("style", null, css + cardCss),
        h(
          "header",
          { className: "mtt-head" },
          h("h1", null, view === "list" && current ? current.name : t(view)),
          h(ActionMenu, { label: t("moreActions"), buttonClass: "mtt-head-menu", disabled: busy },
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
              h(Icon, { name: "download" }), t("export"),
            ),
            h(
              Button,
              { disabled: busy, onClick: () => fileRef.current.click() },
              h(Icon, { name: "upload" }), t("import"),
            ),
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
            { className: "mtt-projects", "aria-label": t("navigation") },
            h(
              "div",
              { className: "mtt-views", role: "group", "aria-label": t("views") },
              ["list", "board", "matrix"].map((v) =>
                h(
                  Button,
                  { key: v, "aria-pressed": view === v && (v !== "list" || (scope === "all" && !archived)), onClick: () => {
                    if (v === "list") {
                      if (!open(null)) return;
                      setScope("all"); setArchived(false); setStatus("all");
                    }
                    setView(v);
                  } },
                  h(Icon, { name: v }),
                  t(v),
                ),
              ),
            ),
            h(
              "div",
              { className: "mtt-project-list", role: "group", "aria-label": t("projects") },
              h("div", { className: "mtt-project-list-heading" },
                h("h2", null, t(archived ? "archived" : "projects")),
                h(ActionMenu, { label: t("projectMenu"), buttonClass: "mtt-project-menu", disabled: busy },
                  h(Button, { onClick: () => setDialog({ kind: "project" }) }, h(Icon, { name: "plus" }), t("newProject")),
                  h(Button, {
                    disabled: !archived && !state?.projects.some((p) => p.archivedAt),
                    onClick: toggleArchived,
                  }, h(Icon, { name: archived ? "project" : "archive" }), t(archived ? "activeProjects" : "viewArchived")),
                ),
              ),
              archived ? h(Button, { className: "mtt-archive-return", onClick: toggleArchived },
                h(Icon, { name: "chevron" }), t("activeProjects"),
              ) : null,
              archived ? h(
                Button,
                {
                  "aria-pressed": scope === "all",
                  onClick: () => setScope("all"),
                },
                t("all"),
              ) : null,
              projects.map((p) =>
                h(
                  Button,
                  {
                    key: p.id,
                    "aria-pressed": scope === p.id,
                    onClick: () => { if (open(null)) { setScope(p.id); setView("list"); } },
                  },
                  h(Icon, { name: "project" }),
                  p.name,
                ),
              ),
            ),
          ),
          h(
            "main",
            { className: "mtt-main" },
            current
              ? h(
                  "div",
                  { className: "mtt-project-heading" },
                  h("h2", null, current.name),
                  h(ActionMenu, { label: t("projectMenu") + ": " + current.name, buttonClass: "mtt-project-menu", disabled: busy },
                    h(
                      Button,
                      {
                        disabled: busy,
                        onClick: () => setDialog({ kind: "rename" }),
                      },
                      h(Icon, { name: "edit" }), t("rename"),
                    ),
                    h(
                      Button,
                      {
                        disabled: busy,
                        onClick: async () => {
                          if (!open(null)) return;
                          const result = await change("project.update", {
                            id: current.id, archived: !current.archivedAt,
                          });
                          if (result !== false) setScope("all");
                        },
                      },
                      h(Icon, { name: "archive" }), t(current.archivedAt ? "restore" : "archive"),
                    ),
                    h(
                      Button,
                      {
                        disabled: busy,
                        onClick: () =>
                          setDialog({ kind: "deleteProject", id: current.id }),
                      },
                      h(Icon, { name: "trash" }), t("remove"),
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
                        h(Icon, { name: d < 0 ? "up" : "down" }), t(d < 0 ? "up" : "down"),
                      ),
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
                ? h("div", { className: "mtt-empty" },
                    h("p", null, t(archived ? "noArchivedProjects" : state?.projects.length ? "noActiveProjects" : "noProjects")),
                    !archived ? h(Button, { onClick: () => setDialog({ kind: "project" }) }, t("newProject")) : null,
                  )
                : view === "list"
                  ? scope === "all"
                    ? projects.map(projectFolder)
                    : roots.length
                    ? limited(
                        roots.sort(compareListTasks),
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
