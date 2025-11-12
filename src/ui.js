import GUI from 'lil-gui';

export class UI {
  constructor() {
    this.gui = new GUI();
  }

  addSkyboxUI(files, params, onChange) {
    const folder = this.gui.addFolder('Skybox');
    folder
      .add(params, 'file', files)
      .name('Fichier')
      .onChange((value) => {
        params.file = value;
        onChange(value);
      });
    folder.open();
  }

  addGroundUI(files, params, onChange) {
    const folder = this.gui.addFolder('Ground');
    folder
      .add(params, 'texture', files)
      .name('Texture')
      .onChange((value) => {
        params.texture = value;
        onChange(params.texture, params.repeats);
      });
    folder
      .add(params, 'repeats', 1, 1000, 1)
      .name('Répétitions')
      .onChange((value) => {
        params.repeats = value;
        onChange(params.texture, params.repeats);
      });
    folder.open();
  }

  addSunUI(params, onChange) {
    const folder = this.gui.addFolder('Sun');
    folder
      .addColor(params, 'color')
      .name('Couleur')
      .onChange(() => onChange(params));
    folder
      .add(params, 'intensity', 0, 10, 0.1)
      .name('Intensité')
      .onChange(() => onChange(params));
    folder
      .add(params, 'x', -200, 200, 1)
      .name('Position X')
      .onChange(() => onChange(params));
    folder
      .add(params, 'z', -200, 200, 1)
      .name('Position Z')
      .onChange(() => onChange(params));
    folder.open();
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
}
