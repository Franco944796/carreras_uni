const key = (c) => `correlativas:${c.id}`;

export function load(c) {
  try {
    const raw = localStorage.getItem(key(c)) || (c.legacyKey && localStorage.getItem(c.legacyKey));
    if (!raw) return {};
    const d = JSON.parse(raw);
    // Formato viejo: array de ids aprobados -> { id: 2 }
    return Array.isArray(d) ? Object.fromEntries(d.map((id) => [id, 2])) : d;
  } catch (e) { return {}; }
}
export function save(c, obj) { try { localStorage.setItem(key(c), JSON.stringify(obj)); } catch (e) {} }
export function clear(c) { try { localStorage.removeItem(key(c)); localStorage.removeItem(c.legacyKey || ""); } catch (e) {} }
