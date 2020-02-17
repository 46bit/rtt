import * as THREE from 'three';
import { Player } from '../../rtt_engine/player';
import { Factory } from '../../rtt_engine/entities/factory';
import { Vector } from '../../rtt_engine/vector';
import { InstancedPresenter } from './lib';

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

export class FactoryPresenter extends InstancedPresenter {
  constructor(player: Player, scene: THREE.Group) {
    super(
      player,
      (p) => p.units.factories,
      new THREE.ShapeBufferGeometry(factoryShape()),
      scene,
    );
  }
}
