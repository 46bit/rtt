import { Player, Vector } from '..';
import * as abilities from '../abilities';
import { Controller } from '../lib';
import { IPowerGenerator } from '../entities';

export class PowerGeneratorController extends Controller<IPowerGenerator> {
  updateEntities(entities: IPowerGenerator[], ctx: abilities.IEntityUpdateContext): IPowerGenerator[] {
    return entities;
  }
}

// export function newPowerGenerator(powerSource: IPowerSourceState, player: Player | null): IPowerGeneratorState {
//   const kind = "powerGenerator";
//   return {
//     kind,
//     ...newStructure(kind, powerSource.position, player),
//     powerSource: powerSource,
//     energyOutput: 1,
//     upgrading: false,
//     energyProvided: 0,
//   };
// }

// export function killPowerGenerator(value: IPowerGeneratorState) {
//   value.powerSource.structure = null;
//   value.dead = true;
// }

// export function energyConsumption(value: IPowerGeneratorState): number {
//   return value.upgrading ? 10 : 0;
// }

// export function upgrade(value: IPowerGeneratorState): boolean {
//   if (value.upgrading == true) {
//     if (value.health == UnitMetadata[value.kind].fullHealth) {
//       value.upgrading = false;
//       value.energyOutput *= 2;
//       return false;
//     } else {
//       abilities.repair(value, value.energyProvided / abilities.buildCostPerHealth(value));
//     }
//   } else {
//     if (value.energyOutput >= 16) {
//       return false;
//     }
//     value.upgrading = true;
//     value.fullHealth *= 2;
//     value.buildCost *= 4;
//   }
//   return true;
// }
