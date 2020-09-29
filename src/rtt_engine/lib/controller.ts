import { EntityKinds } from '.';
import { IEntity } from './entity';
import { Vector, Player } from '../';
import * as abilities from '../abilities';
import {
  ArtilleryTankController,
  ArtilleryTankProjectileController,
  BotController,
  CommanderController,
  EngineerController,
  FactoryController,
  PowerSourceController,
  PowerGeneratorController,
  ShotgunTankController,
  ShotgunTankProjectileController,
  TitanController,
  TitanProjectileController,
  TurretController,
  TurretProjectileController,
} from '../controllers';

export abstract class Controller<E extends IEntity> {
  // FIXME: Find a way to make this abstract again--abstract broke when
  // giving commander's controller as extending `abilities.EngineerModel(VehicleModel)`
  abstract updateEntities(entities: E[], ctx: abilities.IEntityUpdateContext): E[];
}
