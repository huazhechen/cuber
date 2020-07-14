import World from "./cuber/world";
import CubeGroup from "./cuber/group";
import vm from ".";
import { COLORS } from "./cuber/define";
import Cubelet from "./cuber/cubelet";

export class PreferanceData {
  private world: World;

  static DEFAULT = {
    version: "0.5",
    scale: 50,
    perspective: 50,
    angle: 30,
    gradient: 33,
    frames: 20,
    sensitivity: 50,
    thickness: true,
    mirror: false,
    hollow: false,
    arrow: false,
    cloud: false,
    wireframe: false,
    shadow: true,
    dark: false,
  };

  private values = JSON.parse(JSON.stringify(PreferanceData.DEFAULT));

  constructor(world: World) {
    this.world = world;
    this.load();
  }

  load(): void {
    const save = window.localStorage.getItem("preferance");
    if (save) {
      const data = JSON.parse(save);
      if (data.version != this.values.version) {
        this.save();
        return;
      }
      const values = this.values as { [key: string]: string | number | boolean };
      for (const key in values) {
        values[key] = data[key];
      }
    }
  }

  save(): void {
    window.localStorage.setItem("preferance", JSON.stringify(this.values));
  }

  refresh(): void {
    const self = (this as unknown) as { [key: string]: string | number | boolean };
    const values = this.values as { [key: string]: string | number | boolean };
    for (const key in values) {
      self[key] = values[key];
    }
  }

  get scale(): number {
    return this.values.scale;
  }
  set scale(value) {
    if (this.values.scale != value) {
      this.values.scale = value;
    }
    value = (5 - value / 25) / 3;
    value = 1 / value;
    this.world.scale = value;
    this.world.resize();
  }

  get perspective(): number {
    return this.values.perspective;
  }
  set perspective(value) {
    if (this.values.perspective != value) {
      this.values.perspective = value;
    }
    this.world.perspective = (101 / (value + 0.1)) * 4 - 3;
    this.world.resize();
  }

  get angle(): number {
    return this.values.angle;
  }
  set angle(value) {
    if (this.values.angle != value) {
      this.values.angle = value;
    }
    this.world.scene.rotation.y = ((value / 50 - 1) * Math.PI) / 2;
    this.world.scene.updateMatrix();
    this.world.dirty = true;
  }

  get gradient(): number {
    return this.values.gradient;
  }
  set gradient(value) {
    if (this.values.gradient != value) {
      this.values.gradient = value;
    }
    this.world.scene.rotation.x = ((1 - value / 50) * Math.PI) / 2;
    this.world.scene.updateMatrix();
    this.world.dirty = true;
  }

  get shadow(): boolean {
    return this.values.shadow;
  }
  set shadow(value) {
    if (this.values.shadow != value) {
      this.values.shadow = value;
    }
    if (value) {
      this.world.ambient.intensity = 0.85;
      this.world.directional.intensity = 0.2;
    } else {
      this.world.ambient.intensity = 1;
      this.world.directional.intensity = 0;
    }
    this.world.dirty = true;
  }

  get frames(): number {
    return this.values.frames;
  }
  set frames(value) {
    if (this.values.frames != value) {
      this.values.frames = value;
    }
    CubeGroup.frames = value;
  }

  get sensitivity(): number {
    return this.values.sensitivity;
  }
  set sensitivity(value) {
    if (this.values.sensitivity != value) {
      this.values.sensitivity = value;
    }
    let i = value / 100;
    i = i ** 2;
    this.world.controller.sensitivity = i;
  }

  get mirror(): boolean {
    return this.values.mirror;
  }
  set mirror(value) {
    if (this.values.mirror != value) {
      this.values.mirror = value;
    }
    for (const cubelet of this.world.cube.cubelets) {
      cubelet.mirror = value;
    }
    this.world.dirty = true;
  }

  get hollow(): boolean {
    return this.values.hollow;
  }
  set hollow(value: boolean) {
    if (this.values.hollow != value) {
      this.values.hollow = value;
    }
    for (const cubelet of this.world.cube.cubelets) {
      cubelet.hollow = value;
    }
    this.world.dirty = true;
  }

  get thickness(): boolean {
    return this.values.thickness;
  }

  set thickness(value) {
    if (this.values.thickness != value) {
      this.values.thickness = value;
    }
    for (const cubelet of this.world.cube.cubelets) {
      cubelet.thickness = value;
    }
    this.world.dirty = true;
  }

  get arrow(): boolean {
    return this.values.arrow;
  }

  set arrow(value) {
    if (this.values.arrow != value) {
      this.values.arrow = value;
    }
    this.world.cube.arrow = value;
    this.world.dirty = true;
  }

  get dark(): boolean {
    return this.values.dark;
  }
  set dark(value) {
    if (this.values.dark != value) {
      this.values.dark = value;
    }
    vm.$vuetify.theme.dark = value;
  }

  reset(): void {
    this.values = JSON.parse(JSON.stringify(PreferanceData.DEFAULT));
    this.refresh();
    this.save();
  }
}

export class PaletteData {
  private world: World;
  private default: string;
  private values = {
    version: "0.3",
    colors: {},
  };

  constructor(world: World) {
    this.world = world;
    this.default = JSON.stringify(COLORS);
    this.load();
  }

  load(): void {
    const save = window.localStorage.getItem("palette");
    if (save) {
      const data = JSON.parse(save);
      if (data.version != this.values.version) {
        this.save();
        return;
      }
      this.values = data;
    }
  }

  save(): void {
    window.localStorage.setItem("palette", JSON.stringify(this.values));
  }

  refresh(): void {
    const colors = this.values.colors as { [key: string]: string };
    for (const key in colors) {
      const value = colors[key];
      if (value) {
        COLORS[key] = value;
        Cubelet.LAMBERS[key].color.set(value);
        Cubelet.BASICS[key].color.set(value);
        if (key == "Core") {
          Cubelet.CORE.color.set(value);
        }
      }
    }
    this.world.dirty = true;
  }

  color(key: string, value: string): void {
    const colors = this.values.colors as { [key: string]: string };
    colors[key] = value;
    COLORS[key] = value;
    Cubelet.LAMBERS[key].color.set(value);
    Cubelet.BASICS[key].color.set(value);
    if (key == "Core") {
      Cubelet.CORE.color.set(value);
    }
    this.world.dirty = true;
  }

  reset(): void {
    this.values.colors = JSON.parse(this.default);
    this.refresh();
    this.values.colors = {};
    this.save();
  }
}
