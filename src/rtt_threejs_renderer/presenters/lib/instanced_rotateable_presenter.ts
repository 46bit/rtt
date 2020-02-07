import * as THREE from 'three';
import { Player } from '../../../rtt_engine/player';
import { IMovable } from '../../../rtt_engine/entities';
import { Vector } from '../../../rtt_engine/vector';

export class InstancedRotateablePresenter {
  player: Player;
  instanceCallback: (player: Player) => IMovable[];
  scene: THREE.Group;
  material?: THREE.Material;
  geometry?: THREE.BufferGeometry;
  instancedMesh?: THREE.InstancedMesh;

  constructor(player: Player, instanceCallback: (player: Player) => IMovable[], geometry: THREE.BufferGeometry, scene: THREE.Group) {
    this.player = player;
    this.instanceCallback = instanceCallback;
    this.geometry = geometry;
    this.scene = scene;
    this.material = new THREE.MeshBasicMaterial({ color: this.player.color });
  }

  predraw() { }

  draw() {
    const instances = this.instanceCallback(this.player);
    const instanceCount = instances.length;
    if (this.instancedMesh != undefined && this.instancedMesh.count != instanceCount) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh = undefined;
    }
    if (this.instancedMesh == undefined) {
      this.instancedMesh = new THREE.InstancedMesh(this.geometry!, this.material!, instanceCount);
      this.instancedMesh.count = instanceCount;
      this.instancedMesh.frustumCulled = false;
      this.scene.add(this.instancedMesh);
    }
    let m = new THREE.Matrix4();
    for (let i = 0; i < instanceCount; i++) {
      const instance = instances[i];
      m.makeRotationZ(-Math.PI/2 - instance.direction);
      m.setPosition(instance.position.x, instance.position.y, 0);
      this.instancedMesh.setMatrixAt(i, m);
    }
    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

  dedraw() {
    if (this.instancedMesh) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh = undefined;
    }
  }
}
