import * as THREE from 'three';
import { Player, Vector } from '../../rtt_engine';
import { Titan, TitanProjectile, TITAN_RANGE, VehicleTurret } from '../../rtt_engine/entities';
import { InstancedGeometryPresenter } from './lib';

import vehicle_vert from '../shaders/vehicle_vert.glsl.js';
import vehicle_frag from '../shaders/vehicle_frag.glsl.js';
import beam_projectile_vert from '../shaders/beam_projectile_vert.glsl.js';
import beam_projectile_frag from '../shaders/beam_projectile_frag.glsl.js';

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

export class TitanProjectilePresenter extends InstancedGeometryPresenter {
  player: Player;

  constructor(player: Player, scene: THREE.Group) {
    const geometry = new THREE.ShapeBufferGeometry(titanProjectileShape());
    const material = new THREE.ShaderMaterial({
      vertexShader: beam_projectile_vert,
      fragmentShader: beam_projectile_frag,
      blending: THREE.NormalBlending,
    });
    material.transparent = true;
    super(geometry, material, scene);
    this.player = player;
  }

  getInstances(): {position: Vector, direction: number, player: Player | null, laserStopAfter: number}[] {
    let titans = this.player.units.vehicles.filter(v => v instanceof Titan) as Titan[];
    titans = titans.filter((t) => t.laserStopAfter != null);
    return titans.map((titan) => {
      const titanTurret = titan.turret2;
      return {
        position: titan.position,
        direction: titanTurret.rotation,
        player: titan.player,
        laserStopAfter: titan.laserStopAfter!,
      };
    });
  }

  predraw(instances: any[]) {
    super.predraw(instances);

    this.attributes.length = new Float32Array(this.allocatedInstances);
    this.instancedGeometry!.setAttribute(
      "projectileLength",
      new THREE.InstancedBufferAttribute(this.attributes.length, 1),
    );
  }

  draw() {
    const instances = this.getInstances();
    super.draw(instances);

    const numberOfInstances = instances.length;
    for (let i = 0; i < numberOfInstances; i++) {
      const instance = instances[i];
      if (!instance.player) {
        continue;
      }
      this.attributes.length[i] = instance.laserStopAfter!;
    }
    this.instancedGeometry!.getAttribute("projectileLength").needsUpdate = true;
  }
}
