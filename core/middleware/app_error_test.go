package middleware

import (
    "testing"
    "net/http"
    "io"
    "net/http/httptest"
    "porkoldman/core"
    "encoding/json"
    "strings"
    "fmt"
)


func TestAppError_Error(t *testing.T) {
    handler := func(w http.ResponseWriter, r *http.Request) {
        io.WriteString(w, "<html><body>Hello World!</body></html>")
    }
    req := httptest.NewRequest("GET", "http://example.com/foo", nil)
    w := httptest.NewRecorder()
    handler(w, req)

    //-------------normal test
    appError := NewAppError(core.AppErrorExceptionStatus, "It is a test for exception error", req)
    object := AppError{}
    errorString, err := appError.Error()
    if err != nil {
        t.Fatalf("Test AppError.Error failed, get error: %s", err.Error())
    }
    err = json.Unmarshal([]byte(errorString), &object)
    if err != nil {
        t.Fatalf("Test AppError.Error failed, get error: %s", err.Error())
    }
    if object.Status != core.AppErrorExceptionStatus {
        t.Errorf("Test AppError.Error failed, no get expect status")
    }
    if object.HostName != "example.com" {
        t.Errorf("Test AppError.Error failed, no get expect host name")
    }
    if strings.Contains(object.UserIP, "192.0.2.1:1234") != true{
        t.Errorf("Test AppError.Error failed, no get expect user ip")
    }
    if object.Summary != "It is a test for exception error" {
        t.Errorf("Test AppError.Error failed, no get expect summary")
    }

    //-------------empty test
    empty := AppError{}
    appError = &AppError{}
    object = AppError{}
    errorString, err = appError.Error()
    err = json.Unmarshal([]byte(errorString), &object)
    fmt.Println(object)
    if  fmt.Sprintf("%s", object) != fmt.Sprintf("%s", empty){
        t.Errorf("Test AppError.Error failed in empty test, no get expect output")
    }
}
