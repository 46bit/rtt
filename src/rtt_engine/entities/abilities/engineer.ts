import { Vector } from '../../vector';
import { IEntityMetadata, IEntityState } from '../lib/entity';
import { UnitMetadata, KindsOfUnitsWithAbility } from '../lib/poc';
import { healthiness, repair, isDead } from './killable';
import { IConstructableState, isBuilt, buildCostPerHealth } from './constructable';

export type EngineerUnits = KindsOfUnitsWithAbility<IEngineerMetadata>;
export interface IEngineerMetadata extends IEntityMetadata {
  productionRange: number;
}

export interface IEngineerState extends IEntityState {
  kind: EngineerUnits;
  energyProvided: number;
  construction?: IConstructableState;
}

export type IEngineerStateFields = Omit<IEngineerState, keyof IEntityState>;
export function newEngineer<K extends EngineerUnits>(kind: K): IEngineerStateFields {
  return { energyProvided: 0 };
}

export function isProducing(value: IEngineerState): boolean {
  return !!value.construction;
}

export function productionProgress(value: IEngineerState): number {
   return healthiness(value.construction!);
}

export function energyConsumption(value: IEngineerState): number {
  return isProducing(value) ? 20 : 0;
}

export function isWithinProductionRange(value: IEngineerState, target: Vector): boolean {
  return Vector.subtract(value.position, target).magnitude() <= UnitMetadata[value.kind].productionRange;
}

export function updateProduction<E extends IEngineerState>(value: E): E {
  if (!value.construction) {
    return value;
  }

  if (isDead(value.construction)) {
    value.construction = undefined;
    return value;
  }

  if (isBuilt(value.construction)) {
    return value;
  }

  if (isWithinProductionRange(value, value.construction.position)) {
    const healthIncrease = value.energyProvided / buildCostPerHealth(value.construction);
    repair(value.construction, healthIncrease);
  }

  return value;
}
