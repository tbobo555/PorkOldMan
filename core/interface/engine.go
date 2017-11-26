package _interface

type Engine interface {
    Run()
    GetConnection(s string) Connection
    GetAllConnections() map[string] Connection
    GetHub(s string) Hub
    GetAllHubs() map[string] Hub
    AddConnection(conn Connection)
    RemoveConnection(conn Connection)
    AddHub(hub Hub)
    RemoveHub(hub Hub)
    AllocateToHub(conn Connection)
    Broadcast(connMap map[string] Connection)
}
