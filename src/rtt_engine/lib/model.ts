import { IEntity, EntityKinds } from '.';
import { Vector, Player } from '..';

// Cannot be abstract because it gets passed through the ability mixins
// That could be 'fixed' using `any` but the abstract constraint then disappears
export class Model<E extends IEntity> {
  constructor(o: {}) { }

  newEntity(cfg: {position: Vector, player: Player}): E {
    throw Error("unimplemented");
  }
}
