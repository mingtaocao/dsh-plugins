/**
 * HTML 知识库（dsh-html-library）—— 客户端半（浏览器 bundle）。
 *
 * 结构：
 *  - `sidebar.panellist`：左侧栏全局图标，id 与下面 `main` 的 key 相同，
 *    shell 才能把点击接到这个面板上；
 *  - `main`：root 作用域的 keyed slot，渲染浏览 / 阅读工作区（目录树常驻）。
 *
 * 约束（官方 cordis-plugin-development skill 的 UI 规则）：
 *  - 只从平台冻结模块表 require（react），不 import 任何 Harness Client 包；
 *  - 只用 `--dsw-alias-*` 主题 token，不写字面色值；
 *  - 通过 slot 扩展，不写组件之外的 DOM；样式作为 React 元素随面板卸载移除；
 *  - 工厂体内无副作用，资源都在 `apply` 里注册并返回清理函数。
 *
 * 数据通道：宿主 HTTP 路由。客户端 fetch 用**文档相对路径**（GUI 的 `<base href="./">`），
 * 注册路由时宿主侧用带前导斜杠的绝对路径。
 */

window.__ModuleLoader__.load({
  id: 'dsh-html-library',

  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'html-library';
    const API = 'api/dsh-html-library';

    // ---------------------------------------------------------------- 文案

    const zh = {
      'ui.resize': '调整目录宽度',
      'ui.more': '更多操作',
      'ui.file': '新建 HTML 文件',
      'ui.folder': '新建文件夹',
      'ui.delete': '删除',
      'ui.trash': '移到知识目录的 .dsh-html-trash？文件夹中的所有内容也会移入。',
      'ui.filename': '名称',
      'ui.browserSent': '已请求 Chrome 打开原文件。若未打开，可将下方地址粘贴到浏览器。',
      'ui.visit': '打开外部链接',
      'error.session': 'DSH 会话已失效，请重新打开 DSH 工作区后重试。',
      'error.access': 'DSH 拒绝了目录访问，请在拥有此工作区的会话中重新打开知识库。',
      'entry.label': '知识库',
      'actions.rename': '重命名',
      'actions.filename': '文件名',
      'reader.renameHint': '只修改文件名，不改网页标题；其他页面的链接不会自动改写。',
      'reader.resourcesFailed': '{n} 个资源未载入，查看原因',
      'reader.externalHint': '请在系统浏览器中访问外部链接。',
      'mode.browse': '浏览',
      'mode.read': '阅读',
      'actions.backToList': '返回列表',
      'actions.toggleNav': '分类导航',
      'actions.details': '文档详情',
      'list.rows': '紧凑行',
      'list.cards': '卡片',
      'list.previous': '上一页',
      'list.next': '下一页',

      'page.title': '知识库',
      'search.placeholder': '搜索标题、正文、标签…',
      'search.clear': '清除搜索',
      'actions.rescan': '重新索引',
      'actions.manageRoots': '管理目录',
      'actions.addRoot': '添加目录',
      'actions.chooseRoot': '选择目录…',
      'actions.focus': '沉浸阅读',
      'actions.exitFocus': '退出沉浸阅读',
      'actions.refresh': '刷新预览',
      'actions.openExternal': '在 Chrome 中打开',
      'actions.copyPath': '复制文件路径',
      'actions.favorite': '收藏',
      'actions.unfavorite': '取消收藏',
      'actions.tags': '标签',
      'actions.remove': '移除',
      'actions.confirmRemove': '确认移除',
      'actions.cancel': '取消',
      'actions.retry': '重试',
      'actions.add': '添加',
      'nav.all': '全部文档',
      'nav.recent': '最近阅读',
      'nav.favorites': '收藏',
      'nav.missing': '文件丢失',
      'nav.folders': '目录',
      'nav.tags': '标签',
      'list.sort': '排序',
      'sort.relevance': '相关度',
      'sort.mtime': '最近修改',
      'sort.title': '名称',
      'sort.opened': '最近打开',
      'list.count': '{n} 篇',
      'list.empty': '这里还没有文档。',
      'list.emptySearch': '没有匹配「{query}」的文档。',
      'list.emptyFavorites': '还没有收藏。阅读时点星标即可收藏。',
      'list.emptyRecent': '还没有阅读记录。',
      'list.emptyFolder': '这个目录下没有 HTML 文件。',
      'list.emptyTag': '没有带「{tag}」标签的文档。',
      'roots.title': '知识目录',
      'roots.hint': '只读扫描，不会修改或移动原文件；移除目录只删除索引。',
      'roots.empty': '还没有添加任何目录。',
      'roots.manual': '或直接粘贴绝对路径',
      'roots.manualPlaceholder': '/Users/you/Documents/knowledge-html',
      'roots.count': '{n} 篇文档',
      'roots.missing': '{n} 篇丢失',
      'first.title': '把你的 HTML 页面收进来',
      'first.body': '选择一个存放 HTML 的目录，知识库会递归发现 .html / .htm 文件，并按原样在 DSH 里阅读。扫描和阅读只会读取文件。',
      'first.action': '选择知识目录',
      'first.hint': '支持多个目录；索引保存在 DSH 数据目录，不写入你的文件夹。',
      'reader.empty': '从左侧选择一篇文档开始阅读。',
      'reader.emptyTitle': '原样阅读',
      'reader.emptyBody': 'HTML 会放进沙箱 iframe 渲染：内联样式、相对 CSS、图片与字体都按原文件加载，不转成 Markdown。',
      'reader.missingTitle': '文件已不在原路径',
      'reader.missingBody': '收藏、标签与阅读记录仍然保留。恢复文件后点「重新索引」即可回到原状。',
      'reader.failedTitle': '这篇文档没能读取',
      'reader.tagsPlaceholder': '输入标签后回车',
      'reader.tagsEmpty': '暂无标签',
      'reader.loading': '正在加载页面…',
      'reader.openTab': '在新标签页打开',
      'reader.probeFailedTitle': '预览加载失败',
      'reader.probeFailedBody': '静态资源路由返回 HTTP {code}。文件可能已移动，或索引还是旧的。',
      'reader.slowTitle': '预览没有渲染出来',
      'reader.slowBody': '文件已能访问，但 iframe 没有显示内容：宿主页面的框架策略可能拦住了嵌入。可以先用新标签页阅读。',
      'reader.diagnostics': '诊断信息',
      'status.scanning': '正在索引…',
      'status.indexing': '上次索引 {time}',
      'status.notIndexed': '尚未索引',
      'status.counts': '{shown} / {total} 篇',
      'status.missing': '{n} 篇文件丢失',
      'status.truncated': '已达文档上限，部分文件未索引',
      'status.failed': '{n} 个目录读取失败',
      'time.justNow': '刚刚',
      'time.minutes': '{n} 分钟前',
      'time.hours': '{n} 小时前',
      'time.days': '{n} 天前',
      'notice.copied': '路径已复制',
      'notice.copyFailed': '复制失败，请手动选择路径',
      'notice.favoriteAdded': '已收藏',
      'notice.favoriteRemoved': '已取消收藏',
      'notice.rescanned': '索引已更新',
      'notice.tagsSaved': '标签已保存',
      'notice.rootAdded': '已添加目录，正在建立索引…',
      'notice.rootRemoved': '已移除目录（原文件未改动）',
      'error.load': '知识库加载失败：{message}',
      'error.docs': '列表加载失败：{message}',
      'error.action': '操作失败：{message}',
      'error.openUnavailable': '浏览器入口尚未加载，请在插件管理中重新启用知识库。',
      'badge.missing': '丢失',
      'badge.failed': '读取失败',
    };

    const en = {
      'ui.resize': 'Resize folder tree',
      'ui.more': 'More actions',
      'ui.file': 'New HTML file',
      'ui.folder': 'New folder',
      'ui.delete': 'Delete',
      'ui.trash': 'Move to .dsh-html-trash in the library folder, including any folder contents?',
      'ui.filename': 'Name',
      'ui.browserSent': 'Requested opening the original file in Chrome. If it did not open, paste the address below into your browser.',
      'ui.visit': 'Open external link',
      'error.session': 'Your DSH session has expired. Reopen the workspace and retry.',
      'error.access': 'DSH denied access. Reopen the library in the session that owns this workspace.',
      'entry.label': 'Library',
      'actions.rename': 'Rename',
      'actions.filename': 'File name',
      'reader.renameHint': 'Changes the filename only. Page titles and links from other files stay as written.',
      'reader.resourcesFailed': '{n} resources failed to load',
      'reader.externalHint': 'Use the system browser for external links.',
      'error.openUnavailable': 'The browser action is unavailable. Re-enable the library in Plugins.',
      'mode.browse': 'Browse',
      'mode.read': 'Read',
      'actions.backToList': 'Back to list',
      'actions.toggleNav': 'Categories',
      'actions.details': 'Document details',
      'list.rows': 'Rows',
      'list.cards': 'Cards',
      'list.previous': 'Previous',
      'list.next': 'Next',

      'page.title': 'HTML library',
      'search.placeholder': 'Search titles, text, tags…',
      'search.clear': 'Clear search',
      'actions.rescan': 'Reindex',
      'actions.manageRoots': 'Folders',
      'actions.addRoot': 'Add folder',
      'actions.chooseRoot': 'Choose folder…',
      'actions.focus': 'Focus reading',
      'actions.exitFocus': 'Exit focus',
      'actions.refresh': 'Reload preview',
      'actions.openExternal': 'Open in Chrome',
      'actions.copyPath': 'Copy file path',
      'actions.favorite': 'Favorite',
      'actions.unfavorite': 'Unfavorite',
      'actions.tags': 'Tags',
      'actions.remove': 'Remove',
      'actions.confirmRemove': 'Confirm removal',
      'actions.cancel': 'Cancel',
      'actions.retry': 'Retry',
      'actions.add': 'Add',
      'nav.all': 'All documents',
      'nav.recent': 'Recently read',
      'nav.favorites': 'Favorites',
      'nav.missing': 'Missing files',
      'nav.folders': 'Folders',
      'nav.tags': 'Tags',
      'list.sort': 'Sort',
      'sort.relevance': 'Relevance',
      'sort.mtime': 'Last modified',
      'sort.title': 'Name',
      'sort.opened': 'Last opened',
      'list.count': '{n} docs',
      'list.empty': 'No documents here yet.',
      'list.emptySearch': 'Nothing matches “{query}”.',
      'list.emptyFavorites': 'No favorites yet. Star a document while reading.',
      'list.emptyRecent': 'No reading history yet.',
      'list.emptyFolder': 'No HTML files in this folder.',
      'list.emptyTag': 'No documents tagged “{tag}”.',
      'roots.title': 'Knowledge folders',
      'roots.hint': 'Scanning reads your files. Removing a library folder drops its index and keeps the files on disk.',
      'roots.empty': 'No folders added yet.',
      'roots.manual': 'Or paste an absolute path',
      'roots.manualPlaceholder': '/Users/you/Documents/knowledge-html',
      'roots.count': '{n} docs',
      'roots.missing': '{n} missing',
      'first.title': 'Bring your HTML pages in',
      'first.body': 'Pick a folder that holds your HTML pages. The library finds .html / .htm files recursively and renders them as-is inside DSH. Scanning and reading leave your files unchanged.',
      'first.action': 'Choose knowledge folder',
      'first.hint': 'Multiple folders are supported; the index lives in the DSH data directory, not in your folders.',
      'reader.empty': 'Pick a document to start reading.',
      'reader.emptyTitle': 'Read as-is',
      'reader.emptyBody': 'HTML renders in a sandboxed iframe: inline styles, relative CSS, images and fonts load from the original file. Nothing is converted to Markdown.',
      'reader.missingTitle': 'File is no longer at its path',
      'reader.missingBody': 'Favorites, tags and history are kept. Restore the file, then reindex to bring it back.',
      'reader.failedTitle': 'This document could not be read',
      'reader.tagsPlaceholder': 'Type a tag and press Enter',
      'reader.tagsEmpty': 'No tags',
      'reader.loading': 'Loading page…',
      'reader.openTab': 'Open in new tab',
      'reader.probeFailedTitle': 'Preview failed to load',
      'reader.probeFailedBody': 'The asset route answered HTTP {code}. The file may have moved, or the index is stale.',
      'reader.slowTitle': 'Preview did not render',
      'reader.slowBody': 'The file is reachable, but the iframe stayed empty: the host page frame policy may be blocking it. Read it in a new tab meanwhile.',
      'reader.diagnostics': 'Diagnostics',
      'status.scanning': 'Indexing…',
      'status.indexing': 'Last indexed {time}',
      'status.notIndexed': 'Not indexed yet',
      'status.counts': '{shown} / {total} docs',
      'status.missing': '{n} missing',
      'status.truncated': 'Document cap reached; some files are not indexed',
      'status.failed': '{n} folder errors',
      'time.justNow': 'just now',
      'time.minutes': '{n} min ago',
      'time.hours': '{n} h ago',
      'time.days': '{n} d ago',
      'notice.copied': 'Path copied',
      'notice.copyFailed': 'Copy failed; select the path manually',
      'notice.favoriteAdded': 'Added to favorites',
      'notice.favoriteRemoved': 'Removed from favorites',
      'notice.rescanned': 'Index updated',
      'notice.tagsSaved': 'Tags saved',
      'notice.rootAdded': 'Folder added; indexing…',
      'notice.rootRemoved': 'Folder removed (files untouched)',
      'error.load': 'Library failed to load: {message}',
      'error.docs': 'List failed to load: {message}',
      'error.action': 'Action failed: {message}',
      'badge.missing': 'missing',
      'badge.failed': 'unreadable',
    };

    // ---------------------------------------------------------------- 基础工具

    async function request(path, init) {
      const response = await fetch(`${API}${path}`, init);
      let payload = null;
      try {
        payload = await response.json();
      } catch {
        const error = new Error(`HTTP ${response.status}`);
        error.status = response.status;
        throw error;
      }
      if (!response.ok || payload?.ok !== true) {
        const error = new Error(payload?.error?.message ?? `HTTP ${response.status}`);
        error.status = response.status;
        throw error;
      }
      return payload.value;
    }

    let legacyTreeCache = null;
    async function readSnapshot() {
      const value = await request('/snapshot');
      if (Array.isArray(value.treeDocuments)) return value;
      const key = JSON.stringify([value.index.lastIndexAt, value.roots.map(root => root.id)]);
      if (legacyTreeCache?.key !== key) {
        const items = [];
        for (let offset = 0; offset < 100000; offset += 1000) {
          const batch = await request(`/documents?mode=all&limit=1000&offset=${offset}`);
          items.push(...batch.items);
          if (batch.items.length === 0 || items.length >= batch.total) break;
        }
        legacyTreeCache = { key, items };
      }
      value.treeDocuments = legacyTreeCache.items;
      return value;
    }

    const post = (path, body) =>
      request(path, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body ?? {}),
      });

    function escapeRegExp(value) {
      return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /** 在文本里高亮检索词；terms 由宿主返回，已与原文同形。 */
    function highlight(text, terms, keyPrefix) {
      if (typeof text !== 'string' || text === '') return text;
      const list = Array.isArray(terms) ? terms.filter((term) => typeof term === 'string' && term !== '') : [];
      if (list.length === 0) return text;
      const sorted = list.slice().sort((left, right) => right.length - left.length).map(escapeRegExp);
      const splitter = new RegExp(`(${sorted.join('|')})`, 'gi');
      const matcher = new RegExp(`^(?:${sorted.join('|')})$`, 'i');
      return text.split(splitter).map((part, index) => {
        if (!matcher.test(part)) return part;
        return h('mark', { key: `${keyPrefix ?? 'm'}-${index}`, className: 'dshl-mark' }, part);
      });
    }

    function formatDate(ms) {
      if (typeof ms !== 'number' || ms <= 0) return '';
      const date = new Date(ms);
      const pad = (value) => String(value).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }

    function relativeTime(t, ms) {
      if (typeof ms !== 'number' || ms <= 0) return t('status.notIndexed');
      const diff = Date.now() - ms;
      if (diff < 60_000) return t('time.justNow');
      if (diff < 3_600_000) return t('time.minutes', { n: Math.round(diff / 60_000) });
      if (diff < 86_400_000) return t('time.hours', { n: Math.round(diff / 3_600_000) });
      if (diff < 7 * 86_400_000) return t('time.days', { n: Math.round(diff / 86_400_000) });
      return formatDate(ms);
    }

    // ---------------------------------------------------------------- 图标

    const PATHS = {
      search: ['M10.5 10.5a6 6 0 1 0 0-12 6 6 0 0 0 0 12z', 'M15.2 15.2l4 4'],
      refresh: ['M20 12a8 8 0 1 1-2.3-5.6', 'M20 4.5V10h-5.5'],
      folder: ['M3.5 7.5a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z'],
      book: ['M5 5.5A1.5 1.5 0 0 1 6.5 4H11a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H5z', 'M19 5.5A1.5 1.5 0 0 0 17.5 4H13v16a2 2 0 0 1 2-2h4z'],
      star: ['M12 4.6l2.3 4.7 5.2.8-3.8 3.6.9 5.2-4.6-2.4-4.6 2.4.9-5.2L4.5 10l5.2-.8z'],
      tag: ['M4 5.6A1.6 1.6 0 0 1 5.6 4H12l8 8-6.4 6.4-8-8z', 'M8.2 8.2h.01'],
      external: ['M14 4h6v6', 'M20 4l-8.4 8.4', 'M18 14.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4.5'],
      copy: ['M9 9h10v11H9z', 'M15 5H5v10'],
      focus: ['M4 9V4h5', 'M20 15v5h-5', 'M15 4h5v5', 'M9 20H4v-5'],
      shrink: ['M9 4v5H4', 'M15 20v-5h5', 'M20 9h-5V4', 'M4 15h5v5'],
      chevron: ['M9 6l6 6-6 6'],
      close: ['M6 6l12 12', 'M18 6L6 18'],
      plus: ['M12 5v14', 'M5 12h14'],
      clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7.5V12l3 1.8'],
      alert: ['M12 4l9 16H3z', 'M12 10v4.5', 'M12 17.2h.01'],
    };

    function Icon({ name, size = 16, strokeWidth = 1.7 }) {
      const paths = PATHS[name] ?? [];
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
          focusable: false,
        },
        paths.map((d, index) => h('path', { key: index, d })),
      );
    }

    /** 左侧栏图标：props 由 shell 提供（size / active），必须只用 currentColor。 */
    function PanelIcon({ size = 16, active = false }) {
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          'aria-hidden': true,
          focusable: false,
        },
        h('path', {
          d: 'M4.5 6.2A1.7 1.7 0 0 1 6.2 4.5H10a2.5 2.5 0 0 1 2 1v14a2.5 2.5 0 0 0-2-1H4.5z',
          stroke: 'currentColor',
          strokeWidth: active ? 1.9 : 1.6,
          strokeLinejoin: 'round',
        }),
        h('path', {
          d: 'M19.5 6.2a1.7 1.7 0 0 0-1.7-1.7H14v15a2.5 2.5 0 0 1 2-1h3.5z',
          stroke: 'currentColor',
          strokeWidth: active ? 1.9 : 1.6,
          strokeLinejoin: 'round',
        }),
      );
    }

    // ---------------------------------------------------------------- 组件

    function TagEditor({ t, tags, onSave }) {
      const [draft, setDraft] = React.useState('');
      const commit = () => {
        const value = draft.trim();
        if (value === '') return;
        if (tags.includes(value)) {
          setDraft('');
          return;
        }
        onSave([...tags, value]);
        setDraft('');
      };
      return h(
        'div',
        { className: 'dshl-tagbar' },
        tags.length === 0
          ? h('span', { className: 'dshl-tag-empty' }, t('reader.tagsEmpty'))
          : tags.map((tag) =>
              h(
                'span',
                { key: tag, className: 'dshl-chip' },
                tag,
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'dshl-chip-close',
                    title: t('actions.remove'),
                    'aria-label': t('actions.remove'),
                    onClick: () => onSave(tags.filter((entry) => entry !== tag)),
                  },
                  h(Icon, { name: 'close', size: 11 }),
                ),
              ),
            ),
        h('input', {
          className: 'dshl-taginput',
          value: draft,
          placeholder: t('reader.tagsPlaceholder'),
          onChange: (event) => setDraft(event.target.value),
          onKeyDown: (event) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault();
              commit();
            } else if (event.key === 'Escape') {
              setDraft('');
            }
          },
          onBlur: commit,
        }),
      );
    }

    function NavRow({ label, count, active, icon, depth = 0, title, onClick }) {
      return h(
        'button',
        {
          type: 'button',
          className: `dshl-navrow${active ? ' is-active' : ''}`,
          style: depth > 0 ? { paddingLeft: `${8 + depth * 12}px` } : undefined,
          title: title ?? label,
          onClick,
        },
        icon === undefined ? null : h('span', { className: 'dshl-navrow-icon' }, h(Icon, { name: icon, size: 14 })),
        h('span', { className: 'dshl-navrow-label' }, label),
        typeof count === 'number' && count > 0 ? h('span', { className: 'dshl-navrow-count' }, String(count)) : null,
      );
    }

    function SplitHandle({ t, width, onResize }) {
      const clamp = value => Math.min(65, Math.max(18, value));
      return h('div', { className: 'dshl-split', role: 'separator', tabIndex: 0, 'aria-orientation': 'vertical',
        'aria-label': t('ui.resize'), 'aria-valuemin': 18, 'aria-valuemax': 65, 'aria-valuenow': width,
        onPointerDown: event => { if (event.button === 0) event.currentTarget.setPointerCapture(event.pointerId); },
        onPointerMove: event => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
          const bounds = event.currentTarget.parentElement.getBoundingClientRect();
          if (bounds.width) onResize(clamp(Math.round((event.clientX - bounds.left) * 100 / bounds.width)));
        },
        onKeyDown: event => {
          if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
          event.preventDefault();
          onResize(clamp(({ ArrowLeft: width - 2, ArrowRight: width + 2, Home: 18, End: 65 })[event.key]));
        } });
    }

    function NavColumn({ t, snapshot, view, onSelect, selectedId, onOpen, onEdit }) {
      const counts = snapshot.counts;
      const folders = snapshot.facets.folders;
      const tags = snapshot.facets.tags;
      // 折叠状态只记在当前面板生命周期里；刷新后默认全部展开。
      const [collapsed, setCollapsed] = React.useState(() => new Set());

      const [menu, setMenu] = React.useState(null);
      const [action, setAction] = React.useState(null);
      const [name, setName] = React.useState('');
      const [error, setError] = React.useState('');
      const [pending, setPending] = React.useState(false);
      function controls(rootId, rel, kind) {
        const key = JSON.stringify([rootId, rel, kind]);
        const toggle = h('button', { type: 'button', className: 'dshl-tree-more', disabled: pending,
          title: t('ui.more'), 'aria-label': t('ui.more') + ' · ' + (rel || snapshot.roots.find(r => r.id === rootId)?.label),
          'aria-expanded': menu === key, onClick: () => {
            setMenu(menu === key ? null : key); setAction(null); setError('');
          } }, '⋯');
        if (menu !== key) return { toggle, panel: null };
        const choose = value => { setAction(value); setName(''); setError(''); };
        const submit = async event => {
          event.preventDefault();
          if (pending) return;
          const removing = action === 'delete';
          const segments = rel.split('/');
          const entry = { rootId, folder: removing ? segments.slice(0, -1).join('/') : rel,
            name: removing ? segments.at(-1) : name.trim(), action: removing ? 'delete' : 'create',
            kind: removing ? kind : action };
          setPending(true);
          try {
            await onEdit(entry);
            setCollapsed(previous => {
              const next = new Set(previous); next.delete(folderKey(rootId, rel)); return next;
            });
            setMenu(null);
          } catch (cause) { setError(cause.message); }
          finally { setPending(false); }
        };
        const operations = kind === 'folder' ? ['file', 'folder'] : [];
        if (rel) operations.push('delete');
        const panel = h('div', { className: 'dshl-entry-options' },
          action === null ? operations.map(op => h('button', { type: 'button', key: op, className: 'dshl-ghost',
            onClick: () => choose(op) }, t('ui.' + op))) :
          h('form', { onSubmit: submit },
            action === 'delete' ? h('span', null, rel + ' — ' + t('ui.trash')) :
              h('input', { autoFocus: true, required: true, className: 'dshl-input', value: name,
                'aria-label': t('ui.filename'), placeholder: action === 'file' ? 'index.html' : t('ui.filename'),
                onChange: event => setName(event.target.value) }),
            h('button', { type: 'submit', className: 'dshl-ghost', disabled: pending }, t('ui.' + action)),
            h('button', { type: 'button', className: 'dshl-ghost', disabled: pending, onClick: () => setMenu(null) }, t('actions.cancel'))),
          error ? h('span', { role: 'alert' }, error) : null);
        return { toggle, panel };
      }

      const folderKey = (rootId, relDir) => `${rootId}\u0000${relDir}`;
      const toggleFolder = (rootId, relDir) => {
        setCollapsed((previous) => {
          const next = new Set(previous);
          const key = folderKey(rootId, relDir);
          if (next.has(key)) next.delete(key);
          else next.add(key);
          return next;
        });
      };

      const isCurrent = (target) => {
        if (target.mode !== view.mode) return false;
        if (target.mode === 'root') return target.rootId === view.rootId;
        if (target.mode === 'folder') return target.rootId === view.rootId && target.folder === view.folder;
        if (target.mode === 'tag') return target.tag === view.tag;
        return true;
      };

      const tree = React.useMemo(() => {
        const byParent = new Map();
        const group = (rootId, relDir) => {
          const key = folderKey(rootId, relDir);
          if (!byParent.has(key)) byParent.set(key, { folders: [], files: [] });
          return byParent.get(key);
        };
        for (const folder of folders) {
          if (folder.relDir) group(folder.rootId, folder.relDir.split('/').slice(0, -1).join('/')).folders.push(folder);
        }
        for (const doc of snapshot.treeDocuments ?? []) group(doc.rootId, doc.folder).files.push(doc);
        for (const group of byParent.values()) group.files.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'));
        return byParent;
      }, [folders, snapshot.treeDocuments]);

      const renderFolder = (root, relDir = '', depth = 0, count = root.count) => {
        const key = folderKey(root.id, relDir);
        const folded = collapsed.has(key);
        const target = relDir === '' ? { mode: 'root', rootId: root.id } : { mode: 'folder', rootId: root.id, folder: relDir };
        const children = tree.get(key);
        const menu = controls(root.id, relDir, 'folder');
        return h('div', { key, className: 'dshl-tree-folder' },
          h('div', { className: 'dshl-navline' },
            h('button', { type: 'button', className: `dshl-navcaret${folded ? ' is-collapsed' : ''}`,
              style: { marginLeft: `${depth * 12}px` }, 'aria-label': relDir || root.label,
              'aria-expanded': !folded, onClick: () => toggleFolder(root.id, relDir) }, h(Icon, { name: 'chevron', size: 12 })),
            h(NavRow, { label: relDir ? relDir.split('/').pop() : root.label, icon: 'folder',
              count,
              active: isCurrent(target), title: relDir || root.label, onClick: () => onSelect(target) }), menu.toggle), menu.panel,
          folded ? null : h(React.Fragment, null,
            children?.folders.map(folder => renderFolder(root, folder.relDir, depth + 1, folder.count)),
            children?.files.map(doc => {
              const actions = controls(root.id, doc.relPath, 'file');
              return h('div', { key: doc.id },
                h('div', { className: 'dshl-navline' },
                  h(NavRow, { label: doc.name, icon: 'book', depth: depth + 1,
                    title: `${doc.title} · ${doc.relPath}`, active: selectedId === doc.id, onClick: () => onOpen(doc) }),
                  actions.toggle), actions.panel);
            })));

      };

      return h(
        'nav',
        { className: 'dshl-nav', 'aria-label': t('page.title') },
        h(NavRow, { label: t('nav.all'), count: counts.documents, icon: 'book', active: isCurrent({ mode: 'all' }), onClick: () => onSelect({ mode: 'all' }) }),
        h(NavRow, { label: t('nav.recent'), icon: 'clock', active: isCurrent({ mode: 'recent' }), onClick: () => onSelect({ mode: 'recent' }) }),
        h(NavRow, {
          label: t('nav.favorites'),
          count: counts.favorites,
          icon: 'star',
          active: isCurrent({ mode: 'favorites' }),
          onClick: () => onSelect({ mode: 'favorites' }),
        }),
        counts.missing > 0
          ? h(NavRow, {
              label: t('nav.missing'),
              count: counts.missing,
              icon: 'alert',
              active: isCurrent({ mode: 'missing' }),
              onClick: () => onSelect({ mode: 'missing' }),
            })
          : null,

        folders.length > 0 || snapshot.roots.length > 0
          ? h('div', { className: 'dshl-group' }, t('nav.folders'))
          : null,
        snapshot.roots.map(root => renderFolder(root)),

        tags.length > 0 ? h('div', { className: 'dshl-group' }, t('nav.tags')) : null,
        tags.slice(0, 30).map((tag) =>
          h(NavRow, {
            key: tag.name,
            label: `# ${tag.name}`,
            count: tag.count,
            depth: 0,
            active: isCurrent({ mode: 'tag', tag: tag.name }),
            onClick: () => onSelect({ mode: 'tag', tag: tag.name }),
          }),
        ),
      );
    }

    function DocRow({ doc, active, terms, onSelect, onOpen, t }) {
      const meta = [];
      if (doc.status === 'missing') meta.push(h('span', { key: 'missing', className: 'dshl-badge is-missing' }, t('badge.missing')));
      if (doc.status === 'failed') meta.push(h('span', { key: 'failed', className: 'dshl-badge is-failed' }, t('badge.failed')));
      for (const tag of doc.tags.slice(0, 2)) {
        meta.push(h('span', { key: `tag-${tag}`, className: 'dshl-doc-tag' }, `#${tag}`));
      }
      if (doc.tags.length > 2) meta.push(h('span', { key: 'more', className: 'dshl-doc-tag' }, `+${doc.tags.length - 2}`));
      const metaRight = formatDate(doc.mtime);

      return h(
        'button',
        {
          type: 'button',
          className: `dshl-doc${active ? ' is-active' : ''}${doc.status === 'missing' ? ' is-missing' : ''}`,
          onClick: () => onSelect(doc),
          onDoubleClick: () => onOpen(doc),
          title: doc.title,
        },
        h('span', { className: 'dshl-doc-title' }, highlight(doc.title, terms, `t-${doc.id}`)),
        doc.snippet || doc.excerpt
          ? h('span', { className: 'dshl-doc-snippet' }, highlight(doc.snippet || doc.excerpt, terms, `s-${doc.id}`))
          : null,
        h(
          'span',
          { className: 'dshl-doc-meta' },
          h('span', { className: 'dshl-doc-meta-left' }, meta),
          h('span', { className: 'dshl-doc-date' }, metaRight),
        ),
      );
    }

    function ListPane({ t, snapshot, view, list, sort, onSort, selectedId, onSelect, onOpen, query, presentation, onPresentation, page, onPage }) {
      const title = (() => {
        if (view.mode === 'all') return t('nav.all');
        if (view.mode === 'recent') return t('nav.recent');
        if (view.mode === 'favorites') return t('nav.favorites');
        if (view.mode === 'missing') return t('nav.missing');
        if (view.mode === 'tag') return `# ${view.tag}`;
        if (view.mode === 'root') {
          const root = snapshot.roots.find((entry) => entry.id === view.rootId);
          return root?.label ?? t('list.filtered');
        }
        if (view.mode === 'folder') {
          const folder = snapshot.facets.folders.find(
            (entry) => entry.rootId === view.rootId && entry.relDir === view.folder,
          );
          return folder?.label ?? view.folder ?? t('list.filtered');
        }
        return t('list.filtered');
      })();

      const empty = (() => {
        if (list.status === 'failed') return t('error.docs', { message: list.error ?? '' });
        if (query !== '') return t('list.emptySearch', { query });
        if (view.mode === 'favorites') return t('list.emptyFavorites');
        if (view.mode === 'recent') return t('list.emptyRecent');
        if (view.mode === 'tag') return t('list.emptyTag', { tag: view.tag });
        if (view.mode === 'folder' || view.mode === 'root') return t('list.emptyFolder');
        return t('list.empty');
      })();

      return h(
        React.Fragment,
        null,
        h(
          'div',
          { className: 'dshl-midhead' },
          h('span', { className: 'dshl-midtitle', title }, title),
          h('span', { className: 'dshl-count' }, t('list.count', { n: list.total })),
          h('select', { className: 'dshl-select', value: presentation, 'aria-label': t('list.rows'), onChange: (event) => onPresentation(event.target.value) },
            h('option', { value: 'rows' }, t('list.rows')),
            h('option', { value: 'cards' }, t('list.cards'))),
          h(
            'select',
            {
              className: 'dshl-select',
              value: sort,
              title: t('list.sort'),
              'aria-label': t('list.sort'),
              onChange: (event) => onSort(event.target.value),
            },
            h('option', { value: 'relevance' }, t('sort.relevance')),
            h('option', { value: 'mtime' }, t('sort.mtime')),
            h('option', { value: 'title' }, t('sort.title')),
            h('option', { value: 'opened' }, t('sort.opened')),
          ),
        ),
        h(
          'div',
          { className: `dshl-list is-${presentation}`, role: 'list' },
          list.status === 'loading'
            ? h('div', { className: 'dshl-list-note' }, t('status.scanning'))
            : list.items.length === 0
              ? h('div', { className: 'dshl-list-note' }, empty)
              : list.items.map((doc) =>
                  h(DocRow, {
                    key: doc.id,
                    doc,
                    active: doc.id === selectedId,
                    terms: list.terms,
                    onSelect,
                    onOpen,
                    t,
                  }),
                ),
        ),
        list.total > 100 ? h('div', { className: 'dshl-pagination' },
          h('button', { type: 'button', className: 'dshl-ghost', disabled: page === 0, onClick: () => onPage(page - 1) }, t('list.previous')),
          h('span', { role: 'status' }, `${page + 1} / ${Math.ceil(list.total / 100)}`),
          h('button', { type: 'button', className: 'dshl-ghost', disabled: (page + 1) * 100 >= list.total, onClick: () => onPage(page + 1) }, t('list.next'))) : null,
      );
    }

    function RootsPanel({ t, snapshot, busy, onPick, onAddManual, onRemove }) {
      const [value, setValue] = React.useState('');
      const [confirmId, setConfirmId] = React.useState(null);
      React.useEffect(() => {
        if (confirmId === null) return undefined;
        const timer = setTimeout(() => setConfirmId(null), 3000);
        return () => clearTimeout(timer);
      }, [confirmId]);

      return h(
        'div',
        { className: 'dshl-roots' },
        h(
          'div',
          { className: 'dshl-roots-head' },
          h('div', { className: 'dshl-roots-title' }, t('roots.title')),
          h(
            'button',
            { type: 'button', className: 'dshl-primary', disabled: busy, onClick: onPick },
            h(Icon, { name: 'plus', size: 13 }),
            t('actions.chooseRoot'),
          ),
        ),
        h('div', { className: 'dshl-roots-hint' }, t('roots.hint')),
        snapshot.roots.length === 0 ? h('div', { className: 'dshl-list-note' }, t('roots.empty')) : null,
        snapshot.roots.map((root) =>
          h(
            'div',
            { key: root.id, className: 'dshl-root-row' },
            h('div', { className: 'dshl-root-path', title: root.path }, root.path),
            h(
              'div',
              { className: 'dshl-root-meta' },
              h('span', null, t('roots.count', { n: root.count })),
              root.missing > 0 ? h('span', { className: 'dshl-root-missing' }, t('roots.missing', { n: root.missing })) : null,
              h(
                'button',
                {
                  type: 'button',
                  className: `dshl-linkbtn${confirmId === root.id ? ' is-danger' : ''}`,
                  disabled: busy,
                  onClick: () => {
                    if (confirmId === root.id) {
                      setConfirmId(null);
                      onRemove(root.id);
                    } else {
                      setConfirmId(root.id);
                    }
                  },
                },
                confirmId === root.id ? t('actions.confirmRemove') : t('actions.remove'),
              ),
            ),
          ),
        ),
        h(
          'form',
          {
            className: 'dshl-manual',
            onSubmit: (event) => {
              event.preventDefault();
              const path = value.trim();
              if (path === '') return;
              setValue('');
              onAddManual(path);
            },
          },
          h('div', { className: 'dshl-roots-hint' }, t('roots.manual')),
          h(
            'div',
            { className: 'dshl-manual-row' },
            h('input', {
              className: 'dshl-input',
              value,
              placeholder: t('roots.manualPlaceholder'),
              onChange: (event) => setValue(event.target.value),
              spellCheck: false,
            }),
            h('button', { type: 'submit', className: 'dshl-ghost', disabled: busy || value.trim() === '' }, t('actions.add')),
          ),
        ),
      );
    }

    function Reader({ t, doc, terms, iframeNonce, onRetry, onToggleFavorite, onSaveTags, onReload, tagsOpen, onToggleTags, onRename, onNavigate }) {
      const [preview, setPreview] = React.useState({ state: 'loading' });
      const [notice, setNotice] = React.useState(null);
      const [opening, setOpening] = React.useState(false);
      const [name, setName] = React.useState('');
      const [renaming, setRenaming] = React.useState(false);
      const frameRef = React.useRef(null);
      const [externalLink, setExternalLink] = React.useState(null);
      const [browserAddress, setBrowserAddress] = React.useState('');
      const follow = (path, href) => {
        if (typeof path === 'string' && path) onNavigate(doc.rootId, path);
        else if (typeof href === 'string' && /^https?:\/\//i.test(href)) setExternalLink(href);
        else setNotice(t('reader.externalHint'));
      };
      React.useEffect(() => {
        const receive = event => {
          if (event.origin === 'null' && event.source === frameRef.current?.contentWindow &&
              event.data?.type === 'dsh-library-link') follow(event.data.path, event.data.href);
        };
        window.addEventListener('message', receive);
        return () => window.removeEventListener('message', receive);
      }, [onNavigate]);
      React.useEffect(() => {
        let alive = true;
        setName(doc?.name ?? '');
        setNotice(null);
        if (!doc || doc.status !== 'ok') return () => { alive = false; };
        setPreview({ state: 'loading', id: doc.id });
        post('/preview', { id: doc.id, interactive: true }).then(value => {
          if (alive) setPreview({ state: 'ready', ...value });
        }).catch(error => {
          if (alive) setPreview({ state: 'failed', id: doc.id, error: error.message });
        });
        return () => { alive = false; };
      }, [doc?.id, doc?.mtime, doc?.status, iframeNonce]);
      const openExternal = async () => {
        setOpening(true);
        try {
          const result = await post('/open', { id: doc.id });
          setBrowserAddress(result.fileUrl || doc.absolutePath);
          setNotice(t('ui.browserSent'));
        }
        catch (error) { setBrowserAddress(doc.absolutePath); setNotice(error.message); }
        finally { setOpening(false); }
      };
      if (!doc) return h('div', { className: 'dshl-reader-empty' }, t('reader.empty'));
      const ready = preview.state === 'ready' && preview.id === doc.id;
      const fail = doc.status !== 'ok' ? doc.error || t('reader.missingBody') : preview.id === doc.id && preview.state === 'failed' ? preview.error : null;
      const iconButton = (name, label, click, disabled = false) => h('button', { type: 'button', className: 'dshl-iconbtn', title: label, 'aria-label': label, onClick: click, disabled }, h(Icon, { name, size: 15 }));
      return h(React.Fragment, null,
        h('div', { className: 'dshl-reader-head' },
          h('div', { className: 'dshl-reader-heading' },
            h('div', { className: 'dshl-reader-title' }, highlight(doc.title, terms, 'reader')),
            h('details', { className: 'dshl-details', key: doc.id }, h('summary', null, t('actions.details')),
              h('div', { className: 'dshl-details-body' }, doc.absolutePath),
              h('form', { className: 'dshl-rename', onSubmit: async event => {
                event.preventDefault(); setRenaming(true);
                try { await onRename(doc, name); }
                catch (error) { setNotice(error.message); }
                finally { setRenaming(false); }
              } },
                h('input', { className: 'dshl-input', value: name, 'aria-label': t('actions.filename'), onChange: event => setName(event.target.value), disabled: renaming }),
                h('button', { type: 'submit', className: 'dshl-ghost', disabled: renaming || name === doc.name }, t('actions.rename'))),
              h('p', { className: 'dshl-root-path' }, t('reader.renameHint')))),
          h('div', { className: 'dshl-reader-actions' },
            iconButton('star', doc.favorite ? t('actions.unfavorite') : t('actions.favorite'), () => onToggleFavorite(doc)),
            iconButton('tag', t('actions.tags'), onToggleTags),
            iconButton('refresh', t('actions.refresh'), onReload),
            iconButton('external', t('actions.openExternal'), openExternal, opening || doc.status !== 'ok'),
            iconButton('copy', t('actions.copyPath'), async () => {
              try { await navigator.clipboard.writeText(doc.absolutePath); } catch (error) { setNotice(error.message); }
            }))),
        tagsOpen ? h(TagEditor, { t, tags: doc.tags, onSave: tags => onSaveTags(doc, tags) }) : null,
        notice ? h('div', { className: 'dshl-reader-error-body', role: 'alert' }, notice) : null,
        browserAddress ? h('input', { className: 'dshl-input', readOnly: true, value: browserAddress, 'aria-label': t('actions.copyPath'), onFocus: e => e.target.select() }) : null,
        externalLink ? h('a', { href: externalLink, target: '_blank', rel: 'noopener noreferrer' }, t('ui.visit')) : null,
        fail ? h('div', { className: 'dshl-reader-error', role: 'alert' },
          h('div', null, fail), h('button', { className: 'dshl-ghost', onClick: onRetry }, t('actions.retry')),
          h('button', { className: 'dshl-ghost', onClick: openExternal }, t('actions.openExternal'))) :
        ready && preview.interactive === true ? h(React.Fragment, null,
          preview.warnings.length ? h('details', { className: 'dshl-resource-warnings' },
            h('summary', null, t('reader.resourcesFailed', { n: preview.warnings.length })),
            preview.warnings.map((warning, i) => h('div', { key: i }, `${warning.path}: ${warning.message}`))) : null,
          h('iframe', { key: `${doc.id}:${iframeNonce}`, ref: frameRef, className: 'dshl-frame dshl-memory-frame',
            title: doc.title, srcDoc: preview.html, sandbox: 'allow-scripts', referrerPolicy: 'no-referrer' })) : h('div', { className: 'dshl-reader-empty', role: 'status' }, t('reader.loading')));
    }

    function FirstRun({ t, busy, onPick, onAddManual }) {
      const [value, setValue] = React.useState('');
      return h(
        'div',
        { className: 'dshl-first' },
        h(
          'div',
          { className: 'dshl-first-card' },
          h('div', { className: 'dshl-first-icon' }, h(Icon, { name: 'book', size: 34, strokeWidth: 1.3 })),
          h('h2', { className: 'dshl-first-title' }, t('first.title')),
          h('p', { className: 'dshl-first-body' }, t('first.body')),
          h(
            'button',
            { type: 'button', className: 'dshl-primary', disabled: busy, onClick: onPick },
            h(Icon, { name: 'plus', size: 14 }),
            t('first.action'),
          ),
          h('div', { className: 'dshl-first-hint' }, t('first.hint')),
          h(
            'form',
            {
              className: 'dshl-manual-row',
              onSubmit: (event) => {
                event.preventDefault();
                const path = value.trim();
                if (path === '') return;
                setValue('');
                onAddManual(path);
              },
            },
            h('input', {
              className: 'dshl-input',
              value,
              placeholder: t('roots.manualPlaceholder'),
              onChange: (event) => setValue(event.target.value),
              spellCheck: false,
            }),
            h('button', { type: 'submit', className: 'dshl-ghost', disabled: busy || value.trim() === '' }, t('actions.add')),
          ),
        ),
      );
    }

    // ---------------------------------------------------------------- 页面

    function LibraryPage(props) {
      const t = props.t;
      const getPicker = props.getPicker;

      const [snapshot, setSnapshot] = React.useState({ status: 'loading' });
      const [view, setView] = React.useState({ mode: 'all' });
      const [sort, setSort] = React.useState('opened');
      const [query, setQuery] = React.useState('');
      const [search, setSearch] = React.useState('');
      const [list, setList] = React.useState({ status: 'loading', items: [], total: 0, terms: [] });
      const [selectedId, setSelectedId] = React.useState(null);
      const [openedDoc, setOpenedDoc] = React.useState(null);
      const [notice, setNotice] = React.useState(null);
      const [focus, setFocus] = React.useState(true);
      const [rootsOpen, setRootsOpen] = React.useState(false);
      const [busy, setBusy] = React.useState(false);
      const [navWidth, setNavWidth] = React.useState(() => {
        try { const n = Number(localStorage.getItem('dsh-html-library:nav-width')); if (n >= 18 && n <= 65) return n; } catch {}
        return 26;
      });
      React.useEffect(() => { try { localStorage.setItem('dsh-html-library:nav-width', String(navWidth)); } catch {} }, [navWidth]);
      const [iframeNonce, setIframeNonce] = React.useState(0);
      const [tagsOpen, setTagsOpen] = React.useState(false);
      const [presentation, setPresentation] = React.useState('rows');
      const [page, setPage] = React.useState(0);
      React.useEffect(() => setPage(0), [search, view, sort]);

      const flash = React.useCallback((message, error) => {
        setNotice({ message, error: error === true });
      }, []);

      React.useEffect(() => {
        if (notice === null) return undefined;
        const timer = setTimeout(() => setNotice(null), 2400);
        return () => clearTimeout(timer);
      }, [notice]);

      const loadSnapshot = React.useCallback(async () => {
        try {
          const value = await readSnapshot();
          setSnapshot({ status: 'ready', data: value });
        } catch (error) {
          setSnapshot({ status: 'failed', error: String(error?.message ?? error), httpStatus: error?.status });
        }
      }, []);

      /** 添加目录后，扫描在后台跑：轮询到这一轮索引结束为止，别让用户干等 20 秒。 */
      const refreshUntilIndexed = React.useCallback(async (baseline) => {
        for (let attempt = 0; attempt < 16; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          try {
            const value = await readSnapshot();
            setSnapshot({ status: 'ready', data: value });
            if (value.index.scanning === false && value.index.lastIndexAt !== baseline) return;
          } catch {
            return;
          }
        }
      }, []);

      React.useEffect(() => {
        loadSnapshot();
        const timer = setInterval(loadSnapshot, 20_000);
        const onFocus = () => loadSnapshot();
        window.addEventListener('focus', onFocus);
        return () => {
          clearInterval(timer);
          window.removeEventListener('focus', onFocus);
        };
      }, [loadSnapshot]);

      // 索引尚未完成 / 正在扫描时短间隔跟进，别让首屏停在「0 篇」等 20 秒。
      React.useEffect(() => {
        if (snapshot.status !== 'ready') return undefined;
        const data = snapshot.data;
        const pending = data.index.scanning || (data.roots.length > 0 && data.index.lastIndexAt === null);
        if (!pending) return undefined;
        const timer = setTimeout(loadSnapshot, 700);
        return () => clearTimeout(timer);
      }, [snapshot, loadSnapshot]);

      React.useEffect(() => {
        const timer = setTimeout(() => setSearch(query.trim()), 180);
        return () => clearTimeout(timer);
      }, [query]);

      const indexStamp = snapshot.status === 'ready' ? snapshot.data.index.lastIndexAt : null;

      React.useEffect(() => {
        let alive = true;
        setList((previous) => ({ ...previous, status: previous.items.length > 0 ? 'refreshing' : 'loading' }));
        const params = new URLSearchParams();
        if (search !== '') params.set('q', search);
        params.set('mode', view.mode);
        params.set('sort', sort);
        params.set('limit', '100');
        params.set('offset', String(page * 100));
        if (view.rootId !== undefined) params.set('rootId', view.rootId);
        if (view.folder !== undefined) params.set('folder', view.folder);
        if (view.tag !== undefined) params.set('tag', view.tag);
        (async () => {
          try {
            const value = await request(`/documents?${params.toString()}`);
            if (!alive) return;
            setList({ status: 'ready', items: value.items, total: value.total, terms: value.terms });
          } catch (error) {
            if (!alive) return;
            setList({ status: 'failed', items: [], total: 0, terms: [], error: String(error?.message ?? error) });
          }
        })();
        return () => {
          alive = false;
        };
      }, [search, view, sort, indexStamp, page]);

      React.useEffect(() => {
        if (list.status === 'ready' && page > Math.max(0, Math.ceil(list.total / 100) - 1)) setPage(Math.max(0, Math.ceil(list.total / 100) - 1));
      }, [list.status, list.total, page]);

      React.useEffect(() => {
        if (focus && selectedId !== null) return;
        if (list.status === 'ready' && list.items.length === 0) {
          setSelectedId(null);
          return;
        }
        if (list.items.length === 0) return;
        if (selectedId !== null && list.items.some((doc) => doc.id === selectedId)) return;
        setSelectedId(list.items[0].id);
      }, [list, selectedId, focus]);

      React.useEffect(() => {
        if (selectedId === null || !focus) return;
        post('/read', { id: selectedId, scrollRatio: 0 }).catch(() => {});
      }, [selectedId, focus]);

      const selected = React.useMemo(
        () => list.items.find((doc) => doc.id === selectedId) ?? (openedDoc?.id === selectedId ? openedDoc : null),
        [list.items, selectedId, openedDoc],
      );

      const selectView = React.useCallback((next) => {
        setView(next);
        setFocus(!['all', 'recent', 'favorites', 'tag', 'missing'].includes(next.mode));
        setRootsOpen(false);
        setTagsOpen(false);
        setSort((current) => {
          if (next.mode === 'recent') return 'opened';
          if (current === 'opened') return 'relevance';
          return current;
        });
      }, []);

      const pickRoot = React.useCallback(async () => {
        const picker = typeof getPicker === 'function' ? getPicker() : null;
        if (typeof picker !== 'function') {
          flash(t('error.action', { message: 'directory picker unavailable' }), true);
          setRootsOpen(true);
          return;
        }
        setBusy(true);
        try {
          const picked = await picker();
          if (typeof picked === 'string' && picked !== '') {
            const baseline = snapshot.status === 'ready' ? snapshot.data.index.lastIndexAt : null;
            await post('/roots/add', { path: picked });
            flash(t('notice.rootAdded'));
            await loadSnapshot();
            await refreshUntilIndexed(baseline);
          }
        } catch (error) {
          flash(t('error.action', { message: String(error?.message ?? error) }), true);
        } finally {
          setBusy(false);
        }
      }, [getPicker, flash, loadSnapshot, refreshUntilIndexed, snapshot, t]);

      const addRootManual = React.useCallback(
        async (path) => {
          setBusy(true);
          try {
            const baseline = snapshot.status === 'ready' ? snapshot.data.index.lastIndexAt : null;
            await post('/roots/add', { path });
            flash(t('notice.rootAdded'));
            await loadSnapshot();
            await refreshUntilIndexed(baseline);
          } catch (error) {
            flash(t('error.action', { message: String(error?.message ?? error) }), true);
          } finally {
            setBusy(false);
          }
        },
        [flash, loadSnapshot, refreshUntilIndexed, snapshot, t],
      );

      const removeRoot = React.useCallback(
        async (id) => {
          setBusy(true);
          try {
            await post('/roots/remove', { id });
            flash(t('notice.rootRemoved'));
            await loadSnapshot();
          } catch (error) {
            flash(t('error.action', { message: String(error?.message ?? error) }), true);
          } finally {
            setBusy(false);
          }
        },
        [flash, loadSnapshot, t],
      );

      const rescan = React.useCallback(async () => {
        setBusy(true);
        try {
          await post('/scan');
          flash(t('notice.rescanned'));
          await loadSnapshot();
        } catch (error) {
          flash(t('error.action', { message: String(error?.message ?? error) }), true);
        } finally {
          setBusy(false);
        }
      }, [flash, loadSnapshot, t]);

      const toggleFavorite = React.useCallback(
        async (doc) => {
          const next = !doc.favorite;
          setList((previous) => ({
            ...previous,
            items: previous.items.map((entry) => (entry.id === doc.id ? { ...entry, favorite: next } : entry)),
          }));
          try {
            await post('/favorite', { id: doc.id, enabled: next });
            setOpenedDoc(previous => previous?.id === doc.id ? { ...previous, favorite: next } : previous);
            flash(next ? t('notice.favoriteAdded') : t('notice.favoriteRemoved'));
            loadSnapshot();
          } catch (error) {
            setList((previous) => ({
              ...previous,
              items: previous.items.map((entry) => (entry.id === doc.id ? { ...entry, favorite: doc.favorite } : entry)),
            }));
            flash(t('error.action', { message: String(error?.message ?? error) }), true);
          }
        },
        [flash, loadSnapshot, t],
      );

      const saveTags = React.useCallback(
        async (doc, tags) => {
          try {
            const value = await post('/tags', { id: doc.id, tags });
            setOpenedDoc(previous => previous?.id === doc.id ? { ...previous, tags: value.tags } : previous);
            setList((previous) => ({
              ...previous,
              items: previous.items.map((entry) => (entry.id === doc.id ? { ...entry, tags: value.tags } : entry)),
            }));
            flash(t('notice.tagsSaved'));
            loadSnapshot();
          } catch (error) {
            flash(t('error.action', { message: String(error?.message ?? error) }), true);
          }
        },
        [flash, loadSnapshot, t],
      );

      const openFocus = React.useCallback(async (doc) => {
        try {
          const full = await request(`/document?id=${encodeURIComponent(doc.id)}`);
          setOpenedDoc(full);
          setSelectedId(full.id);
          setFocus(true);
          setRootsOpen(false);
          setTagsOpen(false);
        } catch (error) { flash(String(error?.message ?? error), true); }
      }, [flash]);

      const header = h(
        'header',
        { className: 'dshl-header' },
        h(
          'div',
          { className: 'dshl-brand' },
          h(Icon, { name: 'book', size: 17, strokeWidth: 1.6 }),
          h('span', { className: 'dshl-brand-name' }, t('page.title')),
          snapshot.status === 'ready'
            ? h('span', { className: 'dshl-brand-count' }, String(snapshot.data.counts.documents))
            : null,
        ),
        h(
          'div',
          { className: 'dshl-search' },
          h(Icon, { name: 'search', size: 14 }),
          h('input', {
            className: 'dshl-search-input',
            type: 'search',
            value: query,
            placeholder: t('search.placeholder'),
            'aria-label': t('search.placeholder'),
            onChange: (event) => { setQuery(event.target.value); setFocus(false); },
            onKeyDown: (event) => {
              if (event.key === 'Escape') {
                setQuery('');
                setSearch('');
              }
            },
          }),
          query === ''
            ? null
            : h(
                'button',
                {
                  type: 'button',
                  className: 'dshl-search-clear',
                  title: t('search.clear'),
                  'aria-label': t('search.clear'),
                  onClick: () => {
                    setQuery('');
                    setSearch('');
                  },
                },
                h(Icon, { name: 'close', size: 12 }),
              ),
        ),
        h(
          'div',
          { className: 'dshl-actions' },
          h(
            'button',
            {
              type: 'button',
              className: 'dshl-iconbtn',
              title: t('actions.rescan'),
              'aria-label': t('actions.rescan'),
              disabled: busy,
              onClick: rescan,
            },
            h(Icon, { name: 'refresh', size: 15 }),
          ),
          h(
            'button',
            {
              type: 'button',
              className: `dshl-ghost${rootsOpen ? ' is-active' : ''}`,
              'aria-expanded': rootsOpen,
              onClick: () => {
                setRootsOpen(!rootsOpen);
                setFocus(false);
                if (!rootsOpen && snapshot.status === 'failed') {
                  setSnapshot({ status: 'loading' });
                  loadSnapshot();
                }
              },
            },
            h(Icon, { name: 'folder', size: 14 }),
            t('actions.manageRoots'),
          ),
          focus ? h(
            'button',
            {
              type: 'button',
              className: 'dshl-ghost',
              disabled: !focus && selected === null,
              title: focus ? t('actions.backToList') : t('mode.read'),
              'aria-label': focus ? t('actions.backToList') : t('mode.read'),
              onClick: () => setFocus((value) => !value),
            },
            h(Icon, { name: focus ? 'shrink' : 'focus', size: 15 }),
            t('actions.backToList'),
          ) : null,
        ),
      );

      let content;
      if (snapshot.status === 'loading') {
        content = h('div', { className: 'dshl-center-note' }, t('status.scanning'));
      } else if (snapshot.status === 'failed') {
        content = h(
          'div',
          { className: 'dshl-center-note' },
          rootsOpen ? h('strong', null, t('actions.manageRoots')) : null,
          h('div', { role: 'alert' }, t('error.load', { message:
            snapshot.httpStatus === 401 ? t('error.session') :
            snapshot.httpStatus === 403 ? t('error.access') : snapshot.error ?? '' })),
          h('button', { type: 'button', className: 'dshl-ghost', onClick: loadSnapshot }, t('actions.retry')),
        );
      } else if (snapshot.data.roots.length === 0 && !rootsOpen) {
        content = h(FirstRun, { t, busy, onPick: pickRoot, onAddManual: addRootManual });
      } else {
        content = h(
          'div',
          { className: 'dshl-main', style: { '--nav-width': navWidth + '%' } },
          h(NavColumn, { t, snapshot: snapshot.data, view, onSelect: selectView, selectedId, onOpen: openFocus,
            onEdit: async entry => {
              const result = await post('/entries', entry);
              if (entry.action === 'delete') {
                const removed = doc => doc?.rootId === entry.rootId && (doc.relPath === result.relPath || doc.relPath.startsWith(result.relPath + '/'));
                if (removed(selected)) { setSelectedId(null); setOpenedDoc(null); }
                setList(previous => ({ ...previous, items: previous.items.filter(doc => !removed(doc)) }));
                if (view.rootId === entry.rootId && (view.folder === result.relPath || view.folder?.startsWith(result.relPath + '/'))) setView({ mode: 'root', rootId: entry.rootId });
              }
              await loadSnapshot();
            } }),
          h(SplitHandle, { t, width: navWidth, onResize: setNavWidth }),
          h(
            'section',
            { className: 'dshl-mid' },
            rootsOpen
              ? h(RootsPanel, { t, snapshot: snapshot.data, busy, onPick: pickRoot, onAddManual: addRootManual, onRemove: removeRoot })
              : h(ListPane, {
                  t,
                  snapshot: snapshot.data,
                  view,
                  list,
                  sort,
                  onSort: setSort,
                  selectedId,
                  onSelect: openFocus,
                  onOpen: openFocus,
                  query: search, presentation, onPresentation: setPresentation, page, onPage: setPage,
                }),
          ),
          h(
            'section',
            { className: 'dshl-reader' },
            h(Reader, { key: selected?.id,
              t,
              doc: selected,
              terms: list.terms,
              iframeNonce,
              tagsOpen,
              onToggleTags: () => setTagsOpen((value) => !value),
              onToggleFavorite: toggleFavorite,
              onSaveTags: saveTags,
              onRename: async (doc, name) => {
                const updated = await post('/rename', { id: doc.id, name });
                setOpenedDoc(updated); setSelectedId(updated.id);
                setList(previous => ({ ...previous, items: previous.items.map(entry => entry.id === doc.id ? updated : entry) }));
                await loadSnapshot();
              },
              onNavigate: (rootId, relPath) => {
                const target = snapshot.data.treeDocuments.find(entry => entry.rootId === rootId && entry.relPath === relPath);
                if (target) openFocus(target); else flash(t('reader.missingTitle'), true);
              },
              onRetry: rescan,
              onReload: () => {
                setIframeNonce((value) => value + 1);
              },
            }),
          ),
        );
      }

      const index = snapshot.status === 'ready' ? snapshot.data.index : null;
      const counts = snapshot.status === 'ready' ? snapshot.data.counts : null;
      const status = h(
        'footer',
        { className: 'dshl-status' },
        counts === null
          ? null
          : h('span', null, t('status.counts', { shown: list.total, total: counts.documents + counts.missing })),
        index === null
          ? null
          : h(
              'span',
              null,
              index.scanning
                ? t('status.scanning')
                : index.lastIndexAt === null
                  ? t('status.notIndexed')
                  : t('status.indexing', { time: relativeTime(t, Date.parse(index.lastIndexAt)) }),
            ),
        counts !== null && counts.missing > 0 ? h('span', null, t('status.missing', { n: counts.missing })) : null,
        index !== null && index.failed > 0 ? h('span', null, t('status.failed', { n: index.failed })) : null,
        index !== null && index.truncated ? h('span', null, t('status.truncated')) : null,

      );

      return h(
        'div',
        { className: `dshl-root${focus ? ' is-focus' : ' is-browsing'}` },
        h('style', { key: 'dshl-style' }, CSS),
        header,
        content,
        notice === null ? null : h('div', { role: notice.error ? 'alert' : 'status', className: `dshl-notice${notice.error ? ' is-error' : ''}` }, notice.message),
        status,
      );
    }

    // ---------------------------------------------------------------- 样式

    const CSS = `
.dshl-root{--dshl-tertiary:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary));--dshl-hover:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));--dshl-active:var(--dsw-alias-interactive-bg-active,var(--dsw-alias-bg-layer-2));position:relative;display:flex;flex-direction:column;height:100%;min-height:0;box-sizing:border-box;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);font-size:13px;line-height:20px}
.dshl-root *{box-sizing:border-box}
.dshl-root :where(button){font:inherit;color:inherit}
.dshl-header{flex:0 0 auto;display:flex;align-items:center;gap:10px;height:46px;padding:0 12px;border-bottom:1px solid var(--dsw-alias-border-l1)}
.dshl-brand{display:flex;align-items:center;gap:7px;flex:0 0 auto;font-size:14px;font-weight:600}
.dshl-brand-count{min-width:18px;padding:0 6px;border-radius:9px;background:var(--dshl-hover);color:var(--dshl-tertiary);font-size:11px;font-weight:500;text-align:center}
.dshl-search{flex:1 1 auto;display:flex;align-items:center;gap:6px;min-width:120px;max-width:560px;height:30px;padding:0 9px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dshl-tertiary)}
.dshl-search:focus-within{border-color:var(--dsw-alias-brand-primary)}
.dshl-search-input{flex:1 1 auto;min-width:0;border:0;background:0 0;color:var(--dsw-alias-label-primary);font:inherit;outline:none;-webkit-appearance:none;appearance:none}
.dshl-search-input::-webkit-search-cancel-button{display:none}
.dshl-search-input::placeholder{color:var(--dshl-tertiary)}
.dshl-search-clear{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;padding:0;border:0;border-radius:50%;background:var(--dshl-hover);color:var(--dshl-tertiary);cursor:pointer}
.dshl-search-clear:hover{color:var(--dsw-alias-label-primary)}
.dshl-actions{display:flex;align-items:center;gap:4px;flex:0 0 auto;margin-left:auto}
.dshl-iconbtn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:0;border-radius:7px;background:0 0;color:var(--dsw-alias-label-secondary);cursor:pointer}
.dshl-iconbtn:hover:not(:disabled){background:var(--dshl-hover);color:var(--dsw-alias-label-primary)}
.dshl-iconbtn[href]{text-decoration:none}
.dshl-iconbtn.is-disabled{pointer-events:none;opacity:.55}
.dshl-iconbtn:disabled{color:var(--dshl-tertiary);cursor:default;opacity:.55}
.dshl-iconbtn.is-on{color:var(--dsw-alias-state-warn-primary)}
.dshl-ghost{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:7px;background:0 0;color:var(--dsw-alias-label-secondary);cursor:pointer}
.dshl-ghost:hover:not(:disabled),.dshl-ghost.is-active{background:var(--dshl-hover);color:var(--dsw-alias-label-primary)}
.dshl-ghost:disabled{color:var(--dshl-tertiary);cursor:default;opacity:.55}
.dshl-primary{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 13px;border:0;border-radius:7px;background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary-foreground,var(--dsw-alias-bg-base));font-weight:500;cursor:pointer}
.dshl-primary:hover:not(:disabled){filter:brightness(.94)}
.dshl-primary:disabled{background:var(--dshl-hover);color:var(--dshl-tertiary);cursor:default}
.dshl-main{flex:1 1 auto;display:flex;min-height:0}
.dshl-nav{flex:0 0 216px;min-width:0;display:flex;flex-direction:column;gap:1px;padding:8px;overflow:auto;border-right:1px solid var(--dsw-alias-border-l1)}
.dshl-group{margin:12px 8px 4px;color:var(--dshl-tertiary);font-size:11px;line-height:16px}
.dshl-navrow{display:flex;align-items:center;gap:8px;flex:0 0 auto;width:100%;height:30px;padding:0 8px;border:0;border-radius:6px;background:0 0;color:var(--dsw-alias-label-secondary);text-align:left;cursor:pointer}
.dshl-navrow:hover{background:var(--dshl-hover);color:var(--dsw-alias-label-primary)}
.dshl-navrow.is-active{background:var(--dshl-active);color:var(--dsw-alias-label-primary);font-weight:600}
.dshl-navrow-icon{display:inline-flex;flex:0 0 auto;color:var(--dshl-tertiary)}
.dshl-navrow.is-active .dshl-navrow-icon{color:var(--dsw-alias-brand-primary)}
.dshl-navrow-label{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dshl-navline{display:flex;align-items:center;min-width:0}
.dshl-navline .dshl-navrow{flex:1 1 auto;width:auto}
.dshl-navcaret{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;width:16px;height:24px;padding:0;border:0;background:0 0;color:var(--dshl-tertiary);cursor:pointer;transform:rotate(90deg);transition:transform .12s ease}
.dshl-navcaret:hover{color:var(--dsw-alias-label-primary)}
.dshl-navcaret.is-collapsed{transform:rotate(0)}
.dshl-navcaret.is-empty{visibility:hidden}
.dshl-navrow-count{flex:0 0 auto;font-size:11px;font-variant-numeric:tabular-nums;color:var(--dshl-tertiary)}
.dshl-mid{flex:0 0 330px;min-width:0;display:flex;flex-direction:column;border-right:1px solid var(--dsw-alias-border-l1)}
.dshl-midhead{flex:0 0 auto;display:flex;align-items:center;gap:8px;height:38px;padding:0 10px 0 14px;border-bottom:1px solid var(--dsw-alias-border-l1)}
.dshl-midtitle{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}
.dshl-count{flex:0 0 auto;font-size:11px;color:var(--dshl-tertiary);font-variant-numeric:tabular-nums}
.dshl-select{flex:0 0 auto;max-width:96px;height:24px;padding:0 4px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font:inherit;font-size:11px;outline:none;cursor:pointer}
.dshl-select:focus{border-color:var(--dsw-alias-brand-primary)}
.dshl-list{flex:1 1 auto;min-height:0;overflow:auto;padding:6px 6px 20px}
.dshl-list-note{max-width:52ch;padding:14px 10px;color:var(--dshl-tertiary);line-height:20px}
.dshl-doc{display:flex;flex-direction:column;gap:3px;width:100%;padding:8px 10px;border:1px solid transparent;border-radius:8px;background:0 0;color:inherit;text-align:left;cursor:pointer}
.dshl-doc:hover{background:var(--dshl-hover)}
.dshl-doc.is-active{background:var(--dshl-active);border-color:var(--dsw-alias-border-l2)}
.dshl-doc.is-missing .dshl-doc-title{color:var(--dshl-tertiary)}
.dshl-doc-title{font-weight:600;overflow-wrap:anywhere;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.dshl-doc-snippet{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;overflow-wrap:anywhere;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.dshl-doc-meta{display:flex;align-items:center;gap:6px;min-width:0;color:var(--dshl-tertiary);font-size:11px;line-height:16px}
.dshl-doc-meta-left{display:flex;align-items:center;gap:6px;min-width:0;overflow:hidden}
.dshl-doc-tag{flex:0 0 auto;max-width:74px;padding:0 5px;border-radius:4px;background:var(--dshl-hover);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dshl-doc-date{flex:0 0 auto;margin-left:auto;font-variant-numeric:tabular-nums}
.dshl-badge{flex:0 0 auto;padding:0 5px;border-radius:4px;font-size:10px;line-height:15px}
.dshl-badge.is-missing{color:var(--dsw-alias-state-warn-primary);border:1px solid var(--dsw-alias-state-warn-primary)}
.dshl-badge.is-failed{color:var(--dsw-alias-state-error-primary);border:1px solid var(--dsw-alias-state-error-primary)}
.dshl-mark{padding:0 1px;border-radius:2px;background:var(--dsw-alias-state-warn-primary);color:var(--dsw-alias-label-primary-foreground,var(--dsw-alias-bg-base))}
.dshl-reader{position:relative;flex:1 1 auto;min-width:0;display:flex;flex-direction:column;background:var(--dsw-alias-bg-layer-1)}
.dshl-reader-head{flex:0 0 auto;display:flex;align-items:center;gap:8px;min-height:44px;max-height:50%;overflow:auto;flex-wrap:wrap;padding:5px 8px 5px 14px;border-bottom:1px solid var(--dsw-alias-border-l1)}
.dshl-reader-heading{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:0;line-height:18px}
.dshl-reader-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}
.dshl-reader-path{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dshl-tertiary);font-size:11px;line-height:15px}
.dshl-reader-actions{display:flex;align-items:center;gap:1px;flex:0 0 auto}
.dshl-open-browser{gap:6px;margin:0 4px;text-decoration:none;white-space:nowrap}
.dshl-open-browser.is-disabled{opacity:.5;cursor:default}
.dshl-debug{flex:0 0 auto;display:flex;align-items:center;gap:14px;padding:3px 14px;border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);color:var(--dshl-tertiary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;line-height:16px;overflow:hidden}
.dshl-debug-url{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dshl-tagbar{flex:0 0 auto;display:flex;align-items:center;flex-wrap:wrap;gap:5px;padding:6px 14px;border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}
.dshl-tag-empty{color:var(--dshl-tertiary);font-size:11px}
.dshl-chip{display:inline-flex;align-items:center;gap:2px;height:22px;padding:0 4px 0 7px;border:1px solid var(--dsw-alias-border-l1);border-radius:5px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-size:11px}
.dshl-chip-close{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;padding:0;border:0;border-radius:4px;background:0 0;color:var(--dshl-tertiary);cursor:pointer}
.dshl-chip-close:hover{background:var(--dshl-hover);color:var(--dsw-alias-label-primary)}
.dshl-taginput{flex:1 1 140px;min-width:100px;height:24px;padding:0 4px;border:0;border-bottom:1px dashed var(--dsw-alias-border-l2);background:0 0;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;outline:none}
.dshl-taginput::placeholder{color:var(--dshl-tertiary)}
.dshl-frame-wrap{position:relative;flex:1 1 auto;min-height:280px;background:var(--dsw-alias-bg-layer-2)}
.dshl-memory-frame{flex:1 1 auto;min-height:0}
.dshl-rename{display:flex;gap:6px;padding-top:6px}
.dshl-resource-warnings{padding:6px 12px;color:var(--dsw-alias-state-warn-primary);font-size:12px}
.dshl-frame{display:block;width:100%;height:100%;border:0;background:var(--dsw-alias-bg-layer-2)}
.dshl-frame-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;color:var(--dshl-tertiary);background:var(--dsw-alias-bg-layer-2);font-size:12px;text-align:center}
.dshl-frame-slow{display:flex;flex-direction:column;align-items:center;gap:8px;max-width:46ch}
.dshl-frame-slow-title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:600}
.dshl-frame-slow-body{line-height:20px}
.dshl-reader-error-actions{display:flex;align-items:center;gap:8px;margin-top:2px}
.dshl-frame-debug{width:100%;max-width:70ch;margin-top:4px;text-align:left;font-size:11px;line-height:16px}
.dshl-frame-debug summary{cursor:pointer;color:var(--dshl-tertiary)}
.dshl-frame-debug-row{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;overflow-wrap:anywhere;color:var(--dshl-tertiary)}
.dshl-reader-empty{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:32px;text-align:center}
.dshl-reader-empty-icon{display:flex;color:var(--dshl-tertiary)}
.dshl-reader-empty-title{font-size:15px;font-weight:600}
.dshl-reader-empty-body{max-width:46ch;color:var(--dshl-tertiary);font-size:12px;line-height:20px}
.dshl-reader-error{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:32px;color:var(--dsw-alias-state-error-primary);text-align:center}
.dshl-reader-error-title{color:var(--dsw-alias-label-primary);font-size:15px;font-weight:600}
.dshl-reader-error-body{max-width:52ch;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:20px;overflow-wrap:anywhere}
.dshl-center-note{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:32px;color:var(--dshl-tertiary)}
.dshl-first{flex:1 1 auto;display:flex;align-items:center;justify-content:center;padding:32px;overflow:auto}
.dshl-first-card{display:flex;flex-direction:column;align-items:flex-start;gap:12px;max-width:460px}
.dshl-first-icon{display:flex;color:var(--dsw-alias-brand-primary)}
.dshl-first-title{margin:0;font-size:19px;line-height:26px;font-weight:600}
.dshl-first-body{margin:0;color:var(--dsw-alias-label-secondary);line-height:22px}
.dshl-first-hint{color:var(--dshl-tertiary);font-size:11px;line-height:18px}
.dshl-manual{display:flex;flex-direction:column;gap:6px;width:100%;margin-top:6px}
.dshl-manual-row{display:flex;align-items:center;gap:6px;width:100%}
.dshl-input{flex:1 1 auto;min-width:0;height:30px;padding:0 9px;border:1px solid var(--dsw-alias-border-l1);border-radius:7px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;outline:none}
.dshl-input:focus{border-color:var(--dsw-alias-brand-primary)}
.dshl-input::placeholder{color:var(--dshl-tertiary)}
.dshl-roots{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:10px;padding:12px;overflow:auto}
.dshl-roots-head{display:flex;align-items:center;gap:8px}
.dshl-roots-title{flex:1 1 auto;font-weight:600}
.dshl-roots-hint{color:var(--dshl-tertiary);font-size:11px;line-height:18px}
.dshl-root-row{display:flex;flex-direction:column;gap:4px;padding:9px 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1)}
.dshl-root-path{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;line-height:17px;color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere}
.dshl-root-meta{display:flex;align-items:center;gap:10px;color:var(--dshl-tertiary);font-size:11px}
.dshl-root-missing{color:var(--dsw-alias-state-warn-primary)}
.dshl-linkbtn{margin-left:auto;padding:0 2px;border:0;background:0 0;color:var(--dshl-tertiary);font-size:11px;cursor:pointer}
.dshl-linkbtn:hover{color:var(--dsw-alias-label-primary);text-decoration:underline}
.dshl-linkbtn.is-danger{color:var(--dsw-alias-state-error-primary);font-weight:600}
.dshl-notice{position:absolute;left:50%;bottom:36px;z-index:20;max-width:min(70%,520px);padding:7px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);box-shadow:var(--dsw-shadow-lv3,0 6px 18px rgba(0,0,0,.18));font-size:12px;transform:translateX(-50%)}
.dshl-notice.is-error{border-color:var(--dsw-alias-state-error-primary)}
.dshl-status{flex:0 0 auto;display:flex;align-items:center;gap:12px;height:26px;padding:0 12px;border-top:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base);color:var(--dshl-tertiary);font-size:11px;font-variant-numeric:tabular-nums}
.dshl-status-path{margin-left:auto;max-width:52%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.dshl-root.is-focus .dshl-mid{display:none}
.dshl-root.is-browsing .dshl-reader{display:none}
.dshl-root.is-browsing .dshl-mid{flex:1 1 auto;border-right:0}
.dshl-modebar{display:flex;align-items:center;gap:12px;min-height:36px;padding:4px 12px;border-bottom:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);font-size:12px}
.dshl-mode-title{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:var(--dsw-alias-label-primary)}
.dshl-pagination{display:flex;align-items:center;justify-content:center;gap:16px;padding:8px;border-top:1px solid var(--dsw-alias-border-l1)}
.dshl-list.is-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(260px,100%),1fr));align-content:start;gap:10px;padding:12px}
.dshl-list.is-cards .dshl-doc{border-color:var(--dsw-alias-border-l1);padding:14px;gap:8px;align-self:start}
.dshl-list.is-rows .dshl-doc{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr) 92px;align-items:center;gap:16px;border-radius:4px;padding:10px 12px}
.dshl-list.is-rows .dshl-doc-title{-webkit-line-clamp:2}
.dshl-list.is-rows .dshl-doc-snippet{-webkit-line-clamp:1}
.dshl-list.is-rows .dshl-doc-meta{grid-column:3}
.dshl-details{font-size:11px;color:var(--dshl-tertiary)}
.dshl-details summary{cursor:pointer}
.dshl-details-body{padding:8px 0;overflow-wrap:anywhere}
@media (max-width:900px){.dshl-list.is-rows .dshl-doc{display:flex;align-items:stretch;gap:3px}}
@media (max-width:1080px){.dshl-nav{flex-basis:190px}.dshl-mid{flex-basis:290px}}

@media (max-width:760px){.dshl-mid{flex-basis:250px}}
.dshl-main>.dshl-nav{flex:0 0 var(--nav-width);border-right:0}
.dshl-split{flex:0 0 7px;cursor:col-resize;touch-action:none;user-select:none;border-inline:1px solid var(--dsw-alias-border-l1)}
.dshl-split:hover,.dshl-split:focus-visible{background:var(--dsw-alias-brand-primary)}
.dshl-tree-more{flex:none;border:0;background:transparent;cursor:pointer;padding:2px 6px}
.dshl-entry-options,.dshl-entry-options form{display:flex;align-items:center;flex-wrap:wrap;gap:4px;overflow-wrap:anywhere}
.dshl-entry-options{padding:6px;background:var(--dsw-alias-bg-layer-1)}
.dshl-reader-actions{max-width:100%;flex-wrap:wrap}
.dshl-reader-heading{min-width:min(180px,100%)}
.dshl-reader-head .dshl-rename{flex-wrap:wrap}
.dshl-reader-head .dshl-input{min-width:0;max-width:100%}

`;

    // ---------------------------------------------------------------- 插件装配

    return {
      inject: ['slots', 'locale'],

      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-html-library: dictionaries');
        const t = ctx.locale.bind(NS);

        let pickDirectory = null;
        ctx.inject(['uiWorkspace'], (sub) => {
          const service = sub.uiWorkspace;
          if (service !== undefined && typeof service.pickDirectory === 'function') {
            pickDirectory = () => service.pickDirectory();
          }
        });

        const Panel = (slotProps) =>
          h(LibraryPage, { ...(slotProps ?? {}), t, getPicker: () => pickDirectory });

        // 左侧栏「全局面板图标」：id 必须与下面 main 的 key 相同，
        // shell 才能把点击接到这个面板上。
        ctx.slots.inject('sidebar.panellist', () =>
          ctx.slots.register(
            { name: 'sidebar.panellist', id: 'html-library', order: 40, label: () => t('entry.label') },
            PanelIcon,
          ),
        );

        // 中央主面板：root 作用域的 keyed slot，按侧边栏条目 id 分发。
        ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'html-library', locale: NS }, Panel));
      },
    };
  },
});
