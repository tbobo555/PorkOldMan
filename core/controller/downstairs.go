package controller

import (
    "net/http"
    "text/template"
    "porkoldman/core/block/downstairs"
    "porkoldman/core"
    "porkoldman/core/middleware/log"
)

// 下樓梯遊戲服務
func DownStairs(writer http.ResponseWriter, request *http.Request) {
    indexTemplate := template.New("downstairs.html")
    indexTemplate.ParseFiles(FilePath + "downstairs.html")
    err := indexTemplate.Execute(writer, nil)
    if err != nil {
        core.ShowErrorPage(writer, http.StatusInternalServerError)
        log.WriteError(core.AppErrorExceptionStatus, err.Error(), request)
        return
    }
}

// [測試中]下樓梯遊戲的主要服務
func TestingDownStairs(writer http.ResponseWriter, request *http.Request) {
    homeBlock := &downstairs.Home{}
    status, err := homeBlock.Load(writer, request)
    if err != nil {
        core.ShowErrorPage(writer, status)
        log.WriteError(core.AppErrorExceptionStatus, err.Error(), request)
        return
    }
    resp, err := homeBlock.Response()
    if err != nil {
        core.ShowErrorPage(writer, http.StatusInternalServerError)
        log.WriteError(core.AppErrorExceptionStatus, err.Error(), request)
        return
    }
    if _, ok := resp["SocketToken"]; !ok {
        core.ShowErrorPage(writer, http.StatusInternalServerError)
        log.WriteError(core.AppErrorExceptionStatus, err.Error(), request)
        return
    }
    socketToken := resp["SocketToken"]
    indexTemplate := template.New("downstairstesting.html")
    indexTemplate.ParseFiles(FilePath + "downstairstesting.html")
    err = indexTemplate.Execute(writer, socketToken)
    if err != nil {
        core.ShowErrorPage(writer, http.StatusInternalServerError)
        log.WriteError(core.AppErrorExceptionStatus, err.Error(), request)
        return
    }
}

// [測試中]下樓梯遊戲的socket服務
func TestingDownStairsSocket(writer http.ResponseWriter, request *http.Request) {
    ioGameBlock := &downstairs.IoGame{}
    status, err := ioGameBlock.Load(writer, request)
    if err != nil || status != http.StatusOK{
        core.ShowErrorPage(writer, http.StatusBadRequest)
        log.WriteError(core.AppErrorInfoStatus, err.Error(), request)
        return
    }
    // connect to web socket
    conn, err := Upgrader.Upgrade(writer, request, nil)
    if err != nil {
        core.ShowErrorPage(writer, http.StatusInternalServerError)
        log.WriteError(core.AppErrorExceptionStatus, err.Error(), request)
        return
    }
    newConn := downstairs.NewConnection(conn, request)
    go newConn.ListenRead()
    go newConn.ListenWrite()
}
