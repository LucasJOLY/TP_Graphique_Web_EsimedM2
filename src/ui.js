import GUI from 'lil-gui';

export class UI {
  constructor() {
    this.gui = new GUI();
  }

  addSkyboxUI(files, params, onChange) {
    this.skyboxFolder = this.gui.addFolder('Skybox');
    this.skyboxController = this.skyboxFolder
      .add(params, 'file', files)
      .name('Fichier')
      .onChange((value) => {
        params.file = value;
        onChange(value);
      });
    this.skyboxFolder.open();
  }

  addGroundUI(files, params, onChange) {
    this.groundFolder = this.gui.addFolder('Ground');
    this.groundTextureController = this.groundFolder
      .add(params, 'texture', files)
      .name('Texture')
      .onChange((value) => {
        params.texture = value;
        onChange(params.texture, params.repeats);
      });
    this.groundRepeatsController = this.groundFolder
      .add(params, 'repeats', 1, 1000, 1)
      .name('Répétitions')
      .onChange((value) => {
        params.repeats = value;
        onChange(params.texture, params.repeats);
      });
    this.groundFolder.open();
  }

  addSunUI(params, onChange) {
    this.sunFolder = this.gui.addFolder('Sun');
    this.sunColorController = this.sunFolder
      .addColor(params, 'color')
      .name('Couleur')
      .onChange(() => onChange(params));
    this.sunIntensityController = this.sunFolder
      .add(params, 'intensity', 0, 10, 0.1)
      .name('Intensité')
      .onChange(() => onChange(params));
    this.sunXController = this.sunFolder
      .add(params, 'x', -200, 200, 1)
      .name('Position X')
      .onChange(() => onChange(params));
    this.sunZController = this.sunFolder
      .add(params, 'z', -200, 200, 1)
      .name('Position Z')
      .onChange(() => onChange(params));
    this.sunFolder.open();
  }

  createSelectionUI() {
    this.selectionDisplay = {
      name: '--',
      position: '--',
      rotation: '--',
      scale: '--',
    };

    this.selectionFolder = this.gui.addFolder('Selected');
    this.selectionFolder.add(this.selectionDisplay, 'name').name('Nom');
    this.selectionFolder.add(this.selectionDisplay, 'position').name('Position');
    this.selectionFolder.add(this.selectionDisplay, 'rotation').name('Rotation');
    this.selectionFolder.add(this.selectionDisplay, 'scale').name('Échelle');
    this.selectionFolder.close();
    this.selectionFolder.domElement.style.display = 'none';
  }

  showSelection(info) {
    if (!this.selectionFolder) {
      this.createSelectionUI();
    }
    Object.assign(this.selectionDisplay, info);
    this.selectionFolder.domElement.style.display = '';
    this.selectionFolder.controllers.forEach((controller) => controller.updateDisplay());
    this.selectionFolder.open();
  }

  hideSelection() {
    if (!this.selectionFolder) {
      return;
    }
    Object.assign(this.selectionDisplay, {
      name: '--',
      position: '--',
      rotation: '--',
      scale: '--',
    });
    this.selectionFolder.controllers.forEach((controller) => controller.updateDisplay());
    this.selectionFolder.domElement.style.display = 'none';
  }

  addSceneManagement(onExport, onClear, onImport) {
    const folder = this.gui.addFolder('Scene');
    const actions = {
      exportScene: () => onExport(),
      clearScene: () => onClear(),
      importScene: () => onImport(),
    };
    folder.add(actions, 'exportScene').name('Export Scene');
    folder.add(actions, 'clearScene').name('Clear Scene');
    folder.add(actions, 'importScene').name('Import Scene');
  }

  updateSkyboxUI() {
    if (this.skyboxController) {
      this.skyboxController.updateDisplay();
    }
  }

  updateGroundUI() {
    if (this.groundTextureController) {
      this.groundTextureController.updateDisplay();
    }
    if (this.groundRepeatsController) {
      this.groundRepeatsController.updateDisplay();
    }
  }

  updateSunUI() {
    if (this.sunColorController) {
      this.sunColorController.updateDisplay();
    }
    if (this.sunIntensityController) {
      this.sunIntensityController.updateDisplay();
    }
    if (this.sunXController) {
      this.sunXController.updateDisplay();
    }
    if (this.sunZController) {
      this.sunZController.updateDisplay();
    }
  }
}
