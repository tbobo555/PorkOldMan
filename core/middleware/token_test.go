package middleware

import (
    "testing"
    "porkoldman/core"
    "reflect"
    "porkoldman/core/config"
)


func TestTokenManager(t *testing.T) {
    tm := NewTokenManager()
    _, err := tm.New("", "invalid type")
    if err == nil {
        t.Errorf("Error Test TokenManager.New, invalid type, but no get error")
    }
    _, err = tm.New("", core.TextTokenType)
    if err == nil {
        t.Errorf("Error Test TokenManager.New, invalid message, but no get error")
    }
    token, err := tm.New("a secret message", core.TextTokenType)
    if err != nil {
        t.Errorf("Error Test TokenManager.New, get error: %s", err.Error())
    }
    hashData := &core.CommonHashData {
        Content: token.Type + token.Message,
        Key: tm.Salt,
    }
    expectedSign, err := tm.Hash.Hash(hashData)
    if err != nil {
        t.Errorf("Error Test TokenManager.Encode, get error: %s", err.Error())
    }
    if expectedSign != token.Sign {
        t.Errorf("Error Test TokenManager.Encode, get unexpected result")
    }
    tokenEncodeString, err := tm.Encode(token)
    if err != nil {
        t.Errorf("Error Test TokenManager.Encode, get error: %s", err.Error())
    }
    var expectedToken *Token
    expectedToken, err = tm.Decode(tokenEncodeString)
    if err != nil {
        t.Errorf("Error Test TokenManager.Decode, get error: %s", err.Error())
    }
    if reflect.DeepEqual(expectedToken, token) != true {
        t.Errorf("Error Test TokenManager.Decode, get unexpected result")
    }
    valid, err := tm.Verify(token)
    if err != nil {
        t.Errorf("Error Test TokenManager.Verify, get error: %s", err.Error())
    }
    if valid != true {
        t.Errorf("Error Test TokenManager.Verify, get unexpected result")
    }
    token.Sign = "invalid sign"

    valid, err = tm.Verify(token)
    if err != nil {
        t.Errorf("Error Test TokenManager.Verify, get error: %s", err.Error())
    }
    if valid == true {
        t.Errorf("Error Test TokenManager.Verify, get unexpected result")
    }
    token.Type = "invalid type"
    _, err = tm.Encode(token)
    if err == nil {
        t.Errorf("Error Test TokenManager.Encode, invalid type, but no get error")
    }
    token.Type = core.TextTokenType
    token.Message = ""
    _, err = tm.Encode(token)
    if err == nil {
        t.Errorf("Error Test TokenManager.Encode, invalid message, but no get error")
    }
    token.Message = config.DefaultTokenConcat
    _, err = tm.Encode(token)
    if err == nil {
        t.Errorf("Error Test TokenManager.Encode, message has concat symbol, but no get error")
    }
    _, err = tm.Decode("invalid string")
    if err == nil {
        t.Errorf("Error Test TokenManager.Decode, input string has no concat symbol, but no get error")
    }
    token.Type = "invalid type"
    valid, err = tm.Verify(token)
    if err != nil {
        t.Errorf("Error Test TokenManager.Verify, get error: %s", err.Error())
    }
    if valid == true {
        t.Errorf("Error Test TokenManager.Verify, get unexpected result")
    }
    token.Type = core.TextTokenType
    token.Message = ""
    _, err = tm.Verify(token)
    if err != nil {
        t.Errorf("Error Test TokenManager.Verify,  get error: %s", err.Error())
    }
    if valid == true {
        t.Errorf("Error Test TokenManager.Verify, get unexpected result")
    }
}
