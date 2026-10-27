// Fondo animado de escritorio. main.js lo importa bajo demanda: en celular este archivo ni se descarga.
const DPR = Math.min(devicePixelRatio || 1, 1.5);
const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);

// Los colores salen de las variables CSS (#rrggbb), así el fondo sigue al tema y a la carrera.
const cssColor = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
function rgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}
function layer(w, h) {
  const c = document.createElement("canvas");
  c.width = Math.round(w * DPR);
  c.height = Math.round(h * DPR);
  const ctx = c.getContext("2d");
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  return [c, ctx];
}

export function createBackground() {
  const cv = document.createElement("canvas");
  cv.className = "fx";
  cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const ctx = cv.getContext("2d");
  const mouse = { x: -1e4, y: -1e4, nx: 0, ny: 0, sx: 0, sy: 0, active: false };
  const light = matchMedia("(prefers-color-scheme: light)");
  let w, h, kind, scene, raf = 0, last = 0, timer;

  function build() {
    w = innerWidth;
    h = innerHeight;
    cv.width = Math.round(w * DPR);
    cv.height = Math.round(h * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const pal = { a: cssColor("--accent"), b: cssColor("--accent2"), fx: cssColor("--fx") };
    scene = (kind === "space" ? space : circuit)(w, h, pal);
  }

  function frame(t) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(50, t - (last || t)) / 1000;
    last = t;
    mouse.sx += (mouse.nx - mouse.sx) * 0.05;
    mouse.sy += (mouse.ny - mouse.sy) * 0.05;
    ctx.clearRect(0, 0, w, h);
    scene(ctx, t / 1000, dt, mouse);
  }

  const onResize = () => { clearTimeout(timer); timer = setTimeout(build, 150); };
  const onMove = (e) => {
    Object.assign(mouse, { x: e.clientX, y: e.clientY, nx: e.clientX / w - 0.5, ny: e.clientY / h - 0.5, active: true });
  };
  const onLeave = () => { mouse.active = false; };
  addEventListener("resize", onResize);
  addEventListener("pointermove", onMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);
  light.addEventListener("change", build);

  return {
    set(k) {
      kind = k;
      build();
      if (!raf) raf = requestAnimationFrame(frame);
      requestAnimationFrame(() => cv.classList.add("on"));
    },
    stop() {
      cancelAnimationFrame(raf);
      raf = 0;
      removeEventListener("resize", onResize);
      removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      light.removeEventListener("change", build);
      cv.remove();
    },
  };
}

function circuit(w, h, pal) {
  const g = 40;
  const DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  const used = new Set();
  const traces = [];
  const count = Math.round((w * h) / (g * g * 12));

  for (let i = 0; i < count * 3 && traces.length < count; i++) {
    let x = Math.floor(rand(0, w / g + 1)), y = Math.floor(rand(0, h / g + 1));
    if (used.has(`${x},${y}`)) continue;
    let d = Math.floor(rand(0, 4)) * 2;
    const pts = [[x, y]];
    used.add(`${x},${y}`);
    const steps = Math.floor(rand(3, 10));
    for (let s = 0; s < steps; s++) {
      // Solo giros de 45° para que parezcan pistas de un circuito impreso
      if (Math.random() < 0.3) d = (d + (Math.random() < 0.5 ? 1 : 7)) % 8;
      const nx = x + DIRS[d][0], ny = y + DIRS[d][1];
      if (used.has(`${nx},${ny}`)) break;
      x = nx; y = ny;
      used.add(`${x},${y}`);
      pts.push([x, y]);
    }
    if (pts.length < 3) continue;
    const p = pts.map(([a, b]) => [a * g, b * g]);
    const acc = [0];
    for (let k = 1; k < p.length; k++) acc.push(acc[k - 1] + Math.hypot(p[k][0] - p[k - 1][0], p[k][1] - p[k - 1][1]));
    traces.push({ p, acc, len: acc[acc.length - 1], flash: 0 });
  }

  const paint = (c, lineA, padA) => {
    c.lineWidth = 1.2;
    c.lineJoin = "round";
    for (const t of traces) {
      c.strokeStyle = rgba(pal.a, lineA);
      c.beginPath();
      t.p.forEach(([x, y], k) => (k ? c.lineTo(x, y) : c.moveTo(x, y)));
      c.stroke();
      c.strokeStyle = rgba(pal.a, padA);
      for (const [x, y] of [t.p[0], t.p[t.p.length - 1]]) {
        c.beginPath();
        c.arc(x, y, 3, 0, TAU);
        c.stroke();
      }
    }
  };
  const [base, bctx] = layer(w, h);
  bctx.fillStyle = rgba(pal.fx, 0.06);
  for (let x = 0; x <= w; x += g) for (let y = 0; y <= h; y += g) bctx.fillRect(x - 0.75, y - 0.75, 1.5, 1.5);
  paint(bctx, 0.1, 0.25);
  const [bright, brctx] = layer(w, h);
  paint(brctx, 0.55, 0.9);

  const R = 200;
  const [lens, lctx] = layer(R * 2, R * 2);

  const at = (t, s) => {
    let k = 1;
    while (k < t.acc.length - 1 && t.acc[k] < s) k++;
    const f = (s - t.acc[k - 1]) / (t.acc[k] - t.acc[k - 1] || 1);
    const [x1, y1] = t.p[k - 1], [x2, y2] = t.p[k];
    return [x1 + (x2 - x1) * f, y1 + (y2 - y1) * f, k];
  };
  const spawn = (p) => Object.assign(p, {
    t: traces[Math.floor(rand(0, traces.length))],
    s: 0,
    v: rand(70, 160),
    wait: rand(0, 2.5),
    c: Math.random() < 0.7 ? pal.a : pal.b,
  });
  const pulses = traces.length ? Array.from({ length: Math.max(8, Math.round(traces.length / 3)) }, () => spawn({})) : [];

  return (ctx, now, dt, mouse) => {
    ctx.drawImage(base, 0, 0, w, h);

    if (mouse.active) {
      // Las pistas cerca del mouse se iluminan con un borde suave (máscara radial sobre la capa brillante)
      lctx.globalCompositeOperation = "source-over";
      lctx.clearRect(0, 0, R * 2, R * 2);
      lctx.drawImage(bright, (mouse.x - R) * DPR, (mouse.y - R) * DPR, R * 2 * DPR, R * 2 * DPR, 0, 0, R * 2, R * 2);
      const m = lctx.createRadialGradient(R, R, 0, R, R, R);
      m.addColorStop(0, "#000");
      m.addColorStop(1, "transparent");
      lctx.globalCompositeOperation = "destination-in";
      lctx.fillStyle = m;
      lctx.fillRect(0, 0, R * 2, R * 2);
      ctx.drawImage(lens, mouse.x - R, mouse.y - R, R * 2, R * 2);
    }

    for (const t of traces) {
      if (t.flash <= 0) continue;
      t.flash -= dt * 1.5;
      const [x, y] = t.p[t.p.length - 1];
      ctx.fillStyle = rgba(pal.a, Math.max(0, t.flash) * 0.6);
      ctx.beginPath();
      ctx.arc(x, y, 3 + (1 - t.flash) * 6, 0, TAU);
      ctx.fill();
    }

    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    for (const p of pulses) {
      if (p.wait > 0) { p.wait -= dt; continue; }
      p.s += p.v * dt;
      if (p.s >= p.t.len) { p.t.flash = 1; spawn(p); continue; }
      const [x, y, k] = at(p.t, p.s);
      const tail = Math.max(0, p.s - 46);
      const [tx, ty, tk] = at(p.t, tail);
      const grad = ctx.createLinearGradient(tx, ty, x, y);
      grad.addColorStop(0, rgba(p.c, 0));
      grad.addColorStop(1, rgba(p.c, 0.85));
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      for (let j = tk; j < k; j++) ctx.lineTo(p.t.p[j][0], p.t.p[j][1]);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.fillStyle = rgba(p.c, 0.22);
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, TAU);
      ctx.fill();
      ctx.fillStyle = rgba(p.c, 1);
      ctx.beginPath();
      ctx.arc(x, y, 1.8, 0, TAU);
      ctx.fill();
    }
  };
}

function space(w, h, pal) {
  const [far, fctx] = layer(w, h);
  for (const [x, y, r, c, a] of [[0.2, 0.3, 0.5, pal.a, 0.1], [0.65, 0.15, 0.4, pal.b, 0.06], [0.4, 0.85, 0.45, pal.a, 0.05]]) {
    const n = fctx.createRadialGradient(x * w, y * h, 0, x * w, y * h, r * Math.max(w, h));
    n.addColorStop(0, rgba(c, a));
    n.addColorStop(1, rgba(c, 0));
    fctx.fillStyle = n;
    fctx.fillRect(0, 0, w, h);
  }
  for (let i = 0, n = (w * h) / 2200; i < n; i++) {
    fctx.fillStyle = rgba(pal.fx, rand(0.15, 0.6));
    const s = rand(0.4, 1.1);
    fctx.fillRect(rand(0, w), rand(0, h), s, s);
  }

  const stars = Array.from({ length: Math.round((w * h) / 14000) }, () => ({
    x: rand(0, w), y: rand(0, h), r: rand(0.6, 1.6), z: rand(0.3, 1), f: rand(0.6, 2.2), ph: rand(0, TAU),
  }));
  for (let i = 0; i < 4; i++) Object.assign(stars[i] || {}, { r: 2.2, flare: true });

  // Saturno usa colores fijos (no los del acento) para que se reconozca en ambos temas
  const R = Math.min(w, h) * 0.16;
  const cx = w * 0.82, cy = h * 0.78;
  const tilt = -0.38, flat = 0.3; // inclinación del sistema y achatamiento de los anillos vistos desde arriba
  const S = R * 2.4;
  const [back, bk] = layer(S * 2, S * 2);
  const [front, fr] = layer(S * 2, S * 2);

  // Anillos C, B y A con la división de Cassini (1,95–2,03 R) y la de Encke (~2,21 R)
  const ringsHalf = (c, from, to) => {
    for (let r = 1.24; r < 2.27; r += 0.012) {
      if ((r > 1.95 && r < 2.03) || (r > 2.205 && r < 2.22)) continue;
      const [rgb, a] = r < 1.53 ? ["150,132,108", 0.2] : r < 1.95 ? ["228,208,168", 0.75] : ["204,184,146", 0.5];
      c.strokeStyle = `rgba(${rgb},${a * rand(0.7, 1.1)})`;
      c.lineWidth = R * 0.014;
      c.beginPath();
      c.ellipse(S, S, r * R, r * R * flat, tilt, from, to);
      c.stroke();
    }
  };
  ringsHalf(bk, Math.PI, TAU);

  const halo = fr.createRadialGradient(S, S, R * 0.9, S, S, R * 1.3);
  halo.addColorStop(0, "rgba(233,214,170,0.14)");
  halo.addColorStop(1, "rgba(233,214,170,0)");
  fr.fillStyle = halo;
  fr.fillRect(0, 0, S * 2, S * 2);
  fr.save();
  fr.translate(S, S);
  fr.rotate(tilt);
  fr.beginPath();
  fr.arc(0, 0, R, 0, TAU);
  fr.clip();
  const bands = ["#b89466", "#d6b98a", "#e8d6ad", "#d9bf8f", "#e6d1a3", "#cdaa76", "#e2c999", "#c9a26c", "#dcc193", "#c39b66", "#d4b482", "#a9855a"];
  for (let i = 0, y = -R; i < bands.length; i++) {
    const bh = (2 * R) / bands.length * rand(0.7, 1.3);
    fr.fillStyle = bands[i];
    fr.fillRect(-R, y, 2 * R, i === bands.length - 1 ? R - y : bh + 1);
    y += bh;
  }
  fr.strokeStyle = "rgba(20,14,8,0.35)";
  fr.lineWidth = R * 0.07;
  fr.beginPath();
  fr.ellipse(0, -R * 0.12, R * 1.7, R * 1.7 * flat, 0, Math.PI, TAU);
  fr.stroke();
  const shade = fr.createRadialGradient(-R * 0.4, -R * 0.45, R * 0.1, 0, 0, R * 1.05);
  shade.addColorStop(0, "rgba(255,250,235,0.25)");
  shade.addColorStop(0.55, "rgba(0,0,0,0)");
  shade.addColorStop(1, "rgba(6,10,19,0.88)");
  fr.fillStyle = shade;
  fr.fillRect(-R, -R, 2 * R, 2 * R);
  fr.restore();
  ringsHalf(fr, 0, Math.PI);

  const orbits = [2.9, 3.6].map((k, i) => ({
    a: R * k, b: R * k * flat, ang: rand(0, TAU), v: (0.16 - i * 0.05) * (i % 2 ? -1 : 1), c: i ? pal.b : pal.a,
  }));
  const posOn = (o, ang, ox, oy) => {
    const ca = Math.cos(ang) * o.a, sb = Math.sin(ang) * o.b;
    return [cx + ox + ca * Math.cos(tilt) - sb * Math.sin(tilt), cy + oy + ca * Math.sin(tilt) + sb * Math.cos(tilt)];
  };
  const ring = (ctx, o, ox, oy, from, to, a) => {
    ctx.strokeStyle = rgba(pal.fx, a);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx + ox, cy + oy, o.a, o.b, tilt, from, to);
    ctx.stroke();
  };
  const sat = (ctx, o, ox, oy) => {
    for (let k = 10; k >= 0; k--) {
      const [x, y] = posOn(o, o.ang - Math.sign(o.v) * k * 0.025, ox, oy);
      ctx.fillStyle = rgba(o.c, k ? (1 - k / 11) * 0.35 : 1);
      ctx.beginPath();
      ctx.arc(x, y, k ? 1.4 : 2.4, 0, TAU);
      ctx.fill();
    }
    const [x, y] = posOn(o, o.ang, ox, oy);
    ctx.fillStyle = rgba(o.c, 0.2);
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, TAU);
    ctx.fill();
  };

  let shoot = null, nextShoot = rand(2, 5);

  return (ctx, now, dt, mouse) => {
    ctx.drawImage(far, 0, 0, w, h);

    for (const s of stars) {
      const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(now * s.f + s.ph));
      const x = s.x - mouse.sx * 24 * s.z, y = s.y - mouse.sy * 24 * s.z;
      ctx.fillStyle = rgba(pal.fx, a * 0.9);
      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, TAU);
      ctx.fill();
      if (s.flare) {
        ctx.strokeStyle = rgba(pal.fx, a * 0.35);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 9, y); ctx.lineTo(x + 9, y);
        ctx.moveTo(x, y - 9); ctx.lineTo(x, y + 9);
        ctx.stroke();
      }
    }

    nextShoot -= dt;
    if (!shoot && nextShoot <= 0) {
      const ang = rand(2.4, 2.75);
      shoot = { x: rand(w * 0.3, w), y: rand(0, h * 0.4), vx: Math.cos(ang) * 900, vy: Math.sin(ang) * 900, life: 1 };
    }
    if (shoot) {
      shoot.x += shoot.vx * dt;
      shoot.y += shoot.vy * dt;
      shoot.life -= dt * 1.4;
      const tx = shoot.x - shoot.vx * 0.14, ty = shoot.y - shoot.vy * 0.14;
      const gr = ctx.createLinearGradient(tx, ty, shoot.x, shoot.y);
      gr.addColorStop(0, rgba(pal.fx, 0));
      gr.addColorStop(1, rgba(pal.fx, Math.max(0, shoot.life) * 0.9));
      ctx.strokeStyle = gr;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(shoot.x, shoot.y);
      ctx.stroke();
      if (shoot.life <= 0) { shoot = null; nextShoot = rand(4, 9); }
    }

    const ox = -mouse.sx * 14, oy = -mouse.sy * 10;
    for (const o of orbits) o.ang += o.v * dt;
    // Profundidad: mitad trasera (anillos y lunas), planeta, mitad delantera
    for (const o of orbits) ring(ctx, o, ox, oy, Math.PI, TAU, 0.06);
    for (const o of orbits) if (Math.sin(o.ang) < 0) sat(ctx, o, ox, oy);
    ctx.globalAlpha = 0.75;
    ctx.drawImage(back, cx + ox - S, cy + oy - S, S * 2, S * 2);
    ctx.drawImage(front, cx + ox - S, cy + oy - S, S * 2, S * 2);
    ctx.globalAlpha = 1;
    for (const o of orbits) ring(ctx, o, ox, oy, 0, Math.PI, 0.12);
    for (const o of orbits) if (Math.sin(o.ang) >= 0) sat(ctx, o, ox, oy);
  };
}
