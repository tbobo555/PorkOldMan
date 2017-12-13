package log

import (
    "porkoldman/core/middleware"
    "porkoldman/core/config"
    "porkoldman/core"
    "net/http"
)

func WriteError(status, err string, request *http.Request) {
    switch status {
    case core.AppErrorDebugStatus:
        go AppDebug(err, request)
    case core.AppErrorInfoStatus:
        go AppInfo(err, request)
    case core.AppErrorExceptionStatus:
        go AppException(err, request)
    case core.AppErrorAlertStatus:
        go AppAlert(err, request)
    }
}

func AppDebug(err string, r *http.Request) {
    logger := middleware.AppLog{
        RootPath: config.LogRootPath,
    }
    appError := middleware.NewAppError(core.AppErrorDebugStatus, err, r)
    appErrString, e := appError.Error()
    if e != nil {
        logger.WriteLog(core.AppErrorDebugStatus, e.Error())
    } else {
        logger.WriteLog(core.AppErrorDebugStatus, appErrString)
    }
}

func AppInfo(err string, r *http.Request) {
    logger := middleware.AppLog{
        RootPath: config.LogRootPath,
    }
    appError := middleware.NewAppError(core.AppErrorInfoStatus, err, r)
    appErrString, e := appError.Error()
    if e != nil {
        logger.WriteLog(core.AppErrorInfoStatus, e.Error())
    } else {
        logger.WriteLog(core.AppErrorInfoStatus, appErrString)
    }
}

func AppException(err string, r *http.Request) {
    logger := middleware.AppLog{
        RootPath: config.LogRootPath,
    }
    appError := middleware.NewAppError(core.AppErrorExceptionStatus, err, r)
    appErrString, e := appError.Error()
    if e != nil {
        logger.WriteLog(core.AppErrorExceptionStatus, e.Error())
    } else {
        logger.WriteLog(core.AppErrorExceptionStatus, appErrString)
    }
}

func AppAlert(err string, r *http.Request) {
    logger := middleware.AppLog{
        RootPath: config.LogRootPath,
    }
    appError := middleware.NewAppError(core.AppErrorAlertStatus, err, r)
    appErrString, e := appError.Error()
    if e != nil {
        logger.WriteLog(core.AppErrorAlertStatus, e.Error())
    } else {
        logger.WriteLog(core.AppErrorAlertStatus, appErrString)
    }
}
