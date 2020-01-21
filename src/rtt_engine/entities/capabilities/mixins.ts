// For building a mixin that uses the same single argument as the class it is extending.
type ComposableConstructor<T, U> =
  readonly [T, U] extends readonly [
    new (a: infer O1) => infer R1,
    new (a: infer O2) => infer R2
  ]
  ? (new (o: O1 & O2) => R1 & R2) & Pick<T, keyof T> & Pick<U, keyof U>
  : never;

// For building a mixin that prepends a single argument before those of the class it is extending.
// FIXME: Might `ConstructorParameters` from https://www.typescriptlang.org/docs/handbook/utility-types.html#constructorparameterst
// allow arbitrary numbers of parameters on each level?
type ConcatenatableConstructor<T, U> =
  readonly [T, U] extends readonly [
    new (a: infer O1, ...b: infer O2) => infer R1,
    new (...b: infer O2) => infer R2
  ]
  ? (new (a: O1, ...b: O2) => R1 & R2) & Pick<T, keyof T> & Pick<U, keyof U>
  : never;

// import { Entity } from '../types/entity';
// import { Vector } from '../../vector';

// interface EntityConfig {
//   position: Vector;
//   player?: Player | null;
//   fullHealth?: number;
//   health?: number;
//   built?: boolean;
//   buildCost?: number;
//   collisionRadius?: number;
//   productionRange?: number;

// }

// type ConcatenatableConstructor<T, U> =
//   [T, U] extends [
//     new (a: infer O1, ...b: infer O2) => infer R1,
//     new (...b: infer O2) => infer R2
//   ]
//   ? { new (a: O1, ...b: O2): R1 & R2 } & Pick<T, keyof T> & Pick<U, keyof U>
//   : never

// export function Movable<T extends new(...o: any) => any>(Base: T) {
//   class Movable extends (Base as new(...a: any[]) => Entity) {
//     // FIXME: Store velocity as a Vector instead?
//     velocity: number;
//     direction: number;

//     constructor(cfg: { velocity: number, direction: number }, ...os: any) {
//       super(...os);
//       this.velocity = cfg.velocity;
//       this.direction = cfg.direction;
//     }

//     updatePosition(multiplier = 1) {
//       const movement = Vector.from_magnitude_and_direction(this.velocity * multiplier, this.direction);
//       this.position.add(movement);
//     }

//     isGoingSouth() {
//       return Math.abs(this.direction) < Math.PI / 2;
//     }

//     isGoingEast() {
//       return this.direction > 0;
//     }
//   }
//   return Movable as ConcatenatableConstructor<typeof Movable, T>
// }

// export class MovableEntity extends Movable(Entity) {}

// export function Collidable<T extends new(...o: any) => any>(Base: T) {
//   class Collidable extends (Base as new(...a: any[]) => Entity) {
//     // FIXME: Store velocity as a Vector instead?
//     collisionRadius: number;

//     constructor(cfg: { collisionRadius: number }, ...os: any) {
//       super(...os);
//       this.collisionRadius = cfg.collisionRadius;
//     }
//   }
//   return Collidable as ConcatenatableConstructor<typeof Collidable, T>
// }

// export class CollidableMovableEntity extends Collidable(Movable(Entity)) {}

// // class Vehicle extends Manoeuvrable(Collidable(Buildable(Orderable(Ownable(Entity))))) {
// //   constructor(direction: number, collisionRadius: number) {
// //     super(ManoeuvrableConfig{
// //       velocity: 0,
// //       direction: direction
// //     }, CollidableConfig{
// //       collisionRadius: collisionRadius,
// //     }, BuildableConfig{
// //       fullHealth: fullHealth,
// //       health: built ? fullHealth : 0,
// //     })
// //   }
// // }

// // interface EntityDescription {
// //   position: Vector;
// //   velocity: number;
// //   direction: number;
// // }

// // type EntityConstructor<T = Entity> = new (entityDesc: EntityDescription) => T;

// // export function Movable<TBase extends EntityConstructor<Entity>>(Base: TBase) {
// //   return class extends Base {
// //     // FIXME: Store velocity as a Vector instead?
// //     velocity: number;
// //     direction: number;

// //     constructor(entityDesc: EntityDescription) {
// //       super(entityDesc)
// //       this.velocity = entityDesc.velocity;
// //       this.direction = entityDesc.direction;
// //     }

// //     updatePosition(multiplier = 1) {
// //       this.position += Vector.from_magnitude_and_direction(this.velocity * multiplier, this.direction);
// //     }

// //     isGoingSouth() {
// //       return Math.abs(this.direction) < Math.PI / 2;
// //     }

// //     isGoingEast() {
// //       return this.direction > 0;
// //     }
// //   };
// // }

// // type ComposableConstructor<T, U> =
// //     [T, U] extends [new (a: infer O1) => infer R1,new (a: infer O2) => infer R2] ? {
// //         new (o: O1 & O2): R1 & R2
// //     } & Pick<T, keyof T> & Pick<U, keyof U> : never

// // function MixA<T extends new (o: any) => any>(Base: T) {
// //     class MixA extends (Base as new (...a: any[]) => {}) {
// //         a_value: number;
// //         constructor(options: { a_value: number }) {
// //             super(options)
// //             this.a_value = options.a_value;
// //         }
// //         a() {
// //           console.log("a: " + this.a_value)
// //         }
// //     }
// //     return MixA as ComposableConstructor<typeof MixA, T>
// // }

// // function MixB<T extends new (o: any) => any>(Base: T) {
// //     class MixB extends (Base as new (...a: any[]) => {}) {
// //         b_value: string;
// //         constructor(options: { b_value: string }) {
// //             super(options)
// //             this.b_value = options.b_value;
// //         }
// //         b() {
// //           console.log("b: " + this.b_value)
// //         }
// //     }

// //     return MixB as ComposableConstructor<typeof MixB, T>
// // }

// // export class AB extends MixA(MixB(class { }))  {
// //     ab_value: string;
// //     constructor(options: { a_value: number, b_value: string, ab_value: string }) {
// //         super(options)
// //         this.ab_value = options.ab_value;
// //     }
// //     ab() {
// //       console.log("ab: " + this.ab_value)
// //     }
// // }

// // type ConcatenatableConstructor<T, U> =
// //   [T, U] extends [
// //     new (a: infer O1, b: infer O2) => infer R1,
// //     new (b: infer O2) => infer R2
// //   ]
// //   ? { new (a: O1, b: O2): R1 & R2 } & Pick<T, keyof T> & Pick<U, keyof U>
// //   : never

// // class X {
// //   x_value: number;
// //   constructor(x_value: number) {
// //     this.x_value = x_value;
// //   }
// //   x() {
// //     console.log("x: " + this.x_value)
// //   }
// // }

// // function MixC<T extends new (o: any) => any>(Base: T) {
// //     class MixC extends (Base as new (...a: any[]) => {}) {
// //         c_value: number;
// //         constructor(c_value: number, o: any) {
// //             super(o)
// //             this.c_value = c_value;
// //         }
// //         c() {
// //           console.log("a: " + this.c_value)
// //         }
// //     }
// //     return MixC as ConcatenatableConstructor<typeof MixC, T>
// // }

// // export class CX extends MixC(X) {
// //     constructor(c_value: number, x_value: number) {
// //         super(c_value, x_value)
// //     }
// // }

// // // export class Entity {
// // //   position: Vector;

// // //   constructor(position: Vector) {
// // //     this.position = position;
// // //   }
// // // }

// // function MixC<T extends new (o: any) => any>(Base: T) {
// //     class MixC extends (Base as new (...a: any[]) => {}) {
// //         c_value: number;
// //         constructor(c_value: number, o: any) {
// //             super(o)
// //             this.c_value = c_value;
// //         }
// //         c() {
// //           console.log("a: " + this.c_value)
// //         }
// //     }
// //     return MixC as ConcatenatableConstructor<typeof MixC, T>
// // }

// // export class CX extends MixC(X) {
// //     constructor(c_value: number, x_value: number) {
// //         super(c_value, x_value)
// //     }
// // }
