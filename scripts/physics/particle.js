
const MAXSPEED = 1.0


class Particle {

  M = 1         // Mass
  X = [0, 0]    // Position
  V = [0, 0]    // Velocity
  F = [0, 0]    // Force
  d = 1         // Density
  r = 1         // Radius
  p = 1         // Pressure
  C = [0, 0, 0]   // Color

  constructor(x = 0, y = 0) {
    this.X = [x, y]
    this.C = [
      Math.random()*255,
      Math.random()*255,
      Math.random()*255
    ]
    this.F = [
      Math.random() * .1,
      Math.random() * .1
    ]
    this.M = Math.random() * 55
    this.r = Math.pow(this.M, 1/3.0)
  }


  move() {
    const p = this
    const a = [p.F[0]/p.M, p.F[1]/p.M];
    p.V[0] += a[0]
    p.V[1] += a[1]
    const v = this.getSpeed()
    if(v > MAXSPEED)
      p.V[0] *= MAXSPEED/v, p.V[1] *= MAXSPEED/v
    p.X[0] += p.V[0]
    p.X[1] += p.V[1]
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

