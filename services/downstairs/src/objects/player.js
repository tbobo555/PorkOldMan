import Phaser from "phaser";
import * as Config from "../config";


class Player extends Phaser.Sprite {
    constructor(game, type, x, y, key) {
        if (type !== Config.PlayerType.Green && type !== Config.PlayerType.Yellow) {
            type = Config.PlayerType.Green;
        }
        let frame = Config.PorkOldManAtlasKey.Green1;
        let animationFrame = Config.PorkOldManAnimationFrames.Green;
        if (type === Config.PlayerType.Yellow) {
            frame = Config.PorkOldManAtlasKey.Yellow1;
            animationFrame = Config.PorkOldManAnimationFrames.Yellow;
        }
        super(game, x, y, key, frame);
        this.type = type;
        this.isHurted = false;
        this.isOnLedge = false;
        this.isDead = false;
        this.speedBouns = 0;
        this.dealutFrameName = frame;
        this.animations.add(
            Config.PlayerAnimationName.Left,
            animationFrame.Left,
            Config.DefaultAnimationFrameRate,
            true,
            false
        );
        this.animations.add(
            Config.PlayerAnimationName.Right,
            animationFrame.Right,
            Config.DefaultAnimationFrameRate,
            true,
            false
        );

        // create an effect to show when hurting
        this.effect = new Phaser.Sprite(this.game, this.centerX, this.centerY, key, frame);
        this.effect.anchor.setTo(0.5, 0.5);
        this.effect.scale.setTo(1.15, 1.15);
        this.effect.visible = false;
    }

    dead() {
        this.isDead = true;
        this.visible = false;
        this.body = null;
        this.effect.visible = false;
        this.animations.stop();
        this.animations.paused = true;
    }

    hurt() {
        if (this.isHurted === true) {
            return;
        }
        this.isHurted = true;
        let te = this.game.time.events.add(Phaser.Timer.SECOND * 1, () => {
            this.isHurted = false;
            this.game.time.events.remove(te);
        }, this);
    }

    showHurtEffect() {
        let toggle = true;
        let moveLoop = this.game.time.events.loop(this.game.time.physicsElapsedMS, () => {
            this.effect.x = this.centerX;
            this.effect.y = this.centerY;
            this.effect.frameName = this.frameName;
            this.effect.visible = true;
        }, this);

        let colorLoop = this.game.time.events.loop(Phaser.Timer.SECOND * 0.08, () => {
            if (toggle) {
                toggle = false;
                this.alpha = 0;
                this.effect.tint = 0xFFFE86;
            } else {
                toggle = true;
                this.alpha = 1;
                this.effect.tint = 0xFF9E80;
            }
        }, this);

        this.game.time.events.add(Phaser.Timer.SECOND * 1, () => {
            this.alpha = 1;
            this.effect.visible = false;
            this.tint = 0xffffff;
            this.game.time.events.remove(colorLoop);
            this.game.time.events.remove(moveLoop);
        }, this);
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

    runJump(bonus) {
        if (bonus === undefined) {
            bonus = -100;
        }
        this.body.velocity.y = Config.PlayerJumpSpeed + bonus;
    }

    runStand(bonus) {
        this.animations.stop();
        this.frameName = this.dealutFrameName;
        bonus = bonus || this.speedBouns;
        this.body.velocity.x = bonus;
    }

    runStop() {
        this.body.velocity.x = 0;
    }
}

export default Player;
