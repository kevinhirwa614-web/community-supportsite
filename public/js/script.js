/**
 * Community Issue Reporting System — Main JavaScript
 * Handles: form validation, dashboard filtering, animations, UI interactions
 */

/* ============================================================
   SCROLL REVEAL ANIMATION
   ============================================================ */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  reveals.forEach((el) => observer.observe(el));
}

/* ============================================================
   ACTIVE NAV LINK HIGHLIGHT
   ============================================================ */
function highlightActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-navbar .nav-link').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ============================================================
   REPORT FORM VALIDATION
   ============================================================ */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function setFieldError(field, msg) {
  field.classList.add('is-invalid');
  field.classList.remove('is-valid');
  const fb = field.parentElement.querySelector('.invalid-feedback');
  if (fb) {
    fb.textContent = msg;
    fb.classList.add('visible');
  }
}

function clearFieldError(field) {
  field.classList.remove('is-invalid');
  field.classList.add('is-valid');
  const fb = field.parentElement.querySelector('.invalid-feedback');
  if (fb) fb.classList.remove('visible');
}

function clearField(field) {
  field.classList.remove('is-invalid', 'is-valid');
  const fb = field.parentElement.querySelector('.invalid-feedback');
  if (fb) fb.classList.remove('visible');
}

function initReportForm() {
  const form = document.getElementById('reportForm');
  if (!form) return;

  const fullName    = document.getElementById('fullName');
  const email       = document.getElementById('email');
  const issueType   = document.getElementById('issueType');
  const description = document.getElementById('description');
  const location    = document.getElementById('location');
  const successMsg  = document.getElementById('successMessage');

  // Real-time validation on blur
  [fullName, email, issueType, description, location].forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('is-invalid')) validateField(field);
    });
  });

  function validateField(field) {
    const val = field.value.trim();

    if (field === email) {
      if (!val) {
        setFieldError(field, 'Email address is required.');
      } else if (!validateEmail(val)) {
        setFieldError(field, 'Please enter a valid email address (e.g. name@domain.com).');
      } else {
        clearFieldError(field);
      }
      return;
    }

    if (field === issueType) {
      if (!val) {
        setFieldError(field, 'Please select an issue type.');
      } else {
        clearFieldError(field);
      }
      return;
    }

    if (field === description) {
      if (!val) {
        setFieldError(field, 'Please describe the issue.');
      } else if (val.length < 20) {
        setFieldError(field, 'Description must be at least 20 characters.');
      } else {
        clearFieldError(field);
      }
      return;
    }

    // Generic required
    if (!val) {
      const label = field.previousElementSibling?.textContent?.replace('*', '').trim() || 'This field';
      setFieldError(field, `${label} is required.`);
    } else {
      clearFieldError(field);
    }
  }

  // Form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fields = [fullName, email, issueType, description, location];
    fields.forEach(validateField);

    const hasErrors = fields.some((f) => f.classList.contains('is-invalid'));
    if (hasErrors) {
      // Scroll to first error
      const firstError = form.querySelector('.is-invalid');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Simulate submission — show success
    const btn = form.querySelector('#submitBtn');
    btn.disabled = true;
    btn.innerHTML = `
      <span class="spinner-border spinner-border-sm" role="status"></span>
      Submitting…
    `;

    setTimeout(() => {
      form.style.opacity = '0.3';
      form.style.pointerEvents = 'none';
      successMsg.classList.add('visible');
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Store in localStorage for dashboard demo
      const issues = JSON.parse(localStorage.getItem('cirs_issues') || '[]');
      issues.unshift({
        id: Date.now(),
        title: `${issueType.options[issueType.selectedIndex].text} issue — ${location.value}`,
        type: issueType.value,
        description: description.value,
        location: location.value,
        reporter: fullName.value,
        status: 'pending',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        urgent: false
      });
      localStorage.setItem('cirs_issues', JSON.stringify(issues));
    }, 1600);
  });

  // Reset form button
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      [fullName, email, issueType, description, location].forEach(clearField);
      form.style.opacity = '';
      form.style.pointerEvents = '';
      successMsg.classList.remove('visible');
      const btn = form.querySelector('#submitBtn');
      btn.disabled = false;
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
             viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
        </svg>
        Submit Report
      `;
    });
  }

  // File upload drag/drop visual
  const uploadZone = document.getElementById('uploadZone');
  const fileInput  = document.getElementById('imageUpload');
  if (uploadZone && fileInput) {
    uploadZone.addEventListener('click', () => fileInput.click());

    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('drag-over');
    });

    uploadZone.addEventListener('dragleave', () => {
      uploadZone.classList.remove('drag-over');
    });

    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) showFilePreview(file, uploadZone);
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files[0]) showFilePreview(fileInput.files[0], uploadZone);
    });
  }
}

function showFilePreview(file, zone) {
  if (!file.type.startsWith('image/')) {
    zone.querySelector('.upload-zone-text').innerHTML =
      '<strong style="color:#ef4444">Only image files are accepted.</strong>';
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    zone.innerHTML = `
      <img src="${e.target.result}" alt="Preview"
           style="max-height:120px; border-radius:8px; object-fit:cover;">
      <p style="font-size:.8rem; color:var(--slate); margin-top:10px; margin-bottom:0;">
        ${file.name} &mdash; ${(file.size / 1024).toFixed(1)} KB
        <button type="button" onclick="clearUpload()" class="btn btn-link btn-sm p-0 ms-2" style="color:var(--danger)">Remove</button>
      </p>
    `;
  };
  reader.readAsDataURL(file);
}

function clearUpload() {
  const zone = document.getElementById('uploadZone');
  if (!zone) return;
  zone.innerHTML = `
    <div class="upload-zone-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none"
           viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
      </svg>
    </div>
    <p class="upload-zone-text mb-0">
      <strong>Click to upload</strong> or drag and drop<br>
      <span style="font-size:.78rem;">PNG, JPG, WEBP up to 10MB</span>
    </p>
  `;
}

/* ============================================================
   DASHBOARD — FILTER & SEARCH
   ============================================================ */

/* Sample issue data */
const SAMPLE_ISSUES = [
  {
    id: 1001,
    title: 'Massive pothole on Adeniyi-Jones Avenue',
    type: 'road',
    description: 'A deep pothole spanning 2 metres has developed near the junction, causing tyre blowouts and slowing traffic significantly during rush hours.',
    location: 'Adeniyi-Jones Ave, Ikeja',
    reporter: 'Chukwuemeka Obi',
    status: 'pending',
    date: '14 Apr 2026',
    urgent: true
  },
  {
    id: 1002,
    title: 'No water supply for 11 days — Oke-Afa Estate',
    type: 'water',
    description: 'Residents of Oke-Afa have been without pipe-borne water for over a week. Borehole drilling is needed urgently.',
    location: 'Oke-Afa Estate, Isolo',
    reporter: 'Fatima Abubakar',
    status: 'pending',
    date: '12 Apr 2026',
    urgent: true
  },
  {
    id: 1003,
    title: 'Street lights non-functional along Ogba Ring Road',
    type: 'electricity',
    description: 'Approximately 14 lamp posts along the 800m stretch have been dark for 3 weeks, increasing road accidents at night.',
    location: 'Ogba Ring Road, Lagos',
    reporter: 'Adetokunbo Williams',
    status: 'review',
    date: '10 Apr 2026',
    urgent: false
  },
  {
    id: 1004,
    title: 'Illegal waste dumping near community market',
    type: 'waste',
    description: 'Large quantities of refuse are being dumped behind the market stalls each night. The odour is unbearable and a health risk.',
    location: 'Mushin Market, Lagos',
    reporter: 'Ngozi Eze',
    status: 'resolved',
    date: '7 Apr 2026',
    urgent: false
  },
  {
    id: 1005,
    title: 'Repeated phone snatching incidents — Allen Avenue',
    type: 'security',
    description: 'At least 6 phone snatching incidents reported in the past month. Armed patrol presence requested urgently.',
    location: 'Allen Avenue, Ikeja',
    reporter: 'Tunde Bakare',
    status: 'pending',
    date: '5 Apr 2026',
    urgent: true
  },
  {
    id: 1006,
    title: 'Flooded pedestrian walkway near civic centre',
    type: 'other',
    description: 'Poor drainage has left the walkway permanently waterlogged. Elderly residents and schoolchildren cannot pass safely.',
    location: 'Civic Centre Road, V/I',
    reporter: 'Amaka Nwosu',
    status: 'resolved',
    date: '2 Apr 2026',
    urgent: false
  },
  {
    id: 1007,
    title: 'Water pipe burst — Ikoyi Close',
    type: 'water',
    description: 'A burst underground pipe is flooding the road and two adjoining compounds. Water pressure in the area has dropped to zero.',
    location: 'Ikoyi Close, Ikoyi',
    reporter: 'Babajide Fashola',
    status: 'review',
    date: '1 Apr 2026',
    urgent: false
  },
  {
    id: 1008,
    title: 'Collapsed road shoulder — Lagos-Ibadan Expressway',
    type: 'road',
    description: 'Heavy rains have eroded a 30m section of road shoulder. Trucks are now encroaching on the main carriageway.',
    location: 'Lagos-Ibadan Expressway km 12',
    reporter: 'Solomon Adeyemi',
    status: 'resolved',
    date: '28 Mar 2026',
    urgent: false
  }
];

const TYPE_ICONS = {
  road:        { emoji: '🛣️', cls: 'cat-road',        label: 'Road',        bg: '#fef3c7' },
  water:       { emoji: '💧', cls: 'cat-water',       label: 'Water',       bg: '#dbeafe' },
  electricity: { emoji: '⚡', cls: 'cat-electricity', label: 'Electricity', bg: '#fef9c3' },
  security:    { emoji: '🔒', cls: 'cat-security',    label: 'Security',    bg: '#fee2e2' },
  waste:       { emoji: '♻️', cls: 'cat-waste',       label: 'Waste',       bg: '#dcfce7' },
  other:       { emoji: '📋', cls: 'cat-other',       label: 'Other',       bg: '#f3e8ff' }
};

const STATUS_LABELS = {
  pending:  { label: 'Pending',     cls: 'pending'  },
  resolved: { label: 'Resolved',   cls: 'resolved' },
  review:   { label: 'Under Review', cls: 'review' },
  urgent:   { label: 'Urgent',     cls: 'urgent'   }
};

function renderIssueCard(issue) {
  const typeInfo   = TYPE_ICONS[issue.type] || TYPE_ICONS.other;
  const statusInfo = STATUS_LABELS[issue.status] || STATUS_LABELS.pending;
  const urgentBadge = issue.urgent
    ? `<span class="badge-status urgent"><span class="dot"></span>Urgent</span>`
    : '';

  return `
    <div class="issue-card ${issue.urgent ? 'urgent' : issue.status} issue-item"
         data-type="${issue.type}" data-status="${issue.status}" data-urgent="${issue.urgent}">
      <div class="issue-card-top">
        <div class="issue-type-badge" style="background:${typeInfo.bg}; font-size:1.2rem;">
          ${typeInfo.emoji}
        </div>
        <div style="flex:1; min-width:0;">
          <div class="issue-card-title">${escHtml(issue.title)}</div>
          <div class="issue-card-meta">
            <span class="issue-card-meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              ${escHtml(issue.location)}
            </span>
            <span class="issue-card-meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              ${escHtml(issue.date)}
            </span>
            <span class="issue-card-meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              ${escHtml(issue.reporter)}
            </span>
          </div>
        </div>
      </div>
      <p class="issue-card-desc">${escHtml(issue.description)}</p>
      <div class="issue-card-footer">
        <span class="badge-status ${statusInfo.cls}">
          <span class="dot"></span>${statusInfo.label}
        </span>
        ${urgentBadge}
        <span class="category-pill ${typeInfo.cls}">${typeInfo.label}</span>
        <button class="btn-view" onclick="alert('Full issue detail view coming soon!')">View Details</button>
      </div>
    </div>
  `;
}

function escHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function initDashboard() {
  const container = document.getElementById('issuesContainer');
  if (!container) return;

  // Merge stored user submissions with sample data
  const stored = JSON.parse(localStorage.getItem('cirs_issues') || '[]');
  const allIssues = [...stored, ...SAMPLE_ISSUES];

  function renderFiltered(type, status, query) {
    let filtered = allIssues.filter((issue) => {
      const matchType   = !type   || type   === 'all' || issue.type   === type;
      const matchStatus = !status || status === 'all' || issue.status === status ||
                          (status === 'urgent' && issue.urgent);
      const matchQuery  = !query  ||
        issue.title.toLowerCase().includes(query.toLowerCase()) ||
        issue.description.toLowerCase().includes(query.toLowerCase()) ||
        issue.location.toLowerCase().includes(query.toLowerCase());
      return matchType && matchStatus && matchQuery;
    });

    if (!filtered.length) {
      container.innerHTML = `
        <div style="text-align:center; padding:60px 20px; color:var(--slate);">
          <div style="font-size:2.5rem; margin-bottom:16px;">🔍</div>
          <div style="font-weight:700; color:var(--navy); margin-bottom:8px;">No issues found</div>
          <div style="font-size:.88rem;">Try adjusting your filters or search query.</div>
        </div>
      `;
    } else {
      container.innerHTML = filtered.map(renderIssueCard).join('');
      // Update count
      const countEl = document.getElementById('filteredCount');
      if (countEl) countEl.textContent = `Showing ${filtered.length} of ${allIssues.length} issues`;
    }
  }

  // Default render
  renderFiltered('all', 'all', '');

  // Filter buttons
  let activeType   = 'all';
  let activeStatus = 'all';

  document.querySelectorAll('[data-filter-type]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter-type]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeType = btn.dataset.filterType;
      renderFiltered(activeType, activeStatus, searchInput?.value || '');
    });
  });

  document.querySelectorAll('[data-filter-status]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter-status]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeStatus = btn.dataset.filterStatus;
      renderFiltered(activeType, activeStatus, searchInput?.value || '');
    });
  });

  const searchInput = document.getElementById('dashboardSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderFiltered(activeType, activeStatus, searchInput.value);
    });
  }

  // Update stat counters
  const totalEl    = document.getElementById('statTotal');
  const pendingEl  = document.getElementById('statPending');
  const resolvedEl = document.getElementById('statResolved');
  const urgentEl   = document.getElementById('statUrgent');

  if (totalEl)    totalEl.textContent    = allIssues.length;
  if (pendingEl)  pendingEl.textContent  = allIssues.filter((i) => i.status === 'pending').length;
  if (resolvedEl) resolvedEl.textContent = allIssues.filter((i) => i.status === 'resolved').length;
  if (urgentEl)   urgentEl.textContent   = allIssues.filter((i) => i.urgent).length;
}

/* ============================================================
   CONTACT FORM VALIDATION
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const successMsg = document.getElementById('contactSuccess');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;
    const fields = form.querySelectorAll('[required]');
    fields.forEach((field) => {
      const val = field.value.trim();
      if (!val) {
        field.classList.add('is-invalid');
        valid = false;
      } else if (field.type === 'email' && !validateEmail(val)) {
        field.classList.add('is-invalid');
        valid = false;
      } else {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
      }
    });

    if (!valid) return;

    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Sending…';

    setTimeout(() => {
      form.style.display = 'none';
      if (successMsg) successMsg.style.display = 'flex';
    }, 1400);
  });

  // Live validation
  form.querySelectorAll('input, textarea, select').forEach((field) => {
    field.addEventListener('blur', () => {
      if (!field.value.trim()) {
        field.classList.add('is-invalid');
      } else if (field.type === 'email' && !validateEmail(field.value.trim())) {
        field.classList.add('is-invalid');
      } else {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
      }
    });
  });
}

/* ============================================================
   COUNTER ANIMATION (home stats, about stats)
   ============================================================ */
function animateCounter(el, target, duration = 1200) {
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        animateCounter(el, parseInt(el.dataset.count, 10));
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach((el) => observer.observe(el));
}

/* ============================================================
   NAVBAR SCROLL EFFECT
   ============================================================ */
function initNavbarScroll() {
  const nav = document.querySelector('.site-navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      nav.style.boxShadow = '0 4px 20px rgba(17,28,51,0.35)';
    } else {
      nav.style.boxShadow = '';
    }
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  highlightActiveNav();
  initScrollReveal();
  initNavbarScroll();
  initReportForm();
  initDashboard();
  initContactForm();
  initCounters();
});
