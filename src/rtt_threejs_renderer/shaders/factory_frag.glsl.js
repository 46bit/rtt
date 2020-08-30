export default /* glsl */`
uniform vec3 color;

varying float vFactoriesProductionProgress;

void main() {
  float opacity = max(vFactoriesProductionProgress, 0.4);

  vec3 black = vec3(0, 0, 0);
  vec3 blended_color = mix(black, color, opacity);
  gl_FragColor = vec4(blended_color, 1);
}
`;
