package element

import (
    "testing"
    "github.com/satori/go.uuid"
    "reflect"
    "porkoldman/core/interface"
    "porkoldman/core"
    "time"
)

func TestGetSet (t *testing.T) {
    dph := NewDoublePlayerHub()

    //----------  test NewDoublePlayerHub
    if dph.hubId == uuid.Nil {
        t.Errorf("Test new DoublePlayerHub failed, get nil id")
    }
    if len(dph.connections) > 0 {
        t.Errorf("Test new DoublePlayerHub failed, exist unknow connections")
    }
    if dph.Host != nil {
        t.Errorf("Test new DoublePlayerHub failed, get not nil Host")
    }
    if dph.Guest != nil {
        t.Errorf("Test new DoublePlayerHub failed, get not nil Guest")
    }

    //----------  test GetHubId
    if dph.GetHubId() != dph.hubId {
        t.Errorf("Test DoublePlayerHub.GetHubId failed, unexpect result")
    }

    //----------  test GetAllConnections
    if reflect.DeepEqual(dph.GetAllConnections(), dph.connections) != true {
        t.Errorf("Test DoublePlayerHub.GetAllConnections failed, get unexpect result")
    }

    //----------  test AddConnection
    err := dph.AddConnection(nil)
    if err == nil {
        t.Errorf("Test DoublePlayerHub.AddConnection failed, get not nil error with add nil connetion")
    }
    emptyConn := &_interface.ConnectionTest{}
    err = dph.AddConnection(emptyConn)
    if err == nil {
        t.Errorf("Test DoublePlayerHub.AddConnection failed, get not nil error with add empty connetion")
    }
    conn := &_interface.ConnectionTest {
        ParamId: uuid.NewV4(),
    }
    err = dph.AddConnection(conn)
    if err != nil {
        t.Errorf("Test DoublePlayerHub.AddConnection failed, get error: %s", err.Error())
    }
    err = dph.AddConnection(conn)
    if err == nil {
        t.Errorf("Test DoublePlayerHub.AddConnection failed, get not nil error with repeat add same connetion")
    }

    //----------  test GetConnection
    _, err = dph.GetConnection("no exist key")
    if err == nil {
        t.Errorf("Test DoublePlayerHub.GetConnection failed, get not nil error with no exist key")
    }
    result, err := dph.GetConnection(conn.GetConnectionId().String())
    if err != nil {
        t.Errorf("Test DoublePlayerHub.GetConnection failed, get error: %s", err.Error())
    }
    if reflect.DeepEqual(result, conn) != true {
        t.Errorf("Test DoublePlayerHub.GetConnection failed, get unexpect result")
    }

    //----------  test RemoveConnection
    dph.RemoveConnection(conn)
    dph.RemoveConnection(conn) // method can repeat call
    _, err = dph.GetConnection(conn.GetConnectionId().String())
    if err == nil {
        t.Errorf("Test DoublePlayerHub.RemoveConnection failed, remove connection but still get it")
    }
}

func TestDoublePlayerHub_IsAllConnectionsDisconnect(t *testing.T) {
    dph := NewDoublePlayerHub()
    result := dph.IsAllConnectionsDisconnect()
    if result != true {
        t.Errorf("Test DoublePlayerHub.IsAllConnectionsDisconnect failed, get unexpect result")
    }
    conn := &_interface.ConnectionTest {
        ParamId: uuid.NewV4(),
        ParamIsConnection: true,
    }
    dph.AddConnection(conn)
    result = dph.IsAllConnectionsDisconnect()
    if result != false {
        t.Errorf("Test DoublePlayerHub.IsAllConnectionsDisconnect failed, get unexpect result")
    }
    dph.RemoveConnection(conn)
    dph.Host = conn
    result = dph.IsAllConnectionsDisconnect()
    if result != false {
        t.Errorf("Test DoublePlayerHub.IsAllConnectionsDisconnect failed, get unexpect result")
    }
    dph.Host = nil
    dph.Guest = conn
    result = dph.IsAllConnectionsDisconnect()
    if result != false {
        t.Errorf("Test DoublePlayerHub.IsAllConnectionsDisconnect failed, get unexpect result")
    }
}

func TestDoublePlayerHub_Broadcast(t *testing.T) {
    dph := NewDoublePlayerHub()
    dph.MaxBroadcastWaitTime = 100 * time.Millisecond

    //---------- nil input test
    err := dph.Broadcast(nil)
    if err == nil {
        t.Errorf("Test DoublePlayerHub.Broadcast failed, get nil error with nil input")
    }

    //---------- invalid input test
    err = dph.Broadcast("it is a invalid input")
    if err == nil {
        t.Errorf("Test DoublePlayerHub.Broadcast failed, get nil error with invalid input test")
    }

    //---------- empty hub test
    hostId := uuid.NewV4()
    guestId := uuid.NewV4()
    data := &core.CommonData {
        ActionType: core.RefreshAllActionKey,
        RequestPlayerId: hostId.String(),
        HostId: hostId.String(),
        GuestId: guestId.String(),
        HostX: 0,
        HostY: 0,
        GuestX: 0,
        GuestY: 0,
    }
    err = dph.Broadcast(data)
    if err == nil {
        t.Errorf("Test DoublePlayerHub.Broadcast failed, get nil error with empty hub")
    }

    //---------- conn init
    hostConn := &_interface.ConnectionTest {
        ParamId: hostId,
    }
    guestConn := &_interface.ConnectionTest {
        ParamId: guestId,
    }
    dph.Host = hostConn
    dph.Guest = guestConn

    //---------- invalid request id test
    hostConn.ParamId = uuid.NewV4()
    err = dph.Broadcast(data)
    if err == nil {
        t.Errorf("Test DoublePlayerHub.Broadcast failed, get nil error with error request id")
    }

    //----------  connection disconnect test
    hostConn.ParamId = hostId
    hostConn.ParamIsConnection = false
    hostConn.ParamIsPageVisible = false
    err = dph.Broadcast(data)
    if err != nil {
        t.Errorf("Test DoublePlayerHub.Broadcast failed, disconnect test, get error: %s", err.Error())
    }

    //----------  send nil channel test
    hostConn.ParamIsConnection = true
    hostConn.ParamIsPageVisible = true
    err = dph.Broadcast(data)
    if err == nil {
       t.Errorf("Test DoublePlayerHub.Broadcast failed, send on nil channel, but no get error")
    }

    //----------  normal broadcast RefreshAll to host test
    hostConn.ParamWriteChannel = make(chan []byte)
    go hostConn.ListenWrite()
    err = dph.Broadcast(data)
    if err != nil {
        t.Errorf("Test DoublePlayerHub.Broadcast failed, normal test, get error: %s", err.Error())
    }

    //---------- send on closed channel test
    close(hostConn.ParamWriteChannel)
    err = dph.Broadcast(data)
    if err == nil {
        t.Errorf("Test DoublePlayerHub.Broadcast failed, send on closed channel, but no get error")
    }
}

func TestAllAction(t *testing.T) {
    dph := NewDoublePlayerHub()
    dph.MaxBroadcastWaitTime = 100 * time.Millisecond
    hostId := uuid.NewV4()
    guestId := uuid.NewV4()
    hostConn := &_interface.ConnectionTest {
        ParamId: hostId,
        ParamIsConnection: true,
        ParamIsPageVisible: true,
    }
    guestConn := &_interface.ConnectionTest {
        ParamId: guestId,
        ParamIsConnection: true,
        ParamIsPageVisible: true,
    }
    dph.Host = hostConn
    dph.Guest = guestConn
    data := &core.CommonData {
        ActionType: core.RefreshAllActionKey,
        RequestPlayerId: hostId.String(),
        HostId: hostId.String(),
        GuestId: guestId.String(),
        HostX: 0,
        HostY: 0,
        GuestX: 0,
        GuestY: 0,
    }

    //---------- normal broadcast Matching to host test
    data.ActionType = core.MatchingActionKey
    hostConn.ParamWriteChannel = make(chan []byte)
    go hostConn.ListenWrite()
    err := dph.Broadcast(data)
    if err != nil {
        t.Errorf("Test DoublePlayerHub.Broadcast failed, normal Matching test, get error: %s", err.Error())
    }

    //---------- normal broadcast Matching to guest test
    guestConn.ParamWriteChannel = make(chan []byte)
    go guestConn.ListenWrite()
    data.RequestPlayerId = guestId.String()
    err = dph.Broadcast(data)
    if err != nil {
        t.Errorf("Test DoublePlayerHub.Broadcast failed, normal Matching test, get error: %s", err.Error())
    }

    //---------- normal broadcast Matched test
    data.ActionType = core.MatchedActionKey
    hostConn.ParamWriteChannel = make(chan []byte)
    go hostConn.ListenWrite()
    err = dph.Broadcast(data)
    if err != nil {
        t.Errorf("Test DoublePlayerHub.Broadcast failed, normal Matched test, get error: %s", err.Error())
    }

    //---------- nil host connection test
    dph.Host = nil
    err = dph.Broadcast(data)
    if err == nil {
        t.Errorf("Test DoublePlayerHub.Broadcast failed, Matched, nil Host test, but no get error")
    }

    //---------- invalid request id test
    dph.Host = hostConn
    data.RequestPlayerId = uuid.NewV4().String()
    err = dph.Broadcast(data)
    if err == nil {
        t.Errorf("Test DoublePlayerHub.Broadcast failed, Matched, invalid request id test, but no get error")
    }

    //---------- nil channel test
    data.RequestPlayerId = hostId.String()
    hostConn.ParamWriteChannel = nil
    err = dph.Broadcast(data)
    if err == nil {
        t.Errorf("Test DoublePlayerHub.Broadcast failed, Matched, nil channel test, but no get error")
    }

    //---------- normal broadcast Start test
    data.ActionType = core.StartActionKey
    guestConn.ParamWriteChannel = make(chan []byte)
    go guestConn.ListenWrite()
    err = dph.Broadcast(data)
    if err != nil {
        t.Errorf("Test DoublePlayerHub.Broadcast failed, normal Start test, get error: %s", err.Error())
    }

    //---------- nil guest connection test
    dph.Guest = nil
    err = dph.Broadcast(data)
    if err == nil {
        t.Errorf("Test DoublePlayerHub.Broadcast failed, Start, nil Guest test, but no get error")
    }

    //---------- invalid request id test
    dph.Guest = guestConn
    data.RequestPlayerId = uuid.NewV4().String()
    err = dph.Broadcast(data)
    if err == nil {
        t.Errorf("Test DoublePlayerHub.Broadcast failed, Start, invalid request id test, but no get error")
    }

    //---------- nil channel test
    data.RequestPlayerId = hostId.String()
    guestConn.ParamWriteChannel = nil
    err = dph.Broadcast(data)
    if err == nil {
        t.Errorf("Test DoublePlayerHub.Broadcast failed, Start, nil channel test, but no get error")
    }

    //---------- normal broadcast Adjust test
    data.ActionType = core.AdjustActionKey
    hostConn.ParamWriteChannel = make(chan []byte)
    go hostConn.ListenWrite()
    guestConn.ParamWriteChannel = make(chan []byte)
    go guestConn.ListenWrite()
    err = dph.Broadcast(data)
    if err != nil {
        t.Errorf("Test DoublePlayerHub.Broadcast failed, normal Adjust test, get error: %s", err.Error())
    }

    //---------- nil connection test
    dph.Guest = nil
    dph.Host = nil
    err = dph.Broadcast(data)
    if err == nil {
        t.Errorf("Test DoublePlayerHub.Broadcast failed, Adjust, nil Connection test, but no get error")
    }

    //---------- invalid request id test
    dph.Guest = guestConn
    dph.Host = hostConn
    data.RequestPlayerId = uuid.NewV4().String()
    err = dph.Broadcast(data)
    if err == nil {
        t.Errorf("Test DoublePlayerHub.Broadcast failed, Adjust, invalid request id test, but no get error")
    }

    //---------- nil channel test
    data.RequestPlayerId = hostId.String()
    hostConn.ParamWriteChannel = nil
    err = dph.Broadcast(data)
    if err == nil {
        t.Errorf("Test DoublePlayerHub.Broadcast failed, Start, host nil channel test, but no get error")
    }

    data.RequestPlayerId = hostId.String()
    hostConn.ParamWriteChannel = make(chan []byte)
    go hostConn.ListenWrite()
    guestConn.ParamWriteChannel = nil
    err = dph.Broadcast(data)
    if err == nil {
        t.Errorf("Test DoublePlayerHub.Broadcast failed, Start, guest nil channel test, but no get error")
    }

    //---------- normal broadcast Left test
    data.ActionType = core.LeftActionKey
    hostConn.ParamWriteChannel = make(chan []byte)
    go hostConn.ListenWrite()
    guestConn.ParamWriteChannel = make(chan []byte)
    go guestConn.ListenWrite()
    err = dph.Broadcast(data)
    if err != nil {
        t.Errorf("Test DoublePlayerHub.Broadcast failed, normal Left test, get error: %s", err.Error())
    }

    //---------- normal broadcast Right test
    data.ActionType = core.RightActionKey
    hostConn.ParamWriteChannel = make(chan []byte)
    go hostConn.ListenWrite()
    guestConn.ParamWriteChannel = make(chan []byte)
    go guestConn.ListenWrite()
    err = dph.Broadcast(data)
    if err != nil {
        t.Errorf("Test DoublePlayerHub.Broadcast failed, normal Right test, get error: %s", err.Error())
    }

    //---------- normal broadcast Stop test
    data.ActionType = core.StopActionKey
    hostConn.ParamWriteChannel = make(chan []byte)
    go hostConn.ListenWrite()
    guestConn.ParamWriteChannel = make(chan []byte)
    go guestConn.ListenWrite()
    err = dph.Broadcast(data)
    if err != nil {
        t.Errorf("Test DoublePlayerHub.Broadcast failed, normal Stop test, get error: %s", err.Error())
    }

    //---------- normal broadcast Jump test
    data.ActionType = core.JumpActionKey
    hostConn.ParamWriteChannel = make(chan []byte)
    go hostConn.ListenWrite()
    guestConn.ParamWriteChannel = make(chan []byte)
    go guestConn.ListenWrite()
    err = dph.Broadcast(data)
    if err != nil {
        t.Errorf("Test DoublePlayerHub.Broadcast failed, normal Jump test, get error: %s", err.Error())
    }
}
