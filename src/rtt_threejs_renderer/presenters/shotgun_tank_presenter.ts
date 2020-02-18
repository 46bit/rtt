import * as THREE from 'three';
import { Player } from '../../rtt_engine/player';
import { ShotgunTank, ShotgunProjectile } from '../../rtt_engine/entities';
import { InstancedRotateablePresenter } from './lib';

export function shotgunTankShape(): THREE.Shape {
  var shape = new THREE.Shape();
  shape.moveTo(8, 0);
  const closeness = 0.8;
  shape.absarc(0, 0, 8, closeness * Math.PI, -closeness * Math.PI, true);
  shape.absarc(0, 0, 4.5, -closeness * Math.PI, closeness * Math.PI, true);
  return shape;
}

export class ShotgunTankPresenter extends InstancedRotateablePresenter {
  constructor(player: Player, scene: THREE.Group) {
    super(
      player,
      (p) => p.units.vehicles.filter(v => v instanceof ShotgunTank),
      new THREE.ShapeBufferGeometry(shotgunTankShape()),
      scene,
    );
  }
}

export function shotgunProjectileShape(): THREE.Shape {
  var shape = new THREE.Shape();
  shape.moveTo(-3, -1);
  shape.lineTo(-3, 1);
  shape.lineTo(3, 1.2);
  shape.lineTo(3, -1.2);
  return shape;
}

export class ShotgunProjectilePresenter extends InstancedRotateablePresenter {
  constructor(player: Player, scene: THREE.Group) {
    super(
      player,
      (p) => p.turretProjectiles.filter(v => v instanceof ShotgunProjectile),
      new THREE.ShapeBufferGeometry(shotgunProjectileShape()),
      scene,
    );
  }
}
