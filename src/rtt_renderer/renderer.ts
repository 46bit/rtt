import * as THREE from 'three';

export function time(name: string, callback: () => void): void {
  let clock = new THREE.Clock();
  clock.start();
  callback();
  console.debug("time of '" + name + "': " + clock.getElapsedTime());
}

export class Renderer {
  clock: THREE.Clock;
  border: number;
  worldSize: number;
  aspect: number;
  camera: THREE.OrthographicCamera;
  scene: THREE.Scene;
  gameCoordsGroup: THREE.Group;
  renderer: THREE.WebGLRenderer;
  controls: CameraControls;

  constructor(worldSize: number, window: any, document: any) {
    this.clock = new THREE.Clock();

    this.worldSize = worldSize;
    this.aspect = window.innerWidth / window.innerHeight;
    // FIXME: Relate this to the window size vs the world size so it is constant and in pixels
    this.border = 20;
    this.camera = new THREE.OrthographicCamera(
      -this.worldSize / 2 * this.aspect - this.border,
      this.worldSize / 2 * this.aspect + this.border,
      this.worldSize / 2 + this.border,
      -this.worldSize / 2 - this.border,
      0.01, this.worldSize * 10,
    );
    this.camera.position.z = this.worldSize;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x202020);
    this.gameCoordsGroup = new THREE.Group();
    this.gameCoordsGroup.position.x = -this.worldSize / 2;
    this.gameCoordsGroup.position.y = -this.worldSize / 2;
    this.scene.add(this.gameCoordsGroup);
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    if (window.devicePixelRatio != null) {
      this.renderer.setPixelRatio(window.devicePixelRatio);
    }
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
  }

  animate(force = false) {
    //this.controls.update(this.clock.getDelta());
    requestAnimationFrame(() => this.animate());

    let aspect = window.innerWidth / window.innerHeight;
    if (aspect != this.aspect) {
      this.aspect = aspect;
      this.camera.left = -this.worldSize / 2 * this.aspect - this.border;
      this.camera.right = this.worldSize / 2 * this.aspect + this.border;
      this.camera.top = this.worldSize / 2 + this.border;
      this.camera.bottom = -this.worldSize / 2 - this.border;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    time("animate", () => {
      this.renderer.render(this.scene, this.camera);
      console.debug("draw calls: " + this.renderer.info.render.calls);
    });
  }
}
