import * as THREE from 'three';
import { Player } from '../../rtt_engine/player';
import { PowerSource } from '../../rtt_engine/entities/power_source';
import { Vector } from '../../rtt_engine/vector';

export function turretShape(): THREE.Shape {
  let shape = new THREE.Shape();
  shape.moveTo(0, 8);
  const bottomRight = Vector.from_magnitude_and_direction(7, 2*Math.PI/3);
  shape.lineTo(bottomRight.x, bottomRight.y);
  const bottomLeft = Vector.from_magnitude_and_direction(7, -2*Math.PI/3);
  shape.lineTo(bottomLeft.x, bottomLeft.y);
  return shape;
}

export class TurretPresenter {
  player: Player;
  scene: THREE.Group;
  meshMaterial?: THREE.Material;
  geometry?: THREE.BufferGeometry;
  instancedMesh?: THREE.InstancedMesh;

  constructor(player: Player, scene: THREE.Group) {
    this.player = player;
    this.scene = scene;
  }

  predraw() {
    this.meshMaterial = new THREE.MeshBasicMaterial({ color: this.player.color });
    this.geometry = new THREE.ShapeBufferGeometry(turretShape());
  }

  draw() {
    const count = this.player.units.turrets.length;
    if (this.instancedMesh != undefined && this.instancedMesh.count != count) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh = undefined;
    }
    if (this.instancedMesh == undefined) {
      this.instancedMesh = new THREE.InstancedMesh(this.geometry!, this.meshMaterial!, count);
      this.instancedMesh.count = count;
      this.instancedMesh.frustumCulled = false;
      this.scene.add(this.instancedMesh);
    }
    let m = new THREE.Matrix4();
    for (let i = 0; i < count; i++) {
      const turret = this.player.units.turrets[i];
      m.setPosition(turret.position.x, turret.position.y, 0);
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
