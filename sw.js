// ===== SERVICE WORKER PARA PWA =====
const CACHE_NAME = 'cedodev-portfolio-v1.0';
const STATIC_CACHE = 'static-v1.0';
const DYNAMIC_CACHE = 'dynamic-v1.0';

// Arquivos para cache inicial
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/favicon.svg',
  'https://cdn.jsdelivr.net/npm/boxicons@2.1.4/css/boxicons.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Arquivos que devem sempre vir da rede
const NETWORK_FIRST = [
  'https://api.github.com/',
  'https://formspree.io/'
];

// ===== INSTALAÇÃO =====
self.addEventListener('install', (event) => {
  console.log('SW: Instalando service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('SW: Fazendo cache dos arquivos estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('SW: Cache inicial criado com sucesso');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('SW: Erro ao criar cache inicial:', error);
      })
  );
});

// ===== ATIVAÇÃO =====
self.addEventListener('activate', (event) => {
  console.log('SW: Ativando service worker...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('SW: Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('SW: Service worker ativado');
        return self.clients.claim();
      })
  );
});

// ===== ESTRATÉGIAS DE CACHE =====

// Cache First - para arquivos estáticos
function cacheFirst(request) {
  return caches.open(STATIC_CACHE)
    .then(cache => {
      return cache.match(request)
        .then(response => {
          if (response) {
            return response;
          }
          
          return fetch(request)
            .then(networkResponse => {
              cache.put(request, networkResponse.clone());
              return networkResponse;
            });
        });
    });
}

// Network First - para APIs e conteúdo dinâmico
function networkFirst(request) {
  return fetch(request)
    .then(response => {
      if (response.ok) {
        return caches.open(DYNAMIC_CACHE)
          .then(cache => {
            cache.put(request, response.clone());
            return response;
          });
      }
      throw new Error('Network response not ok');
    })
    .catch(() => {
      return caches.open(DYNAMIC_CACHE)
        .then(cache => cache.match(request));
    });
}

// Stale While Revalidate - para recursos que podem ser atualizados
function staleWhileRevalidate(request) {
  return caches.open(DYNAMIC_CACHE)
    .then(cache => {
      return cache.match(request)
        .then(response => {
          const fetchPromise = fetch(request)
            .then(networkResponse => {
              cache.put(request, networkResponse.clone());
              return networkResponse;
            });
          
          return response || fetchPromise;
        });
    });
}

// ===== INTERCEPTAÇÃO DE REQUESTS =====
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requests não HTTP/HTTPS
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Network First para APIs
  if (NETWORK_FIRST.some(pattern => request.url.includes(pattern))) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Cache First para arquivos estáticos
  if (request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'image' ||
      request.destination === 'font') {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Stale While Revalidate para HTML
  if (request.destination === 'document') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  
  // Default: tentar cache primeiro, depois rede
  event.respondWith(
    caches.match(request)
      .then(response => response || fetch(request))
      .catch(() => {
        // Página offline de fallback para navegação
        if (request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// ===== SINCRONIZAÇÃO EM BACKGROUND =====
self.addEventListener('sync', (event) => {
  console.log('SW: Background sync:', event.tag);
  
  if (event.tag === 'portfolio-sync') {
    event.waitUntil(
      // Aqui você pode implementar sincronização de dados
      // Por exemplo, enviar formulários offline, atualizar cache, etc.
      updatePortfolioCache()
    );
  }
});

// ===== NOTIFICAÇÕES PUSH =====
self.addEventListener('push', (event) => {
  console.log('SW: Push recebido');
  
  const options = {
    body: 'Novo projeto adicionado ao portfólio!',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver projeto',
        icon: '/favicon.svg'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/favicon.svg'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('CedoDev Portfolio', options)
  );
});

// ===== CLIQUE EM NOTIFICAÇÃO =====
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Notificação clicada:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/#projects')
    );
  }
});

// ===== FUNÇÕES AUXILIARES =====
async function updatePortfolioCache() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    
    // Atualizar projetos do GitHub
    const githubResponse = await fetch('https://api.github.com/users/ogkauann/repos');
    if (githubResponse.ok) {
      await cache.put('https://api.github.com/users/ogkauann/repos', githubResponse.clone());
    }
    
    console.log('SW: Cache do portfólio atualizado');
  } catch (error) {
    console.error('SW: Erro ao atualizar cache:', error);
  }
}

// ===== LIMPEZA PERIÓDICA DE CACHE =====
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    event.waitUntil(cleanOldCache());
  }
});

async function cleanOldCache() {
  const cache = await caches.open(DYNAMIC_CACHE);
  const requests = await cache.keys();
  const now = Date.now();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 dias
  
  for (const request of requests) {
    const response = await cache.match(request);
    const dateHeader = response.headers.get('date');
    
    if (dateHeader) {
      const responseDate = new Date(dateHeader).getTime();
      if (now - responseDate > maxAge) {
        await cache.delete(request);
        console.log('SW: Cache expirado removido:', request.url);
      }
    }
  }
}

console.log('SW: Service Worker carregado');