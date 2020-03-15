import { FACE } from "./define";
import Cubelet from "./cubelet";
import CubeGroup from "./group";
import { tweener } from "./tweener";
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
  public group: CubeGroup;
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
    if (this.rotating) {
      if (this.group.angle != this.angle) {
        let delta = (this.angle - this.group.angle) / 2;
        let max = (Math.PI / 2 / this.cuber.cube.duration) * 4;
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
    let g;
    let result = [];

    var index = this.holder.index;
    if (this.holder.index === -1) {
      g = this.cuber.cube.groups.x;
      if (g.axis.dot(this.holder.plane.normal) === 0) {
        result.push(g);
      }
      g = this.cuber.cube.groups.y;
      if (g.axis.dot(this.holder.plane.normal) === 0) {
        result.push(g);
      }
      g = this.cuber.cube.groups.z;
      if (g.axis.dot(this.holder.plane.normal) === 0) {
        result.push(g);
      }
      return result;
    }
    var x = (index % 3) - 1;
    var y = Math.floor((index % 9) / 3) - 1;
    var z = Math.floor(index / 9) - 1;
    switch (x) {
      case -1:
        g = this.cuber.cube.groups.L;
        if (g.axis.dot(this.holder.plane.normal) === 0) {
          result.push(g);
        }
        break;
      case 0:
        g = this.cuber.cube.groups.M;
        if (g.axis.dot(this.holder.plane.normal) === 0) {
          result.push(g);
        }
        break;
      case 1:
        g = this.cuber.cube.groups.R;
        if (g.axis.dot(this.holder.plane.normal) === 0) {
          result.push(g);
        }
        break;
      default:
        break;
    }
    switch (y) {
      case -1:
        g = this.cuber.cube.groups.D;
        if (g.axis.dot(this.holder.plane.normal) === 0) {
          result.push(g);
        }
        break;
      case 0:
        g = this.cuber.cube.groups.E;
        if (g.axis.dot(this.holder.plane.normal) === 0) {
          result.push(g);
        }
        break;
      case 1:
        g = this.cuber.cube.groups.U;
        if (g.axis.dot(this.holder.plane.normal) === 0) {
          result.push(g);
        }
        break;
      default:
        break;
    }
    switch (z) {
      case -1:
        g = this.cuber.cube.groups.B;
        if (g.axis.dot(this.holder.plane.normal) === 0) {
          result.push(g);
        }
        break;
      case 0:
        g = this.cuber.cube.groups.S;
        if (g.axis.dot(this.holder.plane.normal) === 0) {
          result.push(g);
        }
        break;
      case 1:
        g = this.cuber.cube.groups.F;
        if (g.axis.dot(this.holder.plane.normal) === 0) {
          result.push(g);
        }
        break;
      default:
        break;
    }
    return result;
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
    this.ray.applyMatrix4(
      this.matrix.identity().getInverse(this.cuber.scene.matrix)
    );
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
        if (
          Math.abs(point.x) <= (Cubelet.SIZE * 3) / 2 + 0.01 &&
          Math.abs(point.y) <= (Cubelet.SIZE * 3) / 2 + 0.01 &&
          Math.abs(point.z) <= (Cubelet.SIZE * 3) / 2 + 0.01
        ) {
          let d =
            Math.pow(point.x - this.ray.origin.x, 2) +
            Math.pow(point.y - this.ray.origin.y, 2) +
            Math.pow(point.z - this.ray.origin.z, 2);
          if (distance == 0 || d < distance) {
            this.holder.plane = plane;
            var x = Math.ceil(Math.round(point.x) / Cubelet.SIZE - 0.5);
            var y = Math.ceil(Math.round(point.y) / Cubelet.SIZE - 0.5);
            var z = Math.ceil(Math.round(point.z) / Cubelet.SIZE - 0.5);
            if (x < 2 && x > -2 && y < 2 && y > -2 && z < 2 && z > -2) {
              this.holder.index = (z + 1) * 9 + (y + 1) * 3 + (x + 1);
              if (this.holder.index == 13) {
                this.holder.index = -1;
              }
            } else {
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
          this.group = this.cuber.cube.groups.y;
        } else {
          let vector = new Vector3(
            (Cubelet.SIZE * 3) / 2,
            0,
            (Cubelet.SIZE * 3) / 2
          );
          vector
            .applyMatrix4(this.cuber.scene.matrix)
            .project(this.cuber.camera);
          let half = this.cuber.width / 2;
          let x = Math.round(vector.x * half + half);
          if (this.down.x < x) {
            this.group = this.cuber.cube.groups.x;
          } else {
            this.group = this.cuber.cube.groups.z;
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

        let groups = this.match();
        groups.some(element => {
          if (element.axis.dot(this.vector) === 0) {
            this.group = element;
            return true;
          }
          return false;
        }, this);
        this.vector.crossVectors(this.holder.vector, this.holder.plane.normal);
        this.holder.vector.multiplyScalar(
          this.vector.x + this.vector.y + this.vector.z
        );
      }
      this.group.hold();
    }
    if (this.rotating) {
      if (this.holder.index === -1) {
        var dx = this.move.x - this.down.x;
        var dy = this.move.y - this.down.y;
        if (this.group === this.cuber.cube.groups.y) {
          this.angle = ((dx / Cubelet.SIZE) * Math.PI) / 4;
        } else {
          if (this.group === this.cuber.cube.groups.x) {
            this.angle = ((dy / Cubelet.SIZE) * Math.PI) / 4;
          } else {
            this.angle = ((-dy / Cubelet.SIZE) * Math.PI) / 4;
          }
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
              this.angle =
                this.angle == 0
                  ? 0
                  : ((this.angle / Math.abs(this.angle)) * Math.PI) / 2;
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
