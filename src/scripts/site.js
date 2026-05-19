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

document.addEventListener('click', function (e) {
  const btn = e.target.closest('[data-theme-toggle]');
  if (!btn) return;
  const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const next = cur === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem('phx.theme', next); } catch (e) {}
});

// Mobile menu
(function () {
  function setOpen(menu, open) {
    menu.setAttribute('data-open', open ? 'true' : 'false');
    document.body.classList.toggle('menu-open', open);
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
    if (e.key === 'Escape' && menu.getAttribute('data-open') === 'true') setOpen(menu, false);
  });
  window.addEventListener('resize', function () {
    const menu = document.getElementById('mobile-menu');
    if (!menu) return;
    if (window.innerWidth > 900 && menu.getAttribute('data-open') === 'true') setOpen(menu, false);
  });
})();

// Search palette — client-side over /search.json
(function () {
  let CORPUS = null;
  let loadingPromise = null;

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

  function render(q, container) {
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

    if (matches.length === 0) {
      container.innerHTML =
        '<div class="search-empty">No results for &ldquo;' + escapeHtml(q) + '&rdquo;</div>';
      return;
    }

    const groups = { skill: [], agent: [], page: [] };
    matches.forEach((m) => (groups[m.type] || (groups[m.type] = [])).push(m));
    const labels = { skill: 'Skills', agent: 'Agents', page: 'Pages' };

    let html = '';
    ['skill', 'agent', 'page'].forEach((t) => {
      if (!groups[t] || !groups[t].length) return;
      html += '<div class="search-group-label">' + labels[t] + '</div>';
      groups[t].forEach((item, i) => {
        const cls = pillClass(item.type, item.group);
        html +=
          '<a class="search-item" href="' +
          escapeHtml(item.url) +
          '" data-index="' +
          (i === 0 && t === 'skill' ? '0' : '') +
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
    return { overlay, input, results };
  }

  function open() {
    const els = getEls();
    if (!els) return;
    els.overlay.setAttribute('data-open', 'true');
    document.body.classList.add('menu-open');
    if (els.input) els.input.value = '';
    if (els.results) els.results.innerHTML = '<div class="search-empty">Loading…</div>';
    loadCorpus().then(() => {
      render('', els.results);
      setTimeout(() => els.input && els.input.focus(), 30);
    });
  }
  function close() {
    const els = getEls();
    if (!els) return;
    els.overlay.setAttribute('data-open', 'false');
    document.body.classList.remove('menu-open');
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
    }
  });

  // Input handler — wire once on first open. Use event delegation so dev HMR doesn't re-bind.
  document.addEventListener('input', function (e) {
    const target = e.target;
    if (!target || !target.matches || !target.matches('[data-search-input]')) return;
    const els = getEls();
    if (els && els.results) render(target.value, els.results);
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

// Copy buttons
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
