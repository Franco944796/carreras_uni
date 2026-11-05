// El mismo contador (Abacus) está en el portafolio y en Trilex (script.js de cada uno, sin módulos).
const ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" ' +
  'stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/>' +
  '<circle cx="12" cy="12" r="3"/></svg>';

export function showVisits(badge) {
  // Abrir el archivo en local o con un servidor de prueba solo lee el total, sin sumar.
  const published = /^https?:$/.test(location.protocol) && !/^(localhost|127\.|\[::1\])/.test(location.hostname);
  const url = `https://abacus.jasoncameron.dev/${published ? "hit" : "get"}/franco944796-correlativas/inicio`;

  fetch(url)
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then(({ value }) => {
      if (typeof value !== "number") return;
      badge.innerHTML = ICON;
      badge.append(`${value.toLocaleString("es")} ${value === 1 ? "visita" : "visitas"}`);
      badge.hidden = false;
    })
    .catch(() => {});
}
