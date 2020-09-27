import * as abilities from '../abilities';
import { IEntityState, IEntityMetadata, IEntityUpdateContext } from './entity';
import { UnitMetadata, KindsOfUnitsWithAbility, IUnitMetadata, IUnitState, UnitAbilities, newUnit } from './';
import { Player, Vector } from '../../';

export type VehicleUnits = KindsOfUnitsWithAbility<IVehicleMetadata>;
export type IVehicleMetadata =
  IUnitMetadata
  & abilities.IMovableMetadata
  & abilities.ISteerableMetadata
  & abilities.IPathableMetadata;
export type VehicleAbilities =
  UnitAbilities
  & abilities.IMovableState
  & abilities.ISteerableState
  & abilities.IPathableState;

export interface IVehicleState extends VehicleAbilities {
  kind: VehicleUnits;
}
type E = keyof Omit<VehicleAbilities, "">;

export type IVehicleStateFields = Omit<IVehicleState, "kind">;
export function newVehicle<K extends VehicleUnits>(kind: K, position: Vector, player: Player | null): IVehicleStateFields {
  return {
    ...newUnit(kind, position, player),
    ...abilities.newMovable(kind),
    ...abilities.newSteerable(kind),
    ...abilities.newPathable(kind),
  };
}

export const vehicleOrderBehaviours: abilities.OrderMatchAllCases<IVehicleState, boolean> = {
  manoeuvre: vehicleManoeuvre,
  attack: vehicleAttack,
  patrol: vehiclePatrol,
  default: (value: any, order: any) => false,
};

export function vehicleManoeuvre(value: IVehicleState, manoeuvreOrder: abilities.ManoeuvreOrder): boolean {
  const stopAtDistanceToDestination = 10; //UnitMetadata[value.kind].stopAtDistanceToDestination ?? 10;
  const distanceToDestination = Vector.subtract(value.position, manoeuvreOrder.destination).magnitude();
  if (distanceToDestination > stopAtDistanceToDestination) {
    value.destination = manoeuvreOrder.destination;
    return true;
  }
  return false;
}

export function vehicleAttack(value: IVehicleState, attackOrder: abilities.AttackOrder): boolean {
  if (attackOrder.target.dead) {
    return false;
  }
  vehicleManoeuvre(value, { destination: attackOrder.target.position, context: attackOrder.context });
  return true;
}

export function vehiclePatrol(value: IVehicleState, patrolOrder: abilities.PatrolOrder): boolean {
  if (patrolOrder.range === undefined) {
    patrolOrder.range = UnitMetadata[value.kind].collisionRadius;
  }
  const distanceToLocation = Vector.subtract(value.position, patrolOrder.location).magnitude();
  if (distanceToLocation <= patrolOrder.range) {
    // FIXME: Circle the location
    vehicleManoeuvre(value, { destination: patrolOrder.location, context: patrolOrder.context });
  } else {
    vehicleManoeuvre(value, { destination: patrolOrder.location, context: patrolOrder.context });
  }
  return true;
}
