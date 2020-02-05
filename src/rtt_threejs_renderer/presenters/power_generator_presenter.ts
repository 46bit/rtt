import * as THREE from 'three';
import { Player } from '../../rtt_engine/player';
import { PowerSource } from '../../rtt_engine/entities/power_source';
import { Vector } from '../../rtt_engine/vector';

export function powerGeneratorShape(): THREE.Shape {
  let shape = new THREE.Shape();
  shape.moveTo(0, 8);
  const bottomRight = Vector.from_magnitude_and_direction(7, 2*Math.PI/3);
  shape.lineTo(bottomRight.x, bottomRight.y);
  const bottomLeft = Vector.from_magnitude_and_direction(7, -2*Math.PI/3);
  shape.lineTo(bottomLeft.x, bottomLeft.y);
  return shape;
}

export class PowerGeneratorPresenter {
  player: Player;
  scene: THREE.Group;
  meshMaterial?: THREE.Material;
  powerGeneratorGeometry?: THREE.BufferGeometry;
  instancedMesh?: THREE.InstancedMesh;

  constructor(player: Player, scene: THREE.Group) {
    this.player = player;
    this.scene = scene;
  }

  predraw() {
    this.meshMaterial = new THREE.MeshBasicMaterial({ color: this.player.color });
    this.powerGeneratorGeometry = new THREE.ShapeBufferGeometry(powerGeneratorShape());
  }

  draw() {
    const numberOfPowerGenerators = this.player.units.powerGenerators.length;
    if (this.instancedMesh != undefined && this.instancedMesh.count != numberOfPowerGenerators) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh = undefined;
    }
    if (this.instancedMesh == undefined) {
      this.instancedMesh = new THREE.InstancedMesh(this.powerGeneratorGeometry!, this.meshMaterial!, numberOfPowerGenerators);
      this.instancedMesh.count = numberOfPowerGenerators;
      this.instancedMesh.frustumCulled = false;
      this.scene.add(this.instancedMesh);
    }
    let m = new THREE.Matrix4();
    for (let i = 0; i < numberOfPowerGenerators; i++) {
      const powerGenerator = this.player.units.powerGenerators[i];
      m.setPosition(powerGenerator.position.x, powerGenerator.position.y, 0);
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
