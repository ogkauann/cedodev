// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔄 DOM carregado, iniciando script...');

  // ===== VARIÁVEIS GLOBAIS (DENTRO DO DOM READY) =====
  const navToggle = document.querySelector('.nav-toggle');
  const navIcon = navToggle?.querySelector('i');
  const menu = document.getElementById('menu');
  const year = document.getElementById('year');
  const downloadCV = document.getElementById('downloadCV');
  const header = document.querySelector('.site-header');
  const themeToggle = document.getElementById('themeToggle');

  // Configuração inicial
  if (year) year.textContent = new Date().getFullYear();

  // ===== SISTEMA DE TEMA MELHORADO =====
  function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  }

  function updateThemeIcon(theme) {
    const icon = themeToggle?.querySelector('i');
    if (icon) {
      icon.className = theme === 'light' ? 'bx bx-moon' : 'bx bx-sun';
    }
  }

  themeToggle?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });

  // Detectar mudanças de preferência do sistema
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      const newTheme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      updateThemeIcon(newTheme);
    }
  });

  initTheme();

  // ===== NAVEGAÇÃO MOBILE =====
  if (navToggle && menu) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      menu.classList.toggle('open');
      if (navIcon) navIcon.className = menu.classList.contains('open') ? 'bx bx-x' : 'bx bx-menu';
    });

    // Fechar menu ao clicar fora
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !navToggle.contains(e.target)) {
        menu.classList.remove('open');
      }
    });
  }

  // ===== SCROLL SUAVE =====
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        e.preventDefault();
        const target = document.querySelector(id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          menu?.classList.remove('open');
        }
      }
    });
  });

  // ===== DOWNLOAD CV =====
  downloadCV?.addEventListener('click', (e) => {
    e.preventDefault();
    const link = document.createElement('a');
    link.href = 'cv.pdf';
    link.download = 'CV-Dev.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
  });

  // ===== INTERSECTION OBSERVER PARA ANIMAÇÕES =====
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { root: null, threshold: 0.15 });

  // Observar elementos da timeline
  document.querySelectorAll('#journey .reveal').forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i * 80, 240)}ms`;
    revealObserver.observe(el);
  });

  // Observar cards de projetos
  document.querySelectorAll('#projects .project-card').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${Math.min(i * 60, 240)}ms`;
    revealObserver.observe(el);
  });

  // ===== SCROLLSPY E HEADER STATE =====
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

  // ===== HEADER E PROGRESS SCROLL =====
  const progress = document.getElementById('scrollProgress');
  
  function updateScrollEffects() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 10);
    
    if (progress) {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      progress.style.transform = `scaleX(${pct / 100})`;
    }
  }

  updateScrollEffects();
  window.addEventListener('scroll', updateScrollEffects, { passive: true });

  // ===== CARREGAMENTO DE PROJETOS GITHUB =====
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

    // Mostrar skeletons
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
      article.setAttribute('data-category', repo.language?.toLowerCase() || 'other');

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

      revealObserver.observe(article);
    });
  }

  // Carregar projetos
  loadGitHubProjects();

  // ===== FORMULÁRIO DE CONTATO MELHORADO =====
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = submitBtn?.querySelector('.btn-text');
  const btnLoading = submitBtn?.querySelector('.btn-loading');

  contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Estado de loading
    if (submitBtn) {
      submitBtn.disabled = true;
      if (btnText) btnText.style.display = 'none';
      if (btnLoading) btnLoading.style.display = 'flex';
    }
    
    if (formStatus) {
      formStatus.className = 'form-status loading';
      formStatus.textContent = 'Enviando mensagem...';
      formStatus.style.display = 'block';
    }
    
    try {
      const formData = new FormData(contactForm);
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        if (formStatus) {
          formStatus.className = 'form-status success';
          formStatus.textContent = '✅ Mensagem enviada com sucesso! Entrarei em contato em breve.';
          formStatus.style.display = 'block';
        }
        contactForm.reset();
      } else {
        throw new Error('Erro no envio');
      }
    } catch (error) {
      if (formStatus) {
        formStatus.className = 'form-status error';
        formStatus.textContent = '❌ Erro ao enviar mensagem. Tente novamente ou entre em contato diretamente.';
        formStatus.style.display = 'block';
      }
    } finally {
      // Restaurar botão
      if (submitBtn) {
        submitBtn.disabled = false;
        if (btnText) btnText.style.display = 'inline';
        if (btnLoading) btnLoading.style.display = 'none';
      }
      
      // Auto-hide status após sucesso/erro
      setTimeout(() => {
        if (formStatus) formStatus.style.display = 'none';
      }, 5000);
    }
  });

  // ===== SISTEMA DE FILTROS MELHORADO =====
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Atualizar estado dos botões
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.getAttribute('data-filter');
      const projects = document.querySelectorAll('.project-card');
      
      projects.forEach((project, index) => {
        project.classList.add('filter-transition');
        const categories = project.getAttribute('data-category') || '';
        const shouldShow = filter === 'all' || categories.includes(filter);
        
        if (shouldShow) {
          project.style.display = 'flex';
          setTimeout(() => {
            project.classList.remove('fade-out');
            project.classList.add('fade-in');
            project.style.animation = `fadeInUp 0.5s ease-out ${index * 0.1}s both`;
          }, 10);
        } else {
          project.classList.remove('fade-in');
          project.classList.add('fade-out');
          setTimeout(() => {
            project.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // ===== ADICIONAR ESTILOS DE ANIMAÇÃO =====
  const animationStyle = document.createElement('style');
  animationStyle.textContent = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .reveal {
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.6s ease-out;
    }
    
    .reveal.is-visible {
      opacity: 1;
      transform: translateY(0);
    }
    
    .filter-transition {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .filter-transition.fade-out {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    
    .filter-transition.fade-in {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  `;
  document.head.appendChild(animationStyle);

  // ===== FINALIZAÇÃO =====
  // Registrar Service Worker para PWA (de forma segura)
  if ('serviceWorker' in navigator) {
    // Aguardar um pouco antes de registrar o SW para não interferir no loading inicial
    setTimeout(async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SW: Service Worker registrado com sucesso', registration.scope);
        
        // Verificar por atualizações
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('SW: Nova versão disponível');
            }
          });
        });
        
      } catch (error) {
        console.log('SW: Falha ao registrar Service Worker:', error);
      }
    }, 2000);
  }

  // Solicitar permissão para notificações (opcional)
  if ('Notification' in window && 'serviceWorker' in navigator) {
    if (Notification.permission === 'default') {
      // Não solicitar automaticamente - apenas preparar
      console.log('PWA: Notificações disponíveis');
    }
  }

  // Detectar instalação da PWA
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('PWA: Prompt de instalação disponível');
    
    // Criar botão de instalação personalizado (opcional)
    createInstallButton();
  });

  function createInstallButton() {
    const installBtn = document.createElement('button');
    installBtn.textContent = '📱 Instalar App';
    installBtn.className = 'btn btn-secondary install-pwa-btn';
    installBtn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      border-radius: 50px;
      padding: 12px 24px;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      display: none;
    `;
    
    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('PWA: Escolha do usuário:', outcome);
        deferredPrompt = null;
        installBtn.style.display = 'none';
      }
    });
    
    document.body.appendChild(installBtn);
    
    // Mostrar botão após um tempo
    setTimeout(() => {
      if (deferredPrompt) {
        installBtn.style.display = 'block';
      }
    }, 5000);
  }

  console.log('🎉 CedoDev Portfolio carregado com sucesso!');

});

// ===== FIM DO ARQUIVO =====


