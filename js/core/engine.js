// Lógica pura (sin DOM): reglas de correlatividad y estados.
import { STATUS as S } from "./states.js";

// Promocionada vale como regular para cursar, pero no como aprobada (STATUS no está ordenado).
// Cursando no habilita nada: para las correlativas cuenta como pendiente.
const RANK = { [S.NONE]: 0, [S.CURSANDO]: 0, [S.REGULAR]: 1, [S.PROMOTED]: 1.5, [S.APPROVED]: 2 };

export function createEngine(career, saved = {}) {
  const subs = career.subjects;
  const byId = new Map(subs.map((s) => [s.id, s]));
  const minCursar = career.rules?.cursar === "approved" ? S.APPROVED : S.REGULAR;
  const promo = !!career.rules?.promo;
  const st = new Map();
  for (const [id, v] of Object.entries(saved))
    if (byId.has(id) && v in RANK && v !== S.NONE && (promo || v !== S.PROMOTED)) st.set(id, v);

  const status = (id) => st.get(id) || S.NONE;
  const approvedCount = () => subs.filter((s) => status(s.id) === S.APPROVED && !s.noCount).length;
  const missing = (s, level) => s.pre.filter((p) => RANK[status(p)] < RANK[level]);
  const promotable = (s) => promo && !s.direct && s.pre.length > 0;

  // ¿Se puede pasar la materia al estado v? (0 siempre se puede)
  const can = (id, v) => {
    if (v === S.NONE) return true;
    const s = byId.get(id);
    if (v === S.REGULAR && s.direct) return false;
    // Con todas las correlativas aprobadas, promocionar ya es aprobar.
    if (v === S.PROMOTED && (!promotable(s) || !missing(s, S.APPROVED).length)) return false;
    return missing(s, v === S.APPROVED ? S.APPROVED : minCursar).length === 0 && approvedCount() >= s.n;
  };

  const explain = (id, v) => {
    const s = byId.get(id), lvl = v === S.APPROVED ? S.APPROVED : minCursar, out = [];
    const m = missing(s, lvl);
    if (m.length) out.push((lvl === S.APPROVED ? "Aprobar: " : "Regularizar: ") + m.join(", "));
    if (approvedCount() < s.n) out.push(`${s.n} materias aprobadas (tenés ${approvedCount()})`);
    return out.join(" · ");
  };

  // Degrada (o asciende) en cascada lo que dejó de ser válido tras un cambio.
  // Aprobada sin las correlativas aprobadas solo pudo ser por promoción; promocionada con ellas aprobadas pasa a aprobada.
  const FALLBACK = { [S.APPROVED]: [S.PROMOTED, S.REGULAR], [S.PROMOTED]: [S.APPROVED, S.REGULAR], [S.REGULAR]: [], [S.CURSANDO]: [] };
  function normalize() {
    let changed = true;
    while (changed) {
      changed = false;
      for (const [id, v] of [...st]) {
        if (can(id, v)) continue;
        st.delete(id);
        const to = FALLBACK[v].find((x) => can(id, x));
        if (to) st.set(id, to);
        changed = true;
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

  function levels(id) {
    const s = byId.get(id);
    if (s.direct) return [S.NONE, S.CURSANDO, S.APPROVED];
    const withPromo = status(id) === S.PROMOTED || (promotable(s) && missing(s, S.APPROVED).length > 0);
    return withPromo ? [S.NONE, S.CURSANDO, S.REGULAR, S.PROMOTED, S.APPROVED] : [S.NONE, S.CURSANDO, S.REGULAR, S.APPROVED];
  }

  const count = (v) => subs.filter((s) => status(s.id) === v).length;

  return {
    status, can, explain, set, related, levels, promo,
    pendingFinals: (id) => missing(byId.get(id), S.APPROVED),
    edges: subs.flatMap((s) => s.pre.map((p) => [p, s.id])),
    stats: () => ({
      total: subs.length,
      regular: count(S.REGULAR),
      promoted: count(S.PROMOTED),
      cursando: count(S.CURSANDO),
      approved: count(S.APPROVED),
      counted: approvedCount(),
    }),
    serialize: () => Object.fromEntries(st),
  };
}
