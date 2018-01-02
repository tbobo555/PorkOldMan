import Container from "../objects/container";
import Phaser from "phaser";
import * as Config from "../config";


class ScrollCounter extends Container {
    constructor(game, x, y, speed) {
        super(game);
        if (speed === undefined) {
            speed = 2700;
        }
        this.counts = 0;
        this.counter = null;
        this.speed = speed;

        let template = new Phaser.Sprite(game, 0, 0, Config.ScrollCounterImageName);
        this.totalHeight = template.height;
        this.scrollBoxHeight = template.height / 10;
        this.scrollBoxWidth = template.width;
        this.one = new Phaser.TileSprite(
            game,
            x + (1.5 * this.scrollBoxWidth),
            y,
            this.scrollBoxWidth,
            this.scrollBoxHeight,
            Config.ScrollCounterImageName
        );
        this.one.anchor.set(0.5, 0.5);
        this.ten = new Phaser.TileSprite(
            game,
            x + (0.5 * this.scrollBoxWidth),
            y,
            this.scrollBoxWidth,
            this.scrollBoxHeight,
            Config.ScrollCounterImageName
        );
        this.ten.anchor.set(0.5, 0.5);
        this.hundred = new Phaser.TileSprite(
            game,
            x - (0.5 * this.scrollBoxWidth),
            y,
            this.scrollBoxWidth,
            this.scrollBoxHeight,
            Config.ScrollCounterImageName
        );
        this.hundred.anchor.set(0.5, 0.5);
        this.thousand = new Phaser.TileSprite(
            game,
            x - (1.5 * this.scrollBoxWidth),
            y,
            this.scrollBoxWidth,
            this.scrollBoxHeight,
            Config.ScrollCounterImageName
        );
        this.thousand.anchor.set(0.5, 0.5);
        this.addAsset("one", this.one);
        this.addAsset("ten", this.ten);
        this.addAsset("hundred", this.hundred);
        this.addAsset("thousand", this.thousand);
        this.run();
    }

    run() {
        let changeSpeed = this.speed / 5;
        this.counter = this.game.time.events.loop(this.speed, function () {
            let oneY = this.one.tilePosition.y - this.scrollBoxHeight;
            if (oneY <= (-1 * this.totalHeight)) {
                let tenY = this.ten.tilePosition.y - this.scrollBoxHeight;
                this.game.add.tween(this.ten.tilePosition).to(
                    {y: tenY},
                    changeSpeed,
                    Phaser.Easing.Default,
                    true
                );
                if (tenY <= (-1 * this.totalHeight)) {
                    let hundredY = this.hundred.tilePosition.y - this.scrollBoxHeight;
                    this.game.add.tween(this.hundred.tilePosition).to(
                        {y: hundredY},
                        changeSpeed,
                        Phaser.Easing.Default,
                        true
                    );
                    if (hundredY <= (-1 * this.totalHeight)) {
                        let thousandY = this.thousand.tilePosition.y - this.scrollBoxHeight;
                        this.game.add.tween(this.thousand.tilePosition).to(
                            {y: thousandY},
                            changeSpeed,
                            Phaser.Easing.Default,
                            true
                        );
                    }
                }
            }
            this.game.add.tween(this.one.tilePosition).to(
                {y: oneY},
                changeSpeed,
                Phaser.Easing.Default,
                true
            );
            this.counts ++;
        }, this);
    }
}

export default ScrollCounter;
