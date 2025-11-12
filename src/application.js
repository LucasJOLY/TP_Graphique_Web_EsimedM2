import * as THREE from 'three/webgpu';
import { Raycaster, Vector2 } from 'three';
import { Scene } from './scene';
import { Camera } from './camera';
import { UI } from './ui';

export class Application {
  constructor() {
    this.renderer = new THREE.WebGPURenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    this.renderer.shadowMap.enabled = true;

    this.scene = new Scene();
    this.scene.addAmbiantLight();
    const sun = this.scene.addDirectionalLight();

    this.selectedObject = null;
    this.selectedMesh = null;
    this.selectedMeshMaterial = null;
    this.selectionMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    this.raycaster = new Raycaster();
    this.pointer = new Vector2();

    this.initParams(sun);

    this.ui = new UI();
    this.ui.addSkyboxUI(this.skyboxFiles, this.skyboxParams, this.scene.addSkybox.bind(this.scene));
    this.ui.addGroundUI(
      this.groundTextures,
      this.groundParams,
      this.scene.changeGround.bind(this.scene)
    );
    this.ui.addSunUI(this.sunParams, this.scene.changeSun.bind(this.scene));
    this.ui.createSelectionUI();

    this.scene.addSkybox(this.skyboxParams.file);
    this.scene.addGround(this.groundParams.texture, this.groundParams.repeats);
    this.scene
      .loadScene('/scenes/scene_1.json')
      .catch((error) => console.error('Erreur de chargement de la scène', error));

    this.camera = new Camera(this.renderer.domElement);

    this.renderer.setAnimationLoop(this.render.bind(this));

    this.onClick = this.onClick.bind(this);
    window.addEventListener('click', this.onClick);
  }

  initParams(sun) {
    this.groundTextures = [
      'aerial_grass_rock',
      'brown_mud_leaves_01',
      'forest_floor',
      'forrest_ground_01',
      'gravelly_sand',
    ];

    this.groundParams = {
      texture: this.groundTextures[0],
      repeats: 100,
    };

    this.skyboxFiles = [
      'DaySkyHDRI019A_2K-TONEMAPPED.jpg',
      'DaySkyHDRI050A_2K-TONEMAPPED.jpg',
      'NightSkyHDRI009_2K-TONEMAPPED.jpg',
    ];

    this.skyboxParams = {
      file: this.skyboxFiles[0],
    };

    this.sunParams = {
      color: sun ? `#${sun.color.getHexString()}` : '#ffffff',
      intensity: sun?.intensity ?? 3.0,
      x: sun?.position.x ?? 50,
      z: sun?.position.z ?? 50,
    };
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onClick(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    const hit = intersects.find((intersect) => intersect.object?.userData?.isSelectable);

    if (!hit) {
      this.clearSelection();
      return;
    }

    const mesh = hit.object;
    if (mesh === this.selectedMesh) {
      return;
    }

    this.clearSelection();

    this.selectedMesh = mesh;
    this.selectedMeshMaterial = mesh.material;
    this.selectedObject = mesh.userData?.object ?? mesh;

    this.selectedMesh.material = this.selectionMaterial;

    this.ui.showSelection({
      name: this.selectedObject.name ?? '--',
      position: this.selectedObject.position
        .toArray()
        .map((v) => v.toFixed(2))
        .join(', '),
      rotation: this.selectedObject.rotation
        .toArray()
        .slice(0, 3)
        .map((v) => v.toFixed(2))
        .join(', '),
      scale: this.selectedObject.scale
        .toArray()
        .map((v) => v.toFixed(2))
        .join(', '),
    });
  }

  clearSelection() {
    if (this.selectedMesh && this.selectedMeshMaterial) {
      this.selectedMesh.material = this.selectedMeshMaterial;
    }
    this.selectedObject = null;
    this.selectedMesh = null;
    this.selectedMeshMaterial = null;
    this.ui.hideSelection();
  }
}
