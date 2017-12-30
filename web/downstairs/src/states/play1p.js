import Phaser from "phaser";
import * as Config from "../config";
import * as Motion from  "../events/motions";
import * as Utils from "../weblogic/utils";
import Ledge from "../objects/ledge";
import Player from "../objects/player";
import DictUS from "../dicts/us";
import ToggleButton from "../objects/togglebutton";
import * as Events from "../events/events";

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
        this.soundSetting = null;
        this.ledgesRateSetting = null;

        // pause menu objects
        this.pauseToggle = false;
        this.pauseGroup = null;
        this.soundCheckBox = null;
        this.maskBoxPainter = null;
        this.maskBox = null;
        this.pauseBoxPainter = null;
        this.pauseBox = null;
        this.continueBtn = null;

        // count down objects
        this.countDownRunning = false;
        this.countTime = 3;
        this.countDownMaskBoxPainter = null;
        this.countDownMaskBox = null;
        this.countDownText = null;
        this.countDownHintText = null;

        // input priority
        this.pauseButtonIputPriority = 0;
    }
    init() {
        this.game.onPause.add(this.pauseGame, this);
        this.game.onResume.add(this.pauseGame, this);
    }
    create(game) {
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
        this.addCountDown();

        // 加入並隱藏暫停選單
        this.addPauseMenu();

        // 監聽輸入: 上下左右鍵
        this.cursors = game.input.keyboard.createCursorKeys();
        // 監聽esc鍵
        this.escKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
        // 監聽space鍵
        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        // 開始移動所有ledges
        this.moveLedges();

        this.pauseGame();
        this.pauseToggle = false;
        this.game.time.events.resume();
        this.hidePauseMenu();
        this.runCountDown(this.startGame.bind(this));
    }

    update(game) {
        if (this.spaceKey.justDown || this.escKey.justDown) {
            this.togglePauseGame();
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
        this.hideCountDown();
        this.resumeGame();
    }

    addCountDown() {
        // 建立遮罩
        let maskPainter = this.game.add.graphics(Config.CameraMaskDrawBoxPos.X, Config.CameraMaskDrawBoxPos.Y);
        maskPainter.beginFill(
            Config.DefaultDrawMaskBoxStyle.FillStyle.FillColor,
            Config.DefaultDrawMaskBoxStyle.FillStyle.FillAlpha
        );
        maskPainter.drawRect(
            0,
            0,
            Config.CameraMaskDrawBoxSize.Width,
            Config.CameraMaskDrawBoxSize.Height
        );
        let maskBox = this.game.add.image(0, 0);
        maskBox.addChild(maskPainter);
        this.countDownMaskBoxPainter = maskPainter;
        this.countDownMaskBox = maskBox;

        // 倒數數字
        let countDownText = new Phaser.Text(
            this.game,
            Config.CountDownTextPos.X,
            Config.CountDownTextPos.Y,
            this.countTime,
            Config.PlayBold200FontStyle
        );
        countDownText.anchor.setTo(
            Config.CountDownTextPos.Anchor.X,
            Config.CountDownTextPos.Anchor.Y
        );
        this.countDownText = countDownText;
        this.game.add.existing(countDownText);

        // 遊戲提示文字
        let countDownHintText = new Phaser.Text(
            this.game,
            Config.CountDownPauseHintText.X,
            Config.CountDownPauseHintText.Y,
            this.Dict.PauseHintText,
            Config.DefaultFontStyle
        );
        countDownHintText.anchor.setTo(
            Config.CountDownPauseHintText.Anchor.X,
            Config.CountDownPauseHintText.Anchor.Y
        );
        this.countDownHintText = countDownHintText;
        this.game.add.existing(countDownHintText);
    }

    runCountDown(callback) {
        this.countDownRunning = true;
        let counterText = this.countTime;
        this.countDownText.text = counterText;
        let start = false;
        this.showCountDown();
        let loop = this.game.time.events.loop(
            Phaser.Timer.SECOND * 0.65,
            () => {
                if (start) {
                    this.hideCountDown();
                    this.countDownRunning = false;
                    this.game.time.events.remove(loop);
                    if (callback) {
                        callback();
                    }
                    return;
                }
                counterText -= 1;
                if (counterText < 0) {
                    start = true;
                    counterText = this.Dict.StartText;
                }
                this.countDownText.text = counterText;
            },
            this);
    }

    showCountDown() {
        this.countDownMaskBoxPainter.visible = true;
        this.countDownMaskBox.visible = true;
        this.countDownText.visible = true;
        this.countDownHintText.visible = true;
    }

    hideCountDown() {
        this.countDownMaskBoxPainter.visible = false;
        this.countDownMaskBox.visible = false;
        this.countDownText.visible = false;
        this.countDownHintText.visible = false;
    }

    addPauseMenu() {
        // 建立遮罩
        let maskPainter = this.game.add.graphics(Config.CameraMaskDrawBoxPos.X, Config.CameraMaskDrawBoxPos.Y);
        maskPainter.beginFill(
            Config.DefaultDrawMaskBoxStyle.FillStyle.FillColor,
            Config.DefaultDrawMaskBoxStyle.FillStyle.FillAlpha
        );
        maskPainter.drawRect(
            0,
            0,
            Config.CameraMaskDrawBoxSize.Width,
            Config.CameraMaskDrawBoxSize.Height
        );
        let maskBox = this.game.add.image(0, 0);
        maskBox.addChild(maskPainter);
        this.maskBoxPainter = maskPainter;
        this.maskBox = maskBox;

        // 建立 pause 選單邊框
        let pauseBoxPainter = this.game.add.graphics(Config.PauseMenuDrawBoxPos.X, Config.PauseMenuDrawBoxPos.Y);
        pauseBoxPainter.beginFill(
            Config.DefaultDrawBoxStyle.FillStyle.FillColor,
            Config.DefaultDrawBoxStyle.FillStyle.FillAlpha
        );
        pauseBoxPainter.lineStyle(
            Config.DefaultDrawBoxStyle.LineStyle.LineWidth,
            Config.DefaultDrawBoxStyle.LineStyle.LineColor,
            Config.DefaultDrawBoxStyle.LineStyle.LineAlpha
        );
        pauseBoxPainter.drawRoundedRect(
            0,
            0,
            Config.PauseMenuDrawBoxSize.Width,
            Config.PauseMenuDrawBoxSize.Height,
            Config.PauseMenuDrawBoxSize.Radius
        );
        let pauseBox = this.game.add.image(0, 0);
        pauseBox.addChild(pauseBoxPainter);
        this.pauseBoxPainter = pauseBoxPainter;
        this.pauseBox = pauseBox;

        // 建立 pause 選單會使用到的靜態圖
        this.pauseGroup = this.game.add.group();

        // pause選單的標題
        let pauseMenuTitle = new Phaser.Text(
            this.game,
            Config.PauseMenuTitlePos.X,
            Config.PauseMenuTitlePos.Y,
            this.Dict.PauseText,
            Config.DefaultFontStyle
        );
        pauseMenuTitle.anchor.setTo(
            Config.PauseMenuTitlePos.Anchor.X,
            Config.PauseMenuTitlePos.Anchor.Y
        );
        this.pauseGroup.add(pauseMenuTitle);

        // 音效設定圖案
        let sounds = this.pauseGroup.create(
            Config.PauseMenuSoundPos.X,
            Config.PauseMenuSoundPos.Y,
            Config.MainTextureAtlasName,
            Config.MainTextureAtlasKey.Sounds
        );
        sounds.anchor.setTo(
            Config.PauseMenuSoundPos.Anchor.X,
            Config.PauseMenuSoundPos.Anchor.Y,
        );

        // 音效開關按鈕
        let soundCheckBox = new ToggleButton (
            this.game,
            Config.PauseMenuSoundCheckBoxPos.X,
            Config.PauseMenuSoundCheckBoxPos.Y,
            Config.MainTextureAtlasName,
            this.toggleSounds.bind(this),
            this,
            this.soundSetting,
            Config.MainTextureAtlasKey.CheckBox1,
            Config.MainTextureAtlasKey.CheckBox2
        );
        this.game.add.existing(soundCheckBox);
        soundCheckBox.input.priorityID = this.pauseButtonIputPriority;
        soundCheckBox.input.useHandCursor = true;
        this.soundCheckBox = soundCheckBox;

        // 建立 continue 按鈕
        let continueBtn = new Phaser.Text(
            this.game,
            Config.PauseMenuContinueButtonPos.X,
            Config.PauseMenuContinueButtonPos.Y,
            this.Dict.ContinueText,
            Config.DefaultFontStyle
        );
        continueBtn.anchor.setTo(
            Config.PauseMenuContinueButtonPos.Anchor.X,
            Config.PauseMenuContinueButtonPos.Anchor.Y
        );
        continueBtn.inputEnabled = true;
        continueBtn.input.useHandCursor = true;
        continueBtn.events.onInputUp.add(this.continueGame.bind(this));
        continueBtn.events.onInputOver.add(Events.scaleBig);
        continueBtn.events.onInputOut.add(Events.scaleOrigin);
        continueBtn.input.priorityID = this.pauseButtonIputPriority;
        this.game.add.existing(continueBtn);
        this.continueBtn = continueBtn;
    }

    showPauseMenu() {
        this.maskBoxPainter.visible = true;
        this.maskBox.visible = true;
        this.pauseBoxPainter.visible = true;
        this.pauseBox.visible = true;
        this.pauseGroup.visible = true;

        this.soundCheckBox.visible = true;
        this.soundCheckBox.inputEnabled = true;
        this.soundCheckBox.input.useHandCursor = true;
        this.continueBtn.visible = true;
        this.continueBtn.scale.setTo(1.0);
        this.continueBtn.inputEnabled = true;
        this.continueBtn.input.useHandCursor = true;
    }

    hidePauseMenu() {
        this.maskBoxPainter.visible = false;
        this.maskBox.visible = false;
        this.pauseBoxPainter.visible = false;
        this.pauseBox.visible = false;
        this.pauseGroup.visible = false;

        this.soundCheckBox.visible = false;
        this.soundCheckBox.inputEnabled = false;
        this.continueBtn.visible = false;
        this.continueBtn.inputEnabled = false;
    }

    toggleSounds() {
        if (Utils.checkMouseInObject(this.game.input.mousePointer, this.soundCheckBox) === false) {
            return;
        }
        this.soundCheckBox.toggle();
        let setting = Utils.loadDownstairsGameSetting();
        setting.Sounds = this.soundCheckBox.isToggle;
        this.soundSetting = setting.Sounds;
        Utils.setCookie(Config.GameSettingCookieName, JSON.stringify(setting), Config.GameSettingCookieExpiredDay);
    }

    continueGame() {
        if (Utils.checkMouseInObject(this.game.input.mousePointer, this.continueBtn) === false) {
            return;
        }
        this.pauseToggle = !this.pauseToggle;
        this.game.time.events.resume();
        this.hidePauseMenu();
        if (this.countDownRunning === false) {
            this.runCountDown(this.resumeGame.bind(this));
        }
    }

    togglePauseGame() {
        this.pauseToggle = !this.pauseToggle;
        if (this.pauseToggle) {
            this.pauseGame();
        } else {
            this.game.time.events.resume();
            this.hidePauseMenu();
            if (this.countDownRunning === false) {
                this.runCountDown(this.resumeGame.bind(this));
            }
        }
    }

    pauseGame() {
        this.pauseToggle = true;
        this.game.time.events.pause();
        this.game.physics.arcade.isPaused = true;
        this.player.animations.paused = true;
        let ledgeSet = this.ledgesGroup.getAll();
        ledgeSet.forEach((item) => {
            item.animations.paused = true;
        });
        this.showPauseMenu();
    }

    resumeGame() {
        this.hidePauseMenu();
        this.player.animations.paused = false;
        let ledgeSet = this.ledgesGroup.getAll();
        ledgeSet.forEach((item) => {
            item.animations.paused = false;
        });
        this.game.time.events.resume();
        this.game.physics.arcade.isPaused = false;
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
