// Pretty-print tokens, preserving duplicate fields and the original numeric literals.
function jsonDiffLines(source, json) {
  if (source === '') return [];
  if (!json) return source.replace(/\r\n?/g, '\n').split('\n');
  JSON.parse(source);
  const tokens = source.match(/"(?:\\.|[^"\\])*"|[^\s{}\[\],:"]+|[{}\[\],:]/g);
  const lines = [];
  let line = '';
  let depth = 0;
  function flush() {
    if (lines.length >= 5000) throw new RangeError('size');
    lines.push('  '.repeat(depth) + line);
    line = '';
  }
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === '{' || token === '[') {
      line += token;
      if (tokens[i + 1] === (token === '{' ? '}' : ']')) line += tokens[++i];
      else {
        flush();
        if (++depth > 200) throw new RangeError('depth');
      }
    } else if (token === '}' || token === ']') {
      if (line) flush();
      depth--;
      line = token;
    } else if (token === ',') {
      line += ',';
      flush();
    } else line += token === ':' ? ': ' : token;
  }
  if (line) flush();
  return lines;
}

// Align matching lines first, then pair replacements inside each unmatched block.
function jsonDiffRows(left, right, json) {
  const key = line => json ? line.replace(/,$/, '') : line;
  const a = left.map(key), b = right.map(key);
  let start = 0, endA = a.length, endB = b.length;
  while (start < endA && start < endB && a[start] === b[start]) start++;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) { endA--; endB--; }
  const width = endB - start + 1;
  const size = (endA - start + 1) * width;
  if (size > 8_000_000) throw new RangeError('size');
  const scores = new Uint16Array(size);
  const at = (i, j) => (i - start) * width + j - start;
  for (let i = endA - 1; i >= start; i--) {
    for (let j = endB - 1; j >= start; j--) {
      const k = at(i, j);
      scores[k] = a[i] === b[j] ? 1 + scores[k + width + 1] : Math.max(scores[k + width], scores[k + 1]);
    }
  }
  const rows = [];
  let i = 0, j = 0;
  function matched() { rows.push({ l: i++, r: j++, type: 'same' }); }
  while (i < start) matched();
  while (i < endA || j < endB) {
    let l = i, r = j;
    while (i < endA || j < endB) {
      if (i < endA && j < endB && a[i] === b[j]) break;
      if (j === endB || (i < endA && scores[at(i + 1, j)] >= scores[at(i, j + 1)])) i++;
      else j++;
    }
    while (l < i || r < j) {
      const type = l === i ? 'add' : r === j ? 'remove' : 'change';
      rows.push({ l: l < i ? l++ : null, r: r < j ? r++ : null, type });
    }
    if (i < endA && j < endB) matched();
  }
  while (i < a.length) matched();
  return rows;
}

window.__ModuleLoader__.load({
  id: 'dsh-json-diff',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const zh = { title: '文件对比', left: '原文', right: '新版', text: '纯文本', paste: '在此粘贴', resize: '调整左右栏宽度', equal: '两份内容一致', add: '新增', remove: '删除', change: '修改', limit: '内容过长，请分段对比。', invalid: 'JSON 格式错误', result: '逐行差异', only: '只看差异' };
    const en = { title: 'File comparison', left: 'Original', right: 'Revised', text: 'Text', paste: 'Paste here', resize: 'Resize columns', equal: 'Both inputs match', add: 'Added', remove: 'Removed', change: 'Changed', limit: 'Input too large. Compare smaller sections.', invalid: 'Invalid JSON', result: 'Line differences', only: 'Changes only' };
    const Split = React.createContext(null);
    function Layout({ children }) {
      const [width, setWidth] = React.useState(50);
      return h(Split.Provider, { value: { width, setWidth } },
        h('section', { className: 'jd-panel', style: { '--jd-left': width + '%' } }, children));
    }
    function Divider({ label }) {
      const { width, setWidth } = React.useContext(Split);
      const resize = n => setWidth(Math.max(20, Math.min(80, Math.round(n))));
      return h('div', { className: 'jd-divider', role: 'separator', tabIndex: 0,
        'aria-label': label, 'aria-orientation': 'vertical', 'aria-valuemin': 20, 'aria-valuemax': 80, 'aria-valuenow': width,
        onPointerDown: e => { if (e.button === 0) e.currentTarget.setPointerCapture(e.pointerId); },
        onPointerMove: e => {
          if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
          const bounds = e.currentTarget.closest('.jd-inputs, table').getBoundingClientRect();
          if (bounds.width) resize(100 * (e.clientX - bounds.left) / bounds.width);
        },
        onDoubleClick: () => setWidth(50),
        onKeyDown: e => {
          const positions = { ArrowLeft: width - 2, ArrowRight: width + 2, Home: 20, End: 80 };
          if (Object.hasOwn(positions, e.key)) { e.preventDefault(); resize(positions[e.key]); }
        }
      });
    }
    function Panel({ t }) {
      const [inputs, setInputs] = React.useState(['', '']);
      const [mode, setMode] = React.useState('JSON');
      const [result, setResult] = React.useState(null);
      const [only, setOnly] = React.useState(false);
      const [error, setError] = React.useState('');
      React.useEffect(() => {
        setResult(null);
        setError('');
        if (mode === 'JSON' ? !inputs.every(value => value.trim()) : !inputs.some(Boolean)) return;
        const timer = setTimeout(() => {
          const json = mode === 'JSON';
          const lines = [];
          for (const [side, source] of inputs.entries()) {
            if (source.length > 500000) { setError(t('limit')); return; }
            try { lines.push(jsonDiffLines(source, json)); }
            catch (e) {
              setError(e instanceof RangeError ? t('limit') : t(side ? 'right' : 'left') + ' · ' + t('invalid') + ' · ' + e.message);
              return;
            }
          }
          try {
            if (lines.some(side => side.length > 5000)) throw new RangeError();
            setResult({ lines, rows: jsonDiffRows(...lines, json) });
          } catch (e) { if (!(e instanceof RangeError)) throw e; setError(t('limit')); }
        }, 180);
        return () => clearTimeout(timer);
      }, [inputs, mode, t]);
      const counts = { add: 0, remove: 0, change: 0 };
      if (result) for (const row of result.rows) if (row.type !== 'same') counts[row.type]++;
      const changed = Object.values(counts).some(Boolean);
      const rows = result && (only && changed ? result.rows.filter(row => row.type !== 'same') : result.rows);
      return h(Layout, null,
        h('style', null, styles),
        h('header', null, h('h2', null, t('title')),
          h('select', { 'aria-label': 'Format / 格式', value: mode, onChange: e => setMode(e.target.value) },
            h('option', null, 'JSON'), h('option', { value: 'text' }, t('text')))),
        h('div', { className: 'jd-inputs' }, inputs.map((value, side) =>
          h('label', { key: side }, t(side ? 'right' : 'left'),
            h('textarea', { value, spellCheck: false, placeholder: t('paste'), onChange: e => {
              setInputs(inputs.map((old, i) => side === i ? e.target.value : old));
            } }))), h(Divider, { label: t('resize') })),
        h('div', { className: 'jd-actions' },
          h('span', { role: 'status' }, result && (changed
            ? Object.keys(counts).map(k => t(k) + ' ' + counts[k]).join(' · ') : t('equal'))),
          changed && h('label', null, h('input', { type: 'checkbox', checked: only, onChange: e => setOnly(e.target.checked) }), t('only'))),
        error && h('div', { role: 'alert' }, error),
        result && h('div', { className: 'jd-scroll', tabIndex: 0, role: 'region', 'aria-label': t('result') },
          h('table', null, h('colgroup', null, h('col', { style: { width: 'var(--jd-left)' } }), h('col')), h('thead', null, h('tr', null, ['left','right'].map(k => h('th', { key: k }, t(k), k === 'left' && h(Divider, { label: t('resize') }))))),
            h('tbody', null, rows.map(({ l, r, type }, i) => h('tr', { key: i },
              [l,r].map((n, side) => h('td', { key: side, className: n === null || type === 'same' ? '' : side ? 'jd-plus' : 'jd-minus' },
                n !== null && h('div', null, h('small', null, n + 1, type === 'same' ? ' ' : side ? ' +' : ' −'), h('code', null, result.lines[side][n]))))))))));
    }
    const styles = `
.jd-panel{box-sizing:border-box;height:100%;min-height:0;overflow:auto;padding:clamp(12px,2vw,28px);color:var(--dsw-alias-label-primary);font-size:14px;line-height:1.5}
.jd-panel header,.jd-actions{display:flex;align-items:center;gap:14px}.jd-panel header{justify-content:space-between;margin-bottom:16px}.jd-panel h2{margin:0;font-size:20px}
.jd-inputs{position:relative;display:grid;grid-template-columns:minmax(0,var(--jd-left)) minmax(0,1fr)}.jd-inputs label{font-weight:600;padding-right:6px}.jd-inputs label+label{padding:0 0 0 6px}
.jd-divider{position:absolute;top:0;bottom:0;left:var(--jd-left);width:12px;transform:translateX(-50%);cursor:col-resize;touch-action:none;user-select:none;z-index:2}.jd-scroll th .jd-divider{left:100%}
.jd-divider::after{content:'';position:absolute;inset:0 5px;background:var(--dsw-alias-border-l2)}.jd-divider:hover::after,.jd-divider:focus-visible::after,.jd-divider:active::after{background:var(--dsw-alias-brand-primary)}
.jd-panel textarea,.jd-panel select{background:var(--dsw-alias-bg-layer-1);color:inherit;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;padding:6px}
.jd-inputs textarea{display:block;box-sizing:border-box;width:100%;height:clamp(100px,22vh,210px);margin-top:6px;padding:10px;resize:vertical;font:13px/1.55 ui-monospace,monospace}
.jd-actions{margin:12px 0;flex-wrap:wrap}.jd-actions label{margin-inline-start:auto;display:flex;align-items:center;gap:5px}
.jd-scroll{overflow:auto;max-height:65vh;border:1px solid var(--dsw-alias-border-l1);border-radius:7px}.jd-scroll table{width:100%;border-collapse:collapse;table-layout:fixed}.jd-scroll th:first-child{z-index:1}.jd-scroll th{text-align:left;position:sticky;top:0;background:var(--dsw-alias-bg-layer-1);padding:6px 10px}
.jd-scroll td{vertical-align:top;padding:0}.jd-scroll td+td{border-left:1px solid var(--dsw-alias-border-l1)}.jd-scroll td div{display:flex;gap:8px;padding:1px 8px}.jd-scroll small{min-width:4ch;text-align:right;opacity:.68;font-variant-numeric:tabular-nums}.jd-scroll code{white-space:pre-wrap;overflow-wrap:anywhere;min-width:0}.jd-minus{background:color-mix(in srgb,crimson 15%,transparent)}.jd-plus{background:color-mix(in srgb,seagreen 20%,transparent)}
`;
    return { inject: ['slots','locale'], apply(ctx) {
      ctx.effect(() => ctx.locale.register('json-diff', { zh, en }), 'JSON diff translations');
      const t = ctx.locale.bind('json-diff');
      ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: 'json-diff', order: 42, label: () => t('title') },
        () => h('span', { 'aria-hidden': true }, '±')));
      ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'json-diff', locale: 'json-diff' }, () => h(Panel, { t })));
    } };
  }
});
