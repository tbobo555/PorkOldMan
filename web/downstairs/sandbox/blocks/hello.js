import Container from "../objects/container";
import Phaser from "phaser";

class Hello extends Container {
    constructor(game) {
        super(game);
        let text = `Hello! 
I'm SandBox!`;
        game.add.text(
            game.world.centerX,
            game.world.centerY,
            text
        );
    }
}

export default Hello;
