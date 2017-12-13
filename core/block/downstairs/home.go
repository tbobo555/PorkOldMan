package downstairs

import (
    "net/http"
    "porkoldman/core/middleware"
    "porkoldman/core"
    "porkoldman/core/middleware/tokens"
    "porkoldman/core/middleware/sessions"
    "errors"
)

// 類別downstairs.HOME用來載入此頁面的相關資源
type Home struct {
    response map[interface{}] interface{}
}

// 載入downstairs主頁面所需要的動態資源
func (h *Home) Load(writer http.ResponseWriter, request *http.Request) (int, error) {
    isValidCookie := h.checkSessionIdCookie(request)
    var session middleware.Session
    var err error
    if isValidCookie == false {
        core.DeleteCookie(writer, core.SessionIdCookieName)
        session, err = sessions.Manager.New()
        if err != nil {
            return http.StatusInternalServerError, err
        }
        cookieToken, err := tokens.Manager.New(session.ID, core.TextTokenType)
        if err != nil {
            return http.StatusInternalServerError, err
        }
        encodedText, err := tokens.Manager.Encode(cookieToken)
        if err != nil {
            return http.StatusInternalServerError, err
        }
        cookie := core.NewCookie(core.SessionIdCookieName, encodedText, session.Option.Path, session.Option.Domain,
            session.Option.MaxAge, session.Option.Secure, session.Option.HttpOnly)
        http.SetCookie(writer, cookie)
    } else {
        cookie, err := request.Cookie(core.SessionIdCookieName)
        if err != nil {
            return http.StatusInternalServerError, err
        }
        token, err := tokens.Manager.Decode(cookie.Value)
        if err != nil {
            return http.StatusInternalServerError, err
        }
        session, err = sessions.Manager.Get(token.Message)
        if err != nil {
            return http.StatusInternalServerError, err
        }
    }
    socketToken, err := core.MakeRandomContext(32)
    if err != nil {
        return http.StatusInternalServerError, err
    }
    var randName string
    for {
        randName, err = core.MakeRandomContext(8)
        if err != nil {
            return http.StatusInternalServerError, err
        }
        if _, ok := session.Values[randName]; !ok {
            break
        }
    }
    session.Values[randName] = socketToken
    err = session.Save()
    if err != nil {
        return http.StatusInternalServerError, err
    }
    h.response = make(map[interface{}] interface{})
    h.response["SocketToken"] = socketToken
    return http.StatusOK, nil
}

// 取得動態資源
func (h *Home) Response() (map[interface{}] interface{}, error) {
    if h.response == nil {
        return nil, errors.New("no response")
    }
    return h.response, nil
}

// 檢查存放session id的cookie內容是否合法
func (h *Home) checkSessionIdCookie(request *http.Request) bool {
    cookieToken, err := request.Cookie(core.SessionIdCookieName)
    if err == http.ErrNoCookie || cookieToken == nil || cookieToken.Value == "" {
        return false
    }
    token, err := tokens.Manager.Decode(cookieToken.Value)
    if err != nil {
        return false
    }
    isValid, err := tokens.Manager.Verify(token)
    if  err != nil || isValid != true {
        return false
    }
    if isValid == true {
        _, err := sessions.Manager.Get(token.Message)
        if err != nil {
            return false
        }
    }
    return true
}
