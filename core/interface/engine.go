package _interface

type Engine interface {
    GetConnection(s string) (Connection, error)
    GetAllConnections() map[string] Connection
    GetHub(s string) (Hub, error)
    GetAllHubs() map[string] Hub
    AddConnection(conn Connection) error
    RemoveConnection(conn Connection)
    AddHub(hub Hub) error
    RemoveHub(hub Hub)
    AllocateToHub(conn Connection) error
}
