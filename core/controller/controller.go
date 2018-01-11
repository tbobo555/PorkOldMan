package controller

import (
    "porkoldman/core/config"
    "github.com/gorilla/websocket"
)

var FilePath = config.PublicPathForService

var Upgrader = websocket.Upgrader {
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
}
