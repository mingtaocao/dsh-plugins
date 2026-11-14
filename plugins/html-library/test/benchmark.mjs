/**
 * 手工基准：1000 篇静态 HTML 的首次索引与查询延迟。
 *
 * 运行：node test/benchmark.mjs [文档数]
 * 生成的是临时语料，跑完即删；结果只用于记录量级，不作为硬性回归阈值。
 */

import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createLibrary } from '../lib/library.js';

const COUNT = Number(process.argv[2] ?? '1000');
const DIRS = 20;

const TOPICS = ['缓存一致性', '分布式锁', '可观测性', '索引结构', '并发模型', '模块边界'];
const FILLER = '本段用于填充正文，讨论设计取舍、失败恢复与性能边界，并给出可验证的结论。';

function page(index) {
  const topic = TOPICS[index % TOPICS.length];
  const dir = `topic-${index % DIRS}`;
  const title = `${topic}笔记 ${index}`;
  return {
    rel: `${dir}/note-${index}.html`,
    html: `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:system-ui;max-width:44rem;margin:2rem auto;line-height:1.7}</style></head>
<body><h1>${title}</h1><h2>${topic}的边界</h2>
${Array.from({ length: 8 }, (_, i) => `<p>${FILLER}第 ${i + 1} 段，关键词 ${topic}，编号 ${index}-${i}。</p>`).join('\n')}
<h2>失败恢复</h2><p>文件写入未完成时先等稳定，再做增量；目录不可读只记录错误，不影响其它文档。</p>
</body></html>`,
  };
}

function percentile(values, p) {
  const sorted = values.slice().sort((left, right) => left - right);
  const at = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[at];
}

async function main() {
  const corpus = await fs.mkdtemp(path.join(os.tmpdir(), 'dshl-bench-corpus-'));
  const dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dshl-bench-data-'));
  const startedAt = Date.now();
  for (let index = 0; index < COUNT; index += 1) {
    const { rel, html } = page(index);
    const file = path.join(corpus, rel);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, html, 'utf8');
  }
  console.log(`generated ${COUNT} files in ${Date.now() - startedAt}ms`);

  const library = createLibrary({ dir: dataDir, config: {}, log: () => {} });
  await library.addRoot(corpus);

  const memoryBefore = process.memoryUsage().rss;
  const indexStarted = performance.now();
  await library.scan();
  const indexMs = performance.now() - indexStarted;
  const memoryAfter = process.memoryUsage().rss;
  const snapshot = await library.snapshot();
  console.log(`index: ${indexMs.toFixed(1)}ms, docs=${snapshot.counts.documents}, ` +
    `rss +${((memoryAfter - memoryBefore) / 1024 / 1024).toFixed(1)}MB`);

  const queries = [
    '缓存一致性',
    '分布式锁 失败恢复',
    '索引结构',
    '可观测性',
    '不存在的词条',
    'note-42',
    '边界 可验证',
    '文件写入未完成',
  ];
  const timings = [];
  for (let round = 0; round < 25; round += 1) {
    for (const query of queries) {
      const started = performance.now();
      const result = await library.listDocuments({ query, limit: 50 });
      timings.push(performance.now() - started);
      if (round === 0) console.log(`  "${query}" -> ${result.total} hits`);
    }
  }
  timings.sort((left, right) => left - right);
  console.log(`search over ${timings.length} runs: p50=${percentile(timings, 50).toFixed(2)}ms ` +
    `p95=${percentile(timings, 95).toFixed(2)}ms max=${timings[timings.length - 1].toFixed(2)}ms`);

  const snapStarted = performance.now();
  await library.snapshot();
  console.log(`snapshot: ${(performance.now() - snapStarted).toFixed(2)}ms`);

  await library.flush();
  await fs.rm(corpus, { recursive: true, force: true });
  await fs.rm(dataDir, { recursive: true, force: true });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
