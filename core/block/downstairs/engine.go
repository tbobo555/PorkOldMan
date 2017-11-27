package downstairs

import (
    "porkoldman/core/interface"
    "porkoldman/core/element"
    "porkoldman/core"
    "errors"
)

// downstairs.Engine類別，在server啟動時會創建此物件，用來服務downstairs遊戲
// 主要用途是配置與管理每一連線的使用者
type Engine struct {
    connections map[string] _interface.Connection
    hubs map[string] _interface.Hub
    allocateChannel chan *Connection
}

// 開始啟動downstairs.Engine
func (e *Engine) Run () {
    for {
        select {
        case conn := <-e.allocateChannel:
            e.AllocateToHub(conn)
        }
    }
}

// 取得一組連線中的連線物件
func (e *Engine) GetConnection (s string) _interface.Connection{
    return e.connections[s]
}

// 取得所有連線中的連線物件
func (e *Engine) GetAllConnections () map[string] _interface.Connection{
    return e.connections
}

// 取得一組使用中的hub
func (e *Engine) GetHub (s string) _interface.Hub{
    return e.hubs[s]
}

// 取得所有使用中的hub
func (e *Engine) GetAllHubs () map[string] _interface.Hub{
    return e.hubs
}

// 新增一組連線
func (e *Engine) AddConnection (conn _interface.Connection) {
    e.connections[conn.GetConnectionId().String()] = conn
}

// 移除一組連線
func (e *Engine) RemoveConnection (conn _interface.Connection) {
    delete(e.connections, conn.GetConnectionId().String())
}

// 新增一組hub
func (e *Engine) AddHub (hub _interface.Hub) {
    e.hubs[hub.GetHubId().String()] = hub
}

// 移除一組hub
func (e *Engine) RemoveHub (hub _interface.Hub) {
    delete(e.hubs, hub.GetHubId().String())
}

func (e *Engine) Broadcast (connMap map[string] _interface.Connection) {}

// 配置一組連線到可使用的hub中
func (e *Engine) AllocateToHub (conn _interface.Connection) {
    if conn.IsAllocated() == true {
        return
    }
    downstairsConn, err := e.convertConnection(conn)
    if err != nil {
        //todo: error here
        return
    }

    found := false
    for _, hub := range e.GetAllHubs() {
        doublePlayerHub, err := e.convertHub(hub)
        if err != nil {
            //todo: error here
        }
        if doublePlayerHub.Guest == nil {
            doublePlayerHub.Guest = downstairsConn
            downstairsConn.SetHub(doublePlayerHub)
            e.AddConnection(downstairsConn)
            found = true
            go e.broadcastMatched(downstairsConn)
            go e.broadcastStart(downstairsConn)
        }

        if found {
            break
        }
    }
    if found == false {
        newHub := element.NewDoublePlayerHub(MainDownstairsEngine)
        e.AddHub(newHub)
        e.AddConnection(downstairsConn)
        downstairsConn.SetHub(newHub)
        newHub.Host = downstairsConn
        go newHub.Run()
        go e.broadcastMatching(downstairsConn)
    }
}

// 取得配置hub的channel
func (e *Engine) GetAllocateChannel() chan *Connection{
    return e.allocateChannel
}

// 將抽象類別的connection物件轉換成downstairs的連線物件
func (e *Engine) convertConnection(conn _interface.Connection) (*Connection, error){
    switch result := conn.(type) {
    case *Connection:
        return result, nil
    }
    //todo: error here
    return &Connection{}, errors.New("")
}

// 將抽象類別的hub物件轉換成downstairs的hub物件
func (e *Engine) convertHub(hub _interface.Hub) (*element.DoublePlayerHub, error){
    switch result := hub.(type) {
    case *element.DoublePlayerHub:
        return result, nil
    }
    //todo: error here
    return &element.DoublePlayerHub{}, errors.New("")
}

// 對此連線發布Matching(尋找對手)的資訊
func (e *Engine) broadcastMatching(conn *Connection) {
    data := &core.CommonData{}
    data.ActionType = core.MatchingActionKey
    data.RequestPlayerId = conn.GetConnectionId().String()
    data.HostId = conn.GetConnectionId().String()
    data.HostX = conn.X
    data.HostY = conn.Y
    data.GuestId = ""
    data.GuestX = -1
    data.GuestY = -1
    conn.GetHub().Broadcast(data)
}

// 對此連線發布Matched(找到對手)的資訊
func (e *Engine) broadcastMatched(conn *Connection) {
    data := &core.CommonData{}
    data.ActionType = core.MatchedActionKey
    data.RequestPlayerId = conn.GetConnectionId().String()
    data.HostId = ""
    data.HostX = -1
    data.HostY = -1
    data.GuestId = conn.GetConnectionId().String()
    data.GuestX = conn.X
    data.GuestY = conn.Y
    conn.GetHub().Broadcast(data)
}

// 對此連線發布Start(開始對戰)的資訊
func (e *Engine) broadcastStart(conn *Connection) {
    hub, err := e.convertHub(conn.GetHub())
    if err != nil {
        //todo: error here
        return
    }
    host, err := e.convertConnection(hub.Host)
    if err != nil {
        //todo: error here
        return
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
    conn.GetHub().Broadcast(data)
}

var MainDownstairsEngine = &Engine{
    connections: make(map[string] _interface.Connection),
    hubs: make(map[string] _interface.Hub),
    allocateChannel: make(chan *Connection),
}

func RunEngine(){
    MainDownstairsEngine.Run()
}
