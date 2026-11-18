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
    const zh = { title: '文件对比', left: '原文', right: '新版', pasteLeft: '粘贴原文', pasteRight: '粘贴新版', unit: ' 行', resize: '调整左右栏宽度', equal: '两份内容一致', add: '新增', remove: '删除', change: '修改', limit: '内容过长，请分段对比。', result: '逐行差异', line: '第', blank: '空行', prev:'上一处', next:'下一处', all:'全部差异', map:'差异位置图' };
    const en = { title: 'File comparison', left: 'Original', right: 'Revised', pasteLeft: 'Paste original text', pasteRight: 'Paste revised text', unit: '', resize: 'Resize columns', equal: 'Both inputs match', add: 'Added', remove: 'Removed', change: 'Changed', limit: 'Input too large. Compare smaller sections.', result: 'Line differences', line: 'Line ', blank: 'Blank line', prev:'Previous', next:'Next', all:'All differences', map:'Difference map' };
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
          const bounds = e.currentTarget.closest('.jd-inputs').getBoundingClientRect();
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
    function Editor({ side, value, result, current, inputRef, update, t }) {
      const mirror = React.useRef(null);
      const sync = () => {
        const input = inputRef.current;
        mirror.current.style.width = input.clientWidth + 'px';
        mirror.current.style.transform = 'translateY(' + -input.scrollTop + 'px)';
      };
      React.useLayoutEffect(() => {
        sync();
        const observer = new ResizeObserver(sync);
        observer.observe(inputRef.current);
        return () => observer.disconnect();
      }, [value, result]);
      const key = side ? 'r' : 'l';
      return h('label', null, h('span', null, t(side ? 'right' : 'left')),
        h('div', { className: 'jd-editor' },
          h('div', { className: 'jd-mirror', ref: mirror, 'aria-hidden': true },
            result && result.rows.map(row => {
              const n = row[key];
              if (n === null) return null;
              const line = result.lines[side][n];
              const peer = row.type === 'change' ? result.lines[1-side][side ? row.l : row.r] : undefined;
              return h('div', { key:n, 'data-line':n, 'data-gutter':(row.type === 'same' ? '' : '› ') + (n+1), 'data-current':row === current, className:row.type === 'same' ? '' : side ? 'jd-plus' : 'jd-minus' },
                line ? lineContent(line, peer) : '​');
            })),
          h('textarea', { ref:inputRef, value, spellCheck:false, onScroll:sync,
            'aria-label':t(side ? 'right' : 'left'), placeholder:t(side ? 'pasteRight' : 'pasteLeft'),
            onChange:e => update(e.target.value) })));
    }
    function Panel({ t }) {
      const [inputs, setInputs] = React.useState(['', '']);
      // Keep the last completed comparison visible while the next one is pending.
      const [result, setResult] = React.useState(null);
      const [selection, select] = React.useState(0);
      const left = React.useRef(null);
      const right = React.useRef(null);
      const [error, setError] = React.useState('');
      React.useEffect(() => {
        if (!inputs.some(Boolean)) {
          setError('');
          select(0);
          setResult(null);
          return;
        }
        const timer = setTimeout(() => {
          try {
            const lines = inputs.map(textLines);
            const rows = compareRows(...lines);
            const changes = rows.flatMap((row, position) => row.type === 'same' ? [] : [{row, position}]);
            select(i => Math.min(i, Math.max(0, changes.length - 1)));
            setError('');
            setResult({ lines, rows, changes });
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
      const changes = result?.changes ?? [];
      const current = changes[selection]?.row;
      function jump(index) {
        const {row} = changes[index];
        select(index);
        for (const [ref, index] of [[left, row.l], [right, row.r]]) {
          if (index === null) continue;
          const input = ref.current;
          const line = input.parentElement.querySelector('[data-line="' + index + '"]');
          if (line) input.scrollTop = line.offsetTop - input.clientHeight / 3;
        }
      }
      function snippet(row) {
        const parts = [];
        if (row.l !== null) parts.push(result.lines[0][row.l].slice(0, 100) || t('blank'));
        if (row.r !== null) parts.push(result.lines[1][row.r].slice(0, 100) || t('blank'));
        return parts.join(' → ');
      }
      return h(Layout, null, h('style', null, styles),
        h('header', null, h('h2', null, t('title')),
          current && h('nav', { className:'jd-counts', 'aria-label':t('result') },
            Object.keys(counts).filter(k => counts[k]).map(k =>
              h('span', { key:k, className:'jd-count-'+k }, t(k)+' '+counts[k]+t('unit'))),
            h('button', { disabled:selection === 0, onClick:() => jump(selection-1) }, t('prev')),
            h('small', {role:'status'}, (selection+1)+' / '+changes.length),
            h('button', { disabled:selection === changes.length-1, onClick:() => jump(selection+1) }, t('next')))),
        h('div', { className:'jd-workspace' },
          h('div', {className:'jd-body'},
            h('div', { className:'jd-inputs' }, inputs.map((value, side) =>
              h(Editor, { key:side, side, value, result, current, t, inputRef:side ? right : left,
                update:text => setInputs(inputs.map((v,i) => i === side ? text : v)) })),
              h(Divider, { label:t('resize') })),
            current && h('aside', {className:'jd-map', 'aria-label':t('map'), title:t('map')},
              changes.map(({row,position}, i) => h('button', {key:position,
                style:{top:100*(position+0.5)/result.rows.length+'%'},
                'aria-label':t(row.type)+' · '+t('line')+((row.r ?? row.l)+1)+t('unit'),
                'aria-current':i === selection, onClick:() => jump(i)})))),
          error && h('div', { role:'alert' }, error),
          current && h('section', {className:'jd-detail', 'aria-label':t('result')},
            [current.l,current.r].map((n, side) => {
              const peer = side ? current.l : current.r;
              const value = result.lines[side][n];
              return h('div', {key:side}, h('small', null, t(side ? 'right' : 'left'),
                n !== null && ' · '+t('line')+(n+1)+t('unit')),
                h('p', null, n === null ? '—' : lineContent(value || t('blank'),
                  peer === null ? undefined : result.lines[1-side][peer])));
            })),
          current && h('details', { className:'jd-list' },
            h('summary', null, t('all')+' ('+changes.length+')'),
            changes.map(({row}, i) => h('button', { key:i, type:'button', 'aria-current':i === selection, onClick:() => jump(i) },
              h('span', {className:'jd-count-'+row.type}, t(row.type)),
              h('small', null, t('line')+((row.r ?? row.l)+1)+t('unit')),
              h('span', {className:'jd-preview'}, snippet(row))))),
          result && !current && h('div', { className:'jd-equal', role:'status' }, t('equal'))));
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

.jd-inputs label {min-width:0;min-height:0;display:flex;flex-direction:column}
.jd-inputs label>span {padding:7px 12px;background:var(--jd-bar);font-size:13px;font-weight:600}
.jd-inputs label:focus-within>span {color:var(--dsw-alias-brand-primary)}
.jd-editor {position:relative;flex:1;min-height:0;overflow:hidden}
.jd-editor textarea,.jd-mirror {box-sizing:border-box;margin:0;border:0;padding:12px;width:100%;
  font:inherit;font-size:14px;line-height:1.65;letter-spacing:normal;tab-size:4;
  white-space:pre-wrap;overflow-wrap:break-word;word-break:normal;text-align:start}
.jd-editor textarea {position:absolute;inset:0;height:100%;resize:none;background:transparent;color:inherit;border-radius:0}
.jd-mirror {position:absolute;top:0;left:0;color:transparent;pointer-events:none;user-select:none}
.jd-mirror mark {color:transparent;background:color-mix(in srgb,#c95157 29%,transparent)}
.jd-plus mark {background:color-mix(in srgb,#43986c 32%,transparent)}
.jd-inputs textarea:focus-visible {outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.jd-divider {position:absolute;inset-block:0;left:var(--jd-left);width:12px;transform:translateX(-50%);
  cursor:col-resize;touch-action:none;user-select:none;z-index:2}
.jd-divider::after {content:'';position:absolute;inset:0 auto 0 50%;width:1px;background:var(--jd-line)}
.jd-divider:hover::after,.jd-divider:focus-visible::after,.jd-divider:active::after {background:var(--dsw-alias-brand-primary);width:2px}
.jd-panel header,.jd-counts {display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.jd-panel header {justify-content:space-between}
.jd-counts span,.jd-list button>span:first-child {padding:2px 8px;border-radius:5px;font-size:12px}
.jd-count-change {background:color-mix(in srgb,#be8a30 18%,transparent)}
.jd-count-add {background:color-mix(in srgb,#43986c 18%,transparent)}
.jd-count-remove {background:color-mix(in srgb,#c95157 16%,transparent)}
.jd-list,.jd-equal,.jd-panel [role=alert] {border-top:1px solid var(--jd-line)}
.jd-list {max-height:32%;overflow:auto}
.jd-list h3,.jd-equal,.jd-panel [role=alert] {margin:0;padding:7px 12px;font-size:13px}
.jd-list h3 {background:var(--jd-bar)}
.jd-list button {display:flex;width:100%;align-items:center;gap:10px;padding:6px 12px;color:inherit;
  background:transparent;border:0;text-align:start;font:inherit;cursor:pointer}
.jd-list button:hover,.jd-list button:focus-visible {background:var(--jd-bar)}
.jd-list small {white-space:nowrap}
.jd-preview {overflow:hidden;text-overflow:ellipsis;white-space:pre;font-size:13px}
.jd-minus {background:color-mix(in srgb,#c95157 13%,transparent)}
.jd-plus {background:color-mix(in srgb,#43986c 16%,transparent)}
.jd-body {flex:1;display:flex;min-height:0}
.jd-body .jd-inputs {min-width:0}
.jd-editor textarea,.jd-editor .jd-mirror {padding-left:52px}
.jd-mirror [data-line] {position:relative}
.jd-mirror [data-line]::before {content:attr(data-gutter);position:absolute;right:calc(100% + 6px);
  width:44px;text-align:right;color:var(--dsw-alias-label-primary);opacity:.65;font-size:12px;font-variant-numeric:tabular-nums}
.jd-mirror [data-current=true] {box-shadow:inset 2px 0 var(--dsw-alias-brand-primary)}
.jd-map {position:relative;width:22px;flex:none;background:var(--jd-bar);border-left:1px solid var(--jd-line);overflow:hidden}
.jd-map button {position:absolute;left:0;width:100%;height:8px;transform:translateY(-50%);background:transparent;border:0;cursor:pointer;padding:0}
.jd-map button::after {content:'';display:block;height:2px;background:#be7952}
.jd-map button[aria-current=true]::after {height:4px;background:var(--dsw-alias-brand-primary)}
.jd-counts button {font:inherit;font-size:12px;color:inherit;background:var(--jd-bar);border:1px solid var(--jd-line);border-radius:5px;padding:4px 7px;cursor:pointer}
.jd-counts button:disabled {opacity:.45;cursor:default}
.jd-detail {display:grid;grid-template-columns:minmax(0,var(--jd-left)) minmax(0,1fr);padding-right:22px;max-height:25%;overflow:auto;border-top:1px solid var(--jd-line)}
.jd-detail>div {padding:8px 12px}
.jd-detail>div+div {border-left:1px solid var(--jd-line)}
.jd-detail p {white-space:pre-wrap;overflow-wrap:anywhere;margin:4px 0}
.jd-detail mark {color:inherit;background:color-mix(in srgb,#c95157 25%,transparent)}
.jd-detail>div+div mark {background:color-mix(in srgb,#43986c 30%,transparent)}
.jd-list summary {cursor:pointer;padding:6px 12px;font-size:13px}
.jd-list button[aria-current=true] {background:var(--jd-bar)}

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
