import * as THREE from 'three';
import { Obstruction } from '../../rtt_engine/entities';
import { Vector } from '../../rtt_engine/vector';
import { Game } from '../../rtt_engine';

export function obstructionShape(): THREE.Shape {
  var shape = new THREE.Shape();
  shape.moveTo(-0.5, -0.5);
  shape.lineTo(0.5, -0.5);
  shape.lineTo(0.5, 0.5);
  shape.lineTo(-0.5, 0.5);
  return shape;
}

export class ObstructionPresenter {
  game: Game;
  scene: THREE.Group;
  material?: THREE.Material;
  geometry?: THREE.BufferGeometry;
  instancedMesh?: THREE.InstancedMesh;

  constructor(game: Game, scene: THREE.Group) {
    this.game = game;
    this.scene = scene;
    this.material = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x202020) });
    this.geometry = new THREE.ShapeBufferGeometry(obstructionShape());
  }

  predraw() { }

  draw() {
    const instances = this.game.obstructions;
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
      m.makeScale(instance.right - instance.left, instance.bottom - instance.top, 1);
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
