import * as THREE from 'three';
import { Commander } from '../../rtt_engine/entities/commander';
import { Vector } from '../../rtt_engine/vector';

export class CommanderPresenter {
  commander: Commander;
  scene: THREE.Group;
  circle?: THREE.Mesh;
  line?: THREE.Mesh;
  predrawn: boolean;

  constructor(commander: Commander, scene: THREE.Group) {
    this.commander = commander;
    this.scene = scene;
    this.predrawn = false;
  }

  predraw() {
    return;
    this.predrawn = true;
    const meshMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(
        this.commander.player!.color.r,
        this.commander.player!.color.g,
        this.commander.player!.color.b,
      ),
    });
    const circleGeometry = new THREE.CircleGeometry(this.commander.collisionRadius);
    this.circle = new THREE.Mesh(circleGeometry, meshMaterial);
    this.scene.add(this.circle);

    const lineMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0, 0, 0),
    });
    let lineGeometry = new THREE.CircleGeometry(this.commander.collisionRadius / 1.2);
    this.line = new THREE.Mesh(lineGeometry, lineMaterial);
    this.line.position.z = 0.1;
    this.scene.add(this.line);
  }

  draw() {
    return;
    if (!this.predrawn) {
      this.predraw();
    }
    this.circle!.position.x = this.commander.position.x;
    this.circle!.position.y = this.commander.position.y;
    this.line!.position.x = this.commander.position.x + this.commander.collisionRadius / 1.5;// + this.bot.collisionRadius;
    this.line!.position.y = this.commander.position.y;// + this.bot.collisionRadius;
  }

  dedraw() {
    return;
    this.predrawn = false;
    this.scene.remove(this.circle!);
    this.scene.remove(this.line!);
    this.circle = undefined;
    this.line = undefined;
  }
}
