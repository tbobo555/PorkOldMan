import Phaser from "phaser";
import * as Motion from "../events/motions";
import * as Config from "../config";

class Ledge extends Phaser.Sprite {
    constructor(game, x, y, group) {
        super(game, x, y, Config.AtlasNameLedges, Config.DefaultLedgeFrameName, group);
        this.frameSet = Config.DefaultLedgeFrameSet;
        this.nameSet = Config.DefaultLedgeNameSet;
        this.name = Config.NormalLedgeName;
    }

    randLedgeType() {
        Motion.randSpriteFrameAndName(this, this.frameSet, this.nameSet);
        this.animations.stop();
        this.body.setSize(
            Config.DefaultLedgeBodySize.Width,
            Config.DefaultLedgeBodySize.Height,
            Config.DefaultLedgeBodySize.OffsetX,
            Config.DefaultLedgeBodySize.OffsetY
        );
        switch (this.name) {
        case Config.ThornLedgeName:
            this.body.setSize(
                Config.ThornLedgeBodySize.Width,
                Config.ThornLedgeBodySize.Height,
                Config.ThornLedgeBodySize.OffsetX,
                Config.ThornLedgeBodySize.OffsetY
            );
            break;
        case Config.RollLeftLedgeName:
            this.animations.play(Config.RollLeftLedgeAnimationName);
            break;
        case Config.RollRightLedgeName:
            this.animations.play(Config.RollRightLedgeAnimationName);
            break;
        }
    }

    initAnimation() {
        this.animations.add(
            Config.JumpLedgeAnimationName,
            Config.JumpLedgeAnimationFrames,
            Config.DefaultAnimationFrameRate + 10,
            false,
            false
        );
        this.animations.add(
            Config.RollLeftLedgeAnimationName,
            Config.RollLeftLedgeAnimationFrames,
            Config.DefaultAnimationFrameRate,
            true,
            false
        );
        this.animations.add(
            Config.RollRightLedgeAnimationName,
            Config.RollRightLedgeAnimationFrames,
            Config.DefaultAnimationFrameRate,
            true,
            false
        );
        this.animations.add(
            Config.SandLedgeAnimationName,
            Config.SandLedgeAnimationFrames,
            Config.DefaultAnimationFrameRate,
            false,
            false
        );
    }

    setToNormalType() {
        this.name = Config.NormalLedgeName;
        this.frameName = Config.DefaultLedgeFrameSet[0];
        this.animations.stop();
        this.body.setSize(
            Config.DefaultLedgeBodySize.Width,
            Config.DefaultLedgeBodySize.Height,
            Config.DefaultLedgeBodySize.OffsetX,
            Config.DefaultLedgeBodySize.OffsetY
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
        case Config.SandLedgeName:
            this.animations.play(Config.SandLedgeAnimationName);
            break;
        case Config.JumpLedgeName:
            this.animations.play(Config.JumpLedgeAnimationName);
            target.runJump();
            break;
        case Config.RollLeftLedgeName:
            target.speedBouns = -100;
            break;
        case Config.RollRightLedgeName:
            target.speedBouns = 100;
            break;
        default:
            break;
        }
    }
}

export default Ledge;
