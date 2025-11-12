import * as THREE from 'three';
import { createStandardMaterial, loadGltf, textureloader } from './tools';

export class Scene extends THREE.Scene {
  constructor() {
    super();
    this.loadedModels = new Map();
    this.selectableObjects = new Set();
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
      this.ground.userData.isGround = true;
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

      await this.instantiateNodes(data.nodes);
    } catch (error) {
      console.error(`Erreur lors du chargement de la scène ${url}`, error);
    }
  }

  async instantiateNodes(nodes = []) {
    for (const node of nodes) {
      const modelName = node.name;
      let model = this.loadedModels.get(modelName);

      if (!model) {
        model = await loadGltf(modelName);
        this.loadedModels.set(modelName, model);
      }

      const instance = model.clone(true);
      instance.name = modelName;
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
      this.selectableObjects.add(instance);
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

  exportScene(params = {}) {
    const paramsClone = JSON.parse(JSON.stringify(params));
    const nodes = [];

    for (const object of this.selectableObjects) {
      nodes.push({
        name: object.name ?? '',
        position: object.position
          .toArray()
          .map((value) => value.toFixed(6))
          .join(','),
        rotation: object.quaternion
          .toArray()
          .map((value) => value.toFixed(6))
          .join(','),
        scale: object.scale
          .toArray()
          .map((value) => value.toFixed(6))
          .join(','),
      });
    }

    return {
      params: paramsClone,
      nodes,
    };
  }

  clearScene() {
    for (const object of this.selectableObjects) {
      this.remove(object);
    }
    this.selectableObjects.clear();
  }

  async importScene(event, params) {
    const file = event.target?.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      this.clearScene();

      if (data.params) {
        if (data.params.skybox?.file && params?.skybox) {
          params.skybox.file = data.params.skybox.file;
          this.addSkybox(params.skybox.file);
        }

        if (data.params.ground && params?.ground) {
          params.ground.texture = data.params.ground.texture ?? params.ground.texture;
          params.ground.repeats = data.params.ground.repeats ?? params.ground.repeats;
          this.changeGround(params.ground.texture, params.ground.repeats);
        }

        if (data.params.sun && params?.sun) {
          params.sun.color = data.params.sun.color ?? params.sun.color;
          params.sun.intensity = data.params.sun.intensity ?? params.sun.intensity;
          params.sun.x = data.params.sun.x ?? params.sun.x;
          params.sun.z = data.params.sun.z ?? params.sun.z;
          this.changeSun(params.sun);
        }
      }

      if (data.nodes) {
        await this.instantiateNodes(data.nodes);
      }
    } catch (error) {
      console.error('Erreur lors de l’importation de la scène', error);
    }
  }
}
