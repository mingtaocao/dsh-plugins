/** Atomic Host state exposed through DSH's authenticated owner-only Fetch registry. */
import { z } from "zod";
import {
  emptyState,
  validateState,
  TaskService,
  exportData,
  previewImport,
} from "./src/core.js";
export const inject = ["storageDomain", "connection"];
export async function apply(ctx) {
  const schema = z.custom((value) => {
    try {
      validateState(value);
      return true;
    } catch {
      return false;
    }
  }, "Invalid task manager snapshot");
  const domain = await ctx.storageDomain.open({
    name: "mingtaocao_task_manager",
    version: 1,
    tables: {},
    global: { schema, initial: emptyState() },
  });
  ctx.effect(() => () => domain.close());
  const service = new TaskService(
    () => domain.global.get(),
    (value) => domain.global.set(value),
  );
  ctx.effect(() =>
    ctx.connection.fetch.register({
      path: "/api/mt-tasks",
      methods: ["POST"],
      requestBody: "buffered",
      fetch: async (request) => {
        try {
          const { endpoint, payload } = await request.json();
          let value;
          if (endpoint === "snapshot") value = service.snapshot();
          else if (endpoint === "mutate") value = await service.mutate(payload);
          else if (endpoint === "export")
            value = exportData(service.snapshot());
          else if (endpoint === "preview")
            value = previewImport(service.snapshot(), payload?.input);
          else throw Object.assign(Error("未知接口"), { code: "NOT_FOUND" });
          return Response.json({ ok: true, value });
        } catch (error) {
          return Response.json({
            ok: false,
            error: {
              code: error.code ?? "STORAGE_ERROR",
              message: error.code
                ? error.message
                : "本地数据读取或保存失败，请检查文件格式、空间与权限后重试",
            },
          });
        }
      },
    }),
  );
}
