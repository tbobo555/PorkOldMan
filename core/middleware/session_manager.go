package middleware

import (
    "errors"
    "github.com/satori/go.uuid"
    "porkoldman/core"
    "time"
    "porkoldman/core/config"
    "porkoldman/core/interface"
)

// 物件SessionManager，管理server的session
// 可執行 創建/刪除/更改session 的指令
type SessionManager struct {
    // 儲存session的儲存載具
    store SessionStore
    // 儲存在server 's memory的快取session
    sessions map[string] *Session
    // 創建session的預設配置
    Option *Option
    // 創建session的預設存活時間
    life time.Time
}

// 取得指定session id的session物件
func (s *SessionManager) Get(id string) (Session, error) {
    if id == "" || len(id) > 512 {
        return Session{}, errors.New("invalid id")
    }
    if val, ok := s.sessions[id]; ok {
        return *val, nil
    }
    if s.store == nil {
        return Session{}, errors.New("store not setting")
    }
    data, err := s.store.Get(id)
    if err != nil {
        return Session{}, err
    }
    data.manager = s
    s.sessions[id] = &data
    return data, nil
}

// 刪除指定session id的session物件
func (s *SessionManager) Delete(sess *Session) error {
    if sess == nil || sess.ID == "" || len(sess.ID) > 512 {
        return errors.New("invalid session input")
    }
    if s.store == nil {
        return errors.New("store not setting")
    }
    err := s.store.Delete(sess.ID)
    if err != nil {
        return err
    }
    delete(s.sessions, sess.ID)
    return nil
}

// 將session的異動保存
func (s *SessionManager) Save(sess *Session) error {
    if sess == nil{
        return errors.New("invalid input")
    }
    if sess.ID == "" || len(sess.ID) > 512{
        return errors.New("invalid session id")
    }
    if s.store == nil {
        return errors.New("store not setting")
    }
    err := s.store.Save(sess)
    if err != nil {
        return err
    }
    s.sessions[sess.ID] = sess
    return nil
}

// 創建一組新的session
func (s *SessionManager) New() (Session, error) {
    if s.store == nil {
        return Session{}, errors.New("store not setting")
    }
    if s.Option == nil {
        return Session{}, errors.New("Option not setting")
    }

    id := uuid.NewV4().String()
    salt, err := core.MakeRandomContext(8)
    if err != nil {
        return Session{}, err
    }
    data := &core.CommonHashData {
        Content: id,
        Key: salt,
    }
    sha512Hash := NewSha512Hash()
    sid, err := sha512Hash.Hash(data)
    if err != nil {
        return Session{}, err
    }
    if _, ok := s.sessions[sid]; ok {
        return Session{}, errors.New("get invalid session id")
    }
    s.sessions[sid] = &Session{
        ID: sid,
        Option: s.Option,
        Values: make(map[string]string),
        manager: s,
        life: s.life,
    }
    err = s.store.Save(s.sessions[sid])
    if err != nil {
        delete(s.sessions, sid)
        return Session{}, err
    }
    return *s.sessions[sid], nil
}

// 類別SessionCodec，將session物件加密與解密
type SessionCodec struct {
    codec _interface.Codec
}

// 類別SessionStorage，用以將session保存至第三方儲存器(非server's memory的儲存器)時，所承接的載具
type SessionStorage struct {
    ID string
    Values map[string]string
    Option Option
    Life time.Time
}

// SessionCodec.Encode 此方法用來將session加密成一組字串
func (s *SessionCodec) Encode(session *Session) (string, error) {
    if session == nil {
        return "", errors.New("get nil input")
    }
    if session.ID == "" || len(session.ID) > 512{
        return "", errors.New("get invalid session id")
    }
    if session.Option == nil {
        return "", errors.New("get nil session option")
    }
    if s.codec == nil {
        return "", errors.New("codec not setting")
    }
    storage := &SessionStorage{
        ID: session.ID,
        Values: session.Values,
        Option: *session.Option,
        Life: session.life,
    }
    result, err := s.codec.Encode(storage)
    if err != nil {
        return "", err
    }
    return result, nil
}

// 將被加密的字串做解密，會回傳一組解密後的session物件
func (s *SessionCodec) Decode(input string) (*Session, error) {
    if input == "" {
        return nil, errors.New("get empty input")
    }
    if s.codec == nil {
        return nil, errors.New("codec not setting")
    }
    storage := &SessionStorage{}
    err := s.codec.Decode(input, storage)
    if err != nil {
        return nil, err
    }
    result := &Session{
        ID: storage.ID,
        Values: storage.Values,
        Option: &storage.Option,
        manager: nil,
        life: storage.Life,
    }
    return result, nil
}

// 創建一組預設參數的SessionManager物件
func NewSessionManager() *SessionManager {
    return &SessionManager{
        store: &StoreFile{
            path: config.SessionPathForService,
            handler: &FileHandler{},
            codec: &SessionCodec{
                codec: NewAesCbcCodec(),
            },
        },
        sessions: make(map[string] *Session),
        Option: &Option{
            Path:   "/",
            MaxAge: 0,
            Secure: false,
            HttpOnly: true,
        },
        life: time.Now().UTC(),
    }
}
