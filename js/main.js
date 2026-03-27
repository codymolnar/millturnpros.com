/* =============================================
   Mill Turn Pros — main.js
   ============================================= */

// --- Navbar: sticky scroll effect ---
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// --- Mobile hamburger menu ---
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close menu when a nav link is clicked
navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Close on outside click
document.addEventListener('click', (e) => {
  if (navMenu.classList.contains('open') &&
      !navMenu.contains(e.target) &&
      !hamburger.contains(e.target)) {
    navMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});

// --- Scroll-reveal (Intersection Observer) ---
const fadeEls = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

fadeEls.forEach(el => observer.observe(el));

// --- Footer year ---
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// --- Contact form (mailto fallback) ---
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name    = contactForm.name.value.trim();
    const company = contactForm.company.value.trim();
    const email   = contactForm.email.value.trim();
    const service = contactForm.service.value;
    const message = contactForm.message.value.trim();

    // Basic validation
    if (!name || !email || !message) {
      shakeForm(contactForm);
      return;
    }

    // TODO: Replace with your actual email address
    const toEmail = 'info@millturnpros.com';

    const subject = encodeURIComponent(
      `Quote Request${service ? ' — ' + service : ''} from ${name}`
    );

    const body = encodeURIComponent(
      `Name: ${name}\n` +
      (company ? `Company: ${company}\n` : '') +
      `Email: ${email}\n` +
      (service ? `Service: ${service}\n` : '') +
      `\nMessage:\n${message}`
    );

    window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;

    // Visual feedback
    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Opening Email Client…';
    contactForm.classList.add('submitted');

    setTimeout(() => {
      btn.textContent = originalText;
      contactForm.classList.remove('submitted');
      contactForm.reset();
    }, 3500);
  });
}

function shakeForm(form) {
  form.style.animation = 'none';
  form.offsetHeight; // reflow
  form.style.animation = 'shake 0.4s ease';
}

// Inject shake keyframes once
(function injectShake() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%       { transform: translateX(-6px); }
      40%       { transform: translateX(6px); }
      60%       { transform: translateX(-4px); }
      80%       { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);
})();

// --- Hero canvas particles (cursor-reactive) ---
(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx     = canvas.getContext('2d');
  let particles = [];
  const COUNT   = 55;
  const REPEL_R = 120;
  let animId;
  let mouse = { x: -9999, y: -9999 };

  function rand(a, b) { return Math.random() * (b - a) + a; }

  function resize() {
    canvas.width  = canvas.offsetWidth  || canvas.parentElement.offsetWidth;
    canvas.height = canvas.offsetHeight || canvas.parentElement.offsetHeight;
  }

  function spawn() {
    return {
      x:     rand(0, canvas.width),
      y:     rand(0, canvas.height),
      r:     rand(0.8, 2.2),
      vx:    rand(-0.15, 0.15),
      vy:    rand(-0.45, -0.1),
      alpha: rand(0.05, 0.35),
      da:    rand(0.003, 0.007) * (Math.random() < 0.5 ? 1 : -1),
    };
  }

  function init() { particles = Array.from({ length: COUNT }, spawn); }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      const dx   = p.x - mouse.x;
      const dy   = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < REPEL_R && dist > 1) {
        const f = ((REPEL_R - dist) / REPEL_R) * 1.5;
        p.x += (dx / dist) * f;
        p.y += (dy / dist) * f;
      }
      p.x     += p.vx;
      p.y     += p.vy;
      p.alpha += p.da;
      if (p.alpha > 0.4)  { p.alpha = 0.4;  p.da = -Math.abs(p.da); }
      if (p.alpha < 0.03) { p.alpha = 0.03; p.da =  Math.abs(p.da); }
      if (p.y < -5) { Object.assign(p, spawn()); p.y = canvas.height + 5; }
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle   = '#38bdf8';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    animId = requestAnimationFrame(draw);
  }

  const hero = document.getElementById('hero');
  if (hero) {
    hero.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }, { passive: true });
    hero.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });
  }

  resize();
  init();
  draw();

  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(animId);
    else draw();
  });
})();

// --- Stats count-up animation ---
(function () {
  const statsEl = document.querySelector('.about__stats');
  if (!statsEl) return;

  const statNums = statsEl.querySelectorAll('.stat__num');
  statNums.forEach(el => {
    el.dataset.target = parseInt(el.textContent, 10);
    el.dataset.suffix = el.querySelector('.stat__plus')?.textContent || '';
  });

  const obs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    statNums.forEach(el => {
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix;
      const dur = 1400;
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.innerHTML = Math.round(eased * target) + `<span class="stat__plus">${suffix}</span>`;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });

  obs.observe(statsEl);
})();

// --- G-Code Challenge game ---
(function () {
  const gameCard   = document.getElementById('gameCard');
  const gameResult = document.getElementById('gameResult');
  if (!gameCard) return;

  const POOL = [
    { code: 'G00', correct: 'Rapid traverse — no cutting',            opts: ['Rapid traverse — no cutting', 'Linear feed at programmed rate', 'Circular arc clockwise', 'Dwell'],                               explain: 'G00 repositions the tool at maximum machine speed without cutting. No F word needed — it just goes as fast as the machine allows.' },
    { code: 'G01', correct: 'Linear feed — cutting move',             opts: ['Rapid traverse', 'Linear feed — cutting move', 'Circular arc CCW', 'Return to home'],                                           explain: 'G01 moves in a straight line at the programmed F (feed rate). The fundamental cutting move for turning, milling, and drilling.' },
    { code: 'G02', correct: 'Circular arc — clockwise',               opts: ['Circular arc — clockwise', 'Circular arc — counter-clockwise', 'Rapid traverse', 'Tool length comp +'],                         explain: 'G02 cuts a clockwise arc (viewed from positive Z). Define the arc with I/J offsets or an R word for the radius.' },
    { code: 'G03', correct: 'Circular arc — counter-clockwise',       opts: ['Circular arc — clockwise', 'Circular arc — counter-clockwise', 'Cutter comp left', 'Incremental mode'],                         explain: 'G03 cuts a counter-clockwise arc. Together G02/G03 handle all circular interpolation in a CNC program.' },
    { code: 'G04', correct: 'Dwell — timed pause',                    opts: ['Rapid traverse', 'Program stop', 'Dwell — timed pause', 'Spindle orient'],                                                      explain: 'G04 P__ pauses execution for a set time (in ms or seconds depending on control). Used to let the spindle reach speed or for chip breaking on drilling cycles.' },
    { code: 'G28', correct: 'Return to machine home position',        opts: ['Return to machine home position', 'Absolute positioning', 'Cancel cutter comp', 'Set work offset'],                             explain: 'G28 sends axes to the machine reference (home) point, usually through an intermediate position. Commonly used before tool changes.' },
    { code: 'G40', correct: 'Cancel cutter radius compensation',      opts: ['Cutter comp left', 'Cutter comp right', 'Cancel cutter radius compensation', 'Tool length comp +'],                             explain: 'G40 cancels any active cutter comp (G41/G42). Always cancel comp in a safe move before ending the program.' },
    { code: 'G41', correct: 'Cutter comp — left of programmed path',  opts: ['Cutter comp — right of programmed path', 'Tool length comp +', 'Cutter comp — left of programmed path', 'Cancel comp'],        explain: 'G41 D__ offsets the tool left of the programmed path direction. "Left" is relative to the direction you\'re traveling.' },
    { code: 'G42', correct: 'Cutter comp — right of programmed path', opts: ['Cutter comp — left of programmed path', 'Cutter comp — right of programmed path', 'Tool length comp −', 'Rapid'],              explain: 'G42 D__ offsets the tool right of the programmed path. Used when the cutter diameter must be accounted for in the finished dimension.' },
    { code: 'G43', correct: 'Tool length offset — activate',          opts: ['Cancel tool length offset', 'Tool length offset — activate', 'Tool length offset − direction', 'Set tool table entry'],         explain: 'G43 H__ activates tool length compensation, adding the offset from register H to the Z axis. Cancel it with G49.' },
    { code: 'G54', correct: 'Select work coordinate system 1',        opts: ['Select work coordinate system 1', 'Select fixture offset 6', 'Return to home', 'Machine coordinate mode'],                      explain: 'G54–G59 select work coordinate systems. G54 = WCS #1. They let you run the same program at different locations on the machine table.' },
    { code: 'G90', correct: 'Absolute positioning mode',              opts: ['Incremental positioning mode', 'Absolute positioning mode', 'Return to home', 'Arc mode'],                                      explain: 'In G90, coordinates are measured from the WCS origin. X10 always means "go to X=10", regardless of where the tool is.' },
    { code: 'G91', correct: 'Incremental positioning mode',           opts: ['Absolute positioning mode', 'Incremental positioning mode', 'Cancel comp', 'Rapid traverse'],                                  explain: 'In G91, coordinates are measured from the current tool position. X10 means "move 10 in the positive X direction from here".' },
    { code: 'G96', correct: 'Constant surface speed mode',            opts: ['Constant RPM mode', 'Constant surface speed mode', 'Feed per revolution', 'Feed per minute'],                                  explain: 'G96 S__ sets a constant cutting speed (SFM or m/min). The control automatically varies the spindle RPM as the tool diameter or part diameter changes.' },
    { code: 'M03', correct: 'Spindle on — clockwise',                 opts: ['Spindle stop', 'Spindle on — counter-clockwise', 'Spindle on — clockwise', 'Coolant on'],                                      explain: 'M03 S__ starts the spindle clockwise at the specified speed. Standard for most milling and OD turning operations.' },
    { code: 'M05', correct: 'Spindle stop',                           opts: ['Spindle on CW', 'Coolant off', 'Spindle stop', 'Program end'],                                                                  explain: 'M05 stops spindle rotation. The spindle decelerates naturally — it does not brake to an instant stop.' },
    { code: 'M06', correct: 'Tool change',                            opts: ['Coolant on', 'Tool change', 'Program stop', 'Spindle orient'],                                                                  explain: 'M06 T__ executes a tool change. On a machining center the ATC swaps tools; on a lathe it indexes the turret to the specified station.' },
    { code: 'M08', correct: 'Coolant on (flood)',                     opts: ['Coolant off', 'Coolant on (flood)', 'Spindle on', 'Program stop'],                                                              explain: 'M08 activates flood coolant. M09 turns it off. Some controls use M07 for mist coolant or through-spindle coolant.' },
    { code: 'M30', correct: 'Program end and memory rewind',          opts: ['Optional program stop', 'Coolant off', 'Tool change', 'Program end and memory rewind'],                                         explain: 'M30 ends the program and rewinds the control\'s memory pointer to the beginning, ready to run the next part.' },
  ];

  const MSGS = [
    'Keep at it — G-codes take time to memorize.',
    'Getting there. A few more runs and it\'ll stick.',
    'Not bad! You know the basics.',
    'Solid knowledge — you clearly spend time at the machine.',
    'Almost perfect. Impressive G-code chops.',
    'Perfect score! You\'re a G-code authority.',
  ];

  function shuffle(a) { return [...a].sort(() => Math.random() - 0.5); }

  let qs = [], idx = 0, score = 0, results = [];
  let timerRaf = null;
  const TIMER_DUR = 15000;

  const progressText = document.getElementById('gameProgressText');
  const progressFill = document.getElementById('gameProgressFill');
  const timerFill    = document.getElementById('gameTimerFill');
  const codeEl       = document.getElementById('gameCode');
  const choicesEl    = document.getElementById('gameChoices');
  const explainEl    = document.getElementById('gameExplain');
  const explainText  = document.getElementById('gameExplainText');
  const scoreEl      = document.getElementById('gameScore');
  const scoreMsgEl   = document.getElementById('gameScoreMsg');
  const breakdownEl  = document.getElementById('gameBreakdown');

  function start() {
    qs = shuffle(POOL).slice(0, 5);
    idx = 0; score = 0; results = [];
    gameCard.style.display   = '';
    gameResult.style.display = 'none';
    show();
  }

  function show() {
    const q = qs[idx];
    progressText.textContent = `Question ${idx + 1} of 5`;
    progressFill.style.width = `${(idx / 5) * 100}%`;
    codeEl.textContent       = q.code;
    explainEl.style.display  = 'none';

    choicesEl.innerHTML = '';
    shuffle(q.opts).forEach(opt => {
      const btn = document.createElement('button');
      btn.className   = 'game__choice';
      btn.textContent = opt;
      btn.addEventListener('click', () => answer(opt, q.correct, q.explain));
      choicesEl.appendChild(btn);
    });

    startTimer();
  }

  function startTimer() {
    stopTimer();
    const t0 = performance.now();
    timerFill.style.width      = '100%';
    timerFill.style.background = 'var(--accent)';

    function tick(now) {
      const pct = Math.max(0, 1 - (now - t0) / TIMER_DUR);
      timerFill.style.width = `${pct * 100}%`;
      if      (pct > 0.5)  timerFill.style.background = 'var(--accent)';
      else if (pct > 0.25) timerFill.style.background = '#f97316';
      else                 timerFill.style.background = '#ef4444';

      if (pct <= 0) { onTimeout(); return; }
      timerRaf = requestAnimationFrame(tick);
    }
    timerRaf = requestAnimationFrame(tick);
  }

  function stopTimer() {
    if (timerRaf) { cancelAnimationFrame(timerRaf); timerRaf = null; }
  }

  function onTimeout() {
    const q = qs[idx];
    lockChoices(null, q.correct);
    results.push({ code: q.code, correct: q.correct, got: false });
    showExplain(q.explain);
  }

  function answer(chosen, correct, explain) {
    stopTimer();
    timerFill.style.width = '0%';
    const got = chosen === correct;
    if (got) score++;
    lockChoices(chosen, correct);
    results.push({ code: qs[idx].code, correct, got });
    showExplain(explain);
  }

  function lockChoices(chosen, correct) {
    choicesEl.querySelectorAll('.game__choice').forEach(b => {
      b.disabled = true;
      if (b.textContent === correct)      b.classList.add('correct');
      else if (b.textContent === chosen)  b.classList.add('wrong');
    });
  }

  function showExplain(text) {
    explainText.textContent = text;
    explainEl.style.display = '';
  }

  document.getElementById('gameNext').addEventListener('click', () => {
    idx++;
    idx < 5 ? show() : finish();
  });

  function finish() {
    progressFill.style.width = '100%';
    gameCard.style.display   = 'none';
    gameResult.style.display = '';
    scoreEl.textContent      = score;
    scoreMsgEl.textContent   = MSGS[score] ?? MSGS[0];

    breakdownEl.innerHTML = '';
    results.forEach(r => {
      const row = document.createElement('div');
      row.className = 'game__breakdown-item ' + (r.got ? 'correct' : 'wrong');
      row.innerHTML =
        `<span class="game__bd-icon">${r.got ? '✓' : '✗'}</span>` +
        `<span class="game__bd-code">${r.code}</span>` +
        `<span class="game__bd-answer">${r.correct}</span>`;
      breakdownEl.appendChild(row);
    });
  }

  document.getElementById('gameRestart').addEventListener('click', start);
  start();
})();

// --- Smooth active nav highlight on scroll ---
const sections = document.querySelectorAll('section[id]');
const navLinks  = navMenu.querySelectorAll('a[href^="#"]:not(.btn)');

function updateActiveNav() {
  const scrollY = window.scrollY + 100;
  sections.forEach(section => {
    const top    = section.offsetTop;
    const height = section.offsetHeight;
    const id     = section.getAttribute('id');
    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${id}`
          ? 'var(--text)'
          : '';
      });
    }
  });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });
