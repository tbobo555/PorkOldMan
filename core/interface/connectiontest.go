package _interface

import (
    "github.com/satori/go.uuid"
)

// ConnectionTest類別，僅供需要模擬假Connection的單元測試使用
type ConnectionTest struct {
    ParamId uuid.UUID
    ParamWriteChannel chan []byte
    ParamHub Hub
    ParamIsAllocate bool
    ParamIsConnection bool
    ParamIsPageVisible bool
}

func (c *ConnectionTest) GetConnectionId() uuid.UUID {
    return c.ParamId
}

func (c *ConnectionTest) GetWriteChannel() chan []byte {
    return c.ParamWriteChannel
}

func (c *ConnectionTest) GetHub() Hub {
    return c.ParamHub
}

func (c *ConnectionTest) SetHub(hub Hub) {
    c.ParamHub = hub
}

func (c *ConnectionTest) IsAllocated() bool {
    return c.ParamIsAllocate
}

func (c *ConnectionTest) GetIsConnection() bool {
    return c.ParamIsConnection
}

func (c *ConnectionTest) GetIsPageVisible() bool {
    return c.ParamIsPageVisible
}

func (c *ConnectionTest) ListenRead() {

}

func (c *ConnectionTest) ListenWrite() {
    for {
        select {
        case  <- c.ParamWriteChannel:
            return
        }
    }
}

func (c *ConnectionTest) WriteError(status, err string) {

}

func (c *ConnectionTest) Close() {

}

