import * as THREE from 'three';
import { Player } from '../../rtt_engine/player';
import { PowerSource } from '../../rtt_engine/entities/power_source';
import { Vector } from '../../rtt_engine/vector';
import { InstancedPresenter } from './lib';

export function powerGeneratorShape(): THREE.Shape {
  let shape = new THREE.Shape();
  shape.moveTo(0, 8);
  const bottomRight = Vector.from_magnitude_and_direction(7, 2*Math.PI/3);
  shape.lineTo(bottomRight.x, bottomRight.y);
  const bottomLeft = Vector.from_magnitude_and_direction(7, -2*Math.PI/3);
  shape.lineTo(bottomLeft.x, bottomLeft.y);
  return shape;
}

export class PowerGeneratorPresenter extends InstancedPresenter {
  constructor(player: Player, scene: THREE.Group) {
    super(
      player,
      (p) => p.units.powerGenerators,
      new THREE.ShapeBufferGeometry(powerGeneratorShape()),
      scene,
    );
  }
}
