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

  document.querySelectorAll('[data-showcase]').forEach(showcase=>{
    const tabs=[...showcase.querySelectorAll('.tab')];
    const imgs=showcase.querySelectorAll('.showcase-display img');
    const interval=parseInt(showcase.dataset.interval)||5000;
    let idx=0, raf=null, progStart=null;

    function activate(i){
      idx=i;
      tabs.forEach((t,ti)=>t.classList.toggle('active',ti===i));
      imgs.forEach(img=>img.classList.toggle('active',img.id===tabs[i].dataset.target));
    }

    function tick(now){
      if(!progStart) progStart=now;
      const p=Math.min((now-progStart)/interval,1);
      const bar=tabs[idx].querySelector('.tab-progress');
      bar.style.width=(p*100)+'%';
      if(p>=1){
        progStart=null;
        activate((idx+1)%tabs.length);
      }
      raf=requestAnimationFrame(tick);
    }

    function restart(){
      tabs.forEach(t=>{ t.querySelector('.tab-progress').style.width='0%'; });
      progStart=null;
      cancelAnimationFrame(raf);
      raf=requestAnimationFrame(tick);
    }

    tabs.forEach((tab,i)=>{
      tab.addEventListener('click',()=>{ activate(i); restart(); });
    });
    showcase.addEventListener('mouseenter',()=>cancelAnimationFrame(raf));
    showcase.addEventListener('mouseleave',()=>{ raf=requestAnimationFrame(tick); });

    restart();
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

  // Comparativo Savings Calculator
  const agentsSlider=document.getElementById('agentsSlider');
  const agentsCount=document.getElementById('agentsCount');
  const atriumTotal=document.getElementById('atriumTotal');
  const marketTotal=document.getElementById('marketTotal');
  const savingsTotal=document.getElementById('savingsTotal');

  if(agentsSlider && agentsCount && atriumTotal && marketTotal && savingsTotal){
    function updateCalc(){
      const agents=parseInt(agentsSlider.value);
      agentsCount.textContent=agents;

      // Atrium pricing: Base R$297 includes up to 10 agents. Extra agents are R$30/mo
      const extraAgents=Math.max(0, agents-10);
      const atriumCost=297 + (extraAgents * 30);

      // Traditional SaaS: Average R$150/user/month (Zendesk, Intercom, Freshdesk standard tiers)
      const marketCost=agents * 150;
      const saved=marketCost - atriumCost;

      atriumTotal.textContent=`R$ ${atriumCost.toLocaleString('pt-BR')}`;
      marketTotal.textContent=`R$ ${marketCost.toLocaleString('pt-BR')}`;
      savingsTotal.textContent=`R$ ${Math.max(0, saved).toLocaleString('pt-BR')}/mês`;
    }

    agentsSlider.addEventListener('input', updateCalc);
    updateCalc();
  }
});
