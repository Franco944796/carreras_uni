const KEY = "correlativas:mobile-ok";

const accepted = () => { try { return localStorage.getItem(KEY) === "1"; } catch (e) { return false; } };
const accept = () => { try { localStorage.setItem(KEY, "1"); } catch (e) {} };

// Solo se evalúa al cargar: girar el celular a horizontal no debe volver a mostrar el cartel.
export function suggestDesktop() {
  if (!matchMedia("(max-width: 899px)").matches || accepted()) return;

  const share = !!navigator.share;
  const gate = document.createElement("div");
  gate.className = "gate";
  gate.setAttribute("role", "dialog");
  gate.setAttribute("aria-modal", "true");
  gate.setAttribute("aria-labelledby", "gate-t");
  gate.innerHTML = `
    <div class="gate-card">
      <div class="gate-ic" aria-hidden="true">🖥️</div>
      <h2 id="gate-t">Se ve mejor en una computadora</h2>
      <p>El plan tiene muchas columnas y vínculos entre materias. En una pantalla grande lo ves completo y con el fondo animado; en el celular vas a tener que desplazarte de costado.</p>
      <button class="gate-link">${share ? "Enviar enlace" : "Copiar enlace"}</button>
      <button class="gate-go">Continuar igualmente</button>
    </div>`;
  document.body.appendChild(gate);
  document.documentElement.classList.add("gated");

  const link = gate.querySelector(".gate-link");
  link.onclick = async () => {
    try {
      if (share) await navigator.share({ title: document.title, url: location.href });
      else { await navigator.clipboard.writeText(location.href); link.textContent = "Enlace copiado ✓"; }
    } catch (e) {}
  };
  const go = gate.querySelector(".gate-go");
  go.onclick = () => {
    accept();
    gate.remove();
    document.documentElement.classList.remove("gated");
  };
  go.focus();
}
