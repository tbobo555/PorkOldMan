import Phaser from "phaser";
import * as Motion from "../events/motions";
import * as Config from "../config";

class Ledge extends Phaser.Sprite {
    constructor(game, x, y, group) {
        super(game, x, y, Config.LedgesAtlasName, Config.LedgesAtlasKey.NormalLedge, group);
        this.frameSet = Config.DefaultLedgeFrameSet;
        this.nameSet = Config.DefaultLedgeNameSet;
        this.name = Config.LedgeTypes.Normal;
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
        case Config.LedgeTypes.Thorn:
            this.body.setSize(
                Config.ThornLedgeBodySize.Width,
                Config.ThornLedgeBodySize.Height,
                Config.ThornLedgeBodySize.OffsetX,
                Config.ThornLedgeBodySize.OffsetY
            );
            break;
        case Config.LedgeTypes.Left:
            this.animations.play(Config.RollLeftLedgeAnimationName);
            break;
        case Config.LedgeTypes.Right:
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
        this.name = Config.LedgeTypes.Normal;
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
        return !(target.body.left  > this.body.right - ignorePixelX);
    }

    runCollideTrigger(target) {
        switch (this.name) {
        case Config.LedgeTypes.Sand:
            this.animations.play(Config.SandLedgeAnimationName);
            break;
        case Config.LedgeTypes.Jump:
            this.animations.play(Config.JumpLedgeAnimationName);
            target.runJump();
            break;
        case Config.LedgeTypes.Left:
            target.speedBouns = -100;
            break;
        case Config.LedgeTypes.Right:
            target.speedBouns = 100;
            break;
        default:
            break;
        }
    }
}

export default Ledge;
