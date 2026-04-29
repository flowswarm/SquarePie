import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ===== LENIS SMOOTH SCROLL ===== */
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

/* ===== INTRO ANIMATION ===== */
function initIntro() {
  const intro = document.getElementById('intro');
  if (!intro) return;
  lenis.stop();
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    intro.classList.add('is-animating');
    setTimeout(() => {
      intro.classList.add('is-hidden');
      document.body.style.overflow = '';
      lenis.start();
      triggerHeroReveal();
    }, 1400);
  }, 1200);
}

/* ===== SPLIT TEXT — CHARACTER REVEAL ===== */
function splitChars(el) {
  const delay = parseFloat(el.dataset.delay || 0);
  const nodes = Array.from(el.childNodes);
  el.innerHTML = '';
  let idx = 0;
  nodes.forEach(node => {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
      el.appendChild(document.createElement('br'));
      return;
    }
    const text = node.textContent;
    for (const char of text) {
      if (char === ' ') {
        el.appendChild(document.createTextNode(' '));
        continue;
      }
      const mask = document.createElement('div');
      mask.className = 'char-mask';
      const inner = document.createElement('div');
      inner.className = 'char';
      inner.textContent = char;
      inner.style.setProperty('--index', idx);
      inner.style.setProperty('--delay', delay + 's');
      mask.appendChild(inner);
      el.appendChild(mask);
      idx++;
    }
  });
}

/* ===== SPLIT TEXT — LINE REVEAL ===== */
function splitLines(el) {
  // Collect text segments separated by <br>
  const segments = [];
  let currentText = '';
  Array.from(el.childNodes).forEach(node => {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
      if (currentText.trim()) segments.push(currentText.trim());
      currentText = '';
    } else {
      currentText += node.textContent;
    }
  });
  if (currentText.trim()) segments.push(currentText.trim());
  
  el.innerHTML = '';
  segments.forEach((seg, idx) => {
    const mask = document.createElement('div');
    mask.className = 'line-mask';
    const inner = document.createElement('div');
    inner.className = 'line';
    inner.textContent = seg;
    inner.style.setProperty('--index', idx);
    mask.appendChild(inner);
    el.appendChild(mask);
  });
}

/* ===== INIT TEXT ANIMATIONS ===== */
function initSplitText() {
  document.querySelectorAll('[data-animate="chars"]').forEach(splitChars);
  document.querySelectorAll('[data-animate="lines"]').forEach(splitLines);
}

/* ===== INTERSECTION OBSERVER — SCROLL REVEAL ===== */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-inview');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('[data-observe]').forEach((el) => observer.observe(el));
  document.querySelectorAll('[data-animate]').forEach((el) => {
    const parent = el.closest('[data-observe]') || el.closest('section') || el.parentElement;
    if (parent && !parent.hasAttribute('data-observe')) {
      parent.setAttribute('data-observe', '');
      observer.observe(parent);
    }
  });
}

function triggerHeroReveal() {
  const hero = document.getElementById('hero');
  if (hero) hero.classList.add('is-inview');
}

/* ===== HERO PARALLAX ===== */
function initParallax() {
  const heroImg = document.getElementById('heroImg');
  if (!heroImg) return;
  gsap.to(heroImg, {
    yPercent: -15,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });
}

/* ===== CARD FAN-OUT ===== */
function initCards() {
  const inner = document.getElementById('cardsInner');
  if (!inner) return;
  ScrollTrigger.create({
    trigger: inner,
    start: 'top 80%',
    onEnter: () => inner.classList.remove('not-inview'),
  });
}

/* ===== STICKY SECTION ===== */
function initSticky() {
  const section = document.getElementById('stickySection');
  if (!section) return;
  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: '+=100%',
    pin: true,
    pinSpacing: true,
  });
}

/* ===== CUSTOM CURSOR ===== */
function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor || window.matchMedia('(hover: none)').matches) {
    if (cursor) cursor.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }
  const label = cursor.querySelector('.cursor__label');
  let cx = -100, cy = -100;
  let tx = -100, ty = -100;

  window.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; });

  function updateCursor() {
    cx += (tx - cx) * 0.15;
    cy += (ty - cy) * 0.15;
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(updateCursor);
  }
  updateCursor();

  document.querySelectorAll('[data-cursor-text]').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('is-active');
      label.textContent = el.dataset.cursorText;
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-active');
    });
  });
}

/* ===== HAMBURGER MENU ===== */
function initMenu() {
  const btn = document.getElementById('hamburgerBtn');
  const overlay = document.getElementById('menuOverlay');
  const menuLabel = document.getElementById('menuLabel');
  const nav = document.querySelector('.nav');
  if (!btn || !overlay) return;

  btn.addEventListener('click', () => {
    const isOpen = overlay.classList.toggle('is-open');
    menuLabel.classList.toggle('is-open', isOpen);
    if (nav) nav.classList.toggle('is-hidden', isOpen);
    if (isOpen) { lenis.stop(); } else { lenis.start(); }
  });

  overlay.querySelectorAll('.menu-overlay__item').forEach((item) => {
    item.addEventListener('click', () => {
      overlay.classList.remove('is-open');
      menuLabel.classList.remove('is-open');
      if (nav) nav.classList.remove('is-hidden');
      lenis.start();
    });
  });
}

/* ===== LOGO SCROLL SHRINK ===== */
function initLogoScroll() {
  const label = document.getElementById('menuLabel');
  if (!label) return;
  ScrollTrigger.create({
    trigger: document.body,
    start: 'top -100',
    onEnter: () => label.classList.add('is-scrolled'),
    onLeaveBack: () => label.classList.remove('is-scrolled'),
  });
}

/* ===== PRODUCT SHOWCASE ===== */
function initProductShowcase() {
  const showcase = document.getElementById('productShowcase');
  if (!showcase) return;
  const productImg = document.getElementById('productImg');
  const typeButtons = showcase.querySelectorAll('[data-type]');
  const flavorButtons = showcase.querySelectorAll('[data-flavor]');
  let currentType = 'classic';
  let currentFlavor = 'pepperoni';

  const productMap = {
    'classic-pepperoni': { img: 'https://images.squarespace-cdn.com/content/v1/54367345e4b0d3ba65ebc2ed/1517154799694-8T8BJSW5779917L62OQW/Pepperoni.JPG?format=1500w', bg: '#FFB82E' },
    'classic-red': { img: 'https://images.squarespace-cdn.com/content/v1/54367345e4b0d3ba65ebc2ed/1628001513602-VZPKBFVE9TNF47DD3NP4/image-asset.jpeg?format=1500w', bg: '#E85D3A' },
    'classic-white': { img: 'https://images.squarespace-cdn.com/content/v1/54367345e4b0d3ba65ebc2ed/1694033290413-H0O87PK2A2L6004IGWI1/DSC09997.jpeg?format=1500w', bg: '#F5E6D0' },
    'classic-porchetta': { img: 'https://images.squarespace-cdn.com/content/v1/54367345e4b0d3ba65ebc2ed/1414334464649-IVOBTZVA0GIP86TW9BK7/Porchetta.JPG?format=1500w', bg: '#98C379' },
    'specialty-pepperoni': { img: '/assets/images/specialty_pizza.jpg', bg: '#FFB82E' },
    'specialty-red': { img: '/assets/images/specialty_pizza.jpg', bg: '#E85D3A' },
    'specialty-white': { img: '/assets/images/specialty_pizza.jpg', bg: '#F5E6D0' },
    'specialty-porchetta': { img: '/assets/images/specialty_pizza.jpg', bg: '#98C379' },
    'appetizers-pepperoni': { img: 'https://images.squarespace-cdn.com/content/v1/54367345e4b0d3ba65ebc2ed/1694033272213-RRGAS79AVIRTXEVCYMSV/DSC09985.jpeg?format=1500w', bg: '#E88D67' },
    'salads-pepperoni': { img: 'https://images.squarespace-cdn.com/content/v1/54367345e4b0d3ba65ebc2ed/1694033302163-S0A1LCDLN80SXU2LR2ZQ/DSC00003.jpeg?format=1500w', bg: '#6EC8D0' },
  };

  function updateProduct() {
    const key = `${currentType}-${currentFlavor}`;
    const product = productMap[key] || productMap['classic-pepperoni'];
    gsap.to(productImg, {
      opacity: 0, scale: 0.9, duration: 0.3,
      onComplete: () => {
        productImg.src = product.img;
        gsap.to(productImg, { opacity: 1, scale: 1, duration: 0.4 });
      }
    });
    gsap.to(showcase, { backgroundColor: product.bg, duration: 0.5 });
  }

  typeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      typeButtons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentType = btn.dataset.type;
      updateProduct();
    });
  });

  flavorButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      flavorButtons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      currentFlavor = btn.dataset.flavor;
      updateProduct();
    });
  });
}

/* ===== INDIVIDUAL VIDEO SOUND TOGGLES ===== */
function initSoundToggle() {
  const soundToggles = document.querySelectorAll('.video-sound-toggle');
  
  soundToggles.forEach(toggle => {
    // Each toggle starts muted by default since videos have the 'muted' attribute
    let isMuted = true;
    
    toggle.addEventListener('click', () => {
      isMuted = !isMuted;
      
      // Update button visual state
      if (isMuted) {
        toggle.classList.remove('is-unmuted');
      } else {
        toggle.classList.add('is-unmuted');
      }

      // Find the associated video in the same wrapper
      const wrapper = toggle.closest('.video-hero__wrapper');
      if (wrapper) {
        const video = wrapper.querySelector('video.site-video');
        if (video) {
          video.muted = isMuted;
        }
      }
    });
  });
}

/* ===== PERSISTENT VIDEO PLAYBACK ===== */
function initVideoPersistence() {
  const allVideos = () => document.querySelectorAll('video');

  // Force-play a single video (swallow browser rejections gracefully)
  function forcePlay(video) {
    if (video.paused) {
      const p = video.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          // Browser blocked autoplay — mute and retry
          video.muted = true;
          video.play().catch(() => {});
        });
      }
    }
  }

  // Resume ALL videos on the page
  function resumeAll() {
    allVideos().forEach(forcePlay);
  }

  // 1. Page Visibility API — resume when tab regains focus
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Small delay lets the browser settle after tab switch
      setTimeout(resumeAll, 100);
    }
  });

  // 2. Window focus — catches alt-tab and returning from other windows
  window.addEventListener('focus', () => {
    setTimeout(resumeAll, 100);
  });

  // 3. Pageshow — fires on back/forward cache navigations (bfcache)
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      setTimeout(resumeAll, 200);
    }
    resumeAll();
  });

  // 4. IntersectionObserver — play when scrolled into view, pause when out
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        forcePlay(video);
      }
      // Don't pause when out of view — let them keep looping
    });
  }, { threshold: 0.1 });

  allVideos().forEach((video) => {
    // Ensure loop and autoplay attributes are set
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    videoObserver.observe(video);
  });

  // 5. Watchdog — periodic check every 3s to catch any stalled videos
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      allVideos().forEach((video) => {
        // Only force-play videos that are visible in the viewport
        const rect = video.getBoundingClientRect();
        const inViewport = rect.bottom > 0 && rect.top < window.innerHeight;
        if (inViewport && video.paused && video.readyState >= 2) {
          forcePlay(video);
        }
      });
    }
  }, 3000);

  // 6. Listen for video 'pause' events and immediately resume
  allVideos().forEach((video) => {
    video.addEventListener('pause', () => {
      // Only auto-resume if user didn't explicitly pause via controls
      // (our videos don't have controls, so any pause is a browser pause)
      if (document.visibilityState === 'visible') {
        setTimeout(() => forcePlay(video), 50);
      }
    });
  });

  // Initial kick — make sure everything is playing on load
  resumeAll();
}

/* ===== INIT ALL ===== */
document.addEventListener('DOMContentLoaded', () => {
  initSplitText();
  initIntro();
  initCursor();
  initMenu();
  initLogoScroll();
  initParallax();
  initCards();
  initSticky();
  initScrollReveal();
  initProductShowcase();
  initSoundToggle();
  initVideoPersistence();
});
