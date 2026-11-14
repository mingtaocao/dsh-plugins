/** Authoritative task operations. Every operation transforms a copy and is persisted as one snapshot. */
import { randomUUID } from "node:crypto";
export const FORMAT = "dsh-task-manager";
export const MAX_RECORDS = 20000;
const states = ["todo", "doing", "done"];
const priorities = ["low", "normal", "high"];
export function fail(message, code = "INVALID_INPUT") {
  throw Object.assign(new Error(message), { code });
}
function check(value, message) {
  if (!value) fail(message);
}
function text(value, max, label) {
  check(
    typeof value === "string" && value.length <= max,
    `${label}格式或长度错误`,
  );
  return value;
}
function title(value) {
  text(value, 200, "名称");
  check(value.trim().length > 0, "名称不能为空");
  return value.trim();
}
function date(value) {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
function stamp(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}
function source(value) {
  check(
    value &&
      ["dsh", "super-productivity"].includes(value.system) &&
      typeof value.externalId === "string" &&
      value.externalId.length > 0,
    "来源引用无效",
  );
}
export function emptyState() {
  return {
    schemaVersion: 1,
    revision: 0,
    projects: [],
    tasks: [],
    receipts: [],
  };
}
/** Validate imported/durable data, including referential integrity, before admitting it. */
export function validateState(s) {
  check(s && s.schemaVersion === 1, "不支持的数据版本");
  check(Number.isSafeInteger(s.revision) && s.revision >= 0, "版本号无效");
  check(
    Array.isArray(s.projects) &&
      Array.isArray(s.tasks) &&
      s.projects.length + s.tasks.length <= MAX_RECORDS,
    "数据数量超出上限",
  );
  check(
    Array.isArray(s.receipts) &&
      s.receipts.length <= 1000 &&
      s.receipts.every((x) => typeof x === "string"),
    "操作记录无效",
  );
  const ids = new Set(),
    projects = new Map(),
    tasks = new Map(),
    names = new Set(),
    sources = new Set();
  const common = (e) => {
    check(
      e && typeof e.id === "string" && e.id.length > 0 && !ids.has(e.id),
      "实体 ID 重复或无效",
    );
    ids.add(e.id);
    check(stamp(e.createdAt) && stamp(e.updatedAt), "时间戳无效");
    source(e.source);
    const key = `${e.source.system}:${e.source.externalId}`;
    check(!sources.has(key), "来源 ID 重复");
    sources.add(key);
  };
  for (const p of s.projects) {
    common(p);
    title(p.name);
    text(p.description, 100000, "项目描述");
    check(Number.isFinite(p.order), "项目排序无效");
    check(p.archivedAt === null || stamp(p.archivedAt), "归档时间无效");
    const key = p.name.trim().toLocaleLowerCase();
    check(!names.has(key), "项目名称重复");
    names.add(key);
    projects.set(p.id, p);
  }
  for (const t of s.tasks) {
    common(t);
    title(t.title);
    text(t.description, 100000, "任务描述");
    text(t.notes, 100000, "备注");
    check(projects.has(t.projectId), "任务所属项目不存在");
    check(
      t.parentId === null || typeof t.parentId === "string",
      "父任务引用无效",
    );
    check(
      states.includes(t.status) && priorities.includes(t.priority),
      "任务状态或优先级无效",
    );
    check(
      typeof t.important === "boolean" && typeof t.urgent === "boolean",
      "重要性和紧急性必须是布尔值",
    );
    check(t.dueDate === null || date(t.dueDate), "截止日期无效");
    for (const key of ["listOrder", "boardOrder", "matrixOrder"])
      check(Number.isFinite(t[key]), "任务排序无效");
    check(
      t.status === "done" ? stamp(t.completedAt) : t.completedAt === null,
      "完成时间与状态不一致",
    );
    if (t.completionTimeEstimated !== undefined)
      check(
        typeof t.completionTimeEstimated === "boolean",
        "完成时间估算标记无效",
      );
    tasks.set(t.id, t);
  }
  for (const t of s.tasks)
    if (t.parentId !== null) {
      const p = tasks.get(t.parentId);
      check(
        p && p.parentId === null && p.projectId === t.projectId,
        "子任务必须属于同项目的顶层任务，且只支持两级",
      );
    }
  return s;
}
/** Read old v1 snapshots/backups without retaining the removed blocked state. */
export function migrateLegacyState(value) {
  if (!Array.isArray(value?.tasks) || !value.tasks.some((t) => t?.status === "blocked"))
    return validateState(value);
  const next = structuredClone(value);
  for (const task of next.tasks)
    if (task.status === "blocked") task.status = "todo";
  next.revision++;
  return validateState(next);
}
export function exportData(s, now = new Date().toISOString()) {
  return {
    format: FORMAT,
    schemaVersion: 1,
    exportedAt: now,
    projects: structuredClone(s.projects),
    tasks: structuredClone(s.tasks),
  };
}
/** Parse native v1 or the verified SP 4.5 wrapper; refuse unverified versions. */
export function parseImport(input) {
  check(
    typeof input === "string" &&
      Buffer.byteLength(input, "utf8") <= 20 * 1024 * 1024,
    "文件上限为 20 MiB",
  );
  let raw;
  try {
    raw = JSON.parse(input, (key, value) => {
      if (["__proto__", "constructor", "prototype"].includes(key))
        fail("文件包含不安全字段");
      return value;
    });
  } catch (e) {
    fail(e.code ? e.message : "文件不是有效 JSON");
  }
  if (raw?.format !== FORMAT && raw?.data) return fromSuperProductivity(raw);
  check(
    raw?.format === FORMAT,
    "仅支持 DSH 原生格式或已验证的 Super Productivity 4.5 包装备份",
  );
  // Explicit field projection keeps unrelated credentials and arbitrary objects out of storage/exports.
  const projectKeys = [
    "id",
    "name",
    "description",
    "order",
    "archivedAt",
    "createdAt",
    "updatedAt",
    "source",
  ];
  const taskKeys = [
    "id",
    "projectId",
    "parentId",
    "title",
    "description",
    "notes",
    "status",
    "priority",
    "important",
    "urgent",
    "dueDate",
    "listOrder",
    "boardOrder",
    "matrixOrder",
    "completedAt",
    "createdAt",
    "updatedAt",
    "source",
    "completionTimeEstimated",
  ];
  const pick = (e, keys) =>
    Object.fromEntries(
      keys
        .filter((k) => e?.[k] !== undefined)
        .map((k) => [
          k,
          k === "source" && e?.source
            ? { system: e.source.system, externalId: e.source.externalId }
            : e?.[k],
        ]),
    );
  check(
    Array.isArray(raw.projects) && Array.isArray(raw.tasks),
    "项目和任务数组缺失",
  );
  return migrateLegacyState({
    schemaVersion: raw.schemaVersion,
    revision: 0,
    receipts: [],
    projects: raw.projects.map((e) => pick(e, projectKeys)),
    tasks: raw.tasks.map((e) => pick(e, taskKeys)),
  });
}
/** Compatibility is deliberately limited to the official crossModelVersion 4.5 backup fixture. */
function fromSuperProductivity(raw) {
  check(
    raw.crossModelVersion === 4.5,
    "未支持的 Super Productivity crossModelVersion",
  );
  const data = raw.data;
  const table = (v, name) => {
    check(
      v &&
        Array.isArray(v.ids) &&
        v.entities &&
        typeof v.entities === "object" &&
        !Array.isArray(v.entities),
      `${name} 表结构无效`,
    );
    check(
      new Set(v.ids).size === v.ids.length &&
        Object.keys(v.entities).length === v.ids.length,
      `${name} ID 重复或清单不一致`,
    );
    return v.ids.map((key) => {
      const e = v.entities[key];
      check(
        typeof key === "string" && e && e.id === key,
        `${name} ID 引用断裂`,
      );
      return e;
    });
  };
  const projects = table(data.project, "project"),
    tasks = table(data.task, "task");
  check(projects.length + tasks.length <= MAX_RECORDS, "数据数量超出上限");
  const taskMap = new Map(tasks.map((t) => [t.id, t])),
    projectMap = new Map(projects.map((p) => [p.id, p]));
  const now = new Date().toISOString(),
    s = emptyState();
  for (const [index, p] of projects.entries()) {
    check(
      typeof p.isArchived === "boolean" &&
        Array.isArray(p.taskIds) &&
        Array.isArray(p.backlogTaskIds),
      "SP 项目字段无效",
    );
    const ordered = [...p.taskIds, ...p.backlogTaskIds];
    check(new Set(ordered).size === ordered.length, "SP 项目排序引用重复");
    for (const taskId of ordered) {
      const t = taskMap.get(taskId);
      check(t && !t.parentId && t.projectId === p.id, "SP 项目排序引用断裂");
    }
    s.projects.push({
      id: p.id,
      name: title(p.title),
      description: "",
      order: index,
      archivedAt: p.isArchived ? now : null,
      createdAt: now,
      updatedAt: now,
      source: { system: "super-productivity", externalId: p.id },
    });
  }
  for (const [index, t] of tasks.entries()) {
    check(
      Array.isArray(t.subTaskIds) &&
        new Set(t.subTaskIds).size === t.subTaskIds.length &&
        typeof t.isDone === "boolean",
      "SP 子任务或完成标记无效",
    );
    const parent = t.parentId ? taskMap.get(t.parentId) : null;
    check(
      !t.parentId ||
        (parent && !parent.parentId && parent.subTaskIds.includes(t.id)),
      "SP 父子引用不一致",
    );
    for (const childId of t.subTaskIds) {
      const child = taskMap.get(childId);
      check(
        child && child.parentId === t.id && !t.parentId,
        "SP 子任务引用断裂或超过两级",
      );
    }
    const projectId = t.projectId ?? parent?.projectId;
    check(projectMap.has(projectId), "SP 任务没有合法项目");
    check(
      !parent || projectId === (parent.projectId ?? projectId),
      "SP 子任务项目与父任务不一致",
    );
    const project = projectMap.get(projectId),
      order = parent
        ? parent.subTaskIds.indexOf(t.id)
        : [...project.taskIds, ...project.backlogTaskIds].indexOf(t.id);
    check(
      Number.isFinite(t.created) &&
        !Number.isNaN(new Date(t.created).getTime()),
      "SP 创建时间无效",
    );
    const item = {
      id: t.id,
      projectId,
      parentId: parent?.id ?? null,
      title: title(t.title),
      description: "",
      notes: t.notes ?? "",
      status: t.isDone ? "done" : "todo",
      priority: "normal",
      important: false,
      urgent: false,
      dueDate: t.dueDay ?? null,
      listOrder: order < 0 ? index + tasks.length : order,
      boardOrder: order < 0 ? index + tasks.length : order,
      matrixOrder: order < 0 ? index + tasks.length : order,
      completedAt: t.isDone ? now : null,
      createdAt: new Date(t.created).toISOString(),
      updatedAt: now,
      source: { system: "super-productivity", externalId: t.id },
    };
    if (t.isDone) item.completionTimeEstimated = true;
    s.tasks.push(item);
  }
  let skippedEntities = 0;
  for (const key of ["archiveYoung", "archiveOld"])
    if (data[key]?.task) skippedEntities += table(data[key].task, key).length;
  const supportedTaskFields = new Set([
    "id",
    "title",
    "parentId",
    "projectId",
    "subTaskIds",
    "isDone",
    "notes",
    "created",
    "dueDay",
  ]);
  const supportedProjectFields = new Set([
    "id",
    "title",
    "taskIds",
    "backlogTaskIds",
    "isArchived",
  ]);
  const unsupported = [
    ...new Set(
      projects.flatMap((p) =>
        Object.keys(p)
          .filter((key) => !supportedProjectFields.has(key))
          .map((key) => "project." + key),
      ),
    ),
    ...new Set(
      tasks.flatMap((t) =>
        Object.keys(t)
          .filter((key) => !supportedTaskFields.has(key))
          .map((key) => "task." + key),
      ),
    ),
  ];
  for (const key of Object.keys(data))
    if (!["project", "task", "archiveYoung", "archiveOld"].includes(key))
      unsupported.push(key);
  s.diagnostics = {
    format: "super-productivity",
    version: 4.5,
    skippedEntities,
    unsupported,
  };
  return validateState(s);
}
const origin = (e) => `${e.source.system}:${e.source.externalId}`;
function merge(s, incoming, id) {
  const mapping = new Map(),
    existing = new Map([...s.projects, ...s.tasks].map((e) => [origin(e), e]));
  const result = {
    projects: 0,
    tasks: 0,
    subtasks: 0,
    skipped: 0,
    completed: incoming.tasks.filter((t) => t.status === "done").length,
    archived: incoming.projects.filter((p) => p.archivedAt).length,
    diagnostics: incoming.diagnostics ?? {
      format: FORMAT,
      version: 1,
      skippedEntities: 0,
      unsupported: [],
    },
  };
  for (const p of incoming.projects) {
    const prior = existing.get(origin(p));
    if (prior) {
      check(s.projects.includes(prior), "来源类型冲突");
      mapping.set(p.id, prior.id);
      result.skipped++;
      continue;
    }
    check(
      !s.projects.some(
        (x) => x.name.toLocaleLowerCase() === p.name.toLocaleLowerCase(),
      ),
      `项目名称冲突：${p.name}，请先重命名现有项目`,
    );
    const next = { ...p, id: id() };
    mapping.set(p.id, next.id);
    s.projects.push(next);
    result.projects++;
  }
  for (const t of incoming.tasks) {
    const prior = existing.get(origin(t));
    if (prior) {
      check(s.tasks.includes(prior), "来源类型冲突");
      mapping.set(t.id, prior.id);
      result.skipped++;
    } else mapping.set(t.id, id());
  }
  for (const t of incoming.tasks) {
    if (existing.has(origin(t))) continue;
    s.tasks.push({
      ...t,
      id: mapping.get(t.id),
      projectId: mapping.get(t.projectId),
      parentId: t.parentId === null ? null : mapping.get(t.parentId),
    });
    if (t.parentId === null) result.tasks++;
    else result.subtasks++;
  }
  validateState(s);
  return result;
}
export function previewImport(s, input) {
  return merge(structuredClone(s), parseImport(input), randomUUID);
}
/** Apply one validated command. Caller supplies a durable revision and retry identity. */
export function reduce(
  current,
  command,
  now = new Date().toISOString(),
  id = randomUUID,
) {
  check(
    command &&
      typeof command.requestId === "string" &&
      command.requestId.length > 0 &&
      command.requestId.length <= 128,
    "操作 ID 无效",
  );
  if (current.receipts.includes(command.requestId))
    return { state: current, duplicate: true };
  if (command.revision !== current.revision)
    fail("数据已变化，请重新打开详情或刷新任务后重试", "CONFLICT");
  const s = structuredClone(current),
    a = command.args ?? {};
  const project = () => {
    const p = s.projects.find((p) => p.id === a.id);
    check(p, "项目不存在");
    return p;
  };
  const task = () => {
    const t = s.tasks.find((t) => t.id === a.id);
    check(t, "任务不存在");
    return t;
  };
  const touch = (t) => {
    t.updatedAt = now;
  };
  let result;
  switch (command.op) {
    case "project.create": {
      const key = id();
      s.projects.push({
        id: key,
        name: title(a.name),
        description: "",
        order: s.projects.length,
        archivedAt: null,
        createdAt: now,
        updatedAt: now,
        source: { system: "dsh", externalId: key },
      });
      result = key;
      break;
    }
    case "project.update": {
      const p = project();
      if (a.name !== undefined) p.name = title(a.name);
      if (a.description !== undefined) p.description = a.description;
      if (a.archived !== undefined) {
        check(typeof a.archived === "boolean", "归档标记无效");
        p.archivedAt = a.archived ? now : null;
      }
      touch(p);
      break;
    }
    case "project.delete": {
      const p = project();
      check(a.confirm === true, "请确认删除项目及所有任务");
      s.projects = s.projects.filter((x) => x.id !== p.id);
      s.tasks = s.tasks.filter((t) => t.projectId !== p.id);
      break;
    }
    case "task.create": {
      const p = s.projects.find((p) => p.id === a.projectId);
      check(p && !p.archivedAt, "请选择活动项目");
      const parent =
        a.parentId == null ? null : s.tasks.find((t) => t.id === a.parentId);
      check(
        a.parentId == null ||
          (parent && parent.parentId === null && parent.projectId === p.id),
        "仅支持同项目的两级子任务",
      );
      const key = id(),
        order = s.tasks.length;
      s.tasks.push({
        id: key,
        projectId: p.id,
        parentId: parent?.id ?? null,
        title: title(a.title),
        description: "",
        notes: "",
        status: "todo",
        priority: "normal",
        important: false,
        urgent: false,
        dueDate: null,
        listOrder: order,
        boardOrder: order,
        matrixOrder: order,
        completedAt: null,
        createdAt: now,
        updatedAt: now,
        source: { system: "dsh", externalId: key },
      });
      result = key;
      break;
    }
    case "task.update": {
      const t = task();
      if (a.status !== undefined && a.status !== t.status)
        delete t.completionTimeEstimated;
      const keys = [
        "title",
        "description",
        "notes",
        "status",
        "priority",
        "dueDate",
      ];
      for (const k of keys)
        if (a[k] !== undefined) t[k] = k === "title" ? title(a[k]) : a[k];
      if (a.projectId !== undefined && a.projectId !== t.projectId) {
        check(t.parentId === null, "请移动父任务，子任务不能单独跨项目移动");
        check(
          s.projects.some((p) => p.id === a.projectId && !p.archivedAt),
          "目标项目不可用",
        );
        for (const child of s.tasks.filter((c) => c.parentId === t.id)) {
          child.projectId = a.projectId;
          touch(child);
        }
        t.projectId = a.projectId;
      }
      for (const k of ["important", "urgent"])
        if (a[k] !== undefined) {
          check(t.parentId === null, "子任务象限继承父任务");
          t[k] = a[k];
        }
      t.completedAt = t.status === "done" ? (t.completedAt ?? now) : null;
      touch(t);
      break;
    }
    case "task.drop": {
      check(["list", "board", "matrix"].includes(a.view), "拖动视图无效");
      const t = task();
      check(t.parentId === null, "只能拖动顶层卡片");
      const key = {
        list: "listOrder",
        board: "boardOrder",
        matrix: "matrixOrder",
      }[a.view];
      check(key, "拖动视图无效");
      if (a.view === "board") {
        check(states.includes(a.status), "目标状态无效");
        if (t.status !== a.status) delete t.completionTimeEstimated;
        t.status = a.status;
        t.completedAt = t.status === "done" ? (t.completedAt ?? now) : null;
      }
      if (a.view === "matrix") {
        check(
          typeof a.important === "boolean" && typeof a.urgent === "boolean",
          "目标象限无效",
        );
        t.important = a.important;
        t.urgent = a.urgent;
      }
      const group = s.tasks
        .filter(
          (x) =>
            x.id !== t.id &&
            x.parentId === null &&
            x.projectId === t.projectId &&
            (a.view !== "board" || x.status === t.status) &&
            (a.view !== "matrix" ||
              (x.important === t.important && x.urgent === t.urgent)),
        )
        .sort((x, y) => x[key] - y[key]);
      let at = group.length;
      if (a.beforeId) {
        at = group.findIndex((x) => x.id === a.beforeId);
        check(at >= 0, "只能在同项目同分组内排序");
      }
      group.splice(at, 0, t);
      group.forEach((x, n) => {
        x[key] = n;
        touch(x);
      });
      break;
    }
    case "task.delete": {
      const t = task(),
        children = s.tasks.filter((x) => x.parentId === t.id);
      check(
        children.length === 0 || a.confirm === true,
        "请确认同时删除子任务",
      );
      s.tasks = s.tasks.filter((x) => x.id !== t.id && x.parentId !== t.id);
      break;
    }
    case "reorder": {
      check(
        ["project", "list", "board", "matrix"].includes(a.view),
        "排序视图无效",
      );
      const key =
        a.view === "project"
          ? "order"
          : { list: "listOrder", board: "boardOrder", matrix: "matrixOrder" }[
              a.view
            ];
      check(key, "排序视图无效");
      const table = a.view === "project" ? s.projects : s.tasks;
      check(
        Array.isArray(a.ids) && new Set(a.ids).size === a.ids.length,
        "排序 ID 重复",
      );
      if (a.view !== "project" && a.ids.length) {
        const first = table.find((t) => t.id === a.ids[0]);
        check(first, "排序任务不存在");
        check(
          a.ids.every((i) => {
            const t = table.find((x) => x.id === i);
            return (
              t &&
              t.projectId === first.projectId &&
              t.parentId === first.parentId &&
              (a.view !== "board" || t.status === first.status) &&
              (a.view !== "matrix" ||
                (t.important === first.important && t.urgent === first.urgent))
            );
          }),
          "只能在同项目同分组内排序",
        );
      }
      a.ids.forEach((i, n) => {
        const e = table.find((x) => x.id === i);
        check(e, "排序实体不存在");
        e[key] = n;
        touch(e);
      });
      break;
    }
    case "import":
      result = merge(s, parseImport(a.input), id);
      break;
    default:
      fail("未知操作");
  }
  s.revision++;
  s.receipts = [...s.receipts, command.requestId].slice(-1000);
  validateState(s);
  return { state: s, result };
}
/** Serialize writes; commit memory only after persistence succeeds. */
export class TaskService {
  constructor(load, save) {
    this.load = load;
    this.save = save;
    this.queue = Promise.resolve();
  }
  snapshot() {
    return structuredClone(validateState(this.load()));
  }
  mutate(command) {
    const run = this.queue.then(async () => {
      const current = this.snapshot();
      const next = reduce(current, command);
      if (!next.duplicate) await this.save(next.state);
      return {
        state: this.snapshot(),
        result: next.result,
        duplicate: !!next.duplicate,
      };
    });
    this.queue = run.catch(() => {});
    return run;
  }
}
