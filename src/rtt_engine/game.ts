import { PowerSource, Obstruction, Engineer, Projectile, IKillable, ICollidable, IOwnable, IEntityUpdateContext } from './entities';
import { Player } from './player';
import { Bounds, IQuadrant } from './quadtree';
import { IAI } from '../ai';

export class Game {
  bounds: Bounds;
  powerSources: readonly PowerSource[];
  players: readonly Player[];
  ais: readonly IAI[];
  sandbox: boolean;
  updateCounter: number;
  winner: string | null;
  winTime: Date | null;
  obstructions: Obstruction[];
  obstructionQuadtree: IQuadrant<ICollidable>;
  quadtree: IQuadrant<ICollidable & IKillable & IOwnable>;

  constructor(bounds: Bounds, powerSources: readonly PowerSource[], players: readonly Player[], obstructions: Obstruction[], sandbox = false) {
    this.bounds = bounds;
    this.powerSources = powerSources;
    this.players = players;
    this.ais = [];
    this.sandbox = sandbox;
    this.updateCounter = 0;
    this.winner = null;
    this.winTime = null;
    this.obstructions = obstructions;

    this.obstructionQuadtree = IQuadrant.fromEntityCollisions(bounds, this.obstructions as ICollidable[]);
    this.quadtree = IQuadrant.fromEntityCollisions(this.bounds, [] as (ICollidable & IKillable & IOwnable)[]);
  }

  update(context: IEntityUpdateContext) {
    this.updateCounter += 1;

    window.profiler.time("update_damaging_collisions", () => {
      this.updateDamagingCollisions();
    });
    window.profiler.time("update_ais", () => {
      this.updateAIs();
    });
    window.profiler.time("update_players", () => {
      this.updatePlayers(context);
    });
    window.profiler.time("update_obstruction_collisions", () => {
      this.updateObstructionCollisions();
    });
    if (!this.winner) {
      this.updateWinner();
    }
  }

  updateDamagingCollisions() {
    let livingPlayers: Player[] = [];
    let unitsAndProjectiles: (IKillable & ICollidable & IOwnable)[] = [];
    window.profiler.time("update_damaging_collisions_join", () => {
      livingPlayers = this.players.filter((p) => !p.isDefeated());
      unitsAndProjectiles = livingPlayers.map((p) => p.units.allKillableCollidableUnits()).flat();
    });
    unitsAndProjectiles.push(...this.players.map((p) => p.turretProjectiles).flat());

    window.profiler.time("update_damaging_collisions_bounds", () => {
      for (let unitOrProjectile of unitsAndProjectiles) {
        if (!this.bounds.contains(unitOrProjectile, () => 0)) {
          unitOrProjectile.kill();
        }
      }
    });

    let quadtree: IQuadrant<ICollidable & IKillable & IOwnable>;
    window.profiler.time("update_damaging_collisions_build_quadtree", () => {
      quadtree = IQuadrant.fromEntityCollisions(this.bounds, unitsAndProjectiles, 10);
    });
    this.quadtree = quadtree!;
    let unitOriginalHealths: {[id: string]: number} = {};
    window.profiler.time("update_damaging_collisions_original_healths", () => {
      for (let unit of unitsAndProjectiles) {
        if (unit.damage != null) {
          // FIXME: I have no idea why this code varies for engineers
          unitOriginalHealths[unit.id] = (unit instanceof Engineer) ? unit.health / 6 : unit.health;
        }
      }
    });

    let collisions: ReturnType<typeof quadtree.getCollisions>;
    window.profiler.time("update_damaging_collisions_get_collisions", () => {
      collisions = this.quadtree.getCollisions(unitsAndProjectiles);
    });
    window.profiler.time("update_damaging_collisions_apply_collisions", () => {
      for (let unitId in collisions!) {
        const unit: IKillable = unitsAndProjectiles.filter((u: IKillable) => u.id == unitId)[0];
        let unitCollisions = collisions[unitId];
        if (unit instanceof Projectile) {
          unitCollisions = unitCollisions.filter((u: IKillable) => !(u instanceof Projectile));
        }
        const numberOfCollidingUnits = unitCollisions.length;
        if (numberOfCollidingUnits == 0) {
          continue;
        }
        // FIXME: We need to only apply damage if it fulfils IKillable…
        const damagePerCollidingUnit = unitOriginalHealths[unitId] / numberOfCollidingUnits;
        for (let collidingUnit of unitCollisions) {
          if (collidingUnit.damage != null) {
            collidingUnit.damage(damagePerCollidingUnit);
          }
        }
      }
    });
  }

  updateAIs() {
    for (let ai of this.ais) {
      if (!ai.player.isDefeated()) {
        ai.update();
      }
    }
  }

  updatePlayers(context: IEntityUpdateContext) {
    this.players.forEach((player) => {
      player.update(this.powerSources, this.players.filter((p) => p != player), context);
    });
  }

  updateWinner() {
    const undefeatedPlayers = this.players.filter((player) => !player.isDefeated());
    switch (undefeatedPlayers.length) {
      case 0:
        this.winner = 'nobody';
        this.winTime = new Date();
        break;
      case 1:
        this.winner = undefeatedPlayers[0].name;
        this.winTime = new Date();
        break;
    }
  }

  updateObstructionCollisions() {
    let livingPlayers = this.players.filter((p) => !p.isDefeated());
    const units = livingPlayers.map((p) => p.units.allKillableCollidableUnits()).flat();
    const obstructionCollisions = this.obstructionQuadtree.getCollisions(units);
    for (let unitId in obstructionCollisions) {
      const unitOrProjectile = units.filter((u: IKillable) => u.id == unitId)[0];
      if (unitOrProjectile.dead) {
        continue;
      }
      for (let obstruction of obstructionCollisions[unitId]) {
        (obstruction as Obstruction).collide(unitOrProjectile);
      }
    }
  }
}
