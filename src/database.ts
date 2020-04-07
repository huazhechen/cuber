import World from "./cuber/world";
import CubeGroup from "./cuber/group";
import vm from ".";
import { COLORS, DEFAULT_COLORS } from "./cuber/define";
import Cubelet from "./cuber/cubelet";

export class Preferance {
  private world: World;

  constructor(world: World) {
    this.world = world;
  }
  private data = {
    version: "0.2",
    scale: 50,
    perspective: 50,
    angle: 60,
    gradient: 65,
    frames: 20,
    sensitivity: 3,
    mirror: false,
    hollow: false,
    cloud: false,
    wireframe: false,
    shadow: true,
  };

  load(value: string) {
    let data = JSON.parse(value);
    if (data.version === this.data.version) {
      this.data = data;
    }
  }
  get value() {
    return JSON.stringify(this.data);
  }

  refresh() {
    let self = this as { [key: string]: any };
    let data = this.data as { [key: string]: any };
    for (const key in data) {
      self[key] = data[key];
    }
  }

  get scale() {
    return this.data.scale;
  }
  set scale(value) {
    if (this.data.scale != value) {
      this.data.scale = value;
    }
    this.world.scale = value / 100 + 0.5;
    this.world.resize();
  }

  get perspective() {
    return this.data.perspective;
  }
  set perspective(value) {
    if (this.data.perspective != value) {
      this.data.perspective = value;
    }
    this.world.perspective = (100.1 / (value + 0.01)) * 4 - 3;
    this.world.resize();
  }

  get angle() {
    return this.data.angle;
  }
  set angle(value) {
    if (this.data.angle != value) {
      this.data.angle = value;
    }
    this.world.scene.rotation.y = ((value / 100 - 1) * Math.PI) / 2;
    this.world.dirty = true;
  }

  get gradient() {
    return this.data.gradient;
  }
  set gradient(value) {
    if (this.data.gradient != value) {
      this.data.gradient = value;
    }
    this.world.scene.rotation.x = ((1 - value / 100) * Math.PI) / 2;
    this.world.dirty = true;
  }

  get shadow() {
    return this.data.shadow;
  }
  set shadow(value) {
    if (this.data.shadow != value) {
      this.data.shadow = value;
    }
    if (value) {
      this.world.ambient.intensity = 0.8;
      this.world.directional.intensity = 0.2;
    } else {
      this.world.ambient.intensity = 1;
      this.world.directional.intensity = 0;
    }
    this.world.dirty = true;
  }

  get frames() {
    return this.data.frames;
  }
  set frames(value) {
    if (this.data.frames != value) {
      this.data.frames = value;
    }
    CubeGroup.frames = value;
  }

  get sensitivity() {
    return this.data.sensitivity;
  }
  set sensitivity(value) {
    if (this.data.sensitivity != value) {
      this.data.sensitivity = value;
    }
    let i = (value - 3) / 2;
    i = 2 ** i;
    this.world.controller.sensitivity = i;
  }

  get mirror() {
    return this.data.mirror;
  }
  set mirror(value) {
    if (this.data.mirror != value) {
      this.data.mirror = value;
    }
    for (let cubelet of this.world.cube.cubelets) {
      cubelet.mirror = value;
    }
    this.world.dirty = true;
  }

  get hollow() {
    return this.data.hollow;
  }
  set hollow(value: boolean) {
    if (this.data.hollow != value) {
      this.data.hollow = value;
    }
    for (let cubelet of this.world.cube.cubelets) {
      cubelet.hollow = value;
    }
    this.world.dirty = true;
  }

  get cloud() {
    return this.data.cloud;
  }
  set cloud(value: boolean) {
    if (this.data.cloud != value) {
      this.data.cloud = value;
    }
    for (let cubelet of this.world.cube.cubelets) {
      cubelet.cloud = value;
    }
    this.world.dirty = true;
  }

  get wireframe() {
    return this.data.wireframe;
  }
  set wireframe(value: boolean) {
    if (this.data.wireframe != value) {
      this.data.wireframe = value;
    }
    for (let cubelet of this.world.cube.cubelets) {
      cubelet.wireframe = value;
    }
    this.world.dirty = true;
  }
}

export class Theme {
  private world: World;
  constructor(world: World) {
    this.world = world;
  }
  private data: { version: string; dark: boolean; colors: { [key: string]: string } } = {
    version: "0.2",
    dark: false,
    colors: {},
  };

  load(value: string) {
    let data = JSON.parse(value);
    if (data.version === this.data.version) {
      this.data = data;
    }
  }
  get value() {
    return JSON.stringify(this.data);
  }

  refresh() {
    this.dark = this.data.dark;
    for (const key in this.data.colors) {
      let value = this.data.colors[key];
      if (value) {
        COLORS[key] = value;
        Cubelet.LAMBERS[key].color.set(value);
        Cubelet.BASICS[key].color.set(value);
        if (key == "Core") {
          Cubelet.PHONG.color.set(value);
        }
      }
    }
    this.world.dirty = true;
  }

  color(key: string, value: string) {
    this.data.colors[key] = value;
    COLORS[key] = value;
    Cubelet.LAMBERS[key].color.set(value);
    Cubelet.BASICS[key].color.set(value);
    if (key == "Core") {
      Cubelet.PHONG.color.set(value);
    }
    this.world.dirty = true;
  }

  reset() {
    let string = JSON.stringify(DEFAULT_COLORS);
    this.data.colors = JSON.parse(string);
    this.refresh();
    this.data.colors = {};
  }

  get dark() {
    return this.data.dark;
  }
  set dark(value) {
    if (this.data.dark != value) {
      this.data.dark = value;
    }
    vm.$vuetify.theme.dark = value;
  }
}

export default class Database {
  private storage = window.localStorage;
  mode: string;
  world: World;
  preferance: Preferance;
  theme: Theme;
  constructor(mode: string, world: World) {
    this.mode = mode;
    this.world = world;
    this.preferance = new Preferance(this.world);
    this.theme = new Theme(this.world);
    let version = "0.1";
    if (this.storage.getItem("version") != version) {
      this.storage.clear();
      this.storage.setItem("version", version);
    }
    let save;
    save = this.storage.getItem("preferance");
    if (save) {
      this.preferance.load(save);
      this.storage.setItem("preferance", this.preferance.value);
    }

    save = this.storage.getItem("theme");
    if (save) {
      this.theme.load(save);
      this.storage.setItem("theme", this.theme.value);
    }
    let self = this as { [key: string]: any };
    if (self[this.mode]) {
      save = this.storage.getItem(this.mode);
      if (save) {
        let data = JSON.parse(save);
        if (data.version === self[this.mode].version) {
          self[this.mode] = data;
        } else {
          this.storage.setItem(this.mode, JSON.stringify(self[this.mode]));
        }
      }
      this.world.order = self[this.mode].order;
    }
  }

  playground = {
    version: "0.1",
    order: 3,
  };

  algs = {
    version: "0.1",
    order: 3,
  };

  director: {
    version: string;
    order: number;
    delay: number;
    pixel: number;
    filmt: string;
    snapt: string;
    dramas: { scene: string; action: string; stickers: {} }[];
  } = {
    version: "0.1",
    order: 3,
    delay: 4,
    pixel: 512,
    filmt: "gif",
    snapt: "png",
    dramas: [],
  };

  refresh() {
    this.preferance.refresh();
    this.theme.refresh();
  }

  save() {
    this.storage.setItem("preferance", this.preferance.value);
    this.storage.setItem("theme", this.theme.value);
    let self = this as { [key: string]: any };
    if (self[this.mode]) {
      this.storage.setItem(this.mode, JSON.stringify(self[this.mode]));
    }
  }
}
