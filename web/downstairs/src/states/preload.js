import Phaser from "phaser";
import * as Config from "../config";
import * as Utils from "../weblogic/utils";

class PreloadState extends Phaser.State {
    constructor() {
        super();
        // loading文字
        this.loadingText = null;
        // loading進度條
        this.loadingProgress = null;
    }

    create(game){
        game.load.onFileComplete.add(this.fileComplete.bind(this), this);
        game.load.onLoadComplete.add(this.loadComplete.bind(this), this);

        // 建立loading文字
        this.loadingText = game.add.text(
            Config.LoadingTextPos.X,
            Config.LoadingTextPos.Y,
            "loading...",
            Config.DefaultFontStyle
        );
        this.loadingText.anchor.setTo(Config.LoadingTextPos.Anchor.X, Config.LoadingTextPos.Anchor.Y);

        // 建立loading進度條
        this.progressFinished = false;
        this.loadingProgress = game.add.text(
            Config.LoadingProgressPos.X,
            Config.LoadingProgressPos.Y,
            "0%",
            Config.DefaultFontStyle
        );
        this.loadingProgress.anchor.setTo(Config.LoadingProgressPos.Anchor.X, Config.LoadingProgressPos.Anchor.Y);

        this.startLoad();
    }

    startLoad() {
        // 預先載入資源
        this.game.load.atlasJSONHash(
            Config.PorkOldManAtlasName,
            Config.PorkOldManAtlasPath.Image,
            Config.PorkOldManAtlasPath.JSON
        );
        this.game.load.atlasJSONHash(
            Config.MainTextureAtlasName,
            Config.MainTextureAtlasPath.Image,
            Config.MainTextureAtlasPath.JSON
        );
        this.game.load.atlasJSONHash(
            Config.LedgesAtlasName,
            Config.LedgesAtlasPath.Image,
            Config.LedgesAtlasPath.JSON
        );
        let styles = {
            font: "bold 70pt Arial",
            fill: "black",
            align: "left",
            wordWrap: true,
            wordWrapWidth: 5
        };
        let scrollCounter = new Phaser.Text(this.game, 0, 0, "0 1 2 3 4 5 6 7 8 9", styles);
        this.game.load.image(Config.ScrollCounterImageName, scrollCounter.generateTexture().getImage().src);
        this.game.load.start();
    }

    fileComplete(progress) {
        this.loadingProgress.text = progress + "%";
    }

    loadComplete() {
        Utils.sleep(300).then(() => {
            this.game.state.start("MainMenu");
        });
    }
}

export default PreloadState;
