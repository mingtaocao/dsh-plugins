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
      search: "搜索任务",
      filter: "筛选任务",
      clearFilters: "清除筛选",
      noResults: "没有匹配的任务",
      addTaskHint: "添加任务，按 Enter 创建",
      taskProperties: "任务属性",
      unsaved: "正在编辑…",
      saving: "正在保存…",
      autoSaved: "更改已自动保存",
      recoveredDraft: "已恢复未保存的修改",
      completedTasks: "已完成",
      collapseNavigation: "收起导航",
      expandNavigation: "展开导航",
      createdOn: "创建于",
      filtersActive: "筛选已启用",

      parentTask: "所属主任务",
      board: "看板",
      matrix: "四象限",
      views: "视图",
      navigation: "任务导航",
      projectDirectory: "项目目录",
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
      invalidTitle: "任务名称不能为空",
      complete: "标记完成",
      reopen: "恢复待办",
      completedOn: "完成于",
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
      search: "Search tasks",
      filter: "Filter tasks",
      clearFilters: "Clear filters",
      noResults: "No matching tasks",
      addTaskHint: "Add a task, press Enter to create",
      taskProperties: "Task properties",
      unsaved: "Editing…",
      saving: "Saving…",
      autoSaved: "Changes saved automatically",
      recoveredDraft: "Unsaved changes restored",
      completedTasks: "Completed",
      collapseNavigation: "Collapse navigation",
      expandNavigation: "Expand navigation",
      createdOn: "Created",
      filtersActive: "Filters active",

      parentTask: "Parent task",
      board: "Board",
      matrix: "Matrix",
      views: "Views",
      navigation: "Task navigation",
      projectDirectory: "Project directory",
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
      invalidTitle: "Task title cannot be empty",
      complete: "Mark done",
      reopen: "Reopen",
      completedOn: "Completed",
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
      .mtt-main{container-type:inline-size;container-name:task-main}
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
      .mtt-projects button.mtt-section-toggle{display:flex;align-items:center;gap:8px;width:auto;margin:0;padding:6px 0;font-size:11px;font-weight:500;color:var(--mt-muted);background:transparent}
      .mtt-section-toggle>.mtt-icon{width:11px;height:11px;transition:transform .15s}
      .mtt-section-toggle[aria-expanded=true]>.mtt-icon{transform:rotate(90deg)}
      .mtt-project-list-heading>h2{flex:1;min-width:0}
      .mtt-project-items>button{display:flex;align-items:center;gap:8px}
      .mtt-project-items[hidden]{display:none}
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
      .mtt-card .mtt-task-title{font-weight:400;line-height:20px;font-size:14px;overflow-wrap:anywhere}
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
      .mtt-subtasks{grid-column:1 / -1;grid-row:2;margin:0 0 0 22px;min-width:0}
      .mtt-card:has(.mtt-subtasks) .mtt-card-top>.mtt-task-title{padding-right:66px!important}
      .mtt-subtasks>summary{position:absolute;top:9px;right:34px;list-style:none;display:flex;align-items:center;gap:3px;width:fit-content;max-width:100%;color:var(--mt-muted);font-size:11px;line-height:18px;cursor:pointer;border-radius:4px}
      .mtt-subtasks>summary::-webkit-details-marker{display:none}
      .mtt-subtasks>summary>.mtt-icon{width:10px;height:10px;transition:transform .15s}
      .mtt-subtasks[open]{margin-top:6px}
      .mtt-subtasks[open]>summary>.mtt-icon{transform:rotate(90deg)}
      .mtt-subtasks>.mtt-child{padding:8px 10px;margin:3px 0 0;gap:8px;border:1px solid color-mix(in srgb,var(--mt-line) 75%,transparent);border-radius:6px;background:var(--mt-surface)}
      .mtt-card .mtt-child .mtt-task-title{font-size:14px;font-weight:400;line-height:20px}
      .mtt-card .mtt-child:not(.mtt-done) .mtt-task-title{text-decoration:none;color:inherit}
      .mtt-card .mtt-child.mtt-done .mtt-task-title{color:var(--mt-muted);text-decoration:line-through}
      .mtt-card .mtt-child input[type=checkbox]{width:14px;height:14px;min-width:14px;margin:0}
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
      @container task-main (max-width:560px){.mtt-view-list .mtt-content .mtt-card{display:block}.mtt-view-list .mtt-card-secondary{margin:3px 0 0 22px;padding-right:0}}
      @container task-main (max-width:560px){.mtt-subtasks>.mtt-child{flex-wrap:wrap}.mtt-card .mtt-child .mtt-task-title{flex-basis:calc(100% - 28px)}.mtt-card .mtt-child .mtt-parent-ref{margin-left:22px}.mtt-card:has(.mtt-subtasks) .mtt-card-secondary{padding-right:0}}
      @media(hover:none){.mtt button.mtt-more{opacity:1}}
      @media(prefers-reduced-motion:reduce){.mtt-card,.mtt-more,.mtt-subtasks>summary>.mtt-icon{transition:none}}
      @container task-main (max-width:560px){.mtt-columns:not(.mtt-matrix){grid-template-columns:repeat(3,180px)}.mtt-matrix{grid-template-columns:1fr;grid-template-rows:auto;height:auto;min-height:100%}.mtt-matrix>.mtt-group{min-height:180px}}
    `;
    const experienceCss = `
      .mtt{--mt-accent:light-dark(#5b80db,#91afff);--mt-canvas:color-mix(in srgb,var(--mt-accent) 3%,var(--mt-surface));--mt-sidebar:color-mix(in srgb,var(--mt-muted) 3%,var(--mt-surface))}
      .mtt[data-task-manager]{position:relative}
      .mtt :focus-visible{outline-color:var(--mt-accent)}
      .mtt-main{background:var(--mt-canvas)}
      .mtt-projects{width:200px;padding:12px 10px;background:var(--mt-sidebar);gap:6px;transition:width .15s}
      .mtt-nav-top{display:flex;align-items:center;gap:8px;padding:0 4px 12px 10px;min-height:40px;color:var(--mt-muted);font-size:12px}
      .mtt-nav-top>span{flex:1}
      .mtt button.mtt-icon-button{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;width:32px;height:32px;min-width:32px;margin:0;padding:6px;border:0;background:transparent;color:var(--mt-muted)}
      .mtt-icon-button>.mtt-icon{width:18px;height:18px}
      .mtt button.mtt-icon-button:hover{background:color-mix(in srgb,var(--mt-muted) 8%,transparent)}
      .mtt-icon-button[data-active=true],.mtt-icon-button[aria-expanded=true]{color:var(--mt-accent);background:color-mix(in srgb,var(--mt-accent) 9%,transparent)}
      .mtt-nav-top>.mtt-icon-button>.mtt-icon{transform:rotate(180deg)}
      .mtt-projects button{min-height:36px;margin-bottom:3px}
      .mtt-projects button[aria-pressed=true]{background:color-mix(in srgb,var(--mt-accent) 12%,var(--mt-surface));font-weight:500}
      .mtt-project-label{flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
      .mtt-nav-count{margin-left:auto;font-size:11px;font-variant-numeric:tabular-nums;color:var(--mt-muted)}
      .mtt-project-list-heading{gap:0;padding-left:8px}
      .mtt-projects button.mtt-section-toggle{font-size:12px;gap:8px}
      .mtt-projects .mtt-project-add{width:24px;min-width:24px;height:28px;min-height:28px}
      .mtt-projects button.mtt-nav-search{display:flex;align-items:center;gap:10px;margin-top:auto;border-top:1px solid var(--mt-line);border-radius:0;padding-top:14px;min-height:46px}
      .mtt-nav-compact .mtt-projects{width:58px;padding:12px 6px}
      .mtt-nav-compact .mtt-nav-top{padding:0 0 12px;justify-content:center}
      .mtt-nav-compact .mtt-nav-top>span,.mtt-nav-compact .mtt-project-label,.mtt-nav-compact .mtt-nav-count{display:none}
      .mtt-nav-compact .mtt-nav-top>.mtt-icon-button>.mtt-icon{transform:none}
      .mtt-nav-compact .mtt-views>button,.mtt-nav-compact .mtt-project-items>button,.mtt-nav-compact button.mtt-nav-search{justify-content:center;padding-left:0;padding-right:0}
      .mtt-nav-compact .mtt-project-list-heading{padding:0;justify-content:center}
      .mtt-nav-compact .mtt-section-toggle{font-size:0!important;gap:0!important;justify-content:center;min-width:40px}
      .mtt-nav-compact .mtt-project-add,.mtt-nav-compact .mtt-project-menu{display:none!important}
      .mtt-head{padding:12px 20px;min-height:60px;flex-wrap:nowrap;border-bottom:0;gap:8px;background:transparent}
      .mtt-head>.mtt-icon{width:19px;height:19px;color:var(--mt-accent)}
      .mtt-head h1{margin:0;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:18px;font-weight:600}
      .mtt-project-heading{display:contents}
      .mtt-project-heading>h2{display:none}
      .mtt-head-spacer{flex:1}
      .mtt-add-task{color:var(--mt-accent)!important}
      .mtt-tools{margin:0 20px 12px;padding:8px 10px;flex-wrap:nowrap;gap:6px;background:var(--mt-surface);border:1px solid color-mix(in srgb,var(--mt-accent) 45%,var(--mt-line));border-radius:10px}
      .mtt-tools>input{border:0!important;padding:5px 2px!important;min-width:50px}
      .mtt-tools>select{max-width:170px;border:0;background:var(--mt-tint)}
      .mtt-filter-panel{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:0 20px 12px;padding:10px;background:var(--mt-surface);border:1px solid var(--mt-line);border-radius:10px;font-size:12px}
      .mtt-search-field{display:flex;align-items:center;gap:6px;flex:1;min-width:140px;padding-left:8px;border:1px solid var(--mt-line);border-radius:6px}
      .mtt-search-field>input{width:100%;min-width:0;border:0;background:transparent}
      .mtt-filter-panel>.mtt-icon-button{margin-left:auto}
      .mtt-filter-summary{display:flex;align-items:center;gap:8px;padding:0 22px 10px;color:var(--mt-muted);font-size:11px}
      .mtt-filter-summary>button{padding:0;border:0;background:transparent;color:var(--mt-accent);font-size:11px}
      .mtt-content{padding:8px 20px 24px}
      .mtt-view-list .mtt-content{padding:12px clamp(16px,4cqw,48px) 30px}
      .mtt-view-list .mtt-content .mtt-card{display:block}
      .mtt-view-list .mtt-card-secondary{margin:3px 0 0 26px;padding-right:0}
      .mtt-view-list .mtt-content>.mtt-card,.mtt-completed-section{max-width:1100px;margin-left:auto;margin-right:auto}
      .mtt-card{container-type:inline-size;container-name:task-card;padding:10px 12px;border-radius:11px;border-color:color-mix(in srgb,var(--mt-line) 60%,transparent);box-shadow:none;margin-bottom:6px}
      .mtt-card input[type=checkbox],.mtt-card .mtt-child input[type=checkbox]{width:16px;height:16px;min-width:16px;border-radius:5px}
      .mtt-card-top{gap:10px}
      .mtt-card-top>input[type=checkbox]{margin-top:2px}
      .mtt-card[data-selected=true],.mtt-child[data-selected=true]{border-color:color-mix(in srgb,var(--mt-accent) 60%,var(--mt-line));background:color-mix(in srgb,var(--mt-accent) 3%,var(--mt-surface))}
      .mtt-card .mtt-task-title{font-size:14px;line-height:20px}
      .mtt-card-secondary{font-size:11px;gap:4px 8px;margin-left:26px;line-height:18px}
      .mtt-chip,.mtt-completed-at{font-size:11px;line-height:18px}
      .mtt-chip .mtt-icon,.mtt-card-secondary .mtt-icon{width:12px;height:12px}
      .mtt-card-secondary>.mtt-due{color:var(--mt-muted)}
      .mtt-due[data-overdue=true]{color:light-dark(#c33f4f,#fa8e99)!important}
      .mtt-card button.mtt-parent-ref{font-size:11px}
      .mtt-subtasks{margin-left:26px}
      .mtt-subtasks>summary{top:11px;right:36px;font-size:11px;line-height:20px}
      .mtt-subtasks>.mtt-child{border-radius:9px;padding:9px 10px;gap:10px;position:relative}
      .mtt-child .mtt-completed-at{font-size:10px}
      .mtt-child-create{margin-left:26px}
      .mtt-card button.mtt-child-more{width:24px;height:24px;opacity:0;margin:-2px -4px -2px 0}
      .mtt-child:hover>.mtt-child-more,.mtt-child:focus-within>.mtt-child-more{opacity:1}
      .mtt button.mtt-note-trigger{width:22px;min-width:22px;height:22px;border:0;background:transparent;padding:2px;color:var(--mt-muted);margin-right:60px}
      .mtt-card:has(.mtt-subtasks) .mtt-card-top>.mtt-task-title:has(+.mtt-note-trigger),.mtt-card-top>.mtt-task-title:has(+.mtt-note-trigger){padding-right:0!important}

      .mtt-card:not(:has(.mtt-subtasks)) .mtt-note-trigger{margin-right:22px}
      .mtt-action-menu{width:210px;padding:6px;border-radius:10px;box-shadow:0 10px 32px #00000020}
      .mtt-action-menu>button{min-height:34px}
      .mtt .mtt-danger{color:light-dark(#bb3548,#fb91a2)}
      .mtt-action-menu>.mtt-danger{border-top:1px solid var(--mt-line);margin-top:4px;border-radius:0 0 5px 5px}
      .mtt-completed-section{margin-top:18px}
      .mtt button.mtt-completed-toggle{display:flex;align-items:center;gap:8px;width:100%;border:0;border-bottom:1px solid var(--mt-line);border-radius:0;padding:8px 4px;margin-bottom:10px;background:transparent;font-size:12px;color:var(--mt-muted)}
      .mtt-completed-toggle>.mtt-icon{width:12px;height:12px}
      .mtt-completed-toggle[aria-expanded=true]>.mtt-icon{transform:rotate(90deg)}
      .mtt-empty-state{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;padding-top:clamp(40px,12vh,120px)}
      .mtt-empty-state>.mtt-icon{width:36px;height:36px;color:color-mix(in srgb,var(--mt-accent) 55%,var(--mt-muted))}
      .mtt-empty-state>p{margin:0;font-size:15px}
      .mtt-empty-state>button{display:flex;align-items:center;gap:6px;border-color:var(--mt-line);font-size:12px}
      .mtt-detail{width:310px;padding:10px;background:var(--mt-canvas);scrollbar-width:thin;border-left:1px solid var(--mt-line)}
      .mtt-detail-heading{display:flex;align-items:center;justify-content:space-between;padding:0 2px 8px 8px;font-size:11px;color:var(--mt-muted)}
      .mtt-detail-title{margin:0 0 10px}
      .mtt-detail-title>input{width:100%;border:0;border-bottom:2px solid var(--mt-accent);border-radius:0;padding:8px;font-size:16px;font-weight:500;background:transparent}
      .mtt-detail-section,.mtt-detail-date{border:1px solid color-mix(in srgb,var(--mt-line) 70%,transparent);border-radius:10px;background:var(--mt-surface);margin-bottom:6px;overflow:hidden}
      .mtt-detail-section>summary{display:flex;align-items:center;gap:10px;cursor:pointer;min-height:46px;padding:12px 14px;list-style:none;font-size:13px}
      .mtt-detail-section>summary::-webkit-details-marker{display:none}
      .mtt-detail-section>summary>.mtt-icon{width:17px;height:17px}
      .mtt-detail-section>summary>.mtt-icon:last-child{margin-left:auto;width:12px;height:12px;color:var(--mt-muted)}
      .mtt-detail-section[open]>summary>.mtt-icon:last-child{transform:rotate(90deg)}
      .mtt-detail-section-content{padding:0 14px 14px}
      .mtt-detail-section-content>textarea{border:0;background:transparent;border-radius:0;padding:6px 0;min-height:120px;font-size:13px;line-height:1.65;resize:vertical}
      .mtt-detail-hint{font-size:11px;color:var(--mt-muted);margin-left:auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .mtt-detail-section>summary:has(.mtt-detail-hint)>.mtt-icon:last-child{margin-left:2px}
      .mtt .mtt-detail label.field{display:flex;flex-direction:row;align-items:center;gap:8px;justify-content:space-between;margin:8px 0;font-size:12px}
      .mtt-detail .field>span{flex-shrink:0;color:var(--mt-muted)}
      .mtt-detail .field>select{max-width:65%;border:0;background:var(--mt-tint);font-size:12px;padding:5px 7px}
      .mtt-detail-date{display:flex;align-items:center;gap:10px;padding:3px 14px;min-height:46px}
      .mtt-detail-date>.mtt-icon{width:17px;height:17px}
      .mtt-detail-date>.field{flex:1;min-width:0}
      .mtt-detail-date input{width:138px;max-width:65%;border:0;font-size:12px;padding:2px 0;background:transparent}
      .mtt-detail-date[data-overdue=true] input{color:light-dark(#c33f4f,#fa8e99)}
      .mtt-quadrant-options{display:flex;gap:16px;font-size:12px}
      .mtt-quadrant-options input{accent-color:var(--mt-accent)}
      .mtt-detail-child{display:flex;align-items:center;gap:8px;padding:6px 0;border-top:1px solid var(--mt-line)}
      .mtt-detail-child input{width:15px;height:15px;accent-color:var(--mt-accent)}
      .mtt-detail-child>button{border:0;background:transparent;padding:2px 0;font-size:13px;text-align:left;overflow-wrap:anywhere;min-width:0}
      .mtt-strike{text-decoration:line-through;color:var(--mt-muted)!important}
      .mtt-detail-child-create{display:flex;align-items:center;gap:4px;border-bottom:1px solid var(--mt-line);margin-top:6px}
      .mtt-detail-child-create>input{flex:1;min-width:0;border:0;background:transparent;font-size:12px;padding:6px 0}
      .mtt button.mtt-detail-parent{display:flex;align-items:center;gap:6px;border:0;background:transparent;margin-bottom:8px;padding:4px 6px;font-size:11px;text-align:left;color:var(--mt-muted);width:100%}
      .mtt-detail-footer{display:flex;flex-direction:column;gap:5px;color:var(--mt-muted);font-size:10px;text-align:right;padding:10px 6px}
      .mtt-detail-footer>.mtt-completed-full{margin:0;font-size:10px}
      .mtt-inherited{font-size:11px;color:var(--mt-muted)}
      .mtt-message:not(.mtt-error){position:absolute;right:16px;bottom:12px;z-index:4;pointer-events:none;font-size:11px;background:var(--mt-surface);border-radius:6px;box-shadow:0 2px 12px #0000000a}
      .mtt-message:empty{padding:0;background:none;box-shadow:none}
      @container task-main (max-width:560px){.mtt-head{padding:10px 14px;gap:6px}.mtt-head h1{font-size:16px}.mtt-tools,.mtt-filter-panel{margin-left:14px;margin-right:14px}.mtt-tools{flex-wrap:wrap}.mtt-tools>input{flex-basis:calc(100% - 32px)}.mtt-tools>select{max-width:100%;flex:1}.mtt-view-list .mtt-card-secondary{margin-left:26px}.mtt-card .mtt-child .mtt-parent-ref{margin-left:26px}.mtt-child>.mtt-child-more{position:absolute;right:8px;top:10px}.mtt-child>.mtt-task-title{padding-right:22px!important}.mtt-child>.mtt-completed-at{margin-left:26px}}
      @container task-card (max-width:240px){
        .mtt-card-top>.mtt-note-trigger{display:none}
        .mtt-card-top>.mtt-task-title,.mtt-card-top>.mtt-task-title:has(+.mtt-note-trigger){padding-right:20px!important}
        .mtt-card:has(.mtt-subtasks) .mtt-card-top>.mtt-task-title,.mtt-card:has(.mtt-subtasks) .mtt-card-top>.mtt-task-title:has(+.mtt-note-trigger){padding-right:42px!important}
        .mtt-subtasks>summary{min-width:24px;min-height:24px;padding:2px 4px;top:8px;right:30px;justify-content:center}
        .mtt-subtasks>summary>span{display:none}
        .mtt-subtasks{margin-left:12px}
        .mtt-subtasks>.mtt-child{padding:8px;gap:8px}
        .mtt-child>.mtt-child-more{position:absolute;right:4px;top:5px}
        .mtt-card .mtt-child>.mtt-task-title{padding-right:18px!important}
      }
      @media(max-width:780px){.mtt-projects{width:162px}.mtt-detail{width:300px}.mtt-nav-top{padding-left:5px}}
      @media(hover:none){.mtt-card button.mtt-child-more{opacity:1}}
      @media(prefers-reduced-motion:reduce){.mtt-projects{transition:none}}
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
        close: "m4 4 8 8M12 4l-8 8",
        search: "M11 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm-1 3 4 4",
        filter: "M2 4h12M4 8h8M6 12h4",
        check: "m3 8 3 3 7-7",
        note: "M2 2h12v9H6l-4 3zM5 5h6M5 8h4",
        send: "m2 2 12 6-12 6 3-6-3-6Zm3 6h9",
        refresh: "M13 6a5 5 0 1 0 0 4M13 2v4H9",
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
        if (item.status !== "done" || !item.completedAt || item.completionTimeEstimated) return null;
        const date = new Date(item.completedAt);
        const label = t("completedOn");
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
      const navId = React.useId();
      const [navSections, setNavSections] = React.useState(() => {
        try {
          const saved = JSON.parse(localStorage.getItem("dsh-task-manager.nav-sections"));
          return { projects: saved?.projects !== false, compact: saved?.compact === true };
        } catch { return { projects: true, compact: false }; }
      });
      React.useEffect(() => {
        try { localStorage.setItem("dsh-task-manager.nav-sections", JSON.stringify(navSections)); } catch { /* Browser preferences are optional. */ }
      }, [navSections]);
      const [collapsedParents, setCollapsedParents] = React.useState({});
      const [addingChild, setAddingChild] = React.useState(null);
      const [createProject, setCreateProject] = React.useState("");
      const [composerOpen, setComposerOpen] = React.useState(false),
        [filtersOpen, setFiltersOpen] = React.useState(false),
        [query, setQuery] = React.useState(""),
        [completedOpen, setCompletedOpen] = React.useState(true);
      const composerRef = React.useRef(), searchRef = React.useRef();
      const mutationQueue = React.useRef(Promise.resolve());
      const pendingDetail = React.useRef({ id: null, values: {} });
      const savingDetail = React.useRef(null), saveTimer = React.useRef();
      const [, renderDraft] = React.useReducer((n) => n + 1, 0);
      const draftStorageKey = (id) => "dsh-task-manager.draft." + id;
      function persistDraft() {
        const pending = pendingDetail.current;
        if (!pending.id) return;
        try {
          if (Object.keys(pending.values).length) localStorage.setItem(draftStorageKey(pending.id), JSON.stringify(pending.values));
          else localStorage.removeItem(draftStorageKey(pending.id));
        } catch { /* Draft recovery is optional when browser storage is unavailable. */ }
      }
      function enqueueMutation(action, saved = true) {
        const result = mutationQueue.current.then(() => run(action, saved));
        mutationQueue.current = result.catch(() => {});
        return result;
      }
      function saveDetail() {
        clearTimeout(saveTimer.current);
        if (savingDetail.current) return savingDetail.current;
        if (!detailDirty.current) return Promise.resolve(true);
        savingDetail.current = (async () => {
          const pending = pendingDetail.current;
          while (Object.keys(pending.values).length) {
            const patch = { ...pending.values };
            if ("title" in patch && !patch.title.trim()) { setError(t("invalidTitle")); return false; }
            const result = await enqueueMutation(() => api.mutate("task.update", { id: pending.id, ...patch }));
            if (result === false) return false;
            for (const key of Object.keys(patch)) {
              if (pending.values[key] === patch[key]) delete pending.values[key];
            }
            detailDirty.current = Object.keys(pending.values).length > 0;
            persistDraft(); renderDraft();
          }
          return true;
        })().finally(() => { savingDetail.current = null; });
        return savingDetail.current;
      }
      function editDetail(name, value) {
        pendingDetail.current.values[name] = value;
        detailDirty.current = true;
        persistDraft(); renderDraft();
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => { saveDetail(); }, 600);
      }
      function showComposer() {
        setComposerOpen(true);
        requestAnimationFrame(() => composerRef.current?.focus());
      }
      function showSearch() {
        setFiltersOpen(true);
        requestAnimationFrame(() => searchRef.current?.focus());
      }
      React.useEffect(() => {
        const shortcut = (e) => {
          if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.target.closest("input,textarea,select,[contenteditable=true],dialog")) return;
          if (e.shiftKey && e.key.toLowerCase() === "a") { e.preventDefault(); showComposer(); }
          else if (e.key === "/") { e.preventDefault(); showSearch(); }
        };
        window.addEventListener("keydown", shortcut);
        return () => { window.removeEventListener("keydown", shortcut); clearTimeout(saveTimer.current); };
      }, []);
      React.useEffect(() => {
        if (!notice) return;
        const timer = setTimeout(() => setNotice(""), 2600);
        return () => clearTimeout(timer);
      }, [notice]);
      const fileRef = React.useRef(),
        lock = React.useRef(false),
        detailDirty = React.useRef(false);
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
      const operationBusy = busy && !savingDetail.current;
      async function read(action) {
        if (detailDirty.current && !(await saveDetail())) return false;
        return enqueueMutation(action, false);
      }
      async function change(op, args, revision) {
        if (detailDirty.current && !(await saveDetail())) return false;
        return enqueueMutation(() => api.mutate(op, args, revision));
      }
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
      const roots = (state?.tasks ?? []).filter(
        (task) =>
          task.parentId === null &&
          visible.has(task.projectId) &&
          (status === "all" || task.status === status) &&
          (!query.trim() || [task, ...children(task.id)].some((row) =>
            [row.title, row.description, row.notes].some((text) => text.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())))),
      );

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
      async function open(id) {
        if (detailDirty.current && !(await saveDetail())) return false;
        clearTimeout(saveTimer.current);
        let recovered = {};
        if (id) {
          try {
            const draft = JSON.parse(localStorage.getItem(draftStorageKey(id)) || "{}");
            const item = snapshot.state?.tasks.find((x) => x.id === id);
            const fields = ["title", "description", "notes", "status", "priority", "dueDate", ...(item?.parentId === null ? ["projectId", "important", "urgent"] : [])];
            for (const field of fields) {
              if (Object.hasOwn(draft, field) && (typeof draft[field] === "string" || (field === "dueDate" && draft[field] === null) || (["important", "urgent"].includes(field) && typeof draft[field] === "boolean"))) recovered[field] = draft[field];
            }
          } catch { /* Invalid local drafts do not prevent opening a task. */ }
        }
        pendingDetail.current = { id, values: recovered };
        detailDirty.current = Object.keys(recovered).length > 0;
        if (detailDirty.current) setNotice(t("recoveredDraft"));
        setSelected(id);
        setAddingChild(null);
        return true;
      }
      async function openGlobalView(nextView) {
        if (!(await open(null))) return;
        setScope("all");
        setArchived(false);
        setStatus("all");
        setQuery("");
        setView(nextView);
      }
      async function toggleArchived() {
        if (!(await open(null))) return;
        setView("list");
        setArchived((value) => !value);
        setScope("all");
        setNavSections((values) => ({ ...values, projects: true }));
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
            "aria-label": t("move"), value: qkey(item), disabled: operationBusy || archived,
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
            "aria-label": t("status"), value: item.status, disabled: operationBusy || archived,
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
      function taskMenu(item, child = false) {
        const siblings = child ? children(item.parentId) : orderGroups.get(orderGroupKey(item));
        const position = siblings.findIndex((x) => x.id === item.id);
        const automaticOrder = (view === "list" || child) && item.status === "done";
        return h(ActionMenu, { label: t("taskActions") + ": " + item.title, buttonClass: child ? "mtt-child-more" : "mtt-more" },
          h("div", { className: "mtt-menu-fields" },
            h("label", { className: "mtt-menu-field" }, h("span", null, t("status")), statusSelect(item)),
            !child ? h("label", { className: "mtt-menu-field" }, h("span", null, t("quadrant")), quadrantSelect(item)) : null,
          ),
          h(Button, { onClick: () => open(item.id) }, h(Icon, { name: "detail" }), t("details")),
          item.notes || item.description ? h(Button, { onClick: () => open(item.id) }, h(Icon, { name: "note" }), t("notes")) : null,
          !child ? h(Button, { disabled: operationBusy || archived, onClick: () => {
            setAddingChild(item.id); setCollapsedParents((values) => ({ ...values, [item.id]: false }));
          } }, h(Icon, { name: "plus" }), t("addChild")) : null,
          ...[-1, 1].map((direction) => h(Button, {
            key: direction, disabled: operationBusy || archived || automaticOrder || (direction < 0 ? position === 0 : position === siblings.length - 1),
            onClick: () => sort(siblings, item.id, direction, child ? "list" : view),
          }, h(Icon, { name: direction < 0 ? "up" : "down" }), t(direction < 0 ? "up" : "down"))),
          h(Button, { className: "mtt-danger", disabled: operationBusy || archived, onClick: () => setDialog({ kind: "deleteTask", id: item.id }) }, h(Icon, { name: "trash" }), t("remove")),
        );
      }
      function contextMenu(e) {
        if (e.target.closest("input,textarea,select,[popover]")) return;
        const trigger = e.currentTarget.querySelector(":scope > .mtt-card-top .mtt-menu-trigger, :scope > .mtt-child-more");
        if (!trigger) return;
        e.preventDefault(); e.stopPropagation();
        const menu = document.getElementById(trigger.getAttribute("popovertarget"));
        if (!menu?.matches(":popover-open")) trigger.click();
        requestAnimationFrame(() => menu?.querySelector("button:not(:disabled),select:not(:disabled)")?.focus());
      }
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
          "data-task-id": item.id, "data-drop": dragTarget === item.id, "data-selected": selected === item.id,
          onContextMenu: contextMenu,
          onKeyDown: (e) => { if (e.shiftKey && e.key === "F10") contextMenu(e); },
          onDragEnd: () => setDragTarget(null), draggable: !operationBusy && !archived && !automaticOrder,
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
              type: "checkbox", checked: item.status === "done", disabled: operationBusy || archived,
              "aria-label": t(item.status === "done" ? "reopen" : "complete"),
              onChange: (e) => change("task.update", { id: item.id, status: e.target.checked ? "done" : "todo" }),
            }),
            h(Button, { className: "mtt-task-title", title: item.title, onClick: () => open(item.id) }, item.title),
            item.notes || item.description ? h(Button, { className: "mtt-note-trigger", "aria-label": t("notes") + ": " + item.title, title: t("notes"), onClick: () => open(item.id) }, h(Icon, { name: "note" })) : null,
            taskMenu(item),
          ),
          h("div", { className: "mtt-card-secondary" },
            scope === "all" && project ? h("span", { className: "mtt-project-tag", title: project.name }, h(Icon, { name: "project" }), project.name) : null,
            item.priority !== "normal" ? h("span", { className: "mtt-priority", "data-priority": item.priority }, t("priority") + " · " + t(item.priority)) : null,
            item.dueDate ? h("span", { className: "mtt-due", "data-overdue": item.dueDate < new Date().toLocaleDateString("sv-SE") && item.status !== "done" }, h(Icon, { name: "calendar" }), item.dueDate) : null,
            view !== "board" && item.status !== "todo" ? statusSelect(item) : null,
            view !== "matrix" && qkey(item) !== "q4" ? quadrantSelect(item) : null,
            view === "list" ? completionTime(item) : null,
          ),
          subs.length ? h("details", {
            className: "mtt-subtasks", open: !(collapsedParents[item.id] ?? (view !== "list")),
            onToggle: (e) => {
              if (e.target !== e.currentTarget) return;
              const collapsed = !e.currentTarget.open;
              setCollapsedParents((values) => values[item.id] === collapsed ? values : { ...values, [item.id]: collapsed });
            },
          },
            h("summary", { "aria-label": t("subtasks") + ` ${completed}/${subs.length}`, title: t("subtasks") + ` ${completed}/${subs.length}` },
              h(Icon, { name: "chevron" }),
              h("span", null, `${completed}/${subs.length}`),
            ),
            subs.map((s) => h("div", {
              key: s.id, className: "mtt-child mtt-row " + (s.status === "done" ? "mtt-done" : ""),
              "data-selected": selected === s.id, onContextMenu: contextMenu,
              onKeyDown: (e) => { if (e.shiftKey && e.key === "F10") contextMenu(e); },
            },
              h("input", {
                type: "checkbox", checked: s.status === "done", disabled: operationBusy || archived,
                "aria-label": s.title,
                onChange: (e) => change("task.update", { id: s.id, status: e.target.checked ? "done" : "todo" }),
              }),
              h(Button, { className: "mtt-task-title", onClick: () => open(s.id) }, s.title),
              view === "list" ? h(Button, { className: "mtt-parent-ref", title: t("parentTask") + ": " + item.title, onClick: () => open(item.id) }, t("parentTask") + " · " + item.title) : null,
              view === "list" ? completionTime(s) : null,
              taskMenu(s, true),
            )),
          ) : null,
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
            h("input", { name: "child", "aria-label": t("addChild"), placeholder: t("addChild"), required: true, maxLength: 200, autoFocus: true, disabled: operationBusy || archived }),
            h("button", { type: "submit", disabled: operationBusy || archived }, t("create")),
            h(Button, { onClick: () => setAddingChild(null) }, t("cancel")),
          ) : null,
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
        const values = { ...item, ...(pendingDetail.current.id === item.id ? pendingDetail.current.values : {}) };
        const field = (name, control) => h(Field, { label: t(name) }, control);
        const input = (name, type = "text") => h("input", {
          name, type, value: values[name] ?? "", "aria-label": t(name === "title" ? "taskTitle" : name),
          disabled: archived, maxLength: name === "title" ? 200 : undefined,
          onChange: (e) => editDetail(name, type === "date" ? e.target.value || null : e.target.value),
          onBlur: saveDetail,
        });
        const select = (name, options) => h("select", {
          name, value: values[name], "aria-label": t(name === "projectId" ? "projects" : name), disabled: archived,
          onChange: (e) => { editDetail(name, e.target.value); saveDetail(); },
        }, options.map(([value, label]) => h("option", { key: value, value }, label)));
        const text = (name) => h("textarea", {
          name, value: values[name], "aria-label": t(name), placeholder: t(name), disabled: archived, maxLength: 100000,
          onChange: (e) => editDetail(name, e.target.value), onBlur: saveDetail,
        });
        const section = (name, icon, content, expanded = true, hint = null) => h("details", { className: "mtt-detail-section", open: expanded, key: name },
          h("summary", null, h(Icon, { name: icon }), h("span", null, t(name)), hint ? h("span", { className: "mtt-detail-hint" }, hint) : null, h(Icon, { name: "chevron" })),
          h("div", { className: "mtt-detail-section-content" }, content),
        );
        const parent = item.parentId ? state.tasks.find((x) => x.id === item.parentId) : null;
        return h("aside", { className: "mtt-detail", "aria-label": t("details"), key: item.id },
          h("div", { className: "mtt-detail-heading" },
            h("span", null, t("details")),
            h(Button, { className: "mtt-icon-button", "aria-label": t("close"), title: t("close"), onClick: () => open(null) }, h(Icon, { name: "close" })),
          ),
          h("div", { className: "mtt-detail-title" }, input("title")),
          parent ? h(Button, { className: "mtt-detail-parent", onClick: () => open(parent.id) }, h(Icon, { name: "list" }), t("parentTask") + " · " + parent.title) : null,
          item.parentId === null ? section("subtasks", "list", h(React.Fragment, null,
            children(item.id).map((child) => h("div", { className: "mtt-detail-child", key: child.id },
              h("input", { type: "checkbox", checked: child.status === "done", disabled: operationBusy || archived, "aria-label": child.title,
                onChange: (e) => change("task.update", { id: child.id, status: e.target.checked ? "done" : "todo" }) }),
              h(Button, { className: child.status === "done" ? "mtt-strike" : "", onClick: () => open(child.id) }, child.title),
            )),
            h("form", { className: "mtt-detail-child-create", "aria-label": t("addChild"), onSubmit: async (e) => {
              e.preventDefault(); const form = e.currentTarget;
              const result = await change("task.create", { projectId: item.projectId, parentId: item.id, title: new FormData(form).get("child") });
              if (result !== false) { form.reset(); setCollapsedParents((v) => ({ ...v, [item.id]: false })); form.elements.namedItem("child")?.focus(); }
            } }, h("input", { name: "child", "aria-label": t("addChild"), placeholder: t("addChild"), required: true, maxLength: 200, disabled: archived || operationBusy }),
              h("button", { className: "mtt-icon-button", type: "submit", "aria-label": t("addChild"), disabled: archived || operationBusy }, h(Icon, { name: "plus" }))),
          ), true, String(children(item.id).length)) : null,
          section("taskProperties", "detail", h(React.Fragment, null,
            item.parentId === null ? field("projects", select("projectId", state.projects.filter((p) => !p.archivedAt || p.id === item.projectId).map((p) => [p.id, p.name]))) : h("p", { className: "mtt-inherited" }, t("inherited")),
            field("status", select("status", statuses.map((s) => [s, t(s)]))),
            field("priority", select("priority", ["low", "normal", "high"].map((s) => [s, t(s)]))),
          ), false),
          h("div", { className: "mtt-detail-date", "data-overdue": values.dueDate && values.dueDate < new Date().toLocaleDateString("sv-SE") && item.status !== "done" },
            h(Icon, { name: "calendar" }), field("dueDate", input("dueDate", "date"))),
          item.parentId === null ? section("quadrant", "flag", h("div", { className: "mtt-quadrant-options" },
            ...["important", "urgent"].map((name) => h("label", { key: name, className: "mtt-check" },
              h("input", { name, type: "checkbox", checked: values[name], disabled: archived,
                onChange: (e) => { editDetail(name, e.target.checked); saveDetail(); } }), t(name))),
          ), false, t(qkey(values))) : null,
          section("description", "detail", text("description"), !!values.description),
          section("notes", "note", text("notes")),
          h("div", { className: "mtt-detail-footer" },
            h("span", { role: "status", "aria-live": "polite" }, busy ? t("saving") : detailDirty.current ? t("unsaved") : t("autoSaved")),
            completionTime(item, true),
            h("time", { dateTime: item.createdAt }, t("createdOn") + " " + completionFormats.full.format(new Date(item.createdAt))),
          ),
        );
      }
      const dialogView = () => {
        if (!dialog) return null;
        const close = () => {
          if (!operationBusy) setDialog(null);
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
                  if (result !== false) {
                    setDialog(null);
                    if (!p) {
                      const created = result.state.projects.find((project) => !state.projects.some((old) => old.id === project.id));
                      if (created && await open(null)) { setScope(created.id); setView("list"); setArchived(false); setNavSections((v) => ({ ...v, projects: true, compact: false })); showComposer(); }
                    }
                  }
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
                h("button", { type: "submit", disabled: operationBusy }, t("save")),
                h(Button, { disabled: operationBusy, onClick: close }, t("cancel")),
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
                disabled: operationBusy,
                onClick: async () => {
                  const r = await change("import", { input: dialog.input });
                  if (r !== false) setDialog(null);
                },
              },
              t("importConfirm"),
            ),
            h(Button, { disabled: operationBusy, onClick: close }, t("cancel")),
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
              disabled: operationBusy,
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
          h(Button, { disabled: operationBusy, onClick: close }, t("cancel")),
        );
      };
      return h(
        "div",
        { className: "mtt mtt-view-" + view + (navSections.compact ? " mtt-nav-compact" : ""), "data-task-manager": "",
          onKeyDown: (e) => {
            if (e.key !== "Escape") return;
            e.stopPropagation();
            if (e.target.closest("[popover]")) return;
            if (addingChild) setAddingChild(null);
            else if (selected) open(null);
            else if (composerOpen) setComposerOpen(false);
            else if (filtersOpen) setFiltersOpen(false);
          },
        },
        h("style", null, css + cardCss + experienceCss),
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
              read(async () => {
                if (file.size > 20 * 1024 * 1024) throw Error(t("invalidFile"));
                const input = await file.text();
                const preview = await api.call("preview", { input });
                setDialog({ kind: "preview", input, preview });
              });
            },
          }),
        error || snapshot.error
          ? h(
              "div",
              { role: "alert", className: "mtt-message mtt-error" },
              error || snapshot.error,
              h(
                Button,
                { disabled: operationBusy, onClick: () => read(() => api.refresh()) },
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
            h("div", { className: "mtt-nav-top" }, h("span", null, t("title")),
              h(Button, { className: "mtt-icon-button", "aria-label": t(navSections.compact ? "expandNavigation" : "collapseNavigation"), title: t(navSections.compact ? "expandNavigation" : "collapseNavigation"), onClick: () => setNavSections((v) => ({ ...v, compact: !v.compact })) }, h(Icon, { name: "chevron" }))),
            h(
              "div",
              { className: "mtt-views", role: "group", "aria-label": t("views") },
              h(Button, {
                "aria-label": t("list"), title: t("list"), "aria-pressed": view === "list" && scope === "all" && !archived,
                onClick: () => openGlobalView("list"),
              }, h(Icon, { name: "list" }), h("span", { className: "mtt-project-label" }, t("list")), h("span", { className: "mtt-nav-count" }, (state?.tasks ?? []).filter((x) => x.parentId === null && x.status !== "done" && state.projects.some((p) => p.id === x.projectId && !p.archivedAt)).length)),
              ["board", "matrix"].map((v) => h(Button, {
                key: v, "aria-label": t(v), title: t(v), "aria-pressed": view === v, onClick: () => openGlobalView(v),
              }, h(Icon, { name: v }), h("span", { className: "mtt-project-label" }, t(v)))),
            ),
            h(
              "div",
              { className: "mtt-project-list", role: "group", "aria-label": t("projects") },
              h("div", { className: "mtt-project-list-heading" },
                h("h2", null, h(Button, {
                  className: "mtt-section-toggle", "aria-label": t("projectDirectory"),
                  "aria-expanded": navSections.projects, "aria-controls": navId + "-projects",
                  onClick: () => setNavSections((values) => ({ ...values, projects: !values.projects })),
                }, h(Icon, { name: "chevron" }), t(archived ? "archived" : "projects"))),
                h(Button, { className: "mtt-icon-button mtt-project-add", disabled: operationBusy || !state, "aria-label": t("newProject"), title: t("newProject"), onClick: () => setDialog({ kind: "project" }) }, h(Icon, { name: "plus" })),
                h(ActionMenu, { label: t("projectMenu"), buttonClass: "mtt-project-menu", disabled: operationBusy },
                  h(Button, { onClick: () => setDialog({ kind: "project" }) }, h(Icon, { name: "plus" }), t("newProject")),
                  h(Button, {
                    disabled: !archived && !state?.projects.some((p) => p.archivedAt),
                    onClick: toggleArchived,
                  }, h(Icon, { name: archived ? "project" : "archive" }), t(archived ? "activeProjects" : "viewArchived")),
                ),
              ),
              h("div", { id: navId + "-projects", className: "mtt-project-items", hidden: !navSections.projects },
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
                      key: p.id, "aria-label": p.name, title: p.name,
                      "aria-pressed": scope === p.id,
                      onClick: async () => { if (await open(null)) { setScope(p.id); setView("list"); setQuery(""); setStatus("all"); } },
                    },
                    h(Icon, { name: "project" }),
                    h("span", { className: "mtt-project-label" }, p.name),
                    h("span", { className: "mtt-nav-count" }, state.tasks.filter((x) => x.projectId === p.id && x.parentId === null && x.status !== "done").length || null),
                  ),
                ),
              ),
            ),
            h(Button, { className: "mtt-nav-search", "aria-label": t("search"), title: t("search") + " (/)", onClick: showSearch }, h(Icon, { name: "search" }), h("span", { className: "mtt-project-label" }, t("search"))),
          ),
          h(
            "main",
            { className: "mtt-main" },
            h("header", { className: "mtt-head" },
              h(Icon, { name: view === "list" ? current ? "project" : "list" : view }),
              h("h1", null, view === "list" && current ? current.name : t(view)),
            current
              ? h(
                  "div",
                  { className: "mtt-project-heading" },
                  h("h2", null, current.name),
                  h(ActionMenu, { label: t("projectMenu") + ": " + current.name, buttonClass: "mtt-project-menu", disabled: operationBusy },
                    h(
                      Button,
                      {
                        disabled: operationBusy,
                        onClick: () => setDialog({ kind: "rename" }),
                      },
                      h(Icon, { name: "edit" }), t("rename"),
                    ),
                    h(
                      Button,
                      {
                        disabled: operationBusy,
                        onClick: async () => {
                          if (!(await open(null))) return;
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
                        disabled: operationBusy,
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
                          disabled: operationBusy,
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
              h("span", { className: "mtt-head-spacer" }),
              h(Button, { className: "mtt-icon-button mtt-add-task", "aria-label": t("newTask"), title: t("newTask") + " (Shift+A)", disabled: archived || !projects.length, onClick: showComposer }, h(Icon, { name: "plus" })),
              h(Button, { className: "mtt-icon-button", "aria-label": t("filter"), title: t("filter"), "aria-expanded": filtersOpen, "data-active": !!query || status !== "all" || showDone, onClick: () => setFiltersOpen((v) => !v) }, h(Icon, { name: "filter" })),
          h(ActionMenu, { label: t("moreActions"), buttonClass: "mtt-head-menu", disabled: operationBusy },
            h(
              Button,
              {
                disabled: operationBusy || !state,
                onClick: () =>
                  read(async () => {
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
              { disabled: operationBusy, onClick: () => fileRef.current.click() },
              h(Icon, { name: "upload" }), t("import"),
            ),
            h(Button, { disabled: operationBusy, onClick: () => read(() => api.refresh()) }, h(Icon, { name: "refresh" }), t("refresh")),
          ),
            ),
            filtersOpen ? h("div", { className: "mtt-filter-panel", role: "search", "aria-label": t("filter") },
              h("div", { className: "mtt-search-field" }, h(Icon, { name: "search" }), h("input", { ref: searchRef, type: "search", "aria-label": t("search"), placeholder: t("search"), value: query, onChange: (e) => setQuery(e.target.value) })),
              h("select", { "aria-label": t("status"), value: status, onChange: (e) => setStatus(e.target.value) }, h("option", { value: "all" }, t("anyStatus")), statuses.map((s) => h("option", { key: s, value: s }, t(s)))),
              view === "matrix" ? h("label", { className: "mtt-check" }, h("input", { type: "checkbox", checked: showDone, onChange: (e) => setShowDone(e.target.checked) }), t("showDone")) : null,
              query || status !== "all" || showDone ? h(Button, { onClick: () => { setQuery(""); setStatus("all"); setShowDone(false); } }, t("clearFilters")) : null,
              h(Button, { className: "mtt-icon-button", "aria-label": t("close"), onClick: () => setFiltersOpen(false) }, h(Icon, { name: "close" })),
            ) : !filtersOpen && (query || status !== "all" || showDone) ? h("div", { className: "mtt-filter-summary" }, t("filtersActive"), h(Button, { onClick: () => { setQuery(""); setStatus("all"); setShowDone(false); } }, t("clearFilters"))) : null,
            composerOpen && !archived ? h("form", {
              className: "mtt-tools", "aria-label": t("newTask"),
              onSubmit: async (e) => {
                e.preventDefault();
                const targetProject = scope === "all" ? createProject : scope;
                if (!targetProject || archived) { setError(t("selectProject")); return; }
                const result = await change("task.create", { projectId: targetProject, title });
                if (result !== false) { setTitle(""); requestAnimationFrame(() => composerRef.current?.focus()); }
              },
            },
              h(Icon, { name: "plus" }),
              h("input", { ref: composerRef, "aria-label": t("taskTitle"), placeholder: t("addTaskHint"), value: title, onChange: (e) => setTitle(e.target.value), required: true, maxLength: 200, disabled: operationBusy }),
              scope === "all" ? h("select", { "aria-label": t("projects"), value: createProject, onChange: (e) => setCreateProject(e.target.value), disabled: operationBusy, required: true },
                h("option", { value: "" }, t("selectProject")), projects.map((p) => h("option", { key: p.id, value: p.id }, p.name))) : null,
              h("button", { type: "submit", className: "mtt-icon-button", "aria-label": t("create"), title: t("create"), disabled: operationBusy || !title.trim() }, h(Icon, { name: "send" })),
              h(Button, { className: "mtt-icon-button", "aria-label": t("cancel"), onClick: () => setComposerOpen(false) }, h(Icon, { name: "close" })),
            ) : null,
            h(
              "div",
              { className: "mtt-content" },
              !state ? h("p", { className: "mtt-empty" }, t("loading")) : !projects.length
                ? h("div", { className: "mtt-empty" },
                    h("p", null, t(archived ? "noArchivedProjects" : state?.projects.length ? "noActiveProjects" : "noProjects")),
                    !archived ? h(Button, { onClick: () => setDialog({ kind: "project" }) }, t("newProject")) : null,
                  )
                : view === "list"
                  ? roots.length
                    ? h(React.Fragment, null,
                        limited(roots.filter((x) => x.status !== "done").sort(compareListTasks), "list-active", (x) => card(x)),
                        roots.some((x) => x.status === "done") ? h("section", { className: "mtt-completed-section" },
                          h(Button, { className: "mtt-completed-toggle", "aria-expanded": completedOpen, onClick: () => setCompletedOpen((v) => !v) }, h(Icon, { name: "chevron" }), t("completedTasks"), h("span", { className: "mtt-count" }, roots.filter((x) => x.status === "done").length)),
                          completedOpen ? limited(roots.filter((x) => x.status === "done").sort(compareListTasks), "list-completed", (x) => card(x)) : null,
                        ) : null,
                      )
                    : h("div", { className: "mtt-empty mtt-empty-state" },
                        h(Icon, { name: query || status !== "all" ? "search" : "check" }),
                        h("p", null, t(query || status !== "all" ? "noResults" : "empty")),
                        query || status !== "all" ? h(Button, { onClick: () => { setQuery(""); setStatus("all"); } }, t("clearFilters")) : !archived ? h(Button, { onClick: showComposer }, h(Icon, { name: "plus" }), t("newTask")) : null,
                      )
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
