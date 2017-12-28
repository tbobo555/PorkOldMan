import Phaser from "phaser";
import config from "../config";
import * as motion from  "../events/motions";
import * as utils from "../weblogic/utils";
import Ledge from "../objects/ledge";
import Player from "../objects/player";

class Play1PState extends Phaser.State{
    create(game) {
        // group顯示順序初始化
        this.ledgesGroup = game.add.group();
        this.ledgesGroup.enableBody = true;
        this.bounds = game.add.group();
        this.bounds.enableBody = true;

        // 設置ledges
        for (let i = 0; i < 8; i++) {
            let ledge = new Ledge(game, config.LedgeIniPos.X, config.LedgeIniPos.Y);
            this.ledgesGroup.add(ledge);
            game.physics.arcade.enable(ledge);
            ledge.body.immovable = true;
            ledge.initAnimation();
            ledge.anchor.y = 1.0;
        }
        this.initLedgesPosition();

        this.player = new Player(game, config.PlayerIniX, config.PlayerIniY,
            config.AtlasNamePorkOldMan, config.DefaultPlayerFrameName);
        game.add.existing(this.player);
        game.physics.arcade.enable(this.player);
        this.player.body.gravity.y = config.PlayerGravityY;
        this.player.body.collideWorldBounds = true;

        this.cursors = game.input.keyboard.createCursorKeys();
        this.moveLedges();
    }

    update(game) {
        this.player.runStop();

        let isPlayerCollideLedges = false;
        if (this.player.top > 115) {
            let ledgesGroup = this.ledgesGroup.getAll();
            ledgesGroup.forEach((item) => {
                if (item.name === config.SandLedgeName &&
                    item.animations.currentAnim.isPlaying === true &&
                    item.frameName !== "sand-ledge-01.png") {
                    return;
                }
                if (!item.isCanCollide(this.player, 15, 30)) {
                    return;
                }
                let isCollide = game.physics.arcade.collide(this.player, item);
                if (isCollide === true) {
                    isPlayerCollideLedges = true;
                    this.player.speedBouns = 0;
                    item.runCollideTrigger(this.player);
                }
            });
        }

        if (this.cursors.left.isDown)
        {
            if (this.player.speedBouns > 0 && isPlayerCollideLedges === false) {
                this.player.speedBouns = 0;
            }
            this.player.runLeft();
        } else if (this.cursors.right.isDown)
        {
            if (this.player.speedBouns < 0  && isPlayerCollideLedges === false) {
                this.player.speedBouns = 0;
            }
            this.player.runRight();
        } else {
            if (isPlayerCollideLedges === false) {
                this.player.speedBouns = 0;
            }
            this.player.runStand();
        }

        //todo: fix dec
        if (this.cursors.up.isDown && this.player.body.touching.down )
        {
            //todo: fix dec
            this.player.body.velocity.y = -800;
        }
    }

    initLedgesPosition() {
        let ledgeSet = this.ledgesGroup.getAll();
        ledgeSet.forEach((item, index) => {
            item.x = utils.getRandomInt(config.LedgeRandXRange.Min, config.LedgeRandXRange.Max);
            item.y = config.LedgeBasePosHeight + (config.LedgeMarginHeight * index);
            if (index === 4) {
                item.x = config.LedgeMiddleBasePos.X;
                item.y = config.LedgeMiddleBasePos.Y;
                item.setToNormalType();
            } else {
                item.randLedgeType();
            }
        });
    }

    moveLedges() {
        let a = this.ledgesGroup.getAll();
        a.forEach((item) => {
            motion.moveToXY(this.game, item, item.x, 40, 100, 0, this.resetLedge.bind(this), this);
        });
    }

    resetLedge(ledge) {
        ledge.x = utils.getRandomInt(config.LedgeRandXRange.Min, config.LedgeRandXRange.Max);
        ledge.y = config.LedgeIniPos.Y;
        ledge.randLedgeType();
        motion.moveToXY(this.game, ledge, ledge.x, 40, 100, 0, this.resetLedge.bind(this), this);
    }
}

export default Play1PState;
