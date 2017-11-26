package element

import (
    "porkoldman/core/interface"
    "github.com/satori/go.uuid"
    "porkoldman/core"
)

type DoublePlayerHub struct {
    hubId uuid.UUID
    mainEngine _interface.Engine
    connections map[string] _interface.Connection
    Host _interface.Connection
    Guest _interface.Connection
    BroadcastChannel chan *core.CommonData
    CloseChannel chan []byte
}

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

func (h *DoublePlayerHub) GetHubId() uuid.UUID{
    return h.hubId
}

func (h *DoublePlayerHub) GetConnection(s string) _interface.Connection{
    return h.connections[s]
}

func (h *DoublePlayerHub) GetAllConnections() map[string] _interface.Connection{
    return h.connections
}

func (h *DoublePlayerHub) IsAllConnectionsDisconnect() bool {
    isEmptyHub := true
    for _, conn := range h.connections {
        if conn.GetIsConnection() == true {
            isEmptyHub = false
            break
        }
    }
    return isEmptyHub
}

func (h *DoublePlayerHub) Broadcast(data interface{}) {
    switch commonData := data.(type) {
    case *core.CommonData:
        h.BroadcastChannel <- commonData
    }
}

func (h *DoublePlayerHub) Close() {
    h.CloseChannel <- []byte("exit")
}

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

func (h *DoublePlayerHub) broadcastToHost(commonData *core.CommonData) {
    if h.Host != nil && h.Host.GetIsConnection() == true && h.Host.GetIsPageVisible() == true {
        h.Host.GetWriteChannel() <- core.EncodeCommonDada(commonData)
    }
}

func (h *DoublePlayerHub) broadcastToGuest(commonData *core.CommonData) {
    if h.Guest != nil && h.Guest.GetIsConnection() == true && h.Guest.GetIsPageVisible() == true {
        h.Guest.GetWriteChannel() <- core.EncodeCommonDada(commonData)
    }
}

func (h *DoublePlayerHub) broadcastToAll(commonData *core.CommonData) {
    if h.Host != nil && h.Host.GetIsConnection() == true && h.Host.GetIsPageVisible() == true {
        h.Host.GetWriteChannel()<-core.EncodeCommonDada(commonData)
    }
    if h.Guest != nil && h.Guest.GetIsConnection() == true && h.Guest.GetIsPageVisible() == true {
        h.Guest.GetWriteChannel()<-core.EncodeCommonDada(commonData)
    }
}
