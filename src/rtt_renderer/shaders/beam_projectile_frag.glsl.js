export default /* glsl */`
varying vec3 color;

void main() {
  gl_FragColor = vec4(color, 0.5);
}
`;
