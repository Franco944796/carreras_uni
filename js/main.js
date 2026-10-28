import { CAREERS } from "./data/index.js";
import { createEngine } from "./core/engine.js";
import { load, save, clear } from "./core/storage.js";
import { createBoard } from "./ui/board.js";
import { openMenu } from "./ui/menu.js";
import { suggestDesktop } from "./ui/gate.js";

const $ = (id) => document.getElementById(id);
let career = CAREERS.find((c) => c.id === new URLSearchParams(location.search).get("c")) || CAREERS[0];
let engine, board, bg;

// Solo escritorio con mouse y sin "reducir movimiento"; en el resto queda el gradiente CSS.
const fancy = matchMedia("(min-width: 900px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
async function syncBackground() {
  if (!fancy.matches) { bg?.then((b) => b.stop()); bg = null; return; }
  bg ??= import("./ui/background.js").then((m) => m.createBackground());
  (await bg).set(career.bg);
}
fancy.addEventListener("change", syncBackground);

const list = (ul, items) => { ul.innerHTML = items.map((t) => `<li>${t}</li>`).join(""); };

function howItems() {
  const cursar = career.rules?.cursar === "approved"
    ? "Para <b>cursar</b> se exigen las correlativas aprobadas."
    : "Para <b>cursar</b> alcanza con tener las correlativas regulares.";
  return [
    "Tocá una materia para elegir su estado.",
    cursar,
    "Para <b>aprobar</b> (rendir el final) se exigen las correlativas aprobadas.",
    "Los requisitos “Tener N materias aprobadas” cuentan solo las aprobadas.",
    "Pasá el mouse sobre una materia para ver sus vínculos.",
  ];
}

// Ajusta el ancho del selector al texto elegido
function fitSelect() {
  const sel = $("career"), ctx = document.createElement("canvas").getContext("2d");
  ctx.font = getComputedStyle(sel).font;
  sel.style.width = Math.ceil(ctx.measureText(sel.selectedOptions[0].textContent).width) + 48 + "px";
}

function refresh() {
  board.render();
  const s = engine.stats();
  $("pa").style.width = (s.approved / s.total) * 100 + "%";
  $("pr").style.width = (s.regular / s.total) * 100 + "%";
  $("pt").textContent = `${s.approved} aprobadas · ${s.regular} regulares · de ${s.total}`;
}

function mount() {
  engine = createEngine(career, load(career));
  document.title = `Correlativas – ${career.name}`;
  document.documentElement.dataset.bg = career.bg || "circuit";
  $("icon").textContent = career.icon;
  $("plan").textContent = career.plan || "";
  $("career").value = career.id;
  fitSelect();
  list($("how"), howItems());
  const notes = [].concat(career.notes || []);
  $("notes-box").hidden = !notes.length;
  list($("notes"), notes);
  board = createBoard($("map"), career, engine, {
    onSelect: (id, node) => openMenu(node, id, engine, (v) => {
      engine.set(id, v);
      save(career, engine.serialize());
      refresh();
    }),
  });
  refresh();
  syncBackground();
}

const sel = $("career");
sel.innerHTML = CAREERS.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
$("pick").classList.toggle("single", CAREERS.length < 2);
sel.disabled = CAREERS.length < 2;
sel.onchange = () => {
  career = CAREERS.find((c) => c.id === sel.value);
  history.replaceState(null, "", `?c=${career.id}`);
  mount();
};
$("rs").onclick = () => { if (confirm("¿Borrar todo el progreso de esta carrera?")) { clear(career); mount(); } };
// El panel de información se cierra al tocar afuera o con Escape
const info = document.querySelector(".info");
addEventListener("pointerdown", (e) => { if (info.open && !info.contains(e.target)) info.open = false; });
addEventListener("keydown", (e) => { if (e.key === "Escape") info.open = false; });
addEventListener("resize", () => board?.draw());
mount();
suggestDesktop();
