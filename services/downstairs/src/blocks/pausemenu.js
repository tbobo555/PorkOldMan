import Container from "../objects/container";
import Mask from "../objects/mask";
import Box from "../objects/box";
import Phaser from "phaser";
import * as Config from "../config";
import * as Events from "../events/events";
import ToggleButton from "../objects/togglebutton";
import DictUS from "../dicts/us";
import * as Utils from "../weblogic/utils";


class PauseMenu extends Container {
    constructor(game, inputPriority, onContinueCallBack) {
        super(game);
        // 載入字典檔
        this.Dict = DictUS;

        // 從cookie載入配置設定
        let setting = Utils.loadDownstairsGameSetting();
        this.soundSetting = setting.Sounds;
        this.inputPriority = inputPriority;
        this.onContinueCallBack = onContinueCallBack;

        // 建立遮罩
        let mask = new Mask(game);
        this.addAsset("mask", mask);

        // 建立 pause 選單邊框
        let box = new Box(
            game,
            Config.PauseMenuDrawBoxPos.X,
            Config.PauseMenuDrawBoxPos.Y,
            Config.PauseMenuDrawBoxSize.Width,
            Config.PauseMenuDrawBoxSize.Height,
            Config.PauseMenuDrawBoxSize.Radius
        );
        this.addAsset("box", box);

        // pause選單的標題
        let title = new Phaser.Text(
            this.game,
            Config.PauseMenuTitlePos.X,
            Config.PauseMenuTitlePos.Y,
            this.Dict.PauseText,
            Config.DefaultFontStyle
        );
        title.anchor.setTo(
            Config.PauseMenuTitlePos.Anchor.X,
            Config.PauseMenuTitlePos.Anchor.Y
        );
        this.addAsset("title", title);

        // 音效設定圖案
        let soundImage = new Phaser.Image(
            this.game,
            Config.PauseMenuSoundPos.X,
            Config.PauseMenuSoundPos.Y,
            Config.MainTextureAtlasName,
            Config.MainTextureAtlasKey.Sounds
        );
        soundImage.anchor.setTo(
            Config.PauseMenuSoundPos.Anchor.X,
            Config.PauseMenuSoundPos.Anchor.Y,
        );
        this.addAsset("soundImage", soundImage);

        // 音效開關按鈕
        let soundCheckBox = new ToggleButton (
            this.game,
            Config.PauseMenuSoundCheckBoxPos.X,
            Config.PauseMenuSoundCheckBoxPos.Y,
            Config.MainTextureAtlasName,
            this.toggleSounds.bind(this),
            this,
            this.soundSetting,
            Config.MainTextureAtlasKey.CheckBox1,
            Config.MainTextureAtlasKey.CheckBox2
        );
        soundCheckBox.input.priorityID = this.inputPriority;
        this.addInput("soundCheckBox", soundCheckBox);

        // 建立 continue 按鈕
        let continueBtn = new Phaser.Text(
            this.game,
            Config.PauseMenuContinueButtonPos.X,
            Config.PauseMenuContinueButtonPos.Y,
            this.Dict.ContinueText,
            Config.DefaultFontStyle
        );
        continueBtn.anchor.setTo(
            Config.PauseMenuContinueButtonPos.Anchor.X,
            Config.PauseMenuContinueButtonPos.Anchor.Y
        );
        continueBtn.inputEnabled = true;
        continueBtn.input.priorityID = this.inputPriority;
        continueBtn.events.onInputUp.add(this.onContinueClick.bind(this));
        continueBtn.events.onInputOver.add(Events.scaleBig);
        continueBtn.events.onInputOut.add(Events.scaleOrigin);
        this.addInput("continueBtn", continueBtn);

    }

    toggleSounds() {
        let soundCheckBox = this.inputs["soundCheckBox"];
        if (Utils.checkMouseInObject(this.game.input.mousePointer, soundCheckBox) === false) {
            return;
        }
        soundCheckBox.toggle();
        let setting = Utils.loadDownstairsGameSetting();
        setting.Sounds = soundCheckBox.isToggle;
        this.soundSetting = setting.Sounds;
        Utils.setCookie(Config.GameSettingCookieName, JSON.stringify(setting), Config.GameSettingCookieExpiredDay);
    }

    onContinueClick() {
        let continueBtn = this.inputs["continueBtn"];
        if (Utils.checkMouseInObject(this.game.input.mousePointer, continueBtn) === false) {
            return;
        }
        continueBtn.scale.setTo(1.0);
        this.hideAll();
        if (this.onContinueCallBack) {
            this.onContinueCallBack();
        }
    }
}

export default PauseMenu;
