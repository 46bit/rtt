import { Vector } from '..';
import { nanoid } from 'nanoid';
import {
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

export const EntityMetadata = {
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

export type EntityKinds = keyof EntityMetadataType;
export type EntitiesWithMetadata<RequiredMetadata> =
  ({
    [P in EntityKinds]:
    EntityMetadataType[P] extends RequiredMetadata ? P : never
  })[EntityKinds];
