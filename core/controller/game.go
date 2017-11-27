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

// 服務路由"io/game/downstairs"的request
func IoGameDownStairsServeSocket(w http.ResponseWriter, r *http.Request) {
    // connect to web socket
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Panicln(err)
    }
    newConn := downstairs.NewConnection(conn)
    go newConn.ListenRead()
    go newConn.ListenWrite()
}
