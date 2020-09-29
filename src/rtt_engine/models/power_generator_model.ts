import { Player, Vector } from '../';
import * as abilities from '../abilities';
import { Model, newEntity } from '../lib';
import { IPowerSource, IPowerGenerator, PowerGeneratorMetadata } from '../entities';

export class PowerGeneratorModel extends abilities.ConstructableModel(abilities.OwnableModel(Model)) {
  newEntity(cfg: {position: Vector, player: Player, built: boolean, powerSource: IPowerSource}): IPowerGenerator {
    return {
      ...newEntity({kind: "powerGenerator", position: cfg.position}),
      health: cfg.built ? PowerGeneratorMetadata.fullHealth : 0,
      dead: false,
      built: cfg.built,
      player: cfg.player,
      energyProvided: 0,
      powerSource: cfg.powerSource,
      upgrading: false,
      upgradeLevel: 0,
      orders: [],
    };
  }

  kill(entity: IPowerGenerator): IPowerGenerator {
    entity.powerSource.structure = null;
    super.kill(entity);
    return entity;
  }

  energyOutput(entity: IPowerGenerator): number {
    return Math.pow(PowerGeneratorMetadata.upgradeEnergyOutputMultiplier, entity.upgradeLevel);
  }

  energyConsumption(entity: IPowerGenerator): number {
    return entity.upgrading ? 10 : 0;
  }

  fullHealthIncludingUpgrades(entity: IPowerGenerator): number {
    return PowerGeneratorMetadata.fullHealth * Math.pow(PowerGeneratorMetadata.upgradeHealthMultiplier, entity.upgradeLevel);
  }

  repair(entity: IPowerGenerator, amount: number): IPowerGenerator {
    entity.health = Math.min(entity.health + amount, this.fullHealthIncludingUpgrades(entity));
    return entity;
  }

  isDamaged(entity: IPowerGenerator): boolean {
    return entity.health < this.fullHealthIncludingUpgrades(entity);
  }

  healthiness(entity: IPowerGenerator): number {
    return entity.health / this.fullHealthIncludingUpgrades(entity);
  }
}
