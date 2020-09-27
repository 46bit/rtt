import { Vector } from '..';
import { nanoid } from 'nanoid';
import {
  IObstruction,
  IArtilleryTank,
  IArtilleryTankProjectile,
  IBot,
  ICommander,
  IEngineer,
  IFactory,
  IPowerSource,
  IPowerGenerator,
  IShotgunTank,
  IShotgunTankProjectile,
  ITitan,
  ITitanProjectile,
  ITurret,
  ITurretProjectile,
  ArtilleryTankMetadata,
  ArtilleryTankProjectileMetadata,
  BotMetadata,
  CommanderMetadata,
  EngineerMetadata,
  FactoryMetadata,
  PowerSourceMetadata,
  PowerGeneratorMetadata,
  ShotgunTankMetadata,
  ShotgunTankProjectileMetadata,
  TitanMetadata,
  TitanProjectileMetadata,
  TurretMetadata,
  TurretProjectileMetadata,
} from '../entities';

export interface IEntity {
  kind: EntityKinds;
  id: string;
  position: Vector;
}

export function newEntity<K extends EntityKinds>(cfg: {kind: K, position: Vector}): IEntity & {kind: K} {
  const id = nanoid();
  return {id, ...cfg};
}

export type Entities = {
  obstruction: IObstruction,
  artilleryTank: IArtilleryTank,
  artilleryTankProjectile: IArtilleryTankProjectile,
  bot: IBot,
  commander: ICommander,
  engineer: IEngineer,
  factory: IFactory,
  powerSource: IPowerSource,
  powerGenerator: IPowerGenerator,
  shotgunTank: IShotgunTank,
  shotgunTankProjectile: IShotgunTankProjectile,
  titan: ITitan,
  titanProjectile: ITitanProjectile,
  turret: ITurret,
  turretProjectile: ITurretProjectile,
};

export const EntityMetadata = {
  obstruction: null,
  artilleryTank: ArtilleryTankMetadata,
  artilleryTankProjectile: ArtilleryTankProjectileMetadata,
  bot: BotMetadata,
  commander: CommanderMetadata,
  engineer: EngineerMetadata,
  factory: FactoryMetadata,
  powerSource: PowerSourceMetadata,
  powerGenerator: PowerGeneratorMetadata,
  shotgunTank: ShotgunTankMetadata,
  shotgunTankProjectile: ShotgunTankProjectileMetadata,
  titan: TitanMetadata,
  titanProjectile: TitanProjectileMetadata,
  turret: TurretMetadata,
  turretProjectile: TurretProjectileMetadata,
};
export type EntityMetadataType = typeof EntityMetadata;

// Assert we're instantiating a controller for every entity.
// Maybe this can be done in a better way? This file has become messy.
export type EntityMetadataAssertType = {[K in keyof Entities]: {} | null};
const EveryEntityHasMetadata = EntityMetadata as EntityMetadataAssertType;

export type EntityKinds = keyof EntityMetadataType;
export type EntitiesWithMetadata<RequiredMetadata> =
  ({
    [P in EntityKinds]:
    EntityMetadataType[P] extends RequiredMetadata ? P : never
  })[EntityKinds];

export type EntitiesWithState<RequiredState> =
  ({
    [P in EntityKinds]:
    Entities[P] extends RequiredState ? P : never
  })[EntityKinds];
