import { Vector } from '..';
import { IEntity, EntityMetadata, newEntity } from '../lib';
import { ICollidableEntity } from '../abilities';

export interface IObstructionConfig {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

// FIXME: It would help to transform this back to being an `ICollidableEntity`
// to simplify code elsewhere. But how to do that is unclear, as the current
// setup requires `collisionRadius` to be static and in `EntityMetadata`.
// At least it's an IEntity…
export interface IObstruction extends IEntity {
  left: number;
  right: number;
  top: number;
  bottom: number;
  circumcircleCenter: Vector;
  circumcircleRadius: number;
}

export function newObstruction(cfg: IObstructionConfig): IObstruction {
  if (cfg.left > cfg.right) {
    [cfg.left, cfg.right] = [cfg.right, cfg.left];
  }
  if (cfg.top > cfg.bottom) {
    [cfg.top, cfg.bottom] = [cfg.bottom, cfg.top];
  }

  const circumcircleCenter = new Vector(
    (cfg.left + cfg.right) / 2,
    (cfg.top + cfg.bottom) / 2,
  );
  const topLeft = new Vector(cfg.left, cfg.top);
  const bottomRight = new Vector(cfg.right, cfg.bottom);
  const diagonalDistance = Vector.distance(topLeft, bottomRight);
  const circumcircleRadius = diagonalDistance + 0.1;

  return {
    ...newEntity({kind: "obstruction", position: circumcircleCenter}),
    left: cfg.left,
    right: cfg.right,
    top: cfg.top,
    bottom: cfg.bottom,
    circumcircleCenter,
    circumcircleRadius,
  };
}

export function obstructionContains(value: IObstruction, colliderPosition: Vector, collideCollisionRadius: number): boolean {
  const contained = (
    colliderPosition.x + collideCollisionRadius > value.left
    && colliderPosition.x - collideCollisionRadius <= value.right
    && colliderPosition.y + collideCollisionRadius > value.top
    && colliderPosition.y - collideCollisionRadius <= value.bottom
  );
  return contained;
}

export function resolveCollisionWithObstruction(obstruction: IObstruction, collider: ICollidableEntity): void {
  const colliderCollisionRadius = EntityMetadata[collider.kind].collisionRadius;
  while (obstructionContains(obstruction, collider.position, colliderCollisionRadius)) {
    const aboveY = obstruction.top - colliderCollisionRadius;
    const belowY = obstruction.bottom + colliderCollisionRadius;
    const leftX = obstruction.left - colliderCollisionRadius;
    const rightX = obstruction.right + colliderCollisionRadius;

    const distanceToBeAbove = Math.abs(collider.position.y - aboveY);
    const distanceToBeBelow = Math.abs(collider.position.y - belowY);
    const distanceToBeLeft = Math.abs(collider.position.x - leftX);
    const distanceToBeRight = Math.abs(collider.position.x - rightX);

    const minY = Math.min(distanceToBeAbove, distanceToBeBelow);
    const minX = Math.min(distanceToBeLeft, distanceToBeRight);
    if (minY < minX) {
      if (distanceToBeAbove < distanceToBeBelow) {
        collider.position.y = aboveY - 1;
      } else {
        collider.position.y = belowY + 1;
      }
    } else {
      if (distanceToBeLeft < distanceToBeRight) {
        collider.position.x = leftX - 1;
      } else {
        collider.position.x = rightX + 1;
      }
    }
  }
}
