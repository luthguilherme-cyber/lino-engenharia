const preloader = document.querySelector('#preloader');
const seenIntro = sessionStorage.getItem('lino-intro-seen');

if (seenIntro) {
  preloader.classList.add('is-hidden');
} else {
  window.setTimeout(() => {
    preloader.classList.add('is-hidden');
    sessionStorage.setItem('lino-intro-seen', 'true');
  }, 360);
}

const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const menuIcon = menuToggle.querySelector('use');

function closeMenu() {
  mobileNav.classList.remove('open');
  mobileNav.inert = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menu');
  menuIcon.setAttribute('href', '#i-menu');
  document.body.classList.remove('menu-open');
}

menuToggle.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  mobileNav.inert = !isOpen;
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  menuIcon.setAttribute('href', isOpen ? '#i-close' : '#i-menu');
  document.body.classList.toggle('menu-open', isOpen);
});

mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });

let headerTicking = false;
window.addEventListener('scroll', () => {
  if (headerTicking) return;
  headerTicking = true;
  requestAnimationFrame(() => {
    header.classList.toggle('scrolled', window.scrollY > 12);
    headerTicking = false;
  });
}, { passive: true });

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reducedMotion && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('reveal-ready');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8%', threshold: .08 });
  document.querySelectorAll('[data-reveal]').forEach((item) => revealObserver.observe(item));
}

const navSections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.desktop-nav a')];
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -55%', threshold: 0 });
navSections.forEach((section) => navObserver.observe(section));

const quiz = document.querySelector('#quick-quiz');
const quizProgress = document.querySelector('.quiz-progress i');
const quizCounter = document.querySelector('.quiz-head > span');
const quizSummary = document.querySelector('.quiz-summary');
const shareQuiz = document.querySelector('.share-whatsapp');
const answers = {};
const answerKeys = ['serviço', 'tipo de imóvel', 'região', 'prazo'];

function showQuizStep(step) {
  quiz.querySelectorAll('.quiz-step').forEach((panel) => panel.classList.toggle('active', Number(panel.dataset.step) === step));
  if (step <= 4) {
    quizCounter.innerHTML = `Passo <strong>${String(step).padStart(2, '0')}</strong> de 04`;
    quizProgress.style.width = `${step * 25}%`;
  } else {
    quizCounter.innerHTML = 'Resumo <strong>pronto</strong>';
    quizProgress.style.width = '100%';
  }
}

function finishQuiz() {
  const summary = `Serviço: ${answers['serviço']}. Imóvel/local: ${answers['tipo de imóvel']}. Região: ${answers['região']}. Prazo: ${answers['prazo']}.`;
  quizSummary.textContent = summary;
  const message = `Olá, Eng. Raphael Lino! Gostaria de conversar sobre uma necessidade.\n\n${summary}\n\nAguardo sua orientação.`;
  shareQuiz.href = `https://wa.me/?text=${encodeURIComponent(message)}`;
  showQuizStep(5);
}

quiz.querySelectorAll('.quiz-option, .choice').forEach((button) => {
  button.addEventListener('click', () => {
    const currentStep = Number(button.closest('.quiz-step').dataset.step);
    answers[answerKeys[currentStep - 1]] = button.dataset.value;
    if (currentStep === 4) finishQuiz();
    else showQuizStep(currentStep + 1);
  });
});

document.querySelector('.restart-quiz').addEventListener('click', () => {
  Object.keys(answers).forEach((key) => delete answers[key]);
  showQuizStep(1);
});

const filterButtons = [...document.querySelectorAll('.filter-button')];
const projectCards = [...document.querySelectorAll('.project-card')];
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((item) => item.classList.toggle('active', item === button));
    projectCards.forEach((card) => {
      card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
    });
    document.querySelector('.project-grid').scrollTo({ left: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  });
});

const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox.querySelector('img');
document.querySelectorAll('.project-image').forEach((button) => {
  button.addEventListener('click', () => {
    lightboxImage.src = button.dataset.full;
    lightboxImage.alt = button.dataset.alt;
    lightbox.showModal();
  });
});
document.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });

document.querySelectorAll('.accordion details').forEach((detail) => {
  detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    document.querySelectorAll('.accordion details').forEach((other) => { if (other !== detail) other.removeAttribute('open'); });
  });
});

document.querySelector('#current-year').textContent = new Date().getFullYear();
