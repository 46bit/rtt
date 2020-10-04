import * as THREE from 'three';
import { Player, Vector } from '../../rtt_engine';
import { Titan, TitanProjectile, TITAN_RANGE, VehicleTurret } from '../../rtt_engine/entities';
import { InstancedRotateablePresenter, InstancedGeometryPresenter } from './lib';

import vehicle_vert from '../shaders/vehicle_vert.glsl.js';
import vehicle_frag from '../shaders/vehicle_frag.glsl.js';

export function titanShape(): THREE.Shape {
  var shape = new THREE.Shape();
  shape.moveTo(-14, 0);
  shape.lineTo(-10, 6);
  shape.lineTo(-8, 6)
  shape.lineTo(-4, 12);
  shape.lineTo(7, 12);
  shape.lineTo(12, 6);
  shape.lineTo(12, -6);
  shape.lineTo(7, -12);
  shape.lineTo(-4, -12);
  shape.lineTo(-8, -6);
  shape.lineTo(-10, -6);
  return shape;
}

export function titanTurretShape(): THREE.Shape {
  var shape = new THREE.Shape();
  shape.moveTo(-18, 0);
  shape.lineTo(-16, -2);
  shape.lineTo(0, -2);
  shape.lineTo(0, 2);
  shape.lineTo(-16, 2);
  return shape;
}

export class TitanPresenter extends InstancedGeometryPresenter {
  player: Player;

  constructor(player: Player, scene: THREE.Group) {
    const geometry = new THREE.ShapeBufferGeometry(titanShape());
    const material = new THREE.ShaderMaterial({
      vertexShader: vehicle_vert,
      fragmentShader: vehicle_frag,
      blending: THREE.NoBlending,
    });
    super(geometry, material, scene);
    this.player = player;
  }

  getInstances(): Titan[] {
    return this.player.units.vehicles.filter(v => v instanceof Titan) as Titan[];
  }
}

export class TitanTurretPresenter extends InstancedGeometryPresenter {
  player: Player;

  constructor(player: Player, scene: THREE.Group) {
    const geometry = new THREE.ShapeBufferGeometry(titanTurretShape());
    const material = new THREE.ShaderMaterial({
      vertexShader: vehicle_vert,
      fragmentShader: vehicle_frag,
      blending: THREE.NoBlending,
    });
    super(geometry, material, scene);
    this.player = player;
  }

  // FIXME: Make `VehicleTurret` more like a normal entity to stop having to
  // make it look like one here
  getInstances(): {position: Vector, direction: number, player: Player | null}[] {
    const titans = this.player.units.vehicles.filter(v => v instanceof Titan) as Titan[];
    return titans.map((titan) => {
      const titanTurret = titan.turret2;
      return {
        position: titan.position,
        direction: titanTurret.rotation,
        player: titan.player,
      };
    });
  }
}

export function titanProjectileShape(): THREE.Shape {
  var shape = new THREE.Shape();
  shape.moveTo(-1, -0.8);
  shape.lineTo(-1, 0.8);
  shape.lineTo(0, 1);
  shape.lineTo(0, -1);
  return shape;
}

export class TitanProjectilePresenter extends InstancedRotateablePresenter {
  constructor(player: Player, scene: THREE.Group) {
    super(
      player,
      (p) => p.units.vehicles.filter(v => v instanceof Titan),
      new THREE.ShapeBufferGeometry(titanProjectileShape()),
      scene,
    );
    this.material!.transparent = true;
    this.material!.opacity = 0.5;
  }

  draw() {
    const instances = this.instanceCallback(this.player).filter((i) => (i as Titan).laserStopAfter != null);
    const instanceCount = instances.length;
    if (this.instancedMesh != undefined && this.instancedMesh.count != instanceCount) {
      this.scene.remove(this.instancedMesh);
      this.instancedMesh = undefined;
    }
    if (this.instancedMesh == undefined) {
      this.instancedMesh = new THREE.InstancedMesh(this.geometry!, this.material!, instanceCount);
      this.instancedMesh.count = instanceCount;
      this.instancedMesh.frustumCulled = false;
      this.scene.add(this.instancedMesh);
    }
    let m = new THREE.Matrix4();
    let s = new THREE.Vector3(0, 1, 1);
    for (let i = 0; i < instanceCount; i++) {
      const instance = instances[i] as Titan;
      m.makeRotationZ(-Math.PI/2 - instance.turret2.rotation);
      s.x = instance.laserStopAfter!;
      m.scale(s);
      m.setPosition(instance.position.x, instance.position.y, 0);
      this.instancedMesh.setMatrixAt(i, m);
    }
    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }
}
