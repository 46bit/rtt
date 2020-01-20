export class Vector {
  x: number;
  y: number;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(v2: Vector) {
    this.x += v2.x;
    this.y += v2.y;
  }

  static add(v1, v2) {
    return new Vector(v1.x + v2.x, v1.y + v2.y)
  }

  subtract(v2: Vector) {
    this.x -= v2.x;
    this.y -= v2.y;
  }

  static subtract(v1, v2) {
    return new Vector(v1.x - v2.x, v1.y - v2.y)
  }

  angle(): number {
    return Math.atan2(this.x, this.y);
  }

  static angleBetween(v1, v2) {
    return v2.angle() - v1.angle();
  }

  magnitude(): number {
    return Math.hypot(this.x, this.y);
  }
}
