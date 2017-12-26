import Phaser from "phaser";


class ToggleButton extends Phaser.Button {
    constructor(game, x, y, key, callback, callbackContext, toggled, toggledFrame, untoggleFrame) {
        super(game, x, y, key, callback, callbackContext, null, null, null, null);
        toggled = toggled || false;
        this.isToggle = toggled;
        if (toggled === true) {
            this.frame = toggledFrame;
        } else {
            this.frame = untoggleFrame;
        }
    }

    toggle() {
        this.isToggle = !this.isToggle;
    }
}

export default ToggleButton;
