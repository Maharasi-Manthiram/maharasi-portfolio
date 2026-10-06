/**
 * MAHARASI M - Portfolio Interactive JavaScript
 * Modern, High-Performance Micro-Interactions & Animations
 */

// Canvas roundRect Polyfill for universal browser compatibility
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
    const r = typeof radii === 'number' ? radii : 4;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

document.addEventListener('DOMContentLoaded', () => {
  initBackgroundCanvas();
  initScrollProgress();
  initNavbar();
  initTypingEffect();
  initScrollReveal();
  initSkillsFilter();
  initProjectTabs();
  initGestureSimulator();
  initModals();
  initContactForm();
  initClipboardActions();
  initBackToTop();
});

/* ==========================================================================
   1. Interactive Ambient Background Canvas
   ========================================================================== */
function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particleCount = Math.min(Math.floor(window.innerWidth / 20), 45);
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 1.8 + 0.8,
      alpha: Math.random() * 0.5 + 0.2
    });
  }

  let mouse = { x: null, y: null, maxDist: 120 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  function render() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99, 102, 241, ${p.alpha})`;
      ctx.fill();

      // Connect with close particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          const opacity = (1 - dist / 110) * 0.16;
          ctx.strokeStyle = `rgba(0, 242, 254, ${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // Connect with mouse
      if (mouse.x !== null && mouse.y !== null) {
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < mouse.maxDist) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          const mOpacity = (1 - mdist / mouse.maxDist) * 0.35;
          ctx.strokeStyle = `rgba(56, 189, 248, ${mOpacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(render);
  }

  render();
}

/* ==========================================================================
   2. Scroll Progress Bar
   ========================================================================== */
function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress-bar');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / totalHeight) * 100;
    bar.style.width = `${Math.min(progress, 100)}%`;
  }, { passive: true });
}

/* ==========================================================================
   3. Header, Navigation & Active Spy
   ========================================================================== */
function initNavbar() {
  const header = document.querySelector('.header');
  const toggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Header background blur on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile menu toggle
  if (toggle && navMenu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      navMenu.classList.toggle('open');
      document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
    });

    // Close when clicking nav link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        navMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        toggle.classList.remove('active');
        navMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // Active section scroll spy
  function updateActiveLink() {
    const scrollPos = window.scrollY + 180;
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(l => {
          if (l.getAttribute('href') === `#${id}`) {
            l.classList.add('active');
          } else {
            l.classList.remove('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
}

/* ==========================================================================
   4. Dynamic Typing Effect
   ========================================================================== */
function initTypingEffect() {
  const typedSpan = document.getElementById('typed-text');
  if (!typedSpan) return;

  const roles = [
    "MCA Student",
    "Aspiring Software Developer",
    "Data Analytics Enthusiast",
    "Computer Vision & AI Explorer",
    "Python & Web Developer"
  ];

  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function type() {
    const currentRole = roles[roleIdx];

    if (isDeleting) {
      typedSpan.textContent = currentRole.substring(0, charIdx - 1);
      charIdx--;
      typingSpeed = 50;
    } else {
      typedSpan.textContent = currentRole.substring(0, charIdx + 1);
      charIdx++;
      typingSpeed = 110;
    }

    if (!isDeleting && charIdx === currentRole.length) {
      typingSpeed = 1800; // Pause at full word
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      typingSpeed = 400; // Pause before next word
    }

    setTimeout(type, typingSpeed);
  }

  type();
}

/* ==========================================================================
   5. Scroll Reveal with Intersection Observer
   ========================================================================== */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  function checkVisibility() {
    const triggerBottom = window.innerHeight + 150;
    reveals.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= triggerBottom) {
        el.classList.add('active');
      }
    });
  }

  // Initial check
  checkVisibility();

  // Scroll and resize listeners
  window.addEventListener('scroll', checkVisibility, { passive: true });
  window.addEventListener('resize', checkVisibility, { passive: true });

  // IntersectionObserver as secondary progressive enhancement
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, {
      rootMargin: '150px 0px 50px 0px',
      threshold: 0.02
    });

    reveals.forEach(el => observer.observe(el));
  }
}

/* ==========================================================================
   6. Skills Filter Navigation
   ========================================================================== */
function initSkillsFilter() {
  const filterBtns = document.querySelectorAll('.skill-filter-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      skillCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 20);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });
}

/* ==========================================================================
   7. Featured Project Tabs
   ========================================================================== */
function initProjectTabs() {
  const tabBtns = document.querySelectorAll('.proj-tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const activeContent = document.getElementById(targetTab);
      if (activeContent) {
        activeContent.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   8. Interactive Gesture & Pygame Racing Simulator
   ========================================================================== */
function initGestureSimulator() {
  const canvas = document.getElementById('racing-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width = 600;
  canvas.height = 280;

  const simStatus = document.getElementById('sim-status-text');
  const gestureBtns = document.querySelectorAll('.gesture-btn');

  // Simulation State
  let car = {
    x: 275,
    y: 200,
    width: 38,
    height: 64,
    speed: 4,
    color: '#00f2fe'
  };

  let roadOffset = 0;
  let activeGesture = 'Straight';
  let activeDirection = 0; // -1: left, 1: right, 0: center
  let isAccelerating = false;
  let isBraking = false;

  // Road lines
  function drawRoad() {
    // Road background
    ctx.fillStyle = '#0a0d18';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Track boundaries
    ctx.fillStyle = '#1e243d';
    ctx.fillRect(150, 0, 300, canvas.height);

    // Left and right lane borders
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(150, 0);
    ctx.lineTo(150, canvas.height);
    ctx.moveTo(450, 0);
    ctx.lineTo(450, canvas.height);
    ctx.stroke();

    // Center dashed line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.setLineDash([20, 20]);
    ctx.lineDashOffset = -roadOffset;
    ctx.beginPath();
    ctx.moveTo(300, 0);
    ctx.lineTo(300, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawCar() {
    // Car Body
    ctx.save();
    ctx.translate(car.x, car.y);

    // Subtle drift rotation
    if (activeDirection === -1) ctx.rotate(-0.08);
    if (activeDirection === 1) ctx.rotate(0.08);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(-car.width/2 + 3, -car.height/2 + 5, car.width, car.height);

    // Chassis
    const gradient = ctx.createLinearGradient(0, -car.height/2, 0, car.height/2);
    gradient.addColorStop(0, '#00f2fe');
    gradient.addColorStop(1, '#6366f1');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(-car.width/2, -car.height/2, car.width, car.height, 6);
    ctx.fill();

    // Windshield
    ctx.fillStyle = '#070814';
    ctx.beginPath();
    ctx.roundRect(-car.width/2 + 5, -car.height/2 + 10, car.width - 10, 16, 3);
    ctx.fill();

    // Headlights
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-car.width/2 + 4, -car.height/2 - 2, 7, 4);
    ctx.fillRect(car.width/2 - 11, -car.height/2 - 2, 7, 4);

    // Headlight glow
    ctx.fillStyle = 'rgba(254, 240, 138, 0.15)';
    ctx.beginPath();
    ctx.moveTo(-car.width/2 + 7, -car.height/2);
    ctx.lineTo(-car.width/2 - 15, -car.height/2 - 70);
    ctx.lineTo(car.width/2 + 15, -car.height/2 - 70);
    ctx.lineTo(car.width/2 - 7, -car.height/2);
    ctx.fill();

    // Rear taillights
    ctx.fillStyle = isBraking ? '#ef4444' : '#991b1b';
    ctx.fillRect(-car.width/2 + 4, car.height/2 - 3, 7, 3);
    ctx.fillRect(car.width/2 - 11, car.height/2 - 3, 7, 3);

    ctx.restore();
  }

  function drawHUD() {
    ctx.fillStyle = 'rgba(18, 21, 42, 0.85)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(15, 15, 175, 75, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = '10px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('OPENCV + MEDIAPIPE AI', 25, 32);

    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#00f2fe';
    ctx.fillText(`Gesture: ${activeGesture}`, 25, 52);

    ctx.fillStyle = '#f8fafc';
    ctx.fillText(`Speed: ${(car.speed * 18).toFixed(0)} km/h`, 25, 72);
  }

  function loop() {
    // Speed adjustments
    if (isAccelerating) {
      car.speed = Math.min(car.speed + 0.15, 9);
    } else if (isBraking) {
      car.speed = Math.max(car.speed - 0.25, 1);
    } else {
      // Normal cruise speed
      if (car.speed > 4.5) car.speed -= 0.05;
      if (car.speed < 4.5) car.speed += 0.05;
    }

    roadOffset += car.speed * 2.2;

    // Lateral steering
    if (activeDirection === -1) {
      car.x = Math.max(car.x - 3.5, 175);
    } else if (activeDirection === 1) {
      car.x = Math.min(car.x + 3.5, 425);
    } else {
      // Natural slight drift toward center
      car.x += (300 - car.x) * 0.02;
    }

    drawRoad();
    drawCar();
    drawHUD();

    requestAnimationFrame(loop);
  }

  loop();

  // Gesture Button Controls
  function applyGesture(action) {
    gestureBtns.forEach(btn => btn.classList.remove('active'));
    const targetBtn = document.querySelector(`.gesture-btn[data-action="${action}"]`);
    if (targetBtn) targetBtn.classList.add('active');

    if (action === 'left') {
      activeGesture = '👈 Hand Left (Steer)';
      activeDirection = -1;
      isAccelerating = false;
      isBraking = false;
      if (simStatus) simStatus.textContent = 'Detected: Hand tilt LEFT -> Pygame Key LEFT';
    } else if (action === 'right') {
      activeGesture = '👉 Hand Right (Steer)';
      activeDirection = 1;
      isAccelerating = false;
      isBraking = false;
      if (simStatus) simStatus.textContent = 'Detected: Hand tilt RIGHT -> Pygame Key RIGHT';
    } else if (action === 'accelerate') {
      activeGesture = '👆 Index Up (Accelerate)';
      activeDirection = 0;
      isAccelerating = true;
      isBraking = false;
      if (simStatus) simStatus.textContent = 'Detected: Finger Up -> Pygame Key UP (Accelerate)';
    } else if (action === 'brake') {
      activeGesture = '✋ Open Palm (Brake)';
      activeDirection = 0;
      isAccelerating = false;
      isBraking = true;
      if (simStatus) simStatus.textContent = 'Detected: Open Palm -> Pygame Key DOWN (Brake)';
    } else if (action === 'straight') {
      activeGesture = '👌 Neutral / Center';
      activeDirection = 0;
      isAccelerating = false;
      isBraking = false;
      if (simStatus) simStatus.textContent = 'Neutral Hand Tracking (Holding Lane)';
    }
  }

  gestureBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      applyGesture(action);
    });
  });

  // Keyboard navigation for simulator
  window.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'KeyA'].includes(e.code)) {
      applyGesture('left');
    } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
      applyGesture('right');
    } else if (['ArrowUp', 'KeyW'].includes(e.code)) {
      applyGesture('accelerate');
    } else if (['ArrowDown', 'KeyS', 'Space'].includes(e.code)) {
      applyGesture('brake');
    }
  });

  window.addEventListener('keyup', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyD', 'KeyW', 'KeyS', 'Space'].includes(e.code)) {
      applyGesture('straight');
    }
  });
}

/* ==========================================================================
   9. Modals (Resume & Certificate Details)
   ========================================================================== */
function initModals() {
  const resumeModal = document.getElementById('resume-modal');
  const certModal = document.getElementById('cert-modal');
  const openResumeBtns = document.querySelectorAll('.open-resume-modal');
  const openCertBtns = document.querySelectorAll('.open-cert-modal');
  const closeBtns = document.querySelectorAll('.modal-close-btn, .modal-backdrop');

  // Resume Modal Open
  openResumeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (resumeModal) {
        resumeModal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  // Certificate Modal Content Data
  const certData = {
    mongodb: {
      title: "MongoDB and the Document Model",
      issuer: "MongoDB, Inc. — October 2024",
      badge: "🍃 MongoDB Certified",
      summary: "Detailed course covering MongoDB document architecture, BSON schema structures, CRUD operations, indexing, and high-efficiency querying in modern applications.",
      topics: [
        "Document-oriented database architecture and JSON/BSON structures",
        "CRUD operations: Advanced insertions, querying, filters, and projections",
        "Index optimization, compound indices, and aggregation pipeline fundamentals",
        "Data modeling patterns for scalable software architectures"
      ]
    },
    springboot: {
      title: "Spring 5 Basics with Spring Boot",
      issuer: "Infosys Springboard — March 2025",
      badge: "🍃 Spring Framework",
      summary: "Comprehensive training on enterprise Java programming with Spring Boot, dependency injection, and RESTful web microservices architecture.",
      topics: [
        "Spring 5 Core principles: Inversion of Control (IoC) & Dependency Injection (DI)",
        "Spring Boot auto-configuration, starters, and application properties",
        "Building RESTful APIs with Spring MVC and request/response mapping",
        "Integration of enterprise persistence layer and database connectivity"
      ]
    },
    aiml: {
      title: "AI & ML Training Program",
      issuer: "Besant Technologies — October 2025",
      badge: "🤖 AI & Machine Learning",
      summary: "In-depth practical training program covering core machine learning models, statistical data analysis, model evaluation, and Python implementations.",
      topics: [
        "Foundations of Machine Learning: Supervised vs Unsupervised learning",
        "Data cleaning, exploratory data analysis (EDA), and feature engineering",
        "Regression models, classification algorithms, and decision trees",
        "Hands-on Python implementation with NumPy, Pandas, Scikit-Learn, and Jupyter Notebook"
      ]
    }
  };

  openCertBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const certKey = btn.getAttribute('data-cert');
      const data = certData[certKey];
      if (!data || !certModal) return;

      document.getElementById('cert-modal-title').textContent = data.title;
      document.getElementById('cert-modal-issuer').textContent = data.issuer;
      document.getElementById('cert-modal-summary').textContent = data.summary;
      
      const listEl = document.getElementById('cert-modal-topics');
      listEl.innerHTML = '';
      data.topics.forEach(t => {
        const li = document.createElement('li');
        li.textContent = t;
        listEl.appendChild(li);
      });

      certModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  // Modal Closers
  closeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop') || e.target.closest('.modal-close-btn')) {
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
        document.body.style.overflow = '';
      }
    });
  });

  // Close modals on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
      document.body.style.overflow = '';
    }
  });

  // Print Resume trigger
  const printBtn = document.getElementById('print-resume-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

/* ==========================================================================
   10. Contact Form Interaction & Validation
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.elements['name']?.value.trim();
    const email = form.elements['email']?.value.trim();
    const subject = form.elements['subject']?.value.trim() || 'Portfolio Inquiry';
    const message = form.elements['message']?.value.trim();

    if (!name || !email || !message) {
      showToast('⚠️ Please fill in all required fields (Name, Email, Message).', 'error');
      return;
    }

    // Trigger toast notification
    showToast(`✅ Thank you, ${name}! Generating email draft to Maharasi M...`, 'success');

    // Create mailto prefill as direct fallback
    setTimeout(() => {
      const mailtoUrl = `mailto:swethadurai2k@gmail.com?subject=${encodeURIComponent(subject + ' - ' + name)}&body=${encodeURIComponent(message + '\n\n---\nSent by: ' + name + ' (' + email + ')')}`;
      window.location.href = mailtoUrl;
      form.reset();
    }, 1200);
  });
}

/* ==========================================================================
   11. Clipboard Quick Actions (Email & Phone)
   ========================================================================== */
function initClipboardActions() {
  const copyElements = document.querySelectorAll('[data-copy]');

  copyElements.forEach(el => {
    el.addEventListener('click', () => {
      const textToCopy = el.getAttribute('data-copy');
      const label = el.getAttribute('data-copy-label') || 'Text';

      if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`📋 Copied ${label}: ${textToCopy}`, 'success');
        }).catch(() => {
          showToast(`Direct copy: ${textToCopy}`, 'info');
        });
      } else {
        showToast(`Contact: ${textToCopy}`, 'info');
      }
    });
  });
}

/* Toast Notification Utility */
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

/* ==========================================================================
   12. Back to Top Button
   ========================================================================== */
function initBackToTop() {
  const topBtn = document.getElementById('back-to-top');
  if (!topBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      topBtn.classList.add('visible');
    } else {
      topBtn.classList.remove('visible');
    }
  }, { passive: true });

  topBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
