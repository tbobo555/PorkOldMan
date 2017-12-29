import Phaser from "phaser";
import * as Config from "../config";


class PreloadState extends Phaser.State {
    constructor() {
        super();
        // loading文字
        this.loadingText = null;
        // loading進度條
        this.loadingProgress = null;
    }

    preload(game) {
        // loading文字使用預設的字型格式
        let style = Config.DefaultFontStyle;
        // 建立loading文字
        this.loadingText = game.add.text(Config.LoadingTextPos.X, Config.LoadingTextPos.Y, "loading...", style);
        this.loadingText.anchor.setTo(Config.LoadingTextPos.Anchor.X, Config.LoadingTextPos.Anchor.Y);
        game.load.setPreloadSprite(this.loadingText);
        // 建立loading進度條
        this.loadingProgress = game.add.text(Config.LoadingProgressPos.X, Config.LoadingProgressPos.Y, "0%", style);
        this.loadingProgress.anchor.setTo(Config.LoadingProgressPos.Anchor.X, Config.LoadingProgressPos.Anchor.Y);
        game.load.setPreloadSprite(this.loadingProgress);
        game.load.onFileComplete.add(this.fileComplete.bind(this), this);

        // 預先載入資源
        game.load.atlasJSONHash(
            Config.PorkOldManAtlasName,
            Config.PorkOldManAtlasPath.Image,
            Config.PorkOldManAtlasPath.JSON
        );
        game.load.atlasJSONHash(
            Config.MainTextureAtlasName,
            Config.MainTextureAtlasPath.Image,
            Config.MainTextureAtlasPath.JSON
        );
        game.load.atlasJSONHash(
            Config.LedgesAtlasName,
            Config.LedgesAtlasPath.Image,
            Config.LedgesAtlasPath.JSON
        );
    }

    create(game){
        game.state.start("MainMenu");
    }

    fileComplete(progress) {
        this.loadingProgress.text = progress + "%";
    }
}

export default PreloadState;
