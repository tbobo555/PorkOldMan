import Container from "../objects/container";
import Mask from "../objects/mask";
import Box from "../objects/box";
import Phaser from "phaser";
import * as Config from "../config";
import DictUS from "../dicts/us";
import * as Utils from "../weblogic/utils";
import * as Events from "../events/events";

class GameOver extends Container {
    constructor(game, scoresNumber, inputPriority) {
        super(game);
        // 語系設置
        this.Dict = DictUS;

        this.inputPriority = inputPriority;

        // 建立遮罩
        let mask = new Mask(game);
        this.addAsset("mask", mask);

        // 建立 game over 選單邊框
        let box = new Box(
            game,
            Config.GameOverDrawBoxPos.X,
            Config.GameOverDrawBoxPos.Y,
            Config.GameOverDrawBoxSize.Width,
            Config.GameOverDrawBoxSize.Height,
            Config.GameOverDrawBoxSize.Radius
        );
        this.addAsset("box", box);

        // game over 標題
        let title = new Phaser.Text(
            this.game,
            Config.GameOverTitlePos.X,
            Config.GameOverTitlePos.Y,
            this.Dict.GameOverText,
            Config.DefaultFontStyle
        );
        title.anchor.setTo(
            Config.GameOverTitlePos.Anchor.X,
            Config.GameOverTitlePos.Anchor.Y
        );
        this.addAsset("title", title);

        // 分數
        let scores = new Phaser.Text(
            this.game,
            Config.GameOverScoresPos.X,
            Config.GameOverScoresPos.Y,
            this.Dict.ScoresText + ": " + scoresNumber.toString(),
            Config.DefaultFontStyle
        );
        scores.anchor.setTo(
            Config.GameOverScoresPos.Anchor.X,
            Config.GameOverScoresPos.Anchor.Y
        );
        this.addAsset("scores", scores);

        // 排名
        let rank = new Phaser.Text(
            this.game,
            Config.GameOverRankPos.X,
            Config.GameOverRankPos.Y,
            this.Dict.RankText + ": " + this.ranking(scoresNumber) + "%",
            Config.DefaultFontStyle
        );
        rank.anchor.setTo(
            Config.GameOverRankPos.Anchor.X,
            Config.GameOverRankPos.Anchor.Y
        );
        this.addAsset("rank", rank);

        // 建立 continue 按鈕
        let continueBtn = new Phaser.Text(
            this.game,
            Config.GameOverContinueButtonPos.X,
            Config.GameOverContinueButtonPos.Y,
            this.Dict.ContinueText,
            Config.DefaultFontStyle
        );
        continueBtn.anchor.setTo(
            Config.GameOverContinueButtonPos.Anchor.X,
            Config.GameOverContinueButtonPos.Anchor.Y
        );
        continueBtn.inputEnabled = true;
        continueBtn.input.priorityID = this.inputPriority;
        continueBtn.events.onInputUp.add(this.onContinueClick.bind(this));
        continueBtn.events.onInputOver.add(Events.scaleBig);
        continueBtn.events.onInputOut.add(Events.scaleOrigin);
        this.addInput("continueBtn", continueBtn);
    }

    onContinueClick() {
        let continueBtn = this.inputs["continueBtn"];
        if (Utils.checkMouseInObject(this.game.input.mousePointer, continueBtn) === false) {
            return;
        }
        this.game.state.start("MainMenu", true, false);
    }

    ranking(scores) {
        let r = Utils.getRandomInt(1, 9);
        let base = 0;
        if (scores <= 0) {
            return "0";
        }
        if (scores === 1) {
            return "0.1";
        }
        if (scores <= 5) {
            r = Utils.getRandomInt(1, 3);
            return "0." + r.toString();
        }
        if (scores > 5 && scores <= 15) {
            //min 0.4  max 1.3
            base = 0.3 + (scores - 5) * 0.1;
        }
        if (scores > 15 && scores <= 25) {
            //min 1.5  max 3.3
            base = 1.3 + (scores - 15) * 0.2;
        }
        if (scores > 25 && scores <= 35) {
            //min 3.7  max 7.3
            base = 3.3 + (scores - 25) * 0.4;
        }
        if (scores > 35 && scores <= 45) {
            //min 7.9  max 13.3
            base = 7.3 + (scores - 35) * 0.6;
        }
        if (scores > 45 && scores <= 55) {
            //min 14.1  max 21.3
            base = 13.3 + (scores - 45) * 0.8;
        }
        if (scores > 55 && scores <= 65) {
            //min 22.3  max 31.3
            base = 21.3 + (scores - 55);
        }
        if (scores > 65 && scores <= 80) {
            //min 32.5  max 47.8
            base = 31.3 + (scores - 65) * 1.1;
        }
        if (scores > 80 && scores <= 90) {
            //min 48.7  max 56.7
            base = 47.8 + (scores - 80) * 0.9;
        }
        if (scores > 90 && scores <= 100) {
            //min 57.4  max 63.7
            base = 56.7 + (scores - 90) * 0.7;
        }
        if (scores > 100 && scores <= 110) {
            //min 64.3  max 69.7
            base = 63.7 + (scores - 100) * 0.6;
        }
        if (scores > 110 && scores <= 120) {
            //min 70.2  max 74.7
            base = 69.7 + (scores - 110) * 0.5;
        }
        if (scores > 120 && scores <= 130) {
            //min 75.1  max 78.7
            base = 74.7 + (scores - 120) * 0.4;
        }
        if (scores > 130 && scores <= 150) {
            //min 78.9  max 82.7
            base = 78.7 + (scores - 130) * 0.2;
        }
        if (scores > 150 && scores <= 200) {
            //min 82.8  max 87.7
            base = 82.7 + (scores - 150) * 0.1;
        }
        if (scores > 200 && scores <= 240) {
            //min 87.9  max 95.7
            base = 87.7 + (scores - 200) * 0.2;
        }
        if (scores > 240 && scores <= 260) {
            //min 95.8  max 97.7
            base = 95.7 + (scores - 240) * 0.1;
        }
        if (scores > 300) {
            scores = 300;
        }
        if (scores > 260 && scores <= 300) {
            //min 97.75  max 99.7
            base = 97.7 + (scores - 260) * 0.05;
        }
        base = base + (r / 10);
        if (base > 99.9) {
            base = 99.9;
        }
        return Utils.formatFloat(base, 2).toString();
    }
}

export default GameOver;
