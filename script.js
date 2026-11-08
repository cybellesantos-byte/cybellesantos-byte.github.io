/* =====================================================
   PORTFÓLIO · CYBELLE MARTINS
   Interações em JavaScript puro
   ===================================================== */

const $ = (seletor, raiz = document) => raiz.querySelector(seletor);
const $$ = (seletor, raiz = document) => [...raiz.querySelectorAll(seletor)];

const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Armazenamento seguro (pode falhar em modo privado) ----------
const guardar = (chave, valor) => { try { localStorage.setItem(chave, valor); } catch (_) {} };
const ler = (chave) => { try { return localStorage.getItem(chave); } catch (_) { return null; } };

// ========== 1. TEMA CLARO / ESCURO ==========
const btnTema = $("#btn-tema");

function aplicarTema(tema) {
  document.documentElement.setAttribute("data-tema", tema);
  btnTema.textContent = tema === "escuro" ? "☀" : "☾";
  guardar("tema", tema);
}

const temaSalvo = ler("tema");
// O visual principal é o escuro; o visitante pode trocar e a escolha fica salva.
aplicarTema(temaSalvo || "escuro");

btnTema.addEventListener("click", () => {
  const atual = document.documentElement.getAttribute("data-tema");
  aplicarTema(atual === "escuro" ? "claro" : "escuro");
});

// ========== 2. MENU MOBILE ==========
const btnMenu = $("#btn-menu");
const menu = $("#menu");

function fecharMenu() {
  menu.classList.remove("aberto");
  btnMenu.setAttribute("aria-expanded", "false");
}

btnMenu.addEventListener("click", () => {
  const aberto = menu.classList.toggle("aberto");
  btnMenu.setAttribute("aria-expanded", String(aberto));
});
$$("a", menu).forEach((link) => link.addEventListener("click", fecharMenu));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") fecharMenu(); });

// ========== 3. BARRA DE PROGRESSO + LUZ DO CURSOR ==========
const barra = $("#progresso");
function atualizarProgresso() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  barra.style.width = total > 0 ? `${(window.scrollY / total) * 100}%` : "0";
}
window.addEventListener("scroll", atualizarProgresso, { passive: true });
atualizarProgresso();

const luz = $("#luz");
if (!reduzirMovimento && window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("pointermove", (e) => {
    luz.style.setProperty("--mx", `${e.clientX}px`);
    luz.style.setProperty("--my", `${e.clientY}px`);
  }, { passive: true });
}

// ========== 4. LINK ATIVO NO MENU ==========
const linksMenu = $$(".menu a[href^='#']:not(.menu-cta)");
const secoes = linksMenu.map((l) => $(l.getAttribute("href"))).filter(Boolean);

const observadorMenu = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      linksMenu.forEach((l) => l.classList.toggle("ativo", l.getAttribute("href") === `#${entrada.target.id}`));
    }
  });
}, { rootMargin: "-45% 0px -50% 0px" });
secoes.forEach((s) => observadorMenu.observe(s));

// ========== 5. ANIMAÇÃO AO ROLAR ==========
const observadorReveal = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      entrada.target.classList.add("visivel");
      observadorReveal.unobserve(entrada.target);
    }
  });
}, { threshold: 0.08 });
$$(".reveal").forEach((el) => observadorReveal.observe(el));

// ========== 7. CONTADORES ANIMADOS ==========
const contadores = $$("[data-count]");
const observadorNumeros = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (!entrada.isIntersecting) return;
    const el = entrada.target;
    const fim = Number(el.dataset.count);
    const sufixo = el.dataset.sufixo || "";
    observadorNumeros.unobserve(el);

    if (reduzirMovimento) { el.textContent = fim + sufixo; return; }

    const duracao = 1400;
    const inicio = performance.now();
    (function passo(agora) {
      const t = Math.min((agora - inicio) / duracao, 1);
      const suave = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(fim * suave) + sufixo;
      if (t < 1) requestAnimationFrame(passo);
    })(inicio);
  });
}, { threshold: 0.6 });
contadores.forEach((c) => observadorNumeros.observe(c));

// ========== 8. ABAS DE TECNOLOGIAS ==========
const abas = $$(".aba");
const paineis = $$(".painel");

abas.forEach((aba) => {
  aba.addEventListener("click", () => {
    abas.forEach((a) => { a.classList.remove("ativa"); a.setAttribute("aria-selected", "false"); });
    paineis.forEach((p) => p.classList.remove("ativo"));
    aba.classList.add("ativa");
    aba.setAttribute("aria-selected", "true");
    $(`.painel[data-painel="${aba.dataset.aba}"]`).classList.add("ativo");
  });
});

// ========== 9. INCLINAÇÃO 3D NOS CARDS DE PROJETO ==========
if (!reduzirMovimento && window.matchMedia("(pointer: fine)").matches) {
  $$("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(1100px) rotateY(${x * 3}deg) rotateX(${-y * 3}deg) translateY(-4px)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });
}

// ========== 10. COPIAR E-MAIL ==========
const toast = $("#toast");
let temporizador;
function avisar(texto) {
  toast.textContent = texto;
  toast.classList.add("mostrar");
  clearTimeout(temporizador);
  temporizador = setTimeout(() => toast.classList.remove("mostrar"), 2200);
}

$("#copiar-email").addEventListener("click", async (e) => {
  const email = e.currentTarget.dataset.email;
  try {
    await navigator.clipboard.writeText(email);
    avisar("E-mail copiado!");
  } catch (_) {
    avisar(email);
  }
});

// ========== 11. ANO NO RODAPÉ ==========
$("#ano").textContent = new Date().getFullYear();
