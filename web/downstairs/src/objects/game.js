import "pixi";
import "p2";
import Phaser from "phaser";
import config from "../config";
import Boot from "../states/boot";
import Preload from "../states/preload";
import MainMenu from "../states/mainmenu";
import Play1P from "../states/play1p";
import * as utils from "../weblogic/utils";

class DownStairsGame extends Phaser.Game {
    constructor() {
        super(config.CameraWidth, config.CameraHeight, Phaser.AUTO, config.GameDivName);
        if (utils.checkCookie(config.GameSettingCookieName) === false) {
            utils.setCookie(config.GameSettingCookieName, JSON.stringify(config.DefaultGameSetting), 30);
        }
        this.state.add("Boot", Boot, false);
        this.state.add("Preload", Preload, false);
        this.state.add("MainMenu", MainMenu, false);
        this.state.add("Play1P", Play1P, false);
        this.state.start("Boot");
    }
}

export default DownStairsGame;
