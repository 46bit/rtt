import { Vector } from '../';
import { newEntity } from '../lib';
import { Model } from '../lib/model';
import { IPowerSource, PowerSourceMetadata } from '../entities';

export class PowerSourceModel extends Model<IPowerSource> {
  newEntity(cfg: {position: Vector}): IPowerSource {
    return {
      ...newEntity({kind: "powerSource", position: cfg.position}),
      structure: null,
    };
  }
}
