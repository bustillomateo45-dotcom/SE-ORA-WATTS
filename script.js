/* Configuración sencilla: personaliza estos textos y rutas de audio. */
const GARDEN_CONFIG = {
  message: "Elija una flor y presiónela para descubrir su contenido. Le invito a prestar atención a la canción que acompaña a cada una, pues tanto las melodías como los mensajes han sido seleccionados cuidadosamente para transmitir, en conjunto, un mismo sentimiento.",
  mainAudio: "musica/cancion-principal.mp3",
  pages: [
    { title: "Un detalle para ti · 1", text: "Aquí irá el contenido especial de la primera flor.", audio: "musica/cancion-1.mp3" },
    { title: "Un detalle para ti · 2", text: "Aquí irá el contenido especial de la segunda flor.", audio: "musica/cancion-2.mp3" },
    { title: "Un detalle para ti · 3", text: "Aquí irá el contenido especial de la tercera flor.", audio: "musica/cancion-3.mp3" },
    { title: "Un detalle para ti · 4", text: "Aquí irá el contenido especial de la cuarta flor.", audio: "musica/cancion-4.mp3" },
    { title: "Un detalle para ti · 5", text: "Aquí irá el contenido especial de la quinta flor.", audio: "musica/cancion-5.mp3" }
  ]
};
const STORAGE_KEY = "jardinFloresEstadoV1";
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let mainAudio = null;
let activeFlower = null;
let busy = false;

function setFlowerDisabled(flower, disabled) {
  flower.setAttribute("aria-disabled", disabled ? "true" : "false");
  flower.tabIndex = disabled ? -1 : 0;
}
function isFlowerDisabled(flower) { return flower.getAttribute("aria-disabled") === "true"; }
function readState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { visited: [], cycle: 0, started: false, textShown: false }; }
  catch { return { visited: [], cycle: 0, started: false, textShown: false }; }
}
function saveState(state) { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function stopAudio() {
  document.querySelectorAll("audio").forEach(a => { a.pause(); a.currentTime = 0; });
}
function playAudio(audio, src) {
  if (!audio) return;
  stopAudio();
  audio.src = src;
  audio.loop = false;
  const promise = audio.play();
  if (promise && promise.catch) promise.catch(() => {
    // El navegador puede exigir una interacción adicional; el resto de la experiencia continúa.
    console.info("La reproducción automática fue bloqueada por el navegador.");
  });
}
function showFlowers() {
  if (busy) return;
  busy = true;
  const welcome = document.getElementById("welcomeScreen");
  const screen = document.getElementById("flowersScreen");
  const button = document.querySelector(".minimal-btn");
  // Microinteracción original del botón.
  if (button) { button.style.transform = "scale(0.95)"; button.style.opacity = "0.7"; button.disabled = true; }
  // La música principal se inicia dentro del gesto del usuario (reglas de los navegadores).
  sessionStorage.removeItem("gardenMusicTime");
  mainAudio = document.getElementById("mainAudio");
  playAudio(mainAudio, GARDEN_CONFIG.mainAudio);
  // Cada vez que se abre la portada se inicia una presentación nueva; las flores ya
  // visitadas se conservan marchitas, salvo que el ciclo anterior estuviera completo.
  const state = readState();
  state.started = true;
  state.textShown = false;
  if (state.visited.length >= 5) { state.visited = []; state.cycle += 1; }
  saveState(state);
  setTimeout(() => {
    // Desvanecimiento de la portada (igual que el original).
    welcome.classList.add("fade-out");
    setTimeout(() => {
      welcome.style.display = "none";
      screen.style.display = "block";
      setTimeout(() => {
        screen.classList.add("show");
        document.body.classList.remove("not-loaded");
        startInitialGrowth();
        busy = false;
      }, 100);
    }, 800);
  }, 200);
}
function startInitialGrowth() {
  const flowers = [...document.querySelectorAll(".flower")];
  flowers.forEach((flower, index) => {
    const visited = readState().visited.includes(index + 1);
    flower.classList.remove("is-grown");
    flower.classList.toggle("is-withered", visited);
    setFlowerDisabled(flower, true);
    flower.style.setProperty("--flower-delay", `${index * 0.55}s`);
  });
  // Las animaciones CSS originales siguen siendo las responsables del arte;
  // se prolonga el tiempo de crecimiento para que la presentación sea pausada.
  setTimeout(() => {
    const message = document.getElementById("gardenMessage");
    message.textContent = GARDEN_CONFIG.message;
    message.classList.add("visible");
    const state = readState();
    state.textShown = true;
    saveState(state);
    setTimeout(() => enableAvailableFlowers(), 2200);
  }, 10500);
}
function enableAvailableFlowers() {
  const state = readState();
  document.querySelectorAll(".flower").forEach(flower => {
    const id = Number(flower.dataset.flower);
    const visited = state.visited.includes(id);
    setFlowerDisabled(flower, !state.textShown || visited);
    flower.classList.toggle("is-withered", visited);
    flower.classList.toggle("is-grown", !visited);
  });
}
function restoreGarden() {
  const state = readState();
  const message = document.getElementById("gardenMessage");
  message.textContent = GARDEN_CONFIG.message;
  if (state.textShown) message.classList.add("visible");
  enableAvailableFlowers();
  if (state.visited.length === 5) startNewCycle();
}
function resumeGardenMusic() {
  const saved = sessionStorage.getItem("gardenMusicTime");
  if (saved === null || saved === "end") return;
  const audio = document.getElementById("mainAudio");
  if (!audio) return;
  audio.loop = false;
  audio.src = GARDEN_CONFIG.mainAudio;
  const start = () => {
    audio.currentTime = Number(saved) || 0;
    const promise = audio.play();
    if (promise && promise.catch) promise.catch(() => {
      // Si el navegador exige un gesto, la música se retoma con el primer toque o tecla.
      const resume = () => {
        ["pointerdown", "keydown", "touchstart"].forEach(t => document.removeEventListener(t, resume, true));
        audio.play().catch(() => {});
      };
      ["pointerdown", "keydown", "touchstart"].forEach(t => document.addEventListener(t, resume, true));
    });
  };
  if (audio.readyState >= 1) start(); else audio.addEventListener("loadedmetadata", start, { once: true });
  audio.load();
}
function openFlower(id) {
  const state = readState();
  if (busy || !state.textShown || state.visited.includes(id)) return;
  activeFlower = id;
  sessionStorage.setItem("activeFlower", String(id));
  // Se recuerda en qué punto iba la música del jardín para retomarla al volver.
  const music = document.getElementById("mainAudio");
  if (music && music.currentTime > 0 && !music.ended) sessionStorage.setItem("gardenMusicTime", String(music.currentTime));
  else sessionStorage.setItem("gardenMusicTime", "end");
  stopAudio();
  window.location.href = `paginas/flor-${id}.html`;
}
async function returnToGarden() {
  const id = Number(sessionStorage.getItem("activeFlower"));
  stopAudio();
  window.location.href = `index.html?return=${Number.isInteger(id) ? id : ""}`;
}
function startNewCycle() {
  const flowers = [...document.querySelectorAll(".flower")];
  flowers.forEach(f => { setFlowerDisabled(f, true); f.classList.remove("is-grown"); f.classList.add("is-regrowing"); f.classList.remove("is-withered"); });
  setTimeout(() => {
    const state = readState();
    state.visited = [];
    state.cycle += 1;
    saveState(state);
    flowers.forEach(f => f.classList.remove("is-regrowing"));
    enableAvailableFlowers();
  }, 6500);
}
function handleReturn() {
  const params = new URLSearchParams(location.search);
  const id = Number(params.get("return"));
  if (!id || id < 1 || id > 5) return;
  const state = readState();
  if (!state.visited.includes(id)) state.visited.push(id);
  saveState(state);
  const flower = document.querySelector(`.flower[data-flower="${id}"]`);
  if (flower) {
    setFlowerDisabled(flower, true);
    flower.classList.add("is-withered");
    flower.classList.remove("is-grown");
  }
  history.replaceState({}, "", "index.html");
  if (state.visited.length === 5) setTimeout(startNewCycle, 4200);
}
document.addEventListener("DOMContentLoaded", () => {
  mainAudio = document.getElementById("mainAudio");
  document.querySelectorAll(".flower").forEach(f => {
    f.addEventListener("click", () => { if (!isFlowerDisabled(f)) openFlower(Number(f.dataset.flower)); });
    f.addEventListener("keydown", e => {
      if ((e.key === "Enter" || e.key === " ") && !isFlowerDisabled(f)) { e.preventDefault(); openFlower(Number(f.dataset.flower)); }
    });
  });
  const state = readState();
  if (new URLSearchParams(location.search).has("return")) {
    document.getElementById("welcomeScreen").style.display = "none";
    const screen = document.getElementById("flowersScreen");
    screen.style.display = "block"; screen.classList.add("show");
    document.body.classList.remove("not-loaded");
    document.getElementById("gardenMessage").textContent = GARDEN_CONFIG.message;
    if (state.textShown) document.getElementById("gardenMessage").classList.add("visible");
    handleReturn();
    enableAvailableFlowers();
    resumeGardenMusic();
  }
  // Las animaciones de bienvenida deben ejecutarse; las flores están ocultas hasta que se pulse el botón.
  setTimeout(() => document.body.classList.remove("not-loaded"), 900);
});
