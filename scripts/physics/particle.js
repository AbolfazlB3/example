const MAXSPEED = 20.0;

class Particle {
  id = 0;
  M = 0.01; // Mass
  X = [0, 0]; // Position
  V = [0, 0]; // Velocity
  F = [0, 0]; // Force
  d = 0.1; // Density
  r = 0.2; // Radius
  vr = 0.4;
  p = 1; // Pressure
  C = [0, 0, 0]; // Color

  MassTelorance = 0.1;

  constructor(x = 0, y = 0, id = 0, par = null) {
    this.X = [x, y];
    this.id = id;
    this.par = par;
    this.neighbours = [];
    this.C = [Math.random() * 255, Math.random() * 255, Math.random() * 255];
    const telorance = 1 + (Math.random() * 2 - 1) * this.MassTelorance;
    this.M = telorance * 0.001; //this.d * Math.PI * this.r * this.r;
  }

  move() {
    const ts = 1 / 60.0;
    var dt = ts;
    if (this.par) dt = (ts * this.par.time) / this.par.iters;
    const p = this;
    const a = [p.F[0] / p.d, p.F[1] / p.d];
    //console.log(p.id, p.M, p.d);
    p.V[0] += a[0] * dt;
    p.V[1] += a[1] * dt;
    //const v = this.getSpeed();
    //if (v > MAXSPEED) (p.V[0] *= MAXSPEED / v), (p.V[1] *= MAXSPEED / v);
    p.X[0] += p.V[0] * dt;
    p.X[1] += p.V[1] * dt;
  }

  moveBack() {
    var dt = 1;
    if (this.par) dt = this.par.time / this.par.iters;
    const p = this;
    p.X[0] -= p.V[0] * dt;
    p.X[1] -= p.V[1] * dt;
  }

  clearForce() {
    this.F = [0, 0];
  }

  addForce(f) {
    this.F[0] += f[0];
    this.F[1] += f[1];
  }

  getSpeed() {
    return Math.sqrt(this.V[0] * this.V[0] + this.V[1] * this.V[1]);
  }
}

export default Particle;
