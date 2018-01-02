import Container from "../objects/container";
import Phaser from "phaser";
import * as Config from "../config";
import Mask from "../objects/mask";
import DictUS from "../dicts/us";


class CountDownEffect extends Container {
    constructor(game, time, speed, timer) {
        super(game);
        this.Dict = DictUS;
        this.isRunning = false;
        this.countTime = time;
        this.speed = speed;
        if (timer === undefined) {
            timer = game.time.events;
        }
        this.timer = timer;

        // 建立遮罩
        let mask = new Mask(this.game);
        this.addAsset("mask", mask);

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
        this.addAsset("countDownText", countDownText);

        // 遊戲提示文字
        let hintText = new Phaser.Text(
            this.game,
            Config.CountDownPauseHintText.X,
            Config.CountDownPauseHintText.Y,
            this.Dict.PauseHintText,
            Config.DefaultFontStyle
        );
        hintText.anchor.setTo(
            Config.CountDownPauseHintText.Anchor.X,
            Config.CountDownPauseHintText.Anchor.Y
        );
        this.hintText = hintText;
        this.addAsset("hintText", hintText);
    }

    run(callback) {
        if (this.isRunning) {
            return;
        }
        this.isRunning = true;
        let counterText = this.countTime;
        this.countDownText.text = counterText;
        let runEnd = false;
        this.showAll();
        let loop = this.timer.loop(
            Phaser.Timer.SECOND * this.speed,
            () => {
                if (runEnd) {
                    this.hideAll();
                    this.isRunning = false;
                    this.timer.remove(loop);
                    if (callback) {
                        callback();
                    }
                    return;
                }
                counterText -= 1;
                if (counterText < 0) {
                    runEnd = true;
                    counterText = this.Dict.StartText;
                }
                this.countDownText.text = counterText;
            },
            this
        );
    }
}

export default CountDownEffect;
