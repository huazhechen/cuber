import { FACE } from "./define";
import Cubelet from "./cubelet";
import CubeGroup from "./group";
import * as THREE from "three";
import World from "./world";
import tweener from "./tweener";
import { TwistAction } from "./twister";

export class TouchAction {
  type: string;
  x: number;
  y: number;
  constructor(type: string, x: number, y: number) {
    this.type = type;
    this.x = x;
    this.y = y;
  }
}

export class Holder {
  public vector: THREE.Vector3;
  public index: number;
  public plane: THREE.Plane;
  constructor() {
    this.vector = new THREE.Vector3();
  }
}

export default class Controller {
  public dragging = false;
  public rotating = false;
  public angle = 0;
  public contingle = 0;
  public taps: ((index: number, face: FACE | null) => void)[];
  public ray = new THREE.Ray();
  public down = new THREE.Vector2(0, 0);
  public move = new THREE.Vector2(0, 0);
  public matrix = new THREE.Matrix4();
  public holder = new Holder();
  public vector = new THREE.Vector3();
  public group: CubeGroup | null;
  public axis: string;
  public planes = [
    new THREE.Plane(new THREE.Vector3(1, 0, 0), (-Cubelet.SIZE * 3) / 2),
    new THREE.Plane(new THREE.Vector3(0, 1, 0), (-Cubelet.SIZE * 3) / 2),
    new THREE.Plane(new THREE.Vector3(0, 0, 1), (-Cubelet.SIZE * 3) / 2),
    new THREE.Plane(new THREE.Vector3(-1, 0, 0), (-Cubelet.SIZE * 3) / 2),
    new THREE.Plane(new THREE.Vector3(0, -1, 0), (-Cubelet.SIZE * 3) / 2),
  ];
  public _lock = false;
  get lock(): boolean {
    return this._lock;
  }
  set lock(value: boolean) {
    this.handleUp();
    this._lock = value;
  }

  public _disable = false;
  get disable(): boolean {
    return this._disable;
  }
  set disable(value: boolean) {
    this.handleUp();
    this._disable = value;
  }

  world: World;
  sensitivity = 0.5;
  constructor(world: World) {
    this.world = world;
    this.taps = [];
    this.loop();
  }

  loop(): void {
    requestAnimationFrame(this.loop.bind(this));
    this.update();
  }

  update(): void {
    const angle = this.contingle + this.angle;
    if (this.rotating) {
      if (this.group) {
        if (this.group.angle != angle) {
          const delta = (angle - this.group.angle) / 2;
          this.group.angle += delta;
          this.world.dirty = true;
        }
      } else {
        const groups = this.world.cube.table.groups[this.axis[0]];
        for (const group of groups) {
          if (group.angle != angle) {
            const delta = (angle - group.angle) / 2;
            group.angle += delta;
            this.world.dirty = true;
          }
        }
      }
    }
  }

  match(): CubeGroup | null {
    const plane = this.holder.plane.normal;
    const finger = this.holder.vector;
    const index = this.holder.index;
    const order = this.world.cube.order;
    for (const axis of ["x", "y", "z"]) {
      const vector = CubeGroup.AXIS_VECTOR[axis];
      if (vector.dot(plane) === 0 && vector.dot(finger) === 0) {
        let layer = 0;
        switch (axis) {
          case "x":
            layer = index % order;
            break;
          case "y":
            layer = Math.floor((index % (order * order)) / order);
            break;
          case "z":
            layer = Math.floor(index / (order * order));
            break;
        }
        return this.world.cube.table.groups[axis][layer];
      }
    }
    return null;
  }

  intersect(point: THREE.Vector2, plane: THREE.Plane): THREE.Vector3 {
    const x = (point.x / this.world.width) * 2 - 1;
    const y = -(point.y / this.world.height) * 2 + 1;
    this.ray.origin.setFromMatrixPosition(this.world.camera.matrixWorld);
    this.ray.direction.set(x, y, 0.5).unproject(this.world.camera).sub(this.ray.origin).normalize();
    this.matrix.copy(this.world.scene.matrix);
    this.matrix.invert();
    this.ray.applyMatrix4(this.matrix);
    const result = new THREE.Vector3(Infinity, Infinity, Infinity);
    this.ray.intersectPlane(plane, result);
    return result;
  }

  handleDown(): void {
    if (this.disable) {
      return;
    }
    if (this.dragging || this.rotating) {
      this.handleUp();
    }
    this.dragging = true;
    this.holder.index = -1;
    let distance = 0;
    this.planes.forEach((plane) => {
      const point = this.intersect(this.down, plane);
      if (point !== null) {
        let x = point.x / Cubelet.SIZE / 3;
        let y = point.y / Cubelet.SIZE / 3;
        let z = point.z / Cubelet.SIZE / 3;
        if (Math.abs(x) <= 0.5001 && Math.abs(y) <= 0.5001 && Math.abs(z) <= 0.5001) {
          const d =
            Math.pow(point.x - this.ray.origin.x, 2) +
            Math.pow(point.y - this.ray.origin.y, 2) +
            Math.pow(point.z - this.ray.origin.z, 2);
          if (distance == 0 || d < distance) {
            this.holder.plane = plane;
            const order = this.world.cube.order;
            x = Math.max(0, Math.min(order - 1, Math.floor((x + 0.5) * order)));
            y = Math.max(0, Math.min(order - 1, Math.floor((y + 0.5) * order)));
            z = Math.max(0, Math.min(order - 1, Math.floor((z + 0.5) * order)));
            this.holder.index = z * order * order + y * order + x;
            distance = d;
          }
        }
      }
    }, this);
  }

  handleMove(): void {
    if (this.disable) {
      return;
    }
    if (this.dragging) {
      const dx = this.move.x - this.down.x;
      const dy = this.move.y - this.down.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (Math.min(this.world.width, this.world.height) / d > 128) {
        return;
      }
      this.dragging = false;
      this.rotating = true;
      if (this.holder.index === -1) {
        if (dx * dx > dy * dy) {
          this.axis = "y";
        } else {
          const half = this.world.width / 2;
          const lf = new THREE.Vector3(-(Cubelet.SIZE * 3) / 2, 0, (Cubelet.SIZE * 3) / 2);
          lf.applyMatrix4(this.world.scene.matrix).project(this.world.camera);
          const lx = Math.round(lf.x * half + half);

          const rf = new THREE.Vector3((Cubelet.SIZE * 3) / 2, 0, (Cubelet.SIZE * 3) / 2);
          rf.applyMatrix4(this.world.scene.matrix).project(this.world.camera);
          const rx = Math.round(rf.x * half + half);
          if (lf.z < rf.z) {
            if (this.down.x < lx) {
              this.axis = "z'";
            } else {
              this.axis = "x";
            }
          } else {
            if (this.down.x < rx) {
              this.axis = "x";
            } else {
              this.axis = "z";
            }
          }
        }
        this.group = null;
        const contingle: Set<number> = new Set();
        for (const group of this.world.cube.table.groups[this.axis[0]]) {
          let success = group.drag();
          while (!success) {
            tweener.finish();
            success = group.drag();
          }
          contingle.add(group.angle);
        }
        if (contingle.size == 1) {
          for (const value of contingle.values()) {
            this.contingle = value;
            break;
          }
        } else {
          this.contingle = 0;
        }
      } else {
        const start = this.intersect(this.down, this.holder.plane);
        const end = this.intersect(this.move, this.holder.plane);
        this.vector.subVectors(end, start);
        let x = this.vector.x;
        let y = this.vector.y;
        let z = this.vector.z;
        const max = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
        x = Math.abs(x) === max ? x : 0;
        y = Math.abs(y) === max ? y : 0;
        z = Math.abs(z) === max ? z : 0;
        this.vector.set(x, y, z);
        this.holder.vector.copy(this.vector.multiply(this.vector).normalize());

        this.group = this.match();
        if (!this.group) {
          this.rotating = false;
          return;
        }
        let success = this.group.drag();
        while (!success) {
          tweener.finish();
          success = this.group.drag();
        }
        this.contingle = this.group.angle;
        this.vector.crossVectors(this.holder.vector, this.holder.plane.normal);
        this.holder.vector.multiplyScalar(this.vector.x + this.vector.y + this.vector.z);
      }
    }
    if (this.rotating) {
      if (this.group) {
        const start = this.intersect(this.down, this.holder.plane);
        const end = this.intersect(this.move, this.holder.plane);
        this.vector.subVectors(end, start).multiply(this.holder.vector);
        const vector = CubeGroup.AXIS_VECTOR[this.group.axis];
        this.angle =
          ((-(this.vector.x + this.vector.y + this.vector.z) * (vector.x + vector.y + vector.z)) / Cubelet.SIZE) *
          Math.PI *
          this.sensitivity;
      } else {
        const dx = this.move.x - this.down.x;
        const dy = this.move.y - this.down.y;
        switch (this.axis) {
          case "y":
            this.angle = (-dx / Cubelet.SIZE) * Math.PI * this.sensitivity;
            break;
          case "x":
            this.angle = (-dy / Cubelet.SIZE) * Math.PI * this.sensitivity;
            break;
          case "z":
            this.angle = (dy / Cubelet.SIZE) * Math.PI * this.sensitivity;
            break;
          case "z'":
            this.angle = (-dy / Cubelet.SIZE) * Math.PI * this.sensitivity;
            break;
          default:
            this.angle = 0;
            break;
        }
      }
    }
  }

  handleUp(): void {
    if (this.dragging) {
      let face = null;
      switch (this.holder.plane) {
        case this.planes[0]:
          face = FACE.R;
          break;
        case this.planes[1]:
          face = FACE.U;
          break;
        case this.planes[2]:
          face = FACE.F;
          break;
      }
      for (const tap of this.taps) {
        tap(this.holder.index, face);
      }
    }
    if (this.rotating) {
      let angle = this.angle;
      if (!this.lock) {
        if (Math.abs(angle) < Math.PI / 4) {
          const tick = new Date().getTime();
          const speed = (Math.abs(angle) / (tick - this.tick)) * 1000;
          if (speed > 0.2) {
            angle = angle == 0 ? 0 : ((angle / Math.abs(angle)) * Math.PI) / 2;
          }
        }
        angle = angle + this.contingle;
      } else {
        angle = 0;
      }
      if (this.group) {
        this.group.twist(angle, false);
        if (angle != 0) {
          let times = Math.round(angle / (Math.PI / 2));
          const reverse = times < 0;
          times = Math.abs(times);
          this.world.cube.record(new TwistAction(this.group.name, reverse, times));
        }
      } else {
        const groups = this.world.cube.table.groups[this.axis[0]];
        for (const group of groups) {
          group.twist(angle, false);
        }
        if (angle != 0) {
          let times = Math.round(angle / (Math.PI / 2));
          const reverse = times < 0;
          times = Math.abs(times);
          this.world.cube.record(new TwistAction(this.axis, reverse, times));
        }
      }
    }
    this.group = null;
    this.holder.index = -1;
    this.dragging = false;
    this.rotating = false;
    this.world.dirty = true;
  }

  tick: number = new Date().getTime();
  hover = -1;
  touch = (action: TouchAction): boolean => {
    switch (action.type) {
      case "touchstart":
      case "mousedown":
        this.down.x = action.x;
        this.down.y = action.y;
        this.tick = new Date().getTime();
        this.handleDown();
        break;
      case "mousemove":
      case "touchmove":
        this.move.x = action.x;
        this.move.y = action.y;
        this.handleMove();
        break;
      case "touchend":
      case "touchcancel":
      case "mouseup":
      case "mouseout":
        this.handleUp();
        break;
      default:
        return false;
    }
    return true;
  };
}
