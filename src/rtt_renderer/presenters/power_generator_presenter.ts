import * as THREE from 'three';
import { Player } from '../../rtt_engine/player';
import { PowerSource } from '../../rtt_engine/entities/power_source';
import { Vector } from '../../rtt_engine/vector';
import { InstancedGeometryPresenter } from './lib';

import structure_vert from '../shaders/structure_vert.glsl.js';
import structure_frag from '../shaders/structure_frag.glsl.js';

export function powerGeneratorShape(): THREE.Shape {
  let shape = new THREE.Shape();
  shape.moveTo(0, 8);
  const bottomRight = Vector.from_magnitude_and_direction(7, 2*Math.PI/3);
  shape.lineTo(bottomRight.x, bottomRight.y);
  const bottomLeft = Vector.from_magnitude_and_direction(7, -2*Math.PI/3);
  shape.lineTo(bottomLeft.x, bottomLeft.y);
  return shape;
}

export class PowerGeneratorPresenter extends InstancedGeometryPresenter {
  player: Player;

  constructor(player: Player, scene: THREE.Group) {
    const geometry = new THREE.ShapeBufferGeometry(powerGeneratorShape());
    const material = new THREE.ShaderMaterial({
      vertexShader: structure_vert,
      fragmentShader: structure_frag,
      blending: THREE.NoBlending,
    });
    super(geometry, material, scene);
    this.player = player;
  }

  getInstances(): {position: Vector, direction?: number, player: Player | null}[] {
    return this.player.units.powerGenerators;
  }
}
