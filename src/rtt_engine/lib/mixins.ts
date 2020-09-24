// For building a mixin that uses the same single argument as the class it is extending.
export type ComposableConstructor<T, U> =
  readonly [T, U] extends readonly [
    new (a: infer O1) => infer R1,
    new (a: infer O2) => infer R2
  ]
  ? (new (o: O1 & O2) => R1 & R2) & Pick<T, keyof T> & Pick<U, keyof U>
  : never;

// For building a mixin that prepends a single argument before those of the class it is extending.
// FIXME: Might `ConstructorParameters` from https://www.typescriptlang.org/docs/handbook/utility-types.html#constructorparameterst
// allow arbitrary numbers of parameters on each level?
export type ConcatenatableConstructor<T, U> =
  readonly [T, U] extends readonly [
    new (a: infer O1, ...b: infer O2) => infer R1,
    new (...b: infer O2) => infer R2
  ]
  ? (new (a: O1, ...b: O2) => R1 & R2) & Pick<T, keyof T> & Pick<U, keyof U>
  : never;
