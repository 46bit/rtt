import * as THREE from 'three';
import { Player } from '../../rtt_engine/player';
import { TurretProjectile } from '../../rtt_engine/entities/turret';
import { Vector } from '../../rtt_engine/vector';

export function turretProjectileShape(): THREE.Shape {
  var shape = new THREE.Shape();
  shape.moveTo(4, 0);
  shape.quadraticCurveTo(4, 4, -4, 0);
  shape.quadraticCurveTo(4, -4, 4, 0);
  return shape;
}

export class TurretProjectilePresenter {
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
    this.geometry = new THREE.ShapeBufferGeometry(turretProjectileShape());
  }

  draw() {
    const projectiles = this.player.turretProjectiles.filter(v => v instanceof TurretProjectile),;
    const count = projectiles.length;
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
      const turretProjectile = projectiles[i];
      m.makeRotationZ(Math.PI/2 - turretProjectile.direction);
      m.setPosition(turretProjectile.position.x, turretProjectile.position.y, 0);
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
