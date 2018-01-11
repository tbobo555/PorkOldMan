import Container from "../objects/container";
import Phaser from "phaser";
import * as Config from "../config";


class LifeBar extends Container {
    constructor(game, x, y) {
        super(game);
        this.maxLife = 12;
        this.life = 12;
        this.content = new Phaser.TileSprite(
            game,
            x,
            y,
            Config.LifeBarSize.Width,
            Config.LifeBarSize.Height,
            Config.MainTextureAtlasName,
            Config.MainTextureAtlasKey.LifeBarContent
        );
        this.addAsset("content", this.content);

        // life bar border
        this.border = new Phaser.Image(
            game,
            x,
            y,
            Config.MainTextureAtlasName,
            Config.MainTextureAtlasKey.LifeBarBorder
        );
        this.addAsset("border", this.border);
    }

    addLife(bonus) {
        let life = this.life += bonus;
        if (life > this.maxLife) {
            this.life = this.maxLife;
        }
        if (life < 0 ) {
            this.life = 0;
        }
        this.content.tilePosition.x = -(Config.LifeBarSize.Width / this.maxLife) * (this.maxLife - this.life);
    }
}

export default LifeBar;
