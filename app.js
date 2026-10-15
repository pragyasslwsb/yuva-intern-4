const body = document.body;
const menuButton = document.querySelector('.nav__toggle');
const navMenu = document.querySelector('.nav__menu');
const themeButton = document.querySelector('.theme-toggle');
const faqButtons = document.querySelectorAll('.faq-question');
const counters = document.querySelectorAll('[data-target]');
const form = document.querySelector('.contact-form');
const formMessage = document.getElementById('form-message');

const setTheme = (theme) => {
  body.setAttribute('data-theme', theme);
  const nextLabel = theme === 'light' ? 'Dark mode' : 'Light mode';
  if (themeButton) {
    themeButton.textContent = nextLabel;
  }
  localStorage.setItem('site-theme', theme);
};

const savedTheme = localStorage.getItem('site-theme');
if (savedTheme) {
  setTheme(savedTheme);
} else {
  setTheme('dark');
}

if (menuButton && navMenu) {
  menuButton.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });
}

themeButton?.addEventListener('click', () => {
  const currentTheme = body.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

faqButtons.forEach((button) => {
  const answer = button.nextElementSibling;
  const answerHeight = answer.scrollHeight;

  button.addEventListener('click', () => {
    const isOpen = button.getAttribute('aria-expanded') === 'true';

    faqButtons.forEach((item) => {
      const target = item.nextElementSibling;
      item.setAttribute('aria-expanded', 'false');
      target.style.maxHeight = '0px';
    });

    if (!isOpen) {
      button.setAttribute('aria-expanded', 'true');
      answer.style.maxHeight = `${answerHeight}px`;
    }
  });
});

const animateCounter = (element) => {
  const target = Number(element.dataset.target);
  const suffix = target % 1 !== 0 ? 1 : 0;
  const duration = 1200;
  const start = performance.now();

  const step = (time) => {
    const progress = Math.min((time - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = target * eased;

    element.textContent = `${currentValue.toFixed(suffix)}${target % 1 !== 0 ? '' : ''}`;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = `${target}${target % 1 !== 0 ? '' : ''}`;
    }
  };

  requestAnimationFrame(step);
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

counters.forEach((counter) => {
  const target = Number(counter.dataset.target);
  const suffix = target % 1 !== 0 ? '%' : '';
  counter.textContent = `0${suffix}`;
  observer.observe(counter);
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const name = (formData.get('name') || '').toString().trim();
  const email = (formData.get('email') || '').toString().trim();
  const message = (formData.get('message') || '').toString().trim();

  if (!name || !email || !message) {
    formMessage.textContent = 'Please complete all fields before submitting.';
    formMessage.style.color = '#f87171';
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    formMessage.textContent = 'Please enter a valid email address.';
    formMessage.style.color = '#f87171';
    return;
  }

  formMessage.textContent = 'Thanks! Your inquiry has been sent successfully.';
  formMessage.style.color = '#34d399';
  form.reset();
});
