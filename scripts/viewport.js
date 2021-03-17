class Viewport {

  constructor(id, scl=50) {
    this.cnv = document.getElementById(id);
    this.ctx = this.cnv.getContext("2d");
    this.objs = []
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
    this.scl = scl
  }

  resizeCanvas() {
    this.W = this.cnv.width = window.innerWidth * 4;
    this.H = this.cnv.height = window.innerHeight * 4;
  }

  start() {
    window.requestAnimationFrame(() => this.draw());
  }

  setObjects(ps) {
    this.objs = [...ps]
  }

  draw() {
    const ctx = this.ctx;
    ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0, 0, this.W, this.H);
  
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    //ctx.strokeStyle = 'rgba(0, 153, 255, 0.4)';

    for(var p of this.objs) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.C[0]}, ${p.C[1]}, ${p.C[2]}, 1)`;
      ctx.arc(p.X[0]*this.scl, p.X[1]*this.scl, p.r*this.scl, 0, 2*Math.PI, 0);
      //console.log(p.C);
      ctx.fill();
    }
  }
}











export default Viewport







