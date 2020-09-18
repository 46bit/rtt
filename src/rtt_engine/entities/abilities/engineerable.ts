import { Vector } from '../../vector';
import { IEntity } from '../lib/entity';
import { UnitMetadata, KindsOfUnitsWithAbility } from '../lib/poc';
import { healthiness, repair, isDead } from './killable';
import { IConstructable, isBuilt, buildCostPerHealth } from './constructable';

export interface IEngineerableConfig {
  productionRange: number;
}

export type KindsOfUnitsThatAreEngineers = KindsOfUnitsWithAbility<IEngineerableConfig>;

export interface IEngineerable extends IEntity<KindsOfUnitsThatAreEngineers> {
  energyProvided: number;
  construction: IConstructable | null;
}

export type FieldsOfIEngineerable = Omit<IEngineerable, "kind">;

export function newEngineerable<K extends KindsOfUnitsThatAreEngineers, E extends IEntity<K>>(value: E): E & FieldsOfIEngineerable {
  return {
    ...value,
    energyProvided: 0,
    construction: null,
  };
}

export function isProducing(value: IEngineerable): boolean {
  return value.construction !== null;
}

export function productionProgress(value: IEngineerable): number {
   return healthiness(value.construction!);
}

export function energyConsumption(value: IEngineerable): number {
  return isProducing(value) ? 20 : 0;
}

export function isWithinProductionRange(value: IEngineerable, target: Vector): boolean {
  return Vector.subtract(value.position, target).magnitude() <= UnitMetadata[value.kind].productionRange;
}

export function updateProduction<E extends IEngineerable>(value: E): E {
  if (value.construction == null) {
    return value;
  }

  if (isDead(value.construction!)) {
    value.construction = null;
    return value;
  }

  if (isBuilt(value.construction!)) {
    return value;
  }

  if (isWithinProductionRange(value, value.construction!.position)) {
    const healthIncrease = value.energyProvided / buildCostPerHealth(value.construction!);
    repair(value.construction!, healthIncrease);
  }

  return value;
}
