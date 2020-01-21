export class Collidable {
  collisionRadius: number;

  constructCollidable(collisionRadius) {
    this.collisionRadius = collisionRadius;
  }

  isColliding(otherCollidableEntity, within: 0) {
    const combinedCollisionRadius = this.collisionRadius + otherCollidableEntity.collisionRadius + within;
    const distanceBetween = Vector.subtract(this.position, otherCollidableEntity.position).magnitude();
    return distanceBetween <= combinedCollisionRadius;
  }
}
