import Particle from "./particle.js";
import * as Kernels from "./sph_kernels.js";

const G = 2,
  gC = 9.8;
const E = 0.5;
const XX = 1,
  YY = 1,
  WW = 90,
  HH = 40;
const CR = 5; // Cursor Radius
const BS = 1; // Box Size
const RR = 2; // Neighbour Radios
const PR = 1; // Pressure Radios
const NC = 4; // Normal Crowdness
const VR = 2;
const D0 = 0.0015; // Air pressure
const K = 50; // Pressure (& Tempreture) constant
const U = 0.01; // Viscosity constant
const incompressibility = 6;

class Physics {
  constructor(n = 30, iters = 1, time = 1) {
    this.iters = iters;
    this.time = time;
    this.ps = [];
    for (var i = 0; i < n; i++) {
      var p;
      do
        p = new Particle(
          Math.random() * WW + XX,
          (Math.random() * HH) / 2 + YY,
          i,
          this
        );
      while (this.checkAllCollision(p) && 0);
      this.ps.push(p);
    }
    this.forces = [];

    this.initMap();

    this.XX = XX;
    this.YY = YY;
    this.WW = WW;
    this.HH = HH;
    this.BS = BS;

    this.kernel = new Kernels.Poly6Kernel(RR);
  }

  tick() {
    this.clearMap();
    this.fitMap();
    this.fitNeighbours();
    this.setDensities();
    this.setPressures();
    for (var i = 0; i < this.iters; i++) this.singleTick();
    this.forces = [];
  }

  singleTick() {
    for (var p of this.ps) p.clearForce();

    /*
    for(var i=0;i<this.ps.length;i++) {
      const p = this.ps[i]
      for(var q of p.neighbours) {
        if(p.id < q.id);
          //this.collide(p, q)
      }
    }
    */
    for (var p of this.ps) {
      for (var q of p.neighbours) {
        if (p == q) continue;
        //p.addForce(this.getSpringForce(p, q, 12, 0.04, 0.01));
        p.addForce(this.getPressureForce(p, q));
        p.addForce(this.getViscosityForce(p, q));
        p.addForce(this.getElectricalPush(p, q));
        //p.addForce(this.getGravity(p, q))
        //p.addForce(this.getElectricalPushold(p, q))
      }
    }

    for (var f of this.forces) for (var p of this.ps) this.applyForce(p, f);

    for (var p of this.ps) {
      p.addForce(this.getNaturalGravity(p));
      //p.addForce(this.getDrag(p, 0.03));
      this.border(p);
      p.move();
    }
  }

  getSpringForce(a, b, sr = 1, k = 1, d = 1) {
    const x = b.X[0] - a.X[0];
    const y = b.X[1] - a.X[1];
    const r2 = x * x + y * y;
    const r = Math.sqrt(r2);
    const vr = [-x, -y];
    const dv = [a.V[0] - b.V[0], a.V[1] - b.V[1]];
    sr = (a.r + b.r) * VR;
    const f = (k * (r - sr)) / r2 + (d * this.dot(dv, vr)) / r;
    var g = 10;
    if (r > sr) g = 0.01;
    return [(g * f * x) / r, (g * f * y) / r];
  }

  getGravity(a, b) {
    const x = b.X[0] - a.X[0],
      y = b.X[1] - a.X[1];
    const r2 = x * x + y * y;
    const r = Math.sqrt(r2);
    const sr = a.r + b.r;
    //if(r > sr*10) return [0,0]
    const f = (G * a.M * b.M) / r2;
    var g = 1;
    /*
    if(r > sr*3) g = 0.05;
    if(r > sr*2) g = 0.5;
    if(r > sr*1.4) g = 6;*/
    if (r < sr * 1.1) g = 0;
    return [(g * f * x) / r, (g * f * y) / r];
  }

  getElectricalPush(a, b) {
    if (!this.doCollide(a, b)) return [0, 0];

    const x = b.X[0] - a.X[0],
      y = b.X[1] - a.X[1];
    const r2 = x * x + y * y;
    const r = Math.sqrt(r2);
    const sr = a.vr + b.vr;
    var t = sr - r;
    const f = E * Math.pow(t, 1.2);
    return [(-f * x) / r, (-f * y) / r];
  }

  getElectricalPushold(a, b) {
    const x = b.X[0] - a.X[0],
      y = b.X[1] - a.X[1];
    const r2 = x * x + y * y;
    const r = Math.sqrt(r2);
    const f =
      (E * a.r * b.r * Math.pow(a.vr, 2) * Math.pow(b.vr, 2)) / (r2 * r);
    return [(-f * x) / r, (-f * y) / r];
  }

  getNaturalGravity(p) {
    return [0, gC * p.M];
  }

  getDrag(p, k = 2) {
    const v = this.getLenght(p.V);
    if (!v) return [0, 0];
    return [(-p.V[0] / v) * k, (-p.V[1] / v) * k];
  }

  collide(a, b) {
    const x = b.X[0] - a.X[0],
      y = b.X[1] - a.X[1];
    const r2 = x * x + y * y;
    const r = Math.sqrt(r2);
    if (!this.doCollide(a, b)) return;

    a.moveBack();
    b.moveBack();

    const dv = [b.V[0] - a.V[0], b.V[1] - a.V[1]];
    const dx = [x, y];

    var c = (((2 * b.M) / (a.M + b.M)) * this.dot(dv, dx)) / r2;
    const va = [a.V[0] - c * -x, a.V[1] - c * -y];

    var c = (((2 * a.M) / (a.M + b.M)) * this.dot(dv, dx)) / r2;
    const vb = [b.V[0] - c * x, b.V[1] - c * y];

    a.V = va;
    b.V = vb;
  }

  doCollide(a, b) {
    const dr = a.vr + b.vr;
    const x = b.X[0] - a.X[0],
      y = b.X[1] - a.X[1];
    if (Math.abs(x) > dr || Math.abs(y) > dr) return false;
    const r2 = x * x + y * y;
    return r2 < dr * dr;
  }

  dot(v, w) {
    return v[0] * w[0] + v[1] * w[1];
  }

  border(p) {
    const f = 0.9,
      af = 1 - f;
    const d = 0.3 * Math.random();

    const damp = -0.9;
    const dampo = 0.95;

    if (p.X[0] < XX && p.V[0] < 0) (p.V[0] *= damp), (p.V[1] *= dampo);
    if (p.X[0] < XX) p.X[0] = f * p.X[0] + af * (XX + d);

    if (p.X[1] < YY && p.V[1] < 0) (p.V[1] *= damp), (p.V[0] *= dampo);
    if (p.X[1] < YY) p.X[1] = f * p.X[1] + af * (YY + d);

    if (p.X[0] > XX + WW && p.V[0] > 0) (p.V[0] *= damp), (p.V[1] *= dampo);
    if (p.X[0] > XX + WW) p.X[0] = f * p.X[0] + af * (XX + WW - d);

    if (p.X[1] > YY + HH && p.V[1] > 0) (p.V[1] *= damp), (p.V[0] *= dampo);
    if (p.X[1] > YY + HH) p.X[1] = f * p.X[1] + af * (YY + HH - d);
  }

  checkAllCollision(p) {
    for (var q of this.ps) if (this.doCollide(p, q)) return 1;
    return 0;
  }

  distance(v, w) {
    return Math.sqrt(this.distance2(v, w));
  }

  distance2(v, w) {
    const x = v[0] - w[0],
      y = v[1] - w[1];
    return x * x + y * y;
  }

  getLenght(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
  }

  addForce(X, F) {
    this.forces.push([X, F]);
  }

  applyForce(p, F, scl = 1) {
    const q = F[0],
      f = F[1];
    const x = p.X[0] - q[0],
      y = p.X[1] - q[1];
    const r = Math.sqrt(x * x + y * y);
    //const r = Math.sqrt(r2);
    const k = this.falloff(r, scl);
    p.addForce([f[0] * k, f[1] * k]);
  }

  falloff(r, scl) {
    return Math.pow(Math.max(0, CR - r) / CR, 0.5);
    x = 25 * (-Math.abs(x) + scl);
    return (x / (1.0 + Math.abs(x)) + 1) / 2;
  }

  initMap() {
    var ms = (this.mshape = [
      Math.ceil((1.0 * WW) / BS),
      Math.ceil((1.0 * HH) / BS),
    ]);
    var map = (this.map = []);

    for (var i = 0; i < ms[0]; i++) {
      map.push([]);
      for (var j = 0; j < ms[1]; j++) map[i].push([]);
    }
  }

  clearMap() {
    const ms = this.mshape;
    const map = this.map;
    for (var i = 0; i < ms[0]; i++)
      for (var j = 0; j < ms[1]; j++) map[i][j] = [];
  }

  fitMap() {
    for (var p of this.ps) {
      const X = this.getMapLoc(p.X);
      this.map[X[0]][X[1]].push(p);
    }
  }

  getNeighbours(p) {
    const CRR = Math.ceil(RR);
    var res = [];
    var X = this.getMapLoc(p.X);
    for (
      var i = Math.max(0, X[0] - CRR);
      i <= Math.min(this.mshape[0] - 1, X[0] + CRR);
      i++
    )
      for (
        var j = Math.max(0, X[1] - CRR);
        j <= Math.min(this.mshape[1] - 1, X[1] + CRR);
        j++
      )
        for (var q of this.map[i][j])
          if (q != p && this.distance2(p.X, q.X) <= RR * RR) res.push(q);
    return res;
  }

  getCrowdness(p) {
    var res = 0;
    var X = this.getMapLoc(p.X);
    for (
      var i = Math.max(0, X[0] - PR);
      i <= Math.min(this.mshape[0] - 1, X[0] + PR);
      i++
    )
      for (
        var j = Math.max(0, X[1] - PR);
        j <= Math.min(this.mshape[1] - 1, X[1] + PR);
        j++
      )
        res += this.map[i][j].length;
    return res;
  }

  getMapLoc(X) {
    var x = Math.floor((X[0] - XX) / BS);
    var y = Math.floor((X[1] - YY) / BS);
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x >= this.mshape[0]) x = this.mshape[0] - 1;
    if (y >= this.mshape[1]) y = this.mshape[1] - 1;
    return [x, y];
  }

  fitNeighbours() {
    for (var p of this.ps) {
      p.neighbours = this.getNeighbours(p);
      //const c = this.getCrowdness(p);
      //const k = 0.4;
      //p.vr = (c / NC) * k + p.vr * (1 - k);
    }
  }

  density(p) {
    var res = p.M * this.kernel.kernel(0);
    for (var q of p.neighbours)
      res += q.M * this.kernel.kernel(this.distance(p.X, q.X));
    return res;
  }

  setDensities() {
    for (var p of this.ps) {
      p.d = this.density(p);
    }
  }

  pressure(p) {
    return K * D0 * (Math.pow(p.d / D0, incompressibility) - 1);
  }

  setPressures() {
    for (var p of this.ps) p.p = this.pressure(p);
  }

  getPressureForce(a, b) {
    const x = b.X[0] - a.X[0];
    const y = b.X[1] - a.X[1];
    const r2 = x * x + y * y;
    const r = Math.sqrt(r2);
    const f = -((b.M * (a.p + b.p)) / (2.0 * b.d)) * this.kernel.Dkernel(r);
    return [(f * x) / r, (f * y) / r];
  }

  getViscosityForce(a, b) {
    const r = this.distance(a.X, b.X);
    const Lk = this.kernel.kernel(r);
    const f1 = U * ((b.M * (b.V[0] - a.V[0])) / b.d) * Lk;
    const f2 = U * ((b.M * (b.V[1] - a.V[1])) / b.d) * Lk;
    return [f1, f2];
  }
}

export default Physics;
