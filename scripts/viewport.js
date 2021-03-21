class Viewport {

  constructor(id, canvasScale = 4, physic = null) {
    this.cnv = document.getElementById(id);
    this.tmpcnv = this.cnv.cloneNode(false)
    this.ctx = this.cnv.getContext("2d");
    this.tmpctx = this.tmpcnv.getContext("2d");
    this.physic = physic
    this.objs = []
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
    this.scl = 10
    this.canvasScale = canvasScale
    this.mouse = [null, null]
    this.resizeCanvas()
  }

  resizeCanvas() {
    this.W = this.cnv.width = this.tmpcnv.width = window.innerWidth * this.canvasScale;
    this.H = this.cnv.height = this.tmpcnv.height = window.innerHeight * this.canvasScale;
    const p = this.physic
    this.scl = Math.min(
      this.W/(p.XX*2+p.WW),
      this.H/(p.YY*2+p.HH)
    )
  }

  start() {
    window.requestAnimationFrame(() => this.draw());
  }

  setObjects(ps) {
    this.objs = [...ps]
  }

  draw() {
    const ctx = this.ctx;
    const ttx = this.tmpctx;
    const s = this.scl
    ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0, 0, this.W, this.H);

    /*
    ttx.fillStyle = 'rgb(0, 0, 0)';
    ttx.fillRect(0,0,this.W,this.H);
    
    for(var p of this.objs) {
      ttx.beginPath();
      ttx.fillStyle = `rgb(255,255,255)`;
      ttx.arc(p.X[0]*s, p.X[1]*s, p.r*s, 0, 2*Math.PI, 0);
      ttx.fill();
    }
    */

    ctx.drawImage(this.tmpcnv, 0, 0)
  
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';

    for(var p of this.objs) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.C[0]}, ${p.C[1]}, ${p.C[2]}, 1)`;
      ctx.arc(p.X[0]*s, p.X[1]*s, p.r*s, 0, 2*Math.PI, 0);
      ctx.fill();
    }
    
    const m = this.mouse
    if(m[0]) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(0,0,0,1)`;
      ctx.arc(m[0]*s, m[1]*s, .5*s, 0, 2*Math.PI, 0);
      ctx.fill();
    }

    if(this.physic) {

      const p = this.physic
      ctx.strokeStyle = 'rgba(5, 20, 40, 0.1)';
      ctx.lineWidth = 3

      for(var i=p.XX+p.BS;i<p.XX+p.WW;i+=p.BS)
        this.drawVerticalLine(i*s, ctx);
      
      for(var i=p.YY+p.BS;i<p.YY+p.HH;i+=p.BS)
        this.drawHorizontalLine(i*s, ctx);
      

      ctx.strokeStyle = 'rgba(5, 20, 40, 0.2)';
      ctx.lineWidth = 5
      this.drawHorizontalLine(p.YY*s, ctx);
      this.drawHorizontalLine((p.YY+p.HH)*s, ctx);
      this.drawVerticalLine(p.XX*s, ctx);
      this.drawVerticalLine((p.XX+p.WW)*s, ctx);

    }
  }

  drawVerticalLine(x, ctx) {
    ctx.beginPath()
    ctx.moveTo(x,0);
    ctx.lineTo(x,this.H);
    ctx.stroke()
  }

  drawHorizontalLine(y, ctx) {
    ctx.beginPath()
    ctx.moveTo(0, y);
    ctx.lineTo(this.W, y);
    ctx.stroke()
  }


  setCursor(X) {
    this.mouse = X
  }
}











export default Viewport







