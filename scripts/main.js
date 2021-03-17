import Viewport from './viewport.js'
import Particle from './physics/particle.js'
import Physics from './physics/physics.js';

const vp = new Viewport("main_canvas")

const n = 3;

const physics = new Physics(50);

function main_loop() {
  physics.tick()
  vp.setObjects(physics.ps)
  vp.draw();
  window.requestAnimationFrame(() => main_loop());
}

window.requestAnimationFrame(() => main_loop());

console.log("kello")


















