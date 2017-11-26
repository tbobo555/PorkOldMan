package _interface

import "github.com/satori/go.uuid"

type Hub interface {
    Run()
    GetHubId() uuid.UUID
    GetConnection(string) Connection
    GetAllConnections() map[string] Connection
    IsAllConnectionsDisconnect() bool
    Broadcast(data interface{})
    Close()
}
