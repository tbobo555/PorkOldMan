import Phaser from "phaser";

class Container extends Phaser.Group {
    constructor(game) {
        super(game);
        this.assets = {};
        this.inputs = {};
    }

    addAsset(name, child, overwrite) {
        if (overwrite === undefined) {
            overwrite = false;
        }
        if (name in this.assets) {
            if (!overwrite) {
                return;
            } else {
                this.remove(this.assets[name], false, false);
            }
        }
        this.add(child);
        this.assets[name] = child;
    }

    addInput(name, child, useHandCursor, overwrite) {
        if (overwrite === undefined) {
            overwrite = false;
        }
        if (useHandCursor === undefined) {
            useHandCursor = true;
        }
        if (name in this.inputs) {
            if (!overwrite) {
                return;
            } else {
                this.remove(this.inputs[name], false, false);
            }
        }
        this.add(child);
        child.useHandCursor = useHandCursor;
        this.inputs[name] = child;
    }

    showAsset(name) {
        if (name in this.assets) {
            Container._showAsset(this.assets[name]);
        }
    }

    hideAsset(name) {
        if (name in this.assets) {
            Container._hideAsset(this.assets[name]);
        }
    }

    showInput(name) {
        if (name in this.inputs) {
            Container._showInput(this.inputs[name]);
        }
    }

    hideInput(name) {
        if (name in this.inputs) {
            Container._hideInput(this.inputs[name]);
        }
    }

    showAll() {
        for (let key in this.assets) {
            Container._showAsset(this.assets[key]);
        }
        for (let key in this.inputs) {
            Container._showInput(this.inputs[key]);
        }
    }

    hideAll() {
        for (let key in this.assets) {
            Container._hideAsset(this.assets[key]);
        }
        for (let key in this.inputs) {
            Container._hideInput(this.inputs[key]);
        }
    }

    static _showAsset(asset) {
        asset.visible = true;
    }

    static _hideAsset(asset) {
        asset.visible = false;
    }

    static _showInput(input) {
        input.visible = true;
        input.inputEnabled = true;
        if (input.useHandCursor) {
            input.input.useHandCursor = true;
        }
    }

    static _hideInput(input) {
        input.visible = false;
        input.inputEnabled = false;
    }
}

export default Container;
