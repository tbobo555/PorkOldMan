export default {
    DefaultGameSetting: {
        Sounds : true,
        SandLedge : true,
        JumpLedge : true,
        RollLedge : true,
    },
    GameSettingCookieName: "d100_stt",
    WorldWidth: 860,
    WorldHeight: 800,
    CameraWidth: 860,
    CameraHeight: 760,
    GameDivName: "container",
    AutoWidthPercent: 0.75,
    AutoHeightPercent: 0.9,
    DefaultAnimationFrameRate: 20,
    PlayerIniX: 406,
    PlayerIniY: 370,
    PlayerGravityY: 800,
    DefaultFontStyle: {
        font: "60px Play",
        fill: "#000000",
        align: "center"
    },
    Play_Bold_34_FontStyle: {
        font: "34px Play",
        fontWeight: 800,
        fill: "#000000",
        align: "center"
    },
    DefaultPlayerFrameName: "porkoldman-green-01.png",
    PlayerJumpSpeed: -400,
    PlayerLeftSpeed: -220,
    PlayerRightSpeed: 220,
    PlayerGoLeftAnimationName: "Go-Left",
    PlayerGoRightAnimationName: "Go-Right",
    PlayerGoLeftAnimationFrames:[
        "porkoldman-green-02.png",
        "porkoldman-green-03.png",
        "porkoldman-green-02.png",
        "porkoldman-green-04.png"
    ],
    PlayerGoRightAnimationFrames:[
        "porkoldman-green-05.png",
        "porkoldman-green-06.png",
        "porkoldman-green-05.png",
        "porkoldman-green-07.png"
    ],
    GameTitlePos: {X:430, Y:120},
    Play1PBtnPos: {X:430, Y:330},
    Play2PBtnPos: {X:430, Y:430},
    PlayOnlineBtnPos: {X:430, Y:530},
    SettingBtnPos: {X:110, Y:700},
    MainGameBoxPos:{X:430, Y:430},
    MainGameBoxDrawPos:{X:60, Y:100},
    MainGameBoxSize:{Width:740, Height:660, Radius:5},
    MainCameraBoxPos:{X:430, Y:380},
    MainCameraBoxDrawPos:{X:0, Y:0},
    MainCameraBoxSize:{Width:860, Height:760, Radius:5},
    SettingBoxPos:{X:430, Y:430},
    SettingBoxDrawPos:{X:155, Y:180},
    SettingBoxSize:{Width:550, Height:500, Radius:5},
    MaskBoxPos:{X:430, Y:400},
    MaskBoxDrawPos:{X:0, Y:0},
    MaskBoxSize:{Width:860, Height:800, Alpha: 0.9},
    LedgeIniPos: {X:0, Y:760},
    LedgeRandXRange: {Min:60 , Max:620},
    LedgeBasePosHeight: 105,
    LedgeMarginHeight: 90,
    LedgeMiddleBasePos:{X:340, Y:465},
    DefaultLedgeFrameName: "normal-ledge.png",
    DefaultLedgeBodySize: {Width: 180, Height: 30, OffsetX: 0, OffsetY: 0},
    ThornLedgeBodySize: {Width: 180, Height: 30, OffsetX: 0, OffsetY: 30},
    GameBoundsUpDrawPos: {X:0, Y:0},
    GameBoundsUpSize: {Width: 860, Height: 100},
    GameBoundsBottomDrawPos: {X:0, Y:760},
    GameBoundsBottomSize: {Width: 860, Height: 40},
    GameBoundsLeftDrawPos: {X:0, Y:0},
    GameBoundsLeftSize: {Width: 60, Height: 800},
    GameBoundsRightDrawPos: {X:800, Y:0},
    GameBoundsRightSize: {Width: 60, Height: 800},

    JumpLedgeAnimationFrames: [
        "jump-ledge-02.png",
        "jump-ledge-02.png",
        "jump-ledge-03.png",
        "jump-ledge-03.png",
        "jump-ledge-01.png"
    ],
    RollLeftLedgeAnimationFrames: [
        "left-ledge-01.png",
        "left-ledge-02.png",
        "left-ledge-03.png",
        "left-ledge-04.png",
        "left-ledge-05.png",
        "left-ledge-06.png"
    ],
    RollRightLedgeAnimationFrames: [
        "right-ledge-01.png",
        "right-ledge-02.png",
        "right-ledge-03.png",
        "right-ledge-04.png",
        "right-ledge-05.png",
        "right-ledge-06.png"
    ],
    SandLedgeAnimationFrames: [
        "sand-ledge-01.png",
        "sand-ledge-01.png",
        "sand-ledge-02.png",
        "sand-ledge-03.png",
        "sand-ledge-04.png",
        "sand-ledge-05.png",
        "sand-ledge-06.png",
        "sand-ledge-01.png"
    ],
    DefaultLedgeFrameSet: [
        "normal-ledge.png",
        "sand-ledge-01.png",
        "thorn-ledge.png",
        "jump-ledge-01.png",
        "left-ledge-01.png",
        "right-ledge-01.png"
    ],
    NormalLedgeName: "normal",
    SandLedgeName: "sand",
    ThornLedgeName: "thorn",
    JumpLedgeName: "jump",
    RollLeftLedgeName: "left",
    RollRightLedgeName: "right",
    JumpLedgeAnimationName: "jump",
    SandLedgeAnimationName: "sand",
    RollLeftLedgeAnimationName: "left",
    RollRightLedgeAnimationName: "right",
    DefaultLedgeNameSet: [
        "normal",
        "sand",
        "thorn",
        "jump",
        "left",
        "right"
    ],

    //----- for preload state -----
    // loading文字的放置位置
    LoadingTextPos: {X: 430, Y:400, Anchor:{X:0.5, Y:0.5}},

    // loading進度條的放置位置
    LoadingProgressPos: {X: 430, Y:400, Anchor:{X:0.5, Y:0.5}},


    //----- for atlas path -----
    // ledges atlas
    LedgesAtlasName: "atlas_ledges",
    LedgesAtlasPath: {
        Image: "assets/img/atlas_ledges.png",
        JSON: "assets/img/atlas_ledges.json"
    },

    // pork old man atlas
    PorkOldManAtlasName: "atlas_porkoldman",
    PorkOldManAtlasPath: {
        Image: "assets/img/atlas_porkoldman.png",
        JSON: "assets/img/atlas_porkoldman.json"
    },

    // main texture atlas
    MainTextureAtlasName: "atlas_main_texture",
    MainTextureAtlasPath: {
        Image: "assets/img/maintexture.png",
        JSON: "assets/img/maintexture.json"
    },

};
