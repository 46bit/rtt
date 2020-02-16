import * as THREE from 'three';
import CameraControls from 'camera-controls';

CameraControls.install({ THREE: THREE });

export function time(name: string, callback: () => void): void {
  let clock = new THREE.Clock();
  clock.start();
  callback();
  console.log("time of '" + name + "': " + clock.getElapsedTime());
}

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
    this.scene.background = new THREE.Color(0x202020);
    this.gameCoordsGroup = new THREE.Group();
    this.gameCoordsGroup.position.x = -worldSize / 2;
    this.gameCoordsGroup.position.y = -worldSize / 2;
    this.scene.add(this.gameCoordsGroup);
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
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
    this.controls.update(this.clock.getDelta());
    requestAnimationFrame(() => this.animate());

    time("animate", () => {
      this.renderer.render(this.scene, this.camera);
      console.log("draw calls: " + this.renderer.info.render.calls);
    });
  }
}
