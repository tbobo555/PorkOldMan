import Phaser from "phaser";
import * as Events from "../events/events";
import ToggleButton from "../objects/togglebutton";
import config from "../config";
import * as utils from "../weblogic/utils";

class MainMenuState extends Phaser.State {
    constructor() {
        super();
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
        let style = config.DefaultFontStyle;

        let gameTitle = game.add.text(config.GameTitlePos.X, config.GameTitlePos.Y, "Pork Old Man - Downstairs", style);
        gameTitle.anchor.setTo(0.5);
        this.gameTitle = gameTitle;

        let play1PBtn = game.add.text(config.Play1PBtnPos.X, config.Play1PBtnPos.Y, "Play 1P", style);
        play1PBtn.anchor.set(0.5);
        play1PBtn.inputEnabled = true;
        play1PBtn.input.useHandCursor = true;
        play1PBtn.events.onInputUp.add(this.play1p.bind(this));
        play1PBtn.events.onInputOver.add(Events.scaleBig);
        play1PBtn.events.onInputOut.add(Events.scaleOrigin);
        play1PBtn.input.priorityID = this.mainMenuIputPriority;
        this.play1PBtn = play1PBtn;

        let play2PBtn = game.add.text(config.Play2PBtnPos.X, config.Play2PBtnPos.Y, "Play 2P", style);
        play2PBtn.anchor.setTo(0.5);
        play2PBtn.inputEnabled = true;
        play2PBtn.input.useHandCursor = true;
        play2PBtn.events.onInputUp.add(this.play1p.bind(this));
        play2PBtn.events.onInputOver.add(Events.scaleBig);
        play2PBtn.events.onInputOut.add(Events.scaleOrigin);
        play2PBtn.input.priorityID = this.mainMenuIputPriority;
        this.play2PBtn = play2PBtn;

        let playOnlineBtn = game.add.text(config.PlayOnlineBtnPos.X, config.PlayOnlineBtnPos.Y, "Play Online", style);
        playOnlineBtn.anchor.setTo(0.5);
        playOnlineBtn.inputEnabled = true;
        playOnlineBtn.input.useHandCursor = true;
        playOnlineBtn.events.onInputUp.add(this.play1p.bind(this));
        playOnlineBtn.events.onInputOver.add(Events.scaleBig);
        playOnlineBtn.events.onInputOut.add(Events.scaleOrigin);
        playOnlineBtn.input.priorityID = this.mainMenuIputPriority;
        this.playOnlineBtn = playOnlineBtn;

        style = config.Play_Bold_34_FontStyle;
        let settingBtn = game.add.text(config.SettingBtnPos.X, config.SettingBtnPos.Y, "Setting", style);
        settingBtn.anchor.setTo(0.5);
        settingBtn.inputEnabled = true;
        settingBtn.input.useHandCursor = true;
        settingBtn.events.onInputUp.add(this.showSettingMenuEvents.bind(this));
        settingBtn.events.onInputOver.add(Events.scaleBig);
        settingBtn.events.onInputOut.add(Events.scaleOrigin);
        settingBtn.input.priorityID = this.mainMenuIputPriority;
        this.settingBtn = settingBtn;

        let mainBox = game.add.graphics(0, 0);
        mainBox.lineStyle(2, 0x000000, 1);
        mainBox.drawRoundedRect(config.MainCameraBoxDrawPos.X, config.MainCameraBoxDrawPos.Y,
            config.MainCameraBoxSize.Width, config.MainCameraBoxSize.Height, config.MainCameraBoxSize.Radius);
        this.mainBox = mainBox;

        this.addSettingMenu();
        this.hideSettingMenu();
    }

    addSettingMenu() {
        let maskPainter = this.game.add.graphics(config.MaskBoxDrawPos.X, config.MaskBoxDrawPos.Y);
        maskPainter.beginFill(0xffffff, config.MaskBoxSize.Alpha);
        maskPainter.lineStyle(0, 0xffffff, config.MaskBoxSize.Alpha);
        maskPainter.drawRect(0, 0, config.MaskBoxSize.Width, config.MaskBoxSize.Height);
        let maskBox = this.game.add.image(0, 0);
        maskBox.addChild(maskPainter);
        maskBox.inputEnabled = true;
        maskBox.events.onInputUp.add(this.hideSettingMenuEvents.bind(this));
        maskBox.input.priorityID = this.settingMaskIputPriority;
        this.maskBoxPainter = maskPainter;
        this.maskBox = maskBox;

        let settingBoxPainter = this.game.add.graphics(config.SettingBoxDrawPos.X, config.SettingBoxDrawPos.Y);
        settingBoxPainter.beginFill(0xffffff, 1);
        settingBoxPainter.lineStyle(2, 0x000000, 1);
        settingBoxPainter.drawRoundedRect(0, 0, config.SettingBoxSize.Width, config.SettingBoxSize.Height,
            config.SettingBoxSize.Radius);
        let settingBox = this.game.add.image(0, 0);
        settingBox.addChild(settingBoxPainter);
        settingBox.inputEnabled = true;
        settingBox.input.priorityID = this.settingBoxIputPriority;
        this.settingBoxPainter = settingBoxPainter;
        this.settingBox = settingBox;

        let settingGroup = this.game.add.group();
        this.settingGroup = settingGroup;

        let style = config.DefaultFontStyle;
        let settingText = new Phaser.Text(this.game, 430, 225, "Setting", style);
        settingText.anchor.setTo(0.5);
        this.settingGroup.add(settingText);

        let sounds = settingGroup.create(370, 340, config.AtlasNameMainTexture, "sounds.jpg");
        sounds.anchor.setTo(0.5);

        let sandLedge = settingGroup.create(370, 420, config.AtlasNameLedges, "sand-ledge-01.png");
        sandLedge.anchor.setTo(0.5);

        let jumpLedge = settingGroup.create(370, 500, config.AtlasNameLedges, "jump-ledge-01.png");
        jumpLedge.anchor.setTo(0.5);

        let rollLedge = settingGroup.create(370, 580, config.AtlasNameLedges, "left-ledge-01.png");
        rollLedge.anchor.setTo(0.5);

        let setting = this.loadCookieSetting();
        let soundCheckBox = new ToggleButton(this.game, 520, 322, config.AtlasNameMainTexture,
            this.toggleSounds.bind(this), this, setting.Sounds, "checkbox-01.jpg", "checkbox-02.jpg");
        this.game.add.existing(soundCheckBox);
        soundCheckBox.input.priorityID = this.settingButtonIputPriority;
        soundCheckBox.input.useHandCursor = true;
        this.soundCheckBox = soundCheckBox;

        let sandLedgeCheckBox = new ToggleButton(this.game, 520, 402, config.AtlasNameMainTexture,
            this.toggleSandLedge.bind(this), this, setting.SandLedge, "checkbox-01.jpg", "checkbox-02.jpg");
        this.game.add.existing(sandLedgeCheckBox);
        sandLedgeCheckBox.input.priorityID = this.settingButtonIputPriority;
        sandLedgeCheckBox.input.useHandCursor = true;
        this.sandLedgeCheckBox = sandLedgeCheckBox;

        let jumpLedgeCheckBox = new ToggleButton(this.game, 520, 482, config.AtlasNameMainTexture,
            this.toggleJumpLedge.bind(this), this, setting.JumpLedge, "checkbox-01.jpg", "checkbox-02.jpg");
        this.game.add.existing(jumpLedgeCheckBox);
        jumpLedgeCheckBox.input.priorityID = this.settingButtonIputPriority;
        jumpLedgeCheckBox.input.useHandCursor = true;
        this.jumpLedgeCheckBox = jumpLedgeCheckBox;

        let rollLedgeCheckBox = new ToggleButton(this.game, 520, 562, config.AtlasNameMainTexture,
            this.toggleRollLedge.bind(this), this, setting.RollLedge, "checkbox-01.jpg", "checkbox-02.jpg");
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

    loadCookieSetting() {
        if (utils.checkCookie(config.GameSettingCookieName) === false) {
            utils.setCookie(config.GameSettingCookieName, JSON.stringify(config.DefaultGameSetting), 30);
            return config.DefaultGameSetting;
        } else {
            let validSetting = config.DefaultGameSetting;
            let data = null;
            try {
                data = JSON.parse(utils.getCookie(config.GameSettingCookieName));
            } catch(err) {
                utils.setCookie(config.GameSettingCookieName, JSON.stringify(validSetting), 30);
                return validSetting;
            }
            if(data.hasOwnProperty("Sounds") && typeof(data.Sounds) === "boolean") {
                validSetting.Sounds = data.Sounds;
            }
            if(data.hasOwnProperty("SandLedge") && typeof(data.SandLedge) === "boolean") {
                validSetting.SandLedge = data.SandLedge;
            }
            if(data.hasOwnProperty("JumpLedge") && typeof(data.JumpLedge) === "boolean") {
                validSetting.JumpLedge = data.JumpLedge;
            }
            if(data.hasOwnProperty("RollLedge") && typeof(data.RollLedge) === "boolean") {
                validSetting.RollLedge = data.RollLedge;
            }
            utils.setCookie(config.GameSettingCookieName, JSON.stringify(validSetting), 30);
            return validSetting;
        }
    }

    // events callback
    play1p() {
        this.game.state.start("Play1P");
    }

    showSettingMenuEvents() {
        if (utils.checkMouseInObject(this.game.input.mousePointer, this.settingBtn) === false) {
            return;
        }
        this.showSettingMenu();
    }

    hideSettingMenuEvents() {
        if (utils.checkMouseInObject(this.game.input.mousePointer, this.maskBoxPainter) === false ||
            utils.checkMouseInObject(this.game.input.mousePointer, this.settingBoxPainter) === true) {
            return;
        }
        this.hideSettingMenu();
    }

    toggleSounds() {
        if (utils.checkMouseInObject(this.game.input.mousePointer, this.soundCheckBox) === false) {
            return;
        }
        this.soundCheckBox.toggle();
        let setting = this.loadCookieSetting();
        setting.Sounds = this.soundCheckBox.isToggle;
        utils.setCookie(config.GameSettingCookieName, JSON.stringify(setting), 30);
    }

    toggleSandLedge() {
        if (utils.checkMouseInObject(this.game.input.mousePointer, this.sandLedgeCheckBox) === false) {
            return;
        }
        this.sandLedgeCheckBox.toggle();
        let setting = this.loadCookieSetting();
        setting.SandLedge = this.sandLedgeCheckBox.isToggle;
        utils.setCookie(config.GameSettingCookieName, JSON.stringify(setting), 30);
    }

    toggleJumpLedge() {
        if (utils.checkMouseInObject(this.game.input.mousePointer, this.jumpLedgeCheckBox) === false) {
            return;
        }
        this.jumpLedgeCheckBox.toggle();
        let setting = this.loadCookieSetting();
        setting.JumpLedge = this.jumpLedgeCheckBox.isToggle;
        utils.setCookie(config.GameSettingCookieName, JSON.stringify(setting), 30);
    }

    toggleRollLedge() {
        if (utils.checkMouseInObject(this.game.input.mousePointer, this.rollLedgeCheckBox) === false) {
            return;
        }
        this.rollLedgeCheckBox.toggle();
        let setting = this.loadCookieSetting();
        setting.RollLedge = this.rollLedgeCheckBox.isToggle;
        utils.setCookie(config.GameSettingCookieName, JSON.stringify(setting), 30);
    }

}

export default MainMenuState;
