/**
 * HTML 知识库（dsh-html-library）—— 宿主半入口。
 *
 * 本文件不 import 任何 `@deepseek-ai/*` 包：索引、检索、元数据与静态资源路由
 * 全部由插件自管。可选服务用 `ctx.inject([...], cb)` 声明，缺了它的组合里
 * 插件只是少一块能力（没有 webServer 就没有界面数据通道），而不是抛错。
 *
 * @module dsh-html-library
 */

import { createLibrary, resolveDataDir } from './lib/library.js';
import { createAuthorize, createRoutes } from './lib/routes.js';

/** profile 的 cordis.patch.yml 未给 config 时的缺省值。 */
const DEFAULT_CONFIG = {
  roots: [],
  exclude: [],
  watchIntervalMs: 5_000,
  maxDocuments: 5_000,
  maxFileBytes: 8 * 1024 * 1024,
};

/**
 * 插件入口。
 *
 * @param {object} ctx Cordis 上下文。
 * @param {object} [config] patch 行的 `config:` 对象。
 */
export function apply(ctx, config) {
  const resolved = { ...DEFAULT_CONFIG, ...(config ?? {}) };
  const log = (message) => ctx.logger?.info?.(`[dsh-html-library] ${message}`);

  const library = createLibrary({ dir: resolveDataDir(), config: resolved, log });

  ctx.inject(['webServer'], (webCtx) => {
    webCtx.effect(() => {
      const routes = createRoutes(library, {
        authorize: createAuthorize(() => webCtx.get('connection')),
        log,
      });
      const disposers = routes.map((route) => webCtx.webServer.register(route));
      log(`已注册 ${disposers.length} 条 Web 路由`);
      return () => {
        for (const dispose of disposers) dispose();
      };
    }, 'dsh-html-library: web routes');
  });

  // Watcher：定时补偿扫描（5000ms 默认）。没有目录时不做任何事。
  ctx.effect(() => library.startWatching(resolved.watchIntervalMs), 'dsh-html-library: watcher');

  // 启动后稍等一下再全量扫描，避免和 DSH 自身的启动争磁盘。
  ctx.effect(() => {
    const timer = setTimeout(() => {
      library.scan().catch((error) => log(`启动扫描失败：${String(error?.message ?? error)}`));
    }, 400);
    timer.unref?.();
    return () => clearTimeout(timer);
  }, 'dsh-html-library: startup scan');

  log(`宿主半已激活（数据文件 ${library.stateFile}）`);
}
