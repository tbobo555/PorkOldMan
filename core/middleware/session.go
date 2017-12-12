package middleware

import (
    "time"
    "errors"
)

// 類別session，定義session的資料格式
type Session struct {
    // session id
    ID string
    // 將session相關資訊儲存至cookie的設置
    Option *Option
    // session的資料
    Values map[string]string
    // server所創建的sesssion管理者
    manager *SessionManager
    // session的存活時間
    life time.Time
}

// 儲存session的異動，會使用manager來保存異動
func (s *Session) Save() error {
    if s.Option == nil {
        return errors.New("option no setting")
    }
    if s.manager == nil {
        return errors.New("manager no setting")
    }

    if s.Option.MaxAge < 0 {
        err :=s.manager.Delete(s)
        if err != nil {
            return err
        }
        return nil
    }
    err := s.manager.Save(s)
    if err == nil {
        return err
    }
    return nil
}

type Option struct {
    Path   string // only this domain/path can get cookie, if no set then use default setting with browser
    Domain string // only this domain can get cookie, if no set then use default setting with browser
    MaxAge   int // cookie's life time, set 0 => last until browser close, set < 0 => delete it now
    Secure   bool // set true => https or wss only
    HttpOnly bool // set true => javascript can't get it.
}
