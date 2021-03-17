import Particle from "./particle.js"


const G = 6.674 * 0.001
const E = 62.000 * 0.001
const XX = 5, YY = 5, WW = 110, HH = 45

class Physics {

  constructor(n=30) {
    this.ps = []
    for(var i=0;i<n;i++) {
      var p;
      do p = new Particle(Math.random() * WW + XX, Math.random() * HH + YY)
      while(this.checkAllCollision(p))
      this.ps.push(p)
    }
  }

  tick() {
    for(var p of this.ps) {
      p.clearForce()
      for(var q of this.ps) {
        if(p==q) continue;
        this.collide(p, q)
        p.addForce(this.getGravity(p, q))
        p.addForce(this.getElectricalPush(p, q))
      }
    }


    for(var p of this.ps) {
      this.border(p)
      p.move()
    }

  }


  getGravity(a, b) {
    const x = b.X[0]-a.X[0], y = b.X[1]-a.X[1]
    const r2 = x*x + y*y
    const r = Math.sqrt(r2)
    const f = G * a.M * b.M / r2
    return [f*x/r, f*y/r]
  }

  getElectricalPush(a, b) {
    const x = b.X[0]-a.X[0], y = b.X[1]-a.X[1]
    const r2 = x*x + y*y
    const r = Math.sqrt(r2)
    const f = E * a.M * b.M / (r2*r)
    return [-f*x/r, -f*y/r]
  }

  collide(a, b) {
    const x = b.X[0]-a.X[0], y = b.X[1]-a.X[1]
    const r2 = x*x + y*y
    const r = Math.sqrt(r2)
    if(!this.doCollide(a, b)) return
    const n = [-x/r, -y/r]

    const dot = this.dot(a.V, n)
    const vn = [a.V[0] - 2*dot*n[0], a.V[1] - 2*dot*n[1]]
    if( this.distance(b.X, [a.X[0]+a.V[0], a.X[1]+a.V[1]])
      < this.distance(b.X, [a.X[0]+vn[0],  a.X[1]+vn[1]]))
      a.V = vn
  }

  doCollide(a, b) {
    const x = b.X[0]-a.X[0], y = b.X[1]-a.X[1]
    const r2 = x*x + y*y
    const r = Math.sqrt(r2)
    return (r < a.r + b.r)
  }

  dot(v, w) {
    return v[0] * w[0] + v[1] * w[1];
  }

  border(p) {
    if(p.X[0] < XX && p.V[0] < 0)
      p.V[0] *= -1;
    if(p.X[1] < YY && p.V[1] < 0)
      p.V[1] *= -1;
    if(p.X[0] > XX+WW && p.V[0] > 0)
      p.V[0] *= -1;
    if(p.X[1] > YY+HH && p.V[1] > 0)
      p.V[1] *= -1;
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

}





export default Physics












