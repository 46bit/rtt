import { Vector } from '../vector';
import { IEntityConfig, newEntity } from './lib';
import { ICollidableConfig, ICollidable, newCollidable } from './abilities';

export interface IObstructionConfig {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface IObstruction extends ICollidable {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export function newObstruction(cfg: IObstructionConfig): IObstruction {
  if (cfg.left > cfg.right) {
    [cfg.left, cfg.right] = [cfg.right, cfg.left];
  }
  if (cfg.top > cfg.bottom) {
    [cfg.top, cfg.bottom] = [cfg.bottom, cfg.top];
  }

  const position = new Vector(
    (cfg.left + cfg.right) / 2,
    (cfg.top + cfg.bottom) / 2,
  );
  const topLeft = new Vector(cfg.left, cfg.top);
  const bottomRight = new Vector(cfg.right, cfg.bottom);
  const diagonalDistance = Vector.distance(topLeft, bottomRight);
  const collisionRadius = diagonalDistance + 0.1;
  const collidableEntityCfg = { position, collisionRadius };

  return {
    ...newCollidable(newEntity(collidableEntityCfg), collidableEntityCfg),
    left: cfg.left,
    right: cfg.right,
    top: cfg.top,
    bottom: cfg.bottom,
  };
}

export function obstructionContains(value: IObstruction, unit: { position: Vector, collisionRadius: number }): boolean {
  const contained = (
    unit.position.x + unit.collisionRadius > value.left
    && unit.position.x - unit.collisionRadius <= value.right
    && unit.position.y + unit.collisionRadius > value.top
    && unit.position.y - unit.collisionRadius <= value.bottom
  );
  return contained;
}

export function resolveCollisionWithObstruction(obstruction: IObstruction, collider: ICollidable): void {
  while (obstructionContains(obstruction, collider)) {
    const aboveY = obstruction.top - collider.collisionRadius;
    const belowY = obstruction.bottom + collider.collisionRadius;
    const leftX = obstruction.left - collider.collisionRadius;
    const rightX = obstruction.right + collider.collisionRadius;

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
