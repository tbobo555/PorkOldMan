package downstairs

import (
    "errors"
    "net/http"
    "github.com/gorilla/mux"
    "porkoldman/core"
    "porkoldman/core/middleware/tokens"
    "porkoldman/core/middleware/sessions"
)

// 類別downstairs.IoGame 處理socket的連線請求 /io/game/downstairs/{token} 裡的資源
type IoGame struct {
    response map[interface{}] interface{}
}

// 載入與初始化相關資源
func (i *IoGame) Load(writer http.ResponseWriter, request *http.Request) (int, error) {
    vars := mux.Vars(request)
    if _, ok := vars["token"]; !ok {
        return http.StatusBadRequest, errors.New("bad request")
    }
    cookieTokenText, err := request.Cookie(core.SessionIdCookieName)
    if err != nil {
        return http.StatusBadRequest, errors.New("bad request")
    }
    token, err := tokens.Manager.Decode(cookieTokenText.Value)
    if err != nil {
        return http.StatusBadRequest, errors.New("bad request")
    }
    isValid, err := tokens.Manager.Verify(token)
    if err != nil {
        return http.StatusBadRequest, errors.New("bad request")
    }
    if isValid != true {
        return http.StatusBadRequest, errors.New("bad request")
    }
    session, err := sessions.Manager.Get(token.Message)
    if err != nil {
        return http.StatusBadRequest, errors.New("bad request")
    }
    socketToken := vars["token"]
    isValidSocketToken := false
    for key, val := range session.Values {
        if val == socketToken {
            isValidSocketToken = true
            delete(session.Values, key)
            err = session.Save()
            if err != nil {
                return http.StatusBadRequest, errors.New("bad request")
            }
            break
        }
    }
    if isValidSocketToken != true {
        return http.StatusBadRequest, errors.New("bad request")
    }
    return http.StatusOK, nil
}

// downstairs.IoGame不需要產出網頁的動態檔案
func (i *IoGame) Response() (map[interface{}] interface{}, error) {
    return nil, nil
}
