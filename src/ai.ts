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
      this.player.units.commander.orders[0] = {
        kind: 'construct',
        structureClass: rtt_engine.Factory,
        position: new rtt_engine.Vector(
          this.player.units.commander.position.x,
          this.player.units.commander.position.y,
        ),
      };
    }

    for (let factory of this.player.units.factories) {
      if (factory.orders.length > 0) {
        continue;
      }
      factory.orders[0] = {
        kind: 'construct',
        unitClass: Math.random() < 0.6 ? rtt_engine.Bot : (Math.random() < 0.7 ? rtt_engine.ShotgunTank : rtt_engine.ArtilleryTank),
      };
    }

    const opponent = this.opponents[0];
    const opposingUnits = opponent.units.allKillableCollidableUnits();
    const opposingUnitCount = opposingUnits.length;
    if (opposingUnitCount > 0) {
      for (let j in this.player.units.vehicles) {
        if (this.player.units.vehicles[j].orders.length > 0) {
          continue;
        }
        const target = opposingUnits[j % opposingUnitCount];
        this.player.units.vehicles[j].orders[0] = { kind: 'attack', target: target };
      }
    }
  }
}
