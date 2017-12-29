import Phaser from "phaser";
import config from "../config";


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
        let style = config.DefaultFontStyle;
        // 建立loading文字
        this.loadingText = game.add.text(config.LoadingTextPos.X, config.LoadingTextPos.Y, "loading...", style);
        this.loadingText.anchor.setTo(config.LoadingTextPos.Anchor.X, config.LoadingTextPos.Anchor.Y);
        game.load.setPreloadSprite(this.loadingText);
        // 建立loading進度條
        this.loadingProgress = game.add.text(config.LoadingProgressPos.X, config.LoadingProgressPos.Y, "0%", style);
        this.loadingProgress.anchor.setTo(config.LoadingProgressPos.Anchor.X, config.LoadingProgressPos.Anchor.Y);
        game.load.setPreloadSprite(this.loadingProgress);
        game.load.onFileComplete.add(this.fileComplete.bind(this), this);

        // 預先載入資源
        game.load.atlasJSONHash(
            config.PorkOldManAtlasName,
            config.PorkOldManAtlasPath.Image,
            config.PorkOldManAtlasPath.JSON
        );
        game.load.atlasJSONHash(
            config.MainTextureAtlasName,
            config.MainTextureAtlasPath.Image,
            config.MainTextureAtlasPath.JSON
        );
        game.load.atlasJSONHash(
            config.LedgesAtlasName,
            config.LedgesAtlasPath.Image,
            config.LedgesAtlasPath.JSON
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
