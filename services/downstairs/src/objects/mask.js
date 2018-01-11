import Phaser from "phaser";
import * as Config from "../config";


class Mask extends Phaser.Image {
    constructor(game, x, y, width, height, fillColor, alpha) {
        if (x === undefined) {
            x = Config.CameraMaskDrawBoxPos.X;
        }
        if (y === undefined) {
            y = Config.CameraMaskDrawBoxPos.Y;
        }
        if (width === undefined) {
            width = Config.CameraMaskDrawBoxSize.Width;
        }
        if (height === undefined) {
            height = Config.CameraMaskDrawBoxSize.Height;
        }
        if (fillColor === undefined) {
            fillColor = Config.DefaultDrawMaskBoxStyle.FillStyle.FillColor;
        }
        if (alpha === undefined) {
            alpha = Config.DefaultDrawMaskBoxStyle.FillStyle.FillAlpha;
        }
        super(game, x, y);
        let painter = this.game.add.graphics(x, y);
        painter.beginFill(fillColor, alpha);
        painter.drawRect(0, 0, width, height);
        this.addChild(painter);
        this.graphic = painter;
    }

    setInputEvent(callback, inputPriority) {
        inputPriority = inputPriority || 0;
        this.inputEnabled = true;
        this.events.onInputUp.add(callback);
        this.input.priorityID = inputPriority;
    }
}

export default Mask;
