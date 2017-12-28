import Phaser from "phaser";
import config from "../config";


class PreloadState extends Phaser.State {
    preload(game) {
        let style = config.DefaultFontStyle;
        this.loading = game.add.text(this.game.world.centerX, this.game.world.centerY, "loading...", style);
        this.loading.anchor.setTo(0.5);
        this.progress = game.add.text(this.game.world.centerX, this.game.world.centerY + 100, "0%", style);
        this.progress.anchor.setTo(0.5);

        game.load.setPreloadSprite(this.loading);
        game.load.setPreloadSprite(this.progress);
        game.load.onFileComplete.add(this.fileComplete.bind(this), this);

        game.load.atlasJSONHash(
            config.AtlasNamePorkOldMan,
            "assets/img/atlas_porkoldman.png",
            "assets/img/atlas_porkoldman.json"
        );
        game.load.atlasJSONHash(
            config.AtlasNameMainTexture,
            "assets/img/maintexture.png",
            "assets/img/maintexture.json"
        );
        game.load.atlasJSONHash(
            config.AtlasNameLedges,
            "assets/img/atlas_ledges.png",
            "assets/img/atlas_ledges.json"
        );
    }
    create(game){
        game.state.start("MainMenu");
    }

    fileComplete(progress) {
        this.progress.text = progress + "%";
    }
}

export default PreloadState;
