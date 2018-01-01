import "pixi";
import "p2";
import Phaser from "phaser";
import Start from "./states/start";

class SandBoxGame extends Phaser.Game {
    constructor() {
        super(800, 600, Phaser.AUTO, "container");
        this.state.add("Start", Start, false);
        this.state.start("Start");
    }
}

export default SandBoxGame;
