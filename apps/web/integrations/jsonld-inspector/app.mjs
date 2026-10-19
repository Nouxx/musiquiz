// Dev toolbar app: lists every <script type="application/ld+json"> on the
// current page, pretty-prints it and flags problems. Runs only in your browser.
import { defineToolbarApp } from 'astro/toolbar';
import { validatePage } from './validate.mjs';

const STYLES = `
  :host { --err:#f87171; --warn:#fbbf24; --info:#60a5fa; --ok:#4ade80; --muted:#9ca3af; --line:rgba(255,255,255,.1); }
  .jl-window { width:min(760px, calc(100vw - 32px)); max-height:min(72vh, 820px); overflow:auto; padding:0; }
  .jl-head { position:sticky; top:0; z-index:1; display:flex; flex-wrap:wrap; align-items:center; gap:8px; padding:14px 16px; background:rgb(19,21,26); border-bottom:1px solid var(--line); }
  .jl-head h1 { font-size:15px; margin:0 auto 0 0; font-weight:600; color:#fff; }
  .jl-count { font-size:12px; padding:2px 8px; border-radius:999px; border:1px solid var(--line); color:var(--muted); }
  .jl-count.error { color:var(--err); border-color:color-mix(in srgb, var(--err) 40%, transparent); }
  .jl-count.warning { color:var(--warn); border-color:color-mix(in srgb, var(--warn) 40%, transparent); }
  .jl-count.ok { color:var(--ok); border-color:color-mix(in srgb, var(--ok) 40%, transparent); }
  .jl-check { display:flex; align-items:center; gap:6px; font-size:12px; color:var(--muted); cursor:pointer; user-select:none; }
  .jl-body { padding:12px 16px 16px; display:flex; flex-direction:column; gap:12px; }
  .jl-empty { color:var(--muted); font-size:13px; padding:8px 0; line-height:1.5; }
  .jl-empty code { color:#e5e7eb; }
  .jl-block { border:1px solid var(--line); border-radius:8px; overflow:hidden; }
  .jl-block-head { display:flex; align-items:center; gap:8px; padding:10px 12px; background:rgba(255,255,255,.03); }
  .jl-block-title { font-size:13px; font-weight:600; color:#fff; margin-right:auto; overflow-wrap:anywhere; }
  .jl-block-title span { color:var(--muted); font-weight:400; }
  .jl-issues { list-style:none; margin:0; padding:4px 12px 8px; display:flex; flex-direction:column; }
  .jl-issue { display:grid; grid-template-columns:14px 1fr; gap:8px; font-size:12.5px; line-height:1.45; padding:5px 0; border-top:1px solid var(--line); }
  .jl-issue:first-child { border-top:0; }
  .jl-dot { width:8px; height:8px; border-radius:50%; margin-top:5px; }
  .jl-dot.error { background:var(--err); } .jl-dot.warning { background:var(--warn); } .jl-dot.info { background:var(--info); }
  .jl-path { display:block; font:11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace; color:var(--muted); overflow-wrap:anywhere; }
  .jl-msg { color:#e5e7eb; overflow-wrap:anywhere; }
  details { border-top:1px solid var(--line); }
  summary { cursor:pointer; padding:8px 12px; font-size:12px; color:var(--muted); }
  summary:hover { color:#fff; }
  pre { margin:0; padding:10px 12px 14px; font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace; color:#e5e7eb; white-space:pre-wrap; overflow-wrap:anywhere; max-height:420px; overflow:auto; }
  .k { color:#c4b5fd; } .s { color:#86efac; } .n { color:#fdba74; } .b { color:#f9a8d4; }
  .jl-hidden-info .jl-issue.info { display:none; }
`;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function highlight(json) {
  return esc(json).replace(
    /(&quot;(?:\\u[a-fA-F0-9]{4}|\\[^u]|(?!&quot;).)*?&quot;)(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g,
    (m, str, colon, lit) => {
      if (str) return colon ? `<span class="k">${str}</span>${colon}` : `<span class="s">${str}</span>`;
      if (lit) return `<span class="b">${m}</span>`;
      return `<span class="n">${m}</span>`;
    },
  );
}

function plural(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

export default defineToolbarApp({
  init(canvas, app) {
    let showInfo = false;
    try { showInfo = localStorage.getItem('jsonld-inspector:info') === '1'; } catch {}

    const style = document.createElement('style');
    style.textContent = STYLES;
    const win = document.createElement('astro-dev-toolbar-window');
    win.className = 'jl-window';
    canvas.append(style, win);

    function scan() {
      const scripts = [...document.querySelectorAll('script[type="application/ld+json"]')];
      const result = validatePage(scripts.map((s) => s.textContent ?? ''), { env: 'dev' });
      render(result);

      const { error, warning } = result.counts;
      if (error) app.toggleNotification({ state: true, level: 'error' });
      else if (warning) app.toggleNotification({ state: true, level: 'warning' });
      else app.toggleNotification({ state: false });
    }

    function render(result) {
      const { blocks, counts } = result;
      win.replaceChildren();

      // Header
      const head = document.createElement('div');
      head.className = 'jl-head';
      const badges = [];
      if (blocks.length) {
        if (counts.error) badges.push(`<span class="jl-count error">${plural(counts.error, 'error')}</span>`);
        if (counts.warning) badges.push(`<span class="jl-count warning">${plural(counts.warning, 'warning')}</span>`);
        if (!counts.error && !counts.warning) badges.push(`<span class="jl-count ok">No problems</span>`);
      }
      head.innerHTML = `<h1>JSON-LD · ${plural(blocks.length, 'block')}</h1>${badges.join('')}
        <label class="jl-check"><input type="checkbox" ${showInfo ? 'checked' : ''}> Tips (${counts.info})</label>`;
      head.querySelector('input').addEventListener('change', (e) => {
        showInfo = e.currentTarget.checked;
        try { localStorage.setItem('jsonld-inspector:info', showInfo ? '1' : '0'); } catch {}
        body.classList.toggle('jl-hidden-info', !showInfo);
      });
      const rescan = document.createElement('astro-dev-toolbar-button');
      rescan.textContent = 'Rescan';
      rescan.buttonStyle = 'gray';
      rescan.addEventListener('click', scan);
      head.append(rescan);
      win.append(head);

      // Body
      const body = document.createElement('div');
      body.className = 'jl-body' + (showInfo ? '' : ' jl-hidden-info');
      win.append(body);

      if (!blocks.length) {
        body.innerHTML = `<p class="jl-empty">No <code>&lt;script type="application/ld+json"&gt;</code> found on this page.</p>`;
        return;
      }

      for (const block of blocks) {
        const el = document.createElement('section');
        el.className = 'jl-block';
        const types = block.types.length ? block.types.join(', ') : block.data === undefined ? 'invalid JSON' : 'no @type';
        const pretty = block.data === undefined ? block.raw.trim() : JSON.stringify(block.data, null, 2);

        const visible = block.issues.filter((i) => i.level !== 'info').length;
        const issuesHtml = block.issues.map((i) => `
          <li class="jl-issue ${i.level}"><span class="jl-dot ${i.level}" title="${i.level}"></span>
            <div><span class="jl-msg">${esc(i.message)}</span><span class="jl-path">${esc(i.path)}</span></div></li>`).join('');

        el.innerHTML = `
          <div class="jl-block-head"><div class="jl-block-title">#${block.index + 1} <span>${esc(types)}</span></div></div>
          ${block.issues.length ? `<ul class="jl-issues">${issuesHtml}</ul>` : ''}
          <details ${blocks.length === 1 || visible ? 'open' : ''}><summary>Source (${pretty.split('\n').length} lines)</summary>
            <pre>${block.data === undefined ? esc(pretty) : highlight(pretty)}</pre></details>`;

        const copy = document.createElement('astro-dev-toolbar-button');
        copy.textContent = 'Copy';
        copy.buttonStyle = 'ghost';
        copy.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(pretty);
            copy.textContent = 'Copied';
          } catch {
            copy.textContent = 'Copy failed';
          }
          setTimeout(() => (copy.textContent = 'Copy'), 1500);
        });
        el.querySelector('.jl-block-head').append(copy);
        body.append(el);
      }
    }

    scan();
    app.onToggled(({ state }) => { if (state) scan(); });
    // Re-scan after client-side navigation (View Transitions / ClientRouter).
    document.addEventListener('astro:page-load', scan);
  },
});
