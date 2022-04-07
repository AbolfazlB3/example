import Viewport from "./viewport.js";
import Particle from "./physics/particle.js";
import Physics from "./physics/physics.js";

const canvas = document.getElementById("main_canvas");

console.log(Math.floor(Math.random() * 7 + 1));

const n = 1000;

const iterations = 5;

const physics = new Physics(n, iterations, 1.5);

const canvasScale = 1;

const vp = new Viewport("main_canvas", canvasScale, physics);

console.log(n, iterations);

var mouse = [null, null],
  lmouse = mouse,
  moused = false;

canvas.addEventListener("mousedown", mousedown);
canvas.addEventListener("mouseup", mouseup);
canvas.addEventListener("mousemove", mousemove);

function main_loop() {
  const mf = getMouseForce(0.5);
  physics.addForce(...mf);
  physics.tick();
  vp.setObjects(physics.ps);
  vp.setCursor(mf[0]);
  vp.draw();
  window.requestAnimationFrame(() => main_loop());
}

window.requestAnimationFrame(() => main_loop());

function mousedown(e) {
  lmouse = [null, null];
  setMouse(e);
  moused = true;
  console.log("hey");
}

function mouseup(e) {
  moused = false;
  console.log("hoy");
}

function mousemove(e) {
  lmouse = mouse;
  setMouse(e);
}

function setMouse(e) {
  const scale = vp.scl;
  mouse = [
    (e.offsetX * canvasScale) / scale,
    (e.offsetY * canvasScale) / scale,
  ];
}

function getMouseForce(k = 1) {
  const [x1, y1] = lmouse;
  const [x2, y2] = mouse;
  if (!moused || x1 == null || x2 == null)
    return [
      [0, 0],
      [0, 0],
    ];
  const f = [(x2 - x1) * k, (y2 - y1) * k];
  return [[x1, y1], f];
}
