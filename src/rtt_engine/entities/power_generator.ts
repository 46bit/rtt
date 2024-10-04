import { Player } from '../player';
import { PowerSource } from './power_source';
import { Structure, IEntityUpdateContext } from './lib';
import { Vector } from '../vector';

export class PowerGenerator extends Structure {
  public powerSource: PowerSource;
  public energyOutput: number;
  public upgrading: boolean;
  public energyProvided: number;

  constructor(position: Vector, player: Player, built: boolean, powerSource: PowerSource, energyOutput = 1) {
    if (powerSource.position != position) {
      throw new Error("trying to build a power generator at a different location to the power source.")
    }
    super({
      position: position,
      collisionRadius: 8,
      player,
      built,
      buildCost: 300,
      fullHealth: 60,
      health: built ? 60 : 0,
      orderBehaviours: {
        upgrade: (o: any) => this.upgrade(o),
      },
    } as any);
    this.powerSource = powerSource;
    this.powerSource.structure = this;
    this.energyOutput = energyOutput;
    this.upgrading = false;
    this.energyProvided = 0;
  }

  kill() {
    super.kill();
    this.powerSource.structure = null;
  }

  energyConsumption() {
    return this.upgrading ? 10 : 0;
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
      this.buildCost *= 3;
    }
    return true;
  }
}
