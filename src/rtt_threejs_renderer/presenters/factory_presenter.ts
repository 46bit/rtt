import * as THREE from 'three';
import { Player } from '../../rtt_engine/player';
import { Factory } from '../../rtt_engine/entities/factory';
import { Vector } from '../../rtt_engine/vector';

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

export class FactoryPresenter {
  player: Player;
  scene: THREE.Group;
  meshMaterial?: THREE.Material;
  factoryGeometry?: THREE.BufferGeometry;
  instancedMesh?: THREE.InstancedMesh;

  constructor(player: Player, scene: THREE.Group) {
    this.player = player;
    this.scene = scene;
  }

  predraw() {
    this.meshMaterial = new THREE.MeshBasicMaterial({ color: this.player.color });
    this.factoryGeometry = new THREE.ShapeBufferGeometry(factoryShape());
  }

  draw() {
    const numberOfFactories = this.player.units.factories.length;
    if (this.instancedMesh != undefined && this.instancedMesh.count != numberOfFactories) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh = undefined;
    }
    if (this.instancedMesh == undefined) {
      this.instancedMesh = new THREE.InstancedMesh(this.factoryGeometry!, this.meshMaterial!, numberOfFactories);
      this.instancedMesh.count = numberOfFactories;
      this.instancedMesh.frustumCulled = false;
      this.scene.add(this.instancedMesh);
    }
    let m = new THREE.Matrix4();
    for (let i = 0; i < numberOfFactories; i++) {
      const factory = this.player.units.factories[i];
      m.setPosition(factory.position.x, factory.position.y, 0);
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
