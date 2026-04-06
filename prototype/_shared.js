/* ============================================================
   GammaHR v2 — Shared JavaScript Foundation
   All pages include this after _tokens.css
   ============================================================ */

'use strict';

window.GHR = window.GHR || {};

/* ── THEME PERSISTENCE ─────────────────────────────────────── */
(function() {
  var saved = localStorage.getItem('ghr-theme');
  if (saved === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else if (saved === 'system') {
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
  // Listen for OS preference change when system mode is active
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
      if (localStorage.getItem('ghr-theme') === 'system') {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    });
  }
})();

/* ── A. TOAST SYSTEM ──────────────────────────────────────── */
GHR.showToast = function(type, title, message) {
  var icons = {
    success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    error:   '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info:    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };

  // Ensure container exists
  var container = document.getElementById('ghToastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'ghToastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  var toast = document.createElement('div');
  toast.className = 'toast toast-' + (type || 'info');
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML =
    '<div class="toast-icon">' + (icons[type] || icons.info) + '</div>' +
    '<div class="toast-content">' +
      '<div class="toast-title">' + (title || '') + '</div>' +
      (message ? '<div class="toast-message">' + message + '</div>' : '') +
    '</div>' +
    '<button class="toast-close" aria-label="Dismiss">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
    '</button>';

  container.appendChild(toast);

  function removeToast() {
    toast.classList.add('removing');
    setTimeout(function() {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 250);
  }

  toast.querySelector('.toast-close').addEventListener('click', removeToast);

  var timer = setTimeout(removeToast, 3500);
  toast.addEventListener('mouseenter', function() { clearTimeout(timer); });
  toast.addEventListener('mouseleave', function() { timer = setTimeout(removeToast, 1500); });
};


/* ── B. HOVER MINI-PROFILE CARD ──────────────────────────── */
GHR.initHoverCard = function() {
  var card = document.getElementById('ghrHoverCard');
  if (!card) {
    card = document.createElement('div');
    card.id = 'ghrHoverCard';
    card.className = 'hover-card';
    card.innerHTML =
      '<div class="hc-header">' +
        '<div class="hc-avatar avatar avatar-md" id="hcAvatar"></div>' +
        '<div class="hc-info">' +
          '<div class="hc-name" id="hcName"></div>' +
          '<div class="hc-role" id="hcRole"></div>' +
          '<div class="hc-dept" id="hcDept"></div>' +
        '</div>' +
      '</div>' +
      '<div class="hc-project" id="hcProject"></div>' +
      '<div class="hc-worktime">' +
        '<div class="hc-worktime-label">' +
          '<span>Work Time</span>' +
          '<span id="hcWorktimePct" class="worktime-pct"></span>' +
        '</div>' +
        '<div class="worktime-bar" style="margin-top:4px;">' +
          '<div class="worktime-fill" id="hcWorktimeFill" style="width:0%"></div>' +
        '</div>' +
      '</div>' +
      '<a class="hc-link btn btn-ghost btn-sm" id="hcLink" style="margin-top:12px;width:100%;justify-content:center;">View Profile →</a>';
    document.body.appendChild(card);
  }

  var showTimer = null;
  var hideTimer = null;
  var currentAnchor = null;

  function show(anchor, e) {
    clearTimeout(hideTimer);
    if (currentAnchor === anchor && card.classList.contains('visible')) return;
    currentAnchor = anchor;

    clearTimeout(showTimer);
    showTimer = setTimeout(function() {
      // Populate card
      var name = anchor.getAttribute('data-name') || anchor.textContent.trim();
      var role = anchor.getAttribute('data-role') || '';
      var dept = anchor.getAttribute('data-dept') || '';
      var project = anchor.getAttribute('data-project') || '';
      var worktime = parseInt(anchor.getAttribute('data-worktime') || '0', 10);
      var href = anchor.getAttribute('data-href') || anchor.href || '#';
      var color = anchor.getAttribute('data-color') || '';

      document.getElementById('hcName').textContent = name;
      document.getElementById('hcRole').textContent = role;
      document.getElementById('hcDept').textContent = dept;

      var avatarEl = document.getElementById('hcAvatar');
      avatarEl.textContent = GHR.avatarInitials(name);
      avatarEl.style.background = color || GHR.avatarColor(name);

      var projEl = document.getElementById('hcProject');
      if (project) {
        projEl.style.display = '';
        projEl.innerHTML = '<span style="font-size:0.75rem;color:var(--color-text-3);">Project: </span><span style="font-size:0.75rem;color:var(--color-text-2);">' + project + '</span>';
      } else {
        projEl.style.display = 'none';
      }

      var pct = Math.min(worktime, 120);
      document.getElementById('hcWorktimePct').textContent = worktime + '%';
      var fill = document.getElementById('hcWorktimeFill');
      fill.style.width = Math.min(pct, 100) + '%';
      fill.className = 'worktime-fill' + (worktime > 100 ? ' overflow' : worktime >= 80 ? ' high' : worktime >= 60 ? ' mid' : ' low');

      document.getElementById('hcLink').href = href;

      // Position card
      var vw = window.innerWidth;
      var vh = window.innerHeight;
      var cx = e.clientX;
      var cy = e.clientY;
      var cardW = 280;
      var cardH = 200;
      var left = cx + 12;
      var top = cy - 20;
      if (left + cardW > vw - 16) left = cx - cardW - 12;
      if (top + cardH > vh - 16) top = vh - cardH - 16;
      if (top < 8) top = 8;

      card.style.left = left + 'px';
      card.style.top = top + 'px';
      card.classList.add('visible');
    }, 200);
  }

  function hide() {
    clearTimeout(showTimer);
    hideTimer = setTimeout(function() {
      card.classList.remove('visible');
      currentAnchor = null;
    }, 150);
  }

  document.addEventListener('mouseenter', function(e) {
    var anchor = e.target && e.target.closest ? e.target.closest('[data-hovercard]') : null;
    if (anchor) show(anchor, e);
  }, true);

  document.addEventListener('mouseleave', function(e) {
    var anchor = e.target && e.target.closest ? e.target.closest('[data-hovercard]') : null;
    if (anchor) hide();
  }, true);

  card.addEventListener('mouseenter', function() { clearTimeout(hideTimer); });
  card.addEventListener('mouseleave', hide);
};


/* ── C. REAL-TIME PRESENCE SIMULATION ────────────────────── */
GHR.initPresence = function() {
  var employees = {
    'sarah-chen':   { name: 'Sarah Chen',    status: 'online'  },
    'john-smith':   { name: 'John Smith',     status: 'online'  },
    'alice-wang':   { name: 'Alice Wang',     status: 'on-leave' },
    'carol-kim':    { name: 'Carol Kim',      status: 'away'    },
    'david-park':   { name: 'David Park',     status: 'online'  },
    'marco-rossi':  { name: 'Marco Rossi',    status: 'busy'    },
    'emma-laurent': { name: 'Emma Laurent',   status: 'online'  },
    'bob-taylor':   { name: 'Bob Taylor',     status: 'away'    }
  };

  var activeStatuses = ['online', 'away', 'busy'];

  function updatePresenceDots() {
    for (var id in employees) {
      var emp = employees[id];
      var els = document.querySelectorAll('[data-presence="' + id + '"]');
      for (var i = 0; i < els.length; i++) {
        els[i].classList.remove('presence-online', 'presence-away', 'presence-busy', 'presence-leave');
        els[i].classList.add('presence-' + emp.status.replace('-', '-'));
      }
    }
  }

  function rotateStatuses() {
    for (var id in employees) {
      if (employees[id].status === 'on-leave') continue;
      // ~30% chance of status change each cycle
      if (Math.random() < 0.3) {
        employees[id].status = activeStatuses[Math.floor(Math.random() * activeStatuses.length)];
      }
    }
    updatePresenceDots();
    var next = 15000 + Math.random() * 30000;
    setTimeout(rotateStatuses, next);
  }

  updatePresenceDots();
  var firstRotate = 15000 + Math.random() * 30000;
  setTimeout(rotateStatuses, firstRotate);

  // "Currently viewing" banner
  var activeViewers = Object.keys(employees).filter(function(id) {
    return employees[id].status !== 'on-leave';
  });

  var bannerDismissed = false;
  var currentBannerEmployee = null;

  function showViewerBanner() {
    if (bannerDismissed) return;
    var existing = document.getElementById('ghrPresenceBanner');
    if (existing) existing.remove();

    var idx = Math.floor(Math.random() * activeViewers.length);
    var empId = activeViewers[idx];
    var emp = employees[empId];
    currentBannerEmployee = emp;

    var main = document.querySelector('main') || document.querySelector('.page-content') || document.querySelector('.main-wrapper');
    if (!main) return;

    var banner = document.createElement('div');
    banner.id = 'ghrPresenceBanner';
    banner.className = 'presence-banner';
    banner.innerHTML =
      '<div class="avatar avatar-sm" style="background:' + GHR.avatarColor(emp.name) + ';flex-shrink:0;">' +
        GHR.avatarInitials(emp.name) +
      '</div>' +
      '<span style="flex:1;color:var(--color-text-2);font-size:0.8125rem;">' +
        '<strong style="color:var(--color-text-1);">' + emp.name + '</strong> is also viewing this page' +
      '</span>' +
      '<button style="background:none;border:none;color:var(--color-text-3);cursor:pointer;padding:4px;line-height:1;" aria-label="Dismiss">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '</button>';

    banner.querySelector('button').addEventListener('click', function() {
      banner.remove();
      bannerDismissed = true;
    });

    main.insertBefore(banner, main.firstChild);
  }

  // Show after 3s initial delay, then rotate every 30s
  setTimeout(function() {
    showViewerBanner();
    setInterval(function() {
      if (!bannerDismissed) showViewerBanner();
    }, 30000);
  }, 3000);
};


/* ── D. ROLE SWITCHER ─────────────────────────────────────── */
GHR.currentRole = localStorage.getItem('ghrRole') || 'admin';

GHR.setRole = function(role) {
  GHR.currentRole = role;
  localStorage.setItem('ghrRole', role);
  document.body.setAttribute('data-role', role);
  GHR._applyRoleVisibility(role);
  document.dispatchEvent(new CustomEvent('rolechange', { detail: { role: role } }));
};

GHR._applyRoleVisibility = function(role) {
  // Min-role gating
  var adminOnly = document.querySelectorAll('[data-min-role="admin"]');
  for (var i = 0; i < adminOnly.length; i++) {
    adminOnly[i].style.display = (role === 'admin') ? '' : 'none';
  }
  var pmPlus = document.querySelectorAll('[data-min-role="pm"]');
  for (var i = 0; i < pmPlus.length; i++) {
    pmPlus[i].style.display = (role === 'admin' || role === 'pm') ? '' : 'none';
  }

  // Employee role: hide sensitive data
  var sensitiveTypes = ['financials', 'billing', 'salary'];
  for (var s = 0; s < sensitiveTypes.length; s++) {
    var els = document.querySelectorAll('[data-sensitive="' + sensitiveTypes[s] + '"]');
    for (var j = 0; j < els.length; j++) {
      els[j].style.display = (role === 'employee') ? 'none' : '';
    }
  }
};

GHR.initRoleSwitcher = function() {
  // Apply current role immediately
  document.body.setAttribute('data-role', GHR.currentRole);
  GHR._applyRoleVisibility(GHR.currentRole);

  // Inject role switcher widget into sidebar footer area
  var footer = document.querySelector('.sidebar-footer');
  if (!footer || document.getElementById('ghrRoleSwitcher')) return;

  var roleLabels = { admin: 'Admin', pm: 'Project Manager', employee: 'Employee' };
  var roleBadgeClass = { admin: 'role-badge-admin', pm: 'role-badge-pm', employee: 'role-badge-employee' };

  var widget = document.createElement('div');
  widget.id = 'ghrRoleSwitcher';
  widget.style.padding = '8px';

  function renderWidget() {
    widget.innerHTML =
      '<div class="role-switcher" id="ghrRoleTrigger" title="Switch role (demo)">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a4 4 0 018 0v2"/></svg>' +
        '<span class="' + (roleBadgeClass[GHR.currentRole] || '') + '" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' +
          roleLabels[GHR.currentRole] +
        '</span>' +
        '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>' +
      '</div>' +
      '<div id="ghrRoleMenu" style="display:none;margin-top:4px;background:var(--color-surface-3);border:1px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden;">' +
        ['admin', 'pm', 'employee'].map(function(r) {
          return '<button style="display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;background:' +
            (GHR.currentRole === r ? 'var(--color-primary-muted)' : 'none') +
            ';border:none;color:' +
            (GHR.currentRole === r ? 'var(--color-primary)' : 'var(--color-text-1)') +
            ';font-size:0.75rem;font-family:var(--font-sans);cursor:pointer;text-align:left;" data-role-opt="' + r + '">' +
            roleLabels[r] +
          '</button>';
        }).join('') +
      '</div>';

    widget.querySelector('#ghrRoleTrigger').addEventListener('click', function(e) {
      e.stopPropagation();
      var menu = document.getElementById('ghrRoleMenu');
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });

    widget.querySelectorAll('[data-role-opt]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        GHR.setRole(this.getAttribute('data-role-opt'));
        renderWidget();
        GHR.showToast('info', 'Role switched', 'Now viewing as: ' + roleLabels[GHR.currentRole]);
      });
    });
  }

  renderWidget();
  footer.insertBefore(widget, footer.firstChild);

  // Close menu on outside click
  document.addEventListener('click', function() {
    var menu = document.getElementById('ghrRoleMenu');
    if (menu) menu.style.display = 'none';
  });
};


/* ── E. KEYBOARD SHORTCUTS ───────────────────────────────── */
GHR.initKeyboardShortcuts = function() {
  var gPending = false;
  var gTimer = null;

  var gKeyMap = {
    'd': 'index.html',
    't': 'timesheets.html',
    'l': 'leaves.html',
    'e': 'expenses.html',
    'p': 'projects.html',
    'c': 'clients.html',
    'i': 'invoices.html',
    'a': 'approvals.html',
    'n': 'insights.html',
    'g': 'gantt.html',
    'r': 'planning.html',
    'h': 'hr.html',
    's': 'admin.html'
  };

  var shortcutsData = [
    { key: 'G → D', desc: 'Go to Dashboard' },
    { key: 'G → T', desc: 'Go to Timesheets' },
    { key: 'G → L', desc: 'Go to Leaves' },
    { key: 'G → E', desc: 'Go to Expenses' },
    { key: 'G → P', desc: 'Go to Projects' },
    { key: 'G → C', desc: 'Go to Clients' },
    { key: 'G → I', desc: 'Go to Invoices' },
    { key: 'G → A', desc: 'Go to Approvals' },
    { key: 'G → N', desc: 'Go to Insights' },
    { key: 'G → G', desc: 'Go to Gantt' },
    { key: 'G → R', desc: 'Go to Planning' },
    { key: 'G → H', desc: 'Go to HR' },
    { key: 'G → S', desc: 'Go to Admin/Settings' },
    { key: '⌘K / Ctrl+K', desc: 'Open command palette' },
    { key: '⌘N / Ctrl+N', desc: 'Create new item' },
    { key: '?', desc: 'Show this shortcuts panel' },
    { key: 'Esc', desc: 'Close modal / panel / palette' }
  ];

  function ensureShortcutsPanel() {
    var panel = document.getElementById('shortcutsPanel');
    if (panel) return panel;

    panel = document.createElement('div');
    panel.id = 'shortcutsPanel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Keyboard shortcuts');

    var half = Math.ceil(shortcutsData.length / 2);
    var col1 = shortcutsData.slice(0, half);
    var col2 = shortcutsData.slice(half);

    function renderCol(arr) {
      return arr.map(function(s) {
        return '<div class="shortcut-row">' +
          '<kbd class="shortcut-key">' + s.key + '</kbd>' +
          '<span style="font-size:0.8125rem;color:var(--color-text-2);">' + s.desc + '</span>' +
        '</div>';
      }).join('');
    }

    panel.innerHTML =
      '<div class="shortcuts-modal">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">' +
          '<h3 style="font-size:1rem;font-weight:600;color:var(--color-text-1);">Keyboard Shortcuts</h3>' +
          '<button id="shortcutsPanelClose" style="background:none;border:none;color:var(--color-text-3);cursor:pointer;padding:4px;" aria-label="Close">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 32px;">' +
          '<div>' + renderCol(col1) + '</div>' +
          '<div>' + renderCol(col2) + '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(panel);

    panel.querySelector('#shortcutsPanelClose').addEventListener('click', function() {
      panel.classList.remove('open');
    });
    panel.addEventListener('click', function(e) {
      if (e.target === panel) panel.classList.remove('open');
    });

    return panel;
  }

  function closeAll() {
    // Close modals
    var backdrop = document.querySelector('.modal-backdrop.active');
    if (backdrop) { backdrop.classList.remove('active'); return; }

    // Close slide panels
    var slidePanel = document.querySelector('.slide-panel-backdrop.active');
    if (slidePanel) { slidePanel.classList.remove('active'); return; }

    // Close command palette
    var palette = document.querySelector('.cmd-palette-backdrop.active, [class*="cmd-palette"].active');
    if (palette) { palette.classList.remove('active'); return; }

    // Close shortcuts panel
    var sp = document.getElementById('shortcutsPanel');
    if (sp && sp.classList.contains('open')) { sp.classList.remove('open'); return; }

    // Close dropdowns/notification panels
    var activeDropdown = document.querySelector('.dropdown-menu.active, .notif-panel.active, .user-dropdown.active');
    if (activeDropdown) { activeDropdown.classList.remove('active'); }
  }

  document.addEventListener('keydown', function(e) {
    // Ignore when typing in inputs/textareas
    var tag = (e.target.tagName || '').toLowerCase();
    var inInput = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;

    // Escape — always works
    if (e.key === 'Escape') {
      closeAll();
      gPending = false;
      clearTimeout(gTimer);
      return;
    }

    if (inInput) return;

    // Cmd/Ctrl + K — command palette
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      var palette = document.querySelector('.cmd-palette-backdrop, #cmdPalette');
      if (palette) palette.classList.toggle('active');
      return;
    }

    // Cmd/Ctrl + N — new item
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
      e.preventDefault();
      var cta = document.querySelector('.page-header .btn-primary, .page-header-actions .btn-primary');
      if (cta) cta.click();
      return;
    }

    // ? — shortcuts panel
    if (e.key === '?') {
      e.preventDefault();
      var panel = ensureShortcutsPanel();
      panel.classList.toggle('open');
      return;
    }

    // G + key navigation
    if (e.key === 'g' || e.key === 'G') {
      if (gPending) {
        // Already in G mode — treat second G as G→G
        gPending = false;
        clearTimeout(gTimer);
        window.location.href = gKeyMap['g'];
        return;
      }
      gPending = true;
      clearTimeout(gTimer);
      gTimer = setTimeout(function() { gPending = false; }, 1500);
      return;
    }

    if (gPending) {
      var key = e.key.toLowerCase();
      gPending = false;
      clearTimeout(gTimer);
      if (gKeyMap[key]) {
        e.preventDefault();
        // Resolve relative to current page location
        var base = window.location.pathname.split('/').slice(0, -1).join('/') + '/';
        window.location.href = gKeyMap[key];
      }
    }
  });
};


/* ── F. SKELETON LOADING MANAGER ─────────────────────────── */
GHR.initSkeletons = function() {
  var main = document.querySelector('main') || document.querySelector('.main-wrapper') || document.querySelector('.page-content');
  if (!main) return;

  // Mark all cards/stat-cards
  var cards = main.querySelectorAll('.card, .stat-card');
  cards.forEach(function(card) {
    card.classList.add('ghr-skeleton-loading');
  });

  setTimeout(function() {
    cards.forEach(function(card) {
      card.classList.remove('ghr-skeleton-loading');
    });
  }, 600);
};


/* ── G. COMMAND PALETTE WIRING ───────────────────────────── */
GHR.initCommandPalette = function(items) {
  var backdrop = document.querySelector('.cmd-palette-backdrop');
  var input    = document.querySelector('.cmd-palette-input input');
  var results  = document.querySelector('.cmd-palette-results');
  if (!backdrop || !input || !results) return;

  var filtered = items ? items.slice() : [];

  function renderItems(list) {
    // Clear existing dynamic items (keep static group labels if present)
    var existing = results.querySelectorAll('.cmd-palette-item[data-dynamic]');
    existing.forEach(function(el) { el.remove(); });

    if (list.length === 0) {
      results.innerHTML = '<div style="padding:32px;text-align:center;color:var(--color-text-3);font-size:0.8125rem;">No results</div>';
      return;
    }

    results.innerHTML = '';
    list.forEach(function(item, idx) {
      var el = document.createElement('div');
      el.className = 'cmd-palette-item';
      el.setAttribute('data-dynamic', '1');
      el.setAttribute('data-idx', idx);
      if (idx === 0) el.classList.add('selected');
      el.innerHTML =
        '<div class="item-icon">' + (item.icon || '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/></svg>') + '</div>' +
        '<div class="item-text"><div class="item-title">' + item.label + '</div></div>';
      el.addEventListener('click', function() {
        if (item.href) window.location.href = item.href;
        else if (item.action) item.action();
        backdrop.classList.remove('active');
      });
      results.appendChild(el);
    });
  }

  function getSelected() {
    return results.querySelector('.cmd-palette-item.selected');
  }

  input.addEventListener('input', function() {
    var q = input.value.toLowerCase().trim();
    if (!q) { renderItems(filtered); return; }
    var matched = filtered.filter(function(item) {
      return item.label.toLowerCase().indexOf(q) !== -1;
    });
    renderItems(matched);
  });

  document.addEventListener('keydown', function(e) {
    if (!backdrop.classList.contains('active')) return;
    var items = results.querySelectorAll('.cmd-palette-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      var sel = getSelected();
      var idx = sel ? parseInt(sel.getAttribute('data-idx') || '0') : -1;
      items.forEach(function(i) { i.classList.remove('selected'); });
      var next = results.querySelector('[data-idx="' + (idx + 1) + '"]') || items[0];
      next.classList.add('selected');
      next.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      var sel = getSelected();
      var idx = sel ? parseInt(sel.getAttribute('data-idx') || '0') : items.length;
      items.forEach(function(i) { i.classList.remove('selected'); });
      var prev = results.querySelector('[data-idx="' + (idx - 1) + '"]') || items[items.length - 1];
      prev.classList.add('selected');
      prev.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      var sel = getSelected();
      if (sel) sel.click();
    }
  });

  renderItems(filtered);
};


/* ── H. AVATAR HELPERS ───────────────────────────────────── */
GHR.avatarInitials = function(name) {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).map(function(n) { return n[0]; }).join('').toUpperCase().slice(0, 2);
};

GHR.avatarColor = function(name) {
  if (!name) return 'linear-gradient(135deg, var(--color-primary), var(--color-accent))';
  var colors = [
    'linear-gradient(135deg, hsl(155,26%,46%), hsl(155,26%,32%))',
    'linear-gradient(135deg, hsl(30,58%,50%), hsl(30,58%,36%))',
    'linear-gradient(135deg, hsl(200,40%,52%), hsl(200,40%,38%))',
    'linear-gradient(135deg, hsl(270,45%,58%), hsl(270,45%,44%))',
    'linear-gradient(135deg, hsl(38,60%,48%), hsl(38,60%,34%))',
    'linear-gradient(135deg, hsl(5,65%,52%), hsl(5,65%,38%))'
  ];
  var hash = 0;
  for (var i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return colors[Math.abs(hash) % colors.length];
};


/* ── AUTO-INIT ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  GHR.initHoverCard();
  GHR.initPresence();
  GHR.initRoleSwitcher();
  GHR.initKeyboardShortcuts();
  // GHR.initSkeletons();  — opt-in per page
});
