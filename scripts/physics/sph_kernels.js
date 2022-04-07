class Kernel {
  h = 1;
  dim = 2;
  fac = 0;

  constructor(h) {
    this.h = h;
  }

  kernel(r, h = this.h) {
    return 0;
  }
  Dkernel(r, h = this.h) {
    return 0;
  }
  Lkernel(r, h = this.h) {
    return 0;
  }
}

class Poly6Kernel extends Kernel {
  constructor(h) {
    super(h);
    this.fac = 4.0 / (Math.PI * Math.pow(h, 8));
  }

  kernel(r, h = this.h) {
    if (r > h) return 0;
    const h2 = h * h;
    const r2 = r * r;
    return this.fac * Math.pow(h2 - r2, 3);
  }
  Dkernel(r, h = this.h) {
    if (r > h) return 0;
    const h2 = h * h;
    const r2 = r * r;
    return this.fac * 6 * Math.pow(h2 - r2, 2) * r;
  }
  Lkernel(r, h = this.h) {
    if (r > h) return 0;
    const h2 = h * h;
    const r2 = r * r;
    return this.fac * -12.0 * (3 * r2 * r2 - 4 * h2 * r2 + h2 * h2);
  }
}

class JohnsonKernel extends Kernel {
  constructor(h) {
    super(h);
    this.fac = 2.0 / (Math.PI * h * h);
  }

  kernel(r, h = this.h) {
    if (r > h) return 0;
    const h2 = h * h;
    const q = (2 * r) / h;
    return this.fac * ((3 / 16.0) * q * q - (3 / 4.0) * q + 3 / 4.0);
  }
  Dkernel(r, h = this.h) {
    if (r > h) return 0;
    const h2 = h * h;
    return this.fac * ((-3 * (h - r)) / (2 * h2));
  }
  Lkernel(r, h = this.h) {
    if (r > h) return 0;
    const h2 = h * h;
    return this.fac * ((6 - (3 * h) / r) / (2 * h2));
  }
}

export { JohnsonKernel, Poly6Kernel };
