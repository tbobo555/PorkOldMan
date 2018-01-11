import Container from "../objects/container";
import Mask from "../objects/mask";
import ToggleButton from "../objects/togglebutton";
import * as Utils from "../weblogic/utils";
import Phaser from "phaser";
import Box from "../objects/box";
import * as Config from "../config";
import DictUS from "../dicts/us";


class SettingMenu extends Container {
    constructor(game, inputPriority, closeCallback) {
        super(game);
        // 依語系載入字典檔
        this.Dict = DictUS;

        // 從cookie載入配置設定
        let setting = Utils.loadDownstairsGameSetting();

        let maskPriority = inputPriority;
        let boxPriority = inputPriority + 1;
        let buttonPriority = inputPriority + 2;

        this.closeCallback = closeCallback;

        // 建立遮罩
        let mask = new Mask(this.game);
        mask.setInputEvent(
            this.hideSettingMenuEvents.bind(this),
            maskPriority
        );
        this.addInput("mask", mask, false);

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
        box.input.priorityID = boxPriority;
        this.addInput("box", box, false);

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
        this.addAsset("title", title);

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
        this.addAsset("sounds", soundsImage);

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
        this.addAsset("sandLedge", sandLedgeImage);

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
        this.addAsset("jumpLedge", jumpLedgeImage);

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
        this.addAsset("rollLedge", rollLedgeImage);

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
        soundCheckBox.input.priorityID = buttonPriority;
        soundCheckBox.input.useHandCursor = true;
        this.addInput("soundCheckBox", soundCheckBox);

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
        sandLedgeCheckBox.input.priorityID = buttonPriority;
        sandLedgeCheckBox.input.useHandCursor = true;
        this.addInput("sandLedgeCheckBox", sandLedgeCheckBox);

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
        jumpLedgeCheckBox.input.priorityID = buttonPriority;
        jumpLedgeCheckBox.input.useHandCursor = true;
        this.addInput("jumpLedgeCheckBox", jumpLedgeCheckBox);

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
        rollLedgeCheckBox.input.priorityID = buttonPriority;
        rollLedgeCheckBox.input.useHandCursor = true;
        this.addInput("rollLedgeCheckBox", rollLedgeCheckBox);
    }

    hideSettingMenuEvents() {
        let mouseOnMask = Utils.checkMouseInObject(
            this.game.input.mousePointer,
            this.inputs["mask"].graphic
        );
        let mouseOnBox = Utils.checkMouseInObject(
            this.game.input.mousePointer,
            this.inputs["box"].graphic
        );
        if (mouseOnMask === false || mouseOnBox === true) {
            return;
        }
        this.hideAll();
        if (this.closeCallback) {
            this.closeCallback();
        }
    }

    toggleSounds() {
        let soundCheckBox = this.inputs["soundCheckBox"];
        if (Utils.checkMouseInObject(this.game.input.mousePointer, soundCheckBox) === false) {
            return;
        }
        soundCheckBox.toggle();
        let setting = Utils.loadDownstairsGameSetting();
        setting.Sounds = soundCheckBox.isToggle;
        Utils.setCookie(Config.GameSettingCookieName, JSON.stringify(setting), Config.GameSettingCookieExpiredDay);
    }

    toggleSandLedge() {
        let sandLedgeCheckBox = this.inputs["sandLedgeCheckBox"];
        if (Utils.checkMouseInObject(this.game.input.mousePointer, sandLedgeCheckBox) === false) {
            return;
        }
        sandLedgeCheckBox.toggle();
        let setting = Utils.loadDownstairsGameSetting();
        setting.SandLedge = sandLedgeCheckBox.isToggle;
        Utils.setCookie(Config.GameSettingCookieName, JSON.stringify(setting), Config.GameSettingCookieExpiredDay);
    }

    toggleJumpLedge() {
        let jumpLedgeCheckBox = this.inputs["jumpLedgeCheckBox"];
        if (Utils.checkMouseInObject(this.game.input.mousePointer, jumpLedgeCheckBox) === false) {
            return;
        }
        jumpLedgeCheckBox.toggle();
        let setting = Utils.loadDownstairsGameSetting();
        setting.JumpLedge = jumpLedgeCheckBox.isToggle;
        Utils.setCookie(Config.GameSettingCookieName, JSON.stringify(setting), Config.GameSettingCookieExpiredDay);
    }

    toggleRollLedge() {
        let rollLedgeCheckBox = this.inputs["rollLedgeCheckBox"];
        if (Utils.checkMouseInObject(this.game.input.mousePointer, rollLedgeCheckBox) === false) {
            return;
        }
        rollLedgeCheckBox.toggle();
        let setting = Utils.loadDownstairsGameSetting();
        setting.RollLedge = rollLedgeCheckBox.isToggle;
        Utils.setCookie(Config.GameSettingCookieName, JSON.stringify(setting), Config.GameSettingCookieExpiredDay);
    }
}

export default SettingMenu;
