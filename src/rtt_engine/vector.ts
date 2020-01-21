export class Vector {

  public static from_magnitude_and_direction(magnitude, direction) {
    const x = magnitude * Math.sin(direction);
    const y = magnitude * Math.cos(direction);
    return new Vector(x, y);
  }

  public static add(v1, v2) {
    return new Vector(v1.x + v2.x, v1.y + v2.y);
  }

  public static subtract(v1, v2) {
    return new Vector(v1.x - v2.x, v1.y - v2.y);
  }

  public static angleBetween(v1, v2) {
    return v2.angle() - v1.angle();
  }
  public x: number;
  public y: number;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  public add(v2: Vector) {
    this.x += v2.x;
    this.y += v2.y;
  }

  public subtract(v2: Vector) {
    this.x -= v2.x;
    this.y -= v2.y;
  }

  public product(v2: Vector) {
    this.x *= v2.x;
    this.y *= v2.y;
  }

  public angle(): number {
    return Math.atan2(this.x, this.y);
  }

  public rotate(angle: number) {
    const x = this.x;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    this.x = this.x * cos - this.y * sin;
    this.y = x * sin + this.y * cos;
  }

  public magnitude(): number {
    return Math.hypot(this.x, this.y);
  }

  public normalise() {
    const magnitude = this.magnitude();
    if (magnitude === 0) {
      this.x = 1;
      this.y = 0;
    } else {
      this.x /= magnitude;
      this.y /= magnitude;
    }
  }
}
