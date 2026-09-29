document.addEventListener("DOMContentLoaded",function(){

  document.querySelectorAll('a[href^="#"]').forEach(link=>{
    link.addEventListener("click",function(e){
      const id=this.getAttribute("href");
      if(id==="#")return;
      const el=document.querySelector(id);
      if(el){
        e.preventDefault();
        const offset=el.getBoundingClientRect().top+window.pageYOffset-80;
        window.scrollTo({top:offset,behavior:"smooth"});
      }
    });
  });

  const obs=new IntersectionObserver(entries=>{
    entries.forEach(en=>{ if(en.isIntersecting) en.target.classList.add('vis'); });
  },{threshold:.12});
  document.querySelectorAll('.fade').forEach(el=>obs.observe(el));

  const counted=new WeakSet();
  const countObs=new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      if(en.isIntersecting && !counted.has(en.target)){
        counted.add(en.target);
        const el=en.target;
        const target=parseFloat(el.dataset.count);
        const decimals=parseInt(el.dataset.decimals||"0");
        const suffix=el.dataset.suffix||"";
        const dur=1400;
        const start=performance.now();
        function step(now){
          const p=Math.min((now-start)/dur,1);
          const eased=1-Math.pow(1-p,3);
          const val=(target*eased).toFixed(decimals);
          el.textContent=val+suffix;
          if(p<1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }
    });
  },{threshold:.5});
  document.querySelectorAll('[data-count]').forEach(el=>countObs.observe(el));

  // =========================================================================
  // SHOWCASE DISPLAY, INTERACTIVE LOUPE & QUICK FOCUS SYSTEM
  // =========================================================================
  const SHOWCASE_URLS = {
    'chat-1': 'chat.atriumchat.com.br/inbox',
    'chat-3': 'chat.atriumchat.com.br/kanban',
    'chat-2': 'chat.atriumchat.com.br/central-ajuda',
    'mon-1': 'monitor.atriumchat.com.br/overview',
    'mon-2': 'monitor.atriumchat.com.br/sla',
    'mon-3': 'monitor.atriumchat.com.br/clientes',
    'mon-4': 'monitor.atriumchat.com.br/agentes'
  };

  document.querySelectorAll('[data-showcase]').forEach(showcase => {
    const tabs = [...showcase.querySelectorAll('.tab')];
    const imgs = showcase.querySelectorAll('.showcase-display img');
    const urlEl = showcase.querySelector('.window-url .url-text');
    const screenContainer = showcase.querySelector('.display-screen-container');
    const loupe = showcase.querySelector('.zoom-loupe');
    const interval = parseInt(showcase.dataset.interval) || 5000;
    let idx = 0, raf = null, progStart = null;

    function activate(i) {
      idx = i;
      tabs.forEach((t, ti) => t.classList.toggle('active', ti === i));
      imgs.forEach(img => {
        const isMatch = img.id === tabs[i].dataset.target;
        img.classList.toggle('active', isMatch);
      });

      const currentId = tabs[i]?.dataset?.target;
      if (urlEl && SHOWCASE_URLS[currentId]) {
        urlEl.textContent = SHOWCASE_URLS[currentId];
      }

      if (loupe && loupe.classList.contains('active')) {
        const activeImg = showcase.querySelector('.display-screen img.active');
        if (activeImg) loupe.style.backgroundImage = `url("${activeImg.src}")`;
      }
    }

    function tick(now) {
      if (!progStart) progStart = now;
      const p = Math.min((now - progStart) / interval, 1);
      const bar = tabs[idx].querySelector('.tab-progress');
      if (bar) bar.style.width = (p * 100) + '%';
      if (p >= 1) {
        progStart = null;
        activate((idx + 1) % tabs.length);
      }
      raf = requestAnimationFrame(tick);
    }

    function restart() {
      tabs.forEach(t => {
        const b = t.querySelector('.tab-progress');
        if (b) b.style.width = '0%';
      });
      progStart = null;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => { activate(i); restart(); });
    });

    showcase.addEventListener('mouseenter', () => cancelAnimationFrame(raf));
    showcase.addEventListener('mouseleave', () => { raf = requestAnimationFrame(tick); });

    // Interactive Hover Magnifier (Lupa)
    if (screenContainer && loupe) {
      const zoom = 2.4;
      const radius = 110;

      screenContainer.addEventListener('mouseenter', () => {
        const activeImg = showcase.querySelector('.display-screen img.active');
        if (activeImg) {
          loupe.style.backgroundImage = `url("${activeImg.src}")`;
          loupe.classList.add('active');
        }
      });

      screenContainer.addEventListener('mousemove', e => {
        const rect = screenContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
          loupe.classList.remove('active');
          return;
        }

        loupe.classList.add('active');
        loupe.style.left = (x - radius) + 'px';
        loupe.style.top = (y - radius) + 'px';
        loupe.style.backgroundSize = `${rect.width * zoom}px ${rect.height * zoom}px`;
        loupe.style.backgroundPosition = `${-(x * zoom - radius)}px ${-(y * zoom - radius)}px`;
      });

      screenContainer.addEventListener('mouseleave', () => {
        loupe.classList.remove('active');
      });
    }

    restart();
  });

  // =========================================================================
  // FULL HD LIGHTBOX MODAL WITH ZOOM & PAN (MOBILE & DESKTOP)
  // =========================================================================
  const GALLERY_DATA = {
    'Atrium Chat': [
      { id: 'chat-1', src: 'img/chat-1.png', title: 'Atrium Chat — Omnichannel & Copiloto IA' },
      { id: 'chat-3', src: 'img/chat-3.png', title: 'Atrium Chat — Gestão Visual Kanban' },
      { id: 'chat-2', src: 'img/chat-2.png', title: 'Atrium Chat — Central de Ajuda & Base de Conhecimento' }
    ],
    'Atrium Monitor': [
      { id: 'mon-1', src: 'img/monitor-3.png', title: 'Atrium Monitor — Visão Geral & Tendências de Volume' },
      { id: 'mon-2', src: 'img/monitor-4.png', title: 'Atrium Monitor — Controle Rigoroso de SLA' },
      { id: 'mon-3', src: 'img/monitor-7.png', title: 'Atrium Monitor — Inteligência de Clientes e Incidentes' },
      { id: 'mon-4', src: 'img/monitor-8.png', title: 'Atrium Monitor — Produtividade e Métricas de Agentes' }
    ]
  };

  const lbModal = document.getElementById('imageLightbox');
  const lbBackdrop = document.getElementById('lbBackdrop');
  const lbClose = document.getElementById('lbClose');
  const lbImage = document.getElementById('lbImage');
  const lbTitle = document.getElementById('lightboxTitle');
  const lbZoomIn = document.getElementById('lbZoomIn');
  const lbZoomOut = document.getElementById('lbZoomOut');
  const lbReset = document.getElementById('lbReset');
  const lbZoomLevel = document.getElementById('lbZoomLevel');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');
  const lbViewport = document.getElementById('lbViewport');
  const lbStage = document.getElementById('lbStage');
  const lbIndicators = document.getElementById('lbIndicators');

  let currentGallery = [];
  let currentGalleryIndex = 0;
  let zoomScale = 1;
  let panX = 0, panY = 0;
  let isDragging = false, startPanX = 0, startPanY = 0;
  let initialPinchDist = 0, initialZoom = 1;

  function updateLightboxTransform() {
    if (!lbStage) return;
    lbStage.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomScale})`;
    if (lbZoomLevel) lbZoomLevel.textContent = `${Math.round(zoomScale * 100)}%`;
  }

  function renderLightboxImage() {
    if (!currentGallery.length) return;
    const item = currentGallery[currentGalleryIndex];
    if (lbImage) {
      lbImage.src = item.src;
      lbImage.alt = item.title;
    }
    if (lbTitle) lbTitle.textContent = item.title;

    // Reset zoom and pan
    zoomScale = 1;
    panX = 0;
    panY = 0;
    updateLightboxTransform();

    // Render indicators
    if (lbIndicators) {
      lbIndicators.innerHTML = '';
      if (currentGallery.length > 1) {
        currentGallery.forEach((_, i) => {
          const dot = document.createElement('span');
          dot.className = `lb-dot ${i === currentGalleryIndex ? 'active' : ''}`;
          dot.addEventListener('click', () => {
            currentGalleryIndex = i;
            renderLightboxImage();
          });
          lbIndicators.appendChild(dot);
        });
      }
    }

    if (lbPrev && lbNext) {
      const showArrows = currentGallery.length > 1;
      lbPrev.style.display = showArrows ? 'flex' : 'none';
      lbNext.style.display = showArrows ? 'flex' : 'none';
    }
  }

  function openLightbox(groupName, activeImgId) {
    const list = GALLERY_DATA[groupName] || GALLERY_DATA['Atrium Chat'];
    currentGallery = list;
    let foundIdx = list.findIndex(item => item.id === activeImgId);
    currentGalleryIndex = foundIdx >= 0 ? foundIdx : 0;

    renderLightboxImage();
    if (lbModal) {
      lbModal.classList.add('open');
      lbModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLightbox() {
    if (lbModal) {
      lbModal.classList.remove('open');
      lbModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  if (lbModal) {
    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    if (lbBackdrop) lbBackdrop.addEventListener('click', closeLightbox);

    if (lbPrev) {
      lbPrev.addEventListener('click', e => {
        e.stopPropagation();
        currentGalleryIndex = (currentGalleryIndex - 1 + currentGallery.length) % currentGallery.length;
        renderLightboxImage();
      });
    }

    if (lbNext) {
      lbNext.addEventListener('click', e => {
        e.stopPropagation();
        currentGalleryIndex = (currentGalleryIndex + 1) % currentGallery.length;
        renderLightboxImage();
      });
    }

    if (lbZoomIn) {
      lbZoomIn.addEventListener('click', () => {
        zoomScale = Math.min(zoomScale + 0.35, 3.5);
        updateLightboxTransform();
      });
    }

    if (lbZoomOut) {
      lbZoomOut.addEventListener('click', () => {
        zoomScale = Math.max(zoomScale - 0.35, 0.6);
        if (zoomScale <= 1) { panX = 0; panY = 0; }
        updateLightboxTransform();
      });
    }

    if (lbReset) {
      lbReset.addEventListener('click', () => {
        zoomScale = 1;
        panX = 0;
        panY = 0;
        updateLightboxTransform();
      });
    }

    // Wheel zoom
    if (lbViewport) {
      lbViewport.addEventListener('wheel', e => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.2 : -0.2;
        zoomScale = Math.max(0.6, Math.min(3.5, zoomScale + delta));
        if (zoomScale <= 1) { panX = 0; panY = 0; }
        updateLightboxTransform();
      }, { passive: false });

      // Mouse drag to pan
      lbViewport.addEventListener('mousedown', e => {
        if (e.target.closest('.lb-btn, .lb-nav-btn')) return;
        isDragging = true;
        startPanX = e.clientX - panX;
        startPanY = e.clientY - panY;
        lbViewport.classList.add('grabbing');
      });

      window.addEventListener('mousemove', e => {
        if (!isDragging) return;
        panX = e.clientX - startPanX;
        panY = e.clientY - startPanY;
        updateLightboxTransform();
      });

      window.addEventListener('mouseup', () => {
        isDragging = false;
        if (lbViewport) lbViewport.classList.remove('grabbing');
      });

      // Mobile Touch Pinch and Pan
      lbViewport.addEventListener('touchstart', e => {
        if (e.touches.length === 1) {
          isDragging = true;
          startPanX = e.touches[0].clientX - panX;
          startPanY = e.touches[0].clientY - panY;
        } else if (e.touches.length === 2) {
          isDragging = false;
          initialPinchDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          initialZoom = zoomScale;
        }
      }, { passive: true });

      lbViewport.addEventListener('touchmove', e => {
        if (e.touches.length === 2 && initialPinchDist > 0) {
          const dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          zoomScale = Math.max(0.6, Math.min(3.5, initialZoom * (dist / initialPinchDist)));
          updateLightboxTransform();
        } else if (e.touches.length === 1 && isDragging) {
          panX = e.touches[0].clientX - startPanX;
          panY = e.touches[0].clientY - startPanY;
          updateLightboxTransform();
        }
      }, { passive: true });

      lbViewport.addEventListener('touchend', () => {
        isDragging = false;
      });
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', e => {
      if (!lbModal.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft' && currentGallery.length > 1) {
        currentGalleryIndex = (currentGalleryIndex - 1 + currentGallery.length) % currentGallery.length;
        renderLightboxImage();
      }
      if (e.key === 'ArrowRight' && currentGallery.length > 1) {
        currentGalleryIndex = (currentGalleryIndex + 1) % currentGallery.length;
        renderLightboxImage();
      }
      if (e.key === '+' || e.key === '=') {
        zoomScale = Math.min(zoomScale + 0.35, 3.5);
        updateLightboxTransform();
      }
      if (e.key === '-' || e.key === '_') {
        zoomScale = Math.max(zoomScale - 0.35, 0.6);
        updateLightboxTransform();
      }
      if (e.key === '0') {
        zoomScale = 1; panX = 0; panY = 0;
        updateLightboxTransform();
      }
    });
  }

  // Hook Showcase Zoom Buttons, Screen Clicks & Footer Hint to Open Lightbox
  document.querySelectorAll('.showcase-display').forEach(display => {
    const prod = display.dataset.product || 'Atrium Chat';
    const zoomBtn = display.querySelector('.win-btn-zoom');
    const screen = display.querySelector('.display-screen');
    const footerHint = display.querySelector('.footer-zoom-hint');

    function handleOpen() {
      const activeImg = display.querySelector('.display-screen img.active');
      openLightbox(prod, activeImg ? activeImg.id : null);
    }

    if (zoomBtn) zoomBtn.addEventListener('click', e => { e.stopPropagation(); handleOpen(); });
    if (screen) screen.addEventListener('click', handleOpen);
    if (footerHint) footerHint.addEventListener('click', e => { e.stopPropagation(); handleOpen(); });
  });

  document.querySelectorAll('[data-tilt]').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const x=e.clientX-r.left, y=e.clientY-r.top;
      const rx=((y/r.height)-0.5)*-6;
      const ry=((x/r.width)-0.5)*6;
      card.style.transform=`perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
      card.style.setProperty('--mx',x+'px');
      card.style.setProperty('--my',y+'px');
    });
    card.addEventListener('mouseleave',()=>{
      card.style.transform='perspective(600px) rotateX(0) rotateY(0)';
    });
  });

  const sw=document.getElementById('billSwitch');
  const priceVal=document.getElementById('priceVal');
  const pricePeriod=document.getElementById('pricePeriod');
  const lblM=document.getElementById('lbl-month'), lblY=document.getElementById('lbl-year');
  let yearly=false;
  if(sw && priceVal && pricePeriod && lblM && lblY){
    sw.addEventListener('click',()=>{
      yearly=!yearly;
      sw.classList.toggle('yr',yearly);
      lblM.classList.toggle('on',!yearly);
      lblY.classList.toggle('on',yearly);
      priceVal.style.opacity=0;
      setTimeout(()=>{
        priceVal.textContent=yearly?'252':'297';
        pricePeriod.textContent=yearly?'/mês, anual':'/mês';
        priceVal.style.opacity=1;
      },150);
    });
  }

  const hdr=document.getElementById('hdr');
  if(hdr){
    window.addEventListener('scroll',()=>{
      hdr.style.borderBottomColor = window.scrollY>20 ? 'var(--border-hi)' : 'var(--border)';
    });
  }

  // Desktop Dropdown click/toggle support for touch/keyboard
  document.querySelectorAll('.has-dropdown').forEach(dd => {
    const btn = dd.querySelector('.nav-link');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = dd.classList.toggle('active');
        btn.setAttribute('aria-expanded', isExpanded);
        document.querySelectorAll('.has-dropdown').forEach(other => {
          if (other !== dd) {
            other.classList.remove('active');
            const otherBtn = other.querySelector('.nav-link');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });
      });
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.has-dropdown')) {
      document.querySelectorAll('.has-dropdown').forEach(dd => {
        dd.classList.remove('active');
        const btn = dd.querySelector('.nav-link');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    }
  });

  // Mobile menu toggle
  const mobileBtn=document.querySelector('.mobile-toggle');
  const mobileDrawer=document.querySelector('.mobile-nav-drawer');
  if(mobileBtn && mobileDrawer){
    mobileBtn.addEventListener('click',()=>{
      const isOpen=mobileDrawer.classList.toggle('open');
      mobileBtn.innerHTML=isOpen ? '<i class="bi bi-x-lg"></i>' : '<i class="bi bi-list"></i>';
    });
    mobileDrawer.querySelectorAll('a').forEach(a=>{
      a.addEventListener('click',()=>{
        mobileDrawer.classList.remove('open');
        mobileBtn.innerHTML='<i class="bi bi-list"></i>';
      });
    });
  }

  // FAQ Accordion & Live Filter
  const faqItems=document.querySelectorAll('.faq-item');
  const searchInput=document.querySelector('.faq-search-input');
  const clearBtn=document.querySelector('.faq-search-clear');
  const filterChips=document.querySelectorAll('.faq-chip');
  const emptyState=document.querySelector('.faq-empty');

  if(faqItems.length>0){
    faqItems.forEach(item=>{
      const header=item.querySelector('.faq-header');
      if(header){
        header.addEventListener('click',()=>{
          const isActive=item.classList.contains('active');
          faqItems.forEach(i=>i.classList.remove('active'));
          if(!isActive) item.classList.add('active');
        });
      }
    });

    let currentCategory='all';
    let currentQuery='';

    function filterFAQ(){
      let visibleCount=0;
      const q=currentQuery.trim().toLowerCase();

      faqItems.forEach(item=>{
        const cat=item.dataset.category || '';
        const title=item.querySelector('h3')?.textContent.toLowerCase() || '';
        const body=item.querySelector('.faq-body')?.textContent.toLowerCase() || '';

        const matchesCat=(currentCategory==='all' || cat===currentCategory);
        const matchesQuery=(!q || title.includes(q) || body.includes(q));

        if(matchesCat && matchesQuery){
          item.style.display='block';
          visibleCount++;
        } else {
          item.style.display='none';
          item.classList.remove('active');
        }
      });

      if(emptyState){
        emptyState.style.display = visibleCount===0 ? 'block' : 'none';
      }
    }

    if(searchInput){
      searchInput.addEventListener('input',e=>{
        currentQuery=e.target.value;
        if(clearBtn) clearBtn.style.display=currentQuery.length>0 ? 'block' : 'none';
        filterFAQ();
      });
    }

    if(clearBtn){
      clearBtn.addEventListener('click',()=>{
        if(searchInput) searchInput.value='';
        currentQuery='';
        clearBtn.style.display='none';
        filterFAQ();
      });
    }

    if(filterChips.length>0){
      filterChips.forEach(chip=>{
        chip.addEventListener('click',()=>{
          filterChips.forEach(c=>c.classList.remove('active'));
          chip.classList.add('active');
          currentCategory=chip.dataset.filter || 'all';
          filterFAQ();
        });
      });
    }
  }

  // =========================================================================
  // CALCULADORA DE ECONOMIA REAL (HOMEPAGE & COMPARATIVO)
  // =========================================================================
  const COMPETITORS = {
    zendesk: {
      id: 'zendesk',
      name: 'Zendesk Suite',
      badge: 'R$ 359/agente',
      noteTitle: 'Metodologia Zendesk Suite (Team / Pro):',
      noteText: 'Baseado no plano Zendesk Suite Team oficial (R$ 359/agente/mês faturado anualmente) com 1 canal WhatsApp incluso. Linhas adicionais de WhatsApp demandam add-ons/parceiros BSP (~R$ 120/linha) e créditos de automação com agentes de IA têm custo adicional por resolução.',
      calcCost: (agents, whats) => {
        const baseCost = agents * 359;
        const extraWhats = Math.max(0, whats - 1) * 120;
        const aiAddon = agents * 45; // estimativa conservadora de copilot/resoluções
        return baseCost + extraWhats + aiAddon;
      },
      breakdown: (agents, whats) => `${agents} agentes (R$ 359/mês) + linhas extras e IA`
    },
    chatwoot_cloud: {
      id: 'chatwoot_cloud',
      name: 'Chatwoot Cloud Oficial',
      badge: '~R$ 225/agente ($39)',
      noteTitle: 'Metodologia Chatwoot Cloud Business:',
      noteText: 'Baseado no plano oficial em dólares ($39 USD/agente/mês ~ R$ 225 com câmbio e IOF). Importante: regras avançadas de SLA só estão disponíveis no plano Enterprise ($99 USD/agente/mês). Cobrança no cartão internacional sem suporte direto em português.',
      calcCost: (agents, whats) => {
        const baseCost = agents * 225;
        const extraWhats = Math.max(0, whats - 2) * 90;
        return baseCost + extraWhats;
      },
      breakdown: (agents, whats) => `${agents} licenças x US$ 39 (~R$ 225/mês)`
    },
    blip: {
      id: 'blip',
      name: 'Take Blip (Desk)',
      badge: 'R$ 1.199 + R$ 200/agente',
      noteTitle: 'Metodologia Take Blip (Plano Lite/Empresas):',
      noteText: 'Plano base a partir de R$ 1.199/mês (inclui até 10 agentes e franquia de 800 conversas). Cada atendente adicional custa ~R$ 200/mês. Conversas ativas e disparos de WhatsApp são tarifados por mensagem excedente.',
      calcCost: (agents, whats) => {
        const base = 1199;
        const extraAgents = Math.max(0, agents - 10) * 200;
        const extraWhats = Math.max(0, whats - 2) * 150;
        return base + extraAgents + extraWhats;
      },
      breakdown: (agents, whats) => `Plano base R$ 1.199 + ${Math.max(0, agents - 10)} agentes extras`
    },
    rd: {
      id: 'rd',
      name: 'RD Station Conversas',
      badge: 'R$ 989 a R$ 2.699',
      noteTitle: 'Metodologia RD Station Conversas (Tallos/Huggy):',
      noteText: 'Plano Basic R$ 989/mês (limitado a apenas 500 contatos únicos/mês) ou Pro R$ 2.699/mês (até 3.000 contatos únicos). Taxa de ativação de WhatsApp de R$ 1.999 + carteira de créditos pré-paga para envio de mensagens.',
      calcCost: (agents, whats) => {
        const planCost = agents <= 8 ? 989 : (agents <= 20 ? 2699 : 3990);
        const extraWhats = Math.max(0, whats - 2) * 180;
        return planCost + extraWhats;
      },
      breakdown: (agents, whats) => `Plano conforme volume (${agents} agentes) + linhas WhatsApp`
    },
    saas_tradicional: {
      id: 'saas_tradicional',
      name: 'SaaS Tradicionais Médios',
      badge: 'Média R$ 170/agente',
      noteTitle: 'Metodologia Plataformas Médias do Mercado:',
      noteText: 'Média de mercado para ferramentas de atendimento brasileiras e internacionais cobrando entre R$ 150 e R$ 190 por assento de atendente/mês mais taxas de canais WhatsApp e add-ons.',
      calcCost: (agents, whats) => {
        const base = agents * 170;
        const extraWhats = Math.max(0, whats - 2) * 100;
        return base + extraWhats;
      },
      breakdown: (agents, whats) => `${agents} atendentes x R$ 170/mês`
    },
    diy: {
      id: 'diy',
      name: 'Chatwoot Puro Self-Hosted (DIY)',
      badge: 'VPS + R$ 1.800 DevOps',
      noteTitle: 'Metodologia Self-Hosted Faça-Você-Mesmo:',
      noteText: 'A licença de código aberto é gratuita, porém manter instâncias com PostgreSQL, Redis, Sidekiq e alta disponibilidade exige VPS Cloud (~R$ 280 a R$ 450/mês) + horas de engenharia/DevOps para backups, updates e monitoramento (~R$ 1.800/mês). Além de NÃO possuir o Atrium Monitor para SLA.',
      calcCost: (agents, whats) => {
        const vps = agents > 15 ? 450 : 280;
        const devopsHours = 1800;
        return vps + devopsHours;
      },
      breakdown: (agents, whats) => `VPS Cloud (R$ 280) + R$ 1.800/mês em DevOps`
    }
  };

  function initCalculators(){
    const calcBoxes = document.querySelectorAll('.calc-box');
    if(!calcBoxes.length) return;

    calcBoxes.forEach(box => {
      let currentCompetitorKey = 'zendesk';
      let currentPeriod = 'monthly'; // 'monthly' | 'annual'

      const compChips = box.querySelectorAll('.calc-chip');
      const agentsSlider = box.querySelector('.calc-agents-slider') || box.querySelector('#calcAgentsSlider') || box.querySelector('#agentsSlider');
      const agentsCount = box.querySelector('.calc-agents-count') || box.querySelector('#calcAgentsCount') || box.querySelector('#agentsCount');
      const whatsSlider = box.querySelector('.calc-whats-slider') || box.querySelector('#calcWhatsSlider');
      const whatsCount = box.querySelector('.calc-whats-count') || box.querySelector('#calcWhatsCount');
      const periodBtns = box.querySelectorAll('.period-btn');
      const presetBtns = box.querySelectorAll('.btn-preset');

      const compDisplayName = box.querySelector('.calc-comp-display-name') || box.querySelector('#calcCompetitorDisplayName');
      const compCostEl = box.querySelector('.calc-comp-cost') || box.querySelector('#calcCompetitorCost') || box.querySelector('#marketTotal');
      const compBreakdownEl = box.querySelector('.calc-comp-breakdown') || box.querySelector('#calcCompetitorBreakdown');
      const atriumCostEl = box.querySelector('.calc-atrium-cost') || box.querySelector('#calcAtriumCost') || box.querySelector('#atriumTotal');
      const atriumBreakdownEl = box.querySelector('.calc-atrium-breakdown') || box.querySelector('#calcAtriumBreakdown');
      const savingsAmountEl = box.querySelector('.calc-savings-amount') || box.querySelector('#calcSavingsAmount') || box.querySelector('#savingsTotal');
      const savingsPctEl = box.querySelector('.calc-savings-pct') || box.querySelector('#calcSavingsPct');
      const annualSavingsEl = box.querySelector('.calc-annual-savings') || box.querySelector('#calcAnnualSavings');
      const savingsImpactEl = box.querySelector('.calc-savings-impact') || box.querySelector('#calcSavingsImpact');
      const noteTitleEl = box.querySelector('.calc-note-title') || box.querySelector('#calcNoteTitle');
      const noteTextEl = box.querySelector('.calc-note-text') || box.querySelector('#calcNoteText');

      function formatBRL(val){
        return 'R$ ' + Math.round(val).toLocaleString('pt-BR');
      }

      function update(){
        const agents = agentsSlider ? parseInt(agentsSlider.value, 10) : 10;
        const whats = whatsSlider ? parseInt(whatsSlider.value, 10) : 2;

        if(agentsCount) agentsCount.textContent = agents;
        if(whatsCount) whatsCount.textContent = whats;

        // Preset active state
        if(presetBtns.length){
          presetBtns.forEach(btn => {
            const count = parseInt(btn.dataset.agents, 10);
            btn.classList.toggle('active', count === agents);
          });
        }

        // Atrium Desk Pro cost calculation
        // Base R$ 297/mo includes 10 agents and 2 WhatsApp connections
        const extraAgents = Math.max(0, agents - 10);
        const extraWhats = Math.max(0, whats - 2);
        const atriumMonthly = 297 + (extraAgents * 30) + (extraWhats * 50);

        // Competitor cost calculation
        const comp = COMPETITORS[currentCompetitorKey] || COMPETITORS.zendesk;
        const compMonthly = comp.calcCost(agents, whats);

        // Multiplier for annual calculation
        const multiplier = currentPeriod === 'annual' ? 12 : 1;
        const periodSuffix = currentPeriod === 'annual' ? '/ano' : '/mês';

        const displayAtrium = atriumMonthly * multiplier;
        const displayComp = compMonthly * multiplier;
        const diffMonthly = Math.max(0, compMonthly - atriumMonthly);
        const displaySavings = diffMonthly * multiplier;
        const annualSavings = diffMonthly * 12;

        const pct = compMonthly > 0 ? Math.round((diffMonthly / compMonthly) * 100) : 0;

        // DOM updates
        if(compDisplayName) compDisplayName.textContent = comp.name;
        if(compCostEl){
          compCostEl.innerHTML = `${formatBRL(displayComp)}<span class="period-sub">${periodSuffix}</span>`;
        }
        if(compBreakdownEl){
          compBreakdownEl.textContent = comp.breakdown(agents, whats);
        }

        if(atriumCostEl){
          atriumCostEl.innerHTML = `${formatBRL(displayAtrium)}<span class="period-sub">${periodSuffix}</span>`;
        }
        if(atriumBreakdownEl){
          let desc = `Plano Pro R$ 297 ${extraAgents > 0 ? `+ R$ ${extraAgents * 30} (${extraAgents} extras)` : '(10 inclusos)'}`;
          if(extraWhats > 0) desc += ` + R$ ${extraWhats * 50} (${extraWhats} Whats extras)`;
          atriumBreakdownEl.textContent = desc;
        }

        if(savingsAmountEl){
          savingsAmountEl.innerHTML = `${formatBRL(displaySavings)}<span class="savings-sub">${periodSuffix}</span>`;
        }
        if(savingsPctEl){
          savingsPctEl.textContent = `-${pct}%`;
        }
        if(annualSavingsEl){
          annualSavingsEl.textContent = `${formatBRL(annualSavings)} / ano`;
        }

        if(savingsImpactEl){
          const hires = (diffMonthly / 2500).toFixed(1);
          savingsImpactEl.innerHTML = `Uma economia direta de <strong>${formatBRL(annualSavings)} por ano</strong> no seu caixa. Isso equivale a contratar <strong>+${hires} novos atendentes</strong> ou investir pesado em tráfego para atrair mais clientes.`;
        }

        if(noteTitleEl) noteTitleEl.textContent = comp.noteTitle;
        if(noteTextEl) noteTextEl.textContent = comp.noteText;
      }

      // Event listeners for competitor chips
      if(compChips.length){
        compChips.forEach(chip => {
          chip.addEventListener('click', () => {
            compChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentCompetitorKey = chip.dataset.competitor || 'zendesk';
            update();
          });
        });
      }

      // Sliders listeners
      if(agentsSlider) agentsSlider.addEventListener('input', update);
      if(whatsSlider) whatsSlider.addEventListener('input', update);

      // Presets listeners
      if(presetBtns.length){
        presetBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            const count = parseInt(btn.dataset.agents, 10);
            if(agentsSlider){
              agentsSlider.value = count;
              update();
            }
          });
        });
      }

      // Period switcher
      if(periodBtns.length){
        periodBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            periodBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPeriod = btn.dataset.period || 'monthly';
            update();
          });
        });
      }

      // Initial run
      update();
    });
  }

  initCalculators();

  // =========================================================================
  // COMPARATIVO DE SOLUÇÕES: FILTROS INTERATIVOS & BUSCA
  // =========================================================================
  const compTable = document.querySelector('.comp-table');
  const compSearch = document.getElementById('compSearchInput');
  const compCatChips = document.querySelectorAll('.comp-cat-chip');
  const compViewBtns = document.querySelectorAll('.comp-view-btn');
  const compEmptyState = document.getElementById('compEmptyState');

  if(compTable){
    const tbody = compTable.querySelector('tbody');
    const tableRows = tbody ? Array.from(tbody.querySelectorAll('tr')) : [];

    let currentCat = 'all';
    let searchQuery = '';
    let currentSolutionView = 'all'; // 'all' | 'zendesk' | 'chatwoot_cloud' | 'chatwoot_diy' | 'blip_rd'

    function filterCompTable(){
      const q = searchQuery.trim().toLowerCase();
      let visibleFeaturesCount = 0;
      let currentSectionRow = null;
      let sectionHasVisibleRows = false;

      tableRows.forEach(row => {
        if(row.classList.contains('section-title')){
          if(currentSectionRow){
            currentSectionRow.style.display = sectionHasVisibleRows ? '' : 'none';
          }
          currentSectionRow = row;
          sectionHasVisibleRows = false;

          const rowCat = row.dataset.category || '';
          if(currentCat !== 'all' && rowCat !== currentCat){
            row.style.display = 'none';
          }
          return;
        }

        const rowCat = row.dataset.category || '';
        const rowText = row.textContent.toLowerCase();

        const matchCat = (currentCat === 'all' || rowCat === currentCat);
        const matchQuery = (!q || rowText.includes(q));

        if(matchCat && matchQuery){
          row.style.display = '';
          sectionHasVisibleRows = true;
          visibleFeaturesCount++;
        } else {
          row.style.display = 'none';
        }
      });

      if(currentSectionRow){
        currentSectionRow.style.display = sectionHasVisibleRows ? '' : 'none';
      }

      if(compEmptyState){
        compEmptyState.style.display = visibleFeaturesCount === 0 ? 'block' : 'none';
      }
    }

    function applySolutionFocus(viewKey){
      currentSolutionView = viewKey;
      const allHeaders = compTable.querySelectorAll('th');
      const allCells = compTable.querySelectorAll('td');

      // Index mapping:
      // 0: Feature, 1: Atrium Desk (highlight), 2: Zendesk, 3: Chatwoot Cloud, 4: Chatwoot DIY, 5: Take Blip / RD
      const colMap = {
        'all': [1, 2, 3, 4, 5],
        'zendesk': [1, 2],
        'chatwoot_cloud': [1, 3],
        'chatwoot_diy': [1, 4],
        'blip_rd': [1, 5]
      };

      const activeCols = colMap[viewKey] || colMap['all'];

      // Process columns styling (dim inactive columns when a specific competitor is selected)
      tableRows.forEach(row => {
        if(row.classList.contains('section-title')) return;
        const cells = row.querySelectorAll('td');
        cells.forEach((td, idx) => {
          if(idx === 0) return; // Feature name
          if(viewKey === 'all'){
            td.classList.remove('col-dimmed');
          } else {
            if(activeCols.includes(idx)){
              td.classList.remove('col-dimmed');
            } else {
              td.classList.add('col-dimmed');
            }
          }
        });
      });

      const headerCells = compTable.querySelectorAll('thead th');
      headerCells.forEach((th, idx) => {
        if(idx === 0) return;
        if(viewKey === 'all'){
          th.classList.remove('col-dimmed');
        } else {
          if(activeCols.includes(idx)){
            th.classList.remove('col-dimmed');
          } else {
            th.classList.add('col-dimmed');
          }
        }
      });
    }

    if(compSearch){
      compSearch.addEventListener('input', e => {
        searchQuery = e.target.value;
        filterCompTable();
      });
    }

    if(compCatChips.length){
      compCatChips.forEach(chip => {
        chip.addEventListener('click', () => {
          compCatChips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          currentCat = chip.dataset.cat || 'all';
          filterCompTable();
        });
      });
    }

    if(compViewBtns.length){
      compViewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          compViewBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          applySolutionFocus(btn.dataset.view || 'all');
        });
      });
    }
  }

  // Spotlight global seguindo o mouse
  document.addEventListener('mousemove', e => {
    document.documentElement.style.setProperty('--spot-x', e.clientX + 'px');
    document.documentElement.style.setProperty('--spot-y', e.clientY + 'px');
  });
});
