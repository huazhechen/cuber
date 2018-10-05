import Vue from 'vue'
import { Component, Prop, Inject } from "vue-property-decorator";
import App from "../App";

@Component({
    template: require("./index.html")
})
export default class KeyboardPanel extends Vue {

    queue: string[] = [];

    @Inject('app')
    app: App

    @Prop({ default: false })
    show: boolean

    @Prop({ default: false })
    disabled: boolean

    shift: string[] = [];
    operations: string[] = [
        "L",
        "D",
        "B",
        "R",
        "U",
        "F",
        "l",
        "d",
        "b",
        "r",
        "u",
        "f",
        "M",
        "E",
        "S",
        "x",
        "y",
        "z"
    ];

    get suffix() {
        let result: string = "";
        result = result.concat(this.shift.indexOf("reverse") == -1 ? "" : "'");
        result = result.concat(this.shift.indexOf("double") == -1 ? "" : "2");
        return result;
    }

    twist(operation: string) {
        this.queue.push(operation);
        this.app.game.twister.twist(operation, false, 1, this.callback, false);
    }

    callback() {
        this.queue.shift();
    }

}