import Phaser from "phaser";
import * as Events from "../events/events";
import ToggleButton from "../objects/togglebutton";
import * as Config from "../config";
import * as Utils from "../weblogic/utils";
import DictUS from "../dicts/us";
import Container from "../objects/container";
import Mask from "../objects/mask";
import Box from "../objects/box";

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
        this.settingMaskIputPriority = 1;
        this.settingBoxIputPriority = 2;
        this.settingButtonIputPriority = 3;
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
        settingBtn.events.onInputUp.add(this.showSettingMenuEvents.bind(this));
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
        this.settingMenu = new Container(this.game);

        // 建立遮罩
        let mask = new Mask(this.game);
        mask.setInputEvent(
            this.hideSettingMenuEvents.bind(this),
            this.settingMaskIputPriority
        );
        this.settingMenu.addInput("mask", mask, false);

        // 選單邊框
        let box = new Box(
            this.game,
            Config.SettingMenuDrawBoxPos.X,
            Config.SettingMenuDrawBoxPos.Y,
            Config.SettingMenuDrawBoxSize.Width,
            Config.SettingMenuDrawBoxSize.Height,
            Config.SettingMenuDrawBoxSize.Radius
        );
        box.inputEnabled = true;
        box.input.priorityID = this.settingBoxIputPriority;
        this.settingMenu.addInput("box", box, false);

        // setting選單的標題
        let title = new Phaser.Text(
            this.game,
            Config.SettingMenuTitlePos.X,
            Config.SettingMenuTitlePos.Y,
            this.Dict.SettingText,
            Config.DefaultFontStyle
        );
        title.anchor.setTo(
            Config.SettingMenuTitlePos.Anchor.X,
            Config.SettingMenuTitlePos.Anchor.Y
        );
        this.settingMenu.addAsset("title", title);

        // 音效設定圖案
        let soundsImage = new Phaser.Image(
            this.game,
            Config.SettingSoundPos.X,
            Config.SettingSoundPos.Y,
            Config.MainTextureAtlasName,
            Config.MainTextureAtlasKey.Sounds
        );
        soundsImage.anchor.setTo(
            Config.SettingSoundPos.Anchor.X,
            Config.SettingSoundPos.Anchor.Y,
        );
        this.settingMenu.addAsset("sounds", soundsImage);

        // 沙型階梯配置圖案
        let sandLedgeImage = new Phaser.Image(
            this.game,
            Config.SettingSandLedgePos.X,
            Config.SettingSandLedgePos.Y,
            Config.LedgesAtlasName,
            Config.LedgesAtlasKey.SandLedge1
        );
        sandLedgeImage.anchor.setTo(
            Config.SettingSandLedgePos.Anchor.X,
            Config.SettingSandLedgePos.Anchor.Y
        );
        this.settingMenu.addAsset("sandLedge", sandLedgeImage);

        // 彈跳階梯配置圖案
        let jumpLedgeImage = new Phaser.Image(
            this.game,
            Config.SettingJumpLedgePos.X,
            Config.SettingJumpLedgePos.Y,
            Config.LedgesAtlasName,
            Config.LedgesAtlasKey.JumpLedge1
        );
        jumpLedgeImage.anchor.setTo(
            Config.SettingJumpLedgePos.Anchor.X,
            Config.SettingJumpLedgePos.Anchor.Y
        );
        this.settingMenu.addAsset("jumpLedge", jumpLedgeImage);

        // 滾動階梯配置圖案
        let rollLedgeImage = new Phaser.Image(
            this.game,
            Config.SettingRollLedgePos.X,
            Config.SettingRollLedgePos.Y,
            Config.LedgesAtlasName,
            Config.LedgesAtlasKey.LeftLedge1
        );
        rollLedgeImage.anchor.setTo(
            Config.SettingRollLedgePos.Anchor.X,
            Config.SettingRollLedgePos.Anchor.Y
        );
        this.settingMenu.addAsset("rollLedge", rollLedgeImage);

        // 從cookie載入配置設定
        let setting = Utils.loadDownstairsGameSetting();

        // 音效開關按鈕
        let soundCheckBox = new ToggleButton(
            this.game,
            Config.SettingSoundCheckBoxPos.X,
            Config.SettingSoundCheckBoxPos.Y,
            Config.MainTextureAtlasName,
            this.toggleSounds.bind(this),
            this,
            setting.Sounds,
            Config.MainTextureAtlasKey.CheckBox1,
            Config.MainTextureAtlasKey.CheckBox2
        );
        soundCheckBox.input.priorityID = this.settingButtonIputPriority;
        soundCheckBox.input.useHandCursor = true;
        this.settingMenu.addInput("soundCheckBox", soundCheckBox);

        // 沙型階梯開關按鈕
        let sandLedgeCheckBox = new ToggleButton(
            this.game,
            Config.SettingSandLedgeCheckBoxPos.X,
            Config.SettingSandLedgeCheckBoxPos.Y,
            Config.MainTextureAtlasName,
            this.toggleSandLedge.bind(this),
            this,
            setting.SandLedge,
            Config.MainTextureAtlasKey.CheckBox1,
            Config.MainTextureAtlasKey.CheckBox2
        );
        sandLedgeCheckBox.input.priorityID = this.settingButtonIputPriority;
        sandLedgeCheckBox.input.useHandCursor = true;
        this.settingMenu.addInput("sandLedgeCheckBox", sandLedgeCheckBox);

        // 彈跳階梯開關按鈕
        let jumpLedgeCheckBox = new ToggleButton(
            this.game,
            Config.SettingJumpLedgeCheckBoxPos.X,
            Config.SettingJumpLedgeCheckBoxPos.Y,
            Config.MainTextureAtlasName,
            this.toggleJumpLedge.bind(this),
            this,
            setting.JumpLedge,
            Config.MainTextureAtlasKey.CheckBox1,
            Config.MainTextureAtlasKey.CheckBox2
        );
        jumpLedgeCheckBox.input.priorityID = this.settingButtonIputPriority;
        jumpLedgeCheckBox.input.useHandCursor = true;
        this.settingMenu.addInput("jumpLedgeCheckBox", jumpLedgeCheckBox);

        // 滾動階梯開關按鈕
        let rollLedgeCheckBox = new ToggleButton(
            this.game,
            Config.SettingRollLedgeCheckBoxPos.X,
            Config.SettingRollLedgeCheckBoxPos.Y,
            Config.MainTextureAtlasName,
            this.toggleRollLedge.bind(this),
            this,
            setting.RollLedge,
            Config.MainTextureAtlasKey.CheckBox1,
            Config.MainTextureAtlasKey.CheckBox2
        );
        rollLedgeCheckBox.input.priorityID = this.settingButtonIputPriority;
        rollLedgeCheckBox.input.useHandCursor = true;
        this.settingMenu.addInput("rollLedgeCheckBox", rollLedgeCheckBox);
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

    showSettingMenuEvents() {
        if (Utils.checkMouseInObject(this.game.input.mousePointer, this.settingBtn) === false) {
            return;
        }
        this.showSettingMenu();
    }

    hideSettingMenuEvents() {
        let mouseOnMask = Utils.checkMouseInObject(
            this.game.input.mousePointer,
            this.settingMenu.inputs["mask"].graphic
        );
        let mouseOnBox = Utils.checkMouseInObject(
            this.game.input.mousePointer,
            this.settingMenu.inputs["mask"].graphic
        );
        if (mouseOnMask === false || mouseOnBox === true) {
            return;
        }
        this.hideSettingMenu();
    }

    toggleSounds() {
        let soundCheckBox = this.settingMenu.inputs["soundCheckBox"];
        if (Utils.checkMouseInObject(this.game.input.mousePointer, soundCheckBox) === false) {
            return;
        }
        soundCheckBox.toggle();
        let setting = Utils.loadDownstairsGameSetting();
        setting.Sounds = soundCheckBox.isToggle;
        Utils.setCookie(Config.GameSettingCookieName, JSON.stringify(setting), Config.GameSettingCookieExpiredDay);
    }

    toggleSandLedge() {
        let sandLedgeCheckBox = this.settingMenu.inputs["sandLedgeCheckBox"];
        if (Utils.checkMouseInObject(this.game.input.mousePointer, sandLedgeCheckBox) === false) {
            return;
        }
        sandLedgeCheckBox.toggle();
        let setting = Utils.loadDownstairsGameSetting();
        setting.SandLedge = sandLedgeCheckBox.isToggle;
        Utils.setCookie(Config.GameSettingCookieName, JSON.stringify(setting), Config.GameSettingCookieExpiredDay);
    }

    toggleJumpLedge() {
        let jumpLedgeCheckBox = this.settingMenu.inputs["jumpLedgeCheckBox"];
        if (Utils.checkMouseInObject(this.game.input.mousePointer, jumpLedgeCheckBox) === false) {
            return;
        }
        jumpLedgeCheckBox.toggle();
        let setting = Utils.loadDownstairsGameSetting();
        setting.JumpLedge = jumpLedgeCheckBox.isToggle;
        Utils.setCookie(Config.GameSettingCookieName, JSON.stringify(setting), Config.GameSettingCookieExpiredDay);
    }

    toggleRollLedge() {
        let rollLedgeCheckBox = this.settingMenu.inputs["rollLedgeCheckBox"];
        if (Utils.checkMouseInObject(this.game.input.mousePointer, rollLedgeCheckBox) === false) {
            return;
        }
        rollLedgeCheckBox.toggle();
        let setting = Utils.loadDownstairsGameSetting();
        setting.RollLedge = rollLedgeCheckBox.isToggle;
        Utils.setCookie(Config.GameSettingCookieName, JSON.stringify(setting), Config.GameSettingCookieExpiredDay);
    }
}

export default MainMenuState;
