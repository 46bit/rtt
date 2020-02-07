import * as THREE from 'three';
import { Player } from '../../rtt_engine/player';
import { ShotgunTank, ShotgunProjectile } from '../../rtt_engine/entities';
import { InstancedRotateablePresenter } from './lib';

export function shotgunTankShape(): THREE.Shape {
  var shape = new THREE.Shape();
  shape.moveTo(8, 0);
  const closeness = 0.8;
  shape.ellipse(-8, 0, 8, 8, 0, Math.PI * closeness * 2, false, -Math.PI * closeness);
  shape.lineTo(-0.5, 0);
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
