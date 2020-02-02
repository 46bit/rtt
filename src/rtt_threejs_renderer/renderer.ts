import * as THREE from 'three';
import CameraControls from 'camera-controls';

CameraControls.install({ THREE: THREE });

export class Renderer {
  clock: THREE.Clock;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  gameCoordsGroup: THREE.Group;
  renderer: THREE.WebGLRenderer;
  controls: CameraControls;

  constructor(worldSize: number, window: any, document: any) {
    this.clock = new THREE.Clock();
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, worldSize * 200);
    //this.camera.position.z = worldSize;
    this.scene = new THREE.Scene();
    this.gameCoordsGroup = new THREE.Group();
    this.gameCoordsGroup.position.x = -worldSize / 2;
    this.gameCoordsGroup.position.y = -worldSize / 2;
    this.scene.add(this.gameCoordsGroup);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    if (window.devicePixelRatio != null) {
      this.renderer.setPixelRatio(window.devicePixelRatio);
    }
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    this.controls = new CameraControls(this.camera, this.renderer.domElement);
    this.controls.minDistance = 5;
    this.controls.maxDistance = worldSize;
    this.controls.dollyToCursor = true;
    this.controls.mouseButtons.left = CameraControls.ACTION.DOLLY;
    this.controls.mouseButtons.right = CameraControls.ACTION.TRUCK;
    this.controls.mouseButtons.wheel = CameraControls.ACTION.DOLLY;
    // FIXME: Need to actually try these options out
    this.controls.touches.one = CameraControls.ACTION.TOUCH_TRUCK;
    this.controls.touches.two = CameraControls.ACTION.TOUCH_DOLLY;
    this.controls.touches.three = CameraControls.ACTION.TOUCH_DOLLY_TRUCK;
    this.controls.setLookAt(0, 0, worldSize, 0, 0, 0, false);
  }

  animate(force = false) {
    const delta = this.clock.getDelta();
    const hasControlsUpdated = this.controls.update(delta);
    requestAnimationFrame(() => this.animate());

    //if (force || hasControlsUpdated) {
      console.log("draw calls: " + this.renderer.info.render.calls);
      const start = new Date();
      this.renderer.render(this.scene, this.camera);
      console.log("render time: " + ((new Date()) - start));
    //}
  }
}


//   rotation = new rtt_engine.Vector(0.1, 0);
//   geometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
//   material = new THREE.MeshNormalMaterial();
//   mesh = new THREE.Mesh(geometry, material);
//   scene.add(mesh);

//   f = 0;
//   mesh2s = [];
//   const rotation2 = new rtt_engine.Vector(3, 0);
//   for (let i = 0; i < 200; i++) {
//     const geometry2 = new THREE.BoxGeometry(0.2, 0.2, 0.2);
//     const material2 = new THREE.MeshNormalMaterial();
//     const mesh2 = new THREE.Mesh(geometry2, material);
//     mesh2.position.z = -i / 3;
//     mesh2.position.x = rotation2.x; // -i / 10;
//     mesh2.position.y = rotation2.y; // -i / 10;
//     scene.add(mesh2);
//     mesh2s.push(mesh2);
//     rotation2.rotate(Math.PI / 30);
//     rotation2.x *= 0.99;
//     rotation2.y *= 0.99;
//   }

//   renderer = new THREE.WebGLRenderer({ antialias: true });
//   renderer.setSize(window.innerWidth, window.innerHeight);
//   document.body.appendChild(renderer.domElement);
// }

// function threeDemoAnimate() {
//   requestAnimationFrame(threeDemoAnimate);
//   console.log('frame ' + f);

//   f++;

//   rotation.rotate(Math.PI / 180);

//   mesh.position.x = rotation.x;
//   mesh.position.y = rotation.y;

//   mesh.rotation.y += 0.01;
//   mesh.rotation.y += 0.02;

//   const rotation2 = new rtt_engine.Vector(3, 0);
//   rotation2.rotate(Math.PI / 360 * f);
//   for (const mesh2 of mesh2s) {
//     mesh2.position.x = rotation2.x; // -i / 10;
//     mesh2.position.y = rotation2.y; // -i / 10;
//     rotation2.rotate(Math.PI / 30);
//     rotation2.x *= 0.99;
//     rotation2.y *= 0.99;
//   }

//   //scene.remove( mesh );
//   //mesh.position.x += 0.1;
//   //material = new THREE.MeshNormalMaterial();
//   //mesh = new THREE.Mesh( geometry, material );
//   //scene.add( mesh );

//   renderer.render(scene, camera);
// }

// main();
