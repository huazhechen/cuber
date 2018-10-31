import Vue from "vue";
import { Component, Inject, Watch, Prop } from "vue-property-decorator";
import Game from "../../cube/game";
import Database from "../../common/database";
import TuneMenu from "../TuneMenu";
import DataMenu from "../DataMenu";

@Component({
  template: require("./index.html"),
  components: {
    "tune-menu": TuneMenu,
    "data-menu": DataMenu
  }
})
export default class AppMenu extends Vue {
  @Inject("game")
  game: Game;

  @Inject("database")
  database: Database;

  @Prop({ required: true })
  value: boolean;

  @Watch("value")
  onValueChange(value: boolean) {
    this.$emit("input", value);
  }

  tune: boolean = false;
  data: boolean = false;

  mode(value: string) {
    this.database.option.mode = value;
    this.$emit("input", false);
  }
}
