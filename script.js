const navToggle = document.querySelector('.nav-toggle');
const navIcon = navToggle?.querySelector('i');
const menu = document.getElementById('menu');
const year = document.getElementById('year');
const downloadCV = document.getElementById('downloadCV');
const header = document.querySelector('.site-header');

year.textContent = new Date().getFullYear();

if (navToggle) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    menu.classList.toggle('open');
    if (navIcon) navIcon.className = menu.classList.contains('open') ? 'bx bx-x' : 'bx bx-menu';
  });
}

document.addEventListener('click', (e) => {
  if (!menu.contains(e.target) && !navToggle.contains(e.target)) menu.classList.remove('open');
});

// Smooth scroll para âncoras internas
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      e.preventDefault();
      document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      menu.classList.remove('open');
    }
  });
});

// Ação de download do CV (substitua pelo seu arquivo)
downloadCV?.addEventListener('click', (e) => {
  e.preventDefault();
  const link = document.createElement('a');
  link.href = 'cv.pdf';
  link.download = 'CV-Dev.pdf';
  document.body.appendChild(link);
  link.click();
  link.remove();
});

// IntersectionObserver para revelar itens da timeline
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { root: null, threshold: 0.15 });

document.querySelectorAll('#journey .reveal').forEach((el, i) => {
  el.style.transitionDelay = `${Math.min(i * 80, 240)}ms`;
  observer.observe(el);
});

// Reveal para cards de projetos
document.querySelectorAll('#projects .project-card').forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${Math.min(i * 60, 240)}ms`;
  observer.observe(el);
});

// Scrollspy + header state
const sections = [
  { id: '#home', link: 'a[href="#home"]' },
  { id: '#skills', link: 'a[href="#skills"]' },
  { id: '#projects', link: 'a[href="#projects"]' },
  { id: '#journey', link: 'a[href="#journey"]' },
  { id: '#contact', link: 'a[href="#contact"]' }
];

const spy = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const nav = document.querySelector(`.menu ${sections.find(s => s.id === `#${entry.target.id}`)?.link || ''}`);
    if (!nav) return;
    if (entry.isIntersecting) {
      document.querySelectorAll('.menu a').forEach(a => a.classList.remove('active'));
      nav.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 });

sections.forEach(s => {
  const el = document.querySelector(s.id);
  if (el) spy.observe(el);
});

// Header scrolled
window.addEventListener('scroll', () => {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 10);
});

// Barra de progresso do scroll
const progress = document.getElementById('scrollProgress');

function updateProgress() {
  if (!progress) return;
  
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  
  progress.style.transform = `scaleX(${pct / 100})`;
  progress.style.transition = prefersReduced ? 'none' : 'transform 0.1s linear';
}

updateProgress();
window.addEventListener('scroll', updateProgress, { passive: true });

// -------- GitHub Projects (cache 24h) --------
async function loadGitHubProjects() {
  const container = document.getElementById('projects-list');
  if (!container) return;
  const username = container.getAttribute('data-github-username') || 'ogkauann';

  const cacheKey = `gh-projects:${username}`;
  const cacheTsKey = `${cacheKey}:ts`;
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const cached = localStorage.getItem(cacheKey);
  const cachedTs = Number(localStorage.getItem(cacheTsKey) || 0);
  if (cached && now - cachedTs < dayMs) {
    renderProjects(JSON.parse(cached), container);
    return;
  }

  // skeletons
  container.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const sk = document.createElement('div');
    sk.className = 'skeleton';
    container.appendChild(sk);
  }

  try {
    const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=50&sort=updated`);
    if (!res.ok) throw new Error('GitHub API error');
    const repos = await res.json();
    // Seleciona 5 por critérios simples: stars desc, depois updated_at
    const top = repos
      .filter(r => !r.fork)
      .sort((a, b) => (b.stargazers_count - a.stargazers_count) || (new Date(b.updated_at) - new Date(a.updated_at)))
      .slice(0, 5);
    localStorage.setItem(cacheKey, JSON.stringify(top));
    localStorage.setItem(cacheTsKey, String(now));
    renderProjects(top, container);
  } catch (e) {
    console.error(e);
    container.innerHTML = '<p>Não foi possível carregar projetos no momento.</p>';
  }
}

function renderProjects(repos, container) {
  container.innerHTML = '';
  repos.forEach((repo, i) => {
    const article = document.createElement('article');
    article.className = 'project-card reveal';
    article.style.transitionDelay = `${Math.min(i * 60, 240)}ms`;

    const body = document.createElement('div');
    body.className = 'project-body';
    const h3 = document.createElement('h3');
    h3.textContent = repo.name.replace(/[-_]/g, ' ');
    const p = document.createElement('p');
    p.textContent = repo.description || 'Projeto no GitHub';

    const chips = document.createElement('div');
    chips.className = 'chips';
    const lang = document.createElement('span');
    lang.textContent = repo.language || 'Code';
    chips.appendChild(lang);
    if (repo.stargazers_count) {
      const s = document.createElement('span');
      s.textContent = `${repo.stargazers_count}★`;
      chips.appendChild(s);
    }

    const links = document.createElement('div');
    links.className = 'links';
    const aCode = document.createElement('a');
    aCode.href = repo.html_url;
    aCode.target = '_blank';
    aCode.rel = 'noopener';
    aCode.innerHTML = '<i class="bx bx-code-alt"></i> Code';
    links.appendChild(aCode);

    body.appendChild(h3);
    body.appendChild(p);
    body.appendChild(chips);
    body.appendChild(links);
    article.appendChild(body);
    container.appendChild(article);

    observer.observe(article);
  });
}

loadGitHubProjects();


