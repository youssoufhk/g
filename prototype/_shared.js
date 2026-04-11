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
        '<div class="worktime-bar" style="margin-top:var(--space-1);">' +
          '<div class="worktime-fill" id="hcWorktimeFill" style="width:0%"></div>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:var(--space-2);margin-top:var(--space-3);">' +
        '<a class="hc-link btn btn-ghost btn-sm" id="hcLink" style="flex:1;justify-content:center;">View Profile</a>' +
        '<button class="btn btn-ghost btn-sm" id="hcMessage" style="flex:1;justify-content:center;" onclick="GHR.showToast(\'info\',\'Message\',\'Chat would open here.\');">Send Message</button>' +
      '</div>';
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
        projEl.innerHTML = '<span style="font-size:var(--text-caption);color:var(--color-text-3);">Project: </span><span style="font-size:var(--text-caption);color:var(--color-text-2);">' + project + '</span>';
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
    'sarah-chen':   { name: 'Sarah Chen',    status: 'online'   },
    'john-smith':   { name: 'John Smith',    status: 'online'   },
    'alice-wang':   { name: 'Alice Wang',    status: 'on-leave' },
    'carol-williams':{ name: 'Carol Williams', status: 'online' },
    'david-park':   { name: 'David Park',    status: 'offline'  },
    'marco-rossi':  { name: 'Marco Rossi',   status: 'away'     },
    'emma-laurent': { name: 'Emma Laurent',  status: 'online'   },
    'bob-taylor':   { name: 'Bob Taylor',    status: 'offline'  }
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
      var status = employees[id].status;
      if (status === 'on-leave' || status === 'offline') continue;
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

};


/* ── D. ROLE SWITCHER ─────────────────────────────────────── */
GHR.currentRole = localStorage.getItem('ghrRole') || 'admin';

GHR.setRole = function(role) {
  GHR.currentRole = role;
  localStorage.setItem('ghrRole', role);
  document.body.setAttribute('data-role', role);
  GHR._applyRoleVisibility(role);
  document.dispatchEvent(new CustomEvent('rolechange', { detail: { role: role } }));
  // Re-render notifications to apply role filtering
  if (typeof GHR.renderNotifications === 'function') GHR.renderNotifications();
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
  // 'hr' added to support HR-specific gating (pipeline, salary history, onboarding details)
  var sensitiveTypes = ['financials', 'billing', 'salary', 'hr'];
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
  widget.style.padding = 'var(--space-2)';

  function renderWidget() {
    widget.innerHTML =
      '<div class="role-switcher" id="ghrRoleTrigger" title="Switch role (demo)">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a4 4 0 018 0v2"/></svg>' +
        '<span class="' + (roleBadgeClass[GHR.currentRole] || '') + '" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' +
          roleLabels[GHR.currentRole] +
        '</span>' +
        '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>' +
      '</div>' +
      '<div id="ghrRoleMenu" style="display:none;margin-top:var(--space-1);background:var(--color-surface-3);border:1px solid var(--color-border);border-radius:var(--radius-md);overflow:hidden;">' +
        ['admin', 'pm', 'employee'].map(function(r) {
          return '<button style="display:flex;align-items:center;gap:var(--space-2);width:100%;padding:var(--space-2) var(--space-3);background:' +
            (GHR.currentRole === r ? 'var(--color-primary-muted)' : 'none') +
            ';border:none;color:' +
            (GHR.currentRole === r ? 'var(--color-primary)' : 'var(--color-text-1)') +
            ';font-size:var(--text-caption);font-family:var(--font-sans);cursor:pointer;text-align:left;" data-role-opt="' + r + '">' +
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
          '<span style="font-size:var(--text-body-sm);color:var(--color-text-2);">' + s.desc + '</span>' +
        '</div>';
      }).join('');
    }

    panel.innerHTML =
      '<div class="shortcuts-modal">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-6);">' +
          '<h3 style="font-size:var(--text-heading-3);font-weight:var(--weight-semibold);color:var(--color-text-1);">Keyboard Shortcuts</h3>' +
          '<button id="shortcutsPanelClose" style="background:none;border:none;color:var(--color-text-3);cursor:pointer;padding:var(--space-1);" aria-label="Close">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
          '</button>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 var(--space-8);">' +
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
    // Close modals (with exit animation)
    var backdrop = document.querySelector('.modal-backdrop.active');
    if (backdrop) { GHR.closeModal(backdrop); return; }

    // Close slide panels
    var slidePanel = document.querySelector('.slide-panel-backdrop.active');
    if (slidePanel) { slidePanel.classList.remove('active'); return; }

    // Close command palette (with exit animation)
    var palette = document.querySelector('.cmd-palette-backdrop.active, [class*="cmd-palette"].active');
    if (palette) {
      palette.classList.add('removing');
      setTimeout(function() { palette.classList.remove('active', 'removing'); }, 200);
      return;
    }

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

    // Shift+E — toggle dev mode (shows/hides state toggle buttons)
    if (e.shiftKey && e.key === 'E') {
      e.preventDefault();
      document.body.classList.toggle('dev-mode');
      return;
    }

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
        // Role-based navigation guard
        var restrictedForEmployee = { 's': true, 'i': true, 'a': true, 'c': true, 'r': true, 'h': true, 'g': true, 'n': true, 'p': true };
        if (GHR.currentRole === 'employee' && restrictedForEmployee[key]) {
          GHR.showToast('error', 'Access Denied', 'You do not have permission to access that page.');
          return;
        }
        window.location.href = gKeyMap[key];
      }
    }
  });
};


/* ── F. MODAL CLOSE WITH EXIT ANIMATION ──────────────────── */
GHR.closeModal = function(backdrop) {
  if (!backdrop) return;
  backdrop.classList.add('removing');
  setTimeout(function() {
    backdrop.classList.remove('active', 'removing');
  }, 200);
};

/* Global: close any modal on backdrop click (consistency across all pages) */
document.addEventListener('click', function(e) {
  if (e.target && e.target.classList && e.target.classList.contains('modal-backdrop') && e.target.classList.contains('active')) {
    GHR.closeModal(e.target);
  }
});


/* ── G. KPI COUNTER ROLL ANIMATION ──────────────────────── */
GHR.animateCounters = function() {
  // Respect prefers-reduced-motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var elements = document.querySelectorAll('.stat-value');
  elements.forEach(function(el) {
    var text = el.textContent.trim();
    if (!text) return;

    // Parse: extract prefix (€), suffix (h, %), and numeric value
    var prefix = '';
    var suffix = '';
    var numStr = text;

    // Detect prefix (currency symbol)
    var prefixMatch = text.match(/^([€$£¥])/);
    if (prefixMatch) {
      prefix = prefixMatch[1];
      numStr = text.slice(prefix.length);
    }

    // Detect suffix (h, %, and anything non-numeric at end)
    var suffixMatch = numStr.match(/([^0-9,\.]+)$/);
    if (suffixMatch) {
      suffix = suffixMatch[1];
      numStr = numStr.slice(0, numStr.length - suffix.length);
    }

    // Remove commas for parsing
    var useCommas = numStr.indexOf(',') !== -1;
    var raw = parseFloat(numStr.replace(/,/g, ''));
    if (isNaN(raw) || raw === 0) return;

    var start = 0;
    var end = raw;
    var duration = 300;
    var startTime = null;
    var isInt = Number.isInteger(raw);

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function formatNum(val) {
      var rounded = isInt ? Math.round(val) : Math.round(val * 10) / 10;
      if (useCommas) {
        rounded = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
      return prefix + rounded + suffix;
    }

    el.textContent = formatNum(start);

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var current = start + (end - start) * easeOut(progress);
      el.textContent = formatNum(current);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = formatNum(end);
      }
    }

    requestAnimationFrame(step);
  });
};


/* ── H. SKELETON LOADING MANAGER ─────────────────────────── */
GHR.initSkeletons = function() {
  var main = document.querySelector('main') || document.querySelector('.main-wrapper') || document.querySelector('.page-content');
  if (!main) return;

  // Mark all cards/stat-cards and all .skeleton elements
  var cards = main.querySelectorAll('.card, .stat-card, .skeleton');
  cards.forEach(function(card) {
    card.classList.add('ghr-skeleton-loading');
  });

  setTimeout(function() {
    cards.forEach(function(card) {
      card.classList.remove('ghr-skeleton-loading');
    });
    // Animate counters after skeletons resolve
    GHR.animateCounters();
  }, 600);
};


/* ── I. CHART DRAW-IN ANIMATION ──────────────────────────── */
GHR.animateCharts = function() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var paths = document.querySelectorAll('svg path[data-animate], svg circle[data-animate]');
  if (!paths.length) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('chart-animate-in');
        observer.unobserve(e.target);
      }
    });
  });

  paths.forEach(function(p) { observer.observe(p); });
};


/* ── J. COMMAND PALETTE WIRING ───────────────────────────── */
GHR.initCommandPalette = function(items) {
  var backdrop = document.querySelector('.cmd-palette-backdrop');
  var input    = document.querySelector('.cmd-palette-input input');
  var results  = document.querySelector('.cmd-palette-results');
  if (!backdrop || !input || !results) return;

  // Canonical employees and clients data entities
  var employeeIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 018 0v2"/></svg>';
  var clientIcon   = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3l-4 4-4-4"/></svg>';
  var allDataEntities = [
    { label: 'Sarah Chen',     href: 'hr.html',       icon: employeeIcon, category: 'employee', minRole: null },
    { label: 'John Smith',     href: 'hr.html',       icon: employeeIcon, category: 'employee', minRole: null },
    { label: 'Marco Rossi',    href: 'hr.html',       icon: employeeIcon, category: 'employee', minRole: null },
    { label: 'Carol Williams', href: 'hr.html',       icon: employeeIcon, category: 'employee', minRole: null },
    { label: 'Alice Wang',     href: 'hr.html',       icon: employeeIcon, category: 'employee', minRole: null },
    { label: 'David Park',     href: 'hr.html',       icon: employeeIcon, category: 'employee', minRole: null },
    { label: 'Emma Laurent',   href: 'hr.html',       icon: employeeIcon, category: 'employee', minRole: null },
    { label: 'Bob Taylor',     href: 'hr.html',       icon: employeeIcon, category: 'employee', minRole: null },
    { label: 'Acme Corp',      href: 'clients.html',  icon: clientIcon,   category: 'client',   minRole: 'pm' },
    { label: 'Globex Corp',    href: 'clients.html',  icon: clientIcon,   category: 'client',   minRole: 'pm' },
    { label: 'Initech',        href: 'clients.html',  icon: clientIcon,   category: 'client',   minRole: 'pm' },
    { label: 'Umbrella Corp',  href: 'clients.html',  icon: clientIcon,   category: 'client',   minRole: 'pm' }
  ];

  // Filter entities by current role
  var roleLevel = { employee: 0, pm: 1, admin: 2 };
  var currentRoleLevel = roleLevel[GHR.currentRole] || 0;
  var dataEntities = allDataEntities.filter(function(e) {
    if (!e.minRole) return true;
    return currentRoleLevel >= (roleLevel[e.minRole] || 0);
  });

  // Filter page-specific items by current role too
  var pageItems = (items ? items.slice() : []).filter(function(item) {
    if (!item.minRole) return true;
    return currentRoleLevel >= (roleLevel[item.minRole] || 0);
  });

  var filtered = pageItems.concat(dataEntities);

  function renderItems(list) {
    // Clear existing dynamic items (keep static group labels if present)
    var existing = results.querySelectorAll('.cmd-palette-item[data-dynamic]');
    existing.forEach(function(el) { el.remove(); });

    if (list.length === 0) {
      results.innerHTML = '<div style="padding:var(--space-8);text-align:center;color:var(--color-text-3);font-size:var(--text-body-sm);">No results</div>';
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

GHR._avatarColors = [
  'linear-gradient(135deg, hsl(155,26%,46%), hsl(155,26%,32%))',  /* sage */
  'linear-gradient(135deg, hsl(30,58%,50%), hsl(30,58%,36%))',   /* terracotta */
  'linear-gradient(135deg, hsl(200,40%,52%), hsl(200,40%,38%))', /* ocean */
  'linear-gradient(135deg, hsl(270,45%,58%), hsl(270,45%,44%))', /* purple */
  'linear-gradient(135deg, hsl(38,60%,48%), hsl(38,60%,34%))',   /* gold */
  'linear-gradient(135deg, hsl(5,65%,52%), hsl(5,65%,38%))',     /* red */
  'linear-gradient(135deg, hsl(175,35%,45%), hsl(175,35%,32%))', /* teal */
  'linear-gradient(135deg, hsl(340,45%,52%), hsl(340,45%,38%))' /* rose */
];

GHR._avatarHash = function(name) {
  if (!name) return 0;
  var hash = 0;
  for (var i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

GHR.avatarColor = function(name) {
  if (!name) return 'linear-gradient(135deg, var(--color-primary), var(--color-accent))';
  return GHR._avatarColors[GHR._avatarHash(name) % GHR._avatarColors.length];
};

/* Returns a CSS class name (avatar-color-0 through avatar-color-7) for deterministic avatar coloring */
GHR.avatarColorClass = function(name) {
  return 'avatar-color-' + (GHR._avatarHash(name) % 8);
};


/* ── K-0. NOTIFICATION PANEL RENDERER (single source of truth) ── */
GHR.notificationItems = [
  { icon: 'clock',       color: 'var(--color-primary)', title: 'Sarah Chen submitted 40h timesheet for review',             time: '10 min ago',  unread: true,  href: 'timesheets.html' },
  { icon: 'check-circle',color: 'var(--color-success)', title: 'Expense report #1847 approved by Finance',                  time: '25 min ago',  unread: true,  href: 'expenses.html' },
  { icon: 'calendar',    color: 'var(--color-info)',     title: 'Marco Rossi requested annual leave (Jun 15-22)',            time: '1 hour ago',  unread: true,  href: 'leaves.html' },
  { icon: 'alert-circle',color: 'var(--color-warning)',  title: 'Invoice INV-2026-048 overdue — Acme Corp (EUR 12,400)',   time: '2 hours ago', unread: false, href: 'invoices.html', minRole: 'pm' },
  { icon: 'users',       color: 'var(--color-primary)',  title: 'New hire onboarding: Emma Laurent starts Monday',          time: '3 hours ago', unread: false, href: 'hr.html', minRole: 'pm' },
  { icon: 'trending-up', color: 'var(--color-success)',  title: 'Monthly Insights report is ready to view',                 time: '5 hours ago', unread: false, href: 'insights.html' }
];

GHR.renderNotifications = function(filter) {
  var panel = document.getElementById('notifPanel');
  if (!panel) return;

  filter = filter || 'all';

  // Filter items by role visibility
  var role = GHR.currentRole || 'admin';
  var roleLevel = { employee: 0, pm: 1, admin: 2 };
  var items = GHR.notificationItems.filter(function(n) {
    if (!n.minRole) return true;
    return (roleLevel[role] || 0) >= (roleLevel[n.minRole] || 0);
  });

  // Filter by tab
  var filtered = items;
  if (filter === 'unread') {
    filtered = items.filter(function(n) { return n.unread; });
  } else if (filter === 'mentions') {
    filtered = items.filter(function(n) { return n.mention; });
  }

  var unreadCount = items.filter(function(n) { return n.unread; }).length;

  var headerHtml =
    '<div class="notif-panel-header">' +
      '<span style="font-weight:var(--weight-semibold);font-size:var(--text-body);">Notifications</span>' +
      '<div style="display:flex;align-items:center;gap:var(--space-2);">' +
        '<button class="btn btn-ghost btn-xs" id="markAllReadBtn">Mark all read</button>' +
        '<button id="notifPanelCloseBtn" aria-label="Close notifications" style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;background:transparent;border:none;border-radius:var(--radius-md);color:var(--color-text-3);cursor:pointer;transition:all var(--motion-fast);" onmouseover="this.style.background=\'var(--color-surface-1)\';this.style.color=\'var(--color-text-1)\';" onmouseout="this.style.background=\'transparent\';this.style.color=\'var(--color-text-3)\';">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>' +
      '</div>' +
    '</div>' +
    '<div class="notif-tabs" style="display:flex;gap:0;border-bottom:1px solid var(--color-border-subtle);">' +
      '<button class="notif-tab' + (filter === 'all' ? ' active' : '') + '" data-notif-filter="all" style="flex:1;padding:var(--space-2) var(--space-3);background:none;border:none;border-bottom:2px solid ' + (filter === 'all' ? 'var(--color-primary)' : 'transparent') + ';color:' + (filter === 'all' ? 'var(--color-primary)' : 'var(--color-text-2)') + ';font-size:var(--text-caption);font-weight:var(--weight-medium);cursor:pointer;font-family:var(--font-sans);">All</button>' +
      '<button class="notif-tab' + (filter === 'unread' ? ' active' : '') + '" data-notif-filter="unread" style="flex:1;padding:var(--space-2) var(--space-3);background:none;border:none;border-bottom:2px solid ' + (filter === 'unread' ? 'var(--color-primary)' : 'transparent') + ';color:' + (filter === 'unread' ? 'var(--color-primary)' : 'var(--color-text-2)') + ';font-size:var(--text-caption);font-weight:var(--weight-medium);cursor:pointer;font-family:var(--font-sans);">Unread (' + unreadCount + ')</button>' +
      '<button class="notif-tab' + (filter === 'mentions' ? ' active' : '') + '" data-notif-filter="mentions" style="flex:1;padding:var(--space-2) var(--space-3);background:none;border:none;border-bottom:2px solid ' + (filter === 'mentions' ? 'var(--color-primary)' : 'transparent') + ';color:' + (filter === 'mentions' ? 'var(--color-primary)' : 'var(--color-text-2)') + ';font-size:var(--text-caption);font-weight:var(--weight-medium);cursor:pointer;font-family:var(--font-sans);">Mentions</button>' +
    '</div>';

  var listHtml = '<div class="notif-panel-list">';
  if (filtered.length === 0) {
    listHtml += '<div style="padding:var(--space-8);text-align:center;color:var(--color-text-3);font-size:var(--text-body-sm);">No ' + (filter === 'all' ? '' : filter + ' ') + 'notifications</div>';
  } else {
    for (var i = 0; i < filtered.length; i++) {
      var n = filtered[i];
      listHtml +=
        '<a href="' + n.href + '" class="notif-item' + (n.unread ? ' unread' : '') + '" style="text-decoration:none;color:inherit;">' +
          '<div class="notif-icon"><svg data-lucide="' + n.icon + '" width="16" height="16" style="color:' + n.color + ';"></svg></div>' +
          '<div class="notif-text">' +
            '<div class="notif-title">' + n.title + '</div>' +
            '<div class="notif-time">' + n.time + '</div>' +
          '</div>' +
        '</a>';
    }
  }
  listHtml += '</div>';

  panel.innerHTML = headerHtml + listHtml;

  // Wire × close button (re-wired every render since innerHTML is replaced)
  var closeBtn = panel.querySelector('#notifPanelCloseBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (GHR._closeNotifPanel) {
        GHR._closeNotifPanel();
      } else {
        panel.classList.remove('active');
        var backdrop = document.getElementById('notifBackdrop');
        if (backdrop) backdrop.remove();
      }
    });
  }

  // Wire tab clicks
  var tabs = panel.querySelectorAll('[data-notif-filter]');
  for (var t = 0; t < tabs.length; t++) {
    tabs[t].addEventListener('click', function(e) {
      e.stopPropagation();
      GHR.renderNotifications(this.getAttribute('data-notif-filter'));
    });
  }

  // Re-render Lucide icons inside the panel
  if (window.lucide) {
    lucide.createIcons({ attrs: {}, nameAttr: 'data-lucide', nodes: panel.querySelectorAll('[data-lucide]') });
  }
};

/* ── K-0b. NOTIFICATION PANEL + HEADER WIRING ── */
GHR.initNotifications = function() {
  var notifBtn = document.getElementById('notifBtn');
  var notifPanel = document.getElementById('notifPanel');
  var userDropdown = document.querySelector('.user-dropdown');
  if (!notifBtn || !notifPanel) return;

  // Ensure panel has the CSS class that controls visibility (element only has an id in HTML)
  notifPanel.classList.add('notif-panel');

  // Render notification items from single source of truth
  GHR.renderNotifications();

  function openNotifPanel() {
    notifPanel.classList.add('active');
    if (userDropdown) userDropdown.classList.remove('active');
    // Create full-screen transparent backdrop — bypasses stopPropagation on other elements
    var existing = document.getElementById('notifBackdrop');
    if (existing) existing.remove();
    var backdrop = document.createElement('div');
    backdrop.id = 'notifBackdrop';
    backdrop.style.cssText = 'position:fixed;inset:0;z-index:499;background:transparent;';
    backdrop.addEventListener('click', function() {
      closeNotifPanel();
    });
    document.body.appendChild(backdrop);
  }

  function closeNotifPanel() {
    notifPanel.classList.remove('active');
    var backdrop = document.getElementById('notifBackdrop');
    if (backdrop) backdrop.remove();
  }

  // Expose so renderNotifications close button can call it
  GHR._closeNotifPanel = closeNotifPanel;

  // Toggle panel on bell click
  notifBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (notifPanel.classList.contains('active')) {
      closeNotifPanel();
    } else {
      openNotifPanel();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && notifPanel.classList.contains('active')) {
      closeNotifPanel();
      notifBtn.focus();
    }
  });

  // MutationObserver: if anything removes 'active' from the panel (e.g. user menu handler
  // in page scripts calling notifPanel.classList.remove('active')), also remove the backdrop
  var panelObserver = new MutationObserver(function() {
    if (!notifPanel.classList.contains('active')) {
      var backdrop = document.getElementById('notifBackdrop');
      if (backdrop) backdrop.remove();
    }
  });
  panelObserver.observe(notifPanel, { attributes: true, attributeFilter: ['class'] });
};

/* ── K-0c. "MARK ALL READ" EVENT DELEGATION ── */
GHR.initMarkAllRead = function() {
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('#markAllReadBtn');
    if (!btn) return;
    e.preventDefault();
    // Clear unread state from all notification items
    var unreads = document.querySelectorAll('.notif-item.unread');
    for (var i = 0; i < unreads.length; i++) {
      unreads[i].classList.remove('unread');
    }
    // Remove the notification dot indicator
    var dot = document.querySelector('.notif-dot');
    if (dot) dot.remove();
    GHR.showToast('success', 'Done', 'All notifications marked as read.');
  });
};


/* ── K. SIDEBAR RENDERER (single source of truth) ────────── */
GHR.renderSidebar = function() {
  var sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  // Detect active page from URL
  var path = window.location.pathname;
  var filename = path.split('/').pop() || 'index.html';
  if (filename === '' || filename === '/') filename = 'index.html';

  // For file:// protocol, also handle full paths
  if (window.location.protocol === 'file:') {
    var href = window.location.href;
    var match = href.match(/([^\/]+\.html)/);
    if (match) filename = match[1];
  }

  var active = filename;

  function navItem(href, icon, label, badge) {
    var itemFile = href.split('#')[0].split('?')[0];
    var isActive = (itemFile === active) ? ' active' : '';
    var badgeHtml = badge ? '<span class="nav-badge">' + badge + '</span>' : '';
    return '<a href="' + href + '" class="nav-item' + isActive + '">' +
      '<svg data-lucide="' + icon + '"></svg>' +
      '<span class="nav-label">' + label + '</span>' +
      badgeHtml +
    '</a>';
  }

  sidebar.innerHTML =
    '<div class="sidebar-logo">' +
      '<div class="logo-icon">G</div>' +
      '<span class="logo-text">GammaHR</span>' +
    '</div>' +
    '<nav class="sidebar-nav" aria-label="Main navigation">' +
      '<div class="nav-section">' +
        '<div class="nav-section-label">Main</div>' +
        navItem('index.html', 'layout-dashboard', 'Dashboard') +
        navItem('calendar.html', 'calendar', 'Calendar') +
        navItem('timesheets.html', 'clock', 'Timesheets', '7') +
        navItem('leaves.html', 'umbrella', 'Leaves', '3') +
      '</div>' +
      '<div class="nav-section">' +
        '<div class="nav-section-label">Work</div>' +
        navItem('expenses.html', 'receipt', 'Expenses', '2') +
        '<span data-min-role="pm">' +
          navItem('projects.html', 'folder', 'Projects') +
          navItem('gantt.html', 'bar-chart-2', 'Gantt Chart') +
          navItem('planning.html', 'calendar', 'Resource Planning') +
          navItem('clients.html', 'building-2', 'Clients') +
          navItem('invoices.html', 'file-text', 'Invoices') +
        '</span>' +
      '</div>' +
      '<div class="nav-section">' +
        '<div class="nav-section-label">HR</div>' +
        navItem('employees.html', 'users', 'Team Directory') +
        '<span data-min-role="pm">' +
          navItem('hr.html', 'briefcase', 'Human Resources', '5') +
        '</span>' +
      '</div>' +
      '<div class="nav-section" data-min-role="pm">' +
        '<div class="nav-section-label">AI</div>' +
        navItem('insights.html', 'lightbulb', 'AI Insights') +
      '</div>' +
      '<div class="nav-section" data-min-role="admin">' +
        '<div class="nav-section-label">Admin</div>' +
        navItem('admin.html', 'settings', 'Administration') +
      '</div>' +
    '</nav>' +
    '<div class="sidebar-footer">' +
      '<a href="approvals.html" class="nav-item' + (active === 'approvals.html' ? ' active' : '') + ' " data-min-role="pm" style="margin-bottom:var(--space-1);">' +
        '<svg data-lucide="check-square"></svg>' +
        '<span class="nav-label">Approvals</span>' +
        '<span class="nav-badge">12</span>' +
      '</a>' +
      '<a href="account.html" class="nav-item' + (active === 'account.html' ? ' active' : '') + '" style="margin-bottom:var(--space-1);">' +
        '<svg data-lucide="user-circle"></svg>' +
        '<span class="nav-label">Account</span>' +
      '</a>' +
      '<a href="#" class="nav-item" id="helpShortcutsLink" style="margin-bottom:var(--space-2);">' +
        '<svg data-lucide="keyboard"></svg>' +
        '<span class="nav-label">Help & Shortcuts</span>' +
      '</a>' +
      '<button class="sidebar-collapse-btn" id="sidebarCollapseBtn">' +
        '<svg data-lucide="chevrons-left"></svg>' +
        '<span>Collapse</span>' +
      '</button>' +
    '</div>';

  // Restore collapsed state from localStorage
  if (localStorage.getItem('ghr-sidebar-collapsed') === '1') {
    sidebar.classList.add('collapsed');
  }

  // Wire up collapse button
  var collapseBtn = document.getElementById('sidebarCollapseBtn');
  if (collapseBtn) {
    collapseBtn.addEventListener('click', function() {
      sidebar.classList.toggle('collapsed');
      localStorage.setItem('ghr-sidebar-collapsed', sidebar.classList.contains('collapsed') ? '1' : '0');
    });
  }

  // Wire up Help & Shortcuts link
  var helpLink = document.getElementById('helpShortcutsLink');
  if (helpLink) {
    helpLink.addEventListener('click', function(e) {
      e.preventDefault();
      // Trigger the ? key shortcut panel
      var panel = document.getElementById('shortcutsPanel');
      if (!panel) {
        // Dispatch a synthetic ? keydown to build the panel via initKeyboardShortcuts
        document.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }));
      } else {
        panel.classList.toggle('open');
      }
    });
  }

  // Wire up mobile overlay
  var overlay = document.getElementById('sidebarOverlay');
  if (overlay) {
    overlay.addEventListener('click', function() {
      sidebar.classList.remove('mobile-open');
    });
  }

  // Wire up mobile menu button
  var mobileBtn = document.getElementById('mobileMenuBtn');
  if (mobileBtn) {
    mobileBtn.addEventListener('click', function() {
      sidebar.classList.toggle('mobile-open');
    });
  }

  // Re-render Lucide icons for the sidebar
  if (window.lucide) {
    lucide.createIcons({ attrs: {}, nameAttr: 'data-lucide', nodes: sidebar.querySelectorAll('[data-lucide]') });
  }
};


/* ── L. FEEL: AI ALERTS COLLAPSE (dashboard — show top 2 only) ─────── */
GHR.initAiAlertsCollapse = function() {
  var containers = document.querySelectorAll('.ai-alerts-list, [class*="ai-alerts"]');
  containers.forEach(function(container) {
    var items = container.querySelectorAll('.ai-insight-card, .ai-alert-item');
    if (items.length <= 2) return; // Nothing to collapse

    var hiddenCount = items.length - 2;
    // Remove any existing expand button to avoid duplicates
    var existingBtn = container.querySelector('.ai-alerts-expand-btn');
    if (existingBtn) existingBtn.remove();

    var btn = document.createElement('button');
    btn.className = 'ai-alerts-expand-btn';
    btn.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>' +
      'View ' + hiddenCount + ' more alert' + (hiddenCount === 1 ? '' : 's');
    btn.addEventListener('click', function() {
      container.classList.add('alerts-expanded');
    });
    container.appendChild(btn);
  });
};


/* ── M. FEEL: ADMIN INVITE ROLE DEFAULT ─────────────────────────────── */
/* Ensures the invite modal pre-selects "Employee" as the default role */
GHR.initInviteModalDefaults = function() {
  var inviteModal = document.getElementById('inviteUserModal') || document.querySelector('[id*="invite"]');
  if (!inviteModal) return;

  // When invite modal opens, default role to employee
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'class') {
        var el = mutation.target;
        if (el.classList.contains('active') || el.classList.contains('open')) {
          var roleSelect = el.querySelector('[name="role"], #inviteRole, select[id*="role"]');
          if (roleSelect && !roleSelect.value) {
            roleSelect.value = 'employee';
          }
          var deptSelect = el.querySelector('[name="department"], #inviteDept, select[id*="dept"]');
          if (deptSelect && !deptSelect.value && deptSelect.options.length > 1) {
            // Pre-select first non-empty option
            deptSelect.selectedIndex = 1;
          }
        }
      }
    });
  });

  observer.observe(inviteModal, { attributes: true });
};


/* ── N. FEEL: EXPENSES AI AUTO-FILL ─────────────────────────────────── */
/* Makes AI scan results auto-fill the form immediately on detection */
GHR.initExpenseAutoFill = function() {
  // Wire up the aiAutoFilledBanner to be shown automatically when AI scan completes
  // The expenses page uses applyAiResults() — we wrap it to auto-trigger on scan complete
  var bannerEl = document.getElementById('aiAutoFilledBanner');
  if (!bannerEl) return;

  // Watch for when AI results appear (the ai-results div becomes visible)
  var aiResultsEl = document.getElementById('aiResults') || document.querySelector('[id*="aiResults"]');
  if (!aiResultsEl) return;

  var observer = new MutationObserver(function() {
    var isVisible = aiResultsEl.style.display !== 'none' && !aiResultsEl.classList.contains('hidden');
    if (isVisible) {
      // Auto-apply the AI results if the applyAiResults function exists
      if (typeof window.applyAiResults === 'function') {
        window.applyAiResults();
      }
      // Show the autofill banner
      bannerEl.style.display = 'flex';
    }
  });

  observer.observe(aiResultsEl, { attributes: true, attributeFilter: ['style', 'class'] });
};


/* ── AUTO-INIT ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  GHR.renderSidebar();
  GHR.initNotifications();
  GHR.initMarkAllRead();
  GHR.initHoverCard();
  GHR.initPresence();
  GHR.initRoleSwitcher();
  GHR.initKeyboardShortcuts();
  GHR.animateCharts();
  GHR.initAiAlertsCollapse();
  GHR.initInviteModalDefaults();
  GHR.initExpenseAutoFill();
  // GHR.initSkeletons();  — opt-in per page
});
