import Phaser from "phaser";
import * as Config from "../config";
import * as Utils from "../weblogic/utils";
import Player from "../objects/player";
import DictUS from "../dicts/us";
import LedgesEffect from "../blocks/ledgeseffect";
import CountDownEffect from "../blocks/countdowneffect";
import PauseMenu from "../blocks/pausemenu";
import GameBounds from "../blocks/gamebounds";
import Box from "../objects/box";
import ScrollCounter from "../blocks/scrollcounter";

class Play1PState extends Phaser.State {
    constructor() {
        super();
        // 載入字典檔
        this.Dict = DictUS;

        // key objects
        this.cursors = null;
        this.escKey = null;
        this.spaceKey = null;

        // game bounds block
        this.gameBounds = null;

        // ledges effect
        this.ledgesEffect = null;

        // play state objects
        this.mainBox = null;
        this.mainGameBox = null;
        this.player = null;

        // scroll counter
        this.scrollCounter = null;

        // game setting
        this.isPause = false;
        this.pauseToggler = false;
        this.setting = null;

        // game timer
        this.gameTimer = null;
        this.pauseTimer = null;

        // pause menu objects
        this.pauseMenu = null;

        // count down objects
        this.countDownEffect = null;

        // input priority
        this.pauseButtonIputPriority = 0;
    }

    create(game) {
        // 加入自訂的pause功能
        this.game.onPause.add(this.pauseGame, this);
        this.game.onResume.add(this.pauseGame, this);

        // 初始化 timer
        this.gameTimer = game.time.events;
        this.pauseTimer = game.time.create(false);
        this.pauseTimer.start();

        // 從cookie載入設定
        this.setting = Utils.loadDownstairsGameSetting();

        // 建置 ledges effect
        this.ledgesEffect = new LedgesEffect(
            this.game,
            Config.LedgeBasicSpeed,
            Config.MaxLedgesNumber,
            0,
            0,
            0,
            0,
            0,
            0
        );

        // 建置自訂的遊戲邊界
        this.gameBounds = new GameBounds(
            this.game,
            Config.GameUpBoundThick,
            Config.GameBottomBoundThick,
            Config.GameLeftBoundThick,
            Config.GameRightBoundThick
        );

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

        // 繪製主邊框
        this.mainBox = new Box(
            this.game,
            Config.PlayDrawBoxPos.X,
            Config.PlayDrawBoxPos.Y,
            Config.PlayDrawBoxSize.Width,
            Config.PlayDrawBoxSize.Height,
            Config.PlayDrawBoxSize.Radius,
            Config.PlayDrawBoxStyle.FillStyle.FillColor,
            Config.PlayDrawBoxStyle.FillStyle.FillAlpha,
            Config.PlayDrawBoxStyle.LineStyle.LineWidth,
            Config.PlayDrawBoxStyle.LineStyle.LineColor,
            Config.PlayDrawBoxStyle.LineStyle.LineAlpha
        );
        this.game.add.existing(this.mainBox);

        // 繪製遊玩邊框
        this.mainGameBox = new Box(
            this.game,
            Config.MainGameDrawBoxPos.X,
            Config.MainGameDrawBoxPos.Y,
            Config.MainGameDrawBoxSize.Width,
            Config.MainGameDrawBoxSize.Height,
            Config.MainGameDrawBoxSize.Radius,
            Config.MainGameDrawBoxStyle.FillStyle.FillColor,
            Config.MainGameDrawBoxStyle.FillStyle.FillAlpha,
            Config.MainGameDrawBoxStyle.LineStyle.LineWidth,
            Config.MainGameDrawBoxStyle.LineStyle.LineColor,
            Config.MainGameDrawBoxStyle.LineStyle.LineAlpha
        );
        this.game.add.existing(this.mainGameBox);

        // 加入滾動式計數器
        this.scrollCounter = new ScrollCounter(
            this.game,
            Config.ScrollCounterPos.X,
            Config.ScrollCounterPos.Y,
            Config.ScrollCounterSpeed
        );

        // 加入倒數計時
        this.countDownEffect = new CountDownEffect(
            this.game,
            Config.CountDownTime,
            Config.CountDownSpeed,
            this.pauseTimer
        );

        // 加入暫停選單
        this.pauseMenu = new PauseMenu(
            this.game,
            this.pauseButtonIputPriority,
            this.togglePauseEvent.bind(this)
        );

        // 監聽輸入: 上下左右鍵
        this.cursors = game.input.keyboard.createCursorKeys();
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
        // 偵測 space/esc 鍵是否按下
        if (this.spaceKey.justDown || this.escKey.justDown) {
            this.togglePauseEvent();
        }
        // 如果暫停中不進行update
        if (this.isPause) {
            return;
        }
        // 偵測玩家角色與自訂游戲邊框的碰撞
        game.physics.arcade.collide(this.player, this.gameBounds);

        // 停止玩家角色的移動
        this.player.runStop();

        // 偵測玩家角色是否與階梯碰撞
        let isPlayerCollideLedges = false;
        if (this.player.top > 115) {
            let ledgesGroup = this.ledgesEffect.getAll();
            ledgesGroup.forEach((ledge) => {
                if (ledge.name === Config.LedgeTypes.Sand &&
                    ledge.animations.currentAnim.isPlaying === true &&
                    ledge.frameName !== Config.LedgesAtlasKey.SandLedge1) {
                    return;
                }
                if (!ledge.isCanCollide(this.player, Config.PlayerIgnoreCollide.X, Config.PlayerIgnoreCollide.Y)) {
                    return;
                }
                let isCollide = game.physics.arcade.collide(this.player, ledge);
                if (isCollide === true) {
                    isPlayerCollideLedges = true;
                    this.player.speedBouns = 0;
                    ledge.runCollideTrigger(this.player);
                }
            });
        }

        // 偵測玩家按下左或右鍵
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
        this.ledgesEffect.run();
        this.pauseGame();
        this.pauseToggler = false;
        this.pauseMenu.hideAll();
        this.pauseTimer.resume();
        this.countDownEffect.run(this.resumeGame.bind(this));
    }

    pauseGame() {
        this.isPause = true;
        this.pauseToggler = true;
        this.gameTimer.pause();
        this.pauseTimer.pause();
        this.game.physics.arcade.isPaused = true;
        this.player.animations.paused = true;
        let ledgeSet = this.ledgesEffect.getAll();
        ledgeSet.forEach((item) => {
            item.animations.paused = true;
        });
        this.pauseMenu.showAll();
    }

    resumeGame() {
        this.pauseMenu.hideAll();
        this.player.animations.paused = false;
        let ledgeSet = this.ledgesEffect.getAll();
        ledgeSet.forEach((item) => {
            item.animations.paused = false;
        });
        this.gameTimer.resume();
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
            this.pauseTimer.resume();
            if (!this.countDownEffect.isRunning) {
                this.countDownEffect.run(this.resumeGame.bind(this));
            }
        }
    }

    adjustGameDifficulty() {
        let time = this.scrollCounter.counts;
        let degree = Math.floor(time / 10);
        if (degree > 24) {
            return;
        }
        let normalWeight = Config.DefaultNormalLedgeWeight;
        let sandWeight = Config.DefaultSandLedgeWeight;
        let thornWeight = Config.DefaultThornLedgeWeight;
        let jumpWeight = Config.DefaultJumpLedgeWeight;
        let leftWeight = Config.DefaultLeftLedgeWeight;
        let rightWeight = Config.DefaultRightLedgeWeight;

        if (this.setting.SandLedge === false) {
            sandWeight = 0;
            normalWeight --;
        } else {
            sandWeight = sandWeight + Math.floor(time / 15);
        }
        if (this.setting.JumpLedge === false) {
            jumpWeight = 0;
            normalWeight --;
        } else {
            jumpWeight = jumpWeight + Math.floor(time / 25);
        }
        if (this.setting.RollLedge === false) {
            leftWeight = 0;
            rightWeight = 0;
            normalWeight --;
        } else {
            leftWeight = leftWeight + Math.floor(time / 25);
            rightWeight = rightWeight + Math.floor(time / 25);
        }
        normalWeight += degree;
        thornWeight += degree;
        this.ledgesEffect.setLedgeSpeed(Config.LedgeBasicSpeed + (5 * degree));
        this.ledgesEffect.setLedgeWeight(normalWeight, sandWeight, jumpWeight, thornWeight, leftWeight, rightWeight);
    }
}

export default Play1PState;
