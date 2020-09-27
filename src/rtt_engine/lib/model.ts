import { IEntity } from '.';
import { Vector, Player } from '..';
import { Pathfinder } from '../abilities';
import {
  ArtilleryTankModel,
  ArtilleryTankProjectileModel,
  BotModel,
  CommanderModel,
  EngineerModel,
  FactoryModel,
  PowerSourceModel,
  PowerGeneratorModel,
  ShotgunTankModel,
  ShotgunTankProjectileModel,
  TitanModel,
  TitanProjectileModel,
  TurretModel,
  TurretProjectileModel,
} from '../models';

export const Models = {
  artilleryTank: new ArtilleryTankModel({}),
  artilleryTankProjectile: new ArtilleryTankProjectileModel({}),
  bot: new BotModel({}),
  commander: new CommanderModel({}),
  engineer: new EngineerModel({}),
  factory: new FactoryModel({}),
  powerSource: new PowerSourceModel({}),
  powerGenerator: new PowerGeneratorModel({}),
  shotgunTank: new ShotgunTankModel({}),
  shotgunTankProjectile: new ShotgunTankProjectileModel({}),
  titan: new TitanModel({}),
  titanProjectile: new TitanProjectileModel({}),
  turret: new TurretModel({}),
  turretProjectile: new TurretProjectileModel({}),
};
export type ModelsType = typeof Models;

// Cannot be abstract because it gets passed through the ability mixins
// That could be 'fixed' using `any` but the abstract constraint then disappears
export class Model<E extends IEntity> {
  constructor(o: {}) { }

  newEntity(cfg: {position: Vector, player: Player}): E {
    throw Error("unimplemented");
  }
}
