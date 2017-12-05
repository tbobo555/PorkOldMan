package _interface

import "github.com/satori/go.uuid"

type Hub interface {
    GetHubId() uuid.UUID
    GetConnection(string) (Connection,error)
    GetAllConnections() map[string] Connection
    AddConnection(conn Connection) error
    RemoveConnection(conn Connection)
    IsAllConnectionsDisconnect() bool
    Broadcast(data interface{}) error
}
