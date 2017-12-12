package middleware

import (
    "porkoldman/core"
    "porkoldman/core/config"
    "errors"
    "strings"
    "porkoldman/core/interface"
)

// 用預設設定創建一個token物件
func NewTokenManager() *TokenManager {
    return &TokenManager{
        Codec: NewAesCbcCodec(),
        Hash: NewSha512Hash(),
        Salt: config.DefaultHashSalt,
    }
}

// 類別Token，用以驗證使用者身份與資訊
// 此類別的Token結構是參考JSON Web Token之格式
// 分成三個部分 type + message + sign
// type: message解密後的序列化的格式，例如json, gob ,text...etc.
// message: 一組序列化後的字串，通常是一些能代表該使用者的id或其他資訊
// sign: 一組hash過的簽名檔，用以驗證身份與資料的正確性
type Token struct {
    Type string
    Message string
    Sign string
}

// 類別TokenManager，是server用來管理的token的物件
// 可以創建/加密/解密/驗證token資訊
type TokenManager struct {
    Codec _interface.Codec
    Hash _interface.Hash
    Salt string
}

// 創建一個Token物件
func (m *TokenManager) New(msg, typ string) (*Token, error) {
    if typ != core.JsonTokenType && typ != core.TextTokenType {
        return &Token{}, errors.New("invalid token type")
    }
    if msg == "" {
        return &Token{}, errors.New("message can't empty")
    }
    concat := config.DefaultTokenConcat
    if strings.Contains(msg, concat) == true {
        return &Token{}, errors.New("token's Message can't include concat symbol")
    }
    hashData := &core.CommonHashData {
        Content: typ + msg,
        Key: m.Salt,
    }
    sign, err := m.Hash.Hash(hashData)
    if err != nil {
        return &Token{}, err
    }
    if strings.Contains(sign, concat) == true {
        return &Token{}, errors.New("token's sign can't include concat symbol")
    }
    return &Token{
        Type: typ,
        Message: msg,
        Sign: sign,
    }, nil
}

// 將token編碼，串接格式為 type + concat symbol + message + concat symbol + sign
// concat symbol定義在config裡，token內不能含有此符號
// type與message會被codec加密後再進行串接
func (m *TokenManager) Encode(t *Token) (string, error) {
    if t.Type != core.JsonTokenType && t.Type != core.TextTokenType {
        return "", errors.New("encode token with an invalid token type")
    }
    if t.Message == "" || t.Sign == "" {
        return "", errors.New("encode token with an empty token object")
    }
    concat := config.DefaultTokenConcat
    if strings.Contains(t.Message, concat) == true {
        return "", errors.New("token's message can't include concat symbol")
    }
    if strings.Contains(t.Sign, concat) == true {
        return "", errors.New("token's sign can't include concat symbol")
    }
    encodeType, err := m.Codec.Encode(t.Type)
    if err != nil {
        return "", err
    }
    encodeMessage, err := m.Codec.Encode(t.Message)
    if err != nil {
        return "", err
    }
    return encodeType + concat + encodeMessage + concat + t.Sign, nil
}

// 將加密後的token string做解密，並將原Token物件回傳
func (m *TokenManager) Decode(s string) (*Token, error) {
    concat := config.DefaultTokenConcat
    if strings.Contains(s, concat) != true {
        return &Token{}, errors.New("invalid input, it is not a token string")
    }
    data := strings.Split(s , concat)
    if len(data) != 3 {
        return &Token{}, errors.New("invalid input, it is not a token string")
    }
    encodeType := data[0]
    encodeMessage := data[1]
    sign := data[2]
    var typ, msg string
    err := m.Codec.Decode(encodeType, &typ)
    if err != nil {
        return &Token{}, err
    }
    err = m.Codec.Decode(encodeMessage, &msg)
    if err != nil {
        return &Token{}, err
    }
    return &Token{
        Type: typ,
        Message: msg,
        Sign: sign,
    }, nil
}

// 驗證Token是否合法，驗證方式為檢查Sign是否符合hash的結果
func (m *TokenManager) Verify(t *Token) (bool, error) {
    if t.Type != core.JsonTokenType && t.Type != core.TextTokenType {
        return false, nil
    }
    if  t.Message == "" || t.Sign == "" {
        return false, nil
    }
    hashData := &core.CommonHashData {
        Content: t.Type + t.Message,
        Key: m.Salt,
    }
    validSign, err := m.Hash.Hash(hashData)
    if err != nil {
        return false, err
    }
    if validSign != t.Sign {
        return false, nil
    }
    return true, nil
}
