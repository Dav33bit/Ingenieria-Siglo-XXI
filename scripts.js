document.addEventListener('DOMContentLoaded', function () {

  // --- SELECTORES SEGUROS ---
  const menu = document.querySelector('.menu');
  const menuToggle = document.getElementById('menu-toggle');
  // .navbar puede ser el nav; el menú desplegable suele ser el UL => preferimos el UL si existe
  const navbar = document.querySelector('.navbar');
  const navbarList = document.querySelector('.navbar ul') || navbar; // fallback
  const body = document.body;

  // --- FUNCIONES AUX ---
  function isOpen() {
    return navbarList && navbarList.classList.contains('active');
  }

  function openMobileMenu() {
    if (!navbarList) return;
    navbarList.classList.add('active');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
    body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (!navbarList) return;
    navbarList.classList.remove('active');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    body.style.overflow = '';
  }

  function toggleMobileMenu() {
    if (!navbarList) return;
    if (isOpen()) closeMobileMenu();
    else openMobileMenu();
  }

  // --- MENU MÓVIL: CLICK TOGGLE ---
  if (menuToggle) {
    menuToggle.addEventListener('click', function (e) {
      e.stopPropagation(); // evita que el document click cierre inmediatamente
      toggleMobileMenu();
    });
  }

  // Cerrar menu cuando clic en enlace (útil en móviles)
  if (navbarList) {
    const navLinks = navbarList.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });
  }

  // Cerrar al clicar fuera o presionar ESC
  document.addEventListener('click', function (event) {
    const target = event.target;
    const clickedOnToggle = menuToggle && (menuToggle === target || menuToggle.contains(target));
    const clickedInsideNav = navbarList && (navbarList === target || navbarList.contains(target));
    if (isOpen() && !clickedInsideNav && !clickedOnToggle) {
      closeMobileMenu();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && isOpen()) {
      closeMobileMenu();
    }
  });

  // --- SCROLL: clase scrolled en .menu ---
  if (menu) {
    window.addEventListener('scroll', function () {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > 50) menu.classList.add('scrolled');
      else menu.classList.remove('scrolled');
    }, { passive: true });
  }

  // --- MODAL (mejor control y trap de foco) ---
  const modal = document.getElementById('details-modal');
  if (modal) {
    const modalTitle = modal.querySelector('#modal-title');
    const modalDescriptionP = modal.querySelector('#modal-description');
    const clickableCards = document.querySelectorAll('.clickable-card');
    const modalCloseBtns = modal.querySelectorAll('[data-micromodal-close]');
    let previouslyFocused = null;

    function openModal(title, description) {
      previouslyFocused = document.activeElement;
      if (modalTitle) modalTitle.textContent = title || 'Detalles';
      if (modalDescriptionP) modalDescriptionP.textContent = description || '';
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      body.classList.add('modal-open');

      // focus primer elemento dentro del modal (si existe)
      const first = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (first) first.focus();
    }

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      body.classList.remove('modal-open');
      if (previouslyFocused) previouslyFocused.focus();
      previouslyFocused = null;
    }

    clickableCards.forEach(card => {
      card.addEventListener('click', function () {
        openModal(this.dataset.title, this.dataset.description);
      });

      // permitir apertura con teclado (Enter / Space)
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal(this.dataset.title, this.dataset.description);
        }
      });

      // si no es foco natural, añadir tabindex para accesibilidad
      if (card.tabIndex === -1) card.tabIndex = 0;
    });

    modalCloseBtns.forEach(btn => btn.addEventListener('click', closeModal));

    modal.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();

      // trap de foco simple
      if (e.key === 'Tab') {
        const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!first) return;
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    });
  }

  // --- PARALLAX (solo si background-image presente) ---
  const parallaxTarget = document.body;
  const parallaxIntensity = 0.1;
  function handleParallax() {
    if (!parallaxTarget) return;
    const bg = getComputedStyle(parallaxTarget).backgroundImage;
    if (!bg || bg === 'none') return;
    const scrollY = window.pageYOffset;
    parallaxTarget.style.backgroundPositionY = `${-(scrollY * parallaxIntensity)}px`;
  }
  window.addEventListener('scroll', handleParallax, { passive: true });

  // --- INTERSECTION OBSERVER para animaciones ---
  const animatedItems = document.querySelectorAll('.timeline-item-animate');
  if (animatedItems.length > 0) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { root: null, rootMargin: '0px 0px -50px 0px', threshold: 0.1 });
    animatedItems.forEach(i => observer.observe(i));
  }

  // --- PARTICLES (crea solo si existe contenedor) ---
  const particleContainer = document.getElementById('particle-container');
  if (particleContainer) {
    const particleCount = 40;
    particleContainer.innerHTML = ''; // limpiar
    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 2.5 + 0.5;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = `${Math.random() * 100}%`;
      p.style.top = `${Math.random() * 100}%`;
      const dur = Math.random() * 3 + 3;
      p.style.animation = `particle-fade ${dur}s infinite linear alternate`;
      p.style.animationDelay = `${Math.random() * dur}s`;
      particleContainer.appendChild(p);
    }
  }

}); // DOMContentLoaded end

