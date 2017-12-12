package middleware

import (
    "errors"
    "path/filepath"
    "fmt"
)

// 介面SessionStore，定義儲存session的儲存載器的api
// 可依照此介面擴充儲存session的方式
type SessionStore interface {
    // 依照query string來取得session
    Get(q string) (Session, error)
    // 將異動保存至儲存載具裡
    Save(s *Session) error
    // 從儲存載具裡刪除指定的session
    Delete(q string) error
}

// 類別StoreFile，實現介面SessionStore，將session儲存在檔案之中
type StoreFile struct {
    // 儲存session的目錄路徑
    path string
    // 管理檔案的物件
    handler *FileHandler
    // 用來將session加解密的加解密器
    codec *SessionCodec
}

// 輸入一組session id，會將該id的session取出
// 若是找不到，回傳error
func (f *StoreFile) Get(q string) (Session, error) {
    if q == "" {
        return Session{}, errors.New("empty input")
    }
    if len(q) > 512 {
        return Session{}, errors.New("invalid input, string size > max limit size(512)")
    }
    if f.codec == nil || f.handler == nil {
        return Session{}, errors.New("codec or handler not setting")
    }
    filename := filepath.Join(f.path, "F_c2Vzc2lvbg_" + q + ".c2v")
    if f.handler.IsExist(filename) == false {
        return Session{}, errors.New("no such file or directory, " +  filename)
    }
    data, err := f.handler.ReadFile(filename)
    if err != nil {
        return Session{}, err
    }
    result, err := f.codec.Decode(fmt.Sprintf("%s", data))
    if err != nil {
        return Session{}, err
    }
    return *result, nil
}

// 將session的異動儲存至檔案裡，若是異動不合法會回傳error
func (f *StoreFile) Save(s *Session) error {
    if s == nil || s.Option == nil {
        return errors.New("input session is nil")
    }
    if s.ID == "" || len(s.ID) > 512{
        return errors.New("invalid session id")
    }
    if f.codec == nil || f.handler == nil {
        return errors.New("codec or handler not setting")
    }
    if s.Option.MaxAge < 0 {
        err := f.Delete(s.ID)
        if err != nil {
            return err
        }
        return nil
    }
    filename := filepath.Join(f.path, "F_c2Vzc2lvbg_" + s.ID + ".c2v")
    if f.handler.IsExist(filename) == false {
        err := f.handler.CreateFile(filename)
        if err != nil {
            return err
        }
    }
    data, err := f.codec.Encode(s)
    if err != nil {
        return err
    }
    err = f.handler.CoverFile(filename, data, false)
    if err != nil {
        return err
    }
    return nil
}

// 輸入q指session的id，並從檔案裡刪除指定id的session
func (f *StoreFile) Delete(q string) error {
    if q == "" {
        return errors.New("empty input")
    }
    if len(q) > 512 {
        return errors.New("invalid input, string size > max limit size(512)")
    }
    if f.codec == nil || f.handler == nil {
        return errors.New("codec or handler not setting")
    }
    filename := filepath.Join(f.path, "F_c2Vzc2lvbg_" + q + ".c2v")
    if f.handler.IsExist(filename) == false {
        return errors.New("no such file or directory, " +  filename)
    }
    err := f.handler.DeleteFile(filename)
    if err != nil {
        return err
    }
    return nil
}

