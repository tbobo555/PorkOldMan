package middleware

import (
    "porkoldman/core"
    "time"
)

type AppLog struct {
    rootPath string
    mailMap []string
}

func (l *AppLog) WriteLog(status, data string) {
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

    handler.WriteFile(l.getLogPath(status), data)
}

func (l *AppLog) SetMailer(mail string) {

}

func (l *AppLog) sendMail(data string) {

}

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
    return l.rootPath + "/" + dir + "/" + time.Now().UTC().Format("2006-01-02-15") + ".log"
}
