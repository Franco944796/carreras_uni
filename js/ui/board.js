// Dibuja columnas, nodos y conexiones. No contiene reglas de negocio.
const NS = "http://www.w3.org/2000/svg";
const defaultLabel = (s) => [`${s}.º semestre`, `${Math.ceil(s / 2)}.º año`];
const el = (tag, cls) => { const e = document.createElement(tag); e.className = cls; return e; };

export function createBoard(root, career, engine, { onSelect }) {
  root.innerHTML = "";
  const svg = document.createElementNS(NS, "svg");
  root.appendChild(svg);
  const nodes = new Map();

  [...new Set(career.subjects.map((s) => s.sem))].sort((a, b) => a - b).forEach((sem) => {
    const [title, sub] = career.labels?.[sem] || defaultLabel(sem);
    const col = el("div", "col");
    col.innerHTML = `<div class="ch">${title}<small>${sub}</small></div>`;
    career.subjects.filter((s) => s.sem === sem).forEach((s) => {
      const n = el("div", "node");
      n.innerHTML = `<b>${s.id}</b><span>${s.name}</span>` +
        (s.n ? `<div class="req">Requiere ${s.n} materias aprobadas</div>` : "") + `<div class="tag"></div>`;
      n.onclick = () => onSelect(s.id, n);
      n.onmouseenter = () => focus(s.id);
      n.onmouseleave = () => focus(null);
      nodes.set(s.id, n);
      col.appendChild(n);
    });
    root.appendChild(col);
  });

  const paths = engine.edges.map(() => svg.appendChild(document.createElementNS(NS, "path")));

  function render() {
    for (const [id, n] of nodes) {
      const st = engine.status(id);
      n.className = "node " + (st === 2 ? "ok" : st === 1 ? "reg" : engine.can(id, 1) ? "av" : "");
      n.querySelector(".tag").textContent = st === 1 ? (engine.can(id, 2) ? "Final habilitado" : "Final bloqueado") : "";
    }
    engine.edges.forEach(([from], i) => {
      const st = engine.status(from);
      paths[i].setAttribute("class", st === 2 ? "on" : st === 1 ? "reg" : "");
    });
  }

  function draw() {
    const o = root.getBoundingClientRect();
    svg.setAttribute("width", o.width);
    svg.setAttribute("height", o.height);
    engine.edges.forEach(([from, to], i) => {
      const a = nodes.get(from).getBoundingClientRect(), b = nodes.get(to).getBoundingClientRect();
      const x1 = a.right - o.left, y1 = a.top + a.height / 2 - o.top;
      const x2 = b.left - o.left, y2 = b.top + b.height / 2 - o.top, d = Math.max(30, (x2 - x1) / 2);
      paths[i].setAttribute("d", `M${x1},${y1} C${x1 + d},${y1} ${x2 - d},${y2} ${x2},${y2}`);
    });
  }

  function focus(id) {
    const rel = id ? engine.related(id) : null;
    for (const [sid, n] of nodes) n.classList.toggle("dim", !!rel && !rel.has(sid));
    engine.edges.forEach(([a, b], i) => {
      const inside = !!rel && rel.has(a) && rel.has(b);
      paths[i].classList.toggle("dim", !!rel && !inside);
      paths[i].classList.toggle("hi", inside);
    });
  }

  render(); draw();
  document.fonts?.ready.then(draw);
  return { render, draw };
}
