import Phaser from "phaser";
import * as Config from "../config";
import * as Motion from  "../events/motions";
import * as Utils from "../weblogic/utils";
import Ledge from "../objects/ledge";
import Player from "../objects/player";
import DictUS from "../dicts/us";
import CountDownEffect from "../blocks/countdowneffect";
import PauseMenu from "../blocks/pausemenu";

class Play1PState extends Phaser.State {
    constructor() {
        super();
        // 載入字典檔
        this.Dict = DictUS;

        // key objects
        this.cursors = null;
        this.escKey = null;
        this.spaceKey = null;

        // play state objects
        this.mainBox = null;
        this.mainGameBox = null;
        this.player = null;
        this.boundsGroup = null;
        this.ledgesGroup = null;

        // game setting
        this.isPause = false;
        this.pauseToggler = false;
        this.soundSetting = null;
        this.ledgesRateSetting = null;

        // pause menu objects
        this.pauseMenu = null;

        // count down objects
        this.countDownEffect = null;

        // input priority
        this.pauseButtonIputPriority = 0;
    }

    create(game) {
        this.game.onPause.add(this.pauseGame, this);
        this.game.onResume.add(this.pauseGame, this);

        // group顯示順序初始化
        this.ledgesGroup = game.add.group();
        this.ledgesGroup.enableBody = true;

        // 設置ledges
        for (let i = 0; i < Config.MaxLedgesNumber; i++) {
            let ledge = new Ledge(game, 0, 0);
            this.ledgesGroup.add(ledge);
            game.physics.arcade.enable(ledge);
            ledge.body.immovable = true;
            ledge.initAnimation();
            ledge.anchor.setTo(Config.LedgePos.Anchor.X, Config.LedgePos.Anchor.Y);
        }

        // 從cookie載入ledges設定
        let defaultSetting = Config.DefaultLedgeNameSet;
        let cookieSetting = Utils.loadDownstairsGameSetting();
        if (cookieSetting.SandLedge !== true) {
            defaultSetting = Utils.removeArrayElementByValue(defaultSetting, Config.LedgeTypes.Sand);
        }
        if (cookieSetting.JumpLedge !== true) {
            defaultSetting = Utils.removeArrayElementByValue(defaultSetting, Config.LedgeTypes.Jump);
        }
        if (cookieSetting.RollLedge !== true) {
            defaultSetting = Utils.removeArrayElementByValue(defaultSetting, Config.LedgeTypes.Right);
            defaultSetting = Utils.removeArrayElementByValue(defaultSetting, Config.LedgeTypes.Right);
        }
        this.soundSetting = cookieSetting.Sounds;

        // 配置每種階梯的出現率
        let resultSetting = [];
        for (let i = 0; i < defaultSetting.length; i++) {
            switch (defaultSetting[i]) {
            case Config.LedgeTypes.Normal:
                Utils.pushElementToArray(resultSetting, Config.LedgeTypes.Normal, 10);
                break;
            case Config.LedgeTypes.Sand:
                Utils.pushElementToArray(resultSetting, Config.LedgeTypes.Sand, 2);
                break;
            case Config.LedgeTypes.Thorn:
                Utils.pushElementToArray(resultSetting, Config.LedgeTypes.Thorn, 3);
                break;
            case Config.LedgeTypes.Jump:
                Utils.pushElementToArray(resultSetting, Config.LedgeTypes.Jump, 2);
                break;
            case Config.LedgeTypes.Left:
                Utils.pushElementToArray(resultSetting, Config.LedgeTypes.Left, 1);
                break;
            case Config.LedgeTypes.Right:
                Utils.pushElementToArray(resultSetting, Config.LedgeTypes.Right, 1);
                break;
            }
        }
        this.ledgesRateSetting = resultSetting;
        // 配置階梯初始位置與型態
        this.initLedgesPosition();

        // 玩家角色建置
        this.player = new Player(
            game,
            Config.PlayerIniPos.X,
            Config.PlayerIniPos.Y,
            Config.PorkOldManAtlasName,
            Config.PorkOldManAtlasKey.Green1
        );
        game.add.existing(this.player);
        game.physics.arcade.enable(this.player);
        this.player.body.gravity.y = Config.PlayerGravity.Y;
        this.player.body.collideWorldBounds = true;

        // 建置自訂的遊戲邊界
        this.boundsGroup = game.add.group();
        this.boundsGroup.enableBody = true;
        this.initBounds();

        // 繪製主邊框
        let mainBox = game.add.graphics(Config.PlayDrawBoxPos.X, Config.PlayDrawBoxPos.Y);
        mainBox.lineStyle(
            Config.DefaultDrawBoxStyle.LineStyle.LineWidth,
            Config.DefaultDrawBoxStyle.LineStyle.LineColor,
            Config.DefaultDrawBoxStyle.LineStyle.LineAlpha
        );
        mainBox.drawRoundedRect(
            0,
            0,
            Config.PlayDrawBoxSize.Width,
            Config.PlayDrawBoxSize.Height,
            Config.PlayDrawBoxSize.Radius
        );
        this.mainBox = mainBox;

        // 繪製遊玩邊筐
        let mainGameBox = game.add.graphics(Config.MainGameDrawBoxPos.X, Config.MainGameDrawBoxPos.Y);
        mainGameBox.lineStyle(
            Config.MainGameDrawBoxStyle.LineStyle.LineWidth,
            Config.MainGameDrawBoxStyle.LineStyle.LineColor,
            Config.MainGameDrawBoxStyle.LineStyle.LineAlpha
        );
        mainGameBox.drawRoundedRect(
            0,
            0,
            Config.MainGameDrawBoxSize.Width,
            Config.MainGameDrawBoxSize.Height,
            Config.MainGameDrawBoxSize.Radius
        );
        this.mainGameBox = mainGameBox;

        // 加入倒數計時
        this.initCountDownEffect();

        // 加入並隱藏暫停選單
        this.initPauseMenu();

        // 監聽輸入: 上下左右鍵
        this.cursors = game.input.keyboard.createCursorKeys();
        // 監聽esc鍵
        this.escKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
        // 監聽space鍵
        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        // 開始移動所有ledges
        this.moveLedges();

        // 開始遊戲！
        this.startGame();
    }

    update(game) {
        if (this.spaceKey.justDown || this.escKey.justDown) {
            this.togglePauseEvent();
        }
        if (this.isPause) {
            return;
        }
        // 偵測玩家角色與自訂游戲邊框的碰撞
        game.physics.arcade.collide(this.player, this.boundsGroup);

        // 停止玩家角色的移動
        this.player.runStop();

        // 偵測玩家角色是否與階梯碰撞
        let isPlayerCollideLedges = false;
        if (this.player.top > 115) {
            let ledgesGroup = this.ledgesGroup.getAll();
            ledgesGroup.forEach((item) => {
                if (item.name === Config.LedgeTypes.Sand &&
                    item.animations.currentAnim.isPlaying === true &&
                    item.frameName !== Config.LedgesAtlasKey.SandLedge1) {
                    return;
                }
                if (!item.isCanCollide(this.player, Config.PlayerIgnoreCollide.X, Config.PlayerIgnoreCollide.Y)) {
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

        // 當玩家按下左或右鍵
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

    startGame() {
        this.pauseGame();
        this.pauseToggler = false;
        this.pauseMenu.hideAll();
        this.runCountDown(this.resumeGame.bind(this));
    }

    initCountDownEffect() {
        this.countDownEffect = new CountDownEffect(this.game);
    }

    runCountDown(callback) {
        this.game.time.events.resume();
        this.countDownEffect.run(callback);
    }

    initPauseMenu() {
        this.pauseMenu = new PauseMenu(
            this.game,
            this.pauseButtonIputPriority,
            this.togglePauseEvent.bind(this)
        );
    }

    pauseGame() {
        this.isPause = true;
        this.pauseToggler = true;
        this.game.time.events.pause();
        this.game.physics.arcade.isPaused = true;
        this.player.animations.paused = true;
        let ledgeSet = this.ledgesGroup.getAll();
        ledgeSet.forEach((item) => {
            item.animations.paused = true;
        });
        this.pauseMenu.showAll();
    }

    resumeGame() {
        this.pauseMenu.hideAll();
        this.player.animations.paused = false;
        let ledgeSet = this.ledgesGroup.getAll();
        ledgeSet.forEach((item) => {
            item.animations.paused = false;
        });
        this.game.time.events.resume();
        this.game.physics.arcade.isPaused = false;
        this.pauseToggler = false;
        this.isPause = false;
    }

    togglePauseEvent() {
        this.pauseToggler = !this.pauseToggler;
        if (this.pauseToggler) {
            this.pauseGame();
        } else {
            this.pauseMenu.hideAll();
            this.game.time.events.resume();
            if (!this.countDownEffect.isRunning) {
                this.runCountDown(this.resumeGame.bind(this));
            }
        }
    }

    initLedgesPosition() {
        // 初始化所有階梯的位置與類型
        let ledgeSet = this.ledgesGroup.getAll();
        ledgeSet.forEach((item, index) => {
            item.x = Utils.getRandomInt(Config.LedgePos.MinX, Config.LedgePos.MaxX);
            item.y = Config.LedgePos.BaseY + (Config.LedgePos.MarginY * index);
            if (index === Config.MiddleLedgesNumber) {
                item.x = Config.LedgeMiddlePos.X;
                item.y = Config.LedgeMiddlePos.Y;
                item.setToNormalType();
            } else {
                item.randLedgeType(this.ledgesRateSetting);
            }
        });
    }

    initBounds() {
        // 建置上方邊界
        let boundsUp = this.game.add.graphics(
            Config.GameBoundsUpDrawBoxPos.X,
            Config.GameBoundsUpDrawBoxPos.Y
        );
        boundsUp.beginFill(
            Config.DefaultDrawBoxStyle.FillStyle.FillColor,
            Config.DefaultDrawBoxStyle.FillStyle.FillAlpha
        );
        boundsUp.drawRect(
            0,
            0,
            Config.GameBoundsUpDrawBoxSize.Width,
            Config.GameBoundsUpDrawBoxSize.Height
        );
        this.game.physics.arcade.enable(boundsUp);
        boundsUp.body.immovable = true;
        this.boundsGroup.add(boundsUp);

        // 建置下方邊界
        let boundsBottom = this.game.add.graphics(
            Config.GameBoundsBottomDrawBoxPos.X,
            Config.GameBoundsBottomDrawBoxPos.Y
        );
        boundsBottom.beginFill(
            Config.DefaultDrawBoxStyle.FillStyle.FillColor,
            Config.DefaultDrawBoxStyle.FillStyle.FillAlpha
        );
        boundsBottom.drawRect(
            0,
            0,
            Config.GameBoundsBottomDrawBoxSize.Width,
            Config.GameBoundsBottomDrawBoxSize.Height
        );
        this.game.physics.arcade.enable(boundsBottom);
        boundsBottom.body.immovable = true;
        this.boundsGroup.add(boundsBottom);

        // 建置左方邊界
        let boundsLeft = this.game.add.graphics(
            Config.GameBoundsLeftDrawBoxPos.X,
            Config.GameBoundsLeftDrawBoxPos.Y
        );
        boundsLeft.beginFill(
            Config.DefaultDrawBoxStyle.FillStyle.FillColor,
            Config.DefaultDrawBoxStyle.FillStyle.FillAlpha
        );
        boundsLeft.drawRect(
            0,
            0,
            Config.GameBoundsLeftDrawBoxSize.Width,
            Config.GameBoundsLeftDrawBoxSize.Height
        );
        this.game.physics.arcade.enable(boundsLeft);
        boundsLeft.body.immovable = true;
        this.boundsGroup.add(boundsLeft);

        // 建置右方邊界
        let boundsRight = this.game.add.graphics(
            Config.GameBoundsRightDrawBoxPos.X,
            Config.GameBoundsRightDrawBoxPos.Y
        );
        boundsRight.beginFill(
            Config.DefaultDrawBoxStyle.FillStyle.FillColor,
            Config.DefaultDrawBoxStyle.FillStyle.FillAlpha
        );
        boundsRight.drawRect(
            0,
            0,
            Config.GameBoundsRightDrawBoxSize.Width,
            Config.GameBoundsRightDrawBoxSize.Height
        );
        this.game.physics.arcade.enable(boundsRight);
        boundsRight.body.immovable = true;
        this.boundsGroup.add(boundsRight);
    }

    moveLedges() {
        let ledgesSet = this.ledgesGroup.getAll();
        ledgesSet.forEach((item) => {
            Motion.moveToXY(
                this.game,
                item,
                item.x,
                Config.LedgePos.MinY,
                Config.LedgeBasicSpeed,
                0,
                this.resetLedge.bind(this),
                this
            );
        });
    }

    resetLedge(ledge) {
        ledge.x = Utils.getRandomInt(
            Config.LedgePos.MinX,
            Config.LedgePos.MaxX
        );
        ledge.y = Config.LedgePos.MaxY;
        ledge.randLedgeType(this.ledgesRateSetting);
        Motion.moveToXY(
            this.game,
            ledge,
            ledge.x,
            Config.LedgePos.MinY,
            Config.LedgeBasicSpeed,
            0,
            this.resetLedge.bind(this),
            this
        );
    }
}

export default Play1PState;
