
(() => {
  'use strict';

  // ==========================================
  // PixelForge Studio — Interactive UI
  // ==========================================

  const body = document.body;
  const menuButton = document.querySelector('.nav__toggle');
  const navMenu = document.querySelector('.nav__menu');
  const themeButton = document.querySelector('.theme-toggle');
  const faqButtons = document.querySelectorAll('.faq-question');
  const counters = document.querySelectorAll('[data-target]');
  const form = document.querySelector('.contact-form');
  const formMessage = document.getElementById('form-message');

  const prefersReducedMotion =
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  // ==========================================
  // 1. Theme Toggle
  // ==========================================

  const setTheme = (theme, persist = true) => {
    const selectedTheme = theme === 'light' ? 'light' : 'dark';

    body.setAttribute('data-theme', selectedTheme);

    if (themeButton) {
      themeButton.textContent =
        selectedTheme === 'light' ? 'Dark mode' : 'Light mode';

      themeButton.setAttribute(
        'aria-label',
        `Switch to ${selectedTheme === 'light' ? 'dark' : 'light'} mode`
      );
    }

    if (persist) {
      try {
        localStorage.setItem('site-theme', selectedTheme);
      } catch (error) {
        // The theme still works when browser storage is unavailable.
      }
    }
  };

  let savedTheme = null;

  try {
    savedTheme = localStorage.getItem('site-theme');
  } catch (error) {
    // Use the default theme if browser storage is unavailable.
  }

  setTheme(savedTheme || 'dark', false);

  themeButton?.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
  });

  // ==========================================
  // 2. Mobile Navigation
  // ==========================================

  const closeMenu = () => {
    if (!menuButton || !navMenu) return;

    navMenu.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
  };

  if (menuButton && navMenu) {
    menuButton.setAttribute('aria-expanded', 'false');

    menuButton.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });

    // Close the menu after selecting a navigation link.
    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    // Allow keyboard users to close the menu with Escape.
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });

    // Keep the menu state sensible when switching to desktop layout.
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    });
  }

  // ==========================================
  // 3. FAQ Accordion
  // ==========================================

  const getAnswer = (button) => {
    const answer = button.nextElementSibling;

    return answer?.classList.contains('faq-answer') ? answer : null;
  };

  const closeFAQ = (button) => {
    const answer = getAnswer(button);

    button.setAttribute('aria-expanded', 'false');

    if (answer) {
      answer.style.maxHeight = '0px';
    }
  };

  const openFAQ = (button) => {
    const answer = getAnswer(button);

    button.setAttribute('aria-expanded', 'true');

    if (answer) {
      answer.style.maxHeight = `${answer.scrollHeight}px`;
    }
  };

  faqButtons.forEach((button) => {
    const answer = getAnswer(button);

    if (!answer) return;

    const initiallyOpen = button.getAttribute('aria-expanded') === 'true';

    button.setAttribute('aria-expanded', String(initiallyOpen));
    answer.style.maxHeight = initiallyOpen
      ? `${answer.scrollHeight}px`
      : '0px';

    button.addEventListener('click', () => {
      const isOpen = button.getAttribute('aria-expanded') === 'true';

      // Close all FAQ items first.
      faqButtons.forEach(closeFAQ);

      // Open the selected item only if it was previously closed.
      if (!isOpen) {
        openFAQ(button);
      }
    });
  });

  // Recalculate expanded answers when the layout changes.
  window.addEventListener('resize', () => {
    faqButtons.forEach((button) => {
      if (button.getAttribute('aria-expanded') === 'true') {
        const answer = getAnswer(button);

        if (answer) {
          answer.style.maxHeight = `${answer.scrollHeight}px`;
        }
      }
    });
  });

  // ==========================================
  // 4. Animated Statistics Counters
  // ==========================================

  const animateCounter = (element) => {
    const target = Number(element.dataset.target);

    if (!Number.isFinite(target)) return;

    // Preserve a suffix such as "%" from the original markup,
    // or specify one explicitly using data-suffix.
    const originalText = element.textContent.trim();
    const suffixMatch = originalText.match(/[%+]$/);
    const suffix = element.dataset.suffix ?? suffixMatch?.[0] ?? '';

    const decimalPlaces = Math.min(
      (String(target).split('.')[1] || '').length,
      4
    );

    if (prefersReducedMotion) {
      element.textContent = `${target.toFixed(decimalPlaces)}${suffix}`;
      return;
    }

    const duration = 1200;
    const startTime = performance.now();

    const step = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Ease-out animation.
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = target * easedProgress;

      element.textContent =
        `${currentValue.toFixed(decimalPlaces)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = `${target.toFixed(decimalPlaces)}${suffix}`;
      }
    };

    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );

    counters.forEach((counter) => {
      const target = Number(counter.dataset.target);

      if (!Number.isFinite(target)) return;

      const originalText = counter.textContent.trim();
      const suffixMatch = originalText.match(/[%+]$/);
      const suffix = counter.dataset.suffix ?? suffixMatch?.[0] ?? '';

      counter.textContent = `0${suffix}`;
      counterObserver.observe(counter);
    });
  } else {
    // Fallback for browsers without IntersectionObserver.
    counters.forEach(animateCounter);
  }

  // ==========================================
  // 5. Contact Form Validation
  // ==========================================

  const showFormMessage = (message, type) => {
    if (!formMessage) return;

    formMessage.textContent = message;
    formMessage.setAttribute('role', type === 'error' ? 'alert' : 'status');
    formMessage.setAttribute('aria-live', 'polite');

    formMessage.style.color =
      type === 'error' ? '#f87171' : '#34d399';
  };

  form?.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const message = String(formData.get('message') || '').trim();

    if (!name || !email || !message) {
      showFormMessage(
        'Please complete all required fields before submitting.',
        'error'
      );
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      showFormMessage(
        'Please enter a valid email address.',
        'error'
      );
      return;
    }

    // This static demo validates the form but does not send data
    // to a server. Connect a backend or form service to enable delivery.
    showFormMessage(
      'Your details passed validation. This demo does not send messages yet.',
      'success'
    );

    form.reset();
  });

})();
