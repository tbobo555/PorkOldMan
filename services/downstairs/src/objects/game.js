import "pixi";
import "p2";
import Phaser from "phaser";
import * as Config from "../config";
import Boot from "../states/boot";
import Preload from "../states/preload";
import MainMenu from "../states/mainmenu";
import Play1P from "../states/play1p";
import Play2P from "../states/play2p";
import * as Utils from "../weblogic/utils";

class DownStairsGame extends Phaser.Game {
    constructor() {
        super(Config.CameraWidth, Config.CameraHeight, Phaser.AUTO, Config.GameDivName);
        if (Utils.checkCookie(Config.GameSettingCookieName) === false) {
            Utils.setCookie(Config.GameSettingCookieName, JSON.stringify(Config.DefaultGameSetting), 30);
        }
        this.state.add("Boot", Boot, false);
        this.state.add("Preload", Preload, false);
        this.state.add("MainMenu", MainMenu, false);
        this.state.add("Play1P", Play1P, false);
        this.state.add("Play2P", Play2P, false);
        this.state.start("Boot");
    }
}

export default DownStairsGame;
