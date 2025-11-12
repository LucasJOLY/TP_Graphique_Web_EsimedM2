import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class Camera extends THREE.PerspectiveCamera {
  constructor(rendererDomElement) {
    super(60, window.innerWidth / window.innerHeight, 0.1, 1000);

    this.defaultPosition();
    this.controls = new OrbitControls(this, rendererDomElement);
    this.controls.enableDamping = true;
  }

  defaultPosition() {
    this.position.set(0, 2, 5);
    this.lookAt(0, 0, 0);
  }
}
