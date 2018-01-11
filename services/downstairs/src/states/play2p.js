import Phaser from "phaser";
import PlayState from "./play";
import * as Config from "../config";
import Player from "../objects/player";
import LifeBar from "../blocks/lifebar";
import Container from "../objects/container";

class Play2pState extends PlayState {
    constructor() {
        super();
    }

    create(game) {
        // 遊戲初始化
        this.initGame();

        // 建置移動階梯
        this.createLedgesEffect();

        // 建置邊界
        this.createBounds();

        // 玩家角色建置
        this.player1 = new Player(
            game,
            Config.PlayerType.Green,
            Config.Player1IniPos.X,
            Config.Player1IniPos.Y,
            Config.PorkOldManAtlasName
        );
        game.add.existing(this.player1.effect);
        game.add.existing(this.player1);
        game.physics.arcade.enable(this.player1);
        this.player1.body.gravity.y = Config.PlayerGravity.Y;
        this.player1.body.collideWorldBounds = true;

        this.player2 = new Player(
            game,
            Config.PlayerType.Yellow,
            Config.Player2IniPos.X,
            Config.Player2IniPos.Y,
            Config.PorkOldManAtlasName
        );
        game.add.existing(this.player2.effect);
        game.add.existing(this.player2);
        game.physics.arcade.enable(this.player2);
        this.player2.body.gravity.y = Config.PlayerGravity.Y;
        this.player2.body.collideWorldBounds = true;

        // 建立上方邊界的刺
        this.createTopThorns();

        // 繪製邊框
        this.createMainBox();

        // 加入滾動式計數器
        this.createScrollCounter();

        // 加入生命條
        this.player1LifeText = new Phaser.Text(
            this.game,
            Config.Player1LifeTextPos.X,
            Config.Player1LifeTextPos.Y,
            this.Dict.SimplePlayer1Text + "-" + this.Dict.LifeText,
            Config.PlayBold34FontStyle
        );
        this.player1LifeText.anchor.setTo(
            Config.Player1LifeTextPos.Anchor.X,
            Config.Player1LifeTextPos.Anchor.Y
        );
        this.game.add.existing(this.player1LifeText);
        this.player1LifeBar = new LifeBar(this.game, Config.Player1LifeBarPos.X, Config.Player1LifeBarPos.Y);
        this.player2LifeText = new Phaser.Text(
            this.game,
            Config.Player2LifeTextPos.X,
            Config.Player2LifeTextPos.Y,
            this.Dict.SimplePlayer2Text + "-" + this.Dict.LifeText,
            Config.PlayBold34FontStyle
        );
        this.player2LifeText.anchor.setTo(
            Config.Player2LifeTextPos.Anchor.X,
            Config.Player2LifeTextPos.Anchor.Y
        );
        this.game.add.existing(this.player2LifeText);
        this.player2LifeBar = new LifeBar(this.game, Config.Player2LifeBarPos.X, Config.Player2LifeBarPos.Y);

        // 加入倒數計時
        this.createCountDownEffect();

        // 加入提示訊息
        this.createHintBox();

        // 加入暫停選單
        this.createPauseMenu();

        // 監聽輸入: 上下左右鍵
        this.cursors = game.input.keyboard.createCursorKeys();
        this.wasd = {
            left: game.input.keyboard.addKey(Phaser.Keyboard.A),
            right: game.input.keyboard.addKey(Phaser.Keyboard.D),
        };
        // 監聽esc鍵
        this.escKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
        // 監聽space鍵
        this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        // 配置每種階梯的比重 (該比重會影響階梯的出現率)
        this.adjustGameDifficulty();
        this.gameTimer.loop(Phaser.Timer.SECOND * 5,  this.adjustGameDifficulty.bind(this), this);

        // 開始遊戲！
        this.startGame();
    }

    update(game) {
        // 遊戲結束則不進行update
        if (this.isGameOver) {
            return;
        }
        // 偵測 space/esc 鍵是否按下
        if (this.spaceKey.justDown || this.escKey.justDown) {
            this.togglePauseEvent();
        }
        // 如果暫停中不進行update
        if (this.isPause) {
            return;
        }
        if (this.player1LifeBar.life <= 0 && this.player2LifeBar.life <= 0) {
            this.endGame();
            return;
        }
        if (this.player1LifeBar.life > 0 && this.player2LifeBar.life > 0) {
            game.physics.arcade.collide(this.player1, this.player2);
        }
        if (this.player1LifeBar.life > 0) {
            this.handlePlayerEvents(this.player1, this.player1LifeBar, this.cursors);
        } else if (!this.player1.isDead) {
            this.player1.dead();
        }
        if (this.player2LifeBar.life > 0) {
            this.handlePlayerEvents(this.player2, this.player2LifeBar, this.wasd);
        } else if (!this.player2.isDead) {
            this.player2.dead();
        }
    }

    pausePlayer() {
        if (!this.player1.isDead) {
            this.player1.animations.paused = true;
        }
        if (!this.player2.isDead) {
            this.player2.animations.paused = true;
        }
    }

    resumePlayer() {
        if (!this.player1.isDead) {
            this.player1.animations.paused = false;
        }
        if (!this.player2.isDead) {
            this.player2.animations.paused = false;
        }
    }

    createHintBox() {
        // 遊戲提示文字
        this.hintBox = new Container(this.game);

        let p1ControlText = new Phaser.Text(
            this.game,
            Config.HintP1ControlTextPos.X,
            Config.HintP1ControlTextPos.Y,
            this.Dict.SimplePlayer1Text + " " + this.Dict.ControlText,
            Config.DefaultFontStyle
        );
        p1ControlText.anchor.setTo(
            Config.HintP1ControlTextPos.Anchor.X,
            Config.HintP1ControlTextPos.Anchor.Y
        );
        this.hintBox.addAsset("p1ControlText", p1ControlText);

        let p2ControlText = new Phaser.Text(
            this.game,
            Config.HintP2ControlTextPos.X,
            Config.HintP2ControlTextPos.Y,
            this.Dict.SimplePlayer2Text + " " + this.Dict.ControlText,
            Config.DefaultFontStyle
        );
        p2ControlText.anchor.setTo(
            Config.HintP2ControlTextPos.Anchor.X,
            Config.HintP2ControlTextPos.Anchor.Y
        );
        this.hintBox.addAsset("p2ControlText", p2ControlText);

        let btnA = new Phaser.Image(
            this.game,
            Config.HintButtonAPos.X,
            Config.HintButtonAPos.Y,
            Config.MainTextureAtlasName,
            Config.MainTextureAtlasKey.ButtonA
        );
        btnA.anchor.setTo(
            Config.HintButtonAPos.Anchor.X,
            Config.HintButtonAPos.Anchor.Y
        );
        this.hintBox.addAsset("btnA", btnA);

        let btnD = new Phaser.Image(
            this.game,
            Config.HintButtonDPos.X,
            Config.HintButtonDPos.Y,
            Config.MainTextureAtlasName,
            Config.MainTextureAtlasKey.ButtonD
        );
        btnD.anchor.setTo(
            Config.HintButtonDPos.Anchor.X,
            Config.HintButtonDPos.Anchor.Y
        );
        this.hintBox.addAsset("btnD", btnD);

        let btnLeft = new Phaser.Image(
            this.game,
            Config.HintButtonLeftPos.X,
            Config.HintButtonLeftPos.Y,
            Config.MainTextureAtlasName,
            Config.MainTextureAtlasKey.ButtonLeft
        );
        btnLeft.anchor.setTo(
            Config.HintButtonLeftPos.Anchor.X,
            Config.HintButtonLeftPos.Anchor.Y
        );
        this.hintBox.addAsset("btnLeft", btnLeft);

        let btnRight = new Phaser.Image(
            this.game,
            Config.HintButtonRightPos.X,
            Config.HintButtonRightPos.Y,
            Config.MainTextureAtlasName,
            Config.MainTextureAtlasKey.ButtonRight
        );
        btnRight.anchor.setTo(
            Config.HintButtonRightPos.Anchor.X,
            Config.HintButtonRightPos.Anchor.Y
        );
        this.hintBox.addAsset("btnRight", btnRight);
    }

}

export default Play2pState;
