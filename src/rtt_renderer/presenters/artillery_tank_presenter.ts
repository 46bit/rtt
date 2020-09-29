import * as THREE from 'three';
import { Player, Vector } from '../../rtt_engine';
import { IArtilleryTank, IArtilleryTankProjectile } from '../../rtt_engine/entities';
import { InstancedGeometryPresenter } from './lib';

import vehicle_vert from '../shaders/vehicle_vert.glsl.js';
import vehicle_frag from '../shaders/vehicle_frag.glsl.js';

export function artilleryTankShape(): THREE.Shape {
  var shape = new THREE.Shape();
  shape.moveTo(-4, 0);
  shape.lineTo(-8, -8);
  shape.lineTo(8, -8);
  shape.lineTo(8, 8);
  shape.lineTo(-8, 8);
  return shape;
}

export class ArtilleryTankPresenter extends InstancedGeometryPresenter {
  player: Player;

  constructor(player: Player, scene: THREE.Group) {
    const geometry = new THREE.ShapeBufferGeometry(artilleryTankShape());
    const material = new THREE.ShaderMaterial({
      vertexShader: vehicle_vert,
      fragmentShader: vehicle_frag,
      blending: THREE.NoBlending,
    });
    super(geometry, material, scene);
    this.player = player;
  }

  getInstances(): {position: Vector, direction: number, player: Player | null}[] {
    return this.player.units.vehicles.filter(v => v.kind == "artilleryTank");
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

export class ArtilleryProjectilePresenter extends InstancedGeometryPresenter {
  player: Player;

  constructor(player: Player, scene: THREE.Group) {
    const geometry = new THREE.ShapeBufferGeometry(artilleryProjectileShape());
    const material = new THREE.ShaderMaterial({
      vertexShader: vehicle_vert,
      fragmentShader: vehicle_frag,
      blending: THREE.NoBlending,
    });
    super(geometry, material, scene);
    this.player = player;
  }

  getInstances(): {position: Vector, direction: number, player: Player | null}[] {
    return this.player.turretProjectiles.filter(v => v.kind == "artilleryTankProjectile");
  }
}
