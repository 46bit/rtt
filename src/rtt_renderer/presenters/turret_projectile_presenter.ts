import * as THREE from 'three';
import { Player } from '../../rtt_engine/player';
import { TurretProjectile } from '../../rtt_engine/entities/turret';
import { Vector } from '../../rtt_engine/vector';
import { InstancedGeometryPresenter } from './lib';

import vehicle_vert from '../shaders/vehicle_vert.glsl.js';
import vehicle_frag from '../shaders/vehicle_frag.glsl.js';

export function turretProjectileShape(): THREE.Shape {
  var shape = new THREE.Shape();
  shape.moveTo(-4, 0);
  shape.quadraticCurveTo(-4, 4, 4, 0);
  shape.quadraticCurveTo(-4, -4, -4, 0);
  return shape;
}

export class TurretProjectilePresenter extends InstancedGeometryPresenter {
  player: Player;

  constructor(player: Player, scene: THREE.Group) {
    const geometry = new THREE.ShapeBufferGeometry(turretProjectileShape());
    const material = new THREE.ShaderMaterial({
      vertexShader: vehicle_vert,
      fragmentShader: vehicle_frag,
      blending: THREE.NoBlending,
    });
    super(geometry, material, scene);
    this.player = player;
  }

  getInstances(): TurretProjectile[] {
    return this.player.turretProjectiles.filter(v => v instanceof TurretProjectile);
  }
}
