import Phaser from "phaser";
import * as motion from "../events/motions";
import config from "../config";

class Ledge extends Phaser.Sprite {
    constructor(game, x, y, group) {
        super(game, x, y, config.AtlasNameLedges, config.DefaultLedgeFrameName, group);
        this.frameSet = config.DefaultLedgeFrameSet;
        this.nameSet = config.DefaultLedgeNameSet;
        this.name = config.NormalLedgeName;
    }

    randLedgeType() {
        motion.randSpriteFrameAndName(this, this.frameSet, this.nameSet);
        this.animations.stop();
        this.body.setSize(
            config.DefaultLedgeBodySize.Width,
            config.DefaultLedgeBodySize.Height,
            config.DefaultLedgeBodySize.OffsetX,
            config.DefaultLedgeBodySize.OffsetY
        );
        switch (this.name) {
        case config.ThornLedgeName:
            this.body.setSize(
                config.ThornLedgeBodySize.Width,
                config.ThornLedgeBodySize.Height,
                config.ThornLedgeBodySize.OffsetX,
                config.ThornLedgeBodySize.OffsetY
            );
            break;
        case config.RollLeftLedgeName:
            this.animations.play(config.RollLeftLedgeAnimationName);
            break;
        case config.RollRightLedgeName:
            this.animations.play(config.RollRightLedgeAnimationName);
            break;
        }
    }

    initAnimation() {
        this.animations.add(
            config.JumpLedgeAnimationName,
            config.JumpLedgeAnimationFrames,
            config.DefaultAnimationFrameRate + 10,
            false,
            false
        );
        this.animations.add(
            config.RollLeftLedgeAnimationName,
            config.RollLeftLedgeAnimationFrames,
            config.DefaultAnimationFrameRate,
            true,
            false
        );
        this.animations.add(
            config.RollRightLedgeAnimationName,
            config.RollRightLedgeAnimationFrames,
            config.DefaultAnimationFrameRate,
            true,
            false
        );
        this.animations.add(
            config.SandLedgeAnimationName,
            config.SandLedgeAnimationFrames,
            config.DefaultAnimationFrameRate,
            false,
            false
        );
    }

    setToNormalType() {
        this.name = config.NormalLedgeName;
        this.frameName = config.DefaultLedgeFrameSet[0];
        this.animations.stop();
        this.body.setSize(
            config.DefaultLedgeBodySize.Width,
            config.DefaultLedgeBodySize.Height,
            config.DefaultLedgeBodySize.OffsetX,
            config.DefaultLedgeBodySize.OffsetY
        );
    }

    isCanCollide(target, ignorePixelX, ignorePixelY) {
        ignorePixelX = ignorePixelX || 15;
        ignorePixelY = ignorePixelY || 15;

        // ledge 在 target 之上
        if (this.body.top < target.body.bottom - ignorePixelY) {
            return false;
        }
        // ledge 在 target 右邊
        if (target.body.right - ignorePixelX  < this.body.left ) {
            return false;
        }
        // ledge 在 target 左邊
        if (target.body.left  > this.body.right - ignorePixelX) {
            return false;
        }
        return true;
    }

    runCollideTrigger(target) {
        switch (this.name) {
        case config.SandLedgeName:
            this.animations.play(config.SandLedgeAnimationName);
            break;
        case config.JumpLedgeName:
            this.animations.play(config.JumpLedgeAnimationName);
            target.runJump();
            break;
        case config.RollLeftLedgeName:
            target.speedBouns = -100;
            break;
        case config.RollRightLedgeName:
            target.speedBouns = 100;
            break;
        default:
            break;
        }
    }
}

export default Ledge;
