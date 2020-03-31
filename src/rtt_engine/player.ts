import { PowerSource, TurretProjectile } from './entities/index';
import { PlayerUnits } from './player_units';
import lodash from 'lodash';
import * as THREE from 'three';

export class Player {
  public name: string;
  public color: THREE.Color;
  public units: PlayerUnits;
  public turretProjectiles: TurretProjectile[];

  constructor(name: string, color: THREE.Color, units: PlayerUnits) {
    this.name = name;
    this.color = color;
    this.units = units;
    this.turretProjectiles = [];
  }

  public isDefeated() {
    return this.units.unitCount() === 0;
  }

  public update(otherPlayers: readonly Player[]) {
    const enemies = otherPlayers.map((p) => p.units.allKillableCollidableUnits()).flat();
    this.units.update(enemies);
    for (let turretProjectile of this.turretProjectiles) {
      turretProjectile.update();
    }
    this.turretProjectiles = this.turretProjectiles.filter((turretProjectile) => turretProjectile.isAlive());
  }

  public draw() {
    this.units.draw();
  }
}
