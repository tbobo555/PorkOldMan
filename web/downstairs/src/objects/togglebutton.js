import Phaser from "phaser";


class ToggleButton extends Phaser.Button {
    constructor(game, x, y, key, callback, callbackContext, toggled, toggledFrame, untoggleFrame) {
        super(game, x, y, key, callback, callbackContext, null, null, null, null);
        toggled = toggled || false;
        this.isToggle = toggled;
        this.toggledFrame = toggledFrame;
        this.untoggleFrame = untoggleFrame;

        if (toggled === true) {
            this.frameName = this.toggledFrame;
        } else {
            this.frameName = this.untoggleFrame;
        }
    }

    toggle() {
        this.isToggle = !this.isToggle;
        if (this.isToggle === true) {
            this.frameName = this.toggledFrame;
        } else {
            this.frameName = this.untoggleFrame;
        }
    }
}

export default ToggleButton;
