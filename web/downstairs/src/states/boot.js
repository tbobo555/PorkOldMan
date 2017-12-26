import Phaser from "phaser";
import config from "../config";
import savecpu from "../plugins/savecpu";
import * as utils from "../weblogic/utils";
import WebFont from "webfontloader";


class BootState extends Phaser.State {
    create(game) {
        // 載入字體
        WebFont.load({
            google: {
                families: ["Play:400,800:latin"]
            },
            timeout: 2000
        });

        // 啟用節省cpu的外掛
        savecpu();
        game.plugins.add(new Phaser.Plugin.SaveCPU(game, document));
        // 使用ARCADE輕型物理引擎
        game.physics.startSystem(Phaser.Physics.ARCADE);
        // 隨著使用者調整瀏覽器版面，自動調整遊戲的視窗大小
        window.addEventListener("resize", function(){
            utils.autoAdjustGameScreenSize(config.GameDivName);
        });
        // 遊戲縮放模式為：顯示完整遊戲畫面(不會被裁切)
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        // 遊戲視窗水平置中
        game.scale.pageAlignHorizontally = true;
        // 遊戲視窗垂直置中
        game.scale.pageAlignVertically = true;
        // 遊戲視窗保持顯示全部
        game.scale.setShowAll();
        // 刷新遊戲畫面
        game.scale.refresh();
        // 依照瀏覽器畫面大小，刷新遊戲視窗
        utils.autoAdjustGameScreenSize(config.GameDivName);
        // 設置遊戲的世界邊界
        game.world.setBounds(0, 0, config.WorldWidth, config.WorldHeight);
        // 設置攝影機位置
        game.camera.focusOnXY(0, 0);
        // 設置背景顏色
        game.stage.backgroundColor = "#ffffff";
        // 開始載入紋理
        game.state.start("Preload");
    }
}

export default BootState;
