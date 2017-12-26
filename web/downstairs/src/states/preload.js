import Phaser from "phaser-ce/build/custom/phaser-split";
import config from "../config";


class PreloadState extends Phaser.State {

    preload(game) {
        game.load.atlasJSONHash(config.AtlasNamePorkOldMan, "assets/img/atlas_porkoldman.png", "assets/img/atlas_porkoldman.json");
        game.load.atlasJSONHash(config.AtlasNameMainTexture, "assets/img/atlas_bounds.png", "assets/img/atlas_bounds.json");
        game.load.atlasJSONHash(config.AtlasNameLedges, "assets/img/atlas_ledges.png", "assets/img/atlas_ledges.json");
    }
    create(game){
        game.state.start("Play1P");
    }
}

export default PreloadState;
