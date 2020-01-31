import { IEntity, IEntityConfig } from '../rtt_engine/entities';
import { ICollidableConfig, ICollidable } from '../rtt_engine/entities/abilities';

export class Bounds {
  left: number;
  right: number;
  top: number;
  bottom: number;

  constructor(left: number, right: number, top: number, bottom: number) {
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
  }

  contains<E extends ICollidable>(entity: E, entityRadius: (e: E) => number): boolean {
    const itemLeft = entity.position.x - entityRadius(entity);
    const itemRight = entity.position.x + entityRadius(entity);
    const itemTop = entity.position.y - entityRadius(entity);
    const itemBottom = entity.position.y + entityRadius(entity);
    return (itemLeft >= this.left)
      && (itemTop >= this.top)
      && (itemRight <= this.right)
      && (itemBottom <= this.bottom);
  }

  containedBy<E extends ICollidable>(entity: E, entityRadius: (e: E) => number): boolean {
    const itemLeft = entity.position.x - entityRadius(entity);
    const itemRight = entity.position.x + entityRadius(entity);
    const itemTop = entity.position.y - entityRadius(entity);
    const itemBottom = entity.position.y + entityRadius(entity);
    return (this.left <= itemRight)
      && (this.right >= itemLeft)
      && (this.top <= itemBottom)
      && (this.bottom >= itemTop);
  }
}

export class IQuadrant<E extends ICollidable> {
  public static fromEntityCollisions<E extends ICollidable>(entities: E[]): IQuadrant<E> {
    const entityRadius = (e: E) => e.collisionRadius;
    return this.fromEntitiesAndRadii(entities, entityRadius);
  }

  public static fromEntitiesAndRadii<E extends ICollidable>(entities: E[], entityRadius: (e: E) => number): IQuadrant<E> {
    return new IQuadrant<E>(
      this.boundsOfEntities(entities, entityRadius),
      entities,
      entityRadius
    );
  }

  public static boundsOfEntities<E extends ICollidable>(entities: E[], entityRadius: (e: E) => number): Bounds {
    const left = Math.min(...entities.map((i) => (i.position.x - entityRadius(i))));
    const right = Math.max(...entities.map((i) => (i.position.x + entityRadius(i))));
    const top = Math.min(...entities.map((i) => (i.position.y - entityRadius(i))));
    const bottom = Math.max(...entities.map((i) => (i.position.y + entityRadius(i))));
    return new Bounds(left, right, top, bottom);
  }

  bounds: Bounds;
  entities: E[];
  subtrees: IQuadrant<E>[];
  entityRadius: (e: E) => number;

  constructor(bounds: Bounds, entities: E[], entityRadius: (e: E) => number) {
    this.bounds = bounds;
    this.subtrees = [];
    this.entityRadius = entityRadius;
    if (entities.length <= 1) {
      this.entities = entities;
      return;
    }

    this.entities = [];
    const subquadrantBounds = this.subquadrantBounds();
    let subquadrantEntities: E[][] = subquadrantBounds.map(() => []);
    for (let i in entities) {
      let assigned = null;
      for (let j in subquadrantBounds) {
        if (subquadrantBounds[j].contains(entities[i], entityRadius)) {
          assigned = j;
          subquadrantEntities[j].push(entities[i]);
          // FIXME: Right now because quadrant bounds are inclusive on all sides some entities
          // belong in multiple quadrants. Fix and re-break.
          //break;
        }
      }
      if (assigned == null) {
        this.entities.push(entities[i]);
      }
    }
    for (let j in subquadrantBounds) {
      const subquadrant = new IQuadrant<E>(subquadrantBounds[j], subquadrantEntities[j], entityRadius);
      this.subtrees.push(subquadrant);
    }
  }

  contains(entity: E): boolean {
    return this.bounds.contains(entity, this.entityRadius);
  }

  containedBy(entity: E): boolean {
    return this.bounds.containedBy(entity, this.entityRadius);
  }

  subquadrantBounds(): Bounds[] {
    const centreX = this.bounds.left + (this.bounds.right - this.bounds.left) / 2;
    const centreY = this.bounds.top + (this.bounds.bottom - this.bounds.top) / 2;
    return [
      new Bounds(this.bounds.left, centreX, this.bounds.top, centreY),
      new Bounds(centreX, this.bounds.right, this.bounds.top, centreY),
      new Bounds(this.bounds.left, centreX, centreY, this.bounds.bottom),
      new Bounds(centreX, this.bounds.right, centreY, this.bounds.bottom),
    ];
  }

  getCollisions(collidingEntities: E[]): {[key: string]: E[]} {
    let allCollisions: {[key: string]: E[]} = {};
    for (let collidingEntity of collidingEntities) {
      const collisions = this.getCollisionsFor(collidingEntity);
      if (collisions.length > 0) {
        allCollisions[collidingEntity.id] = collisions;
      }
    }
    return allCollisions;
  }

  getCollisionsFor(collidingEntity: E): E[] {
    if (!this.containedBy(collidingEntity)) {
      return [];
    }
    let collisions = [];
    for (let quadtreeEntity of this.entities) {
      if (quadtreeEntity.player != collidingEntity.player && collidingEntity.isCollidingWith(quadtreeEntity, 0)) {
        collisions.push(quadtreeEntity);
      }
    }
    if (this.subtrees != null) {
      for (let subtree of this.subtrees) {
        collisions.push(...subtree.getCollisionsFor(collidingEntity));
      }
    }
    return collisions;
  }
}
