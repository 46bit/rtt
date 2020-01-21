export class PointOfInterest<S> extends CollidableEntity {
  structure: S;

  constructor(position, collision_radius, structure) {
    super(position, collision_radius);
    this.structure = structure;
  }
}
