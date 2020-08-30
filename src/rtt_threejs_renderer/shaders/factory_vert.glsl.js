export default /* glsl */`
attribute float factoriesProductionProgress;

varying float vFactoriesProductionProgress;

void main() {
  vFactoriesProductionProgress = factoriesProductionProgress;

  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4( position, 1.0 );
}
`;
