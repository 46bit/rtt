import * as THREE from 'three';
import { Player } from '../../rtt_engine/player';
import { Bot } from '../../rtt_engine/entities';
import { InstancedRotateablePresenter } from './lib';

export function botShape(): THREE.Shape {
  var shape = new THREE.Shape();
  shape.moveTo(5, 0);
  const closeness = 0.8;
  shape.ellipse(-5, 0, 5, 5, 0, Math.PI * closeness * 2, false, -Math.PI * closeness);
  shape.lineTo(-0.5, 0);
  return shape;
}

export class BotPresenter extends InstancedRotateablePresenter {
  constructor(player: Player, scene: THREE.Group) {
    super(
      player,
      (p) => p.units.vehicles.filter(v => v instanceof Bot),
      new THREE.ShapeBufferGeometry(botShape()),
      scene,
    );
  }
}
