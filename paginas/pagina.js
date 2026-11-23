// La navegación de regreso marca la flor visitada en el jardín.
const params = new URLSearchParams(location.search);
const flowerId = Number(document.body.dataset.flower || params.get("flor") || 1);
const pageData = window.PAGE_CONTENT?.[flowerId] || {
  title: `Un detalle para ti · ${flowerId}`,
  text: "Aquí puedes escribir el contenido de esta página.",
  audio: `../musica/cancion-${flowerId}.mp3`
};
document.getElementById("pageTitle").textContent = pageData.title;
document.getElementById("pageMessage").textContent = pageData.text;

/* ===== Audio de solo reproducción =====
   Sin controles visibles y bloqueado frente a pausa, avance, retroceso, velocidad y
   teclas multimedia del teclado, auriculares, pantalla de bloqueo o notificaciones. */
const audio = document.getElementById("pageAudio");
const startButton = document.getElementById("startAudio");
let leaving = false;
let lastTime = 0;

audio.controls = false;
audio.loop = false;
audio.src = pageData.audio;

function tryPlay() {
  if (leaving || audio.ended) return;
  const promise = audio.play();
  if (promise && promise.catch) promise.catch(err => {
    // Si el navegador bloquea el inicio automático, se ofrece un botón para iniciar (no para pausar).
    if (err && err.name === "NotAllowedError") startButton.hidden = false;
  });
}

// Pausa: se reanuda de inmediato (salvo al terminar la canción o al salir de la página).
audio.addEventListener("pause", () => {
  if (leaving || audio.ended) return;
  if (document.hidden) return; // el navegador la reanuda al volver a la pestaña
  tryPlay();
});
document.addEventListener("visibilitychange", () => { if (!document.hidden) tryPlay(); });

// Avance / retroceso: la posición se restablece al último punto de reproducción normal.
audio.addEventListener("timeupdate", () => {
  if (!audio.seeking && Math.abs(audio.currentTime - lastTime) < 1.5) lastTime = audio.currentTime;
});
audio.addEventListener("seeking", () => {
  if (Math.abs(audio.currentTime - lastTime) > 0.75) audio.currentTime = lastTime;
});

// Velocidad: siempre normal.
audio.addEventListener("ratechange", () => {
  if (audio.playbackRate !== 1) audio.playbackRate = 1;
  if (audio.defaultPlaybackRate !== 1) audio.defaultPlaybackRate = 1;
});

audio.addEventListener("playing", () => { startButton.hidden = true; });
startButton.addEventListener("click", tryPlay);

// Teclas multimedia, auriculares y controles del sistema: se neutralizan.
if ("mediaSession" in navigator) {
  ["play", "pause", "stop", "seekbackward", "seekforward", "seekto", "previoustrack", "nexttrack"].forEach(action => {
    try { navigator.mediaSession.setActionHandler(action, () => { if (action === "play" || action === "pause") tryPlay(); }); }
    catch (e) { /* acción no soportada por este navegador */ }
  });
}
// Teclas de pausa / adelantar del teclado.
document.addEventListener("keydown", e => {
  if (["MediaPlayPause", "MediaPause", "MediaStop", "MediaTrackNext", "MediaTrackPrevious"].includes(e.key)) e.preventDefault();
}, true);

tryPlay();

document.getElementById("backButton").addEventListener("click", () => {
  leaving = true;
  audio.pause(); audio.currentTime = 0;
  location.href = `../index.html?return=${flowerId}`;
});
