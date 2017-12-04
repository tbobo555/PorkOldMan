package middleware

import (
    "time"
    "net/http"
    "runtime"
    "porkoldman/core"
    "net"
    "encoding/json"
    "bytes"
    "fmt"
)

// 類別 AppError 整理並紀錄完善的錯誤訊息，以供後續查看
type AppError struct {
    Time string
    Status string
    HostIP string
    HostName string
    UserIP string
    UserAgent string
    UserConnection string
    SummaryTrace string
    Summary string
    Trace string
}

// 新增一AppError物件，此物件會解析使用者的request，並記錄相關資料
func NewAppError(status string, summary string, request *http.Request) *AppError{
    if status != core.AppErrorDebugStatus && status != core.AppErrorInfoStatus &&
        status != core.AppErrorExceptionStatus && status != core.AppErrorAlertStatus {
            status = core.AppErrorInfoStatus
    }
    e := &AppError{}
    e.Time = time.Now().UTC().String()
    e.Status = status
    e.HostIP = e.getHostIp()
    e.HostName = request.Host
    e.UserIP = e.getUserIp(request)
    e.UserAgent = request.Header.Get("User-Agent")
    e.UserConnection = request.Header.Get("Connection")
    e.Summary = summary
    e.SummaryTrace = e.getStackTrace(false)
    e.Trace = e.getStackTrace(true)
    return e
}

// 取得錯誤訊息
func (e *AppError) Error() (string, error){
    s, err := e.getString()
    if err !=nil {
        return "", err
    }
    return fmt.Sprintf("%s", s), nil
}

// 將錯誤資料整理成json字串
func (e *AppError) getString() (string, error) {
    result, err := json.Marshal(e)
    if err !=nil {
        return "", err
    }
    return fmt.Sprintf("%s", result), nil
}

// 取得程式執行紀錄(stack trace)，參數all代表是否取出不同goroutine的執行紀錄
func (e *AppError) getStackTrace(all bool) string {
    buf := make([]byte, 64)
    for {
        size := runtime.Stack(buf, all)
        if size == len(buf) {
            buf = make([]byte, len(buf)<<1)
            continue
        }
        break
    }
    return string(bytes.Trim(buf, "\x00"))
}

// 取得產生此錯誤訊息的機器ip
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

// 取得發送請求給伺服器的使用者ip
func (e *AppError) getUserIp(request *http.Request) string {
    result := ""
    result = result + "X-Forwarded-For: " + request.Header.Get("X-Forwarded-For") + "; "
    result = result + "X-Real-Ip: " + request.Header.Get("X-Real-Ip") + "; "
    result = result + "RemoteAddr: " + request.RemoteAddr + "; "
    return result
}
