import * as THREE from 'three';
import { Player } from '../../rtt_engine/player';
import { Bot } from '../../rtt_engine/entities';
import { InstancedRotateablePresenter } from './lib';

export class BotPresenter extends InstancedRotateablePresenter {
  constructor(player: Player, scene: THREE.Group) {
    super(
      player,
      (p) => p.units.vehicles.filter(v => v instanceof Bot),
      new THREE.PlaneBufferGeometry(10, 10),
      scene,
    );

    const texture = new THREE.TextureLoader().load('assets/coronavirus-128.png');
    // texture.wrapS = THREE.RepeatWrapping;
    // texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.x = 1;
    texture.repeat.y = 1;
    texture.offset.x = 0;
    texture.offset.y = 0;
    //texture.repeat.set(0.5, 1);
    this.material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    //this.material.skinning = true;
    //this.material.transparent = true;
  }
}
