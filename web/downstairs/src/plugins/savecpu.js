import Phaser from "phaser";

export default function savecpu() {
    Phaser.Plugin.SaveCPU = function (game, parent) {
        "use strict";
        Phaser.Plugin.call(this, game, parent);

    };
    Phaser.Plugin.SaveCPU.prototype = Object.create(Phaser.Plugin.prototype);
    Phaser.Plugin.SaveCPU.constructor = Phaser.Plugin.SaveCPU;

    Phaser.Plugin.SaveCPU.prototype.init = function () {
        "use strict";
        let thisObj;

        this.__defineSetter__("renderOnFPS", function(v) {
            this._renderOnFPS = v;
            this._tsdiff = (1000 / v);
        });
        this.__defineGetter__("renderOnFPS", function() {
            return this._renderOnFPS;
        });
        this._tsdiff = 0;

        // fps default
        this.renderOnFPS = 30;
        this.renderOnPointerChange = false;
        this.renderDirty = true;

        if(this.game.updateRender) {
            this._init1();
        } else {
            this._init0();
        }

        this.fpsDirty = 0;
        this.hrts  = 0;

        thisObj = this;
        window.requestAnimationFrame(function(hrts) {
            thisObj._trackFPS(hrts);
        });
    };
    Phaser.Plugin.SaveCPU.prototype._init0 = function () {
        this.renderType = this.game.renderType;
        this.switchRender = this._switchRender0;
    };
    Phaser.Plugin.SaveCPU.prototype._init1 = function () {
        let game = this.game;

        game.updateRenderReal = game.updateRender;
        game.updateRenderNull = function() {};
        this.switchRender = this._switchRender1;
    };
    Phaser.Plugin.SaveCPU.prototype._trackFPS = function (hrts) {
        let thisObj, diff;

        diff = hrts - this.hrts;
        if (diff > this._tsdiff) {
            this.fpsDirty = true;
            this.hrts = hrts;
        }

        thisObj = this;
        window.requestAnimationFrame(function(hrts) {
            thisObj._trackFPS(hrts);
        });

    };
    Phaser.Plugin.SaveCPU.prototype._switchRender0 = function () {
        "use strict";
        let game = this.game;
        if (this.renderDirty) {
            game.renderType = this.renderType;
        } else {
            game.renderType = Phaser.HEADLESS;
        }
        this.renderDirty = false;
    };
    Phaser.Plugin.SaveCPU.prototype._switchRender1 = function () {
        "use strict";
        let game = this.game;
        if (this.renderDirty) {
            game.updateRender = game.updateRenderReal;
        } else {
            game.updateRender = game.updateRenderNull;
        }
    };
    Phaser.Plugin.SaveCPU.prototype.forceRender = function () {
        "use strict";
        this.renderDirty = true;
    };
    Phaser.Plugin.SaveCPU.prototype._forceRenderOnPointerChange = function () {
        "use strict";
        if(!this.renderOnPointerChange) {
            return false;
        }
        let input = this.game.input;

        if (input.oldx !== input.x || input.oldy !== input.y) {
            this.forceRender();
            input.oldx = input.x;
            input.oldy = input.y;
        }
        if (input.oldDown !== input.activePointer.isDown) {
            this.forceRender();
            input.oldDown = input.activePointer.isDown;
        }
    };
    Phaser.Plugin.SaveCPU.prototype._forceRenderOnFPS = function () {
        "use strict";

        if(this.renderOnFPS && this.fpsDirty) {
            this.fpsDirty = false;
            this.forceRender();
            return true;
        } else {
            return false;
        }
    };
    Phaser.Plugin.SaveCPU.prototype.postUpdate = function () {
        "use strict";
        if (this.renderDirty || this._forceRenderOnFPS()|| this._forceRenderOnPointerChange()) {
            this.switchRender();
        }
    };
    Phaser.Plugin.SaveCPU.prototype.postRender= function () {
        "use strict";
        if (this.renderDirty) {
            this.renderDirty = false;
            this.switchRender();
        }
    };
}
