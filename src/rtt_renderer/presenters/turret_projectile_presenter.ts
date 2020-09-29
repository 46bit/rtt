import * as THREE from 'three';
import { Player } from '../../rtt_engine/player';
import { ITurretProjectile } from '../../rtt_engine/entities/turret';
import { Vector } from '../../rtt_engine/vector';
import { InstancedRotateablePresenter } from './lib';

export function turretProjectileShape(): THREE.Shape {
  var shape = new THREE.Shape();
  shape.moveTo(-4, 0);
  shape.quadraticCurveTo(-4, 4, 4, 0);
  shape.quadraticCurveTo(-4, -4, -4, 0);
  return shape;
}

export class TurretProjectilePresenter extends InstancedRotateablePresenter {
  constructor(player: Player, scene: THREE.Group) {
    super(
      player,
      (p) => p.turretProjectiles.filter(v => v.kind == "turretProjectile"),
      new THREE.ShapeBufferGeometry(turretProjectileShape()),
      scene,
    );
  }
}
