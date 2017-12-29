import Phaser from "phaser";
import * as Config from "../config";


class Player extends Phaser.Sprite {
    constructor(game, x, y, key, frame, group) {
        super(game, x, y, key, frame, group);
        this.speedBouns = 0;
        this.animations.add(
            Config.PlayerGoLeftAnimationName,
            Config.PlayerGoLeftAnimationFrames,
            Config.DefaultAnimationFrameRate,
            true,
            false
        );
        this.animations.add(
            Config.PlayerGoRightAnimationName,
            Config.PlayerGoRightAnimationFrames,
            Config.DefaultAnimationFrameRate,
            true,
            false
        );
    }

    runLeft(bonus) {
        bonus = bonus || this.speedBouns;
        this.animations.play(Config.PlayerGoLeftAnimationName);
        this.body.velocity.x = Config.PlayerLeftSpeed + bonus;
    }

    runRight(bonus) {
        bonus = bonus || this.speedBouns;
        this.animations.play(Config.PlayerGoRightAnimationName);
        this.body.velocity.x = Config.PlayerRightSpeed + bonus;
    }

    runJump() {
        this.body.velocity.y = Config.PlayerJumpSpeed;
    }

    runStand(bonus) {
        this.animations.stop();
        this.frameName = Config.DefaultPlayerFrameName;
        bonus = bonus || this.speedBouns;
        this.body.velocity.x = bonus;
    }

    runStop() {
        this.body.velocity.x = 0;
    }
}

export default Player;

