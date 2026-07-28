import * as THREE from "three";

export function configureRenderer(renderer: THREE.WebGLRenderer): THREE.WebGLRenderer {
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.toneMappingExposure = 1;
  return renderer;
}
