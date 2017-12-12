package _interface

// Codec介面，加解密器，用來將資料加解密
type Codec interface {
    Encode(value interface{}) (string, error)
    Decode(value string, dst interface{}) error
}
