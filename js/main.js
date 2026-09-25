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

  const hdr=document.getElementById('hdr');
  window.addEventListener('scroll',()=>{
    hdr.style.borderBottomColor = window.scrollY>20 ? 'var(--border-hi)' : 'var(--border)';
  });
});
