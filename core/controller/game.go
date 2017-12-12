package controller

import (
    "net/http"
    "github.com/gorilla/websocket"
    "porkoldman/core/block/downstairs"
    "porkoldman/core/middleware/sessions"
    "porkoldman/core/middleware/tokens"
    "github.com/gorilla/mux"
    "porkoldman/core"
    "fmt"
)

var upgrader = websocket.Upgrader {
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
}

// 服務路由"io/game/downstairs"的socket request
func IoGameDownStairsServeSocket(writer http.ResponseWriter, request *http.Request) {
    vars := mux.Vars(request)
    if _, ok := vars["token"]; !ok {
        fmt.Println(1)
        show404(writer, request)
        return
    }
    cookieTokenText, err := request.Cookie(core.SessionIdCookieName)
    if err != nil {
        fmt.Println(2)
        show404(writer, request)
        return

    }
    token, err := tokens.Manager.Decode(cookieTokenText.Value)
    if err != nil {
        fmt.Println(3)
        show404(writer, request)
        return

    }
    isValid, err := tokens.Manager.Verify(token)
    if err != nil {
        fmt.Println(4)
        show404(writer, request)
        return

    }
    if isValid != true {
        fmt.Println(5)
        show404(writer, request)
        return

    }
    session, err := sessions.Manager.Get(token.Message)
    if err != nil {
        fmt.Println(6)
        show404(writer, request)
        return

    }
    socketToken := vars["token"]
    isValidSocketToken := false
    for key, val := range session.Values {
        if val == socketToken {
            isValidSocketToken = true
            delete(session.Values, key)
            err = session.Save()
            if err != nil {
                fmt.Println(7)
                show404(writer, request)
                return

            }
            break
        }
    }
    if isValidSocketToken != true {
        fmt.Println(8)
        show404(writer, request)
        return

    }

    // connect to web socket
    conn, err := upgrader.Upgrade(writer, request, nil)
    if err != nil {
        fmt.Println(9)
        show404(writer, request)
        return

    }
    newConn := downstairs.NewConnection(conn, request)
    go newConn.ListenRead()
    go newConn.ListenWrite()
}


func show404(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusNotFound)
    w.Write([]byte("404 - Something bad happened!"))
}
