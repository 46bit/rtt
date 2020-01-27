import { IEntity, IEntityConfig } from '../rtt_engine/entities';
import { ICollidableConfig, ICollidable } from '../rtt_engine/entities/abilities';

export interface IEntityQuadtree<I = IEntity> extends Bounds {
  subtrees: IEntityQuadtree<I>[] | null;
  items: I[];
}

interface Bounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export function quadtreeForEntityCollisions(units: ICollidableConfig[]): IEntityQuadtree<ICollidableConfig> {
  return quadtree(units, (item: ICollidableConfig) => item.collisionRadius);
}

function quadtree<I = IEntity>(items: I[], itemRadiusCallback: (item: I) => number): IEntityQuadtree<I> {
  return quadrant(bounds(items, itemRadiusCallback), items, itemRadiusCallback);
}

function quadrant<I = IEntity>(bounds: Bounds, items: I[], itemRadiusCallback: (item: I) => number): IEntityQuadtree<I> {
  let quadrant_ = bounds as IEntityQuadtree<I>;
  quadrant_.subtrees = [];
  if (items.length <= 1) {
    quadrant_.items = items;
    return quadrant_;
  }
  quadrant_.items = [];
  const subquadrantBounds = quadrantBounds(bounds);
  let subquadrantItems: I[][] = subquadrantBounds.map(() => []);
  for (let i in items) {
    let assigned = null;
    for (let j in subquadrantBounds) {
      if (quadrantContains(subquadrantBounds[j], items[i], itemRadiusCallback)) {
        assigned = j;
        subquadrantItems[j].push(items[i]);
        break;
      }
    }
    if (assigned == null) {
      quadrant_.items.push(items[i]);
    }
  }
  for (let j in subquadrantBounds) {
    const subquadrant = quadrant(subquadrantBounds[j], subquadrantItems[j], itemRadiusCallback);
    quadrant_.subtrees.push(subquadrant);
  }
  return quadrant_;
}

function quadrantContains<I = IEntity>(bounds: Bounds, item: I, itemRadiusCallback: (item: I) => number): boolean {
  const itemLeft = item.position.x - itemRadiusCallback(item);
  const itemRight = item.position.x + itemRadiusCallback(item);
  const itemTop = item.position.y - itemRadiusCallback(item);
  const itemBottom = item.position.y + itemRadiusCallback(item);
  return (itemLeft >= bounds.left) && (itemTop >= bounds.top) && (itemRight <= bounds.right) && (itemBottom <= bounds.bottom);
}

function bounds<I = IEntity>(items: I[], itemRadiusCallback: (item: I) => number): Bounds {
  const left = Math.min(...items.map((i) => (i.position.x - itemRadiusCallback(i))));
  const right = Math.max(...items.map((i) => (i.position.x + itemRadiusCallback(i))));
  const top = Math.min(...items.map((i) => (i.position.y - itemRadiusCallback(i))));
  const bottom = Math.max(...items.map((i) => (i.position.y + itemRadiusCallback(i))));
  return { left, right, top, bottom };
}

function quadrantBounds(parentBounds: Bounds): Bounds[] {
  const centreX = parentBounds.left + (parentBounds.right - parentBounds.left) / 2;
  const centreY = parentBounds.top + (parentBounds.bottom - parentBounds.top) / 2;
  return [
    { // Top left
      left: parentBounds.left,
      right: centreX,
      top: parentBounds.top,
      bottom: centreY,
    },
    { // Top right
      left: centreX,
      right: parentBounds.right,
      top: parentBounds.top,
      bottom: centreY,
    },
    { // Bottom left
      left: parentBounds.left,
      right: centreX,
      top: centreY,
      bottom: parentBounds.bottom,
    },
    { // Bottom right
      left: centreX,
      right: parentBounds.right,
      top: centreY,
      bottom: parentBounds.bottom,
    },
  ];
}

export function quadtreeCollisions(quadtree: IEntityQuadtree<ICollidable>, items: ICollidable[]): {[key: string]: ICollidable[]} {
  let collisions: {[key: string]: ICollidable[]} = {};
  for (let item of items) {
    collisions[item.id] = [];
    for (let quadtreeItem of quadtree.items) {
      if (item.player == quadtreeItem.player) {
        continue;
      }
      if (item.isCollidingWith(quadtreeItem, 0)) {
        collisions[item.id].push(quadtreeItem);
      }
    }
    if (quadtree.subtrees != null) {
      for (let subtree of quadtree.subtrees) {
        collisions[item.id].push(...quadtreeCollisionsFor(subtree, item));
      }
    }
    if (collisions[item.id].length == 0) {
      delete collisions[item.id];
    }
  }
  return collisions;
}

export function quadtreeCollisionsFor(quadtree: IEntityQuadtree<ICollidable>, item: ICollidable): ICollidable[] {
  if (!quadrantContains(quadtree, item, (i) => i.collisionRadius)) {
    return [];
  }
  let collisions = [];
  for (let quadtreeItem of quadtree.items) {
    if (item.player == quadtreeItem.player) {
      continue;
    }
    if (item.isCollidingWith(quadtreeItem, 0)) {
      collisions.push(quadtreeItem);
    }
  }
  if (quadtree.subtrees != null) {
    for (let subtree of quadtree.subtrees) {
      collisions.push(...quadtreeCollisionsFor(subtree, item));
    }
  }
  return collisions;
}
