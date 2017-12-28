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

        this.player = new Player(
            game,
            config.PlayerIniX,
            config.PlayerIniY,
            config.AtlasNamePorkOldMan,
            config.DefaultPlayerFrameName
        );
        game.add.existing(this.player);
        game.physics.arcade.enable(this.player);
        this.player.body.gravity.y = config.PlayerGravityY;
        this.player.body.collideWorldBounds = true;

        this.boundsGroup = game.add.group();
        this.boundsGroup.enableBody = true;
        this.initBounds();

        let mainBox = game.add.graphics(config.MainCameraBoxDrawPos.X, config.MainCameraBoxDrawPos.Y);
        mainBox.lineStyle(2, 0x000000, 1);
        mainBox.drawRoundedRect(
            0,
            0,
            config.MainCameraBoxSize.Width,
            config.MainCameraBoxSize.Height,
            config.MainCameraBoxSize.Radius
        );
        this.mainBox = mainBox;

        let playBox = game.add.graphics(config.MainGameBoxDrawPos.X, config.MainGameBoxDrawPos.Y);
        playBox.lineStyle(1, 0x000000, 1);
        playBox.drawRoundedRect(
            0,
            0,
            config.MainGameBoxSize.Width,
            config.MainGameBoxSize.Height,
            config.MainGameBoxSize.Radius
        );
        this.playBox = playBox;

        this.cursors = game.input.keyboard.createCursorKeys();
        this.moveLedges();
    }

    update(game) {
        game.physics.arcade.collide(this.player, this.boundsGroup);
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

    initBounds() {
        let boundsUp = this.game.add.graphics(config.GameBoundsUpDrawPos.X, config.GameBoundsUpDrawPos.Y);
        boundsUp.beginFill(0xffffff, 1);
        boundsUp.drawRect(0, 0, config.GameBoundsUpSize.Width, config.GameBoundsUpSize.Height);
        this.game.physics.arcade.enable(boundsUp);
        boundsUp.body.immovable = true;
        this.boundsUp = boundsUp;
        this.boundsGroup.add(this.boundsUp);

        let boundsBottom = this.game.add.graphics(
            config.GameBoundsBottomDrawPos.X,
            config.GameBoundsBottomDrawPos.Y
        );
        boundsBottom.beginFill(0xffffff, 1);
        boundsBottom.drawRect(0, 0, config.GameBoundsBottomSize.Width, config.GameBoundsBottomSize.Height);
        this.game.physics.arcade.enable(boundsBottom);
        boundsBottom.body.immovable = true;
        this.boundsBottom = boundsBottom;
        this.boundsGroup.add(this.boundsBottom);

        let boundsLeft = this.game.add.graphics(
            config.GameBoundsLeftDrawPos.X,
            config.GameBoundsLeftDrawPos.Y
        );
        boundsLeft.beginFill(0xffffff, 1);
        boundsLeft.drawRect(0, 0, config.GameBoundsLeftSize.Width, config.GameBoundsLeftSize.Height);
        this.game.physics.arcade.enable(boundsLeft);
        boundsLeft.body.immovable = true;
        this.boundsLeft = boundsLeft;
        this.boundsGroup.add(this.boundsLeft);

        let boundsRight = this.game.add.graphics(
            config.GameBoundsRightDrawPos.X,
            config.GameBoundsRightDrawPos.Y
        );
        boundsRight.beginFill(0xffffff, 1);
        boundsRight.drawRect(0, 0, config.GameBoundsRightSize.Width, config.GameBoundsRightSize.Height);
        this.game.physics.arcade.enable(boundsRight);
        boundsRight.body.immovable = true;
        this.boundsRight = boundsRight;
        this.boundsGroup.add(this.boundsRight);
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
