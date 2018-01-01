import Phaser from "phaser";
import Hello from "../blocks/hello";

class Start extends Phaser.State {
    constructor() {
        super();
    }

    preload(){

    }

    create(game) {
        game.stage.backgroundColor = "#ffffff";
        new Hello(game);
    }

    update() {

    }
}

export default Start;
