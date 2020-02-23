import { Vector } from '../vector';
import { Entity } from './lib';
import { Collidable, ICollidableConfig, ICollidable } from './abilities';

export class Obstruction extends Collidable(Entity) {
  player: null;
  left: number;
  right: number;
  top: number;
  bottom: number;

  constructor(left: number, right: number, top: number, bottom: number) {
    const position = new Vector(
      (left + right) / 2,
      (top + bottom) / 2,
    );
    const collisionRadius = Math.max(right - left, bottom - top) / 2 + 0.1;
    super({ position, collisionRadius });
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
  }

  contains(unit: ICollidable): boolean {
    // FIXME: One X and Y edge has to be made inclusive, or it's possible for a unit
    // to slide between two touching obstructions.
    const contained = (
      unit.position.x + unit.collisionRadius > this.left
      && unit.position.x - unit.collisionRadius <= this.right
      && unit.position.y + unit.collisionRadius > this.top
      && unit.position.y - unit.collisionRadius <= this.bottom
    );
    // if (contained) {
    //   console.log("obstruction at [" + JSON.stringify([this.left, this.right, this.top, this.bottom]) + "] contained unit at [" + JSON.stringify(unit.position) + "]")
    // }
    return contained;
  }

  collide(unit: ICollidable): void {
    if (!this.contains(unit)) {
      return;
    }

    const aboveY = this.top - unit.collisionRadius;
    const belowY = this.bottom + unit.collisionRadius;
    const leftX = this.left - unit.collisionRadius;
    const rightX = this.right + unit.collisionRadius;

    const distanceToBeAbove = Math.abs(unit.position.y - aboveY);
    const distanceToBeBelow = Math.abs(unit.position.y - belowY);
    const distanceToBeLeft = Math.abs(unit.position.x - leftX);
    const distanceToBeRight = Math.abs(unit.position.x - rightX);

    const minY = Math.min(distanceToBeAbove, distanceToBeBelow);
    const minX = Math.min(distanceToBeLeft, distanceToBeRight);
    if (minY < minX) {
      if (distanceToBeAbove < distanceToBeBelow) {
        unit.position.y = aboveY;
      } else {
        unit.position.y = belowY;
      }
    } else {
      if (distanceToBeLeft < distanceToBeRight) {
        unit.position.x = leftX;
      } else {
        unit.position.x = rightX;
      }
    }

    // let dx = Infinity;
    // const leftX = this.left - (unit.position.x + unit.collisionRadius);
    // if (leftX < 0) {
    //   // unit.position.x += leftX;
    //   dx = leftX;
    // } else {
    //   const rightX = this.right - (unit.position.x - unit.collisionRadius);
    //   if (rightX > 0) {
    //     dx = rightX;
    //     // unit.position.x += rightX;
    //   } else {
    //     // ???
    //   }
    // }

    // let dy = Infinity;
    // const topX = this.top - (unit.position.y + unit.collisionRadius);
    // if (topX < 0) {
    //   // unit.position.y += topX;
    //   dy = topX;
    // } else {
    //   const bottomY = this.bottom - (unit.position.y - unit.collisionRadius);
    //   if (bottomY > 0) {
    //     // unit.position.y += bottomY;
    //     dy = bottomY;
    //   } else {
    //     // ???
    //   }
    // }

    // dx = Math.min(
    //   this.left - (unit.position.x + unit.collisionRadius),
    //   this.right - (unit.position.x - unit.collisionRadius)
    // );
    // dy = Math.min(
    //   this.top - (unit.position.y + unit.collisionRadius),
    //   this.bottom - (unit.position.y - unit.collisionRadius)
    // );
    // // Move to the closest edge, but only in x OR y. Not ideal at all.
    // if (Math.abs(dx) < Math.abs(dy)) {
    //   unit.position.x += dx;
    // } else {
    //   unit.position.y += dy;
    // }
  }
}
