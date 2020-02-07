import * as THREE from 'three';
import { Player } from '../../rtt_engine/player';
import { ArtilleryTank, ArtilleryProjectile } from '../../rtt_engine/entities';
import { InstancedRotateablePresenter } from './lib';

export function artilleryTankShape(): THREE.Shape {
  var shape = new THREE.Shape();
  shape.moveTo(-4, 0);
  shape.lineTo(-8, -8);
  shape.lineTo(8, -8);
  shape.lineTo(8, 8);
  shape.lineTo(-8, 8);
  return shape;
}

export class ArtilleryTankPresenter extends InstancedRotateablePresenter {
  constructor(player: Player, scene: THREE.Group) {
    super(
      player,
      (p) => p.units.vehicles.filter(v => v instanceof ArtilleryTank),
      new THREE.ShapeBufferGeometry(artilleryTankShape()),
      scene,
    );
  }
}

export function artilleryProjectileShape(): THREE.Shape {
  var shape = new THREE.Shape();
  shape.moveTo(-5, 0);
  shape.lineTo(-2.5, 1.5);
  shape.lineTo(5, 2);
  shape.lineTo(5, -2);
  shape.lineTo(-2.5, -1.5);
  return shape;
}

export class ArtilleryProjectilePresenter extends InstancedRotateablePresenter {
  constructor(player: Player, scene: THREE.Group) {
    super(
      player,
      (p) => p.turretProjectiles.filter(v => v instanceof ArtilleryProjectile),
      new THREE.ShapeBufferGeometry(artilleryProjectileShape()),
      scene,
    );
  }
}
