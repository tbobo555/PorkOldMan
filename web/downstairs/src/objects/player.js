import Phaser from "phaser";
import config from "../config";


class Player extends Phaser.Sprite {
    constructor(game, x, y, key, frame, group) {
        super(game, x, y, key, frame, group);
        this.speedBouns = 0;
        this.animations.add(
            config.PlayerGoLeftAnimationName,
            config.PlayerGoLeftAnimationFrames,
            config.DefaultAnimationFrameRate,
            true,
            false
        );
        this.animations.add(
            config.PlayerGoRightAnimationName,
            config.PlayerGoRightAnimationFrames,
            config.DefaultAnimationFrameRate,
            true,
            false
        );
    }

    runLeft(bonus) {
        bonus = bonus || this.speedBouns;
        this.animations.play(config.PlayerGoLeftAnimationName);
        this.body.velocity.x = config.PlayerLeftSpeed + bonus;
    }

    runRight(bonus) {
        bonus = bonus || this.speedBouns;
        this.animations.play(config.PlayerGoRightAnimationName);
        this.body.velocity.x = config.PlayerRightSpeed + bonus;
    }

    runJump() {
        this.body.velocity.y = config.PlayerJumpSpeed;
    }

    runStand(bonus) {
        this.animations.stop();
        this.frameName = config.DefaultPlayerFrameName;
        bonus = bonus || this.speedBouns;
        this.body.velocity.x = bonus;
    }

    runStop() {
        this.body.velocity.x = 0;
    }
}

export default Player;

