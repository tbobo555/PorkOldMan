package element

import (
    "porkoldman/core/interface"
    "github.com/satori/go.uuid"
    "porkoldman/core"
)

// DoublePlayerHub類別，代表雙人對戰使用的hub
// 此hub只能容納兩個玩家的連線，分別命名為host與guest
type DoublePlayerHub struct {
    hubId uuid.UUID
    mainEngine _interface.Engine
    connections map[string] _interface.Connection
    Host _interface.Connection
    Guest _interface.Connection
    BroadcastChannel chan *core.CommonData
    CloseChannel chan []byte
}

// 創建一個新的DoublePlayerHub物件
func NewDoublePlayerHub(mainEngine _interface.Engine) *DoublePlayerHub{
    return &DoublePlayerHub{
        hubId: uuid.NewV4(),
        mainEngine: mainEngine,
        connections: make(map[string] _interface.Connection),
        Host: nil,
        Guest: nil,
        BroadcastChannel: make(chan *core.CommonData),
        CloseChannel: make(chan []byte),
    }
}

// 將DoublePlayerHub的服務啟動，會開始監聽並接收發佈資料
// 接著將資料發佈給需要資料的使用者
func (h *DoublePlayerHub) Run() {
    defer func() {
        h.mainEngine.RemoveHub(h)
    }()
    for {
        select {
        case data := <-h.BroadcastChannel :
            switch data.ActionType {
            case core.MatchedActionKey:
                h.broadcastToHost(data)
            case core.MatchingActionKey:
                h.broadcastToRequester(data)
            case core.StartActionKey:
                h.broadcastToGuest(data)
            case core.LeftActionKey:
                fallthrough
            case core.RightActionKey:
                fallthrough
            case core.JumpActionKey:
                fallthrough
            case core.StopActionKey:
                fallthrough
            case core.AdjustActionKey:
                h.broadcastToAll(data)
            case core.RefreshAllActionKey:
                h.broadcastToRequester(data)
            }
        case <-h.CloseChannel :
            return
        }
    }
}

// 取得hub的編號，該編號以uuid v4編成
func (h *DoublePlayerHub) GetHubId() uuid.UUID{
    return h.hubId
}

// 取得存於hub中的指定連線
func (h *DoublePlayerHub) GetConnection(s string) _interface.Connection{
    return h.connections[s]
}

// 取得所有在此hub中的連線
func (h *DoublePlayerHub) GetAllConnections() map[string] _interface.Connection{
    return h.connections
}

// 判斷是否hub中的連線全都斷線了
func (h *DoublePlayerHub) IsAllConnectionsDisconnect() bool {
    isEmptyHub := true
    for _, conn := range h.connections {
        if conn.GetIsConnection() == true {
            isEmptyHub = false
            break
        }
    }
    if h.Host != nil && h.Host.GetIsConnection() == true {
        isEmptyHub = false
    }
    if h.Guest != nil && h.Guest.GetIsConnection() == true {
        isEmptyHub = false
    }
    return isEmptyHub
}

// 提供外部物件通知此hub要發佈資訊的method
func (h *DoublePlayerHub) Broadcast(data interface{}) {
    switch commonData := data.(type) {
    case *core.CommonData:
        h.BroadcastChannel <- commonData
    }
}

// 將hub關閉
func (h *DoublePlayerHub) Close() {
    h.CloseChannel <- []byte("exit")
}

// 將資料發佈至發送請求的使用者
func (h *DoublePlayerHub) broadcastToRequester(commonData *core.CommonData) {
    if h.Host != nil && commonData.RequestPlayerId == h.Host.GetConnectionId().String() {
        if h.Host.GetIsConnection() == true && h.Host.GetIsPageVisible() == true {
            h.Host.GetWriteChannel() <- core.EncodeCommonDada(commonData)
        }
    }
    if h.Guest != nil && commonData.RequestPlayerId == h.Guest.GetConnectionId().String() {
        if h.Guest.GetIsConnection() == true && h.Guest.GetIsPageVisible() == true {
            h.Guest.GetWriteChannel() <- core.EncodeCommonDada(commonData)
        }
    }
}

// 將資料發佈至host
func (h *DoublePlayerHub) broadcastToHost(commonData *core.CommonData) {
    if h.Host != nil && h.Host.GetIsConnection() == true && h.Host.GetIsPageVisible() == true {
        h.Host.GetWriteChannel() <- core.EncodeCommonDada(commonData)
    }
}

// 將資料發佈至guest
func (h *DoublePlayerHub) broadcastToGuest(commonData *core.CommonData) {
    if h.Guest != nil && h.Guest.GetIsConnection() == true && h.Guest.GetIsPageVisible() == true {
        h.Guest.GetWriteChannel() <- core.EncodeCommonDada(commonData)
    }
}

// 將資料發佈至所有連線中的使用者
func (h *DoublePlayerHub) broadcastToAll(commonData *core.CommonData) {
    if h.Host != nil && h.Host.GetIsConnection() == true && h.Host.GetIsPageVisible() == true {
        h.Host.GetWriteChannel()<-core.EncodeCommonDada(commonData)
    }
    if h.Guest != nil && h.Guest.GetIsConnection() == true && h.Guest.GetIsPageVisible() == true {
        h.Guest.GetWriteChannel()<-core.EncodeCommonDada(commonData)
    }
}
