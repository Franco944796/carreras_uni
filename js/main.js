import { CAREERS } from "./data/index.js";
import { createEngine } from "./core/engine.js";
import { load, save, clear } from "./core/storage.js";
import { createBoard } from "./ui/board.js";
import { openMenu } from "./ui/menu.js";

const $ = (id) => document.getElementById(id);
let career = CAREERS.find((c) => c.id === new URLSearchParams(location.search).get("c")) || CAREERS[0];
let engine, board;

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
  $("title").textContent = `${career.icon} ${career.name} · ${career.plan}`;
  $("note").textContent = career.note || "";
  board = createBoard($("map"), career, engine, {
    onSelect: (id, node) => openMenu(node, id, engine, (v) => {
      engine.set(id, v);
      save(career, engine.serialize());
      refresh();
    }),
  });
  refresh();
}

const sel = $("career");
if (CAREERS.length > 1) {
  sel.hidden = false;
  sel.innerHTML = CAREERS.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
  sel.value = career.id;
  sel.onchange = () => {
    career = CAREERS.find((c) => c.id === sel.value);
    history.replaceState(null, "", `?c=${career.id}`);
    mount();
  };
}
$("rs").onclick = () => { if (confirm("¿Borrar todo el progreso de esta carrera?")) { clear(career); mount(); } };
addEventListener("resize", () => board?.draw());
mount();