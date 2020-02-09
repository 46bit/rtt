import * as THREE from 'three';
import { Player } from '../../rtt_engine/player';
import { Titan, TitanProjectile } from '../../rtt_engine/entities';
import { InstancedRotateablePresenter } from './lib';

export function titanShape(): THREE.Shape {
  var shape = new THREE.Shape();
  shape.moveTo(16, 0);
  const closeness = 0.8;
  shape.ellipse(-16, 0, 16, 16, 0, Math.PI * closeness * 2, false, -Math.PI * closeness);
  shape.lineTo(-0.5, 0);
  return shape;
}

export class TitanPresenter extends InstancedRotateablePresenter {
  constructor(player: Player, scene: THREE.Group) {
    super(
      player,
      (p) => p.units.vehicles.filter(v => v instanceof Titan),
      new THREE.ShapeBufferGeometry(titanShape()),
      scene,
    );
  }
}

export function titanProjectileShape(): THREE.Shape {
  var shape = new THREE.Shape();
  shape.moveTo(-3, -1);
  shape.lineTo(-3, 1);
  shape.lineTo(3, 1.2);
  shape.lineTo(3, -1.2);
  return shape;
}

export class TitanProjectilePresenter extends InstancedRotateablePresenter {
  constructor(player: Player, scene: THREE.Group) {
    super(
      player,
      (p) => p.turretProjectiles.filter(v => v instanceof TitanProjectile),
      new THREE.ShapeBufferGeometry(titanProjectileShape()),
      scene,
    );
  }
}
