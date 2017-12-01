package middleware

import (
    "fmt"
    "time"
    "net/http"
    "runtime"
    "porkoldman/core"
    "net"
)

type AppError struct {
    time string
    status string
    hostIP string
    hostName string
    userIP string
    userAgent string
    userConnection string
    summary string
    summaryTrace string
    trace string
}

func NewAppError(status string, summary string, request *http.Request) *AppError{
    if status != core.AppErrorDebugStatus && status != core.AppErrorInfoStatus &&
        status != core.AppErrorExceptionStatus && status != core.AppErrorAlertStatus {
            status = core.AppErrorInfoStatus
    }
    e := &AppError{}
    e.time = time.Now().UTC().String()
    e.status = status
    e.hostIP = e.getHostIp()
    e.hostName = request.Host
    e.userIP = e.getUserIp(request)
    e.userAgent = request.Header.Get("User-Agent")
    e.userConnection = request.Header.Get("Connection")
    e.summary = summary
    e.summaryTrace = e.getStackTrace(false)
    e.trace = e.getStackTrace(true)
    return e
}

func (e *AppError) Error() string{
    return fmt.Sprintf("%s", e.getString())
}

func (e *AppError) getString() string {
    return `{time: ` + e.time + `
    status: ` + e.status + `
    hostIP: ` + e.hostIP + `
    hostName: ` + e.hostName + `
    userIP: ` + e.userIP + `
    userAgent: ` + e.userAgent + `
    userConnection: ` + e.userConnection + `
    summary: ` + e.summary + `
    trace: ` + e.trace + `
    }`
}

func (e *AppError) getStackTrace(all bool) string {
    buf := make([]byte, 256)
    for {
        size := runtime.Stack(buf, all)
        if size == len(buf) {
            buf = make([]byte, len(buf)<<1)
            continue
        }
        break
    }
    return string(buf)
}

func (e *AppError) getHostIp() string {
    result := ""
    addrs, err := net.InterfaceAddrs()
    if err != nil {
        return "error occur: can't get host ip. Error info: " + err.Error()
    }
    for i, addr := range addrs {
        result = string(i) + " " + result + addr.String() + "; "
    }
    return result
}

func (e *AppError) getUserIp(request *http.Request) string {
    result := ""
    result = result + "X-Forwarded-For: " + request.Header.Get("X-Forwarded-For") + "; "
    result = result + "X-Real-Ip: " + request.Header.Get("X-Real-Ip") + "; "
    result = result + "RemoteAddr: " + request.RemoteAddr + "; "
    return result
}
