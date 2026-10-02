// Pleasant Ambient Logo Bouncing Arena:
// - Calm, smooth DVD diagonal gliding motion (70 px/sec)
// - Sleek translucent glass badges matching the site's slate & cyan design system
// - Soft ambient underglow and gentle water-like ripples on boundary touches
// - Smooth elastic mutual deflections preventing overlap without harsh collisions
// - Fully optimized for 60fps+ and throttled when off-screen

function initPleasantLogoPingPong() {
  const box = document.querySelector('[data-pingpong]');
  if (!box) return;

  const canvas = box.querySelector('.pp-ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const logos = [...box.querySelectorAll('.pp-logo')];
  if (logos.length === 0) return;

  // Badge size increased for better icon legibility and presence
  const SIZE = () => (box.clientWidth < 340 ? 38 : 44);
  const SPEED_X = 54; // Gentle horizontal speed
  const SPEED_Y = 44; // Organic diagonal ratio
  const TARGET_SPEED = Math.hypot(SPEED_X, SPEED_Y);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0, R = 0, dpr = 1;
  let balls = [];
  let ripples = [];
  let last = 0;
  let raf = null;
  let visible = true;
  let initialized = false;

  function resize() {
    W = box.clientWidth;
    H = box.clientHeight;
    R = SIZE() / 2;
    dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    logos.forEach(el => {
      el.style.width = SIZE() + 'px';
      el.style.height = SIZE() + 'px';
    });
  }

  function spawnRipple(x, y) {
    if (ripples.length > 8) ripples.shift();
    ripples.push({
      x,
      y,
      radius: 3,
      maxRadius: 20,
      alpha: 0.32,
      life: 0,
      maxLife: 0.55
    });
  }

  function triggerWallTouch(b, hitX, hitY) {
    // 1. Soft pulse effect on the logo
    b.el.classList.add('is-pulsing');
    clearTimeout(b.pulseTimer);
    b.pulseTimer = setTimeout(() => {
      b.el.classList.remove('is-pulsing');
    }, 380);

    // 2. Gentle spring squash
    b.scale = 0.94;

    // 3. Delicate water ripple
    spawnRipple(hitX, hitY);
  }

  function spawnBalls() {
    resize();
    if (W <= R * 2 || H <= R * 2) return;

    // Distribute 11 logos across a 4x3 grid with clean separation
    const cols = 4;
    const rows = 3;
    balls = logos.map((el, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = ((col + 0.5) / cols) * W + (Math.random() - 0.5) * 6;
      const cy = ((row + 0.5) / rows) * H + (Math.random() - 0.5) * 6;

      // Diagonal direction signs (+1 / -1)
      const signX = (i % 2 === 0) ? 1 : -1;
      const signY = (Math.floor(i / 2) % 2 === 0) ? 1 : -1;

      return {
        el,
        x: Math.min(Math.max(cx, R), W - R),
        y: Math.min(Math.max(cy, R), H - R),
        vx: signX * (SPEED_X + (Math.random() - 0.5) * 6),
        vy: signY * (SPEED_Y + (Math.random() - 0.5) * 6),
        scale: 1,
        rotation: (Math.random() - 0.5) * 6,
        rotSpeed: (Math.random() - 0.5) * 4,
        pulseTimer: null
      };
    });

    initialized = true;
    draw();
  }

  function update(dt) {
    if (W <= R * 2 || H <= R * 2) return;

    // 1. Position update & gentle boundary reflections
    for (let i = 0; i < balls.length; i++) {
      const b = balls[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      // Slow peaceful rotational drift
      b.rotation += b.rotSpeed * dt;
      if (Math.abs(b.rotation) > 7) b.rotSpeed = -b.rotSpeed;

      // Smooth recovery from soft squash
      b.scale += (1.0 - b.scale) * Math.min(dt * 10, 1);

      // Boundary reflections:
      if (b.x <= R) {
        b.x = R;
        b.vx = Math.abs(b.vx);
        triggerWallTouch(b, R, b.y);
      } else if (b.x >= W - R) {
        b.x = W - R;
        b.vx = -Math.abs(b.vx);
        triggerWallTouch(b, W - R, b.y);
      }

      if (b.y <= R) {
        b.y = R;
        b.vy = Math.abs(b.vy);
        triggerWallTouch(b, b.x, R);
      } else if (b.y >= H - R) {
        b.y = H - R;
        b.vy = -Math.abs(b.vy);
        triggerWallTouch(b, b.x, H - R);
      }
    }

    // 2. Gentle mutual repulsion between logos (prevents overlapping)
    const min = R * 2;
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const a = balls[i];
        const c = balls[j];
        const dx = c.x - a.x;
        const dy = c.y - a.y;
        const distSq = dx * dx + dy * dy;

        if (distSq >= min * min || distSq === 0) continue;

        const dist = Math.sqrt(distSq);
        const nx = dx / dist;
        const ny = dy / dist;

        // Smooth positional separation
        const overlap = (min - dist) / 2;
        a.x -= nx * overlap;
        a.y -= ny * overlap;
        c.x += nx * overlap;
        c.y += ny * overlap;

        // Soft elastic momentum transfer
        const rel = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
        if (rel < 0) {
          a.vx += rel * nx;
          a.vy += rel * ny;
          c.vx -= rel * nx;
          c.vy -= rel * ny;
        }
      }
    }

    // 3. Keep steady pleasant speed
    for (let i = 0; i < balls.length; i++) {
      const b = balls[i];
      const s = Math.hypot(b.vx, b.vy) || 1;
      b.vx = (b.vx / s) * TARGET_SPEED;
      b.vy = (b.vy / s) * TARGET_SPEED;
    }

    // 4. Update soft ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.life += dt;
      const progress = r.life / r.maxLife;
      r.radius = 4 + progress * (r.maxRadius - 4);
      r.alpha = Math.max(0, 0.32 * (1 - progress));

      if (r.life >= r.maxLife) {
        ripples.splice(i, 1);
      }
    }
  }

  function draw() {
    // 1. Move logo badges with hardware-accelerated transform
    for (let i = 0; i < balls.length; i++) {
      const b = balls[i];
      b.el.style.transform = `translate3d(${b.x - R}px, ${b.y - R}px, 0) rotate(${b.rotation.toFixed(1)}deg) scale(${b.scale.toFixed(3)})`;
    }

    // 2. Render delicate ambient glow & water ripples on canvas
    ctx.clearRect(0, 0, W, H);

    // Subtle soft glow beneath each moving logo
    for (let i = 0; i < balls.length; i++) {
      const b = balls[i];
      const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, R * 1.35);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
      grad.addColorStop(0.6, 'rgba(56, 189, 248, 0.04)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, R * 1.35, 0, Math.PI * 2);
      ctx.fill();
    }

    // Delicate translucent water ripples
    for (let i = 0; i < ripples.length; i++) {
      const r = ripples[i];
      ctx.strokeStyle = `rgba(56, 189, 248, ${r.alpha.toFixed(3)})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function loop(t) {
    if (!visible) {
      raf = null;
      return;
    }
    const dt = Math.min((t - last) / 1000, 0.05);
    last = t;
    update(dt);
    draw();
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (reduceMotion || raf) return;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }

  spawnBalls();
  start();

  // ResizeObserver: manages dynamic container sizes
  const ro = new ResizeObserver(() => {
    resize();
    if (!initialized && W > R * 2 && H > R * 2) {
      spawnBalls();
    } else {
      balls.forEach(b => {
        b.x = Math.min(Math.max(b.x, R), W - R);
        b.y = Math.min(Math.max(b.y, R), H - R);
      });
      draw();
    }
  });
  ro.observe(box);

  // IntersectionObserver: pauses animation when scrolled off-screen
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
    else stop();
  });
  io.observe(box);

  // VisibilityChange: pauses animation when tab is inactive
  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (visible) start();
    else stop();
  });
}

window.initLogoPingPong = initPleasantLogoPingPong;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPleasantLogoPingPong);
} else {
  initPleasantLogoPingPong();
}
