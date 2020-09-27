import lodash from 'lodash';
import { Player, Vector } from '..';
import * as abilities from '../abilities';
import { Controller, ProjectileController, Models, IEntity } from '../lib';
import { ITurretProjectile, ITurret } from '../entities';

export class TurretController extends Controller<ITurret> {
  updateEntities(entities: ITurret[], ctx: abilities.IEntityUpdateContext): ITurret[] {
    return entities;
  }
}

export class TurretProjectileController extends ProjectileController<ITurretProjectile> { }
