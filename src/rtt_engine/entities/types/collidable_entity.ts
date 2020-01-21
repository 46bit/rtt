export class CollidableEntity extends Entity {
  collision_radius: number;

  constructor(position, collision_radius) {
    super(position);
    this.collision_radius = collision_radius;
  }
}
