import * as THREE from "three";

import Cube from "./cube";
import Tweener from "./tweener";
import Controller from "./controller";
import Twister from "./twister";
import Group from "./group";

export default class Game {

    public static readonly SIZE: number = 1024;
    public container: Element;
    public renderer: THREE.WebGLRenderer;
    public scene: THREE.Scene;
    public lock: boolean = false;

    public cube: Cube;
    public tweener: Tweener;
    public twister: Twister;
    public controller: Controller;
    public camera: THREE.PerspectiveCamera;

    constructor(container: Element) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 1, Game.SIZE);
        this.camera.position.x = 0;
        this.camera.position.y = 0;
        this.camera.position.z = Game.SIZE / 3;
        this.tweener = new Tweener();
        this.twister = new Twister(this);
        this.controller = new Controller(this);
        this.cube = new Cube(this);

        this.scene.add(this.cube);
        for (let key in Group.GROUPS) {
            this.scene.add(Group.GROUPS[key]);
        }

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setClearColor(0xFFFFFF);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.container.appendChild(this.renderer.domElement);
        this.loop();
    }

    render() {
        this.twister.update();
        this.tweener.update();
        this.controller.update();
        this.camera.lookAt(this.scene.position);
        this.camera.updateMatrixWorld(true);
        this.renderer.render(this.scene, this.camera);
    }

    loop() {
        requestAnimationFrame(this.loop.bind(this));
        this.render();
    }

    twist(key: string, reverse: boolean = false, times: number = 1) {
        this.twister.twist(key, reverse, times);
    }

}
