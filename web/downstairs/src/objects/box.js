import Phaser from "phaser";
import * as Config from "../config";


class Box extends Phaser.Image {
    constructor(game, x, y, width, height, radius, fillColor, fillAlpha, borderWidth, borderColor, borderAlpha) {
        super(game, 0, 0);
        x = x || Config.GameDrawBoxPos.x;
        y = y || Config.GameDrawBoxPos.y;
        width = width || Config.GameDrawBoxSize.Width;
        height = height || Config.GameDrawBoxSize.Height;
        radius = radius || Config.GameDrawBoxSize.Radius;
        fillColor = fillColor || Config.DefaultDrawBoxStyle.FillStyle.FillColor;
        fillAlpha = fillAlpha || Config.DefaultDrawBoxStyle.FillStyle.FillAlpha;
        borderWidth = borderWidth || Config.DefaultDrawBoxStyle.LineStyle.LineWidth;
        borderColor = borderColor || Config.DefaultDrawBoxStyle.LineStyle.LineColor;
        borderAlpha = borderAlpha || Config.DefaultDrawBoxStyle.LineStyle.LineAlpha;
        let painter = this.game.add.graphics(x, y);
        painter.beginFill(fillColor, fillAlpha);
        painter.lineStyle(borderWidth, borderColor, borderAlpha);
        painter.drawRoundedRect(0, 0, width, height, radius);
        this.addChild(painter);
        this.graphic = painter;
    }

}

export default Box;
