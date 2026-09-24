document.addEventListener("DOMContentLoaded", function () {
  
  // 1. Smooth Scrolling para links internos
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      
      if(targetId === "#") return;
      
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        e.preventDefault();
        
        // Pega a altura do header para compensar o scroll
        const headerHeight = document.getElementById("main-header").offsetHeight;
        
        window.scrollTo({
          top: targetElement.offsetTop - headerHeight,
          behavior: "smooth"
        });
      }
    });
  });

  // 2. Animação de Scroll (Fade In Up)
  const animateElements = document.querySelectorAll('.animate-on-scroll');

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 // 15% do elemento precisa estar visível
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Para a animação ocorrer apenas na primeira vez que rolar para baixo:
        observer.unobserve(entry.target); 
      }
    });
  }, observerOptions);

  animateElements.forEach(el => {
    observer.observe(el);
  });
});
