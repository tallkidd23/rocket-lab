const cartridges = [
  { id: "patterns", title: "PATTERNS", category: "MATH / FORM", color: "#d38b38", lines: ["SEED TABLE ........ OK", "FIELD ARRAY ........ READY", "ITERATION CORE ..... READY"], modes: ["REACTION FIELD", "LOG SPIRAL", "MANDELBROT"] },
  { id: "gravity", title: "GRAVITY FORGE", category: "ASTROPHYSICS", color: "#d38b38", lines: ["MASS TABLE ......... OK", "ORBIT SOLVER ....... READY", "FIELD ENGINE ....... READY"], modes: ["ORBIT MAP", "STAR STREAM", "FIELD VIEW"] },
  { id: "reef", title: "SYNAPSE REEF", category: "EMERGENT LIFE", color: "#8fb58d", lines: ["HABITAT MEMORY ..... OK", "ORGANISM REGISTRY .. READY", "NUTRIENT CYCLE ..... READY"], modes: ["HABITAT", "SPECIES", "HISTORY"] }
];

const state = { selected: 0, active: null, running: false, mode: 0, bootTimer: null, animation: null, frame: 0 };
const $ = (selector) => document.querySelector(selector);
const bootLayer = $("#bootLayer");
const programLayer = $("#programLayer");
const screen = $("#screen");
const status = $("#screenStatus");
const readout = $("#cartridgeReadout");
const powerLight = $("#powerLight");

function card() { return cartridges[state.selected]; }
function setStatus(text) { if (status) status.textContent = text; }
function setSelected(index) {
  state.selected = (index + cartridges.length) % cartridges.length;
  document.querySelectorAll(".cartridge-card").forEach((element, i) => element.classList.toggle("is-selected", i === state.selected));
  const next = card();
  if (readout) readout.textContent = `CARTRIDGE: ${next.title}`;
  if (powerLight) powerLight.style.color = next.color;
  if (!state.active) renderBayPreview();
}
function renderBayPreview() {
  const next = card();
  bootLayer.hidden = false;
  programLayer.hidden = true;
  bootLayer.innerHTML = `<div class="screen-title">LABROCKET COMPUTER</div><div class="screen-rule"></div><div class="screen-message">CARTRIDGE SELECTED</div><div class="screen-message">${next.title}</div><div class="screen-message">${next.category}</div><div class="screen-status">PRESS ENTER / START</div>`;
  setStatus(`READY / ${next.title}`);
}
function stopAnimation() { if (state.animation) cancelAnimationFrame(state.animation); state.animation = null; }
function eject() {
  clearTimeout(state.bootTimer); stopAnimation(); state.active = null; state.running = false;
  bootLayer.hidden = false; programLayer.hidden = true; setSelected(state.selected); renderBayPreview(); setStatus("CARTRIDGE EJECTED");
}
function boot() {
  const next = card();
  clearTimeout(state.bootTimer); stopAnimation(); state.active = next; state.running = false; state.mode = 0; state.frame = 0;
  bootLayer.hidden = false; programLayer.hidden = true;
  const lines = ["LABROCKET COMPUTER", "MODEL LR-1983", "", "MEMORY CHECK ........ OK", "CARTRIDGE BUS ....... OK", "PHOSPHOR DISPLAY .... READY", "", `LOADING ${next.title}`, ...next.lines];
  bootLayer.innerHTML = "";
  let line = 0;
  const tick = () => {
    if (line < lines.length) { const div = document.createElement("div"); div.textContent = lines[line++]; bootLayer.appendChild(div); state.bootTimer = setTimeout(tick, 90 + Math.random() * 160); return; }
    state.bootTimer = setTimeout(() => { programLayer.hidden = false; bootLayer.hidden = true; renderProgram(); setStatus("READY / PRESS RUN"); }, 420);
  };
  tick();
}
function renderProgram() {
  if (!state.active) return;
  const next = state.active;
  programLayer.innerHTML = `<div class="screen-title">${next.title}</div><div class="screen-rule"></div><div class="program-art" aria-hidden="true"></div><div class="program-readout">MODE: ${next.modes[state.mode]}<br>FRAME: ${String(state.frame).padStart(5, "0")}<br>STATE: ${state.running ? "RUNNING" : "PAUSED"}</div>`;
  programLayer.style.setProperty("--cartridge-accent", next.color);
}
function animate() {
  if (!state.running || !state.active) return;
  state.frame += 1; renderProgram(); state.animation = requestAnimationFrame(animate);
}
function command(command) {
  if (["NEXT", "PREV"].includes(command) && !state.active) return setSelected(state.selected + (command === "NEXT" ? 1 : -1));
  if (command === "ENTER" || command === "RUN") { if (!state.active) return boot(); state.running = true; setStatus("RUNNING"); animate(); return; }
  if (command === "STOP") { state.running = false; stopAnimation(); renderProgram(); setStatus("PAUSED"); return; }
  if (command === "CLEAR") { state.frame = 0; state.running = false; stopAnimation(); renderProgram(); setStatus("CLEARED"); return; }
  if (command === "MODE") { if (!state.active) return; state.mode = (state.mode + 1) % state.active.modes.length; renderProgram(); setStatus(`MODE / ${state.active.modes[state.mode]}`); return; }
  if (command === "EJECT") return eject();
  if (command === "ZOOM_IN" || command === "ZOOM_OUT") { if (state.active) setStatus(command === "ZOOM_IN" ? "ZOOM +" : "ZOOM -"); }
}

document.querySelectorAll("[data-command]").forEach((element) => element.addEventListener("click", () => command(element.dataset.command)));
document.querySelectorAll("[data-cartridge]").forEach((element, index) => element.addEventListener("click", () => { setSelected(index); boot(); }));
document.addEventListener("keydown", (event) => {
  const map = { ArrowRight: "NEXT", ArrowDown: "NEXT", ArrowLeft: "PREV", ArrowUp: "PREV", Enter: "ENTER", " ": "RUN", Escape: "EJECT", r: "RUN", s: "STOP", m: "MODE", c: "CLEAR" };
  const mapped = map[event.key] || map[event.key.toLowerCase()];
  if (mapped) { event.preventDefault(); command(mapped); }
});

setSelected(0);
renderBayPreview();
