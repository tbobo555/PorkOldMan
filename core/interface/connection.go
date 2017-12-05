package _interface

import "github.com/satori/go.uuid"

type Connection interface {
    GetConnectionId() uuid.UUID
    GetWriteChannel() chan []byte
    GetHub() Hub
    SetHub(hub Hub)
    IsAllocated() bool
    GetIsConnection() bool
    GetIsPageVisible() bool
    ListenRead()
    ListenWrite()
    WriteError(status, err string)
    Close()
}
