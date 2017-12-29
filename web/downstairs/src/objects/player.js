import Phaser from "phaser";
import * as Config from "../config";


class Player extends Phaser.Sprite {
    constructor(game, x, y, key, frame, group) {
        super(game, x, y, key, frame, group);
        this.speedBouns = 0;
        this.animations.add(
            Config.PlayerAnimationName.Left,
            Config.PorkOldManAnimationFrames.Green.Left,
            Config.DefaultAnimationFrameRate,
            true,
            false
        );
        this.animations.add(
            Config.PlayerAnimationName.Right,
            Config.PorkOldManAnimationFrames.Green.Right,
            Config.DefaultAnimationFrameRate,
            true,
            false
        );
    }

    runLeft(bonus) {
        bonus = bonus || this.speedBouns;
        this.animations.play(Config.PlayerAnimationName.Left);
        this.body.velocity.x = Config.PlayerLeftSpeed + bonus;
    }

    runRight(bonus) {
        bonus = bonus || this.speedBouns;
        this.animations.play(Config.PlayerAnimationName.Right);
        this.body.velocity.x = Config.PlayerRightSpeed + bonus;
    }

    runJump() {
        this.body.velocity.y = Config.PlayerJumpSpeed;
    }

    runStand(bonus) {
        this.animations.stop();
        this.frameName = Config.PorkOldManAtlasKey.Green1;
        bonus = bonus || this.speedBouns;
        this.body.velocity.x = bonus;
    }

    runStop() {
        this.body.velocity.x = 0;
    }
}

export default Player;

