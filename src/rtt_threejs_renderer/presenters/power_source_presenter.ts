import * as THREE from 'three';
import { Game } from '../../rtt_engine/game';
import { PowerSource } from '../../rtt_engine/entities/power_source';
import { Vector } from '../../rtt_engine/vector';

export function powerSourceShape(): THREE.Shape {
  var shape = new THREE.Shape();
  shape.moveTo(0, 7);
  const bottomRight = Vector.from_magnitude_and_direction(7, 2*Math.PI/3);
  shape.lineTo(bottomRight.x, bottomRight.y);
  const bottomLeft = Vector.from_magnitude_and_direction(7, -2*Math.PI/3);
  shape.lineTo(bottomLeft.x, bottomLeft.y);
  return shape;
}

export class PowerSourcePresenter {
  game: Game;
  scene: THREE.Group;
  meshMaterial?: THREE.Material;
  powerSourceGeometry?: THREE.BufferGeometry;
  instancedMesh?: THREE.InstancedMesh;

  constructor(game: Game, scene: THREE.Group) {
    this.game = game;
    this.scene = scene;
  }

  predraw() {
    this.meshMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xffffff),
    });
    this.powerSourceGeometry = new THREE.ShapeBufferGeometry(powerSourceShape());
  }

  draw() {
    const unoccupiedPowerSources = this.game.powerSources.filter((p) => p.structure == null);
    const numberOfUnoccupiedPowerSources = unoccupiedPowerSources.length;
    if (this.instancedMesh != undefined && this.instancedMesh.count != numberOfUnoccupiedPowerSources) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh = undefined;
    }
    if (this.instancedMesh == undefined) {
      this.instancedMesh = new THREE.InstancedMesh(this.powerSourceGeometry!, this.meshMaterial!, numberOfUnoccupiedPowerSources);
      this.instancedMesh.count = numberOfUnoccupiedPowerSources;
      this.instancedMesh.frustumCulled = false;
      this.scene.add(this.instancedMesh);
    }
    let m = new THREE.Matrix4();
    for (let i = 0; i < numberOfUnoccupiedPowerSources; i++) {
      const unoccupiedPowerSource = unoccupiedPowerSources[i];
      m.setPosition(unoccupiedPowerSource.position.x, unoccupiedPowerSource.position.y, 0);
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
