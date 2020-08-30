export default /* glsl */`
attribute vec3 instancePosition;
attribute vec3 playerColor;

varying vec3 color;

void main() {
  vec3 instancePosition = position + instancePosition;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(instancePosition, 1.0);

  color = playerColor;
}
`;
