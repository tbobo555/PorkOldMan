package downstairs

import (
    "github.com/gorilla/websocket"
    "github.com/satori/go.uuid"
    "time"
    "porkoldman/core/element"
    "porkoldman/core/interface"
    "porkoldman/core"
    "encoding/json"
)

const (
    // Time allowed to write a message to the peer.
    writeWait = 10 * time.Second

    // Time allowed to read the next pong message from the peer.
    pongWait = 60 * time.Second

    // Send pings to peer with this period. Must be less than pongWait.
    pingPeriod = (pongWait * 9) / 10

    // Maximum message size allowed from peer.
    maxMessageSize = 512

    // Maximum waiting time(second) for read message from frontend.
    maxReaderWaitingPeriod = 1.5
)

type Connection struct {
    socketConnect *websocket.Conn
    hub *element.DoublePlayerHub
    writeChannel chan []byte
    visibleDetector *element.VisibleDetector
    mainPlayerId uuid.UUID
    isAllocated bool
    isMatching bool
    isMatched bool
    isConnection bool
    X float32
    Y float32
}

func NewConnection(conn *websocket.Conn) *Connection{
    return &Connection{
        socketConnect: conn,
        hub: nil,
        writeChannel: make(chan []byte),
        visibleDetector: element.NewVisibleDetector(maxReaderWaitingPeriod),
        mainPlayerId: uuid.NewV4(),
        isMatching: false,
        isMatched: false,
        isConnection: true,
        X: 0,
        Y: 202,
    }
}

func (c *Connection) GetIsConnection() bool {
    return c.isConnection
}

func (c *Connection) IsAllocated() bool {
    if c.hub == nil {
        return false
    }
    return true
}

func (c *Connection) GetIsPageVisible() bool {
    return c.visibleDetector.IsVisible
}

func (c *Connection) GetConnectionId() uuid.UUID {
    return c.mainPlayerId
}

func (c *Connection) GetWriteChannel() chan []byte {
    return c.writeChannel
}

func (c *Connection) GetHub() _interface.Hub {
    return c.hub
}

func (c *Connection) SetHub(hub _interface.Hub)  {
    doublePlayerHub, err := MainDownstairsEngine.convertHub(hub)
    if err != nil {
        //todo: error here
    }
    c.hub = doublePlayerHub
}

func (c *Connection) ListenRead() {
    defer func() {
        c.writeChannel <- []byte("Close Writer")
        c.socketConnect.Close()
        c.isConnection = false
        if c.visibleDetector.IsRunning == true {
            c.visibleDetector.Stop()
        }
        if c.hub.IsAllConnectionsDisconnect() == true {
            c.hub.Close()
        }
        MainDownstairsEngine.RemoveConnection(c)
    }()
    conn := c.socketConnect
    conn.SetReadLimit(maxMessageSize)
    conn.SetReadDeadline(time.Now().Add(pongWait))
    conn.SetPongHandler(func(string) error { conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
    for {
        c.visibleDetector.Reset()
        _, socketJsonData, err := conn.ReadMessage()
        if err != nil {
            if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
                //todo: error here
            }
            break
        }
        commonData := &core.CommonData{}
        json.Unmarshal(socketJsonData, commonData)
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

func (c *Connection) ListenWrite() {
    ticker := time.NewTicker(pingPeriod)
    defer func() {
        ticker.Stop()
        c.socketConnect.Close()
    }()
    conn := c.socketConnect
    for {
        select {
        case jsonData, ok := <- c.writeChannel:
            if string(jsonData) == "Close Writer" {
                return
            }
            conn.SetWriteDeadline(time.Now().Add(writeWait))
            if !ok {
                //todo: error here
                conn.WriteMessage(websocket.CloseMessage, []byte{})
                return
            }
            writer, err := conn.NextWriter(websocket.TextMessage)
            if err != nil {
                //todo: error here
                return
            }
            writer.Write(jsonData)
            if err := writer.Close(); err != nil {
                //todo: error here
                return
            }
        case <-ticker.C:
            conn.SetWriteDeadline(time.Now().Add(writeWait))
            if err := conn.WriteMessage(websocket.PingMessage, []byte{}); err != nil {
                //todo: error here
                return
            }
        }
    }
}

func (c *Connection) onMatching() {
    if c.isMatching == true || c.isMatched == true{
        //todo: error here
        return
    }
    c.isMatching = true
    MainDownstairsEngine.GetAllocateChannel() <- c
}

func (c *Connection) onMatched() {
    if c.isMatching != true || c.isMatched == true{
        //todo: error here
        return
    }
    c.isMatched = true
    go c.visibleDetector.Run()
}

func (c *Connection) onStart() {
    if c.isMatching != true || c.isMatched == true{
        //todo: error here
        return
    }
    c.isMatched = true
    go c.visibleDetector.Run()
}

func (c *Connection) onAction(commonData *core.CommonData) {
    if c.isMatching != true || c.isMatched != true {
        //todo: error here
        return
    }
    c.visibleDetector.Reset()
    if commonData.RequestPlayerId == commonData.HostId {
        c.X = commonData.HostX
        c.Y = commonData.HostY
        guest, err := MainDownstairsEngine.convertConnection(c.hub.Guest)
        if err != nil {
            //todo:error here
        }
        if guest.visibleDetector.IsVisible == false {
            guest.X = commonData.GuestX
            guest.Y = commonData.GuestY
        }
        c.hub.Broadcast(commonData)
    } else if commonData.RequestPlayerId == commonData.GuestId {
        c.X = commonData.GuestX
        c.Y = commonData.GuestY
        host, err := MainDownstairsEngine.convertConnection(c.hub.Host)
        if err != nil {
            //todo:error here
        }
        if host.visibleDetector.IsVisible == false {
            host.X = commonData.HostX
            host.Y = commonData.HostY
        }
        c.hub.Broadcast(commonData)
    } else {
        //todo: error here
    }
}

func (c *Connection) onRefreshAll(commonData *core.CommonData) {
    if c.isMatching != true || c.isMatched != true {
        //todo: error here
        return
    }

    c.visibleDetector.Reset()

    hub, err := MainDownstairsEngine.convertHub(c.hub)
    if err != nil {
        //todo:error here
    }

    host, err := MainDownstairsEngine.convertConnection(hub.Host)
    if err != nil {
        //todo:error here
    }

    guest, err := MainDownstairsEngine.convertConnection(hub.Guest)
    if err != nil {
        //todo:error here
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
    c.hub.Broadcast(refreshData)
}
