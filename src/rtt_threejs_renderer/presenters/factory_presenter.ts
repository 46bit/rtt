import * as THREE from 'three';
import { Player } from '../../rtt_engine/player';
import { Factory } from '../../rtt_engine/entities/factory';
import { Vector } from '../../rtt_engine/vector';

import factory_vert from '../shaders/factory_vert.glsl.js';
import factory_frag from '../shaders/factory_frag.glsl.js';

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
  factoriesProductionProgress?: Float32Array;
  instancedMesh?: THREE.InstancedMesh;

  constructor(player: Player, scene: THREE.Group) {
    this.player = player;
    this.scene = scene;
  }

  predraw(numberOfFactories: number) {
    this.factoriesProductionProgress = new Float32Array(numberOfFactories * 2);

    const geometry = new THREE.ShapeBufferGeometry(factoryShape());
    geometry.setAttribute('factoriesProductionProgress', new THREE.InstancedBufferAttribute(this.factoriesProductionProgress, 1));

    let material = new THREE.ShaderMaterial({
      uniforms: {
        color: {
          value: this.player.color,
        },
      },
      vertexShader: factory_vert,
      fragmentShader: factory_frag,
      blending: THREE.NoBlending,
    });

    this.instancedMesh = new THREE.InstancedMesh(geometry, material, numberOfFactories * 2);
    this.instancedMesh.count = numberOfFactories * 2;
    this.instancedMesh.frustumCulled = false;
    this.scene.add(this.instancedMesh);
  }

  draw() {
    const numberOfFactories = this.player.units.factories.length;
    if (this.instancedMesh != undefined && this.instancedMesh.count != numberOfFactories * 2) {
      this.dedraw();
    }
    if (this.instancedMesh == undefined) {
      this.predraw(numberOfFactories);
    }

    let m = new THREE.Matrix4();
    for (let i = 0; i < numberOfFactories * 2; i += 2) {
      const factory = this.player.units.factories[i/2];

      m = m.identity();
      m.makeScale(0.8, 0.8, 1.0);
      m.setPosition(factory.position.x, factory.position.y, 2);
      this.instancedMesh!.setMatrixAt(i, m);
      this.factoriesProductionProgress![i] = 0;

      m = m.identity();
      m.setPosition(factory.position.x, factory.position.y, 0);
      this.instancedMesh!.setMatrixAt(i+1, m);
      this.factoriesProductionProgress![i+1] = factory.productionProgress();
    }
    this.instancedMesh!.instanceMatrix.needsUpdate = true;
    this.instancedMesh!.geometry.attributes.factoriesProductionProgress.needsUpdate = true;
  }

  dedraw() {
    if (this.instancedMesh) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh.geometry.dispose();
      this.instancedMesh.material.dispose();
      this.instancedMesh = undefined;
    }
  }
}
