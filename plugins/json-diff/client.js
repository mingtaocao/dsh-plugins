function textLines(source) {
  if (source.length > 500000) throw new RangeError('size');
  const lines = source ? source.replace(/\r\n?/g, '\n').split('\n') : [];
  if (lines.length > 5000) throw new RangeError('size');
  return lines;
}

// Align matching lines first, then pair replacements inside each unmatched block.
function compareRows(a, b) {
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
    const zh = { title: '文件对比', left: '原文', right: '新版', pasteLeft: '粘贴原文', pasteRight: '粘贴新版', unit: ' 行', resize: '调整左右栏宽度', equal: '两份内容一致', add: '新增', remove: '删除', change: '修改', limit: '内容过长，请分段对比。', result: '逐行差异', only: '只看差异' };
    const en = { title: 'File comparison', left: 'Original', right: 'Revised', pasteLeft: 'Paste original text', pasteRight: 'Paste revised text', unit: '', resize: 'Resize columns', equal: 'Both inputs match', add: 'Added', remove: 'Removed', change: 'Changed', limit: 'Input too large. Compare smaller sections.', result: 'Line differences', only: 'Changes only' };
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
    function lineContent(line, other) {
      if (other === undefined) return line;
      const chars = Array.from(line);
      const peer = Array.from(other);
      let start = 0;
      let end = chars.length;
      let peerEnd = peer.length;
      while (start < end && start < peerEnd && chars[start] === peer[start]) start++;
      while (end > start && peerEnd > start && chars[end - 1] === peer[peerEnd - 1]) {
        end--;
        peerEnd--;
      }
      if (start === end) return line;
      return h(React.Fragment, null, chars.slice(0, start).join(''),
        h('mark', null, chars.slice(start, end).join('')), chars.slice(end).join(''));
    }
    function Panel({ t }) {
      const [inputs, setInputs] = React.useState(['', '']);
      const [result, setResult] = React.useState(null);
      const [only, setOnly] = React.useState(false);
      const [error, setError] = React.useState('');
      React.useEffect(() => {
        setError('');
        if (!inputs.some(Boolean)) {
          setResult(null);
          return;
        }
        const timer = setTimeout(() => {
          try {
            const lines = inputs.map(textLines);
            setResult({ lines, rows: compareRows(...lines) });
          } catch (error) {
            if (!(error instanceof RangeError)) throw error;
            setResult(null);
            setError(t('limit'));
          }
        }, 180);
        return () => clearTimeout(timer);
      }, [inputs, t]);
      const counts = { add: 0, remove: 0, change: 0 };
      if (result) for (const row of result.rows) if (row.type !== 'same') counts[row.type]++;
      const changed = Object.values(counts).some(Boolean);
      const rows = result && (only && changed ? result.rows.filter(row => row.type !== 'same') : result.rows);
      return h(Layout, null,
        h('style', null, styles),
        h('header', null, h('h2', null, t('title'))),
        h('div', { className: 'jd-workspace' },
          h('div', { className: 'jd-inputs' }, inputs.map((value, side) =>
            h('label', { key: side }, h('span', null, t(side ? 'right' : 'left')),
              h('textarea', { value, spellCheck: false, placeholder: t(side ? 'pasteRight' : 'pasteLeft'), onChange: e => {
                setInputs(inputs.map((old, i) => side === i ? e.target.value : old));
              } }))), h(Divider, { label: t('resize') })),
        result && h('div', { className: 'jd-actions' },
          h('span', { role: 'status' }, result && (changed
            ? Object.keys(counts).filter(k => counts[k]).map(k => t(k) + ' ' + counts[k] + t('unit')).join(' · ') : t('equal'))),
          changed && h('label', null, h('input', { type: 'checkbox', checked: only, onChange: e => setOnly(e.target.checked) }), t('only'))),
        error && h('div', { role: 'alert' }, error),
        result && h('div', { className: 'jd-scroll', tabIndex: 0, role: 'region', 'aria-label': t('result') },
          h('table', null, h('colgroup', null, h('col', { style: { width: 'var(--jd-left)' } }), h('col')), h('thead', null, h('tr', null, ['left','right'].map(k => h('th', { key: k }, t(k), k === 'left' && h(Divider, { label: t('resize') }))))),
            h('tbody', null, rows.map(({ l, r, type }, i) => h('tr', { key: i },
              [l,r].map((n, side) => h('td', { key: side, className: n === null || type === 'same' ? '' : side ? 'jd-plus' : 'jd-minus' },
                n !== null && h('div', null, h('small', null, n + 1, type === 'same' ? ' ' : side ? ' +' : ' −'), h('code', null, lineContent(result.lines[side][n],
                  type === 'change' ? result.lines[1 - side][side ? l : r] : undefined))))))))))));
    }
    const styles = `
.jd-panel {
  box-sizing:border-box; height:100%; min-height:0; display:flex; flex-direction:column;
  overflow:auto; padding:clamp(12px,2vw,24px); gap:16px;
  color:var(--dsw-alias-label-primary); font:inherit;
  --jd-line:var(--dsw-alias-border-l2); --jd-paper:var(--dsw-alias-bg-layer-1);
  --jd-bar:color-mix(in srgb,currentColor 4%,var(--jd-paper));
}
.jd-panel h2 {margin:0;line-height:1.4;font-family:inherit;font-size:20px;font-weight:600}
.jd-workspace {flex:1;min-height:240px;display:flex;flex-direction:column;overflow:hidden;
  background:var(--jd-paper);border:1px solid var(--jd-line);border-radius:9px}
.jd-inputs {position:relative;flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,var(--jd-left)) minmax(0,1fr)}
.jd-workspace:has(.jd-scroll) .jd-inputs {flex:0 0 clamp(90px,25%,210px)}
.jd-inputs label {min-width:0;min-height:0;display:flex;flex-direction:column}
.jd-inputs label>span,.jd-scroll th {padding:7px 12px;background:var(--jd-bar);font-size:13px;font-weight:600}
.jd-inputs label:focus-within>span {color:var(--dsw-alias-brand-primary)}
.jd-inputs textarea {box-sizing:border-box;flex:1;min-height:0;width:100%;border:0;border-radius:0;
  padding:12px;resize:none;background:transparent;color:inherit;font:inherit;font-size:14px;line-height:1.65;tab-size:4}
.jd-inputs textarea:focus-visible {outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.jd-divider {position:absolute;inset-block:0;left:var(--jd-left);width:12px;transform:translateX(-50%);
  cursor:col-resize;touch-action:none;user-select:none;z-index:2}
.jd-divider::after {content:'';position:absolute;inset:0 auto 0 50%;width:1px;background:var(--jd-line)}
.jd-divider:hover::after,.jd-divider:focus-visible::after,.jd-divider:active::after {background:var(--dsw-alias-brand-primary);width:2px}
.jd-actions,.jd-panel [role=alert] {padding:7px 12px;border-block:1px solid var(--jd-line);font-size:13px}
.jd-actions {display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.jd-actions label {display:flex;align-items:center;gap:5px}
.jd-scroll {flex:1;min-height:0;overflow:auto}
.jd-scroll table {width:100%;border-spacing:0;table-layout:fixed}
.jd-scroll th {position:sticky;top:0;text-align:left}
.jd-scroll th:first-child {z-index:1}
.jd-scroll th .jd-divider {left:100%}
.jd-scroll td {vertical-align:top;padding:0}
.jd-scroll td+td {border-left:1px solid var(--jd-line)}
.jd-scroll td div {display:flex;gap:8px;padding:3px 8px;font-size:14px;line-height:1.55}
.jd-scroll small {flex:none;min-width:4ch;text-align:right;opacity:.65;font-variant-numeric:tabular-nums}
.jd-scroll code {font:inherit;white-space:pre-wrap;overflow-wrap:anywhere;min-width:0;tab-size:4}
.jd-scroll mark {color:inherit;border-radius:2px;background:color-mix(in srgb,#c95157 28%,transparent)}
.jd-plus mark {background:color-mix(in srgb,#43986c 32%,transparent)}
.jd-minus {background:color-mix(in srgb,#c95157 13%,transparent)}
.jd-plus {background:color-mix(in srgb,#43986c 16%,transparent)}
`;
    return { inject: ['slots','locale'], apply(ctx) {
      ctx.effect(() => ctx.locale.register('json-diff', { zh, en }), 'File comparison translations');
      const t = ctx.locale.bind('json-diff');
      ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: 'json-diff', order: 42, label: () => t('title') },
        () => h('span', { 'aria-hidden': true }, '±')));
      ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'json-diff', locale: 'json-diff' }, () => h(Panel, { t })));
    } };
  }
});
