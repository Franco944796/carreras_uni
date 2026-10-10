import { STATUS_LABEL } from "../core/states.js";

let menu = null, cleanup = () => {};
export function closeMenu() { menu?.remove(); menu = null; cleanup(); }

export function openMenu(anchor, id, engine, onPick) {
  closeMenu();
  const cur = engine.status(id);
  menu = document.createElement("div");
  menu.className = "menu";
  for (const v of [0, 1, 2]) {
    const ok = engine.can(id, v), b = document.createElement("button");
    b.disabled = !ok && v !== cur;
    if (v === cur) b.className = "cur";
    b.innerHTML = `<i class="dot s${v}"></i><span>${STATUS_LABEL[v]}${v === cur ? " ✓" : ""}</span>` +
      (b.disabled ? `<small>Falta → ${engine.explain(id, v)}</small>` : "");
    b.onclick = () => { closeMenu(); onPick(v); };
    menu.appendChild(b);
  }
  document.body.appendChild(menu);

  const r = anchor.getBoundingClientRect(), w = menu.offsetWidth, h = menu.offsetHeight;
  menu.style.left = Math.max(8, Math.min(r.left, innerWidth - w - 8)) + "px";
  menu.style.top = (r.bottom + 6 + h > innerHeight ? Math.max(8, r.top - h - 6) : r.bottom + 6) + "px";

  const away = (e) => { if (menu && !menu.contains(e.target)) closeMenu(); };
  const esc = (e) => e.key === "Escape" && closeMenu();
  addEventListener("pointerdown", away, true);
  addEventListener("keydown", esc);
  addEventListener("scroll", closeMenu, true);
  cleanup = () => {
    removeEventListener("pointerdown", away, true);
    removeEventListener("keydown", esc);
    removeEventListener("scroll", closeMenu, true);
  };
}