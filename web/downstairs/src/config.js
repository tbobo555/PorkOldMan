//----- for style -----
export const DefaultGoogleFontFamilies = ["Play:400,800:latin"];
export const DefaultFontStyle = {
    font: "60px Play",
    fill: "#000000",
    align: "center"
};
export const PlayBold34FontStyle = {
    font: "34px Play",
    fontWeight: 800,
    fill: "#000000",
    align: "center"
};
export const DefaultDrawBoxStyle = {
    LineStyle:{
        LineWidth: 2,
        LineColor: 0x000000,
        LineAlpha: 1,
    },
    FillStyle:{
        FillColor: 0xffffff,
        FillAlpha: 1
    },
};
export const DefaultDrawMaskBoxStyle = {
    LineStyle:{
        LineWidth: 1,
        LineColor: 0xffffff,
        LineAlpha: 0.9,
    },
    FillStyle:{
        FillColor: 0xffffff,
        FillAlpha: 0.9
    },
};

//----- for Game -----
export const PixelScaleRate = 1.0;
export const WorldWidth = 860 * PixelScaleRate;
export const WorldHeight = 800 * PixelScaleRate;
export const CameraWidth = 860 * PixelScaleRate;
export const CameraHeight = 760 * PixelScaleRate;
export const GameDivName = "container";
export const AutoWidthPercent = 0.75;
export const AutoHeightPercent = 0.9;
export const GameBackgroundColor = "#ffffff";
export const CenterAnchor = {
    X: 0.5,
    Y: 0.5
};
export const LeftTopAnchor = {
    X: 0,
    Y: 0
};
export const LeftBottomAnchor = {
    X: 0,
    Y: 1
};
export const RightTopAnchor = {
    X: 1,
    Y: 0
};
export const RightBottomAnchor = {
    X: 1,
    Y: 1
};
export const CenterTopAnchor = {
    X: 0.5,
    Y: 0
};
export const CenterBottomAnchor = {
    X: 0.5,
    Y: 1
};
export const CenterLeftAnchor = {
    X: 0,
    Y: 0.5
};
export const CenterRightAnchor = {
    X: 1,
    Y: 0.5
};
export const WorldCenterPosCenterAnchor = {
    X: WorldWidth / 2,
    Y: WorldHeight / 2,
    Anchor: CenterAnchor
};
export const CameraCenterPosCenterAnchor = {
    X: CameraWidth / 2,
    Y: CameraHeight / 2,
    Anchor: CenterAnchor
};

export const DefaultAnimationFrameRate = 20;
export const GameDrawBoxPos = {
    X: 0,
    Y: 0,
    Anchor: LeftTopAnchor
};
export const GameDrawBoxSize = {
    Width: CameraWidth,
    Height: CameraHeight,
    Radius: 5
};
export const GameDrawBoxStyle = DefaultDrawBoxStyle;
export const CameraMaskDrawBoxPos = GameDrawBoxPos;
export const CameraMaskDrawBoxSize = GameDrawBoxSize;
export const CameraMaskDrawBoxStyle = DefaultDrawMaskBoxStyle;
export const GameSettingCookieName = "d100_stt";
export const GameSettingCookieExpiredDay = 30;
export const DefaultGameSetting = {
    Sounds : true,
    SandLedge : true,
    JumpLedge : true,
    RollLedge : true,
};


//----- for atlas path -----
// ledges atlas
export const LedgesAtlasName = "atlas_ledges";
export const LedgesAtlasPath = {
    Image: "assets/img/atlas_ledges.png",
    JSON: "assets/img/atlas_ledges.json"
};
export const LedgesAtlasKey = {
    NormalLedge: "normal-ledge.png",
    ThornLedge: "thorn-ledge.png",
    JumpLedge1: "jump-ledge-01.png",
    JumpLedge2: "jump-ledge-02.png",
    JumpLedge3: "jump-ledge-03.png",
    LeftLedge1: "left-ledge-01.png",
    LeftLedge2: "left-ledge-02.png",
    LeftLedge3: "left-ledge-03.png",
    LeftLedge4: "left-ledge-04.png",
    LeftLedge5: "left-ledge-05.png",
    LeftLedge6: "left-ledge-06.png",
    RightLedge1: "right-ledge-01.png",
    RightLedge2: "right-ledge-02.png",
    RightLedge3: "right-ledge-03.png",
    RightLedge4: "right-ledge-04.png",
    RightLedge5: "right-ledge-05.png",
    RightLedge6: "right-ledge-06.png",
    SandLedge1: "sand-ledge-01.png",
    SandLedge2: "sand-ledge-02.png",
    SandLedge3: "sand-ledge-03.png",
    SandLedge4: "sand-ledge-04.png",
    SandLedge5: "sand-ledge-05.png",
    SandLedge6: "sand-ledge-06.png",
};
export const JumpLedgeAnimationFrames = [
    LedgesAtlasKey.JumpLedge2,
    LedgesAtlasKey.JumpLedge2,
    LedgesAtlasKey.JumpLedge3,
    LedgesAtlasKey.JumpLedge3,
    LedgesAtlasKey.JumpLedge1
];
export const RollLeftLedgeAnimationFrames = [
    LedgesAtlasKey.LeftLedge1,
    LedgesAtlasKey.LeftLedge2,
    LedgesAtlasKey.LeftLedge3,
    LedgesAtlasKey.LeftLedge4,
    LedgesAtlasKey.LeftLedge5,
    LedgesAtlasKey.LeftLedge6,
];
export const RollRightLedgeAnimationFrames = [
    LedgesAtlasKey.RightLedge1,
    LedgesAtlasKey.RightLedge2,
    LedgesAtlasKey.RightLedge3,
    LedgesAtlasKey.RightLedge4,
    LedgesAtlasKey.RightLedge5,
    LedgesAtlasKey.RightLedge6,
];
export const SandLedgeAnimationFrames = [
    LedgesAtlasKey.SandLedge1,
    LedgesAtlasKey.SandLedge1,
    LedgesAtlasKey.SandLedge1,
    LedgesAtlasKey.SandLedge2,
    LedgesAtlasKey.SandLedge3,
    LedgesAtlasKey.SandLedge4,
    LedgesAtlasKey.SandLedge5,
    LedgesAtlasKey.SandLedge6,
    LedgesAtlasKey.SandLedge1,
];
export const DefaultLedgeFrameSet = [
    LedgesAtlasKey.NormalLedge,
    LedgesAtlasKey.SandLedge1,
    LedgesAtlasKey.ThornLedge,
    LedgesAtlasKey.JumpLedge2,
    LedgesAtlasKey.LeftLedge1,
    LedgesAtlasKey.RightLedge1
];
export const DefaultLedgeNameSet = [
    "normal",
    "sand",
    "thorn",
    "jump",
    "left",
    "right"
];

// pork old man atlas
export const PorkOldManAtlasName = "atlas_porkoldman";
export const PorkOldManAtlasPath = {
    Image: "assets/img/atlas_porkoldman.png",
    JSON: "assets/img/atlas_porkoldman.json"
};
export const PorkOldManAtlasKey = {
    Green1: "porkoldman-green-01.png",
    Green2: "porkoldman-green-02.png",
    Green3: "porkoldman-green-03.png",
    Green4: "porkoldman-green-04.png",
    Green5: "porkoldman-green-05.png",
    Green6: "porkoldman-green-06.png",
    Green7: "porkoldman-green-07.png",
    Yellow1: "porkoldman-yellow-01.png",
    Yellow2: "porkoldman-yellow-02.png",
    Yellow3: "porkoldman-yellow-03.png",
    Yellow4: "porkoldman-yellow-04.png",
    Yellow5: "porkoldman-yellow-05.png",
    Yellow6: "porkoldman-yellow-06.png",
    Yellow7: "porkoldman-yellow-07.png",
};
export const PorkOldManAnimationFrames = {
    Green: {
        Left: [
            PorkOldManAtlasKey.Green2,
            PorkOldManAtlasKey.Green3,
            PorkOldManAtlasKey.Green2,
            PorkOldManAtlasKey.Green4
        ],
        Right: [
            PorkOldManAtlasKey.Green5,
            PorkOldManAtlasKey.Green6,
            PorkOldManAtlasKey.Green5,
            PorkOldManAtlasKey.Green7
        ]
    },
    Yellow: {
        Left: [
            PorkOldManAtlasKey.Yellow2,
            PorkOldManAtlasKey.Yellow3,
            PorkOldManAtlasKey.Yellow2,
            PorkOldManAtlasKey.Yellow4
        ],
        Right: [
            PorkOldManAtlasKey.Yellow5,
            PorkOldManAtlasKey.Yellow6,
            PorkOldManAtlasKey.Yellow5,
            PorkOldManAtlasKey.Yellow7
        ]
    },
};

// main texture atlas
export const MainTextureAtlasName = "atlas_main_texture";
export const MainTextureAtlasPath = {
    Image: "assets/img/maintexture.png",
    JSON: "assets/img/maintexture.json"
};
export const MainTextureAtlasKey = {
    CheckBox1: "checkbox-01.jpg",
    CheckBox2: "checkbox-02.jpg",
    Sounds: "sounds.jpg"
};

//----- for preload state -----
// loading文字的放置位置
export const LoadingTextPos = WorldCenterPosCenterAnchor;

// loading進度條的放置位置
export const LoadingProgressPos = {
    X: WorldWidth / 2,
    Y: WorldHeight / 2 + (100 * PixelScaleRate),
    Anchor: CenterAnchor
};

//----- for main menu state -----
export const GameTitlePos = {
    X: WorldWidth / 2,
    Y: 120 * PixelScaleRate,
    Anchor: CenterAnchor
};
export const Play1PBtnPos = {
    X: WorldWidth / 2,
    Y: 330 * PixelScaleRate,
    Anchor: CenterAnchor
};
export const Play2PBtnPos = {
    X: WorldWidth / 2,
    Y: 430 * PixelScaleRate,
    Anchor: CenterAnchor
};
export const PlayOnlineBtnPos = {
    X: WorldWidth / 2,
    Y: 530 * PixelScaleRate,
    Anchor: CenterAnchor
};
export const SettingBtnPos = {
    X: 110 * PixelScaleRate,
    Y: CameraHeight - (60 * PixelScaleRate),
    Anchor: CenterAnchor
};
export const MainMenuDrawBoxPos = GameDrawBoxPos;
export const MainMenuDrawBoxSize = GameDrawBoxSize;
export const SettingMenuDrawBoxPos = {
    X: 155 * PixelScaleRate,
    Y: 180 * PixelScaleRate,
    Anchor: LeftTopAnchor
};
export const SettingMenuDrawBoxSize = {
    Width: 550 * PixelScaleRate,
    Height: 500 * PixelScaleRate,
    Radius: 5
};
export const SettingMenuTitlePos = {
    X: WorldWidth / 2,
    Y: 225 * PixelScaleRate,
    Anchor: CenterAnchor
};
export const SettingSoundPos = {
    X: 370 * PixelScaleRate,
    Y: 340 * PixelScaleRate,
    Anchor: CenterAnchor
};
export const SettingSandLedgePos = {
    X: 370 * PixelScaleRate,
    Y: 420 * PixelScaleRate,
    Anchor: CenterAnchor
};
export const SettingJumpLedgePos = {
    X: 370 * PixelScaleRate,
    Y: 500 * PixelScaleRate,
    Anchor: CenterAnchor
};
export const SettingRollLedgePos = {
    X: 370 * PixelScaleRate,
    Y: 580 * PixelScaleRate,
    Anchor: CenterAnchor
};
export const SettingSoundCheckBoxPos = {
    X: 520 * PixelScaleRate,
    Y: 322 * PixelScaleRate,
};
export const SettingSandLedgeCheckBoxPos = {
    X: 520 * PixelScaleRate,
    Y: 402 * PixelScaleRate,
};
export const SettingJumpLedgeCheckBoxPos = {
    X: 520 * PixelScaleRate,
    Y: 482 * PixelScaleRate,
};
export const SettingRollLedgeCheckBoxPos = {
    X: 520 * PixelScaleRate,
    Y: 562 * PixelScaleRate,
};



// for play state
export const PlayerIniPos = {
    X: 406 * PixelScaleRate,
    Y: 370 * PixelScaleRate
};
export const PlayerGravity = {
    X: 0,
    Y: 800
};
export const DefaultPlayerFrameName = "porkoldman-green-01.png";
export const PlayerJumpSpeed = -400;
export const PlayerLeftSpeed = -220;
export const PlayerRightSpeed = 220;
export const PlayerGoLeftAnimationName = "Go-Left";
export const PlayerGoRightAnimationName = "Go-Right";
export const MainGameBoxPos = {X:430, Y:430};
export const MainGameBoxDrawPos = {X:60, Y:100};
export const MainGameBoxSize = {Width:740, Height:660, Radius:5};
export const LedgeIniPos = {X:0, Y:760};
export const LedgeRandXRange = {Min:60 , Max:620};
export const LedgeBasePosHeight = 105;
export const LedgeMarginHeight = 90;
export const LedgeMiddleBasePos ={X:340, Y:465};
export const DefaultLedgeFrameName = "normal-ledge.png";
export const DefaultLedgeBodySize = {Width: 180, Height: 30, OffsetX: 0, OffsetY: 0};
export const ThornLedgeBodySize = {Width: 180, Height: 30, OffsetX: 0, OffsetY: 30};
export const GameBoundsUpDrawPos = {X:0, Y:0};
export const GameBoundsUpSize = {Width: 860, Height: 100};
export const GameBoundsBottomDrawPos = {X:0, Y:760};
export const GameBoundsBottomSize = {Width: 860, Height: 40};
export const GameBoundsLeftDrawPos = {X:0, Y:0};
export const GameBoundsLeftSize = {Width: 60, Height: 800};
export const GameBoundsRightDrawPos = {X:800, Y:0};
export const GameBoundsRightSize = {Width: 60, Height: 800};

export const NormalLedgeName = "normal";
export const SandLedgeName = "sand";
export const ThornLedgeName = "thorn";
export const JumpLedgeName = "jump";
export const RollLeftLedgeName = "left";
export const RollRightLedgeName = "right";
export const JumpLedgeAnimationName = "jump";
export const SandLedgeAnimationName = "sand";
export const RollLeftLedgeAnimationName = "left";
export const RollRightLedgeAnimationName = "right";
