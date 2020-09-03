import * as THREE from 'three';
import { Vector } from '../rtt_engine';
import { ScreenPositionToWorldPosition } from './selection';

export function time(name: string, callback: () => void): void {
  let clock = new THREE.Clock();
  clock.start();
  callback();
  //console.debug("time of '" + name + "': " + clock.getElapsedTime());
}

export class Renderer {
  clock: THREE.Clock;
  border: number;
  worldSize: number;
  screenSize: number;
  camera: THREE.OrthographicCamera;
  scene: THREE.Scene;
  gameCoordsGroup: THREE.Group;
  renderer: THREE.WebGLRenderer;
  screenPositionToWorldPosition: ScreenPositionToWorldPosition;
  pressedArrowKeys: Set<number>;

  constructor(worldSize: number, window: any, document: any) {
    this.clock = new THREE.Clock();

    this.worldSize = worldSize;
    this.screenSize = Math.min(window.innerWidth, window.innerHeight);
    // FIXME: Relate this to the window size vs the world size so it is constant and in pixels
    this.border = 0;
    this.camera = new THREE.OrthographicCamera(
      - this.worldSize/2 - this.border,
      this.worldSize/2 + this.border,
      this.worldSize/2 + this.border,
      - this.worldSize/2 - this.border,
      0.01, this.worldSize * 10,
    );
    this.camera.position.z = this.worldSize;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x202020);
    this.gameCoordsGroup = new THREE.Group();
    const centreAroundMidpoint = new THREE.Matrix4().makeTranslation(this.worldSize/2, this.worldSize/2, 0);
    const originAtTopLeft = new THREE.Matrix4().makeScale(1, 1, 1);
    this.camera.applyMatrix4(centreAroundMidpoint);
    this.camera.applyMatrix4(originAtTopLeft);
    this.scene.add(this.gameCoordsGroup);
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    if (window.devicePixelRatio != null) {
      this.renderer.setPixelRatio(window.devicePixelRatio);
    }
    this.renderer.setSize(this.screenSize, this.screenSize);
    document.body.appendChild(this.renderer.domElement);

    this.screenPositionToWorldPosition = new ScreenPositionToWorldPosition(this.renderer.domElement, this.camera);
    this.pressedArrowKeys = new Set();

    this.renderer.domElement.addEventListener("wheel", (e) => this.wheel(e), false);
    window.addEventListener("keydown", (e) => this.keydown(e), false);
    window.addEventListener("keyup", (e) => this.keyup(e), false);
  }

  animate(force = false) {
    requestAnimationFrame(() => this.animate());

    // FIXME: Accommodate resizing the window
    // const screenSize = Math.min(window.innerWidth, window.innerHeight);
    // if (screenSize != this.screenSize) {
    //   this.screenSize = screenSize;
    //   this.camera.left = -this.border;// -this.worldSize / 2 - this.border;
    //   this.camera.right = this.worldSize + this.border;
    //   this.camera.bottom = -this.border;
    //   this.camera.top = this.worldSize + this.border;
    //   this.camera.updateProjectionMatrix();
    //   this.renderer.setSize(screenSize, screenSize);
    // }

    time("animate", () => {
      let dx = 0;
      let dy = 0;
      this.pressedArrowKeys.forEach((keyCode) => {
        switch (keyCode) {
          case 37: // left arrow key
            dx += 1;
            break;
          case 39: // right arrow key
            dx -= 1;
            break;
          case 38: // up arrow key
            dy += 1;
            break;
          case 40: // down arrow key
            dy -= 1;
            break;
        }
      });
      if (dx != 0 || dy != 0) {
        // FIXME: I'm not convinced this calculation works, but the UI result is OK
        // FIXME: Make these movements smoother. Acceleration/easing.
        const neededMovementForOnePixelAtThisScrollLevel = 15 / this.camera.matrix.elements[0];
        const translate = new THREE.Matrix4().makeTranslation(-dx * neededMovementForOnePixelAtThisScrollLevel, dy * neededMovementForOnePixelAtThisScrollLevel, 0);
        this.camera.applyMatrix4(translate);
        this.moveWithinBounds();
      }

      this.renderer.render(this.scene, this.camera);
      //console.debug("draw calls: " + this.renderer.info.render.calls);
    });
  }

  wheel(event: {deltaY: number, clientX: number, clientY: number}) {
    const gameMouse = this.screenPositionToWorldPosition.convert(event.clientX, event.clientY)!;
    let scale = 1 + event.deltaY / this.screenSize;
    // Prevent zooming in beyond 250px on the screen
    // FIXME: Try to encapsulate this logic
    scale = Math.max(scale, 250 / this.worldSize / this.camera.matrix.elements[0]);
    // Prevent zooming out beyond the full game board on the screen
    // FIXME: Try to encapsulate this logic
    scale = Math.min(scale, 1 / this.camera.matrix.elements[0]);

    // From https://medium.com/@benjamin.botto/zooming-at-the-mouse-coordinates-with-affine-transformations-86e7312fd50b
    // T = translate(40, 40) * scale(1.25, 1.25) * translate(-40, -40)
    const translateGameMouseToCentre = new THREE.Matrix4().makeTranslation(-gameMouse.x, -gameMouse.y, 0);
    const scaleWorldAroundGameMouse = new THREE.Matrix4().makeScale(scale, scale, 1.0);
    const translateGameMouseBack = new THREE.Matrix4().makeTranslation(gameMouse.x, gameMouse.y, 0);
    this.camera.applyMatrix4(translateGameMouseToCentre);
    this.camera.applyMatrix4(scaleWorldAroundGameMouse);
    this.camera.applyMatrix4(translateGameMouseBack);

    this.moveWithinBounds();
  }

  keydown(event: {keyCode: number}) {
    if ([37, 38, 39, 40].includes(event.keyCode)) {
      this.pressedArrowKeys.add(event.keyCode);
    }
  }

  keyup(event: {keyCode: number}) {
    this.pressedArrowKeys.delete(event.keyCode);
  }

  // FIXME: Need to rescale if zoom level is wrong
  moveWithinBounds() {
    // Prevent zoom from going outside the game board at the left or top
    // FIXME: Try to encapsulate this logic
    const transformedTopLeft = new THREE.Vector4(-this.worldSize/2, this.worldSize/2).applyMatrix4(this.camera.matrix);
    const translateTopAndLeft = new THREE.Matrix4().makeTranslation(
      Math.max(0, -transformedTopLeft.x),
      -Math.max(0, transformedTopLeft.y - this.worldSize),
      0,
    );
    this.camera.applyMatrix4(translateTopAndLeft);

    // Prevent zoom from going outside the game board at the right or bottom
    // FIXME: Try to encapsulate this logic
    const transformedBottomRight = new THREE.Vector4(this.worldSize/2, -this.worldSize/2).applyMatrix4(this.camera.matrix);
    const translateBottomAndRight = new THREE.Matrix4().makeTranslation(
      -Math.max(0, transformedBottomRight.x - this.worldSize),
      Math.max(0, -transformedBottomRight.y),
      0,
    );
    this.camera.applyMatrix4(translateBottomAndRight);
  }
}
