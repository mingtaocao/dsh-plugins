/** Real DSH web startup and native client artifact check in an isolated disposable profile. */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const bin = process.env.DSH_BIN;
assert(
  bin,
  "Set DSH_BIN to an installed dsh executable before running this check.",
);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const home = await mkdtemp(resolve(tmpdir(), "dsh-task-smoke-"));
const env = { ...process.env, DSH_HOME: home };
const executable = resolve(bin);
let server;
function command(args) {
  return new Promise((accept, reject) => {
    const child = spawn(executable, args, {
      env,
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(Error("DSH command timed out"));
    }, 60000);
    child.on("error", reject);
    child.on("exit", (code) => {
      clearTimeout(timer);
      code === 0 ? accept() : reject(Error(`DSH command exited ${code}`));
    });
    // Drain output without recording launch tokens or profile contents.
    child.stdout.resume();
    child.stderr.resume();
  });
}
async function stop() {
  if (!server || server.exitCode !== null || server.signalCode !== null) return;
  await new Promise((accept) => {
    const timer = setTimeout(() => server.kill("SIGKILL"), 5000);
    server.once("exit", () => {
      clearTimeout(timer);
      accept();
    });
    server.kill("SIGTERM");
  });
}
async function boot(withPlugin) {
  const args = ["web"];
  if (!withPlugin) args.push("--patch", resolve(home, "disable-test.yml"));
  args.push("--no-open", "--port", "0");
  server = spawn(executable, args, {
    env,
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
  });
  return new Promise((accept, reject) => {
    let output = "";
    const timer = setTimeout(
      () => reject(Error("DSH web startup timed out")),
      45000,
    );
    const collect = (chunk) => {
      output += chunk;
      if (/error|failed|inactive/i.test(String(chunk)))
        console.error(String(chunk).replace(/token=\S+/g, "token=REDACTED"));
      const match = output.match(/dsh web: (http[^\s]+)/);
      if (match) {
        clearTimeout(timer);
        accept(match[1]);
      }
    };
    server.stdout.on("data", collect);
    server.stderr.on("data", collect);
    server.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    server.on("exit", () => {
      clearTimeout(timer);
      reject(
        Error(
          "DSH exited before ready: " +
            output.replace(/token=\S+/g, "token=REDACTED"),
        ),
      );
    });
  });
}
async function index(url) {
  const auth = await fetch(url, { redirect: "manual" });
  assert.equal(
    auth.status,
    303,
    "Official launch token must mint a browser cookie",
  );
  const cookie = auth.headers.get("set-cookie")?.split(";")[0];
  assert(cookie, "DSH did not return a browser cookie");
  const response = await fetch(new URL("/", url), { headers: { cookie } });
  assert.equal(response.status, 200);
  return { html: await response.text(), cookie };
}
try {
  await writeFile(
    resolve(home, "disable-test.yml"),
    "- id: mingtaocao-task-manager\n  disabled: true\n",
  );
  await command(["web", "--dump-config"]);
  await command(["plugin", "--profile", "web", "add", root]);
  for (const enabled of [true, false, true]) {
    const url = await boot(enabled);
    const { html, cookie } = await index(url);
    if (enabled) {
      const call = async (endpoint, payload = {}) => {
        const response = await fetch(new URL("/api/mt-tasks", url), {
          method: "POST",
          headers: {
            cookie,
            "Content-Type": "application/json",
            origin: new URL(url).origin,
          },
          body: JSON.stringify({
            endpoint,
            payload,
          }),
        });
        assert.equal(response.status, 200);
        const reply = await response.json();
        assert.equal(reply.ok, true, JSON.stringify(reply));
        return reply.value;
      };
      let state = await call("snapshot");
      if (state.projects.length === 0) {
        let r = await call("mutate", {
          revision: state.revision,
          requestId: "create-project",
          op: "project.create",
          args: { name: "Smoke project" },
        });
        const projectId = r.result;
        state = r.state;
        r = await call("mutate", {
          revision: state.revision,
          requestId: "create-task",
          op: "task.create",
          args: { projectId, title: "Smoke task" },
        });
        state = r.state;
        const taskId = r.result;
        assert.equal(state.tasks[0].status, "todo");
        assert.equal(state.tasks[0].important, false);
        assert.equal(state.tasks[0].urgent, false);
        const mutate = async (op, args, requestId) => {
          const value = await call("mutate", {
            revision: state.revision,
            requestId,
            op,
            args,
          });
          state = value.state;
          return value.result;
        };
        const childId = await mutate(
          "task.create",
          { projectId, parentId: taskId, title: "Smoke child" },
          "child",
        );
        await mutate(
          "task.update",
          { id: childId, status: "done" },
          "child-done",
        );
        await mutate(
          "task.drop",
          { id: taskId, view: "board", status: "doing" },
          "board",
        );
        await mutate(
          "task.drop",
          { id: taskId, view: "matrix", important: true, urgent: true },
          "matrix",
        );
        const input = JSON.stringify(await call("export"));
        const preview = await call("preview", { input });
        assert.equal(preview.skipped, 3);
        await mutate("import", { input }, "repeat-import");
      }
      assert.equal(state.projects.length, 1);
      assert.equal(state.tasks.length, 2);
      const parent = state.tasks.find((t) => t.parentId === null),
        child = state.tasks.find((t) => t.parentId !== null);
      assert.equal(parent.status, "doing");
      assert.equal(parent.important, true);
      assert.equal(parent.urgent, true);
      assert.equal(child.status, "done");
      assert.equal(child.parentId, parent.id);
      const anonymous = await fetch(new URL("/api/mt-tasks", url), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          origin: new URL(url).origin,
        },
        body: JSON.stringify({ endpoint: "snapshot" }),
      });
      assert.equal(anonymous.status, 401);
      console.log(
        "PASS: parent/subtask state, board/matrix independence, export/preview and anonymous rejection",
      );
      const data = await call("export");
      assert.equal(data.format, "dsh-task-manager");
      console.log(
        "PASS: real authenticated Host API and durable task snapshot",
      );
    }
    assert.equal(html.includes("@mingtaocao/dsh-task-manager"), enabled);
    console.log(
      `PASS: real DSH authenticated index; plugin ${enabled ? "present" : "absent"}`,
    );
    await stop();
  }
  console.log(
    "Host smoke PASS. Browser rendering and lifecycle effects still require V-001.",
  );
} finally {
  await stop();
  await rm(home, { recursive: true, force: true });
}
