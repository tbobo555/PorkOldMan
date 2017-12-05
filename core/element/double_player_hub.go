package element

import (
    "porkoldman/core/interface"
    "github.com/satori/go.uuid"
    "porkoldman/core"
    "errors"
    "text/template"
)

// DoublePlayerHub類別，代表雙人對戰使用的hub
// 此hub只能容納兩個玩家的連線，分別命名為host與guest
type DoublePlayerHub struct {
    hubId uuid.UUID
    mainEngine _interface.Engine
    connections map[string] _interface.Connection
    Host _interface.Connection
    Guest _interface.Connection
}

// 創建一個新的DoublePlayerHub物件
func NewDoublePlayerHub(mainEngine _interface.Engine) *DoublePlayerHub{
    return &DoublePlayerHub{
        hubId: uuid.NewV4(),
        mainEngine: mainEngine,
        connections: make(map[string] _interface.Connection),
        Host: nil,
        Guest: nil,
    }
}

// 取得hub的編號，該編號以uuid v4編成
func (h *DoublePlayerHub) GetHubId() uuid.UUID{
    return h.hubId
}

// 取得存於hub中的指定連線
func (h *DoublePlayerHub) GetConnection(s string) (_interface.Connection, error){
    if _, ok := h.connections[s]; ok {
        return h.connections[s], nil
    } else {
        return nil, errors.New("no connection with key: " + template.HTMLEscapeString(s))
    }
    return h.connections[s], nil
}

// 取得所有在此hub中的連線
func (h *DoublePlayerHub) GetAllConnections() map[string] _interface.Connection{
    return h.connections
}

// 新增一組連線
func (h *DoublePlayerHub) AddConnection (conn _interface.Connection) error {
    if _, ok := h.connections[conn.GetConnectionId().String()]; ok {
        return errors.New("already set connection with id : " + template.HTMLEscapeString(conn.GetConnectionId().String()))
    }
    h.connections[conn.GetConnectionId().String()] = conn
    return nil
}

// 移除一組連線
func (h *DoublePlayerHub) RemoveConnection (conn _interface.Connection) {
    delete(h.connections, conn.GetConnectionId().String())
}

// 判斷是否hub中的連線全都斷線了
func (h *DoublePlayerHub) IsAllConnectionsDisconnect() bool {
    isEmptyHub := true
    for key, conn := range h.connections {
        if conn == nil {
            delete(h.connections, key)
            continue
        }
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
func (h *DoublePlayerHub) Broadcast(data interface{}) error{
    if data == nil {
        return errors.New("broadcast with nil data")
    }
    switch commonData := data.(type) {
    case *core.CommonData:
        switch commonData.ActionType {
        case core.MatchingActionKey:
            err := h.broadcastToRequester(commonData)
            if err != nil {
                return err
            }
        case core.MatchedActionKey:
            err := h.broadcastToHost(commonData)
            if err != nil {
                return err
            }
        case core.StartActionKey:
            err := h.broadcastToGuest(commonData)
            if err != nil {
                return err
            }
        case core.LeftActionKey:
            fallthrough
        case core.RightActionKey:
            fallthrough
        case core.JumpActionKey:
            fallthrough
        case core.StopActionKey:
            fallthrough
        case core.AdjustActionKey:
            err := h.broadcastToAll(commonData)
            if err != nil {
                return err
            }
        case core.RefreshAllActionKey:
            err := h.broadcastToRequester(commonData)
            if err != nil {
                return err
            }
        }
        return nil
    }
    return errors.New("input data is not a type of CommonData")
}

// 將資料發佈至發送請求的使用者
func (h *DoublePlayerHub) broadcastToRequester(commonData *core.CommonData) (err error) {
    if commonData == nil {
        return errors.New("broadcast with nil data")
    }
    if h.Host == nil && h.Guest == nil {
        return errors.New("broadcast on empty hub")
    }
    data, err := core.EncodeCommonDada(commonData)
    if err != nil {
        return err
    }
    // 若發生panic錯誤，將錯誤回傳
    defer func() {
        if r := recover(); r != nil {
            switch x := r.(type) {
            case string:
                err = errors.New(x)
            case error:
                err = x
            default:
                err = errors.New("unknown panic when broadcast to write channel")
            }
        }
    }()
    if h.Host != nil && commonData.RequestPlayerId == h.Host.GetConnectionId().String() {
        if h.Host.GetIsConnection() == true && h.Host.GetIsPageVisible() == true {
            h.Host.GetWriteChannel() <- data
        }
        return nil
    }
    if h.Guest != nil && commonData.RequestPlayerId == h.Guest.GetConnectionId().String() {
        if h.Guest.GetIsConnection() == true && h.Guest.GetIsPageVisible() == true {
            h.Guest.GetWriteChannel() <- data
        }
        return nil
    }
    return errors.New("request id can't match host and guest")
}

// 將資料發佈至host
func (h *DoublePlayerHub) broadcastToHost(commonData *core.CommonData) (err error) {
    if commonData == nil {
        return errors.New("broadcast with nil data")
    }
    if h.Host == nil {
        return errors.New("broadcast to a nil connection")
    }
    data, err := core.EncodeCommonDada(commonData)
    if err != nil {
        return err
    }
    // 若發生panic錯誤，將錯誤回傳
    defer func() {
        if r := recover(); r != nil {
            switch x := r.(type) {
            case string:
                err = errors.New(x)
            case error:
                err = x
            default:
                err = errors.New("unknown panic when broadcast to write channel")
            }
        }
    }()
    if h.Host.GetIsConnection() == true && h.Host.GetIsPageVisible() == true {
        h.Host.GetWriteChannel() <- data
    }
    return nil
}

// 將資料發佈至guest
func (h *DoublePlayerHub) broadcastToGuest(commonData *core.CommonData) (err error) {
    if commonData == nil {
        return errors.New("broadcast with nil data")
    }
    if h.Guest == nil {
        return errors.New("broadcast to a nil connection")
    }
    data, err := core.EncodeCommonDada(commonData)
    if err != nil {
        return err
    }
    // 若發生panic錯誤，將錯誤回傳
    defer func() {
        if r := recover(); r != nil {
            switch x := r.(type) {
            case string:
                err = errors.New(x)
            case error:
                err = x
            default:
                err = errors.New("unknown panic when broadcast to write channel")
            }
        }
    }()
    if h.Guest != nil && h.Guest.GetIsConnection() == true && h.Guest.GetIsPageVisible() == true {
        h.Guest.GetWriteChannel() <- data
    }
    return nil
}

// 將資料發佈至所有連線中的使用者
func (h *DoublePlayerHub) broadcastToAll(commonData *core.CommonData) (err error) {
    if commonData == nil {
        return errors.New("broadcast with nil data")
    }
    if h.Host == nil && h.Guest == nil {
        return errors.New("broadcast on empty hub")
    }
    data, err := core.EncodeCommonDada(commonData)
    if err != nil {
        return err
    }
    // 若發生panic錯誤，將錯誤回傳
    defer func() {
        if r := recover(); r != nil {
            switch x := r.(type) {
            case string:
                err = errors.New(x)
            case error:
                err = x
            default:
                err = errors.New("unknown panic when broadcast to write channel")
            }
        }
    }()
    if h.Host != nil && h.Host.GetIsConnection() == true && h.Host.GetIsPageVisible() == true {
        h.Host.GetWriteChannel() <- data
    }
    if h.Guest != nil && h.Guest.GetIsConnection() == true && h.Guest.GetIsPageVisible() == true {
        h.Guest.GetWriteChannel() <- data
    }
    return nil
}
