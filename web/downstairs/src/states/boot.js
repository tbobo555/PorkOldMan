import Phaser from "phaser";
import config from "../config";
import savecpu from "../plugins/savecpu";
import * as utils from "../weblogic/utils";


class BootState extends Phaser.State {
    create(game) {
        savecpu();
        game.plugins.add(new Phaser.Plugin.SaveCPU(game, document));
        game.physics.startSystem(Phaser.Physics.ARCADE);
        // 自動調整視窗大小
        window.addEventListener("resize", function(){
            utils.autoAdjustGameScreenSize(config.GameDivName);
        });
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.scale.setShowAll();
        game.scale.refresh();
        utils.autoAdjustGameScreenSize(config.GameDivName);
        game.world.setBounds(0, 0, config.WorldWidth, config.WorldHeight);
        game.camera.focusOnXY(0, 0);
        game.stage.backgroundColor = "#ffffff";
        game.state.start("Preload");
    }
}


export default BootState;
