// Lógica pura (sin DOM): reglas de correlatividad y estados.
import { STATUS as S } from "./states.js";

export function createEngine(career, saved = {}) {
  const subs = career.subjects;
  const byId = new Map(subs.map((s) => [s.id, s]));
  const minCursar = career.rules?.cursar === "approved" ? S.APPROVED : S.REGULAR;
  const st = new Map();
  for (const [id, v] of Object.entries(saved)) if (byId.has(id) && (v === 1 || v === 2)) st.set(id, v);

  const status = (id) => st.get(id) || S.NONE;
  const approvedCount = () => subs.filter((s) => status(s.id) === S.APPROVED && !s.noCount).length;
  const missing = (s, level) => s.pre.filter((p) => status(p) < level);

  // ¿Se puede pasar la materia al estado v? (0 siempre se puede)
  const can = (id, v) => {
    if (v === S.NONE) return true;
    const s = byId.get(id);
    if (v === S.REGULAR && s.direct) return false;
    return missing(s, v === S.APPROVED ? S.APPROVED : minCursar).length === 0 && approvedCount() >= s.n;
  };

  const explain = (id, v) => {
    const s = byId.get(id), lvl = v === S.APPROVED ? S.APPROVED : minCursar, out = [];
    const m = missing(s, lvl);
    if (m.length) out.push((lvl === S.APPROVED ? "Aprobar: " : "Regularizar: ") + m.join(", "));
    if (approvedCount() < s.n) out.push(`${s.n} materias aprobadas (tenés ${approvedCount()})`);
    return out.join(" · ");
  };

  // Degrada en cascada lo que dejó de ser válido tras un cambio.
  function normalize() {
    let changed = true;
    while (changed) {
      changed = false;
      for (const [id, v] of [...st]) {
        if (v === S.APPROVED && !can(id, S.APPROVED)) { can(id, S.REGULAR) ? st.set(id, S.REGULAR) : st.delete(id); changed = true; }
        else if (v === S.REGULAR && !can(id, S.REGULAR)) { st.delete(id); changed = true; }
      }
    }
  }
  normalize();

  function set(id, v) {
    if (!can(id, v)) return { ok: false, reason: explain(id, v) };
    v ? st.set(id, v) : st.delete(id);
    normalize();
    return { ok: true };
  }

  // Ancestros + descendientes (para resaltar vínculos)
  function related(id) {
    const rel = new Set([id]);
    const up = [id];
    while (up.length) for (const p of byId.get(up.pop()).pre) if (!rel.has(p)) { rel.add(p); up.push(p); }
    const down = [id];
    while (down.length) { const x = down.pop(); for (const s of subs) if (s.pre.includes(x) && !rel.has(s.id)) { rel.add(s.id); down.push(s.id); } }
    return rel;
  }

  return {
    status, can, explain, set, related,
    levels: (id) => byId.get(id).direct ? [S.NONE, S.APPROVED] : [S.NONE, S.REGULAR, S.APPROVED],
    edges: subs.flatMap((s) => s.pre.map((p) => [p, s.id])),
    stats: () => ({
      total: subs.length,
      regular: subs.filter((s) => status(s.id) === S.REGULAR).length,
      approved: subs.filter((s) => status(s.id) === S.APPROVED).length,
      counted: approvedCount(),
    }),
    serialize: () => Object.fromEntries(st),
  };
}
