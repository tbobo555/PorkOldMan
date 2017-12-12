package core

import "time"

const (
    AppErrorDebugStatus = "debug"
    AppErrorInfoStatus = "info"
    AppErrorExceptionStatus = "exception"
    AppErrorAlertStatus = "alert"
)

const (
    MatchingActionKey = "Matching"
    MatchedActionKey = "Matched"
    StartActionKey = "Start"
    JumpActionKey = "Jump"
    LeftActionKey = "Left"
    RightActionKey = "Right"
    StopActionKey = "Stop"
    AdjustActionKey = "Adjust"
    RefreshAllActionKey = "RefreshAll"
)

const (
    SessionIdCookieName = "dll"
)

const (
    JsonTokenType = "json"
    TextTokenType = "text"
)

const (
    DefaultPadding = "="
)

const (
    // 寫入channel的預設等待時間
    DefaultChannelSendWait = 3 * time.Second
)

const (
    // 將資料傳送至客戶端的最大等待時間
    DownStairsWriteWait = 10 * time.Second

    // 從客戶端接收ping的最大等候時間
    DownStairsPongWait = 60 * time.Second

    // 固定傳送ping資料給客戶端的時間間隔
    DownStairsPingPeriod = (DownStairsPongWait * 9) / 10

    // 接收/傳送資料的最大容量
    DownStairsMaxMessageSize = 512

    // 從客戶端接收操作行為及畫面資料的最大等候時間
    // 若超過此時間Server都沒有接收到資料代表玩家隱藏或縮小遊戲畫面或是網路狀態不穩
    DownStairsMaxReaderWaitingPeriod = 1.5
)

type CommonData struct {
    ActionType string
    RequestPlayerId string
    HostId string
    GuestId string
    HostX float32
    GuestX float32
    HostY float32
    GuestY float32
}

type IdData struct {
    Id string
}

type CommonHashData struct {
    Content string
    Key string
}
