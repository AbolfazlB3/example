export default class Viewport {

  constructor(id) {
    this.cnv = document.getElementById(id);
    this.ctx = this.cnv.getContext("2d");
    this.resizeCanvas();
    window.addEventListener("resize", this.resizeCanvas);
  }

  resizeCanvas() {
    this.W = this.cnv.width = window.innerWidth;
    this.H = this.cnv.height = window.innerHeight;
  }

  tick() {
    window.requestAnimationFrame(this.draw);
  }

  draw() {
    const ctx = this.ctx;
    ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0, 0, W, H);
  
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    //ctx.strokeStyle = 'rgba(0, 153, 255, 0.4)';
    
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for(var i=1;i<n;i++)
      ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.font = '32px sans-serif';
    ctx.fillText(s, 10, 50);
  }
}



















