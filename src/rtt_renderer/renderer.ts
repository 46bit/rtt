import * as THREE from 'three';
import { Vector } from '../rtt_engine';
import { ScreenPositionToWorldPosition } from './selection';

export class Renderer {
  clock: THREE.Clock;
  rttViewport: any;
  worldSize: number;
  screenWidth: number;
  screenHeight: number;
  camera: THREE.OrthographicCamera;
  scene: THREE.Scene;
  gameCoordsGroup: THREE.Group;
  renderer: THREE.WebGLRenderer;
  screenPositionToWorldPosition: ScreenPositionToWorldPosition;
  pressedArrowKeys: Set<number>;

  constructor(worldSize: number, window: any, document: any, rttViewport: any) {
    this.clock = new THREE.Clock();
    this.rttViewport = rttViewport;

    this.worldSize = worldSize;
    this.screenWidth = this.rttViewport.offsetWidth;
    this.screenHeight = this.rttViewport.offsetHeight;

    this.camera = new THREE.OrthographicCamera(
      - this.worldSize/2 * this.screenWidth/this.screenHeight,
      this.worldSize/2 * this.screenWidth/this.screenHeight,
      this.worldSize/2,
      - this.worldSize/2,
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

    this.renderer.setSize(this.screenWidth, this.screenHeight);
    this.rttViewport.appendChild(this.renderer.domElement);

    this.screenPositionToWorldPosition = new ScreenPositionToWorldPosition(this.renderer.domElement, this.camera);
    this.pressedArrowKeys = new Set();

    this.renderer.domElement.addEventListener("wheel", (e: WheelEvent) => this.wheel(e), false);
    window.addEventListener("keydown", (e: KeyboardEvent) => this.keydown(e), false);
    window.addEventListener("keyup", (e: KeyboardEvent) => this.keyup(e), false);
  }

  animate(force = false) {
    requestAnimationFrame(() => this.animate());

    const newScreenWidth = this.rttViewport.offsetWidth;
    const newScreenHeight = this.rttViewport.offsetHeight;
    if (newScreenWidth != this.screenWidth || newScreenHeight != this.screenHeight) {
      // Keep the same centre, but let the edges go out of sight rather than adjusting zoom
      const screenWidthMultiplier = newScreenWidth/this.screenWidth;
      const screenHeightMultiplier = newScreenHeight/this.screenHeight;

      const cameraWidth = this.camera.right - this.camera.left;
      const cameraHeight = this.camera.top - this.camera.bottom;

      const cameraCentreX = (this.camera.right + this.camera.left) / 2;
      const cameraCentreY = (this.camera.top + this.camera.bottom) / 2;

      this.camera.left = cameraCentreX - cameraWidth * screenWidthMultiplier / 2;
      this.camera.right = cameraCentreX + cameraWidth * screenWidthMultiplier / 2;
      this.camera.top = cameraCentreY + cameraHeight * screenHeightMultiplier / 2;
      this.camera.bottom = cameraCentreY - cameraHeight * screenHeightMultiplier / 2;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(newScreenWidth, newScreenHeight);
      this.screenWidth = newScreenWidth;
      this.screenHeight = newScreenHeight;
    }

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
  }

  wheel(event: WheelEvent) {
    const gameMouse = this.screenPositionToWorldPosition.convert(event.clientX, event.clientY)!;
    let scale = 1 + event.deltaY / this.screenHeight;
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

  keydown(event: KeyboardEvent) {
    if ([37, 38, 39, 40].includes(event.keyCode)) {
      this.pressedArrowKeys.add(event.keyCode);
    }
  }

  keyup(event: KeyboardEvent) {
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
