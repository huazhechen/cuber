import * as THREE from "three";

import Game from "./game";
import CubeletGroup from "./group";
import Holder from "./holder";
import Cubelet from "./cubelet";

export default class Controller {
  private _game: Game;
  private _dragging = false;
  private _rotating = false;
  private _down: THREE.Vector2;
  private _move: THREE.Vector2;
  private _ray: THREE.Ray;
  private _matrix: THREE.Matrix4;
  private _holder: Holder;
  private _vector: THREE.Vector3;
  private _group: CubeletGroup;
  private _planes: THREE.Plane[];
  private _angle: number = 0;

  public magic: boolean = true;

  constructor(game: Game) {
    this._game = game;
    this._ray = new THREE.Ray();
    this._down = new THREE.Vector2(0, 0);
    this._move = new THREE.Vector2(0, 0);
    this._matrix = new THREE.Matrix4();
    this._holder = new Holder();
    this._holder.vector = new THREE.Vector3();
    this._vector = new THREE.Vector3();
    this._planes = [
      new THREE.Plane(new THREE.Vector3(1, 0, 0), (-Cubelet.SIZE * 3) / 2),
      new THREE.Plane(new THREE.Vector3(0, 1, 0), (-Cubelet.SIZE * 3) / 2),
      new THREE.Plane(new THREE.Vector3(0, 0, 1), (-Cubelet.SIZE * 3) / 2)
    ];
    this._game.canvas.addEventListener("mousedown", this._onMouseDown);
    this._game.canvas.addEventListener("mousemove", this._onMouseMove);
    this._game.canvas.addEventListener("mouseup", this._onMouseUp);
    this._game.canvas.addEventListener("mouseout", this._onMouseOut);
    this._game.canvas.addEventListener("touchstart", this._onTouch, true);
    this._game.canvas.addEventListener("touchmove", this._onTouch, true);
    this._game.canvas.addEventListener("touchend", this._onTouch, true);
    this.loop();
  }

  loop() {
    requestAnimationFrame(this.loop.bind(this));
    this.update();
  }

  update() {
    if (this._rotating) {
      if (this._game.enable && this.magic && Math.abs(this._group.angle) > Math.PI / 8) {
        this._angle = ((this._group.angle / Math.abs(this._group.angle)) * Math.PI) / 2;
        this._handleUp();
        return;
      }
      if (this._group.angle != this._angle) {
        let delta = (this._angle - this._group.angle) / 2;
        let max = (Math.PI / this._game.duration) * 4;
        if (delta > max) {
          delta = max;
        }
        if (delta < -max) {
          delta = -max;
        }
        this._group.angle += delta;
        this._game.dirty = true;
      }
    }
  }

  _intersect(point: THREE.Vector2, plane: THREE.Plane) {
    var x = (point.x / this._game.canvas.clientWidth) * 2 - 1;
    var y = -(point.y / this._game.canvas.clientHeight) * 2 + 1;
    this._ray.origin.setFromMatrixPosition(this._game.camera.matrixWorld);
    this._ray.direction
      .set(x, y, 0.5)
      .unproject(this._game.camera)
      .sub(this._ray.origin)
      .normalize();
    this._ray.applyMatrix4(this._matrix.identity().getInverse(this._game.scene.matrix));
    var result = new THREE.Vector3();
    this._ray.intersectPlane(plane, result);
    return result;
  }

  _handleDown() {
    if (this._game.enable) {
      this._game.tweener.finish();
    }
    if (this._game.lock) {
      return true;
    }
    this._dragging = true;
    this._holder.index = -1;

    this._planes.some(plane => {
      var point = this._intersect(this._down, plane);
      if (point !== null) {
        if (
          Math.abs(point.x) <= (Cubelet.SIZE * 3) / 2 + 0.01 &&
          Math.abs(point.y) <= (Cubelet.SIZE * 3) / 2 + 0.01 &&
          Math.abs(point.z) <= (Cubelet.SIZE * 3) / 2 + 0.01
        ) {
          this._holder.plane = plane;
          var x = Math.ceil(Math.round(point.x) / Cubelet.SIZE - 0.5);
          var y = Math.ceil(Math.round(point.y) / Cubelet.SIZE - 0.5);
          var z = Math.ceil(Math.round(point.z) / Cubelet.SIZE - 0.5);
          if (this._game.enable && x < 2 && x > -2 && y < 2 && y > -2 && z < 2 && z > -2) {
            this._holder.index = (z + 1) * 9 + (y + 1) * 3 + (x + 1);
          } else {
            this._holder.index = -1;
          }
          return true;
        }
      }
      return false;
    }, this);
    this._game.dirty = true;
  }

  _handleMove() {
    if (this._dragging) {
      var dx = this._move.x - this._down.x;
      var dy = this._move.y - this._down.y;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (Math.min(this._game.canvas.clientWidth, this._game.canvas.clientHeight) / d > 100) {
        return true;
      }
      if (this._game.lock) {
        this._dragging = false;
        this._rotating = false;
        return true;
      }
      this._dragging = false;
      this._rotating = true;
      if (this._holder.index === -1) {
        if (dx * dx > dy * dy) {
          this._group = CubeletGroup.GROUPS.y;
        } else {
          let vector = new THREE.Vector3((Cubelet.SIZE * 3) / 2, 0, (Cubelet.SIZE * 3) / 2);
          vector.applyMatrix4(this._game.scene.matrix).project(this._game.camera);
          let half = this._game.canvas.clientWidth / 2;
          let x = Math.round(vector.x * half + half);
          if (this._down.x < x) {
            this._group = CubeletGroup.GROUPS.x;
          } else {
            this._group = CubeletGroup.GROUPS.z;
          }
        }
      } else {
        var start = this._intersect(this._down, this._holder.plane);
        var end = this._intersect(this._move, this._holder.plane);
        this._vector.subVectors(end, start);
        var x = this._vector.x;
        var y = this._vector.y;
        var z = this._vector.z;
        var max = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
        x = Math.abs(x) === max ? x : 0;
        y = Math.abs(y) === max ? y : 0;
        z = Math.abs(z) === max ? z : 0;
        this._vector.set(x, y, z);
        this._holder.vector.copy(this._vector.multiply(this._vector).normalize());

        let groups = this._game.twister.match(this._holder);
        groups.some(element => {
          if (element.axis.dot(this._vector) === 0) {
            this._group = element;
            return true;
          }
          return false;
        }, this);
        this._vector.crossVectors(this._holder.vector, this._holder.plane.normal);
        this._holder.vector.multiplyScalar(this._vector.x + this._vector.y + this._vector.z);
      }
      this._group.hold(this._game);
    }
    if (this._rotating) {
      if (this._holder.index === -1) {
        var dx = this._move.x - this._down.x;
        var dy = this._move.y - this._down.y;
        if (this._group === CubeletGroup.GROUPS.y) {
          this._angle = ((dx / Cubelet.SIZE) * Math.PI) / 4;
        } else {
          if (this._group === CubeletGroup.GROUPS.x) {
            this._angle = ((dy / Cubelet.SIZE) * Math.PI) / 4;
          } else {
            this._angle = ((-dy / Cubelet.SIZE) * Math.PI) / 4;
          }
        }
      } else {
        var start = this._intersect(this._down, this._holder.plane);
        var end = this._intersect(this._move, this._holder.plane);
        this._vector.subVectors(end, start).multiply(this._holder.vector);
        this._angle =
          (((-(this._vector.x + this._vector.y + this._vector.z) * (this._group.axis.x + this._group.axis.y + this._group.axis.z)) / Cubelet.SIZE) * Math.PI) /
          4;
      }
    }
  }

  _handleUp() {
    if (this._rotating) {
      if (this._group && this._group !== null) {
        if (this._game.enable) {
          for (let callback of this._game.callbacks) {
            callback(this._group.exp);
          }
          this._group.adjust(this._game, this._angle);
        } else {
          this._group.revert(this._game);
        }
      }
    }
    this._holder.index = -1;
    this._dragging = false;
    this._rotating = false;
    this._game.dirty = true;
  }

  _onMouseDown = (event: MouseEvent) => {
    this._down.x = event.offsetX;
    this._down.y = event.offsetY;

    this._handleDown();
  };

  _onMouseMove = (event: MouseEvent) => {
    this._move.x = event.offsetX;
    this._move.y = event.offsetY;
    this._handleMove();
  };
  _onMouseUp = (event: MouseEvent) => {
    this._handleUp();
  };

  _onMouseOut = (event: MouseEvent) => {
    this._handleUp();
  };

  _onTouch = (event: TouchEvent) => {
    let touches = event.changedTouches;
    let first = touches[0];
    switch (event.type) {
      case "touchstart":
        this._down.x = first.clientX;
        this._down.y = first.clientY;
        this._handleDown();
        break;
      case "touchmove":
        this._move.x = first.clientX;
        this._move.y = first.clientY;
        this._handleMove();
        break;
      case "touchend":
        this._handleUp();
        break;
      default:
        return;
    }
  };
}
