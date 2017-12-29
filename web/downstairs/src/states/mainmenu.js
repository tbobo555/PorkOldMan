import Phaser from "phaser";
import * as Events from "../events/events";
import ToggleButton from "../objects/togglebutton";
import * as Config from "../config";
import * as Utils from "../weblogic/utils";
import DictUS from "../dicts/us";


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

        // setting menu objects
        this.maskBox = null;
        this.maskBoxPainter = null;
        this.settingBox= null;
        this.settingBoxPainter = null;
        this.settingGroup = null;
        this.soundCheckBox = null;
        this.sandLedgeCheckBox = null;
        this.jumpLedgeCheckBox = null;
        this.rollLedgeCheckBox = null;

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

        this.addSettingMenu();
        this.hideSettingMenu();
    }

    showLedgeAnimation() {
    }

    addSettingMenu() {
        // 建立 setting 選單遮罩
        let maskPainter = this.game.add.graphics(Config.CameraMaskDrawBoxPos.X, Config.CameraMaskDrawBoxPos.Y);
        maskPainter.beginFill(
            Config.DefaultDrawMaskBoxStyle.FillStyle.FillColor,
            Config.DefaultDrawMaskBoxStyle.FillStyle.FillAlpha
        );
        maskPainter.drawRect(
            0,
            0,
            Config.CameraMaskDrawBoxSize.Width,
            Config.CameraMaskDrawBoxSize.Height
        );
        let maskBox = this.game.add.image(0, 0);
        maskBox.addChild(maskPainter);
        maskBox.inputEnabled = true;
        maskBox.events.onInputUp.add(this.hideSettingMenuEvents.bind(this));
        maskBox.input.priorityID = this.settingMaskIputPriority;
        this.maskBoxPainter = maskPainter;
        this.maskBox = maskBox;

        // 建立 setting 選單邊框
        let settingBoxPainter = this.game.add.graphics(Config.SettingMenuDrawBoxPos.X, Config.SettingMenuDrawBoxPos.Y);
        settingBoxPainter.beginFill(
            Config.DefaultDrawBoxStyle.FillStyle.FillColor,
            Config.DefaultDrawBoxStyle.FillStyle.FillAlpha
        );
        settingBoxPainter.lineStyle(
            Config.DefaultDrawBoxStyle.LineStyle.LineWidth,
            Config.DefaultDrawBoxStyle.LineStyle.LineColor,
            Config.DefaultDrawBoxStyle.LineStyle.LineAlpha
        );
        settingBoxPainter.drawRoundedRect(
            0,
            0,
            Config.SettingMenuDrawBoxSize.Width,
            Config.SettingMenuDrawBoxSize.Height,
            Config.SettingMenuDrawBoxSize.Radius
        );
        let settingBox = this.game.add.image(0, 0);
        settingBox.addChild(settingBoxPainter);
        settingBox.inputEnabled = true;
        settingBox.input.priorityID = this.settingBoxIputPriority;
        this.settingBoxPainter = settingBoxPainter;
        this.settingBox = settingBox;

        // 建立 setting 選單會使用到的靜態圖
        this.settingGroup = this.game.add.group();
        // setting選單的標題
        let settingMenuTitle = new Phaser.Text(
            this.game,
            Config.SettingMenuTitlePos.X,
            Config.SettingMenuTitlePos.Y,
            this.Dict.SettingText,
            Config.DefaultFontStyle
        );
        settingMenuTitle.anchor.setTo(
            Config.SettingMenuTitlePos.Anchor.X,
            Config.SettingMenuTitlePos.Anchor.Y
        );
        this.settingGroup.add(settingMenuTitle);

        // 音效設定圖案
        let sounds = this.settingGroup.create(
            Config.SettingSoundPos.X,
            Config.SettingSoundPos.Y,
            Config.MainTextureAtlasName,
            Config.MainTextureAtlasKey.Sounds
        );
        sounds.anchor.setTo(
            Config.SettingSoundPos.Anchor.X,
            Config.SettingSoundPos.Anchor.Y,
        );

        // 沙型階梯配置圖案
        let sandLedge = this.settingGroup.create(
            Config.SettingSandLedgePos.X,
            Config.SettingSandLedgePos.Y,
            Config.LedgesAtlasName,
            Config.LedgesAtlasKey.SandLedge1
        );
        sandLedge.anchor.setTo(
            Config.SettingSandLedgePos.Anchor.X,
            Config.SettingSandLedgePos.Anchor.Y
        );

        // 彈跳階梯配置圖案
        let jumpLedge = this.settingGroup.create(
            Config.SettingJumpLedgePos.X,
            Config.SettingJumpLedgePos.Y,
            Config.LedgesAtlasName,
            Config.LedgesAtlasKey.JumpLedge1
        );
        jumpLedge.anchor.setTo(
            Config.SettingJumpLedgePos.Anchor.X,
            Config.SettingJumpLedgePos.Anchor.Y
        );

        // 滾動階梯配置圖案
        let rollLedge = this.settingGroup.create(
            Config.SettingRollLedgePos.X,
            Config.SettingRollLedgePos.Y,
            Config.LedgesAtlasName,
            Config.LedgesAtlasKey.LeftLedge1
        );
        rollLedge.anchor.setTo(
            Config.SettingRollLedgePos.Anchor.X,
            Config.SettingRollLedgePos.Anchor.Y
        );

        // 從cookie載入配置設定
        let setting = Utils.loadDownGameSetting();

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
        this.game.add.existing(soundCheckBox);
        soundCheckBox.input.priorityID = this.settingButtonIputPriority;
        soundCheckBox.input.useHandCursor = true;
        this.soundCheckBox = soundCheckBox;

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
        this.game.add.existing(sandLedgeCheckBox);
        sandLedgeCheckBox.input.priorityID = this.settingButtonIputPriority;
        sandLedgeCheckBox.input.useHandCursor = true;
        this.sandLedgeCheckBox = sandLedgeCheckBox;

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
        this.game.add.existing(jumpLedgeCheckBox);
        jumpLedgeCheckBox.input.priorityID = this.settingButtonIputPriority;
        jumpLedgeCheckBox.input.useHandCursor = true;
        this.jumpLedgeCheckBox = jumpLedgeCheckBox;

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
        this.game.add.existing(rollLedgeCheckBox);
        rollLedgeCheckBox.input.priorityID = this.settingButtonIputPriority;
        rollLedgeCheckBox.input.useHandCursor = true;
        this.rollLedgeCheckBox = rollLedgeCheckBox;
    }

    showSettingMenu() {
        this.settingBtn.scale.setTo(1.0);
        this.settingBtn.inputEnabled = false;

        this.maskBox.visible = true;
        this.maskBox.inputEnabled = true;

        this.settingBox.visible = true;
        this.settingBox.inputEnabled = true;
        this.settingGroup.visible = true;

        this.soundCheckBox.visible = true;
        this.soundCheckBox.inputEnabled = true;
        this.soundCheckBox.input.useHandCursor = true;

        this.sandLedgeCheckBox.visible = true;
        this.sandLedgeCheckBox.inputEnabled = true;
        this.sandLedgeCheckBox.input.useHandCursor = true;

        this.jumpLedgeCheckBox.visible = true;
        this.jumpLedgeCheckBox.inputEnabled = true;
        this.jumpLedgeCheckBox.input.useHandCursor = true;

        this.rollLedgeCheckBox.visible = true;
        this.rollLedgeCheckBox.inputEnabled = true;
        this.rollLedgeCheckBox.input.useHandCursor = true;
    }

    hideSettingMenu() {
        this.settingBtn.inputEnabled = true;
        this.settingBtn.input.useHandCursor = true;

        this.maskBox.visible = false;
        this.maskBox.inputEnabled = false;

        this.settingBox.visible = false;
        this.settingBox.inputEnabled = false;
        this.settingGroup.visible = false;

        this.soundCheckBox.visible = false;
        this.soundCheckBox.inputEnabled = false;

        this.sandLedgeCheckBox.visible = false;
        this.sandLedgeCheckBox.inputEnabled = false;

        this.jumpLedgeCheckBox.visible = false;
        this.jumpLedgeCheckBox.inputEnabled = false;

        this.rollLedgeCheckBox.visible = false;
        this.rollLedgeCheckBox.inputEnabled = false;
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
        if (Utils.checkMouseInObject(this.game.input.mousePointer, this.maskBoxPainter) === false ||
            Utils.checkMouseInObject(this.game.input.mousePointer, this.settingBoxPainter) === true) {
            return;
        }
        this.hideSettingMenu();
    }

    toggleSounds() {
        if (Utils.checkMouseInObject(this.game.input.mousePointer, this.soundCheckBox) === false) {
            return;
        }
        this.soundCheckBox.toggle();
        let setting = Utils.loadDownGameSetting();
        setting.Sounds = this.soundCheckBox.isToggle;
        Utils.setCookie(Config.GameSettingCookieName, JSON.stringify(setting), Config.GameSettingCookieExpiredDay);
    }

    toggleSandLedge() {
        if (Utils.checkMouseInObject(this.game.input.mousePointer, this.sandLedgeCheckBox) === false) {
            return;
        }
        this.sandLedgeCheckBox.toggle();
        let setting = Utils.loadDownGameSetting();
        setting.SandLedge = this.sandLedgeCheckBox.isToggle;
        Utils.setCookie(Config.GameSettingCookieName, JSON.stringify(setting), Config.GameSettingCookieExpiredDay);
    }

    toggleJumpLedge() {
        if (Utils.checkMouseInObject(this.game.input.mousePointer, this.jumpLedgeCheckBox) === false) {
            return;
        }
        this.jumpLedgeCheckBox.toggle();
        let setting = Utils.loadDownGameSetting();
        setting.JumpLedge = this.jumpLedgeCheckBox.isToggle;
        Utils.setCookie(Config.GameSettingCookieName, JSON.stringify(setting), Config.GameSettingCookieExpiredDay);
    }

    toggleRollLedge() {
        if (Utils.checkMouseInObject(this.game.input.mousePointer, this.rollLedgeCheckBox) === false) {
            return;
        }
        this.rollLedgeCheckBox.toggle();
        let setting = Utils.loadDownGameSetting();
        setting.RollLedge = this.rollLedgeCheckBox.isToggle;
        Utils.setCookie(Config.GameSettingCookieName, JSON.stringify(setting), Config.GameSettingCookieExpiredDay);
    }
}

export default MainMenuState;
