import * as THREE from 'three';
import { Player, Vector } from '../../rtt_engine';
import { ShotgunTank, ShotgunProjectile } from '../../rtt_engine/entities';
import { InstancedGeometryPresenter } from './lib';

import vehicle_vert from '../shaders/vehicle_vert.glsl.js';
import vehicle_frag from '../shaders/vehicle_frag.glsl.js';

export function shotgunTankShape(): THREE.Shape {
  var shape = new THREE.Shape();
  shape.moveTo(8, 0);
  const closeness = 0.8;
  shape.absarc(0, 0, 8, closeness * Math.PI, -closeness * Math.PI, true);
  shape.absarc(0, 0, 4.5, -closeness * Math.PI, closeness * Math.PI, true);
  return shape;
}

export class ShotgunTankPresenter extends InstancedGeometryPresenter {
  player: Player;

  constructor(player: Player, scene: THREE.Group) {
    const geometry = new THREE.ShapeBufferGeometry(shotgunTankShape());
    const material = new THREE.ShaderMaterial({
      vertexShader: vehicle_vert,
      fragmentShader: vehicle_frag,
      blending: THREE.NoBlending,
    });
    super(geometry, material, scene);
    this.player = player;
  }

  getInstances(): ShotgunTank[] {
    return this.player.units.vehicles.filter(v => v instanceof ShotgunTank) as ShotgunTank[];
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

export class ShotgunProjectilePresenter extends InstancedGeometryPresenter {
  player: Player;

  constructor(player: Player, scene: THREE.Group) {
    const geometry = new THREE.ShapeBufferGeometry(shotgunProjectileShape());
    const material = new THREE.ShaderMaterial({
      vertexShader: vehicle_vert,
      fragmentShader: vehicle_frag,
      blending: THREE.NoBlending,
    });
    super(geometry, material, scene);
    this.player = player;
  }

  getInstances(): ShotgunProjectile[] {
    return this.player.turretProjectiles.filter(v => v instanceof ShotgunProjectile);
  }
}
