import Container from "../objects/container";
import Box from "../objects/box";
import * as Config from "../config";


class GameBounds extends Container {
    constructor(game, upThick, bottomThick, leftThick, rightThick) {
        super(game);
        upThick = upThick || Config.DefaultBoundThick;
        bottomThick = bottomThick || Config.DefaultBoundThick;
        leftThick = leftThick || Config.DefaultBoundThick;
        rightThick = rightThick || Config.DefaultBoundThick;

        // 建置上方邊界
        let boundsUp = new Box(
            this.game,
            0,
            0,
            Config.CameraWidth,
            upThick,
            0,
            Config.DefaultDrawBoundStyle.FillStyle.FillColor,
            Config.DefaultDrawBoundStyle.FillStyle.FillAlpha,
            Config.DefaultDrawBoundStyle.LineStyle.LineWidth,
            Config.DefaultDrawBoundStyle.LineStyle.LineColor,
            Config.DefaultDrawBoundStyle.LineStyle.LineAlpha
        );

        this.game.physics.arcade.enable(boundsUp.graphic, true);
        boundsUp.graphic.body.immovable = true;
        this.addAsset("boundsUp", boundsUp);
        this.addAsset("boundsUpGraphic", boundsUp.graphic);


        // 建置下方邊界
        let boundsBottom = new Box(
            this.game,
            0,
            Config.CameraHeight - bottomThick,
            Config.CameraWidth,
            bottomThick,
            0,
            Config.DefaultDrawBoundStyle.FillStyle.FillColor,
            Config.DefaultDrawBoundStyle.FillStyle.FillAlpha,
            Config.DefaultDrawBoundStyle.LineStyle.LineWidth,
            Config.DefaultDrawBoundStyle.LineStyle.LineColor,
            Config.DefaultDrawBoundStyle.LineStyle.LineAlpha
        );
        this.game.physics.arcade.enable(boundsBottom.graphic);
        boundsBottom.graphic.body.immovable = true;
        this.addAsset("boundsBottom", boundsBottom);
        this.addAsset("boundsBottomGraphic", boundsBottom.graphic);

        // 建置左方邊界
        let boundsLeft = new Box(
            this.game,
            0,
            0,
            leftThick,
            Config.CameraHeight,
            0,
            Config.DefaultDrawBoundStyle.FillStyle.FillColor,
            Config.DefaultDrawBoundStyle.FillStyle.FillAlpha,
            Config.DefaultDrawBoundStyle.LineStyle.LineWidth,
            Config.DefaultDrawBoundStyle.LineStyle.LineColor,
            Config.DefaultDrawBoundStyle.LineStyle.LineAlpha
        );
        this.game.physics.arcade.enable(boundsLeft.graphic);
        boundsLeft.graphic.body.immovable = true;
        this.addAsset("boundsLeft", boundsLeft);
        this.addAsset("boundsLeftGraphic", boundsLeft.graphic);

        // 建置右方邊界
        let boundsRight = new Box(
            this.game,
            Config.CameraWidth - rightThick,
            0,
            rightThick,
            Config.CameraHeight,
            0,
            Config.DefaultDrawBoundStyle.FillStyle.FillColor,
            Config.DefaultDrawBoundStyle.FillStyle.FillAlpha,
            Config.DefaultDrawBoundStyle.LineStyle.LineWidth,
            Config.DefaultDrawBoundStyle.LineStyle.LineColor,
            Config.DefaultDrawBoundStyle.LineStyle.LineAlpha
        );
        this.game.physics.arcade.enable(boundsRight.graphic);
        boundsRight.graphic.body.immovable = true;
        this.addAsset("boundsRight", boundsRight);
        this.addAsset("boundsRightGraphic", boundsRight.graphic);
    }
}

export default GameBounds;
