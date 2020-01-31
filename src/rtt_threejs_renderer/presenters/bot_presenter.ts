import * as THREE from 'three';
import { Bot } from '../../rtt_engine/entities/bot';
import { Vector } from '../../rtt_engine/vector';

export class BotPresenter {
  bot: Bot;
  scene: THREE.Group;
  circle?: THREE.Mesh;
  line?: THREE.Mesh;
  predrawn: boolean;

  constructor(bot: Bot, scene: THREE.Group) {
    this.bot = bot;
    this.scene = scene;
    this.predrawn = false;
  }

  predraw() {
    this.predrawn = true;
    const meshMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(
        this.bot.player!.color.r,
        this.bot.player!.color.g,
        this.bot.player!.color.b,
      ),
    });
    const circleGeometry = new THREE.CircleBufferGeometry(this.bot.collisionRadius);
    this.circle = new THREE.Mesh(circleGeometry, meshMaterial);
    this.scene.add(this.circle);

    const lineMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0, 0, 0),
    });
    let lineGeometry = new THREE.CircleBufferGeometry(this.bot.collisionRadius / 1.2);
    this.line = new THREE.Mesh(lineGeometry, lineMaterial);
    this.line.position.z = 0.1;
    this.scene.add(this.line);
  }

  draw() {
    if (!this.predrawn) {
      this.predraw();
    }
    this.circle!.position.x = this.bot.position.x;
    this.circle!.position.y = this.bot.position.y;
    this.line!.position.x = this.bot.position.x + this.bot.collisionRadius / 1.5;// + this.bot.collisionRadius;
    this.line!.position.y = this.bot.position.y;// + this.bot.collisionRadius;
  }

  dedraw() {
    this.predrawn = false;
    this.scene.remove(this.circle!);
    this.scene.remove(this.line!);
    this.circle = null;
    this.line = null;
  }
}
