import Phaser from "phaser";
import config from "../config";
import * as utils from "../weblogic/utils";


class Play1PState extends Phaser.State{
    constructor(){
        super();
        this.accLeft = false;
        this.accRight = false;
    }

    create(game) {
        // 動畫設置
        this.jumpAnimationFrames = ["jump-ledge-02.png", "jump-ledge-02.png", "jump-ledge-03.png",   "jump-ledge-03.png", "jump-ledge-01.png"];
        this.rollLeftAnimationFrames = ["left-ledge-01.png", "left-ledge-02.png", "left-ledge-03.png", "left-ledge-04.png", "left-ledge-05.png", "left-ledge-06.png"];
        this.rollRightAnimationFrames = ["right-ledge-01.png", "right-ledge-02.png", "right-ledge-03.png", "right-ledge-04.png", "right-ledge-05.png", "right-ledge-06.png"];
        this.sandAnimationFrames = ["sand-ledge-01.png", "sand-ledge-01.png", "sand-ledge-02.png", "sand-ledge-03.png", "sand-ledge-04.png", "sand-ledge-05.png", "sand-ledge-06.png", "sand-ledge-01.png"];

        // group顯示順序初始化
        this.noCollide = game.add.group();
        this.noCollide.enableBody = true;
        this.platforms = game.add.group();
        this.platforms.enableBody = true;
        this.bounds = game.add.group();
        this.bounds.enableBody = true;
        this.noCollideBounds = game.add.group();
        this.noCollideBounds.enableBody = true;

        // 設置bounds
        let leftBound = this.bounds.create(0, 0, config.AtlasNameMainTexture, "bound-left.png");
        leftBound.body.immovable = true;
        let rightBound = this.bounds.create(game.camera.width - 60, 0, config.AtlasNameMainTexture, "bound-right.png");
        rightBound.body.immovable = true;
        let upBound = this.bounds.create(0, 0, config.AtlasNameMainTexture, "bound-up.png");
        upBound.body.immovable = true;
        let bottomBound = this.noCollideBounds.create(0, game.camera.height-2, config.AtlasNameMainTexture, "bound-bottom.png");
        bottomBound.body.immovable = true;

        // 設置ledges
        for (let i = 0; i < 8; i++) {
            let ledge = this.platforms.create(0, game.camera.height, config.AtlasNameLedges, "normal-ledge.png");
            ledge.body.immovable = true;
            ledge.name = "normal";
            ledge.animations.add("jump", this.jumpAnimationFrames, 30, false, false);
            ledge.animations.add("left", this.rollLeftAnimationFrames, 20, true, false);
            ledge.animations.add("right", this.rollRightAnimationFrames, 20, true, false);
            ledge.animations.add("sand", this.sandAnimationFrames, 20, false, false);
            ledge.anchor.y = 1.0;
        }
        this.initLedgesPosition();

        // 設定角色動畫
        this.player = game.add.sprite(config.PlayerIniX, config.PlayerIniY, config.AtlasNamePorkOldMan, "porkoldman-green-01.png");
        // animation
        this.player.animations.add("walk-left", ["porkoldman-green-02.png", "porkoldman-green-03.png", "porkoldman-green-02.png", "porkoldman-green-04.png"], 20, true, false);
        this.player.animations.add("walk-right", ["porkoldman-green-05.png", "porkoldman-green-06.png", "porkoldman-green-05.png", "porkoldman-green-07.png"], 20, true, false);

        //  We need to enable physics on the player
        game.physics.arcade.enable(this.player);
        //  Player physics properties. Give the little guy a slight bounce.
        this.player.body.gravity.y = config.PlayerGravityY;
        this.player.body.collideWorldBounds = true;

        this.cursors = game.input.keyboard.createCursorKeys();
        this.moveLedges();
    }

    update(game) {
        game.physics.arcade.collide(this.player, this.bounds);
        //  Reset the players velocity (movement)
        this.player.body.velocity.x = 0;

        let hitPlatform = false;
        if (this.player.y > 115) {
            let a = this.platforms.getAll();
            a.forEach((item) => {
                if (item.y - this.player.y <= this.player.height - 5) {
                    this.platforms.remove(item, false, true);
                    this.noCollide.add(item);
                } else {
                    if (item.x > this.player.x) {
                        if (item.x - this.player.x >= this.player.width - 7) {
                            this.platforms.remove(item, false, true);
                            this.noCollide.add(item);
                        }
                    } else {
                        if (this.player.x - item.x >= item.width - 7) {
                            this.platforms.remove(item, false, true);
                            this.noCollide.add(item);
                        }
                    }
                }
            });

            let b = this.noCollide.getAll();
            b.forEach((item) => {
                if (item.x > this.player.x) {
                    if ((item.y - this.player.y > this.player.height - 5) && (item.x - this.player.x < this.player.width - 7)) {
                        this.noCollide.remove(item, false, true);
                        this.platforms.add(item);
                    }
                } else {
                    if ((item.y - this.player.y > this.player.height - 5) && (this.player.x - item.x < item.width - 7)) {
                        this.noCollide.remove(item, false, true);
                        this.platforms.add(item);
                    }
                }
            });

            a = this.platforms.getAll();
            a.forEach((item) => {
                if (item.name === "sand" && item.animations.currentAnim.isPlaying === true && item.frameName !== "sand-ledge-01.png") {
                    return;
                }
                let isCollide = game.physics.arcade.collide(this.player, item);
                if (isCollide === true) {
                    hitPlatform = true;
                    this.accLeft = false;
                    this.accRight = false;
                    switch (item.name) {
                    case "sand":
                        item.animations.play("sand");
                        break;
                    case "jump":
                        item.animations.play("jump");
                        this.player.body.velocity.y = -300;
                        break;
                    case "left":
                        this.accLeft = true;
                        this.player.body.velocity.x = -100;
                        break;
                    case "right":
                        this.accRight = true;
                        this.player.body.velocity.x = 100;
                        break;
                    default:
                        break;
                    }
                }
            });
        }

        if (this.cursors.left.isDown)
        {
            if (this.accLeft === true) {
                this.player.body.velocity.x = -380;
            }
            else if (this.accRight === true && hitPlatform === true) {
                this.player.body.velocity.x = -130;
            } else {
                this.accRight = false;
                this.player.body.velocity.x = -220;
            }
            this.player.animations.play("walk-left");
        }
        else if (this.cursors.right.isDown)
        {
            if (this.accRight === true) {
                this.player.body.velocity.x = 380;
            }
            else if (this.accLeft === true && hitPlatform === true) {
                this.player.body.velocity.x = 130;
            } else {
                this.accLeft = false;
                this.player.body.velocity.x = 220;
            }
            this.player.animations.play("walk-right");
        }
        else {
            //  Stand still
            this.player.animations.stop();
            this.player.frameName = "porkoldman-green-01.png";
        }

        //  Allow the player to jump if they are touching the ground.
        //todo: fix dec
        // if (cursors.up.isDown && player.body.touching.down && hitPlatform)
        if (this.cursors.up.isDown && this.player.body.touching.down )
        {
            //todo: fix dec
            this.player.body.velocity.y = -800;
        }
    }

    initLedgesPosition() {
        let a = this.platforms.getAll();
        a.forEach((item, index) => {
            item.x = utils.getRandomInt(60, 620);
            item.y = 105 + (90 * index);
            if (index === 4) {
                item.x = 350;
            }
            Play1PState.randLedgeType(item);
        });
    }

    moveLedges() {
        let a = this.platforms.getAll();
        a.forEach((item) => {
            this.moveToXY(item, item.x, 40, 100, 0, this.resetLedge.bind(this));
        });
    }

    static randLedgeType(ledge) {
        let index = utils.getRandomInt(0, 5);
        //var select = type[index];
        ledge.animations.stop();
        switch (index) {
        case 0:
            ledge.name = "normal";
            ledge.frameName = "normal-ledge.png";
            ledge.body.setSize(180, 30, 0, 0);
            break;
        case 1:
            ledge.name = "sand";
            ledge.frameName = "sand-ledge-01.png";
            ledge.body.setSize(180, 30, 0, 0);
            break;
        case 2:
            ledge.name = "thorn";
            ledge.frameName = "thorn-ledge.png";
            ledge.body.setSize(180, 30, 0, 30);
            break;
        case 3:
            ledge.name = "jump";
            ledge.frameName = "jump-ledge-01.png";
            ledge.body.setSize(180, 30, 0, 0);
            break;
        case 4:
            ledge.name = "left";
            ledge.frameName = "left-ledge-01.png";
            ledge.body.setSize(180, 30, 0, 0);
            ledge.animations.play("left");
            break;
        case 5:
            ledge.name = "right";
            ledge.frameName = "right-ledge-01.png";
            ledge.body.setSize(180, 30, 0, 0);
            ledge.animations.play("right");
            break;
        default:
            ledge.name = "normal";
            ledge.frameName = "normal-ledge.png";
            ledge.body.setSize(180, 30, 0, 0);
            break;
        }
    }

    resetLedge(ledge) {
        ledge.x = utils.getRandomInt(60, 620);
        ledge.y = this.game.camera.height;
        Play1PState.randLedgeType(ledge);
        this.moveToXY(ledge, ledge.x, 40, 100, 0, this.resetLedge.bind(this));
    }

    moveToXY(sprite, x, y, speed, maxTime, callback) {
        if (speed === undefined) { speed = 60; }
        if (maxTime === undefined) { maxTime = 0; }

        let angle = Math.atan2(y - sprite.y, x - sprite.x);

        if (maxTime > 0)
        {
            //  We know how many pixels we need to move, but how fast?
            speed = utils.distanceToXY(sprite, x, y) / (maxTime / 1000);
        }

        sprite.body.velocity.setToPolar(angle, speed);

        let te = this.game.time.events.loop(this.game.time.physicsElapsedMS, function () {
            if ( Math.abs(sprite.x - x) <= 1 && Math.abs(sprite.y - y) <= 1) {
                te.loop = false;
                sprite.body.velocity.x = 0;
                sprite.body.acceleration.x = 0;
                sprite.body.velocity.y = 0;
                sprite.body.acceleration.y = 0;
                if (callback) {
                    callback(sprite);
                }
                delete this;
            }
        }, this);
    }
}

export default Play1PState;
