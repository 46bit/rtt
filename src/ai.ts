import lodash from 'lodash';
import * as rtt_engine from './rtt_engine';

export interface IAI {
  game: rtt_engine.Game;
  player: rtt_engine.Player;
  opponents: rtt_engine.Player[];

  update(): void;
}

export class ExistingAI implements IAI {
  game: rtt_engine.Game;
  player: rtt_engine.Player;
  opponents: rtt_engine.Player[];

  constructor(game: rtt_engine.Game, player: rtt_engine.Player, opponents: rtt_engine.Player[]) {
    this.game = game;
    this.player = player;
    this.opponents = opponents;
  }

  update() {
    this.opponents = this.opponents.filter((p) => !p.isDefeated());
    if (this.opponents.length == 0) {
      return;
    }

    if (this.player.units.commander != null && this.player.units.factories.length == 0) {
      this.player.units.commander.orders[0] = rtt_engine.OrderUnion.constructStructure({
        structureClass: rtt_engine.Factory,
        position: new rtt_engine.Vector(
          this.player.units.commander.position.x,
          this.player.units.commander.position.y,
        ),
      });
    }

    for (let factory of this.player.units.factories) {
      if (factory.orders.length > 0) {
        continue;
      }
      const factoryOrderUnit = Math.random() < 0.6
        ? rtt_engine.Bot
        : (Math.random() < 0.7 ? rtt_engine.ShotgunTank : rtt_engine.ArtilleryTank);
      factory.orders[0] = rtt_engine.OrderUnion.constructVehicle({vehicleClass: factoryOrderUnit});
    }

    const opponent = this.opponents[0];
    const opposingUnits = opponent.units.allKillableCollidableUnits();
    const opposingUnitCount = opposingUnits.length;
    if (opposingUnitCount > 0) {
      this.player.units.vehicles.forEach((vehicle, j) => {
        if (vehicle.orders.length > 0) {
          return;
        }
        const target = opposingUnits[j % opposingUnitCount];
        this.player.units.vehicles[j].orders[0] = rtt_engine.OrderUnion.attack({target});
      });
    }
  }
}

export class AttackNearestAI implements IAI {
  game: rtt_engine.Game;
  player: rtt_engine.Player;
  opponents: rtt_engine.Player[];
  assignedOrders: {[id: string]: rtt_engine.Order};

  constructor(game: rtt_engine.Game, player: rtt_engine.Player, opponents: rtt_engine.Player[]) {
    this.game = game;
    this.player = player;
    this.opponents = opponents;
    this.assignedOrders = {};
  }

  update() {
    this.opponents = this.opponents.filter((p) => !p.isDefeated());
    if (this.opponents.length == 0) {
      return;
    }
    this.updateFactoryConstruction();
    this.updateCommanderConstruction();
    this.updateVehicleAttacks();

    if (this.player.units.powerGenerators.length > 0) {
      const upgrading = this.player.units.powerGenerators.filter((p) => p.upgrading).length > 0;
      if (!upgrading) {
        const cheapestUpgrade = lodash.minBy(this.player.units.powerGenerators, (p) => p.fullHealth);
        cheapestUpgrade!.orders[0] = rtt_engine.OrderUnion.upgrade();
      }
    }
  }

  updateFactoryConstruction() {
    // STRATEGY:
    // 1. If opponents have turrets:
    //    70% of the time build Shotgun Tanks
    //    28–30% of the time build Artillery Tanks
    //    if the player has 6+ vehicles then 2% of the time build a Titan
    // 2. Otherwise:
    //    if the player has 0 bots then build a Bot
    //    if the player has 1+ bots then build a Shotgun Tank

    const opponentsHaveTurrets = this.opponents.filter((o) => o.units.turrets.length > 0).length > 0;
    const numberOfArtilleryTanks = this.player.units.vehicles.filter((v) => v instanceof rtt_engine.ArtilleryTank).length;
    const numberOfTitans = this.player.units.vehicles.filter((v) => v instanceof rtt_engine.Titan).length;
    const numberOfEnemyTitans = this.opponents.map((o) => o.units.vehicles.filter((v) => v instanceof rtt_engine.Titan)).flat().length;
    let unitClass;
    if (opponentsHaveTurrets) {
      const rand = Math.random();
      if (this.player.units.vehicles.length >= 6 && rand <= 0.08 || numberOfEnemyTitans > numberOfTitans || (numberOfTitans > 0 && numberOfEnemyTitans == numberOfTitans && rand < 0.2)) {
        unitClass = rtt_engine.Titan;
      } else if (rand <= 0.3 && numberOfArtilleryTanks <= this.player.units.vehicles.length / 2) {
        unitClass = rtt_engine.ArtilleryTank;
      } else {
        unitClass = rtt_engine.ShotgunTank;
      }
    } else {
      const numberOfBots = this.player.units.vehicles.filter((v) => v instanceof rtt_engine.Bot).length;
      unitClass = numberOfBots < 1 ? rtt_engine.Bot : rtt_engine.ShotgunTank;
    }
    for (let factory of this.player.units.factories) {
      if (factory.orders.length > 0) {
        continue;
      }
      factory.orders[0] = rtt_engine.OrderUnion.constructVehicle({vehicleClass: unitClass});
    }
  }

  updateCommanderConstruction() {
    // STRATEGY: do the first (if CONDITION, then ACT) in this list where the condition is met.
    // 1. If the commander is dead, do nothing.
    //    OR If the commander is already doing something, do nothing.
    // 2. If the player has no factories, build a new factory on top of the commander.
    //    OR If the player has 500 stored energy, build a new factory on top of the commander.
    // 3. If there are unoccupied power sources near the player's factories, build power generators on them.
    // 4. If the player has no turrets, build one near the player's nearest factory.

    if (this.player.units.commander == null || this.player.units.commander.orders.length > 0) {
      return;
    }

    if (this.player.units.factories.length == 0 || this.player.storedEnergy > 500) {
      this.player.units.commander!.orders[0] = rtt_engine.OrderUnion.constructStructure({
        structureClass: rtt_engine.Factory,
        position: this.player.units.commander!.position,
      });
      return;
    }

    const powerSourcesNearFactories = this.game.powerSources.filter((powerSource) => {
      const nearestFactory = lodash.minBy(this.player.units.factories, (factory) => {
        return rtt_engine.Vector.distance(factory.position, powerSource.position);
      });
      if (nearestFactory == null) {
        return false;
      }
      return rtt_engine.Vector.distance(nearestFactory!.position, powerSource.position) < 160;
    });
    const desiredPowerSources = powerSourcesNearFactories.filter((powerSource) => powerSource.structure == null);
    if (desiredPowerSources.length > 0) {
      const nearestDesiredPowerSource = lodash.minBy(desiredPowerSources, (powerSource) => {
        return rtt_engine.Vector.distance(powerSource.position, this.player.units.commander!.position);
      });
      this.player.units.commander!.orders[0] = rtt_engine.OrderUnion.constructStructure({
        structureClass: rtt_engine.PowerGenerator,
        position: nearestDesiredPowerSource!.position,
        metadata: nearestDesiredPowerSource,
      });
      return;
    }

    if (this.player.units.turrets.length == 0) {
      const nearestFactory = lodash.minBy(this.player.units.factories, (factory) => {
        return rtt_engine.Vector.distance(this.player.units.commander!.position, factory.position);
      });
      if (rtt_engine.Vector.distance(this.player.units.commander!.position, nearestFactory!.position) < 50) {
        this.player.units.commander!.orders[0] = rtt_engine.OrderUnion.constructStructure({
          structureClass: rtt_engine.Turret,
          position: this.player.units.commander!.position,
        });
      } else {
        this.player.units.commander!.orders[0] = rtt_engine.OrderUnion.manoeuvre({destination: nearestFactory!.position});
      }
    }
  }

  updateVehicleAttacks() {
    const opposingUnits = this.opponents.map((p) => p.units.allKillableCollidableUnits()).flat();
    if (opposingUnits.length == 0) {
      return;
    }
    for (let vehicle of this.player.units.vehicles) {
      if (vehicle.orders.length > 0 && vehicle.orders[0] != this.assignedOrders[vehicle.id]) {
        continue;
      }
      let nearestOpposingUnit = lodash.minBy(opposingUnits, (u: rtt_engine.IKillable) => rtt_engine.Vector.distance(u.position, vehicle.position))!;
      vehicle.orders[0] = rtt_engine.OrderUnion.attack({ target: nearestOpposingUnit });
      this.assignedOrders[vehicle.id] = vehicle.orders[0];
    }
  }
}

export class ExpansionAI implements IAI {
  game: rtt_engine.Game;
  player: rtt_engine.Player;
  opponents: rtt_engine.Player[];
  powerSourceEngineers: Map<rtt_engine.PowerSource, rtt_engine.Engineer[]>;

  constructor(game: rtt_engine.Game, player: rtt_engine.Player, opponents: rtt_engine.Player[]) {
    this.game = game;
    this.player = player;
    this.opponents = opponents;
    this.powerSourceEngineers = new Map();
  }

  update() {
    this.updateFactoryConstruction();
    this.updateExpansion();

    if (this.player.units.powerGenerators.length > 3) {
      const upgrading = this.player.units.powerGenerators.filter((p) => p.upgrading).length > 0;
      if (!upgrading) {
        const cheapestUpgrade = lodash.minBy(this.player.units.powerGenerators, (p) => p.fullHealth);
        cheapestUpgrade!.orders[0] = rtt_engine.OrderUnion.upgrade();
      }
    }
  }

  updateFactoryConstruction() {
    // STRATEGY:
    // If we have less than 3 power generators, don't spam engineers because
    //   we don't have the economy for it yet.
    // Once we have more than 3 power generators, build one engineer per unoccupied
    //   power generator.
    // Otherwise build nothing.

    const numberOfPowerGeneratorsWeOwn = this.player.units.powerGenerators.length;
    if (numberOfPowerGeneratorsWeOwn <= 3 || Math.random() < 0.5) {
      const numberOfPowerGeneratorsWeDontOwn = this.game.powerSources.filter((p) => {
        return p.structure == null || p.structure.player != this.player;
      }).length;
      const numberOfEngineersWeHave = this.player.units.engineers.length;
      const desiredNumberOfEngineers = numberOfPowerGeneratorsWeOwn <= 3 ? 3 : Math.ceil(numberOfPowerGeneratorsWeDontOwn / 2);

      if (numberOfEngineersWeHave < desiredNumberOfEngineers) {
        for (let factory of this.player.units.factories) {
          if (factory.orders.length > 0) {
            continue;
          }
          factory.orders[0] = rtt_engine.OrderUnion.constructVehicle({vehicleClass: rtt_engine.Engineer});
        }
      }
      return;
    }

    const numberOfTitans = this.player.units.vehicles.filter((v) => v instanceof rtt_engine.Titan).length;
    const numberOfEnemyTitans = this.opponents.map((o) => o.units.vehicles.filter((v) => v instanceof rtt_engine.Titan)).flat().length;
    for (let factory of this.player.units.factories) {
      if (factory.orders.length > 0) {
        continue;
      }
      const factoryOrderUnit =
        numberOfTitans < numberOfEnemyTitans && Math.random() > 0.5
        ? rtt_engine.Titan
        : rtt_engine.ShotgunTank;
      factory.orders[0] = rtt_engine.OrderUnion.constructVehicle({vehicleClass: factoryOrderUnit});
    }
  }

  updateExpansion() {
    // STRATEGY:
    // If we have no factories, build one. Get the commander to do it if still alive.
    // Any engineers without orders should go build at the nearest unoccupied or unfinished power source.
    // FUTURE IMPROVEMTN: Also, have every engineer go to the nearest capturable power source that doesn't already have
    // an engineer on the way. Any engineers left without orders should go to the nearest capturable power source.

    const powerSourcesWeOwn = this.player.units.powerGenerators.map((g) => g.powerSource);
    const powerSourcesWeDontOwn = this.game.powerSources.filter((p) => {
      return p.structure == null || (p.structure.player == this.player && !p.structure.built);
    });
    const opposingUnits = this.opponents.map((p) => p.units.allKillableCollidableUnits()).flat();
    if (opposingUnits.length == 0) {
      return;
    }

    for (let powerSourceWeOwn of powerSourcesWeOwn) {
      this.powerSourceEngineers.delete(powerSourceWeOwn);
    }
    this.powerSourceEngineers.forEach((engineers, powerSource) => {
      this.powerSourceEngineers.set(powerSource, engineers.filter((e) => e.isAlive()));
    });

    if (this.player.units.factories.length == 0 || this.player.storedEnergy > 500) {
      let factoryBuildingUnit;
      if (this.player.units.factories.length == 0) {
        factoryBuildingUnit = this.player.units.commander || this.player.units.engineers[0];
      } else {
        const constructionUnits = [];
        if (this.player.units.commander) {
          constructionUnits.push(this.player.units.commander);
        }
        constructionUnits.push(...this.player.units.engineers);
        factoryBuildingUnit = lodash.maxBy(constructionUnits, (vehicle) => {
          let nearestOpposingUnit = lodash.minBy(opposingUnits, (u) => rtt_engine.Vector.distance(u.position, vehicle.position));
          let nearestFactory = lodash.minBy(this.player.units.factories, (f) => rtt_engine.Vector.distance(f.position, vehicle.position));
          if (!nearestOpposingUnit || !nearestFactory) {
            return 10000000000000;
          }
          return rtt_engine.Vector.distance(nearestFactory.position, vehicle.position) / ( rtt_engine.Vector.distance(nearestOpposingUnit.position, vehicle.position)**3 );
        });
      }
      if (!factoryBuildingUnit) {
        return;
      }
      if (!factoryBuildingUnit.orders[0] || factoryBuildingUnit.orders[0].kind !== "construct" || factoryBuildingUnit.orders[0].structureClass != rtt_engine.Factory) {
        factoryBuildingUnit.orders[0] = rtt_engine.OrderUnion.constructStructure({structureClass: rtt_engine.Factory, position: factoryBuildingUnit.position});
      }
    }

    if (powerSourcesWeDontOwn.length > 0) {
      for (let engineer of this.player.units.engineers) {
        if (engineer.orders.length > 0) {
          continue;
        }

        const nearestDesiredPowerSource = lodash.minBy(powerSourcesWeDontOwn, (powerSource) => {
          const mult = powerSourcesWeOwn.length < 3 ? 0 : (this.powerSourceEngineers.get(powerSource)?.length ?? 0);
          return rtt_engine.Vector.distance(powerSource.position, engineer.position) * (mult + 1);
        });
        engineer.orders[0] = rtt_engine.OrderUnion.constructStructure({
          structureClass: rtt_engine.PowerGenerator,
          position: nearestDesiredPowerSource!.position,
          metadata: nearestDesiredPowerSource!,
        });
        const pre = this.powerSourceEngineers.get(nearestDesiredPowerSource!) ?? [];
        this.powerSourceEngineers.set(
          nearestDesiredPowerSource!,
          pre.concat(engineer),
        );
      }
    }

    for (let vehicle of this.player.units.vehicles) {
      if (vehicle instanceof rtt_engine.Engineer) {
        continue;
      }
      if (vehicle.orders.length > 0) {
        continue;
      }

      let nearestOpposingUnit = lodash.minBy(opposingUnits, (u: rtt_engine.IKillable) => rtt_engine.Vector.distance(u.position, vehicle.position))!;
      vehicle.orders[0] = rtt_engine.OrderUnion.attack({target: nearestOpposingUnit});
    }
  }
}
