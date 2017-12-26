import Phaser from "phaser";

class LabelButton extends Phaser.Button {
    constructor(game, x, y, key, callback, callbackContext, overFrame, outFrame, downFrame, upFrame) {
        super(game, x, y, key, callback, callbackContext, overFrame, outFrame, downFrame, upFrame);
        this.style = {
            "font": "10px Arial",
            "fill": "black"
        };
        this.label = new Phaser.Text(game, 0, 0, "Label", this.style);
        this.addChild(this.label);
        this.setLabel("Text");

    }
    setLabel(label) {
        this.label.setText(label);
        this.label.x = Math.floor((this.width - this.label.width)*0.5);
        this.label.y = Math.floor((this.height - this.label.height)*0.5);
    }
}

export default LabelButton;
