/**
 * @namespace DownStairs
 */
var DownStairs = DownStairs || {

    /**
     * DownStairsEngine 版本號
     * @constant DownStairs.VERSION
     * @type {string}
     */
    VERSION: '1.0.0',

    /**
     * 每20幀，與Server同步對手的資訊
     * @constant DownStairs.ADJUST_PERIOD
     * @type {int}
     */
    ADJUST_PERIOD: 20,

    /**
     * 對戰遊戲的狀態識別碼：尋找對手中
     * @constant DownStairs.MATCHING_ACTION_KEY
     * @type {string}
     */
    MATCHING_ACTION_KEY: "Matching",

    /**
     * 對戰遊戲的狀態識別碼：已找到對手
     * @constant DownStairs.Matched_ACTION_KEY
     * @type {string}
     */
    MATCHED_ACTION_KEY: "Matched",

    /**
     * 對戰遊戲的狀態識別碼：開始對戰
     * @constant DownStairs.START_ACTION_KEY
     * @type {string}
     */
    START_ACTION_KEY: "Start",

    /**
     * 對戰遊戲的操作識別碼：跳躍
     * @constant DownStairs.JUMP_ACTION_KEY
     * @type {string}
     */
    JUMP_ACTION_KEY: "Jump",

    /**
     * 對戰遊戲的操作識別碼：向左
     * @constant DownStairs.LEFT_ACTION_KEY
     * @type {string}
     */
    LEFT_ACTION_KEY: "Left",

    /**
     * 對戰遊戲的操作識別碼：向右
     * @constant DownStairs.RIGHT_ACTION_KEY
     * @type {string}
     */
    RIGHT_ACTION_KEY: "Right",

    /**
     * 對戰遊戲的操作識別碼：停止
     * @constant DownStairs.STOP_ACTION_KEY
     * @type {string}
     */
    STOP_ACTION_KEY: "Stop",

    /**
     * 對戰遊戲的同步識別碼：向Server同步對手資訊
     * @constant DownStairs.ADJUST_ACTION_KEY
     * @type {string}
     */
    ADJUST_ACTION_KEY: "Adjust",

    /**
     * 對戰遊戲的同步識別碼：向Server同步所有物件資訊
     * @constant DownStairs.REFRESH_ALL_ACTION_KEY
     * @type {string}
     */
    REFRESH_ALL_ACTION_KEY: "RefreshAll",

    /**
     * 對戰遊戲的偵測識別碼：通知Server開始計數遊戲計時器
     * @constant DownStairs.START_GAME_TIMER_ACTION_KEY
     * @type {string}
     */
    START_GAME_TIMER_ACTION_KEY: "StartGameTimer"
};


/**
 * DownStairs的驅動物件，控制遊戲的所有物件、流程與操作
 *
 * @class DownStairs.Engine
 * @constructor
 * @param {WebSocket} [conn = WebSocket("ws://[host]/io/game/downstairs")] - WebSocket連線物件
 */
DownStairs.Engine = function(conn) {

    conn = conn || new WebSocket("ws://" + document.location.host + "/io/game/downstairs/"
        + document.getElementById("rt").innerText.trim());

    /**
     * @property {WebSocket} webSocketConn - WebSocket連線物件
     * @readOnly
     */
    this.webSocketConn = conn;

    /**
     * @property {Phaser.Game} phaserGame - 遊戲引擎Phaser JS的Game物件
     * @readOnly
     */
    this.phaserGame = null;

    /**
     * @property {boolean} visibleTrigger - 玩家是否可見到遊戲畫面 (瀏覽器縮小或切換網頁tab，玩家會看不到遊戲畫面)
     */
    this.visibleTrigger = true;

    /**
     * @property {array} playerMap - 存放遊戲人物的陣列
     * @readOnly
     */
    this.playerMap = {};

    /**
     * @property {object} platforms - 遊戲中讓人物踩踏的台階群組
     */
    this.platforms = null;

    /**
     * @property {object} cursors - 偵測鍵盤按鍵(上下左右)的按下事件
     */
    this.cursors = null;

    /**
     * @property {string} mainPlayerId - 玩家所操作的人物id，該id以uuid v4編碼
     * @readOnly
     */
    this.mainPlayerId = "";

    /**
     * @property {string} hostId - 對戰遊戲的人物1(主人)的id，該id以uuid v4編碼
     * @readOnly
     */
    this.hostId = "";

    /**
     * @property {string} hostId - 對戰遊戲的人物2(來賓)的id，該id以uuid v4編碼
     * @readOnly
     */
    this.guestId = "";

    /**
     * @property {bool} isMatching - 玩家是否已在對戰遊戲中尋找對手
     * @readOnly
     */
    this.isMatching = false;

    /**
     * @property {bool} isMatched - 玩家是否已在對戰遊戲中找到對手
     * @readOnly
     */
    this.isMatched = false;

    /**
     * @property {string} previousActionKey - 玩家前一次向Server所發送的操作指令碼
     */
    this.previousActionKey = "";

    /**
     * @property {int} adjustTimer - 向Server同步對手資訊的計數器
     */
    this.adjustTimer = 0;

    /**
     * @property {string} browserHiddenType - 瀏覽器用來隱藏網頁畫面的物件名稱
     */
    this.browserHiddenType = "hidden";
};


DownStairs.Engine.prototype = {
    /**
     * 驅動程式開始執行，初始化Phaser遊戲物件與WebSocket連線
     * @method DownStairs.Engine#run
     */
    run: function () {
        var config = {
            width: 800,
            height: 600,
            renderer: Phaser.AUTO,
            parent: '',
            transparent: false,
            antialias: true,
            physicsConfig: null,
            state: {
                 preload: preloadGame,
                 create: createGame,
                 update: updateGame
            }
        };
        this.phaserGame = new Phaser.Game(config);
        this.webSocketConn.onopen = onSocketOpen;
        this.webSocketConn.onclose = onSocketClose;
        this.webSocketConn.onmessage = onSocketMessage;
    },

    /**
     * 傳送"尋找對手"的請求給Server
     * @method DownStairs.Engine#sendMatchingGame
     */
    sendMatchingGame: function () {
        if (this.isMatched === true || this.isMatching === true) {
            //todo: log something about error here.
            return
        }
        var data = this.getEmptyCommonData();
        data.ActionType = DownStairs.MATCHING_ACTION_KEY;
        this.webSocketConn.send(JSON.stringify(data));
    },

    /**
     * 傳送"找到對手"的請求給Server
     * @method DownStairs.Engine#sendMatchedGame
     */
    sendMatchedGame: function () {
        console.log(123);
        if (this.isMatched === true || this.isMatching !== true) {
            //todo: log something about error here.
            return
        }
        console.log(456);
        this.isMatched = true;
        var data = this.getEmptyCommonData();
        data.ActionType = DownStairs.MATCHED_ACTION_KEY;
        this.webSocketConn.send(JSON.stringify(data));
    },

    /**
     * 傳送"開始遊戲"的請求給Server
     * @method DownStairs.Engine#sendStartGame
     */
    sendStartGame: function () {
        console.log("abc");
        if (this.isMatched === true || this.isMatching === true) {
            //todo: log something about error here.
            return
        }
        console.log("def");
        this.isMatched = true;
        this.isMatching = true;
        var data = this.getEmptyCommonData();
        data.ActionType = DownStairs.START_ACTION_KEY;
        this.webSocketConn.send(JSON.stringify(data));
    },


    /**
     * 傳送"同步所有物件"的請求給Server
     * @method DownStairs.Engine#sendRefreshAll
     */
    sendRefreshAll: function () {
        if (this.isMatched !== true || this.isMatching !== true) {
            //todo: log something about error here.
            return
        }

        var data = this.getEmptyCommonData();
        data.ActionType = DownStairs.REFRESH_ALL_ACTION_KEY;
        data.RequestPlayerId = this.mainPlayerId;
        this.webSocketConn.send(JSON.stringify(data));
    },

    /**
     * 傳送"鍵盤操作指令"的請求給Server
     * @method DownStairs.Engine#sendAction
     */
    sendAction: function (actionKey) {
        if (this.isMatched !== true || this.isMatching !== true) {
            //todo: log something about error here.
            return
        }

        var validActionSet = [DownStairs.LEFT_ACTION_KEY, DownStairs.RIGHT_ACTION_KEY,
            DownStairs.JUMP_ACTION_KEY, DownStairs.STOP_ACTION_KEY, DownStairs.ADJUST_ACTION_KEY];

        if (validActionSet.indexOf(actionKey) === -1){
            //todo: log something about error here.
            return
        }

        var data = this.getEmptyCommonData();
        data.ActionType = actionKey;
        data.RequestPlayerId = this.mainPlayerId;
        data.HostId = this.hostId;
        data.HostX = this.playerMap[this.hostId].x;
        data.HostY = this.playerMap[this.hostId].y;
        data.GuestId = this.guestId;
        data.GuestX = this.playerMap[this.guestId].x;
        data.GuestY = this.playerMap[this.guestId].y;
        this.webSocketConn.send(JSON.stringify(data));
    },

    /**
     * 從Server取得"尋找對手"指令的相關資料
     * @method DownStairs.Engine#getMatchingGame
     * @param {object} data - 從Server取得的資料，其資料格式為CommonData
     */
    getMatchingGame: function (data) {
        if (this.isMatching === true) {
            //todo: log something about error here.
            return
        }
        this.isMatching = true;
        this.mainPlayerId = data.HostId;
        this.hostId = data.HostId;
        this.playerMap[data.HostId] = this.newPlayer(data.HostId, data.HostX, data.HostY);
    },

    /**
     * 從Server取得"找到對手"指令的相關資料
     * @method DownStairs.Engine#getMatchedGame
     * @param {object} data - 從Server取得的資料，其資料格式為CommonData
     */
    getMatchedGame: function (data) {
        if (this.isMatched === true || this.isMatching !== true) {
            //todo: log something about error here.
            return
        }
        this.guestId = data.GuestId;
        this.playerMap[data.GuestId] = this.newPlayer(data.GuestId, data.GuestX, data.GuestY);
        this.sendMatchedGame();
    },

    /**
     * 從Server取得"開始遊戲"指令的相關資料
     * @method DownStairs.Engine#getStartGame
     * @param {object} data - 從Server取得的資料，其資料格式為CommonData
     */
    getStartGame: function (data) {
        if (this.isMatched === true || this.isMatching === true) {
            //todo: log something about error here.
            return
        }
        this.mainPlayerId = data.GuestId;
        this.hostId = data.HostId;
        this.guestId = data.GuestId;
        this.playerMap[data.HostId] = this.newPlayer(data.HostId, data.HostX, data.HostY);
        this.playerMap[data.GuestId] = this.newPlayer(data.GuestId, data.GuestX, data.GuestY);
        this.sendStartGame();
    },

    /**
     * 從Server取得"鍵盤操作"指令的相關資料
     * @method DownStairs.Engine#getAction
     * @param {object} data - 從Server取得的資料，其資料格式為CommonData
     */
    getAction: function (data) {
        if (this.isMatched !== true || this.isMatching !== true) {
            //todo: log something about error here.
            return
        }

        var validActionSet = [DownStairs.LEFT_ACTION_KEY, DownStairs.RIGHT_ACTION_KEY,
        DownStairs.JUMP_ACTION_KEY, DownStairs.STOP_ACTION_KEY, DownStairs.ADJUST_ACTION_KEY];

        if (validActionSet.indexOf(data.ActionType) === -1){
            //todo: log something about error here.
            return
        }

        if (this.playerMap[data.RequestPlayerId] == null) {
            //todo: log something about error here.
            return
        }

        if (data.RequestPlayerId !== this.hostId && data.RequestPlayerId !== this.guestId) {
            //todo: log something about error here.
            return
        }

        switch (data.ActionType) {
            case DownStairs.LEFT_ACTION_KEY:
                this.playerMap[data.RequestPlayerId].body.velocity.x = -150;
                this.playerMap[data.RequestPlayerId].animations.play('left');
                break;
            case DownStairs.RIGHT_ACTION_KEY:
                this.playerMap[data.RequestPlayerId].body.velocity.x = 150;
                this.playerMap[data.RequestPlayerId].animations.play('right');
                break;
            case DownStairs.STOP_ACTION_KEY:
                this.playerMap[data.RequestPlayerId].body.velocity.x = 0;
                this.playerMap[data.RequestPlayerId].animations.stop();
                //playerMap[requestId].frame = 4;
                break;
            case DownStairs.JUMP_ACTION_KEY:
                this.playerMap[data.RequestPlayerId].body.velocity.y = -300;
                break;
        }

        if (data.ActionType === DownStairs.ADJUST_ACTION_KEY && data.RequestPlayerId !== this.mainPlayerId) {
            var opX, opY;
            if (data.RequestPlayerId === data.HostId) {
                opX = data.HostX;
                opY = data.HostY;
            } else if (data.RequestPlayerId === data.GuestId) {
                opX = data.GuestX;
                opY = data.GuestY;
            }

            if (Math.abs(this.playerMap[data.RequestPlayerId].x - opX) >= 10 ||
                Math.abs(this.playerMap[data.RequestPlayerId].y - opY) >= 10) {
                this.playerMap[data.RequestPlayerId].x = opX;
                this.playerMap[data.RequestPlayerId].y = opY;
            }
        }
    },

    /**
     * 從Server取得"同步所有物件"指令的相關資料
     * @method DownStairs.Engine#getRefreshAll
     * @param {object} data - 從Server取得的資料，其資料格式為CommonData
     */
    getRefreshAll: function (data) {
        if (this.isMatched !== true || this.isMatching !== true) {
            //todo: log something about error here.
            return
        }
        if (data.ActionType !== "RefreshAll") {
            //todo: log something about error here.
            return
        }
        this.playerMap[this.hostId].x = data.HostX;
        this.playerMap[this.hostId].y = data.HostY;
        this.playerMap[this.guestId].x = data.GuestX;
        this.playerMap[this.guestId].y = data.GuestY;
    },

    /**
     * 取得一個空的CommonData物件
     * @method DownStairs.Engine#getEmptyCommonData
     * @returns {object} 一個有著CommonData格式的空物件
     */
    getEmptyCommonData: function () {
        return {
            "ActionType": "",
            "RequestPlayerId": "",
            "HostId": "",
            "GuestId": "",
            "HostX": 0,
            "GuestX": 0,
            "HostY": 0,
            "GuestY": 0
        };
    },

    /**
     * 在遊戲創建一個新的角色
     * @method DownStairs.Engine#newPlayer
     * @param id {string} 角色的id，格式為uuid v4
     * @param x {float} 角色在x座標的起始位置
     * @param y {float} 角色在y座標的起始位置
     * @returns {Phaser.Sprite} 一個新的角色
     */
    newPlayer: function (id, x, y) {
        var player = this.phaserGame.add.sprite(x, y, 'dude');
        this.phaserGame.physics.arcade.enable(player);
        player.body.gravity.y = 300;
        player.body.collideWorldBounds = true;
        player.animations.add('left', [0, 1, 2, 3], 20, true);
        player.animations.add('right', [5, 6, 7, 8], 20, true);
        return player
    }
};

var engine;
window.onload = function () {
    engine = new DownStairs.Engine();
    startVisibleListener();
    if (window["WebSocket"]) {
        engine.run();
    } else {
        //todo: no support web socket here
    }
};

/**
 * 當web socket連線成功時，所需執行的操作
 * @param event {object} 開啟socket的相關資料
 */
function onSocketOpen(event) {

}

/**
 * 當關閉web socket連線時，所需執行的操作
 * @param event {object} 關閉socket的相關資料
 */
function onSocketClose(event) {
    engine.webSocketConn.send('close');
}

/**
 * 當從web socket接收到資料時，所需執行的操作
 * @param event {object} 從socket接收到的的相關資料
 */
function onSocketMessage(event) {
    var data = JSON.parse(event.data);
    console.log(data.ActionType);
    switch (data.ActionType) {
        case DownStairs.MATCHING_ACTION_KEY:
            engine.getMatchingGame(data);
            break;
        case DownStairs.MATCHED_ACTION_KEY:
            engine.getMatchedGame(data);
            break;
        case DownStairs.START_ACTION_KEY:
            engine.getStartGame(data);
            break;
        case DownStairs.LEFT_ACTION_KEY:
        case DownStairs.RIGHT_ACTION_KEY:
        case DownStairs.JUMP_ACTION_KEY:
        case DownStairs.STOP_ACTION_KEY:
        case DownStairs.ADJUST_ACTION_KEY:
            if (engine.visibleTrigger === false) {
                return
            }
            engine.getAction(data);
            break;
        case DownStairs.REFRESH_ALL_ACTION_KEY:
            engine.getRefreshAll(data);
    }
}

/**
 * 當從遊戲視窗被瀏覽器遮蔽時會執行的操作，(玩家縮小視窗或切換網頁tab時瀏覽器會遮蔽遊戲視窗)
 * @param event {string} 接收到的相關遮蔽指令
 */
function onChangeVisible(event) {
    var isVisible;
    var v = "visible", h = "hidden";
    var evtMap = {focus:v, focusin:v, pageshow:v, blur:h, focusout:h, pagehide:h};

    event = event || window.event;
    if (event.type in evtMap) {
        isVisible = evtMap[event.type];
    }
    else {
        isVisible = this[engine.browserHiddenType] ? "hidden" : "visible";
    }

    if (isVisible === v) {
        engine.visibleTrigger = true;
        engine.sendRefreshAll();
    } else if(isVisible === h) {
        engine.visibleTrigger = false;
        engine.sendAction(DownStairs.ADJUST_ACTION_KEY);
    }
}

/**
 * 啟動一個監聽器，用來監聽遊戲視窗是否被遮蔽
 */
function startVisibleListener() {
    var visibilityChange;
    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
        engine.browserHiddenType = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
        engine.browserHiddenType = "msHidden";
        visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        engine.browserHiddenType = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    } else if (typeof document.mozHidden !== "undefined") {
        engine.browserHiddenType = "mozHidden";
        visibilityChange = "mozvisibilitychange";
    }

    if (typeof document.addEventListener === "undefined" || typeof document[engine.browserHiddenType] === "undefined") {
        //todo: no support Page Visibility API here
    } else {
        // Handle page visibility change
        document.addEventListener(visibilityChange, onChangeVisible, false);
    }
}

/**
 * 遊戲資源載入
 */
function preloadGame() {
    engine.phaserGame.load.image('sky', 'assets/img/sky.png');
    engine.phaserGame.load.image('ground', 'assets/img/platform.png');
    engine.phaserGame.load.image('star', 'assets/img/star.png');
    engine.phaserGame.load.spritesheet('dude', 'assets/img/dude.png', 32, 48);
}

/**
 * 遊戲物件與場景創建
 */
function createGame() {
    engine.phaserGame.stage.disableVisibilityChange = true;
    engine.phaserGame.onBlur.add(blurGame);
    engine.phaserGame.onFocus.add(focusGame);
    engine.phaserGame.physics.startSystem(Phaser.Physics.ARCADE);
    engine.phaserGame.add.sprite(0, 0, "sky");
    engine.platforms = engine.phaserGame.add.group();
    engine.platforms.enableBody = true;
    var ground = engine.platforms.create(0, engine.phaserGame.world.height - 64, 'ground');
    ground.scale.setTo(2, 2);
    ground.body.immovable = true;
    var ledge = engine.platforms.create(400, 400, 'ground');
    ledge.body.immovable = true;
    ledge = engine.platforms.create(-150, 250, 'ground');
    ledge.body.immovable = true;
    engine.cursors = engine.phaserGame.input.keyboard.createCursorKeys();
    engine.sendMatchingGame();
}

/**
 * 主要遊戲迴圈
 */
function updateGame() {
    var hostCollide = engine.phaserGame.physics.arcade.collide(engine.playerMap[engine.hostId], engine.platforms);
    var guestCollide = engine.phaserGame.physics.arcade.collide(engine.playerMap[engine.guestId], engine.platforms);
    if (engine.visibleTrigger === false) {
        return
    }
    engine.adjustTimer++;
    if (engine.isMatched !== true || engine.isMatching !== true) {
        return
    }
    if (engine.mainPlayerId == null || engine.playerMap[engine.mainPlayerId] == null) {
        //todo: log something about error here.
        return
    }
    var hitPlatform;
    if (engine.hostId === engine.mainPlayerId) {
        hitPlatform = hostCollide;
    } else if (engine.guestId === engine.mainPlayerId) {
        hitPlatform = guestCollide;
    }
    var hasSendAction = false;
    if (engine.cursors.left.isDown) {
        if (engine.previousActionKey !== DownStairs.LEFT_ACTION_KEY) {
            engine.previousActionKey = DownStairs.LEFT_ACTION_KEY;
            hasSendAction = true;
            engine.sendAction(DownStairs.LEFT_ACTION_KEY);
        }
    }
    else if (engine.cursors.right.isDown) {
        if (engine.previousActionKey !== DownStairs.RIGHT_ACTION_KEY) {
            engine.previousActionKey = DownStairs.RIGHT_ACTION_KEY;
            hasSendAction = true;
            engine.sendAction(DownStairs.RIGHT_ACTION_KEY);
        }
    } else {
        if (engine.previousActionKey !== DownStairs.STOP_ACTION_KEY) {
            engine.previousActionKey = DownStairs.STOP_ACTION_KEY;
            hasSendAction = true;
            engine.sendAction(DownStairs.STOP_ACTION_KEY);
        }
    }
    if (engine.cursors.up.isDown && engine.playerMap[engine.mainPlayerId].body.touching.down && hitPlatform)
    {
        if (engine.previousActionKey !== DownStairs.JUMP_ACTION_KEY) {
            engine.previousActionKey = DownStairs.JUMP_ACTION_KEY;
            hasSendAction = true;
            engine.sendAction(DownStairs.JUMP_ACTION_KEY);
        }
    }
    if (hasSendAction === false && engine.adjustTimer >= DownStairs.ADJUST_PERIOD) {
        engine.adjustTimer = 0;
        engine.sendAction(DownStairs.ADJUST_ACTION_KEY);
    }
}

/**
 * 當遊戲視窗沒有被瀏覽器聚焦時(EX:滑鼠點擊其他應用程式)
 */
function blurGame() {
    engine.phaserGame.input.keyboard.reset(true);
}

/**
 * 當遊戲視窗被瀏覽器聚焦時(EX:滑鼠點回遊戲視窗)
 */
function focusGame() {
    engine.phaserGame.input.keyboard.reset(true);
}
