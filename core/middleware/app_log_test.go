package middleware

import (
    "testing"
    "porkoldman/core"
    "os"
    "strings"
)

var RootPath string = "/Users/patrick/Work/Web/Go/src/porkoldman/log/unit_test"
var InfoPath string = RootPath + "/info"
var DebugPath string = RootPath + "/debug"
var ExceptionPath string = RootPath + "/exception"
var AlertPath string = RootPath + "/alert"

func TestAppLog_WriteLog(t *testing.T) {
    err := setup()
    defer teardown()
    if err != nil {
        t.Fatalf("Test AppLog.WriteLog failed, setup env geterror: %s", err.Error())
    }

    appLog := &AppLog{
        RootPath: RootPath,
    }
    fileHandler := &FileHandler{}

    //---------- info test
    fileName := appLog.getLogPath(core.AppErrorInfoStatus)
    err = appLog.WriteLog(core.AppErrorInfoStatus, "this is a log text for info testing.")
    if err != nil {
        t.Errorf("Test AppLog.WriteLog failed in info test, get error: %s", err.Error())
    }
    data, err := fileHandler.ReadFile(fileName)
    if err != nil {
        t.Errorf("Test AppLog.WriteLog failed in info test, get error: %s", err.Error())
    }
    expect := `this is a log text for info testing.
`
    if strings.Compare(string(data), expect) != 0 {
        t.Errorf("Test AppLog.WriteLog failed in info test, no get expect output")
    }

    //---------- debug test
    fileName = appLog.getLogPath(core.AppErrorDebugStatus)
    err = appLog.WriteLog(core.AppErrorDebugStatus, "this is a log text for debug testing.")
    if err != nil {
        t.Errorf("Test AppLog.WriteLog failed in debug test, get error: %s", err.Error())
    }
    data, err = fileHandler.ReadFile(fileName)
    if err != nil {
        t.Errorf("Test AppLog.WriteLog failed in debug test, get error: %s", err.Error())
    }
    expect = `this is a log text for debug testing.
`
    if strings.Compare(string(data), expect) != 0 {
        t.Errorf("Test AppLog.WriteLog failed in debug test, no get expect output")
    }

    //---------- exception test
    fileName = appLog.getLogPath(core.AppErrorExceptionStatus)
    err = appLog.WriteLog(core.AppErrorExceptionStatus, "this is a log text for exception testing.")
    if err != nil {
        t.Errorf("Test AppLog.WriteLog failed in exception test, get error: %s", err.Error())
    }
    data, err = fileHandler.ReadFile(fileName)
    if err != nil {
        t.Errorf("Test AppLog.WriteLog failed in exception test, get error: %s", err.Error())
    }
    expect = `this is a log text for exception testing.
`
    if strings.Compare(string(data), expect) != 0 {
        t.Errorf("Test AppLog.WriteLog failed in exception test, no get expect output")
    }

    //---------- alert test
    fileName = appLog.getLogPath(core.AppErrorAlertStatus)
    err = appLog.WriteLog(core.AppErrorAlertStatus, "this is a log text for alert testing.")
    if err != nil {
        t.Errorf("Test AppLog.WriteLog failed in alert test, get error: %s", err.Error())
    }
    data, err = fileHandler.ReadFile(fileName)
    if err != nil {
        t.Errorf("Test AppLog.WriteLog failed in alert test, get error: %s", err.Error())
    }
    expect = `this is a log text for alert testing.
`
    if strings.Compare(string(data), expect) != 0 {
        t.Errorf("Test AppLog.WriteLog failed in alert test, no get expect output")
    }

    //---------- invalid status name test
    fileName = appLog.getLogPath(core.AppErrorInfoStatus)
    err = appLog.WriteLog("invalid status", "this is a log text for invalid status testing.")
    if err != nil {
        t.Errorf("Test AppLog.WriteLog failed in invalid status test, get error: %s", err.Error())
    }
    data, err = fileHandler.ReadFile(fileName)
    if err != nil {
        t.Errorf("Test AppLog.WriteLog failed in invalid status test, get error: %s", err.Error())
    }
    expect = `this is a log text for info testing.
this is a log text for invalid status testing.
`
    if strings.Compare(string(data), expect) != 0 {
        t.Errorf("Test AppLog.WriteLog failed in invalid status test, no get expect output")
    }
}

func setup() error {
    path := RootPath
    if _, err := os.Stat(path); os.IsNotExist(err) {
        err = os.MkdirAll(path, os.FileMode(0755))
        if err != nil {
            return err
        }
    }

    path = InfoPath
    if _, err := os.Stat(path); os.IsNotExist(err) {
        err =os.MkdirAll(path, os.FileMode(0755))
        if err != nil {
            return err
        }
    }

    path = DebugPath
    if _, err := os.Stat(path); os.IsNotExist(err) {
        err = os.MkdirAll(path, os.FileMode(0755))
        if err != nil {
            return err
        }
    }

    path = ExceptionPath
    if _, err := os.Stat(path); os.IsNotExist(err) {
        err = os.MkdirAll(path, os.FileMode(0755))
        if err != nil {
            return err
        }
    }

    path = AlertPath
    if _, err := os.Stat(path); os.IsNotExist(err) {
        err = os.MkdirAll(path, os.FileMode(0755))
        if err != nil {
            return err
        }
    }

    return nil
}

func teardown() {
    os.RemoveAll(RootPath)
}
