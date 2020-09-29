import { Vector } from '../';
import { Model, newEntity } from '../lib';
import { IPowerSource, PowerSourceMetadata } from '../entities';

export class PowerSourceModel extends Model<IPowerSource> {
  newEntity(cfg: {position: Vector}): IPowerSource {
    return {
      ...newEntity({kind: "powerSource", position: cfg.position}),
      structure: null,
    };
  }
}
