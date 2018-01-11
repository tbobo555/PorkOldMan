import Phaser from "phaser";
import Box from "../objects/box";
import Container from "../objects/container";
import * as Config from "../config";
import LedgesEffect from "../blocks/ledgeseffect";
import * as Utils from "../weblogic/utils";
import GameBounds from "../blocks/gamebounds";
import ScrollCounter from "../blocks/scrollcounter";
import CountDownEffect from "../blocks/countdowneffect";
import PauseMenu from "../blocks/pausemenu";
import DictUS from "../dicts/us";
import GameOver from "../blocks/gameover";


class PlayState extends Phaser.State {
    constructor() {
        super();
        // 載入字典檔
        this.Dict = DictUS;

        // key objects
        this.cursors = null;
        this.wasd = null;
        this.escKey = null;
        this.spaceKey = null;

        // game bounds block
        this.gameBounds = null;

        // ledges effect
        this.ledgesEffect = null;

        // play state objects
        this.mainBox = null;
        this.mainGameBox = null;
        this.topThorns = null;

        // player
        this.player = null;
        this.player1 = null;
        this.player2 = null;

        // scroll counter
        this.scrollCounter = null;

        // life bar
        this.lifeBar = null;

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

        // hint box objects
        this.hintBox = null;

        // game over object
        this.isGameOver = false;
        this.gameOverMenu = null;

        // input priority
        this.pauseButtonIputPriority = 0;
        this.gameoverButtonIputPriority = 1;
    }

    initGame() {
        // 載入字典檔
        this.Dict = DictUS;

        // 加入自訂的pause功能
        this.game.onPause.add(this.pauseGame, this);
        this.game.onResume.add(this.pauseGame, this);

        // 初始化遊戲參數
        this.isGameOver = false;
        this.isPause = false;
        this.pauseToggler = false;

        // 初始化 input priority
        this.pauseButtonIputPriority = 0;
        this.gameoverButtonIputPriority = 1;

        // 初始化 timer
        this.gameTimer = this.game.time.events;
        this.pauseTimer = this.game.time.create(false);
        this.pauseTimer.start();
    }

    startGame() {
        this.ledgesEffect.run();
        this.pauseGame();
        this.pauseToggler = false;
        this.pauseMenu.hideAll();
        this.pauseTimer.resume();
        this.countDownEffect.run(this.letsPlay.bind(this));
    }

    endGame() {
        this.isGameOver = true;
        this.pauseGame();
        this.game.onPause.removeAll();
        this.game.onResume.removeAll();

        // 加入遊戲結束選單
        this.gameOverMenu = new GameOver(this.game, this.scrollCounter.counts, this.gameoverButtonIputPriority);
        this.gameOverMenu.showAll();
    }

    letsPlay() {
        this.hintBox.hideAll();
        this.resumeGame();
    }

    pauseGame() {
        this.isPause = true;
        this.pauseToggler = true;
        this.gameTimer.pause();
        this.pauseTimer.pause();
        this.game.physics.arcade.isPaused = true;
        this.game.tweens.pauseAll();
        this.pausePlayer();
        let ledgeSet = this.ledgesEffect.getAll();
        ledgeSet.forEach((item) => {
            item.animations.paused = true;
        });
        if (this.isGameOver) {
            return;
        }
        this.pauseMenu.showAll();
    }

    resumeGame() {
        this.pauseMenu.hideAll();
        this.resumePlayer();
        let ledgeSet = this.ledgesEffect.getAll();
        ledgeSet.forEach((item) => {
            item.animations.paused = false;
        });
        this.gameTimer.resume();
        this.game.tweens.resumeAll();
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

    pausePlayer() {}

    resumePlayer() {}

    handlePlayerEvents(player , lifebar, cursors) {
        if (player.bottom > Config.CameraHeight) {
            player.dead();
            lifebar.addLife(-lifebar.maxLife);
            return;
        }

        // 偵測玩家角色與自訂游戲邊框的碰撞
        this.game.physics.arcade.collide(player, this.gameBounds);

        // 停止玩家角色的移動
        player.runStop();

        // 偵測玩家角色是否與階梯碰撞
        let isPlayerCollideLedges = false;
        if (player.top > 130) {
            let ledgesGroup = this.ledgesEffect.getAll();
            ledgesGroup.forEach((ledge) => {
                let isCollide = this.ledgeCollidePlayer(ledge, player, lifebar);
                if (isCollide) {
                    isPlayerCollideLedges = true;
                }
            });
        } else {
            if (!player.isHurted) {
                player.hurt();
                player.showHurtEffect();
                lifebar.addLife(-4);
            }
        }
        if (isPlayerCollideLedges === false) {
            player.isOnLedge = false;
        }

        // 偵測玩家按下左或右鍵
        if (cursors.left.isDown)
        {
            if (player.speedBouns > 0 && isPlayerCollideLedges === false) {
                player.speedBouns = 0;
            }
            player.runLeft();
        } else if (cursors.right.isDown)
        {
            if (player.speedBouns < 0  && isPlayerCollideLedges === false) {
                player.speedBouns = 0;
            }
            player.runRight();
        } else {
            if (isPlayerCollideLedges === false) {
                player.speedBouns = 0;
            }
            player.runStand();
        }
    }

    createLedgesEffect() {
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
    }

    createBounds() {
        // 建置自訂的遊戲邊界
        this.gameBounds = new GameBounds(
            this.game,
            Config.GameUpBoundThick,
            Config.GameBottomBoundThick,
            Config.GameLeftBoundThick,
            Config.GameRightBoundThick
        );
    }

    createTopThorns() {
        this.topThorns = this.game.add.group();
        for (let i = 0; i < 24; i++) {
            let x = 68 + (30 * i);
            this.topThorns.create(x, 100, Config.MainTextureAtlasName, Config.MainTextureAtlasKey.Thorn);
        }
    }

    createMainBox() {
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
    }

    createScrollCounter() {
        // 加入滾動式計數器
        this.scrollCounter = new ScrollCounter(
            this.game,
            Config.ScrollCounterPos.X,
            Config.ScrollCounterPos.Y,
            Config.ScrollCounterSpeed
        );
    }

    createCountDownEffect() {
        // 加入倒數計時
        this.countDownEffect = new CountDownEffect(
            this.game,
            Config.CountDownTime,
            Config.CountDownSpeed,
            this.pauseTimer
        );
    }

    createHintBox() {
        // 遊戲提示文字
        this.hintBox = new Container(this.game);

        let hintText = new Phaser.Text(
            this.game,
            Config.HintTextPos.X,
            Config.HintTextPos.Y,
            this.Dict.PauseHintText,
            Config.DefaultFontStyle
        );
        hintText.anchor.setTo(
            Config.HintTextPos.Anchor.X,
            Config.HintTextPos.Anchor.Y
        );
        this.hintBox.addAsset("hintText", hintText);
    }

    createPauseMenu() {
        // 加入暫停選單
        this.pauseMenu = new PauseMenu(
            this.game,
            this.pauseButtonIputPriority,
            this.togglePauseEvent.bind(this)
        );
    }

    ledgeCollidePlayer(ledge, player, playerLifeBar) {
        if (ledge.name === Config.LedgeTypes.Sand &&
            ledge.animations.currentAnim.isPlaying === true &&
            ledge.frameName !== Config.LedgesAtlasKey.SandLedge1) {
            return false;
        }
        if (!ledge.isCanCollide(player, Config.PlayerIgnoreCollide.X, Config.PlayerIgnoreCollide.Y)) {
            return false;
        }
        let isCollide = this.game.physics.arcade.collide(player, ledge);
        if (isCollide === true) {
            if (player.isOnLedge === false) {
                player.isOnLedge = true;
                if (ledge.name === Config.LedgeTypes.Thorn) {
                    playerLifeBar.addLife(-4);
                    player.showHurtEffect();
                } else {
                    playerLifeBar.addLife(1);
                }
            }
            player.speedBouns = 0;
            ledge.runCollideTrigger(player);
            return true;
        }
        return false;
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

export default PlayState;
