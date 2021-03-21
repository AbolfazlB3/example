
const MAXSPEED = 20.0


class Particle {

  id = 0
  M = 1         // Mass
  X = [0, 0]    // Position
  V = [0, 0]    // Velocity
  F = [0, 0]    // Force
  d = 100         // Density
  r = 1         // Radius
  vr = 1
  p = 1         // Pressure
  C = [0, 0, 0]   // Color

  constructor(x = 0, y = 0, id = 0, par=null) {
    this.X = [x, y]
    this.id = id
    this.par = par
    this.neighbours = []
    this.C = [
      Math.random()*255,
      Math.random()*255,
      Math.random()*255
    ]
    this.M = Math.random() * 0.005+0.01 
    this.r = Math.pow(this.M/this.d, 1/3.0)
  }


  move() {
    const ts = 1/60.0;
    var dt = ts
    if(this.par) dt = ts * this.par.time/this.par.iters
    const p = this
    const a = [p.F[0]/p.M, p.F[1]/p.M];
    p.V[0] += a[0]*dt
    p.V[1] += a[1]*dt
    const v = this.getSpeed()
    if(v > MAXSPEED)
      p.V[0] *= MAXSPEED/v, p.V[1] *= MAXSPEED/v
    p.X[0] += p.V[0]*dt
    p.X[1] += p.V[1]*dt
  }

  moveBack() {
    var dt = 1
    if(this.par) dt = this.par.time/this.par.iters
    const p = this
    p.X[0] -= p.V[0]*dt
    p.X[1] -= p.V[1]*dt
  }

  clearForce() {
    this.F = [0,0]
  }

  addForce(f) {
    this.F[0] += f[0]
    this.F[1] += f[1]
  }

  getSpeed() {
    return Math.sqrt(this.V[0]*this.V[0] + this.V[1]*this.V[1])
  }

}



export default Particle

