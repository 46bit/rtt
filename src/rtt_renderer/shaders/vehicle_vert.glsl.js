export default /* glsl */`
attribute vec3 instancePosition;
attribute float instanceRotation;
attribute vec3 playerColor;

varying vec3 color;

mat3 rotate2d(float angle) {
  return mat3(cos(angle), -sin(angle), 0,
              sin(angle),  cos(angle), 0,
              0,           0,          1);
}

void main() {
  vec3 instancePosition = rotate2d(instanceRotation) * position + instancePosition;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(instancePosition, 1.0);

  color = playerColor;
}
`;
