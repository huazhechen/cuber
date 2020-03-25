import { FACE } from "./define";
import Cubelet from "./cubelet";
import CubeGroup, { GroupTable } from "./group";
import tweener from "./tweener";
import { TouchAction } from "../common/toucher";
import Cuber from "./cuber";
import { Vector3, Plane, Ray, Vector2, Matrix4 } from "three";

export class Holder {
  public vector: Vector3;
  public index: number;
  public plane: Plane;
  constructor() {
    this.vector = new Vector3();
  }
}

export default class Controller {
  public cuber: Cuber;
  public dragging = false;
  public rotating = false;
  public angle = 0;
  public taps: Function[];
  public ray = new Ray();
  public down = new Vector2(0, 0);
  public move = new Vector2(0, 0);
  public matrix = new Matrix4();
  public holder = new Holder();
  public vector = new Vector3();
  public group: CubeGroup | undefined;
  public planes = [
    new Plane(new Vector3(1, 0, 0), (-Cubelet.SIZE * 3) / 2),
    new Plane(new Vector3(0, 1, 0), (-Cubelet.SIZE * 3) / 2),
    new Plane(new Vector3(0, 0, 1), (-Cubelet.SIZE * 3) / 2)
  ];
  public _lock: boolean = false;
  get lock() {
    return this._lock;
  }
  set lock(value) {
    this.handleUp();
    this._lock = value;
  }

  public _disable: boolean = false;
  get disable() {
    return this._disable;
  }
  set disable(value) {
    this.handleUp();
    this._disable = value;
  }

  constructor(cuber: Cuber) {
    this.cuber = cuber;
    this.taps = [];
    this.loop();
  }

  loop() {
    requestAnimationFrame(this.loop.bind(this));
    this.update();
  }

  update() {
    if (this.rotating && this.group) {
      if (this.group.angle != this.angle) {
        let delta = (this.angle - this.group.angle) / 2;
        let max = (Math.PI / 2 / this.cuber.preferance.frames) * 4;
        if (delta > max) {
          delta = max;
        }
        if (delta < -max) {
          delta = -max;
        }
        this.group.angle += delta;
        this.cuber.dirty = true;
      }
    }
  }

  match() {
    let g: CubeGroup | undefined;
    if (this.holder.index === -1) {
      for (let ax of ["x", "y", "z"]) {
        g = this.cuber.cube.groups.get(ax);
        if (g?.axis.dot(this.holder.plane.normal) === 0) {
          return g;
        }
      }
    } else {
      const plane = this.holder.plane.normal;
      const finger = this.holder.vector;
      const index = this.holder.index;
      const order = this.cuber.cube.order;
      for (let axis of ["x", "y", "z"]) {
        let vector = GroupTable.AXIS_VECTOR[axis];
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
          layer = layer + 1;
          return this.cuber.cube.groups.get(GroupTable.FORMAT(axis, layer, layer));
        }
      }
    }
    return undefined;
  }

  intersect(point: Vector2, plane: Plane) {
    var x = (point.x / this.cuber.width) * 2 - 1;
    var y = -(point.y / this.cuber.height) * 2 + 1;
    this.ray.origin.setFromMatrixPosition(this.cuber.camera.matrixWorld);
    this.ray.direction
      .set(x, y, 0.5)
      .unproject(this.cuber.camera)
      .sub(this.ray.origin)
      .normalize();
    this.ray.applyMatrix4(this.matrix.identity().getInverse(this.cuber.scene.matrix));
    var result = new Vector3();
    this.ray.intersectPlane(plane, result);
    return result;
  }

  handleDown() {
    if (this.disable) {
      return;
    }
    if (this.dragging || this.rotating) {
      this.handleUp();
    }
    this.dragging = true;
    this.holder.index = -1;
    tweener.speedup();
    let distance = 0;
    this.planes.forEach(plane => {
      var point = this.intersect(this.down, plane);
      if (point !== null) {
        var x = point.x / Cubelet.SIZE / 3;
        var y = point.y / Cubelet.SIZE / 3;
        var z = point.z / Cubelet.SIZE / 3;
        if (Math.abs(x) <= 0.5 && Math.abs(y) <= 0.5 && Math.abs(z) <= 0.5) {
          let d =
            Math.pow(point.x - this.ray.origin.x, 2) +
            Math.pow(point.y - this.ray.origin.y, 2) +
            Math.pow(point.z - this.ray.origin.z, 2);
          if (distance == 0 || d < distance) {
            this.holder.plane = plane;
            let order = this.cuber.cube.order;
            x = Math.ceil((x + 0.5) * order) - 1;
            y = Math.ceil((y + 0.5) * order) - 1;
            z = Math.ceil((z + 0.5) * order) - 1;
            this.holder.index = z * order * order + y * order + x;
            if (this.holder.index == order * order + order + 1) {
              this.holder.index = -1;
            }
            distance = d;
            return;
          }
        }
      }
      return;
    }, this);
  }

  handleMove() {
    if (this.disable) {
      return;
    }
    if (this.dragging) {
      var dx = this.move.x - this.down.x;
      var dy = this.move.y - this.down.y;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (Math.min(this.cuber.width, this.cuber.height) / d > 128) {
        return true;
      }
      tweener.finish();
      if (this.cuber.cube.lock) {
        this.dragging = false;
        this.rotating = false;
        return true;
      }
      this.dragging = false;
      this.rotating = true;
      if (this.holder.index === -1) {
        if (dx * dx > dy * dy) {
          this.group = this.cuber.cube.groups.get("y");
        } else {
          let vector = new Vector3((Cubelet.SIZE * 3) / 2, 0, (Cubelet.SIZE * 3) / 2);
          vector.applyMatrix4(this.cuber.scene.matrix).project(this.cuber.camera);
          let half = this.cuber.width / 2;
          let x = Math.round(vector.x * half + half);
          if (this.down.x < x) {
            this.group = this.cuber.cube.groups.get("x");
          } else {
            this.group = this.cuber.cube.groups.get("z");
          }
        }
      } else {
        var start = this.intersect(this.down, this.holder.plane);
        var end = this.intersect(this.move, this.holder.plane);
        this.vector.subVectors(end, start);
        var x = this.vector.x;
        var y = this.vector.y;
        var z = this.vector.z;
        var max = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
        x = Math.abs(x) === max ? x : 0;
        y = Math.abs(y) === max ? y : 0;
        z = Math.abs(z) === max ? z : 0;
        this.vector.set(x, y, z);
        this.holder.vector.copy(this.vector.multiply(this.vector).normalize());

        this.group = this.match();
        this.vector.crossVectors(this.holder.vector, this.holder.plane.normal);
        this.holder.vector.multiplyScalar(this.vector.x + this.vector.y + this.vector.z);
      }
      this.group?.hold();
    }
    if (this.rotating && this.group) {
      if (this.holder.index === -1) {
        var dx = this.move.x - this.down.x;
        var dy = this.move.y - this.down.y;
        if (this.group === this.cuber.cube.groups.get("y")) {
          this.angle = ((dx / Cubelet.SIZE) * Math.PI) / 4;
        } else if (this.group === this.cuber.cube.groups.get("x")) {
          this.angle = ((dy / Cubelet.SIZE) * Math.PI) / 4;
        } else if (this.group === this.cuber.cube.groups.get("z")) {
          this.angle = ((-dy / Cubelet.SIZE) * Math.PI) / 4;
        }
      } else {
        var start = this.intersect(this.down, this.holder.plane);
        var end = this.intersect(this.move, this.holder.plane);
        this.vector.subVectors(end, start).multiply(this.holder.vector);
        this.angle =
          (((-(this.vector.x + this.vector.y + this.vector.z) *
            (this.group.axis.x + this.group.axis.y + this.group.axis.z)) /
            Cubelet.SIZE) *
            Math.PI) /
          4;
      }
    }
  }

  handleUp() {
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
      for (let tap of this.taps) {
        tap(this.holder.index, face);
      }
    }
    if (this.rotating) {
      if (this.group && this.group !== null) {
        if (!this.lock) {
          if (Math.abs(this.angle) < Math.PI / 4) {
            let tick = new Date().getTime();
            let speed = Math.abs(this.angle) / (tick - this.tick);
            if (speed > 0.001) {
              this.angle = this.angle == 0 ? 0 : ((this.angle / Math.abs(this.angle)) * Math.PI) / 2;
            }
          }
          this.group.twist(this.angle);
        } else {
          this.group.twist(0);
        }
      }
    }
    this.holder.index = -1;
    this.dragging = false;
    this.rotating = false;
    this.cuber.dirty = true;
  }

  tick: number = new Date().getTime();
  hover: number = -1;
  touch = (action: TouchAction) => {
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
