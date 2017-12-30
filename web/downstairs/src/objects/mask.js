import Phaser from "phaser";
import * as Config from "../config";


class Mask extends Phaser.Image {
    constructor(game, x, y, width, height, fillColor, alpha) {
        x = x || Config.CameraMaskDrawBoxPos.X;
        y = y || Config.CameraMaskDrawBoxPos.Y;
        width = width || Config.CameraMaskDrawBoxSize.Width;
        height = height || Config.CameraMaskDrawBoxSize.Height;
        fillColor = fillColor || Config.DefaultDrawMaskBoxStyle.FillStyle.FillColor;
        alpha = alpha || Config.DefaultDrawMaskBoxStyle.FillStyle.FillAlpha;
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
