import * as THREE from 'three';
import { Player, Vector, Models, EntityMetadata } from '../../rtt_engine';

export class HealthinessPresenter {
  player: Player;
  scene: THREE.Group;
  healthiness?: Float32Array;
  instancedMesh?: THREE.InstancedMesh;

  constructor(player: Player, scene: THREE.Group) {
    this.player = player;
    this.scene = scene;
  }

  predraw(numberOfUnits: number) {
    this.healthiness = new Float32Array(numberOfUnits);
    let requiredHealthiness = new Float32Array(4);
    requiredHealthiness[0] = 0.0;
    requiredHealthiness[1] = 1.0;
    requiredHealthiness[2] = 0.0;
    requiredHealthiness[3] = 1.0;

    const geometry = new THREE.PlaneBufferGeometry(1, 1);
    geometry.setAttribute('healthiness', new THREE.InstancedBufferAttribute(this.healthiness, 1));
    geometry.setAttribute('requiredHealthiness', new THREE.Float32BufferAttribute(requiredHealthiness, 1));

    var material = new THREE.MeshBasicMaterial({ color: this.player.color });
    var colorParsChunk = [
      'attribute float healthiness;',
      'attribute float requiredHealthiness;',
      'varying float vHealthiness;',
      'varying float vRequiredHealthiness;',
      '#include <common>'
    ].join('\n');
    var instanceColorChunk = [
      '#include <begin_vertex>',
      '\tvHealthiness = healthiness;',
      '\tvRequiredHealthiness = requiredHealthiness;'
    ].join('\n');
    var fragmentParsChunk = [
      'varying float vHealthiness;',
      'varying float vRequiredHealthiness;',
      '#include <common>'
    ].join('\n');
    var colorChunk = [
      'float opacity = (vRequiredHealthiness <= vHealthiness) ? 1.0 : 0.2;',
      'vec4 diffuseColor = vec4( diffuse, opacity );'
    ].join('\n');
    material.blending = THREE.AdditiveBlending;
    material.onBeforeCompile = function (shader) {
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', colorParsChunk)
        .replace('#include <begin_vertex>', instanceColorChunk);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', fragmentParsChunk)
        .replace('vec4 diffuseColor = vec4( diffuse, opacity );', colorChunk);
    };

    this.instancedMesh = new THREE.InstancedMesh(geometry, material, numberOfUnits);
    this.instancedMesh.count = numberOfUnits;
    this.instancedMesh.frustumCulled = false;
    this.scene.add(this.instancedMesh);
  }

  draw() {
    const units = this.player.units.allKillableCollidableUnits().filter((u) => Models[u.kind].isDamaged(u as any));
    const numberOfUnits = units.length;
    if (this.instancedMesh != undefined && this.instancedMesh.count != numberOfUnits) {
      this.dedraw();
    }
    if (this.instancedMesh == undefined) {
      this.predraw(numberOfUnits);
    }

    let m = new THREE.Matrix4();
    for (let i = 0; i < numberOfUnits; i++) {
      const unit = units[i];
      m = m.identity();
      m.makeScale(EntityMetadata[unit.kind].collisionRadius * 2.5, 2, 0);
      m.setPosition(unit.position.x, unit.position.y - EntityMetadata[unit.kind].collisionRadius - 3, 0);
      this.instancedMesh!.setMatrixAt(i, m);
      this.healthiness![i] = Models[unit.kind].healthiness(unit as any);
    }
    this.instancedMesh!.instanceMatrix.needsUpdate = true;
    (this.instancedMesh!.geometry as THREE.BufferGeometry).attributes!.healthiness.needsUpdate = true;
  }

  dedraw() {
    if (this.instancedMesh) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh.geometry.dispose();
      (this.instancedMesh.material as THREE.Material).dispose();
      this.instancedMesh = undefined;
    }
  }
}
