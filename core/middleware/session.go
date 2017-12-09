package middleware

import (
    "time"
    "path/filepath"
    "errors"
    "fmt"
    "github.com/satori/go.uuid"
    "porkoldman/core"
    "porkoldman/core/config"
    "net/http"
)

type SessionCodec struct {
    codec Codec
}

type SessionStorage struct {
    ID string
    Name string
    Values map[string]string
    Option Option
    Life time.Time
}


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
        Name: session.Name,
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
        Name: storage.Name,
        Values: storage.Values,
        Option: &storage.Option,
        manager: nil,
        life: storage.Life,
    }
    return result, nil
}

type SessionStore interface {
    Get(q string) (Session, error)
    Save(w http.ResponseWriter, s *Session) error
    Delete(q string) error
}

type StoreFile struct {
    path string
    handler *FileHandler
    codec *SessionCodec
}

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

func (f *StoreFile) Save(w http.ResponseWriter, s *Session) error {
    if s == nil || s.Option == nil {
        return errors.New("input session is nil")
    }
    if s.ID == "" || len(s.ID) > 512{
        return errors.New("invalid session id")
    }
    if w == nil {
        return errors.New("invalid response writer")
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
    http.SetCookie(w, NewCookie(s.Name, s.ID, s.Option))
    return nil
}

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

func NewSessionManager() *SessionManager {
    return &SessionManager{
        store: &StoreFile{
            path: config.SessionPath,
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


type SessionManager struct {
    store SessionStore
    sessions map[string] *Session
    Option *Option
    life time.Time
}

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

func (s *SessionManager) Save(w http.ResponseWriter, sess *Session) error {
    if w == nil || sess == nil{
        return errors.New("invalid input")
    }
    if sess.ID == "" || len(sess.ID) > 512{
        return errors.New("invalid session id")
    }
    if s.store == nil {
        return errors.New("store not setting")
    }
    err := s.store.Save(w, sess)
    if err != nil {
        return err
    }
    s.sessions[sess.ID] = sess
    return nil
}

func (s *SessionManager) New(w http.ResponseWriter, name string) (Session, error) {
    if s.store == nil {
        return Session{}, errors.New("store not setting")
    }
    if s.Option == nil {
        return Session{}, errors.New("Option not setting")
    }
    if w == nil {
        return Session{}, errors.New("invalid response writer")
    }

    id := uuid.NewV4().String()
    data := &core.CommonHashData {
        Content: id,
        Key: config.SessionIdSalt,
    }
    shaCodec := NewSha512Codec()
    sid, err := shaCodec.Encode(data)
    if err != nil {
        return Session{}, err
    }
    if _, ok := s.sessions[sid]; ok {
        return Session{}, errors.New("get invalid session id")
    }
    s.sessions[sid] = &Session{
        ID: sid,
        Name: name,
        Option: s.Option,
        Values: make(map[string]string),
        manager: s,
        life: s.life,
    }
    err = s.store.Save(w, s.sessions[sid])
    if err != nil {
        delete(s.sessions, sid)
        return Session{}, err
    }
    return *s.sessions[sid], nil
}

type Session struct {
    ID string
    Name string
    Option *Option
    Values map[string]string
    manager *SessionManager
    life time.Time
}

func (s *Session) Save(w http.ResponseWriter) error {
    if w == nil {
        return errors.New("get nil response writer")
    }
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
    err := s.manager.Save(w, s)
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

func NewCookie(name, value string, option *Option) *http.Cookie {
    cookie := &http.Cookie{
        Name:     name,
        Value:    value,
        Path:     option.Path,
        Domain:   option.Domain,
        MaxAge:   option.MaxAge,
        Secure:   option.Secure,
        HttpOnly: option.HttpOnly,
    }
    if option.MaxAge > 0 {
        d := time.Duration(option.MaxAge) * time.Second
        cookie.Expires = time.Now().Add(d)
    } else if option.MaxAge < 0 {
        // Set it to the past to expire now.
        cookie.Expires = time.Unix(1, 0)
    }
    return cookie
}
