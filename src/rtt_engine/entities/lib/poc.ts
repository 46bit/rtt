import lodash from 'lodash';
import { unionize, ofType, UnionOf } from 'unionize';
import { Vector } from '../../vector';
import { newPhysics, vehicleOrderBehaviours } from './';
import { IOrderableMetadata } from '../abilities';
import {
  ARTILLERY_RANGE,
  SHOTGUN_RANGE,
  TURRET_RANGE,
  IBotState,
  botOrderBehaviours,
  IArtilleryTankState,
  artilleryTankOrderBehaviours,
  //ICommanderState,
  IEngineerState,
  //IFactoryState,
  IPowerGeneratorState,
  IShotgunTankState,
  //ITitanState,
  //ITurretState,
 } from '../';

export const UnitUnion = unionize({
  artilleryTank: ofType<IArtilleryTankState>(),
  bot: ofType<IBotState>(),
  //commander: ofType<ICommanderState>(),
  engineer: ofType<IEngineerState>(),
  //factory: ofType<IFactoryState>(),
  powerGenerator: ofType<IPowerGeneratorState>(),
  shotgunTank: ofType<IShotgunTankState>(),
  //titan: ofType<ITitanState>(),
  //turret: ofType<ITurretState>(),
}, {tag: "kind", value: "payload"});
export type Unit = UnionOf<typeof UnitUnion>;
export type UnitRecord = typeof UnitUnion._Record;

export type KindsOfUnits = keyof MetadataForUnits;
export type KindsOfUnitsWithAbility<AbilityConfig> =
  ({
    [P in KindsOfUnits]:
    MetadataForUnits[P] extends AbilityConfig ? P : never
  })[KindsOfUnits];

export type MetadataForUnits = typeof UnitMetadata;
export const UnitMetadata = {
  artilleryProjectile: {
    collisionRadius: 5,
    movementRate: 1.0,
    velocity: 1.8,
    fullHealth: 18,
    lifetime: ARTILLERY_RANGE / 1.8,
  },
  turret: {
    collisionRadius: 5,
    buildCost: 600,
    fullHealth: 60,
    constructableByMobileUnits: true,
    firingRate: 5,
  },
  turretProjectile: {
    collisionRadius: 4,
    movementRate: 1.0,
    velocity: 3.5,
    lifetime: TURRET_RANGE / 3.5,
    fullHealth: 7,
  },
};
