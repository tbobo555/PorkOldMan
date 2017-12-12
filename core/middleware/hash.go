package middleware

import (
    "porkoldman/core/interface"
    "errors"
    "crypto/sha512"
    "fmt"
)

// 類別Sha512Hash，用sha512將資料做不可逆加密
type Sha512Hash struct {
    Encoder _interface.Serializer
}

// 取得一Sha512Hash物件
func NewSha512Hash() *Sha512Hash {
    return &Sha512Hash{
        Encoder: &GobEncoder{},
    }
}

// 用sha512加密
func (c *Sha512Hash) Hash(value interface{}) (string, error) {
    var empty interface{}
    if value == nil || value == empty {
        return "", errors.New("nil value input")
    }
    b, err := c.Encoder.Serialize(value)
    if err != nil {
        return "", err
    }
    if len(b) > 1024 {
        return "", errors.New("too large bytes")
    }
    sha := sha512.Sum512_256(b)
    return fmt.Sprintf("%x", sha), nil
}
