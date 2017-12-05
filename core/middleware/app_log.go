package middleware

import (
    "porkoldman/core"
    "time"
)

// 類別 AppLog, 紀錄專案所有執行的訊息
type AppLog struct {
    RootPath string
}

// 撰寫log到檔案裡面
func (l *AppLog) WriteLog(status, data string) error{
    handler := &FileHandler{}
    switch status {
    case core.AppErrorDebugStatus:
        fallthrough
    case core.AppErrorInfoStatus:
        fallthrough
    case core.AppErrorExceptionStatus:
        fallthrough
    case core.AppErrorAlertStatus:
    default:
        status = core.AppErrorInfoStatus
    }
    fileName := l.getLogPath(status)
    err := handler.CreateFile(fileName)
    if err != nil {
        return err
    }
    err = handler.WriteFile(fileName, data)
    if err != nil {
        return err
    }
    return nil
}

// 依據log狀態，取得目錄路徑
func (l *AppLog) getLogPath(status string) string {
    dir := core.AppErrorInfoStatus
    switch status {
    case core.AppErrorDebugStatus:
        dir = status
    case core.AppErrorInfoStatus:
        dir = status
    case core.AppErrorExceptionStatus:
        dir = status
    case core.AppErrorAlertStatus:
        dir = status
    }
    return l.RootPath + "/" + dir + "/" + time.Now().UTC().Format("2006-01-02-15") + ".log"
}
