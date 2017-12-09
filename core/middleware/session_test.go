package middleware

import (
    "testing"
    "net/http"
    "net/http/httptest"
    "bytes"
    "reflect"
    "time"
    "fmt"
)

func NewRecorder() *httptest.ResponseRecorder {
    return &httptest.ResponseRecorder{
        HeaderMap: make(http.Header),
        Body:      new(bytes.Buffer),
    }
}

func TestNewSession(t *testing.T) {
    var rsp *httptest.ResponseRecorder
    rsp = NewRecorder()
    sm := NewSessionManager()
    sess, err := sm.New(rsp, "test session")
    if err != nil {
        t.Fatalf("Fatal Error Test SessionManager.New, get error: %s", err.Error())
    }
    sess.Option.MaxAge = 600
    sess.Option.Domain = "www.ggg.com"
    sess.Values["a13"] = "it is a text for testing"
    err = sess.Save(rsp)
    if err != nil {
        t.Fatalf("Fatal Error Test SessionManager.Save, get error: %s", err.Error())
    }
    result, err := sm.Get(sess.ID)
    if err != nil {
        t.Fatalf("Fatal Error Test SessionManager.Get, get error: %s", err.Error())
    }
    if result.ID != sess.ID {
        t.Errorf("Error Test SessionManager.Get, get unexpected result")
    }
    if result.Name != sess.Name {
        t.Errorf("Error Test SessionManager.Get, get unexpected result")
    }
    if result.Option.MaxAge != 600 {
        t.Errorf("Error Test SessionManager.Get, get unexpected result")
    }
    if result.Option.Domain != "www.ggg.com" {
        t.Errorf("Error Test SessionManager.Get, get unexpected result")
    }
    if result.Values["a13"] != "it is a text for testing" {
        t.Errorf("Error Test SessionManager.Get, get unexpected result")
    }
    if result.life != sess.life {
        t.Errorf("Error Test SessionManager.Get, get unexpected result")
    }
    sess.Option.MaxAge = -1
    err = sess.Save(rsp)
    if err != nil {
        t.Fatalf("Fatal Error Test SessionManager.Save for delete session, get error: %s", err.Error())
    }
    result, err = sm.Get(sess.ID)
    if err == nil {
        t.Errorf("Error Test SessionManager.Get for removed session, but no get error")
    }
}

func TestGetSessionFromFile(t *testing.T) {
    expectOption := &Option{
        Path: "/",
        Domain: "www.ggg.com",
        MaxAge: 600,
        Secure: false,
        HttpOnly: true,
    }
    expectName := "test session"
    expectId := "016960e8e82569af0397b68eb6570e1e040e08f40a052e3fedabb7551b70dbe9"
    sm := NewSessionManager()
    sess, err := sm.Get("for_unit_test")
    if err != nil {
        t.Fatalf("Fatal Error Test SessionManager.Get from, get error: %s", err.Error())
    }
    if sess.manager != sm {
        t.Errorf("Error Test SessionManager.Get from file, get unexpected result")
    }
    if reflect.DeepEqual(sess.Option, expectOption) != true {
        t.Errorf("Error Test SessionManager.Get from file, get unexpected result")
    }
    if sess.ID != expectId {
        t.Errorf("Error Test SessionManager.Get from file, get unexpected result")
    }
    if sess.Name != expectName {
        t.Errorf("Error Test SessionManager.Get from file, get unexpected result")
    }
}

func TestSessionCodec_Encode(t *testing.T) {
    sc := &SessionCodec{}
    session := &Session{}
    _, err := sc.Encode(nil)
    if err == nil {
        t.Errorf("Error Test SessionCodec.Encode, nil input, but no get error")
    }
    _, err = sc.Encode(session)
    if err == nil {
        t.Errorf("Error Test SessionCodec.Encode, empty session input, but no get error")
    }
    session.ID = "123"
    _, err = sc.Encode(session)
    if err == nil {
        t.Errorf("Error Test SessionCodec.Encode, empty session input, but no get error")
    }
    session = &Session{
        ID: "test ID",
        Name: "test Name",
        Values: make(map[string] string),
        Option:&Option{
            Path:   "/",
            MaxAge: 0,
            Secure: false,
            HttpOnly: true,
        },
        life: time.Now().UTC(),
    }
    result, err := sc.Encode(session)
    if err == nil {
        t.Errorf("Error Test SessionCodec.Encode, empty codec, but no get error")
    }
    sc.codec = &AesCbcCodec {
        Key: "1234567890abcdef",
        Padding: "=",
        Encoder: &GobEncoder{},
    }
    result, err = sc.Encode(session)
    if err != nil {
        t.Errorf("Error Test SessionCodec.Encode, get error %s", err.Error())
    }
    dst, err := sc.Decode(result)
    if err != nil {
        t.Errorf("Error Test SessionCodec.Encode, can't decode result, get error %s", err.Error())
    }
    if reflect.DeepEqual(dst, session) != true {
        t.Errorf("Error Test SessionCodec.Encode, get unexpexted result.")
    }
}

func TestSessionCodec_Decode(t *testing.T) {
    sc := &SessionCodec{}
    _, err := sc.Decode("")
    if err == nil {
        t.Errorf("Error Test SessionCodec.Decode, empty string input, but no get error")
    }
    _, err = sc.Decode("some key")
    if err == nil {
        t.Errorf("Error Test SessionCodec.Decode, empty codec, but no get error")
    }
}

func TestStoreFile_Get(t *testing.T) {
    sf := &StoreFile{}
    _, err := sf.Get("")
    if err == nil {
        t.Errorf("Error Test StoreFile.Get, empty string input, but no get error")
    }
    longInput, err := MakeRandomContext(513)
    if err != nil {
        t.Errorf("Error Test StoreFile.Get, can't get long input to test, get error: %s", err.Error())
    }
    _, err = sf.Get(longInput)
    if err == nil {
        t.Errorf("Error Test StoreFile.Get, long string input, but no get error")
    }
    _, err = sf.Get("noraml input string")
    if err == nil {
        t.Errorf("Error Test StoreFile.Get, empty codec and handler, but no get error")
    }
}

func TestStoreFile_Save(t *testing.T) {
    sf := &StoreFile{}
    err := sf.Save(nil, nil)
    if err == nil {
        t.Errorf("Error Test StoreFile.Get, nil input, but no get error")
    }
    rsp := NewRecorder()
    session := &Session{
        ID: "",
        Name: "test Name",
        Values: make(map[string] string),
        manager: NewSessionManager(),
        Option: &Option{
            Path:   "/",
            MaxAge: 0,
            Secure: false,
            HttpOnly: true,
        },
        life: time.Now().UTC(),
    }
    err =sf.Save(nil, session)
    if err == nil {
        t.Errorf("Error Test StoreFile.Get, invalid session id and nil writer, but no get error")
    }
    session.ID = "it is a test id"
    err =sf.Save(nil, session)
    if err == nil {
        t.Errorf("Error Test StoreFile.Get, nil writer, but no get error")
    }
    err =sf.Save(rsp, session)
    if err == nil {
        t.Errorf("Error Test StoreFile.Get, empty codec and handler, but no get error")
    }
    fmt.Println(err)
}

func TestStoreFile_Delete(t *testing.T) {
    sf := &StoreFile{}
    err := sf.Delete("")
    if err == nil {
        t.Errorf("Error Test StoreFile.Delete, empty string input, but no get error")
    }
    longInput, err := MakeRandomContext(513)
    if err != nil {
        t.Errorf("Error Test StoreFile.Delete, can't get long input to test, get error: %s", err.Error())
    }
    err = sf.Delete(longInput)
    if err == nil {
        t.Errorf("Error Test StoreFile.Delete, long string input, but no get error")
    }
    err = sf.Delete("noraml input string")
    if err == nil {
        t.Errorf("Error Test StoreFile.Delete, empty codec and handler, but no get error")
    }
}