import * as THREE from 'three';
import { Player } from '../../rtt_engine/player';
import { IFactory } from '../../rtt_engine/entities/factory';
import { Vector } from '../../rtt_engine/vector';
import { InstancedGeometryPresenter } from './lib';

import structure_vert from '../shaders/structure_vert.glsl.js';
import structure_frag from '../shaders/structure_frag.glsl.js';

export function factoryShape(): THREE.Shape {
  var shape = new THREE.Shape();
  shape.moveTo(15, -15);
  shape.lineTo(15, -4);
  shape.lineTo(19, 0);
  shape.lineTo(15, 4);

  shape.lineTo(15, 15);
  shape.lineTo(4, 15);
  shape.lineTo(0, 19);
  shape.lineTo(-4, 15);

  shape.lineTo(-15, 15);
  shape.lineTo(-15, 4);
  shape.lineTo(-19, 0);
  shape.lineTo(-15, -4);

  shape.lineTo(-15, -15);
  shape.lineTo(-4, -15);
  shape.lineTo(0, -19);
  shape.lineTo(4, -15);
  return shape;
}

export class FactoryPresenter extends InstancedGeometryPresenter {
  player: Player;

  constructor(player: Player, scene: THREE.Group) {
    const geometry = new THREE.ShapeBufferGeometry(factoryShape());
    const material = new THREE.ShaderMaterial({
      vertexShader: structure_vert,
      fragmentShader: structure_frag,
      blending: THREE.NoBlending,
    });
    super(geometry, material, scene);
    this.player = player;
  }

  getInstances(): {position: Vector, direction?: number, player: Player | null}[] {
    return this.player.units.factories;
  }
}
