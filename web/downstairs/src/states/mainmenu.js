import Phaser from "phaser";
import * as Events from "../events/events";
import ToggleButton from "../objects/togglebutton";
import config from "../config";

class MainMenuState extends Phaser.State {
    create(game) {
        let style = config.DefaultFontStyle;

        let gameTitle = game.add.text(config.GameTitlePos.X, config.GameTitlePos.Y, "Pork Old Man - Downstairs", style);
        gameTitle.anchor.setTo(0.5);

        let play1PBtn = game.add.text(config.Play1PBtnPos.X, config.Play1PBtnPos.Y, "Play 1P", style);
        play1PBtn.anchor.set(0.5);
        play1PBtn.inputEnabled = true;
        play1PBtn.input.useHandCursor = true;
        play1PBtn.events.onInputUp.add(this.play1p.bind(this));
        play1PBtn.events.onInputOver.add(Events.scaleBig);
        play1PBtn.events.onInputOut.add(Events.scaleOrigin);

        let play2PBtn = game.add.text(config.Play2PBtnPos.X, config.Play2PBtnPos.Y, "Play 2P", style);
        play2PBtn.anchor.setTo(0.5);
        play2PBtn.inputEnabled = true;
        play2PBtn.input.useHandCursor = true;
        play2PBtn.events.onInputUp.add(this.play1p.bind(this));
        play2PBtn.events.onInputOver.add(Events.scaleBig);
        play2PBtn.events.onInputOut.add(Events.scaleOrigin);

        let playOnlineBtn = game.add.text(config.PlayOnlineBtnPos.X, config.PlayOnlineBtnPos.Y, "Play Online", style);
        playOnlineBtn.anchor.setTo(0.5);
        playOnlineBtn.inputEnabled = true;
        playOnlineBtn.input.useHandCursor = true;
        playOnlineBtn.events.onInputUp.add(this.play1p.bind(this));
        playOnlineBtn.events.onInputOver.add(Events.scaleBig);
        playOnlineBtn.events.onInputOut.add(Events.scaleOrigin);

        style = config.Play_Bold_34_FontStyle;
        let settingBtn = game.add.text(config.SettingBtnPos.X, config.SettingBtnPos.Y, "Setting", style);
        settingBtn.anchor.setTo(0.5);
        settingBtn.inputEnabled = true;
        settingBtn.input.useHandCursor = true;
        settingBtn.events.onInputUp.add(this.showSettingMenu.bind(this));
        settingBtn.events.onInputOver.add(Events.scaleBig);
        settingBtn.events.onInputOut.add(Events.scaleOrigin);

        let graphics = game.add.graphics(0, 0);
        graphics.lineStyle(2, 0x000000, 1);
        graphics.drawRoundedRect(config.MainGameBoxDrawPos.X, config.MainGameBoxDrawPos.Y, config.MainGameBoxSize.Width,
            config.MainGameBoxSize.Height, config.MainGameBoxSize.Radius);

    }

    play1p() {
        this.game.state.start("Play1P");
    }

    showSettingMenu() {
        let graphics = this.game.add.graphics(0, 0);
        graphics.beginFill(0xffffff, config.MaskBoxSize.Alpha);
        graphics.lineStyle(0, 0xffffff, config.MaskBoxSize.Alpha);
        graphics.drawRect(config.MaskBoxDrawPos.X, config.MaskBoxDrawPos.Y, config.MaskBoxSize.Width,
            config.MaskBoxSize.Height);
        graphics.moveTo(0, 0);
        graphics.beginFill(0xffffff, 1);
        graphics.lineStyle(2, 0x000000, 1);
        graphics.drawRoundedRect(config.SettingBoxDrawPos.X, config.SettingBoxDrawPos.Y, config.SettingBoxSize.Width,
            config.SettingBoxSize.Height, config.SettingBoxSize.Radius);

        let style = config.DefaultFontStyle;
        let settingText = this.game.add.text(430, 225, "Setting", style);
        settingText.anchor.setTo(0.5);

        let settingGroup = this.game.add.group();
        let sounds = settingGroup.create(370, 340, config.AtlasNameMainTexture, "sounds.jpg");
        sounds.anchor.setTo(0.5);

        let sandLedge = settingGroup.create(370, 420, config.AtlasNameLedges, "sand-ledge-01.png");
        sandLedge.anchor.setTo(0.5);

        let jumpLedge = settingGroup.create(370, 500, config.AtlasNameLedges, "jump-ledge-01.png");
        jumpLedge.anchor.setTo(0.5);

        let rollLedge = settingGroup.create(370, 580, config.AtlasNameLedges, "left-ledge-01.png");
        rollLedge.anchor.setTo(0.5);

        let soundBox = new ToggleButton(this.game, 540, 340, config.AtlasNameMainTexture, this.hideSettingMenu, this,
            this.game.enableSounds, "checkbox-01.jpg", "checkbox-02.jpg");
        soundBox.anchor.setTo(0.5);
        this.game.add.existing(soundBox);
    }

    hideSettingMenu() {

    }
}

export default MainMenuState;
