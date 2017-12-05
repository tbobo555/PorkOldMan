package controller

import (
    "net/http"
    "log"
    "github.com/gorilla/websocket"
    "porkoldman/core/block/downstairs"
)

var upgrader = websocket.Upgrader {
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
}

// 服務路由"io/game/downstairs"的socket request
func IoGameDownStairsServeSocket(writer http.ResponseWriter, request *http.Request) {
    // connect to web socket
    conn, err := upgrader.Upgrade(writer, request, nil)
    if err != nil {
        log.Panicln(err)
    }
    newConn := downstairs.NewConnection(conn, request)
    go newConn.ListenRead()
    go newConn.ListenWrite()
}
