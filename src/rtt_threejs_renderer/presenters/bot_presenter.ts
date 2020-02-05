import * as THREE from 'three';
import { Player } from '../../rtt_engine/player';
import { Bot } from '../../rtt_engine/entities/bot';
import { Vector } from '../../rtt_engine/vector';

export function botShape(): THREE.Shape {
  var shape = new THREE.Shape();
  shape.moveTo(5, 0);
  const closeness = 0.8;
  shape.ellipse(-5, 0, 5, 5, 0, Math.PI * closeness * 2, false, -Math.PI * closeness);
  shape.lineTo(-0.5, 0);
  return shape;
}

export class BotPresenter {
  player: Player;
  scene: THREE.Group;
  meshMaterial?: THREE.Material;
  botGeometry?: THREE.BufferGeometry;
  instancedMesh?: THREE.InstancedMesh;

  constructor(player: Player, scene: THREE.Group) {
    this.player = player;
    this.scene = scene;
  }

  predraw() {
    this.meshMaterial = new THREE.MeshBasicMaterial({ color: this.player.color });
    this.botGeometry = new THREE.ShapeBufferGeometry(botShape());
  }

  draw() {
    const bots = this.player.units.vehicles.filter((v) => v instanceof Bot);
    const numberOfBots = bots.length;
    if (this.instancedMesh != undefined && this.instancedMesh.count != numberOfBots) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh = undefined;
    }
    if (this.instancedMesh == undefined) {
      this.instancedMesh = new THREE.InstancedMesh(this.botGeometry!, this.meshMaterial!, numberOfBots);
      this.instancedMesh.count = numberOfBots;
      this.instancedMesh.frustumCulled = false;
      this.scene.add(this.instancedMesh);
    }
    let m = new THREE.Matrix4();
    for (let i = 0; i < numberOfBots; i++) {
      const bot = bots[i];
      m.makeRotationZ(-Math.PI/2 - bot.direction);
      m.setPosition(bot.position.x, bot.position.y, 0);
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
