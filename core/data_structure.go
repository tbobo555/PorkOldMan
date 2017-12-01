package core

const (
    AppErrorDebugStatus = "debug"
    AppErrorInfoStatus = "info"
    AppErrorExceptionStatus = "exception"
    AppErrorAlertStatus = "alert"
)

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
    DefaultPadding = "="
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

type IdData struct {
    Id string
}

type CommonHashData struct {
    Content string
    Key string
}
