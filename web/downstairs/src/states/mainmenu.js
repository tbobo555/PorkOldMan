import Phaser from "phaser";
import * as Events from "../events/events";
import * as Config from "../config";
import * as Utils from "../weblogic/utils";
import DictUS from "../dicts/us";
import SettingMenu from "../blocks/settingmenu";

class MainMenuState extends Phaser.State {
    constructor() {
        super();
        // 依語系載入字典檔
        this.Dict = DictUS;

        // setting main menu objects
        this.gameTitle = null;
        this.play1PBtn = null;
        this.play2PBtn = null;
        this.playOnlineBtn = null;
        this.settingBtn = null;
        this.mainBox = null;

        // setting menu container
        this.settingMenu = null;

        // input priority
        this.mainMenuIputPriority = 0;
        this.settingMenuIputPriority = 1;
    }
    create(game) {
        // 建立 game title
        let gameTitle = game.add.text(
            Config.GameTitlePos.X,
            Config.GameTitlePos.Y,
            this.Dict.GameTitleText,
            Config.DefaultFontStyle
        );
        gameTitle.anchor.setTo(Config.GameTitlePos.Anchor.X, Config.GameTitlePos.Anchor.Y);
        this.gameTitle = gameTitle;

        // 建立 Play 1P 按鈕
        let play1PBtn = game.add.text(
            Config.Play1PBtnPos.X,
            Config.Play1PBtnPos.Y,
            this.Dict.Play1PText,
            Config.DefaultFontStyle
        );
        play1PBtn.anchor.set(Config.Play1PBtnPos.Anchor.X, Config.Play1PBtnPos.Anchor.Y);
        play1PBtn.inputEnabled = true;
        play1PBtn.input.useHandCursor = true;
        play1PBtn.events.onInputUp.add(this.play1p.bind(this));
        play1PBtn.events.onInputOver.add(Events.scaleBig);
        play1PBtn.events.onInputOut.add(Events.scaleOrigin);
        play1PBtn.input.priorityID = this.mainMenuIputPriority;
        this.play1PBtn = play1PBtn;

        // 建立 Play 2P 按鈕
        let play2PBtn = game.add.text(
            Config.Play2PBtnPos.X,
            Config.Play2PBtnPos.Y,
            this.Dict.Play2PText,
            Config.DefaultFontStyle
        );
        play2PBtn.anchor.setTo(Config.Play2PBtnPos.Anchor.X, Config.Play2PBtnPos.Anchor.Y);
        play2PBtn.inputEnabled = true;
        play2PBtn.input.useHandCursor = true;
        play2PBtn.events.onInputUp.add(this.play2p.bind(this));
        play2PBtn.events.onInputOver.add(Events.scaleBig);
        play2PBtn.events.onInputOut.add(Events.scaleOrigin);
        play2PBtn.input.priorityID = this.mainMenuIputPriority;
        this.play2PBtn = play2PBtn;

        // 建立 Play Online 按鈕
        let playOnlineBtn = game.add.text(
            Config.PlayOnlineBtnPos.X,
            Config.PlayOnlineBtnPos.Y,
            this.Dict.PlayOnlineText,
            Config.DefaultFontStyle
        );
        playOnlineBtn.anchor.setTo(Config.PlayOnlineBtnPos.Anchor.X, Config.PlayOnlineBtnPos.Anchor.Y);
        playOnlineBtn.inputEnabled = true;
        playOnlineBtn.input.useHandCursor = true;
        playOnlineBtn.events.onInputUp.add(this.playOnline.bind(this));
        playOnlineBtn.events.onInputOver.add(Events.scaleBig);
        playOnlineBtn.events.onInputOut.add(Events.scaleOrigin);
        playOnlineBtn.input.priorityID = this.mainMenuIputPriority;
        this.playOnlineBtn = playOnlineBtn;

        // 建立 setting 按鈕
        let settingBtn = game.add.text(
            Config.SettingBtnPos.X,
            Config.SettingBtnPos.Y,
            this.Dict.SettingText,
            Config.PlayBold34FontStyle
        );
        settingBtn.anchor.setTo(Config.SettingBtnPos.Anchor.X, Config.SettingBtnPos.Anchor.Y);
        settingBtn.inputEnabled = true;
        settingBtn.input.useHandCursor = true;
        settingBtn.events.onInputUp.add(this.onSettingButtonClicked.bind(this));
        settingBtn.events.onInputOver.add(Events.scaleBig);
        settingBtn.events.onInputOut.add(Events.scaleOrigin);
        settingBtn.input.priorityID = this.mainMenuIputPriority;
        this.settingBtn = settingBtn;

        // 建立游戲邊框
        let mainBox = game.add.graphics(Config.MainMenuDrawBoxPos.X, Config.MainMenuDrawBoxPos.Y);
        mainBox.lineStyle(
            Config.DefaultDrawBoxStyle.LineStyle.LineWidth,
            Config.DefaultDrawBoxStyle.LineStyle.LineColor,
            Config.DefaultDrawBoxStyle.LineStyle.LineAlpha
        );
        mainBox.drawRoundedRect(
            0,
            0,
            Config.MainMenuDrawBoxSize.Width,
            Config.MainMenuDrawBoxSize.Height,
            Config.MainMenuDrawBoxSize.Radius
        );
        this.mainBox = mainBox;

        // 初始化setting menu
        this.initSettingMenu();
        this.hideSettingMenu();
    }

    showLedgeAnimation() {
    }

    initSettingMenu() {
        this.settingMenu = new SettingMenu(this.game, this.settingMenuIputPriority, this.hideSettingMenu.bind(this));
    }

    showSettingMenu() {
        this.settingBtn.scale.setTo(1.0);
        this.settingBtn.inputEnabled = false;
        this.settingMenu.showAll();
    }

    hideSettingMenu() {
        this.settingBtn.inputEnabled = true;
        this.settingBtn.input.useHandCursor = true;
        this.settingMenu.hideAll();
    }

    // events callback
    play1p() {
        if (Utils.checkMouseInObject(this.game.input.mousePointer, this.play1PBtn) === false) {
            return;
        }
        this.game.state.start("Play1P");
    }

    play2p() {
        if (Utils.checkMouseInObject(this.game.input.mousePointer, this.play2PBtn) === false) {
            return;
        }
        // todo: play 2p state
        this.game.state.start("Play1P");
    }

    playOnline() {
        if (Utils.checkMouseInObject(this.game.input.mousePointer, this.playOnlineBtn) === false) {
            return;
        }
        // todo: play online state
        this.game.state.start("Play1P");
    }

    onSettingButtonClicked() {
        if (Utils.checkMouseInObject(this.game.input.mousePointer, this.settingBtn) === false) {
            return;
        }
        this.showSettingMenu();
    }
}

export default MainMenuState;
