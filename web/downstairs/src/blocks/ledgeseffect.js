import Container from "../objects/container";
import Ledge from "../objects/ledge";
import * as Config from "../config";
import * as Utils from "../weblogic/utils";
import * as Motion from "../events/motions";


class LedgesEffect extends Container {
    constructor(game, ledgeNumber, normalWeight, sandWeight, thornWeight, jumpWeight, leftWeight, rightWeight) {
        super(game);

        if (ledgeNumber === undefined) {
            ledgeNumber = Config.MaxLedgesNumber;
        }
        if (normalWeight === undefined) {
            normalWeight = Config.DefaultNormalLedgeWeight;
        }
        if (sandWeight === undefined) {
            sandWeight = Config.DefaultSandLedgeWeight;
        }
        if (thornWeight === undefined) {
            thornWeight = Config.DefaultThornLedgeWeight;
        }
        if (jumpWeight === undefined) {
            jumpWeight = Config.DefaultJumpLedgeWeight;
        }
        if (leftWeight === undefined) {
            leftWeight = Config.DefaultLeftLedgeWeight;
        }
        if (rightWeight === undefined) {
            rightWeight = Config.DefaultRightLedgeWeight;
        }

        this.normalWeight = normalWeight;
        this.sandWeight = sandWeight;
        this.thornWeight = thornWeight;
        this.jumpWeight = jumpWeight;
        this.leftWeight = leftWeight;
        this.rightWeight = rightWeight;
        this.ledgesRate = this.reCalculateRate();

        // 建立 ledge 物件
        for (let i = 0; i < ledgeNumber; i++) {
            let ledge = new Ledge(game, 0, 0);
            game.physics.arcade.enable(ledge);
            ledge.body.immovable = true;
            ledge.initAnimation();
            ledge.anchor.setTo(Config.LedgePos.Anchor.X, Config.LedgePos.Anchor.Y);
            this.addAsset(i, ledge);
        }

        // 初始化所有 ledge 位置與類型
        let ledgeSet = this.getAll();
        ledgeSet.forEach((ledge, index) => {
            ledge.x = Utils.getRandomInt(Config.LedgePos.MinX, Config.LedgePos.MaxX);
            ledge.y = Config.LedgePos.BaseY + (Config.LedgePos.MarginY * index);
            if (index === Config.MiddleLedgesNumber) {
                ledge.x = Config.LedgeMiddlePos.X;
                ledge.y = Config.LedgeMiddlePos.Y;
                ledge.setToNormalType();
            } else {
                ledge.randLedgeType(this.ledgesRate);
            }
        });
    }

    reCalculateRate() {
        // 計算每種階梯比重的最大公因數
        let gcd = Utils.getArrayGCD([
            this.normalWeight,
            this.sandWeight,
            this.thornWeight,
            this.jumpWeight,
            this.leftWeight,
            this.rightWeight
        ]);

        // 將比重除以最大公因數
        this.normalWeight = this.normalWeight / gcd;
        this.sandWeight = this.sandWeight / gcd;
        this.thornWeight = this.thornWeight / gcd;
        this.jumpWeight = this.jumpWeight / gcd;
        this.leftWeight = this.leftWeight / gcd;
        this.rightWeight = this.rightWeight / gcd;

        let rate = [];
        Utils.pushElementToArray(rate, Config.LedgeTypes.Normal, this.normalWeight);
        Utils.pushElementToArray(rate, Config.LedgeTypes.Sand, this.sandWeight);
        Utils.pushElementToArray(rate, Config.LedgeTypes.Thorn, this.thornWeight);
        Utils.pushElementToArray(rate, Config.LedgeTypes.Jump, this.jumpWeight);
        Utils.pushElementToArray(rate, Config.LedgeTypes.Left, this.leftWeight);
        Utils.pushElementToArray(rate, Config.LedgeTypes.Right, this.rightWeight);
        this.ledgesRate = rate;
        return this.ledgesRate;
    }

    addLedgeWeight(type, weight) {
        if (Config.DefaultLedgeNameSet.indexOf(type) === -1) {
            return;
        }
        switch (type) {
        case Config.LedgeTypes.Normal:
            this.normalWeight += weight;
            break;
        case Config.LedgeTypes.Sand:
            this.sandWeight += weight;
            break;
        case Config.LedgeTypes.Thorn:
            this.thornWeight += weight;
            break;
        case Config.LedgeTypes.Jump:
            this.jumpWeight += weight;
            break;
        case Config.LedgeTypes.Left:
            this.leftWeight += weight;
            break;
        case Config.LedgeTypes.Right:
            this.rightWeight += weight;
            break;
        }
        this.reCalculateRate();
    }

    run() {
        let ledgesSet = this.getAll();
        ledgesSet.forEach((ledge) => {
            Motion.moveToXY(
                this.game,
                ledge,
                ledge.x,
                Config.LedgePos.MinY,
                Config.LedgeBasicSpeed,
                0,
                this.resetLedgePos.bind(this),
                this
            );
        });
    }

    resetLedgePos(ledge) {
        ledge.x = Utils.getRandomInt(
            Config.LedgePos.MinX,
            Config.LedgePos.MaxX
        );
        ledge.y = Config.LedgePos.MaxY;
        ledge.randLedgeType(this.ledgesRate);
        Motion.moveToXY(
            this.game,
            ledge,
            ledge.x,
            Config.LedgePos.MinY,
            Config.LedgeBasicSpeed,
            0,
            this.resetLedgePos.bind(this),
            this
        );
    }
}

export default LedgesEffect;
