package controller

import (
    "net/http"
    "github.com/gorilla/websocket"
    "porkoldman/core/block/downstairs"
    "porkoldman/core"
    "porkoldman/core/middleware/log"
)

var upgrader = websocket.Upgrader {
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
}

// 服務路由"io/game/downstairs"的socket request
func IoGameDownStairsServeSocket(writer http.ResponseWriter, request *http.Request) {
    ioGameBlock := &downstairs.IoGame{}
    status, err := ioGameBlock.Load(writer, request)
    if err != nil || status != http.StatusOK{
        core.ShowErrorPage(writer, http.StatusBadRequest)
        log.WriteError(core.AppErrorInfoStatus, err.Error(), request)
        return
    }
    // connect to web socket
    conn, err := upgrader.Upgrade(writer, request, nil)
    if err != nil {
        core.ShowErrorPage(writer, http.StatusInternalServerError)
        log.WriteError(core.AppErrorExceptionStatus, err.Error(), request)
        return
    }
    newConn := downstairs.NewConnection(conn, request)
    go newConn.ListenRead()
    go newConn.ListenWrite()
}
