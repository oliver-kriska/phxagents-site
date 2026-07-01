// phxagents.dev shared client behavior — theme, search palette, mobile menu, GH stars, copy.

// Theme — apply ASAP to avoid flash
(function () {
  try {
    const saved = localStorage.getItem('phx.theme');
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefers)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch (e) {}
})();

function applyTheme(t) {
  if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  else document.documentElement.removeAttribute('data-theme');
}

// Shared Tab-trap for open dialogs/drawers (search palette, mobile menu, docs drawer).
function trapTab(container, e) {
  const focusable = container.querySelectorAll(
    'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  else if (!container.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
}

function syncThemeToggle() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
    b.setAttribute('aria-pressed', dark ? 'true' : 'false');
  });
}
syncThemeToggle();

document.addEventListener('click', function (e) {
  const btn = e.target.closest('[data-theme-toggle]');
  if (!btn) return;
  const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const next = cur === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  syncThemeToggle();
  try { localStorage.setItem('phx.theme', next); } catch (e) {}
});

// Mobile menu
(function () {
  let lastFocused = null;
  function setOpen(menu, open) {
    menu.setAttribute('data-open', open ? 'true' : 'false');
    document.body.classList.toggle('menu-open', open);
    const btn = document.querySelector('[data-menu-toggle]');
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      lastFocused = document.activeElement;
      const first = menu.querySelector('a[href]');
      if (first) first.focus();
    } else if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
      lastFocused = null;
    }
  }
  document.addEventListener('click', function (e) {
    const menu = document.getElementById('mobile-menu');
    if (!menu) return;
    if (e.target.closest('[data-menu-toggle]')) {
      e.preventDefault();
      setOpen(menu, menu.getAttribute('data-open') !== 'true');
    } else if (e.target.closest('#mobile-menu a')) {
      setOpen(menu, false);
    }
  });
  document.addEventListener('keydown', function (e) {
    const menu = document.getElementById('mobile-menu');
    if (!menu) return;
    if (menu.getAttribute('data-open') !== 'true') return;
    if (e.key === 'Escape') { setOpen(menu, false); return; }
    if (e.key === 'Tab') trapTab(menu, e);
  });
  window.addEventListener('resize', function () {
    const menu = document.getElementById('mobile-menu');
    if (!menu) return;
    if (window.innerWidth > 900 && menu.getAttribute('data-open') === 'true') setOpen(menu, false);
  });
})();

// Docs sidebar (mobile drawer)
(function () {
  let lastFocused = null;
  // Below 860px the sidebar becomes an off-canvas drawer (see DocPage.astro);
  // keep it out of the closed tab order there so it can't be focused while
  // it's translated off-screen. Above 860px it's the always-visible sidebar.
  function applyInert(nav) {
    const isMobile = window.matchMedia('(max-width: 860px)').matches;
    nav.inert = isMobile && nav.getAttribute('data-open') !== 'true';
  }
  function setOpen(nav, btn, open) {
    nav.setAttribute('data-open', open ? 'true' : 'false');
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('docs-nav-open', open);
    applyInert(nav);
    if (open) {
      lastFocused = document.activeElement;
      const first = nav.querySelector('a[href]');
      if (first) first.focus();
    } else if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
      lastFocused = null;
    }
  }
  document.addEventListener('click', function (e) {
    const nav = document.querySelector('[data-docs-nav]');
    const btn = document.querySelector('[data-docs-nav-toggle]');
    if (!nav) return;
    if (e.target.closest('[data-docs-nav-toggle]')) {
      e.preventDefault();
      setOpen(nav, btn, nav.getAttribute('data-open') !== 'true');
    } else if (e.target.closest('[data-docs-nav] a')) {
      setOpen(nav, btn, false);
    }
  });
  document.addEventListener('keydown', function (e) {
    const nav = document.querySelector('[data-docs-nav]');
    const btn = document.querySelector('[data-docs-nav-toggle]');
    if (!nav) return;
    if (nav.getAttribute('data-open') !== 'true') return;
    if (e.key === 'Escape') { setOpen(nav, btn, false); return; }
    if (e.key === 'Tab') trapTab(nav, e);
  });
  window.addEventListener('resize', function () {
    const nav = document.querySelector('[data-docs-nav]');
    const btn = document.querySelector('[data-docs-nav-toggle]');
    if (!nav) return;
    if (window.innerWidth > 860 && nav.getAttribute('data-open') === 'true') setOpen(nav, btn, false);
    else applyInert(nav);
  });
  // Initial state: inert while off-canvas on mobile, and scroll the current
  // page link into view inside the sidebar on load.
  const nav = document.querySelector('[data-docs-nav]');
  if (nav) {
    applyInert(nav);
    const current = nav.querySelector('a[aria-current="page"]');
    if (current && typeof current.scrollIntoView === 'function') {
      requestAnimationFrame(() => current.scrollIntoView({ block: 'center' }));
    }
  }
})();

// Search palette — client-side over /search.json
(function () {
  let CORPUS = null;
  let loadingPromise = null;
  let lastFocused = null;

  function loadCorpus() {
    if (CORPUS) return Promise.resolve(CORPUS);
    if (loadingPromise) return loadingPromise;
    loadingPromise = fetch('/search.json', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        CORPUS = data;
        return data;
      })
      .catch(() => {
        CORPUS = [];
        return [];
      });
    return loadingPromise;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
  }

  function pillClass(type, group) {
    if (type === 'agent') return 'warn';
    if (group === 'phx') return 'accent';
    if (group === 'lv') return 'violet';
    if (group === 'ecto') return 'info';
    return '';
  }

  function render(q, container, status) {
    const query = q.trim().toLowerCase();
    if (!CORPUS) return;
    const matches = !query
      ? CORPUS.slice(0, 10)
      : CORPUS.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.desc.toLowerCase().includes(query) ||
            item.group.toLowerCase().includes(query)
        ).slice(0, 30);

    if (status) {
      status.textContent = query
        ? matches.length + ' result' + (matches.length === 1 ? '' : 's') + ' for "' + q.trim() + '"'
        : matches.length + ' suggestion' + (matches.length === 1 ? '' : 's');
    }

    if (matches.length === 0) {
      container.innerHTML =
        '<div class="search-empty">No results for &ldquo;' + escapeHtml(q) + '&rdquo;</div>';
      return;
    }

    const groups = { skill: [], agent: [], page: [] };
    matches.forEach((m) => (groups[m.type] || (groups[m.type] = [])).push(m));
    const labels = { skill: 'Skills', agent: 'Agents', page: 'Pages' };

    let html = '';
    let renderedIndex = 0;
    ['skill', 'agent', 'page'].forEach((t) => {
      if (!groups[t] || !groups[t].length) return;
      html += '<div class="search-group-label">' + labels[t] + '</div>';
      groups[t].forEach((item) => {
        const cls = pillClass(item.type, item.group);
        html +=
          '<a class="search-item" href="' +
          escapeHtml(item.url) +
          '" data-index="' +
          renderedIndex++ +
          '">' +
          (cls ? '<span class="pill pill-' + cls + '">' + escapeHtml(item.group) + '</span>' : '<span class="pill">' + escapeHtml(item.group) + '</span>') +
          '<span class="search-name">' +
          escapeHtml(item.type === 'skill' && item.name.indexOf(':') !== -1 ? '/' + item.name : item.name) +
          '</span>' +
          '<span class="search-desc">' +
          escapeHtml(item.desc) +
          '</span>' +
          '</a>';
      });
    });
    container.innerHTML = html;
  }

  function getEls() {
    const overlay = document.getElementById('search-overlay');
    if (!overlay) return null;
    const input = overlay.querySelector('[data-search-input]');
    const results = overlay.querySelector('[data-search-results]');
    const status = overlay.querySelector('[data-search-status]');
    return { overlay, input, results, status };
  }

  function open() {
    const els = getEls();
    if (!els) return;
    lastFocused = document.activeElement;
    els.overlay.setAttribute('data-open', 'true');
    document.body.classList.add('menu-open');
    if (els.input) els.input.value = '';
    if (els.results) els.results.innerHTML = '<div class="search-empty">Loading…</div>';
    loadCorpus().then(() => {
      render('', els.results, els.status);
      setTimeout(() => els.input && els.input.focus(), 30);
    });
  }
  function close() {
    const els = getEls();
    if (!els) return;
    els.overlay.setAttribute('data-open', 'false');
    document.body.classList.remove('menu-open');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    lastFocused = null;
  }

  document.addEventListener('click', function (e) {
    const els = getEls();
    if (!els) return;
    if (e.target.closest('[data-search-open]')) {
      e.preventDefault();
      open();
    } else if (e.target === els.overlay || e.target.closest('[data-search-close]')) {
      close();
    }
  });

  document.addEventListener('keydown', function (e) {
    const els = getEls();
    if (!els) return;
    const isOpen = els.overlay.getAttribute('data-open') === 'true';
    if (isOpen && e.key === 'Tab') trapTab(els.overlay, e);
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      isOpen ? close() : open();
    } else if (e.key === 'Escape' && isOpen) {
      close();
    } else if (e.key === '/' && !isOpen) {
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      e.preventDefault();
      open();
    } else if (isOpen && e.key === 'Enter' && document.activeElement === els.input) {
      const top = els.results.querySelector('[data-index="0"]');
      if (top) { e.preventDefault(); top.click(); }
    } else if (isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      const items = els.results.querySelectorAll('.search-item');
      if (!items.length) return;
      const idx = Array.prototype.indexOf.call(items, document.activeElement);
      e.preventDefault();
      if (e.key === 'ArrowDown') {
        if (document.activeElement === els.input) items[0].focus();
        else if (idx > -1 && idx < items.length - 1) items[idx + 1].focus();
      } else {
        if (idx === 0) els.input.focus();
        else if (idx > 0) items[idx - 1].focus();
      }
    }
  });

  // Input handler — wire once on first open. Use event delegation so dev HMR doesn't re-bind.
  document.addEventListener('input', function (e) {
    const target = e.target;
    if (!target || !target.matches || !target.matches('[data-search-input]')) return;
    const els = getEls();
    if (els && els.results) render(target.value, els.results, els.status);
  });
})();

// GitHub stars widget — deferred to idle to keep critical path light
(function () {
  const widgets = document.querySelectorAll('[data-gh-stars]');
  if (!widgets.length) return;
  const idle = window.requestIdleCallback || function (cb) { return setTimeout(cb, 400); };
  idle(initGhStars);

  function initGhStars() {
  const REPO = 'oliver-kriska/claude-elixir-phoenix';
  const CACHE_KEY = 'phx.gh.stars.v1';
  const CACHE_TTL = 1000 * 60 * 30;

  function format(n) {
    if (n >= 10000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
  }
  function render(count) {
    widgets.forEach((w) => {
      const out = w.querySelector('[data-gh-count]');
      if (out) out.textContent = format(count);
      w.setAttribute('data-loaded', 'true');
    });
  }
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.t < CACHE_TTL) {
        render(parsed.v);
        return;
      }
    }
  } catch (e) {}

  fetch('https://api.github.com/repos/' + REPO, { headers: { Accept: 'application/vnd.github+json' } })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (!data || typeof data.stargazers_count !== 'number') return;
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ v: data.stargazers_count, t: Date.now() }));
      } catch (e) {}
      render(data.stargazers_count);
    })
    .catch(() => {});
  }
})();

// Copy buttons — aria-live so the "Copy" -> "Copied" text swap is announced.
document.querySelectorAll('[data-copy]').forEach((btn) => btn.setAttribute('aria-live', 'polite'));
document.addEventListener('click', function (e) {
  const btn = e.target.closest('[data-copy]');
  if (!btn) return;
  const sel = btn.getAttribute('data-copy');
  let text;
  if (sel) {
    const el = document.querySelector(sel);
    if (!el) return;
    text = el.innerText;
  } else {
    const block = btn.closest('.code-block');
    if (!block) return;
    const pre = block.querySelector('pre');
    text = pre ? pre.innerText : '';
  }
  navigator.clipboard
    .writeText(text)
    .then(() => {
      const orig = btn.textContent;
      btn.textContent = 'Copied';
      setTimeout(() => (btn.textContent = orig), 1200);
    })
    .catch(() => {});
});

// Detail-page enhancements: copy buttons on rendered code + heading anchors.
// Runs only where doc content exists (skill/agent pages); no-op elsewhere.
(function () {
  const body = document.querySelector('.docs-body');
  if (!body) return;

  // Copy buttons on rendered <pre> and the synopsis. Skip hand-authored
  // .code-block blocks (install/index), which already carry their own.
  const pres = Array.from(document.querySelectorAll('.docs-body pre, pre.synopsis'))
    .filter((pre) => !pre.closest('.code-block'));
  pres.forEach((pre) => {
    if (pre.dataset.copyReady) return;
    pre.dataset.copyReady = '1';
    const original = pre.innerText;
    pre.classList.add('has-copy');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-copy';
    btn.textContent = 'Copy';
    btn.setAttribute('aria-label', 'Copy code');
    btn.setAttribute('aria-live', 'polite');
    btn.addEventListener('click', () => {
      navigator.clipboard
        .writeText(original)
        .then(() => {
          btn.textContent = 'Copied';
          setTimeout(() => (btn.textContent = 'Copy'), 1200);
        })
        .catch(() => {});
    });
    pre.appendChild(btn);
  });

  // Hover/focus-revealed anchor link on each section heading (ids emitted at build).
  body.querySelectorAll('h3[id], h4[id]').forEach((h) => {
    if (h.querySelector('.heading-anchor')) return;
    const a = document.createElement('a');
    a.className = 'heading-anchor';
    a.href = '#' + h.id;
    a.textContent = '#';
    a.setAttribute('aria-label', 'Link to this section');
    h.appendChild(a);
  });
})();
