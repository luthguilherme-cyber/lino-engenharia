const preloader = document.querySelector('#preloader');
const loadingStartedAt = performance.now();
let loadingFinished = false;

function finishLoading() {
  if (loadingFinished) return;
  loadingFinished = true;
  const minimumVisibleTime = 650;
  const remaining = Math.max(0, minimumVisibleTime - (performance.now() - loadingStartedAt));
  window.setTimeout(() => {
    preloader.classList.add('is-hidden');
    document.body.classList.remove('is-loading');
  }, remaining);
}

window.addEventListener('load', finishLoading, { once: true });
window.setTimeout(finishLoading, 2600);

const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const menuIcon = menuToggle.querySelector('use');

function closeMenu() {
  mobileNav.classList.remove('open');
  mobileNav.setAttribute('aria-hidden', 'true');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menu');
  menuIcon.setAttribute('href', '#i-menu');
  document.body.classList.remove('menu-open');
}

menuToggle.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  mobileNav.setAttribute('aria-hidden', String(!isOpen));
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  menuIcon.setAttribute('href', isOpen ? '#i-close' : '#i-menu');
  document.body.classList.toggle('menu-open', isOpen);
});

mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

const pageProgress = document.querySelector('.page-progress span');
const hero = document.querySelector('.hero');
const heroPerson = document.querySelector('.hero-person img');
let scrollTicking = false;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function updateScrollEffects() {
  header.classList.toggle('scrolled', window.scrollY > 24);
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
  pageProgress.style.transform = `scaleX(${progress})`;

  if (!reducedMotion && window.scrollY < hero.offsetHeight) {
    const heroProgress = Math.min(1, window.scrollY / hero.offsetHeight);
    hero.style.setProperty('--hero-bg-shift', `${heroProgress * 34}px`);
    heroPerson.style.setProperty('--portrait-shift', `${heroProgress * 18}px`);
  }
  scrollTicking = false;
}

function requestScrollUpdate() {
  if (!scrollTicking) {
    scrollTicking = true;
    requestAnimationFrame(updateScrollEffects);
  }
}
window.addEventListener('scroll', requestScrollUpdate, { passive: true });
updateScrollEffects();

document.querySelectorAll('main > section').forEach((section) => {
  section.querySelectorAll('.reveal').forEach((item, index) => {
    item.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 85}ms`);
  });
});
document.querySelector('.hero-copy')?.setAttribute('data-reveal', 'left');
document.querySelector('.hero-person')?.setAttribute('data-reveal', 'scale');
document.querySelector('.quick-diagnosis')?.setAttribute('data-reveal', 'right');
document.querySelector('.portrait-wrap')?.setAttribute('data-reveal', 'left');
document.querySelector('.authority-copy')?.setAttribute('data-reveal', 'right');
document.querySelector('.video-copy')?.setAttribute('data-reveal', 'left');
document.querySelector('.video-frame')?.setAttribute('data-reveal', 'right');
document.querySelector('.contact-copy')?.setAttribute('data-reveal', 'left');
document.querySelector('.contact-form')?.setAttribute('data-reveal', 'right');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);
document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));

if (window.location.hash) {
  window.setTimeout(() => {
    document.querySelector(window.location.hash)?.querySelectorAll('.reveal').forEach((item) => item.classList.add('visible'));
  }, 500);
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

if (!reducedMotion && window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.project-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--tilt-x', `${y * -2.4}deg`);
      card.style.setProperty('--tilt-y', `${x * 2.4}deg`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  });
}

const quiz = document.querySelector('#quick-quiz');
const progress = document.querySelector('.progress-track span');
const stepCount = document.querySelector('.quiz-step-count');
const quizSummary = document.querySelector('.quiz-summary');
const shareQuiz = document.querySelector('.share-whatsapp');
const answers = {};
const answerKeys = ['serviço', 'tipo de imóvel', 'região', 'prazo'];

function showQuizStep(step) {
  quiz.querySelectorAll('.quiz-step').forEach((panel) => {
    panel.classList.toggle('active', Number(panel.dataset.step) === step);
  });

  if (step <= 4) {
    stepCount.innerHTML = `Passo <strong>${String(step).padStart(2, '0')}</strong>/04`;
    progress.style.width = `${step * 25}%`;
  } else {
    stepCount.innerHTML = 'Resumo <strong>pronto</strong>';
    progress.style.width = '100%';
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

const filters = document.querySelectorAll('.filter-button');
const projects = document.querySelectorAll('.project-card');
const showMore = document.querySelector('.show-more-projects');
let expandedProjects = false;
let activeFilter = 'all';

function applyProjectFilter() {
  projects.forEach((card) => {
    const categoryMatches = activeFilter === 'all' || card.dataset.category === activeFilter;
    const visibilityMatches = expandedProjects || !card.classList.contains('extra-project');
    card.classList.toggle('filtered-out', !categoryMatches || !visibilityMatches);
    if (card.classList.contains('extra-project')) card.classList.toggle('visible', expandedProjects && categoryMatches);
  });
}

filters.forEach((button) => {
  button.addEventListener('click', () => {
    filters.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    activeFilter = button.dataset.filter;
    applyProjectFilter();
  });
});

showMore.addEventListener('click', () => {
  expandedProjects = !expandedProjects;
  showMore.textContent = expandedProjects ? 'Mostrar menos' : 'Ver mais registros';
  applyProjectFilter();
});
applyProjectFilter();

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
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});

document.querySelectorAll('.accordion details').forEach((detail) => {
  detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    document.querySelectorAll('.accordion details').forEach((other) => {
      if (other !== detail) other.removeAttribute('open');
    });
  });
});

document.querySelector('#contact-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const message = `Olá, Eng. Raphael Lino! Meu nome é ${data.get('nome')}.\n\nServiço: ${data.get('servico')}\nDescrição: ${data.get('mensagem')}\n\nGostaria de receber uma orientação sobre o próximo passo.`;
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
});

document.querySelector('#current-year').textContent = new Date().getFullYear();
