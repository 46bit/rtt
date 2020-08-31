import * as THREE from 'three';
import { Commander } from '../../rtt_engine/entities/commander';
import { Vector } from '../../rtt_engine/vector';

export function commanderShape(): THREE.Shape {
  var shape = new THREE.Shape();
  shape.moveTo(7, -8);
  shape.lineTo(8, 7);
  shape.lineTo(3.5, 1);
  shape.lineTo(0, 8);
  shape.lineTo(-3.5, 1);
  shape.lineTo(-8, 7);
  shape.lineTo(-7, -8);
  shape.lineTo(-4, -8);
  shape.lineTo(0, -5);
  shape.lineTo(4, -8);
  return shape;
}

export class CommanderPresenter {
  commander: Commander;
  scene: THREE.Group;
  mesh?: THREE.Mesh;
  predrawn: boolean;

  constructor(commander: Commander, scene: THREE.Group) {
    this.commander = commander;
    this.scene = scene;
    this.predrawn = false;
  }

  predraw() {
    this.predrawn = true;
    const meshMaterial = new THREE.MeshBasicMaterial({ color: this.commander.player!.color });
    const commanderGeometry = new THREE.ShapeBufferGeometry(commanderShape());
    this.mesh = new THREE.Mesh(commanderGeometry, meshMaterial);
    this.scene.add(this.mesh);
  }

  draw() {
    if (this.commander.isDead()) {
      if (this.predrawn) {
        this.dedraw();
      }
      return;
    }
    if (!this.predrawn) {
      this.predraw();
    }
    this.mesh!.position.x = this.commander.position.x;
    this.mesh!.position.y = this.commander.position.y;
    this.mesh!.rotation.z = - this.commander.direction;
  }

  dedraw() {
    this.predrawn = false;
    if (this.mesh != null) {
      this.scene.remove(this.mesh!);
      this.mesh = undefined;
    }
  }
}
