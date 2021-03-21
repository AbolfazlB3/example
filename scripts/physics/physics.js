import Particle from "./particle.js"


const G = 2, gC = 9.8
const E = 0.001
const XX = 1, YY = 1, WW = 22.5, HH = 10
const BS = 1    // Box Size
const RR = .3    // Neighbour Radios
const PR = 1    // Pressure Radios
const NC = 4   // Normal Crowdness
const VR = 2

class Physics {

  constructor(n=30, iters=1, time=1) {
    this.iters = iters
    this.time = time
    this.ps = []
    for(var i=0;i<n;i++) {
      var p;
      do p = new Particle(Math.random() * WW + XX, Math.random() * HH/2 + YY, i, this)
      while(this.checkAllCollision(p) && 0)
      this.ps.push(p)
    }
    this.forces = []

    this.initMap()

    this.XX = XX, this.YY = YY, this.WW = WW, this.HH = HH, this.BS = BS
  }

  tick() {
    this.clearMap()
    this.fitMap()
    this.fitNeighbours()
    for(var i=0;i<this.iters;i++)
      this.singleTick();
    this.forces = []
  }

  singleTick() {

    
    for(var p of this.ps)
      p.clearForce()
/*
    for(var i=0;i<this.ps.length;i++) {
      const p = this.ps[i]
      for(var q of p.neighbours) {
        if(p.id < q.id);
          //this.collide(p, q)
      }
    }
*/
    for(var p of this.ps) {
      for(var q of p.neighbours) {
        if(p==q) continue;
        p.addForce(this.getSpringForce(p, q, 12, 0.1, 0.005))
        //p.addForce(this.getGravity(p, q)) 
        //p.addForce(this.getElectricalPushold(p, q))
      }
    }

    for(var f of this.forces)
      for(var p of this.ps)
        this.applyForce(p, f)

    for(var p of this.ps) {
      p.addForce(this.getNaturalGravity(p))
      p.addForce(this.getDrag(p, 1.2))
      this.border(p)
      p.move()
    }

  }


  getSpringForce(a, b, sr = 1, k = 1, d = 1) {
    const x = b.X[0]-a.X[0]
    const y = b.X[1]-a.X[1]
    const r2 = x*x + y*y
    const r = Math.sqrt(r2)
    const vr = [-x, -y]
    const dv = [ a.V[0]-b.V[0], a.V[1]-b.V[1] ]
    sr = (a.r + b.r)*VR
    const f = k*(r - sr)/r2 + d*this.dot(dv, vr)/r
    var g = 10;
    if(r > sr) g = .01;
    return [g*f*x/r, g*f*y/r]
  }

  getGravity(a, b) {
    const x = b.X[0]-a.X[0], y = b.X[1]-a.X[1]
    const r2 = x*x + y*y
    const r = Math.sqrt(r2)
    const sr = a.r + b.r
    //if(r > sr*10) return [0,0]
    const f = G * a.M * b.M / r2
    var g = 1
    /*
    if(r > sr*3) g = 0.05;
    if(r > sr*2) g = 0.5;
    if(r > sr*1.4) g = 6;*/
    if(r < sr*1.1) g = 0;
    return [g*f*x/r, g*f*y/r]
  }
  
  getElectricalPush(a, b) {
    if(!this.doCollide(a, b)) return [0,0]

    const x = b.X[0]-a.X[0], y = b.X[1]-a.X[1]
    const r2 = x*x + y*y
    const r = Math.sqrt(r2)
    const sr = a.r + b.r
    var t = sr-r
    const f = E / t*t
    return [-f*x/r, -f*y/r]
  }

  getElectricalPushold(a, b) {
    const x = b.X[0]-a.X[0], y = b.X[1]-a.X[1]
    const r2 = x*x + y*y
    const r = Math.sqrt(r2)
    const f = E * a.r * b.r * Math.pow(a.vr, 2) * Math.pow(b.vr, 2) / (r2*r)
    return [-f*x/r, -f*y/r]
  }

  getNaturalGravity(p) {
    return [0, gC*p.M]
  }

  getDrag(p, k = 2) {
    const v = this.getLenght(p.V)
    if(!v) return [0, 0]
    return [-p.V[0]/v * p.r * k, -p.V[1]/v * p.r * k]
  }





  collide(a, b) {
    const x = b.X[0]-a.X[0], y = b.X[1]-a.X[1]
    const r2 = x*x + y*y
    const r = Math.sqrt(r2)
    if(!this.doCollide(a, b)) return

    a.moveBack()
    b.moveBack()

    const dv = [b.V[0]-a.V[0], b.V[1]-a.V[1]]
    const dx = [x, y]

    var c = 2*b.M/(a.M+b.M) * this.dot(dv, dx)/r2
    const va = [
      a.V[0] - c * (-x),
      a.V[1] - c * (-y)
    ]
  
    var c = 2*a.M/(a.M+b.M) * this.dot(dv, dx)/r2
    const vb = [
      b.V[0] - c * x,
      b.V[1] - c * y
    ]

    a.V = va
    b.V = vb
  }

  doCollide(a, b) {
    const dr = a.r + b.r
    const x = b.X[0]-a.X[0], y = b.X[1]-a.X[1]
    if(Math.abs(x) > dr || Math.abs(y) > dr) return false;
    const r2 = x*x + y*y
    return (r2 < dr*dr)
  }

  dot(v, w) {
    return v[0] * w[0] + v[1] * w[1];
  }

  border(p) {
    const f = 0.3, af = 1-f
    const d = .00 * Math.random()

    if(p.X[0] < XX && p.V[0] < 0)
      p.V[0] *= -1;
    if(p.X[0] < XX) p.X[0] = f*p.X[0] + af*(XX+d)

    if(p.X[1] < YY && p.V[1] < 0)
      p.V[1] *= -1;
    if(p.X[1] < YY) p.X[1] = f*p.X[1] + af*(YY+d)

    if(p.X[0] > XX+WW && p.V[0] > 0)
      p.V[0] *= -1;
    if(p.X[0] > XX+WW) p.X[0] = f*p.X[0] + af*(XX+WW-d)

    if(p.X[1] > YY+HH && p.V[1] > 0)
      p.V[1] *= -1;
    if(p.X[1] > YY+HH) p.X[1] = f*p.X[1] + af*(YY+HH-d)
  }

  checkAllCollision(p) {
    for(var q of this.ps)
      if(this.doCollide(p, q))
        return 1
    return 0
  }

  distance(v, w) {
    const x = v[0]-w[0], y = v[1]-w[1]
    return Math.sqrt(x*x + y*y)
  }
  
  getLenght(v) {
    return Math.sqrt(v[0]*v[0] + v[1]*v[1])
  }

  addForce(X, F) {
    this.forces.push([X, F])
  }

  applyForce(p, F, scl=2) {
    const q = F[0], f = F[1]
    const x = p.X[0]-q[0], y = p.X[1]-q[1]
    const r2 = x*x + y*y
    const r = Math.sqrt(r2)
    const k = this.falloff(r, scl);
    p.addForce([f[0]*k, f[1]*k])
  }

  falloff(x, scl) {
    x = 25*(-Math.abs(x)+scl)
    return (x/(1.0+Math.abs(x))+1)/2
  }


  initMap() {
    var ms = this.mshape = [Math.ceil(1.0*WW/BS), Math.ceil(1.0*HH/BS)]
    var map = this.map = []

    for(var i=0;i<ms[0];i++) {
      map.push([])
      for(var j=0;j<ms[1];j++)
        map[i].push([])
    }
  }

  clearMap() {
    const ms = this.mshape
    const map = this.map
    for(var i=0;i<ms[0];i++)
      for(var j=0;j<ms[1];j++)
        map[i][j] = []
  }

  fitMap() {
    for(var p of this.ps) {
      const X = this.getMapLoc(p)
      this.map[X[0]][X[1]].push(p);
    }
  }

  getNeighbours(p) {
    const CRR = Math.ceil(RR)
    var res = []
    var X = this.getMapLoc(p)
    for(var i = Math.max(0, X[0]-CRR);i<=Math.min(this.mshape[0]-1, X[0]+CRR);i++)
      for(var j = Math.max(0, X[1]-CRR);j<=Math.min(this.mshape[1]-1, X[1]+CRR);j++)
        for(var q of this.map[i][j]) if(q!=p && this.distance(p.X, q.X) <= RR)
          res.push(q)
    return res
  }
  
  getCrowdness(p) {
    var res = 0
    var X = this.getMapLoc(p)
    for(var i = Math.max(0, X[0]-PR);i<=Math.min(this.mshape[0]-1, X[0]+PR);i++)
      for(var j = Math.max(0, X[1]-PR);j<=Math.min(this.mshape[1]-1, X[1]+PR);j++)
        res += this.map[i][j].length
    return res
  }

  getMapLoc(p) {
    var x = Math.floor((p.X[0]-XX)/BS)
    var y = Math.floor((p.X[1]-YY)/BS)
    if(x < 0) x=0;
    if(y < 0) y=0;
    if(x >= this.mshape[0]) x = this.mshape[0]-1;
    if(y >= this.mshape[1]) y = this.mshape[1]-1;
    return [x, y]
  }

  fitNeighbours() {
    for(var p of this.ps) {
      p.neighbours = this.getNeighbours(p)
      const c = this.getCrowdness(p)
      const k = 0.4;
      p.vr = (c / NC) * k + p.vr * (1-k)
    }
  }

}





export default Physics












