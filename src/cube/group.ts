import * as THREE from "three";

import Game from "./game";
import Cubelet from "./cubelet";

export default class Group extends THREE.Group {

    public static readonly GROUPS: { [key: string]: Group } = {
        "L": new Group([0, 3, 6, 9, 12, 15, 18, 21, 24,], new THREE.Vector3(-1, 0, 0)),
        "R": new Group([2, 5, 8, 11, 14, 17, 20, 23, 26,], new THREE.Vector3(+1, 0, 0)),
        "D": new Group([0, 1, 2, 9, 10, 11, 18, 19, 20,], new THREE.Vector3(0, -1, 0)),
        "U": new Group([6, 7, 8, 15, 16, 17, 24, 25, 26,], new THREE.Vector3(0, +1, 0)),
        "B": new Group([0, 1, 2, 3, 4, 5, 6, 7, 8,], new THREE.Vector3(0, 0, -1)),
        "F": new Group([18, 19, 20, 21, 22, 23, 24, 25, 26,], new THREE.Vector3(0, 0, +1)),
        "l": new Group([0, 3, 6, 9, 12, 15, 18, 21, 24, 1, 4, 7, 10, 13, 16, 19, 22, 25,], new THREE.Vector3(-1, 0, 0)),
        "r": new Group([2, 5, 8, 11, 14, 17, 20, 23, 26, 1, 4, 7, 10, 13, 16, 19, 22, 25,], new THREE.Vector3(+1, 0, 0)),
        "d": new Group([0, 1, 2, 9, 10, 11, 18, 19, 20, 3, 4, 5, 12, 13, 14, 21, 22, 23,], new THREE.Vector3(0, -1, 0)),
        "u": new Group([6, 7, 8, 15, 16, 17, 24, 25, 26, 3, 4, 5, 12, 13, 14, 21, 22, 23,], new THREE.Vector3(0, +1, 0)),
        "b": new Group([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,], new THREE.Vector3(0, 0, -1)),
        "f": new Group([18, 19, 20, 21, 22, 23, 24, 25, 26, 9, 10, 11, 12, 13, 14, 15, 16, 17,], new THREE.Vector3(0, 0, +1)),
        "M": new Group([1, 4, 7, 10, 13, 16, 19, 22, 25,], new THREE.Vector3(+1, 0, 0)),
        "E": new Group([3, 4, 5, 12, 13, 14, 21, 22, 23,], new THREE.Vector3(0, +1, 0)),
        "S": new Group([9, 10, 11, 12, 13, 14, 15, 16, 17,], new THREE.Vector3(0, 0, +1)),
        "x": new Group([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,], new THREE.Vector3(+1, 0, 0)),
        "y": new Group([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,], new THREE.Vector3(0, +1, 0)),
        "z": new Group([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,], new THREE.Vector3(0, 0, +1)),
    };

    private _cubelets: Cubelet[] = [];
    private _angle: number;
    private _indices: number[];
    public axis: THREE.Vector3;

    constructor(indices: number[], axis: THREE.Vector3) {
        super();
        this._indices = indices;
        this.axis = axis;
    }

    set angle(angle: number) {
        this.setRotationFromAxisAngle(this.axis, angle);
        this._angle = angle;
    }
    get angle() {
        return this._angle;
    }

    hold(game: Game): void {
        this._angle = 0;
        this._indices.forEach((i) => {
            let cubelet = game.cube.cubelets[i];
            this._cubelets.push(cubelet);
            game.cube.remove(cubelet);
            this.add(cubelet);
        }, this);
        game.lock = true;
    }

    adjust(game: Game) {
        let angle = Math.round(this._angle / (Math.PI / 2)) * (Math.PI / 2) - this._angle;
        if (angle === 0) {
            while (true) {
                let cubelet = this._cubelets.pop()
                if (undefined === cubelet) {
                    break;
                }
                this.rotate(cubelet);
                this.remove(cubelet);
                game.cube.add(cubelet);
                game.cube.cubelets[cubelet.index] = cubelet;

            }
            this._angle = 0;
            game.lock = false;
        } else {
            var duration = 600 * Math.abs(angle) / Math.PI;
            game.tweener.tween(
                this.angle,
                this.angle + angle,
                duration,
                (value: number) => {
                    this.angle = value;
                },
                () => {
                    this.adjust(game);
                })
        }
    };
    rotate(cubelet: Cubelet) {
        this.matrix.identity();
        this.matrix.makeRotationAxis(this.axis, this._angle);
        this.matrix.multiply(cubelet.matrix);
        cubelet.matrix.copy(this.matrix);
        cubelet.rotation.setFromRotationMatrix(cubelet.matrix);
        cubelet.vector = cubelet.vector.applyAxisAngle(this.axis, this._angle);
    }
}