import lodash from 'lodash';
import { Player, Vector } from '..';
import * as abilities from '../abilities';
import { VehicleController, ProjectileController, Models, IEntity } from '../lib';
import { ITitan, ITitanProjectile } from '../entities';

export class TitanController extends VehicleController<ITitan> {
  updateEntities(entities: ITitan[], ctx: abilities.IEntityUpdateContext): ITitan[] {
    return entities;
  }
}

export class TitanProjectileController extends ProjectileController<ITitanProjectile> { }
