import * as THREE from "three";
import Cubelet from "./cubelet";
import Game from "./game";

export default class Cube extends THREE.Group {

    public cubelets: Cubelet[] = [];
    public lock: Boolean = false;

    constructor(game: Game) {
        super();
        for (var i = 0; i < 27; i++) {
            let cubelet = new Cubelet(i);
            this.cubelets.push(cubelet);
            this.add(cubelet);
        }
    }
}