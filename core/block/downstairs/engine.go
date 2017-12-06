package downstairs

import (
    "porkoldman/core/interface"
    "porkoldman/core/element"
    "porkoldman/core"
    "errors"
    "text/template"
    "github.com/satori/go.uuid"
)

// downstairs.Engine類別，在server啟動時會創建此物件，用來服務downstairs遊戲
// 主要用途是配置與管理每一連線的使用者
type Engine struct {
    connections map[string] _interface.Connection
    hubs map[string] _interface.Hub
}

// 取得一組連線中的連線物件
func (e *Engine) GetConnection (s string) (_interface.Connection, error){
    if _, ok := e.connections[s]; ok {
        return e.connections[s], nil
    } else {
        return nil, errors.New("no connection with key: " + template.HTMLEscapeString(s))
    }
}

// 取得所有連線中的連線物件
func (e *Engine) GetAllConnections () map[string] _interface.Connection{
    return e.connections
}

// 取得一組使用中的hub
func (e *Engine) GetHub (s string) (_interface.Hub, error){
    if _, ok := e.hubs[s]; ok {
        return e.hubs[s], nil
    } else {
        return nil, errors.New("no hub with key: " + template.HTMLEscapeString(s))
    }
}

// 取得所有使用中的hub
func (e *Engine) GetAllHubs () map[string] _interface.Hub{
    return e.hubs
}

// 新增一組連線
func (e *Engine) AddConnection (conn _interface.Connection) error {
    if _, ok := e.connections[conn.GetConnectionId().String()]; ok {
        return errors.New("already set connection with id : " + template.HTMLEscapeString(conn.GetConnectionId().String()))
    }
    e.connections[conn.GetConnectionId().String()] = conn
    return nil
}

// 移除一組連線
func (e *Engine) RemoveConnection (conn _interface.Connection) {
    delete(e.connections, conn.GetConnectionId().String())
}

// 新增一組hub
func (e *Engine) AddHub (hub _interface.Hub) error{
    if _, ok := e.hubs[hub.GetHubId().String()]; ok {
        return errors.New("already set hub with id : " + template.HTMLEscapeString(hub.GetHubId().String()))
    }
    e.hubs[hub.GetHubId().String()] = hub
    return nil
}

// 移除一組hub
func (e *Engine) RemoveHub (hub _interface.Hub) {
    delete(e.hubs, hub.GetHubId().String())
}

func (e *Engine) Broadcast (connMap map[string] _interface.Connection) error {
    return nil
}

// 配置一組連線到可使用的hub中
func (e *Engine) AllocateToHub (conn _interface.Connection) error{
    downstairsConn, err := e.convertConnection(conn)
    if err != nil {
        return err
    }
    found := false
    for key, hub := range e.GetAllHubs() {
        if hub == nil {
            delete(e.hubs, key)
            continue
        }
        doublePlayerHub, err := e.convertHub(hub)
        if err != nil {
            return  err
        }
        if doublePlayerHub == nil {
            delete(e.hubs, key)
            continue
        }
        if doublePlayerHub.IsAllConnectionsDisconnect() {
            if doublePlayerHub.Host != nil {
                doublePlayerHub.Host.Close()
            }
            if doublePlayerHub.Guest != nil {
                doublePlayerHub.Guest.Close()
            }
            continue
        }
        if doublePlayerHub.Host != nil && doublePlayerHub.Host.GetIsConnection() && doublePlayerHub.Guest == nil {
            doublePlayerHub.Guest = downstairsConn
            downstairsConn.SetHub(doublePlayerHub)
            e.AddConnection(downstairsConn)
            found = true
            err = e.broadcastMatched(downstairsConn)
            if err != nil {
                return  err
            }
            err = e.broadcastStart(downstairsConn)
            if err != nil {
                return  err
            }
        }
        if found {
            break
        }
    }
    if found == false {
        newHub := element.NewDoublePlayerHub()
        e.AddHub(newHub)
        e.AddConnection(downstairsConn)
        downstairsConn.SetHub(newHub)
        newHub.Host = downstairsConn
        err = e.broadcastMatching(downstairsConn)
        if err != nil {
            return  err
        }
    }
    return nil
}

// 將抽象類別的connection物件轉換成downstairs的連線物件
func (e *Engine) convertConnection(conn _interface.Connection) (*Connection, error){
    switch result := conn.(type) {
    case *Connection:
        return result, nil
    }
    return nil, errors.New("convert failed, input is not a type of downstairs connection")
}

// 將抽象類別的hub物件轉換成downstairs的hub物件
func (e *Engine) convertHub(hub _interface.Hub) (*element.DoublePlayerHub, error){
    switch result := hub.(type) {
    case *element.DoublePlayerHub:
        return result, nil
    }
    return nil, errors.New("convert failed, input is not a type of DoublePlayerHub")
}

// 對此連線發布Matching(尋找對手)的資訊
func (e *Engine) broadcastMatching(conn *Connection) error{
    if conn == nil || conn.GetConnectionId() == uuid.Nil {
        return errors.New("broadcast from a nil connection")
    }
    if conn.GetIsConnection() != true {
        return errors.New("broadcast from a closed connection")
    }
    if conn.GetHub() == nil {
        return errors.New("broadcast from a nil hub connection")
    }
    data := &core.CommonData{}
    data.ActionType = core.MatchingActionKey
    data.RequestPlayerId = conn.GetConnectionId().String()
    data.HostId = conn.GetConnectionId().String()
    data.HostX = conn.X
    data.HostY = conn.Y
    data.GuestId = ""
    data.GuestX = -1
    data.GuestY = -1
    err := conn.GetHub().Broadcast(data)
    if err != nil {
        return err
    }
    return nil
}

// 對此連線發布Matched(找到對手)的資訊
func (e *Engine) broadcastMatched(conn *Connection) error{
    if conn == nil || conn.GetConnectionId() == uuid.Nil {
        return errors.New("broadcast with nil connection")
    }
    if conn.GetIsConnection() != true {
        return errors.New("broadcast from a closed connection")
    }
    if conn.GetHub() == nil {
        return errors.New("broadcast from a nil hub connection")
    }
    data := &core.CommonData{}
    data.ActionType = core.MatchedActionKey
    data.RequestPlayerId = conn.GetConnectionId().String()
    data.HostId = ""
    data.HostX = -1
    data.HostY = -1
    data.GuestId = conn.GetConnectionId().String()
    data.GuestX = conn.X
    data.GuestY = conn.Y
    err := conn.GetHub().Broadcast(data)
    if err != nil {
        return err
    }
    return nil

}

// 對此連線發布Start(開始對戰)的資訊
func (e *Engine) broadcastStart(conn *Connection) error{
    if conn == nil || conn.GetConnectionId() == uuid.Nil {
        return errors.New("broadcast with nil connection")
    }
    if conn.GetIsConnection() != true {
        return errors.New("broadcast from a closed connection")
    }
    if conn.GetHub() == nil {
        return errors.New("broadcast from a nil hub connection")
    }

    hub, err := e.convertHub(conn.GetHub())
    if err != nil {
        return err
    }
    host, err := e.convertConnection(hub.Host)
    if err != nil {
        return err
    }
    data := &core.CommonData{}
    data.ActionType = core.StartActionKey
    data.RequestPlayerId = conn.GetConnectionId().String()
    data.HostId = host.mainPlayerId.String()
    data.HostX = host.X
    data.HostY = host.Y
    data.GuestId = conn.GetConnectionId().String()
    data.GuestX = conn.X
    data.GuestY = conn.Y
    err = conn.GetHub().Broadcast(data)
    if err != nil {
        return err
    }
    return nil
}

var MainDownstairsEngine = &Engine{
    connections: make(map[string] _interface.Connection),
    hubs: make(map[string] _interface.Hub),
}
