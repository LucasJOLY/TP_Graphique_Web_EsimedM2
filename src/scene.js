import * as THREE from 'three';
import { createStandardMaterial, loadGltf, textureloader } from './tools';

export class Scene extends THREE.Scene {
  constructor() {
    super();
    this.loadedModels = new Map();
  }

  addSkybox(filename) {
    const texture = textureloader.load(`skybox/${filename}`, () => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      this.background = texture;
    });
  }

  addDirectionalLight() {
    const light = new THREE.DirectionalLight(0xffffff, 3.0);
    light.position.set(50, 100, 50);
    light.castShadow = true;
    light.shadow.mapSize.set(2048, 2048);
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 200;
    light.shadow.camera.left = -50;
    light.shadow.camera.right = 50;
    light.shadow.camera.top = 50;
    light.shadow.camera.bottom = -50;

    const helper = new THREE.DirectionalLightHelper(light, 10);

    this.add(light);
    this.add(helper);

    this.directionalLight = light;
    this.directionalLightHelper = helper;

    return light;
  }

  addGround(texture, repeats) {
    const material = createStandardMaterial(texture, repeats);
    if (!this.ground) {
      const geometry = new THREE.PlaneGeometry(5000, 5000);
      this.ground = new THREE.Mesh(geometry, material);
      this.ground.rotation.x = -Math.PI / 2;
      this.ground.castShadow = false;
      this.ground.receiveShadow = true;
      this.add(this.ground);
    } else {
      this.ground.material.dispose();
      this.ground.material = material;
    }
  }

  changeGround(texture, repeats) {
    const material = createStandardMaterial(texture, repeats);
    if (this.ground) {
      this.ground.material.dispose();
      this.ground.material = material;
      this.ground.material.needsUpdate = true;
    } else {
      this.addGround(texture, repeats);
    }
  }

  addAmbiantLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    this.add(ambientLight);
  }

  async loadScene(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Échec du chargement de la scène ${url}`);
      }

      const data = await response.json();
      if (!data?.nodes) {
        return;
      }

      for (const node of data.nodes) {
        const modelName = node.name;
        let model = this.loadedModels.get(modelName);

        if (!model) {
          model = await loadGltf(modelName);
          this.loadedModels.set(modelName, model);
        }

        const instance = model.clone(true);
        instance.position.fromArray(node.position.split(',').map(Number));
        instance.quaternion.fromArray(node.rotation.split(',').map(Number));
        instance.scale.fromArray(node.scale.split(',').map(Number));
        instance.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.userData = {
              ...child.userData,
              isSelectable: true,
              object: instance,
            };
          }
        });

        this.add(instance);
      }
    } catch (error) {
      console.error(`Erreur lors du chargement de la scène ${url}`, error);
    }
  }

  changeSun(params) {
    if (!this.directionalLight) {
      return;
    }

    const { color, intensity, x, z } = params;
    if (color) {
      this.directionalLight.color.set(color);
    }
    this.directionalLight.intensity = intensity;
    this.directionalLight.position.x = x;
    this.directionalLight.position.z = z;
    if (this.directionalLightHelper) {
      this.directionalLightHelper.position.copy(this.directionalLight.position);
      this.directionalLightHelper.update();
    }
  }
}
