import Phaser from "phaser";
import * as Config from "../config";


class Box extends Phaser.Image {
    constructor(game, x, y, width, height, radius, fillColor, fillAlpha, borderWidth, borderColor, borderAlpha) {
        super(game, 0, 0);
        if (x === undefined) {
            x = Config.GameDrawBoxPos.X;
        }
        if (y === undefined) {
            y = Config.GameDrawBoxPos.Y;
        }
        if (width === undefined) {
            width = Config.GameDrawBoxSize.Width;
        }
        if (height === undefined) {
            height = Config.GameDrawBoxSize.Height;
        }
        if (radius === undefined) {
            radius = Config.GameDrawBoxSize.Radius;
        }
        if (fillColor === undefined) {
            fillColor = Config.DefaultDrawBoxStyle.FillStyle.FillColor;
        }
        if (fillAlpha === undefined) {
            fillAlpha = Config.DefaultDrawBoxStyle.FillStyle.FillAlpha;
        }
        if (borderWidth === undefined) {
            borderWidth = Config.DefaultDrawBoxStyle.LineStyle.LineWidth;
        }
        if (borderColor === undefined) {
            borderColor = Config.DefaultDrawBoxStyle.LineStyle.LineColor;
        }
        if (borderAlpha === undefined) {
            borderAlpha = Config.DefaultDrawBoxStyle.LineStyle.LineAlpha;
        }
        let painter = this.game.add.graphics(x, y);
        painter.beginFill(fillColor, fillAlpha);
        painter.lineStyle(borderWidth, borderColor, borderAlpha);
        painter.drawRoundedRect(0, 0, width, height, radius);
        this.addChild(painter);
        this.graphic = painter;
    }

}

export default Box;
