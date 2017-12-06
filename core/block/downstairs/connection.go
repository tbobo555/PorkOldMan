package downstairs

import (
    "github.com/gorilla/websocket"
    "github.com/satori/go.uuid"
    "time"
    "porkoldman/core/element"
    "porkoldman/core/interface"
    "porkoldman/core"
    "encoding/json"
    "net/http"
    "porkoldman/core/log"
    "fmt"
)

// 類別downstairs.Connection，當玩家連線到遊戲downstairs時，
// 會為該玩家創建一個此類別的物件，用來儲存與操作該玩家的所有資料與行為
type Connection struct {
    // 與客戶端溝通的socket連線物件
    socketConnect *websocket.Conn

    // 使用者發送的http請求
    request *http.Request

    // 玩家連線時所註冊的hub，同一hub的玩家可互相傳遞/接收訊息
    hub *element.DoublePlayerHub

    // 用來將資料寫出的通道
    writeChannel chan []byte

    // 偵測玩家是否有隱藏/縮小遊戲視窗的偵測器
    visibleDetector *element.VisibleDetector

    // 本次連線玩家的獨立id，用uuid v4編成
    mainPlayerId uuid.UUID

    // 玩家是否已開始搜尋對手
    isMatching bool

    // 玩家是否已搜尋到對手
    isMatched bool

    // 玩家試連線中還是已經斷線
    isConnection bool

    // 遊戲人物在客戶端的X座標
    X float32

    // 遊戲人物在客戶端的Y座標
    Y float32
}

// 建立一新的downstairs遊戲連線物件，用來管理與儲存使用者在該連線中的資訊與行為
func NewConnection(conn *websocket.Conn, request *http.Request) *Connection{
    return &Connection{
        socketConnect: conn,
        request: request,
        hub: nil,
        writeChannel: make(chan []byte),
        visibleDetector: element.NewVisibleDetector(core.DownStairsMaxReaderWaitingPeriod),
        mainPlayerId: uuid.NewV4(),
        isMatching: false,
        isMatched: false,
        isConnection: true,
        X: 0,
        Y: 202,
    }
}

// 回傳此使用者是連線中或是已斷線，連線回傳true，斷線回傳false
func (c *Connection) GetIsConnection() bool {
    return c.isConnection
}

// 回傳本連線的使用者是否已配置hub，已配置回傳true，反之false
func (c *Connection) IsAllocated() bool {
    if c.hub == nil {
        return false
    }
    return true
}

// 本連線的使用者是否有隱藏或縮小遊戲視窗
func (c *Connection) GetIsPageVisible() bool {
    if c.visibleDetector == nil {
        return false
    }
    return c.visibleDetector.IsVisible
}

// 取得代表本次連線的id，用uuid v4編成
func (c *Connection) GetConnectionId() uuid.UUID {
    return c.mainPlayerId
}

// 取得傳送資料到客戶端的channel
func (c *Connection) GetWriteChannel() chan []byte {
    return c.writeChannel
}

// 取得本次連線所分配到的hub
func (c *Connection) GetHub() _interface.Hub {
    return c.hub
}

// 設置本次連線的hub
func (c *Connection) SetHub(hub _interface.Hub)  {
    doublePlayerHub, err := MainDownstairsEngine.convertHub(hub)
    if err != nil {
        c.WriteError(core.AppErrorExceptionStatus, err.Error())
        return
    }
    c.hub = doublePlayerHub
}

// 監聽從客戶端傳送來的資料，接收的資料格式只能是CommonData(詳見core/data_structure.go)
func (c *Connection) ListenRead() {
    defer func() {
        c.Close()
    }()
    conn := c.socketConnect
    conn.SetReadLimit(core.DownStairsMaxMessageSize)
    conn.SetReadDeadline(time.Now().Add(core.DownStairsPongWait))
    conn.SetPongHandler(func(string) error {
        conn.SetReadDeadline(time.Now().Add(core.DownStairsPongWait))
        return nil
    })
    for {
        c.visibleDetector.Reset()
        _, socketJsonData, err := conn.ReadMessage()
        // todo: 驗證socketJsonData
        if err != nil {
            if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
                fmt.Println(1)
                c.WriteError(core.AppErrorExceptionStatus, err.Error())
            } else {
                //fmt.Println(2)
                //c.WriteError(core.AppErrorInfoStatus, err.Error())
            }
            break
        }
        commonData := &core.CommonData{}
        err = json.Unmarshal(socketJsonData, commonData)
        if err != nil {
            fmt.Println(3)
            c.WriteError(core.AppErrorExceptionStatus, err.Error())
            break
        }
        switch commonData.ActionType {
        case core.MatchingActionKey:
            c.onMatching()
        case core.MatchedActionKey:
            c.onMatched()
        case core.StartActionKey:
            c.onStart()
        case core.LeftActionKey:
            fallthrough
        case core.RightActionKey:
            fallthrough
        case core.JumpActionKey:
            fallthrough
        case core.StopActionKey:
            fallthrough
        case core.AdjustActionKey:
            c.onAction(commonData)
        case core.RefreshAllActionKey:
            c.onRefreshAll(commonData)
        }
    }
}

// 監聽是否有資料要傳送至客戶端
func (c *Connection) ListenWrite() {
    ticker := time.NewTicker(core.DownStairsPingPeriod)
    defer func() {
        ticker.Stop()
        c.Close()
    }()
    conn := c.socketConnect
    for {
        select {
        case writeData, ok := <- c.writeChannel:
            conn.SetWriteDeadline(time.Now().Add(core.DownStairsWriteWait))
            // 若 writeChannel 已被關閉，ok 會是 false
            if !ok {
                conn.WriteMessage(websocket.CloseMessage, []byte{})
                fmt.Println(4)
                c.WriteError(core.AppErrorInfoStatus, "send close web socket connect")
                return
            }
            writer, err := conn.NextWriter(websocket.TextMessage)
            if err != nil {
                fmt.Println(5)
                c.WriteError(core.AppErrorExceptionStatus, err.Error())
                return
            }
            writer.Write(writeData)
            if err := writer.Close(); err != nil {
                fmt.Println(6)
                c.WriteError(core.AppErrorExceptionStatus, err.Error())
                return
            }
        // 固定時間發 ping 來偵測連線是否已關閉，若關閉則結束此for迴圈
        case <-ticker.C:
            conn.SetWriteDeadline(time.Now().Add(core.DownStairsWriteWait))
            if err := conn.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
                //fmt.Println(7)
                //c.WriteError(core.AppErrorInfoStatus, err.Error())
                return
            }
        }
    }
}

// 與使用者關閉連線
func (c *Connection) Close() {
    //close(c.writeChannel)
    c.socketConnect.Close()
    c.isConnection = false
    if c.visibleDetector.IsRunning == true {
        c.visibleDetector.Stop()
    }
    if c.hub.IsAllConnectionsDisconnect() == true {
        MainDownstairsEngine.RemoveHub(c.hub)
    }
    MainDownstairsEngine.RemoveConnection(c)
}

// 當Server接收到客戶端傳來的Matching(尋找對手)的指令，會為該玩家配置一個hub
func (c *Connection) onMatching() {
    if c.isMatching == true || c.isMatched == true {
        fmt.Println(8)
        c.WriteError(core.AppErrorInfoStatus, "get repeat matching")
        return
    }
    if c.IsAllocated() == true {
        fmt.Println(9)
        c.WriteError(core.AppErrorExceptionStatus, "conn is allocated, with no matching")
        return
    }
    err := MainDownstairsEngine.AllocateToHub(c)
    if err != nil {
        fmt.Println(10)
        c.WriteError(core.AppErrorExceptionStatus, err.Error())
        return
    }
    c.isMatching = true
}

// 當Server接收到客戶端傳來的Matched(找到對手)的指令，會記錄此資訊，並開始偵測玩家是否有縮小/隱藏遊戲
func (c *Connection) onMatched() {
    if c.isMatched == true{
        fmt.Println(11)
        c.WriteError(core.AppErrorInfoStatus, "get repeat matched")
        return
    }
    if c.isMatching != true {
        fmt.Println(12)
        c.WriteError(core.AppErrorExceptionStatus, "get matched when no matching")
        return
    }
    if c.IsAllocated() != true {
        fmt.Println(13)
        c.WriteError(core.AppErrorExceptionStatus, "get matched when no allocate")
        return
    }
    c.isMatched = true
    go c.visibleDetector.Run()
}

// 當Server接收到客戶端傳來的Start(開始對戰)的指令，會記錄此資訊，並開始偵測玩家是否有縮小/隱藏遊戲
func (c *Connection) onStart() {
    if c.isMatching != true {
        fmt.Println(14)
        c.WriteError(core.AppErrorExceptionStatus, "get start when no matching")
        return
    }
    if c.isMatched == true {
        fmt.Println(15)
        c.WriteError(core.AppErrorExceptionStatus, "get start when already matched")
        return
    }
    c.isMatched = true
    go c.visibleDetector.Run()
}

// 當接收到客戶端傳來的所有操作(up, down, jump, stop)以及同步更新(adjust)的指令
// 會依據指令在server記錄遊戲資訊，並傳送相關資料回客戶端，以確保所有玩家的遊戲畫面同步
func (c *Connection) onAction(commonData *core.CommonData) {
    if c.isMatching != true || c.isMatched != true || c.IsAllocated() != true {
        fmt.Println(16)
        c.WriteError(core.AppErrorExceptionStatus, "get action when game not start")
        return
    }
    c.visibleDetector.Reset()
    if commonData.RequestPlayerId == commonData.HostId {
        c.X = commonData.HostX
        c.Y = commonData.HostY
        guest, err := MainDownstairsEngine.convertConnection(c.hub.Guest)
        if err != nil {
            fmt.Println(17)
            c.WriteError(core.AppErrorExceptionStatus, err.Error())
            return
        }
        if guest.visibleDetector.IsVisible == false {
            guest.X = commonData.GuestX
            guest.Y = commonData.GuestY
        }
        err = c.hub.Broadcast(commonData)
        if err != nil {
            fmt.Println(17.1)
            c.WriteError(core.AppErrorExceptionStatus, err.Error())
            return
        }
    } else if commonData.RequestPlayerId == commonData.GuestId {
        c.X = commonData.GuestX
        c.Y = commonData.GuestY
        host, err := MainDownstairsEngine.convertConnection(c.hub.Host)
        if err != nil {
            fmt.Println(18)
            c.WriteError(core.AppErrorExceptionStatus, err.Error())
            return
        }
        if host.visibleDetector.IsVisible == false {
            host.X = commonData.HostX
            host.Y = commonData.HostY
        }
        err = c.hub.Broadcast(commonData)
        if err != nil {
            fmt.Println(18.1)
            c.WriteError(core.AppErrorExceptionStatus, err.Error())
            return
        }
    } else {
        fmt.Println(19)
        c.WriteError(core.AppErrorInfoStatus, "get undefined request player id ")
    }
}

// 當接收到onRefreshAll指令時，server會強制將發送此請求的玩家的遊戲畫面與server同步
func (c *Connection) onRefreshAll(commonData *core.CommonData) {
    if c.isMatching != true || c.isMatched != true || c.IsAllocated() != true {
        fmt.Println(20)
        c.WriteError(core.AppErrorExceptionStatus, "get refresh all action, when game not start")
        return
    }

    c.visibleDetector.Reset()

    hub, err := MainDownstairsEngine.convertHub(c.hub)
    if err != nil {
        fmt.Println(21)
        c.WriteError(core.AppErrorExceptionStatus, err.Error())
        return
    }

    host, err := MainDownstairsEngine.convertConnection(hub.Host)
    if err != nil {
        fmt.Println(22)
        c.WriteError(core.AppErrorExceptionStatus, err.Error())
        return
    }

    guest, err := MainDownstairsEngine.convertConnection(hub.Guest)
    if err != nil {
        fmt.Println(23)
        c.WriteError(core.AppErrorExceptionStatus, err.Error())
        return
    }

    refreshData := &core.CommonData {
        ActionType: core.RefreshAllActionKey,
        RequestPlayerId: commonData.RequestPlayerId,
        HostId: hub.Host.GetConnectionId().String(),
        GuestId: hub.Guest.GetConnectionId().String(),
        HostX: host.X,
        HostY: host.Y,
        GuestX: guest.X,
        GuestY: guest.Y,
    }
    err = c.hub.Broadcast(refreshData)
    if err != nil {
        fmt.Println(23)
        c.WriteError(core.AppErrorExceptionStatus, err.Error())
    }
}

// 寫log紀錄
func (c *Connection) WriteError(status, err string) {
    switch status {
    case core.AppErrorDebugStatus:
        go log.AppDebug(err, c.request)
    case core.AppErrorInfoStatus:
        go log.AppInfo(err, c.request)
    case core.AppErrorExceptionStatus:
        go log.AppException(err, c.request)
    case core.AppErrorAlertStatus:
        go log.AppAlert(err, c.request)
    }
}
