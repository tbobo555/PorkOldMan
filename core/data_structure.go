package core


const (
    MatchingActionKey = "Matching"
    MatchedActionKey = "Matched"
    StartActionKey = "Start"
    JumpActionKey = "Jump"
    LeftActionKey = "Left"
    RightActionKey = "Right"
    StopActionKey = "Stop"
    AdjustActionKey = "Adjust"
    RefreshAllActionKey = "RefreshAll"
)

type CommonData struct {
    ActionType string
    RequestPlayerId string
    HostId string
    GuestId string
    HostX float32
    GuestX float32
    HostY float32
    GuestY float32
}

type PlayerInfo struct {
    Id string
    X float32
    Y float32
}
