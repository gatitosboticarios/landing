/* ============================================
   Universo Gatitos Boticarios — App Principal
   ============================================
   Depende de:
   - js/metrics.js (debe cargarse primero)
   - EmailJS SDK  (debe cargarse primero)
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* =====================
     EmailJS — Credenciales
     ===================== */
  const EMAILJS_PUBLIC_KEY       = 'ZhnZtDZRCVZU3qlPp';
  const EMAILJS_SERVICE_ID       = 'service_88dm6k6';
  const EMAILJS_TEMPLATE_NOTIFY  = 'template_e8vw94n';
  const EMAILJS_TEMPLATE_AUTOREPLY = 'template_mwatmj1';

  // Inicializar EmailJS (respaldo por si el init inline de index.html no se ejecutó)
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log('[App] EmailJS inicializado con key:', EMAILJS_PUBLIC_KEY.slice(0, 6) + '…');
  } else {
    console.warn('[App] EmailJS SDK no encontrado — el formulario usará fallback mailto');
  }

  /* =====================
     MOBILE MENU
     ===================== */
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
    });
    navMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navMenu.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* =====================
     SMOOTH SCROLL
     ===================== */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerH = document.querySelector('.site-header')?.offsetHeight || 0;
        const top = target.getBoundingClientRect().top + window.scrollY - headerH - 10;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* =====================
     HEADER SCROLL EFFECT
     ===================== */
  const header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  /* =====================
     LOAD GAMES (dynamic)
     ===================== */
  const gamesGrid = document.getElementById('gamesGrid');

  function renderGames(games) {
    if (!gamesGrid) return;
    games.sort((a, b) => a.order - b.order);
    gamesGrid.innerHTML = games.map(g => `
      <article class="game-card fade-in" id="game-${g.id}">
        <div class="game-cover-wrap">
          <img src="${g.sellSheet}" alt="Sell Sheet — ${g.title}" class="game-cover" loading="lazy">
          <div class="game-tags">
            ${g.tags.map(t => `<span class="game-tag">${t}</span>`).join('')}
          </div>
        </div>
        <div class="game-body">
          <h3>${g.title}</h3>
          <p class="game-subtitle">${g.subtitle}</p>
          <p class="game-desc">${g.description}</p>
          <blockquote class="game-quote">"${g.quote}"</blockquote>
          <ul class="game-meta">
            <li><span class="meta-icon">👥</span> ${g.players}</li>
            <li><span class="meta-icon">⏳</span> ${g.duration}</li>
            <li><span class="meta-icon">🎂</span> ${g.age}</li>
          </ul>
          <div class="game-actions">
            <a href="${g.manual}" class="btn btn-primary btn-sm" target="_blank" rel="noopener"
               onclick="trackDL('${g.manual}')">
              📖 Ver reglamento
            </a>
            <button type="button" class="btn btn-outline btn-sm view-sellsheet"
              data-src="${g.sellSheet}" data-type="image" data-title="${g.title} — Sell Sheet">
              🖼️ Ver Sell Sheet
            </button>
          </div>
        </div>
      </article>
    `).join('');
    observeFadeIn();
  }

  fetch('data/games.json')
    .then(r => r.json())
    .then(renderGames)
    .catch(err => {
      console.error('Error loading games:', err);
      if (gamesGrid) gamesGrid.innerHTML = '<p style="text-align:center;color:#999;">No se pudieron cargar los juegos.</p>';
    });

  /* =====================
     LOAD COMICS (dynamic)
     ===================== */
  const comicsGrid = document.getElementById('comicsGrid');

  function renderComics(comics) {
    if (!comicsGrid) return;
    comics.sort((a, b) => a.order - b.order);
    comicsGrid.innerHTML = comics.map(c => `
      <div class="comic-card fade-in">
        <div class="comic-icon">📚</div>
        <h4>${c.title}</h4>
        <p>${c.description}</p>
        <a href="${c.file}" class="btn-download" target="_blank" rel="noopener"
           onclick="trackDL('${c.file}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          Descargar PDF
        </a>
      </div>
    `).join('');
    observeFadeIn();
  }

  fetch('data/comics.json')
    .then(r => r.json())
    .then(renderComics)
    .catch(err => {
      console.error('Error loading comics:', err);
      if (comicsGrid) comicsGrid.innerHTML = '<p style="text-align:center;color:#999;">No se pudieron cargar los cómics.</p>';
    });

  /* =====================
     LOAD SOCIAL (dynamic)
     ===================== */
  const footerSocial = document.getElementById('footerSocial');

  const socialIcons = {
    tiktok: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.2a8.18 8.18 0 005.58 2.17V12a4.83 4.83 0 01-3.77-1.55V6.69h3.77z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.19a3 3 0 00-2.12-2.12C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.57A3 3 0 00.5 6.19 31.25 31.25 0 000 12a31.25 31.25 0 00.5 5.81 3 3 0 002.12 2.12c1.84.57 9.38.57 9.38.57s7.54 0 9.38-.57a3 3 0 002.12-2.12A31.25 31.25 0 0024 12a31.25 31.25 0 00-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>`,
    facebook: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.33l-.53 3.49h-2.8v8.44C19.61 23.08 24 18.09 24 12.07z"/></svg>`,
    twitter: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`
  };

  function renderSocial(socials) {
    if (!footerSocial) return;
    const existingH5 = footerSocial.querySelector('h5');
    const ul = document.createElement('ul');
    ul.className = 'footer-social-list';
    socials.sort((a, b) => a.order - b.order);
    socials.forEach(s => {
      const li = document.createElement('li');
      li.innerHTML = `
        <a href="${s.url}" class="social-link" target="_blank" rel="noopener" title="${s.name}">
          ${socialIcons[s.icon] || ''}
          <span>${s.name}</span>
        </a>
      `;
      ul.appendChild(li);
    });
    if (existingH5) {
      existingH5.after(ul);
    } else {
      footerSocial.appendChild(ul);
    }
  }

  fetch('data/social.json')
    .then(r => r.json())
    .then(renderSocial)
    .catch(err => console.error('Error loading social:', err));

  /* =====================
     CONTACT FORM + EmailJS
     ===================== */
  const contactForm  = document.getElementById('contactForm');
  const charCounter  = document.getElementById('charCounter');
  const messageField = document.getElementById('contactMessage');
  const formStatus   = document.getElementById('formStatus');
  const submitBtn    = document.getElementById('submitBtn');
  const clearBtn     = document.getElementById('clearBtn');

  // Character counter
  if (messageField && charCounter) {
    messageField.addEventListener('input', () => {
      const len = messageField.value.length;
      charCounter.textContent = `(${len} / 1000)`;
      charCounter.style.color = len > 900 ? '#b42828' : '';
    });
  }

  // Clear button
  if (clearBtn && contactForm) {
    clearBtn.addEventListener('click', () => {
      contactForm.reset();
      if (charCounter) charCounter.textContent = '(0 / 1000)';
      if (formStatus) { formStatus.className = 'form-status'; formStatus.style.display = 'none'; }
    });
  }

  /**
   * sendEmail — Envía DOS correos vía EmailJS:
   *   1) Notificación al admin (gatitosboticarios@gmail.com + copia a jm.clavijo.diaz@gmail.com)
   *   2) Auto-reply de confirmación al usuario
   *
   * @param {Object} params - { contact_type, name, email, message }
   * @returns {Promise<boolean>} true si el email principal se envió, false en caso de error
   */
  async function sendEmail({ contact_type, name, email, message }) {
    if (typeof emailjs === 'undefined') {
      console.warn('[App] EmailJS no disponible, usando fallback mailto');
      const subject = encodeURIComponent(`[${contact_type}] Contacto de ${name}`);
      const body = encodeURIComponent(
        `Tipo: ${contact_type}\nNombre: ${name}\nCorreo: ${email}\n\nMensaje:\n${message}`
      );
      window.open(
        `mailto:gatitosboticarios@gmail.com,jm.clavijo.diaz@gmail.com?subject=${subject}&body=${body}`,
        '_blank'
      );
      return true; // fallback abierto
    }

    // Build timestamp for template
    const now = new Date();
    const timeStr = now.toLocaleString('es-CL', { dateStyle: 'long', timeStyle: 'short' });

    // 1) Email de NOTIFICACIÓN al admin
    //    Template template_e8vw94n usa: {{name}}, {{email}}, {{title}}, {{time}}, {{message}}
    //    To Email: gatitosboticarios@gmail.com (configurado en el template)
    //    Reply To: {{email}} (para responder directo al usuario)
    console.log('[App] Enviando email de notificación…');
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_NOTIFY, {
      contact_type: contact_type,
      name: name,
      email: email,
      title: contact_type,
      time: timeStr,
      message: message
    });
    console.log('[App] ✅ Email de notificación enviado');

    // 2) Email de AUTO-REPLY al usuario
    //    Template template_mwatmj1 — confirmación automática
    try {
      console.log('[App] Enviando auto-reply al usuario…');
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_AUTOREPLY, {
        name: name,
        email: email,
        contact_type: contact_type
      });
      console.log('[App] ✅ Auto-reply enviado');
    } catch (replyErr) {
      // No bloqueante: si el auto-reply falla, el formulario sigue siendo exitoso
      console.warn('[App] ⚠️ Auto-reply no enviado:', replyErr);
    }

    return true;
  }

  // Form submission handler
  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const type    = document.getElementById('contactType').value;
      const name    = document.getElementById('contactName').value.trim();
      const email   = document.getElementById('contactEmail').value.trim();
      const message = document.getElementById('contactMessage').value.trim();

      // ── Validación ──
      if (!type || !name || !email || !message) {
        showStatus('Por favor completa todos los campos.', 'error');
        return;
      }
      if (message.length > 1000) {
        showStatus('El mensaje no puede superar los 1000 caracteres.', 'error');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showStatus('Por favor ingresa un correo válido.', 'error');
        return;
      }

      // ── Loading state ──
      submitBtn.querySelector('.btn-text').style.display = 'none';
      submitBtn.querySelector('.btn-loading').style.display = 'inline';
      submitBtn.disabled = true;

      // ══════════════════════════════════════════════════════════════
      // ✅ FIX CRÍTICO: trackFormSubmission() se llama ANTES de sendEmail()
      //    Así la métrica se registra SIEMPRE, incluso si EmailJS falla
      //    (ej: 412 Gmail_API insufficient scopes, red caída, etc.)
      // ══════════════════════════════════════════════════════════════
      Metrics.trackFormSubmission();

      try {
        const sent = await sendEmail({
          contact_type: type,
          name: name,
          email: email,
          message: message
        });

        if (sent) {
          if (typeof emailjs !== 'undefined') {
            showStatus('✅ ¡Mensaje enviado con éxito! Te enviaremos una confirmación a tu correo.', 'success');
          } else {
            showStatus('✅ Se abrió tu cliente de correo. Si no se abrió, escríbenos directamente a gatitosboticarios@gmail.com', 'success');
          }
        }

        contactForm.reset();
        if (charCounter) charCounter.textContent = '(0 / 1000)';

      } catch (err) {
        console.error('[App] Error al enviar email:', err);
        showStatus(
          '❌ Error al enviar el correo, pero tu mensaje fue registrado. ' +
          'Escríbenos directamente a gatitosboticarios@gmail.com',
          'error'
        );
      } finally {
        submitBtn.querySelector('.btn-text').style.display = 'inline';
        submitBtn.querySelector('.btn-loading').style.display = 'none';
        submitBtn.disabled = false;
      }
    });
  }

  function showStatus(msg, type) {
    if (!formStatus) return;
    formStatus.textContent = msg;
    formStatus.className = `form-status ${type}`;
    formStatus.style.display = 'block';
    setTimeout(() => { formStatus.style.display = 'none'; }, 8000);
  }

  /* =====================
     VIEWER / LIGHTBOX
     ===================== */
  const viewerModal = document.getElementById('viewerModal');
  if (viewerModal) {
    const viewerTitle = document.getElementById('viewerTitle');
    const viewerImage = document.getElementById('viewerImage');
    const viewerPDF   = document.getElementById('viewerPDF');
    const downloadBtn = document.getElementById('downloadBtn');
    const overlay     = viewerModal.querySelector('.modal-overlay');
    const btnClose    = viewerModal.querySelector('.modal-close');

    function openViewer(src, type, title) {
      viewerTitle.textContent = title || '';
      if (type === 'pdf') {
        viewerImage.style.display = 'none';
        viewerImage.src = '';
        viewerPDF.style.display = 'block';
        viewerPDF.src = src;
      } else {
        viewerPDF.style.display = 'none';
        viewerPDF.src = '';
        viewerImage.style.display = 'block';
        viewerImage.src = src;
        viewerImage.alt = title || 'Imagen';
      }
      downloadBtn.href = src;
      viewerModal.setAttribute('aria-hidden', 'false');
      document.documentElement.style.overflow = 'hidden';
      btnClose.focus();
    }

    function closeViewer() {
      viewerModal.setAttribute('aria-hidden', 'true');
      document.documentElement.style.overflow = '';
      viewerPDF.src = '';
      viewerImage.src = '';
    }

    document.addEventListener('click', function (e) {
      const btn = e.target.closest('.view-sellsheet');
      if (btn) {
        e.preventDefault();
        openViewer(btn.dataset.src, btn.dataset.type || 'image', btn.dataset.title || '');
      }
    });

    overlay.addEventListener('click', closeViewer);
    btnClose.addEventListener('click', closeViewer);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && viewerModal.getAttribute('aria-hidden') === 'false') {
        closeViewer();
      }
    });
  }

  /* =====================
     FADE-IN ON SCROLL
     ===================== */
  function observeFadeIn() {
    const els = document.querySelectorAll('.fade-in:not(.visible)');
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('visible'));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
  }

  observeFadeIn();

  console.log('[App] Universo Gatitos Boticarios — sitio cargado');
});
