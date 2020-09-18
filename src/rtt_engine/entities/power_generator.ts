import { Player } from '../player';
import { PowerSource } from './power_source';
import { IStructure, IStructureConfig, IEntityUpdateContext, newStructure } from './lib';
import { Vector } from '../vector';

export interface IPowerGeneratorConfig {
  player: Player;
  built: boolean;
  powerSource: IPowerSource;
  energyOutput?: number;
}

export interface IPowerGenerator extends IStructure {
  powerSource: IPowerSource;
  energyOutput: number;
  upgrading: boolean;
  energyProvided: number;
}

export function newPowerGenerator(cfg: IPowerGeneratorConfig): IPowerGenerator {
  const structureCfg = {
    position: cfg.powerSource.position,
    collisionRadius: 8,
    player: cfg.player,
    built: cfg.built,
    buildCost: 300,
    fullHealth: 60,
    health: cfg.built ? 60 : 0,
    orderBehaviours: {
      upgrade: (o: any) => this.upgrade(o),
    },
  };
  return {
    ...newStructure(structureCfg),
    powerSource: cfg.powerSource,
    energyOutput: cfg.energyOutput ?? 1,
    upgrading: false,
    energyProvided: 0,
  };
}

// kill() {
//   super.kill();
//   this.powerSource.structure = null;
// }

export function energyConsumption(value: IPowerGenerator): number {
  return value.upgrading ? 10 : 0;
}

  update(input: {context: IEntityUpdateContext}) {
    if (this.dead) {
      return;
    }
    this.updateOrders(input);
  }

  upgrade(_: {}): boolean {
    if (this.upgrading == true) {
      if (this.health == this.fullHealth) {
        this.upgrading = false;
        this.energyOutput *= 2;
        return false;
      } else {
        this.repair(this.energyProvided / this.buildCostPerHealth());
      }
    } else {
      if (this.energyOutput >= 16) {
        return false;
      }
      this.upgrading = true;
      this.fullHealth *= 2;
      this.buildCost *= 4;
    }
    return true;
  }
}
