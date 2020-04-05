import World from "./cuber/world";
import CubeGroup from "./cuber/group";

export default class Database {
  private storage = window.localStorage;
  mode: string;
  world: World;
  constructor(mode: string, world: World) {
    this.mode = mode;
    this.world = world;
  }

  preferance = {
    version: "0.1",
    scale: 50,
    perspective: 50,
    angle: 63,
    gradient: 67,
    frames: 20,
    sensitivity: 3,
    mirror: false,
    hollow: false,
    shadow: true,
  };

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

  load() {
    let version = "0.1";
    if (this.storage.getItem("version") != version) {
      this.storage.clear();
      this.storage.setItem("version", version);
    }
    let save;
    save = this.storage.getItem("preferance");
    if (save) {
      let preferance = JSON.parse(save);
      if (preferance.version === preferance.version) {
        this.preferance = preferance;
      } else {
        this.storage.setItem("preferance", JSON.stringify(this.preferance));
      }
    }

    if ((<any>this)[this.mode]) {
      save = this.storage.getItem(this.mode);
      if (save) {
        let data = JSON.parse(save);
        if (data.version === (<any>this)[this.mode].version) {
          (<any>this)[this.mode] = data;
        } else {
          this.storage.setItem(this.mode, JSON.stringify((<any>this)[this.mode]));
        }
      }
      this.world.order = (<any>this)[this.mode].order;
    }
    this.refresh();
  }

  save() {
    this.storage.setItem(this.mode, JSON.stringify((<any>this)[this.mode]));
  }

  refresh() {
    this.scale = this.preferance.scale;
    this.perspective = this.preferance.perspective;
    this.angle = this.preferance.angle;
    this.gradient = this.preferance.gradient;
    this.shadow = this.preferance.shadow;
    this.frames = this.preferance.frames;
    this.mirror = this.preferance.mirror;
    this.hollow = this.preferance.hollow;
  }

  get scale() {
    return this.preferance.scale;
  }
  set scale(value) {
    if (this.preferance.scale != value) {
      this.preferance.scale = value;
      this.storage.setItem("preferance", JSON.stringify(this.preferance));
    }
    this.world.scale = value / 100 + 0.5;
    this.world.resize();
  }

  get perspective() {
    return this.preferance.perspective;
  }
  set perspective(value) {
    if (this.preferance.perspective != value) {
      this.preferance.perspective = value;
      this.storage.setItem("preferance", JSON.stringify(this.preferance));
    }
    this.world.perspective = (100.1 / (value + 0.01)) * 4 - 3;
    this.world.resize();
  }

  get angle() {
    return this.preferance.angle;
  }
  set angle(value) {
    if (this.preferance.angle != value) {
      this.preferance.angle = value;
      this.storage.setItem("preferance", JSON.stringify(this.preferance));
    }
    this.world.scene.rotation.y = ((value / 100 - 1) * Math.PI) / 2;
    this.world.dirty = true;
  }

  get gradient() {
    return this.preferance.gradient;
  }
  set gradient(value) {
    if (this.preferance.gradient != value) {
      this.preferance.gradient = value;
      this.storage.setItem("preferance", JSON.stringify(this.preferance));
    }
    this.world.scene.rotation.x = ((1 - value / 100) * Math.PI) / 2;
    this.world.dirty = true;
  }

  get shadow() {
    return this.preferance.shadow;
  }
  set shadow(value) {
    if (this.preferance.shadow != value) {
      this.preferance.shadow = value;
      this.storage.setItem("preferance", JSON.stringify(this.preferance));
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
    return this.preferance.frames;
  }
  set frames(value) {
    if (this.preferance.frames != value) {
      this.preferance.frames = value;
      this.storage.setItem("preferance", JSON.stringify(this.preferance));
    }
    CubeGroup.frames = value;
  }

  get sensitivity() {
    return this.preferance.sensitivity;
  }
  set sensitivity(value) {
    if (this.preferance.sensitivity != value) {
      this.preferance.sensitivity = value;
      this.storage.setItem("preferance", JSON.stringify(this.preferance));
    }
    let i = (value - 3) / 2;
    i = 2 ** i;
    this.world.controller.sensitivity = i;
  }

  get mirror() {
    return this.preferance.mirror;
  }
  set mirror(value) {
    if (this.preferance.mirror != value) {
      this.preferance.mirror = value;
      this.storage.setItem("preferance", JSON.stringify(this.preferance));
    }
    for (let cubelet of this.world.cube.cubelets) {
      cubelet.mirror = value;
    }
    this.world.dirty = true;
  }

  get hollow() {
    return this.preferance.hollow;
  }
  set hollow(value: boolean) {
    if (this.preferance.hollow != value) {
      this.preferance.hollow = value;
      this.storage.setItem("preferance", JSON.stringify(this.preferance));
    }
    for (let cubelet of this.world.cube.cubelets) {
      cubelet.hollow = value;
    }
    this.world.dirty = true;
  }
}
