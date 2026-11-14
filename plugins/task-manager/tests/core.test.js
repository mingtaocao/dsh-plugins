import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  emptyState,
  reduce,
  validateState,
  migrateLegacyState,
  parseImport,
  previewImport,
  exportData,
  TaskService,
} from "../src/core.js";
const now = "2026-11-14T12:00:00.000Z";
function setup() {
  let s = emptyState(),
    n = 0;
  const op = (name, args = {}, extra = {}) => {
    const r = reduce(
      s,
      {
        requestId: `request-${++n}`,
        revision: s.revision,
        op: name,
        args,
        ...extra,
      },
      now,
      () => `id-${++n}`,
    );
    s = r.state;
    return r.result;
  };
  const p = op("project.create", { name: "DSH" }),
    p2 = op("project.create", { name: "LocalPM" }),
    t = op("task.create", { projectId: p, title: "Task" });
  return {
    op,
    p,
    p2,
    t,
    get s() {
      return s;
    },
  };
}
test("V-002/003 project creation trims titles and preserves IDs on rename; rejects case-insensitive duplicates", () => {
  const x = setup();
  x.op("project.update", { id: x.p, name: "Renamed" });
  assert.equal(x.s.tasks[0].projectId, x.p);
  assert.throws(() => x.op("project.create", { name: " renamed " }), /重复/);
  assert.equal(x.s.projects.length, 2);
});
test("V-006 task starts todo in Q4 with stable independent order fields", () => {
  const x = setup(),
    t = x.s.tasks[0];
  assert.deepEqual(
    [t.status, t.important, t.urgent, t.priority, t.parentId, t.completedAt],
    ["todo", false, false, "normal", null, null],
  );
});
test("V-007 blank/long titles, impossible dates and nonboolean quadrant updates fail atomically", () => {
  const x = setup(),
    before = structuredClone(x.s);
  for (const a of [
    { title: " " },
    { title: "x".repeat(201) },
    { dueDate: "2026-02-30" },
    { important: "true" },
    { status: "unknown" },
  ])
    assert.throws(() => x.op("task.update", { id: x.t, ...a }));
  assert.deepEqual(x.s, before);
  x.op("task.update", {
    id: x.t,
    dueDate: "2028-02-29",
    description: "<script>example</script>",
  });
  assert.equal(x.s.tasks[0].description, "<script>example</script>");
});
test("V-008/015/016 status and quadrant mutations are orthogonal; reopen clears completedAt", () => {
  const x = setup();
  x.op("task.update", { id: x.t, important: true, urgent: true });
  for (const status of ["doing", "done", "todo"]) {
    x.op("task.update", { id: x.t, status });
    const t = x.s.tasks[0];
    assert.equal(t.important, true);
    assert.equal(t.urgent, true);
    assert.equal(t.completedAt, status === "done" ? now : null);
  }
});
test("removed blocked state is rejected by task edits and board drops without changing data", () => {
  const x = setup(), before = structuredClone(x.s);
  assert.throws(() => x.op("task.update", { id: x.t, status: "blocked" }));
  assert.throws(() => x.op("task.drop", { id: x.t, view: "board", status: "blocked" }));
  assert.deepEqual(x.s, before);
});
test("legacy blocked parents and children migrate to todo without losing data; migration is idempotent", () => {
  const x = setup();
  x.op("task.create", { projectId: x.p, parentId: x.t, title: "Child" });
  x.op("task.update", { id: x.t, notes: "Keep notes", important: true, urgent: true });
  const done = x.op("task.create", { projectId: x.p2, title: "Done" });
  x.op("task.update", { id: done, status: "done" });
  x.op("project.update", { id: x.p, archived: true });
  const legacy = structuredClone(x.s);
  for (const t of legacy.tasks) if (t.id !== done) t.status = "blocked";
  const original = structuredClone(legacy), expected = structuredClone(legacy);
  for (const t of expected.tasks) if (t.status === "blocked") t.status = "todo";
  expected.revision++;
  assert.throws(() => validateState(legacy));
  const migrated = migrateLegacyState(legacy);
  assert.deepEqual(migrated, expected);
  assert.deepEqual(legacy, original);
  assert.equal(migrateLegacyState(migrated), migrated);
});
test("old native backups map blocked to todo on preview/import and export only supported statuses", () => {
  const x = setup();
  x.op("task.create", { projectId: x.p, parentId: x.t, title: "Child" });
  const backup = exportData(x.s);
  for (const t of backup.tasks) t.status = "blocked";
  const input = JSON.stringify(backup);
  assert(parseImport(input).tasks.every((t) => t.status === "todo"));
  assert.equal(previewImport(emptyState(), input).tasks, 1);
  const { state } = reduce(emptyState(), {
    requestId: "legacy-import", revision: 0, op: "import", args: { input },
  });
  assert.equal(state.tasks.length, 2);
  assert(exportData(state).tasks.every((t) => t.status === "todo"));
  assert.equal(previewImport(state, input).skipped, 4);
});
test("legacy state migration still rejects unrelated corrupt data and unknown statuses", () => {
  const x = setup(), legacy = structuredClone(x.s);
  legacy.tasks[0].status = "blocked";
  legacy.tasks[0].projectId = "missing";
  assert.throws(() => migrateLegacyState(legacy), /项目不存在/);
  legacy.tasks[0].projectId = x.p;
  legacy.tasks[0].status = "unknown";
  assert.throws(() => migrateLegacyState(legacy), /状态/);
});
test("V-010 two levels only, parent must exist in same project", () => {
  const x = setup(),
    child = x.op("task.create", {
      projectId: x.p,
      parentId: x.t,
      title: "Child",
    });
  assert.throws(() =>
    x.op("task.create", { projectId: x.p, parentId: child, title: "Third" }),
  );
  assert.throws(() =>
    x.op("task.create", {
      projectId: x.p2,
      parentId: x.t,
      title: "Wrong project",
    }),
  );
  assert.throws(() =>
    x.op("task.create", {
      projectId: x.p,
      parentId: "missing",
      title: "Orphan",
    }),
  );
});
test("V-011 parent and child completion remain independent", () => {
  const x = setup(),
    c = x.op("task.create", { projectId: x.p, parentId: x.t, title: "Child" });
  x.op("task.update", { id: c, status: "done" });
  assert.equal(x.s.tasks[0].status, "todo");
  x.op("task.update", { id: x.t, status: "done" });
  x.op("task.update", { id: x.t, status: "todo" });
  assert.equal(x.s.tasks.find((t) => t.id === c).status, "done");
});
test("V-012 move parent migrates children in one operation; single child cannot cross projects", () => {
  const x = setup(),
    c = x.op("task.create", { projectId: x.p, parentId: x.t, title: "Child" });
  assert.throws(() => x.op("task.update", { id: c, projectId: x.p2 }));
  x.op("task.update", { id: x.t, projectId: x.p2 });
  assert(x.s.tasks.every((t) => t.projectId === x.p2));
});
test("V-004/005 archive keeps data; cascade delete requires confirmation and isolates other projects", () => {
  const x = setup();
  x.op("task.create", { projectId: x.p, parentId: x.t, title: "Child" });
  x.op("project.update", { id: x.p, archived: true });
  assert.equal(x.s.tasks.length, 2);
  assert.throws(() =>
    x.op("task.create", { projectId: x.p, title: "Disallowed" }),
  );
  x.op("project.update", { id: x.p, archived: false });
  assert.throws(() => x.op("project.delete", { id: x.p }));
  x.op("project.delete", { id: x.p, confirm: true });
  assert.equal(x.s.tasks.length, 0);
  assert.equal(x.s.projects[0].id, x.p2);
});
test("V-009/015/016 atomic drop changes only chosen dimension and keeps view orders separate", () => {
  const x = setup(),
    b = x.op("task.create", { projectId: x.p, title: "Second" }),
    c = x.op("task.create", { projectId: x.p, title: "Third" });
  x.op("reorder", { view: "list", ids: [c, b, x.t] });
  const before = x.s.tasks.map((t) => t.listOrder);
  x.op("task.drop", { id: x.t, view: "board", status: "doing" });
  x.op("task.drop", { id: x.t, view: "matrix", important: true, urgent: true });
  assert.deepEqual(
    x.s.tasks.map((t) => t.listOrder),
    before,
  );
  assert.equal(x.s.tasks[0].status, "doing");
  x.op("task.drop", {
    id: c,
    view: "matrix",
    important: true,
    urgent: true,
    beforeId: x.t,
  });
  assert.equal(x.s.tasks.find((t) => t.id === c).matrixOrder, 0);
  assert.equal(x.s.tasks[0].matrixOrder, 1);
});
test("V-009 rejects ordering across different parent/project/status groups", () => {
  const x = setup(),
    c = x.op("task.create", { projectId: x.p, parentId: x.t, title: "Child" });
  assert.throws(() => x.op("reorder", { view: "board", ids: [x.t, c] }));
  assert.throws(() => x.op("reorder", { view: "list", ids: [x.t, x.t] }));
});
test("V-020 native export/import preserves all user data and relations under remapped IDs", () => {
  const x = setup();
  x.op("task.create", { projectId: x.p, parentId: x.t, title: "Child" });
  x.op("project.update", { id: x.p2, archived: true });
  const backup = JSON.stringify(exportData(x.s));
  const a = reduce(
    emptyState(),
    {
      requestId: "import-1",
      revision: 0,
      op: "import",
      args: { input: backup },
    },
    now,
  );
  const imported = a.state;
  assert.notEqual(imported.tasks[0].id, x.t);
  const normalize = (s) => ({
    projects: s.projects.map((p) => ({ ...p, id: p.source.externalId })),
    tasks: s.tasks.map((t) => ({
      ...t,
      id: t.source.externalId,
      projectId: s.projects.find((p) => p.id === t.projectId).source.externalId,
      parentId:
        t.parentId === null
          ? null
          : s.tasks.find((p) => p.id === t.parentId).source.externalId,
    })),
  });
  assert.deepEqual(normalize(imported), normalize(x.s));
});
test("V-021 repeat and overlapping imports do not duplicate existing source IDs", () => {
  const x = setup(),
    input = JSON.stringify(exportData(x.s)),
    preview = previewImport(x.s, input);
  assert.deepEqual(
    [preview.projects, preview.tasks, preview.subtasks, preview.skipped],
    [0, 0, 0, 3],
  );
  x.op("import", { input });
  assert.equal(x.s.tasks.length, 1);
});
test("V-023 unverified SP formats and unknown native versions are explicitly rejected", () => {
  assert.throws(() => parseImport('{"data":{"task":{}}}'), /未支持/);
  const x = setup(),
    data = exportData(x.s);
  data.schemaVersion = 99;
  assert.throws(() => parseImport(JSON.stringify(data)), /版本/);
});
test("V-024 invalid JSON, orphan, duplicates, polluted objects rejected; no partial writes", () => {
  const x = setup(),
    original = JSON.stringify(x.s);
  assert.throws(() => x.op("import", { input: "{" }));
  assert.throws(() => parseImport('{"__proto__":{}}'), /不安全/);
  const data = exportData(x.s);
  data.tasks[0] = { ...data.tasks[0], parentId: "missing" };
  assert.throws(() => x.op("import", { input: JSON.stringify(data) }));
  assert.equal(JSON.stringify(x.s), original);
  const duplicate = exportData(x.s);
  duplicate.tasks = [...duplicate.tasks, duplicate.tasks[0]];
  assert.throws(() => parseImport(JSON.stringify(duplicate)), /重复/);
});
test("V-029 duplicate request retry is idempotent even with an old revision", () => {
  const x = setup(),
    command = {
      requestId: "retry",
      revision: x.s.revision,
      op: "task.create",
      args: { projectId: x.p, title: "Once" },
    };
  const one = reduce(x.s, command, now),
    two = reduce(one.state, command, now);
  assert.equal(two.duplicate, true);
  assert.equal(two.state.tasks.length, 2);
});
test("V-029 concurrent writes conflict rather than silently overwriting", async () => {
  const x = setup();
  let persisted = x.s;
  const svc = new TaskService(
    () => persisted,
    async (s) => {
      persisted = s;
    },
  );
  const revision = persisted.revision;
  const results = await Promise.allSettled(
    ["a", "b"].map((requestId) =>
      svc.mutate({
        requestId,
        revision,
        op: "task.update",
        args: { id: x.t, title: requestId },
      }),
    ),
  );
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(
    results.find((r) => r.status === "rejected").reason.code,
    "CONFLICT",
  );
});
test("V-024/029 persistence failure leaves memory intact and later retries work", async () => {
  const x = setup();
  let persisted = x.s,
    fail = true;
  const svc = new TaskService(
    () => persisted,
    async (s) => {
      if (fail) throw Error("disk full");
      persisted = s;
    },
  );
  const command = {
    requestId: "a",
    revision: persisted.revision,
    op: "task.update",
    args: { id: x.t, title: "Edited" },
  };
  await assert.rejects(svc.mutate(command), /disk full/);
  assert.deepEqual(svc.snapshot(), x.s);
  fail = false;
  await svc.mutate(command);
  assert.equal(svc.snapshot().tasks[0].title, "Edited");
});
test("V-030 unrelated fields and credentials are never admitted to imports/exports", () => {
  const x = setup(),
    data = exportData(x.s);
  data.token = "secret";
  data.tasks[0] = { ...data.tasks[0], sessionId: "private", token: "secret" };
  const imported = parseImport(JSON.stringify(data));
  const output = JSON.stringify(exportData(imported));
  assert(!output.includes("secret"));
  assert(!output.includes("sessionId"));
});
test("V-026 core accepts 20 projects, 2000 tasks, 5000 children without relation errors", () => {
  const s = emptyState();
  for (let p = 0; p < 20; p++)
    s.projects.push({
      id: `p${p}`,
      name: `P${p}`,
      description: "",
      order: p,
      archivedAt: null,
      createdAt: now,
      updatedAt: now,
      source: { system: "dsh", externalId: `p${p}` },
    });
  const base = {
    title: "T",
    description: "",
    notes: "",
    status: "todo",
    priority: "normal",
    important: false,
    urgent: false,
    dueDate: null,
    listOrder: 0,
    boardOrder: 0,
    matrixOrder: 0,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  for (let i = 0; i < 2000; i++)
    s.tasks.push({
      ...base,
      id: `t${i}`,
      projectId: `p${i % 20}`,
      parentId: null,
      source: { system: "dsh", externalId: `t${i}` },
    });
  for (let i = 0; i < 5000; i++)
    s.tasks.push({
      ...base,
      id: `s${i}`,
      projectId: `p${(i % 2000) % 20}`,
      parentId: `t${i % 2000}`,
      source: { system: "dsh", externalId: `s${i}` },
    });
  const start = performance.now();
  validateState(s);
  reduce(
    s,
    {
      requestId: "perf",
      revision: 0,
      op: "task.update",
      args: { id: "t1", status: "doing" },
    },
    now,
  );
  console.log(
    `Core 7020 entities validation+mutation: ${(performance.now() - start).toFixed(1)} ms; UI performance NOT_RUN`,
  );
});

test("V-022 official SP 4.5 fixture preserves ordered subtasks and idempotent imports", () => {
  const bytes = readFileSync(
    new URL("./fixtures/sp-official-4.5.json", import.meta.url),
  );
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    "992aca4e81c887f2cd1524b84c05a8edfcb1129f3239c1825e0d3b31d5806c43",
  );
  const input = bytes.toString(),
    converted = parseImport(input);
  assert.equal(converted.projects.length, 1);
  assert.equal(converted.tasks.length, 3);
  assert.equal(converted.tasks.filter((t) => t.parentId !== null).length, 1);
  assert.equal(
    converted.tasks.find((t) => t.parentId !== null).parentId,
    "active-task-1",
  );
  assert(
    converted.tasks.every(
      (t) => t.status === "todo" && !t.important && !t.urgent,
    ),
  );
  assert.equal(
    converted.tasks.find((t) => t.id === "active-task-2").dueDate,
    "2024-12-01",
  );
  assert(converted.diagnostics.unsupported.includes("task.timeSpent"));
  const first = reduce(emptyState(), {
    revision: 0,
    requestId: "sp1",
    op: "import",
    args: { input },
  }).state;
  const second = reduce(first, {
    revision: first.revision,
    requestId: "sp2",
    op: "import",
    args: { input },
  });
  assert.equal(second.result.skipped, 4);
  assert.equal(second.result.tasks, 0);
});
test("V-022/024 SP contradictory links, invalid booleans and unknown versions are refused", () => {
  const load = () =>
    JSON.parse(
      readFileSync(
        new URL("./fixtures/sp-official-4.5.json", import.meta.url),
        "utf8",
      ),
    );
  for (const mutate of [
    (d) => (d.crossModelVersion = 99),
    (d) => (d.data.task.entities["active-task-1"].subTaskIds = []),
    (d) => (d.data.task.entities["active-task-1"].isDone = "false"),
  ]) {
    const d = load();
    mutate(d);
    assert.throws(() => parseImport(JSON.stringify(d)));
  }
});

test("V-030 inherited object property names cannot select a sorting field", () => {
  const x = setup(),
    before = structuredClone(x.s);
  for (const view of ["constructor", "__proto__", "toString", "valueOf"]) {
    assert.throws(() => x.op("reorder", { view, ids: [x.t] }));
    assert.throws(() => x.op("task.drop", { view, id: x.t }));
  }
  assert.deepEqual(x.s, before);
});
