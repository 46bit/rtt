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

export const Controllers = {
  artilleryTank: new ArtilleryTankController(),
  artilleryTankProjectile: new ArtilleryTankProjectileController(),
  bot: new BotController(),
  commander: new CommanderController(),
  engineer: new EngineerController(),
  factory: new FactoryController(),
  powerSource: new PowerSourceController(),
  powerGenerator: new PowerGeneratorController(),
  shotgunTank: new ShotgunTankController(),
  shotgunTankProjectile: new ShotgunTankProjectileController(),
  titan: new TitanController(),
  titanProjectile: new TitanProjectileController(),
  turret: new TurretController(),
  turretProjectile: new TurretProjectileController(),
};

// Assert we're instantiating a controller for every entity, without erasing the
// type information on Controllers. (Maybe this can be done in a better way?)
export type ControllersType = {[K in EntityKinds]: Controller<IEntity & {kind: K}>};
const EveryEntityHasAController = Controllers as ControllersType;

export abstract class Controller<E extends IEntity> {
  abstract updateEntities(entities: E[], ctx: abilities.IEntityUpdateContext): E[];
}
