package middleware

import (
    "io"
    "fmt"
    "bytes"
    "strings"
    "errors"
    "crypto/cipher"
    "crypto/rand"
    "crypto/aes"
    "crypto/sha512"
    "encoding/base64"
    "encoding/hex"
    "encoding/gob"
    "porkoldman/core"
    "porkoldman/core/config"
)
// 介面Serializer，資料序列化，其作用是將資料轉換成字串型態的bytes
type Serializer interface {
    Serialize(src interface{}) ([]byte, error)
    Deserialize(src []byte, dst interface{}) error
}

// 類型Gob編碼器，實現介面Serializer，用go語言內建的Gob套件來完成資料序列化
type GobEncoder struct{}

// 使用gob將輸入的物件或資料序列化
func (e *GobEncoder) Serialize(src interface{}) ([]byte, error) {
    var empty interface{}
    if src == nil || src == empty{
        return nil, errors.New("nil src input")
    }
    buf := new(bytes.Buffer)
    enc := gob.NewEncoder(buf)
    if err := enc.Encode(src); err != nil {
        return nil, err
    }
    return buf.Bytes(), nil
}

// 使用gob將序列化後的資料還原成原始物件或資料
func (e *GobEncoder) Deserialize(src []byte, dst interface{}) error {
    var empty interface{}
    if dst ==nil || dst == empty {
        return errors.New("nil dst input")
    }
    if src == nil {
        return errors.New("nil src input")
    }
    dec := gob.NewDecoder(bytes.NewBuffer(src))
    if err := dec.Decode(dst); err != nil {
        return err
    }
    return nil
}


// Codec介面，加解密器，用來將資料加解密
type Codec interface {
    Encode(value interface{}) (string, error)
    Decode(value string, dst interface{}) error
}

// 類別AesCbcCodec，使用AES CBC來做資料的加解密
type AesCbcCodec struct {
    Key string
    Padding string
    Encoder Serializer
}

// 取得一AesCbcCodec的物件。
func NewAesCbcCodec() *AesCbcCodec {
    return &AesCbcCodec{
        Key: config.AESCBCSecretKey,
        Padding: core.DefaultPadding,
        Encoder: &GobEncoder{},
    }
}

// 執行AES的CBC加密
func (c *AesCbcCodec) Encode(value interface{}) (string, error) {
    var empty interface{}
    if value == nil || value == empty {
        return "", errors.New("nil value input")
    }

    b, err := c.Encoder.Serialize(value)
    if err != nil {
        return "", err
    }
    if len(b) % aes.BlockSize != 0 {
        b = c.autoAddPadding(b)
    }
    block, err := aes.NewCipher([]byte(c.Key))
    if err != nil {
        return "", err
    }
    cipherText := make([]byte, aes.BlockSize + len(b))
    iniVector := cipherText[:aes.BlockSize]
    if _, err := io.ReadFull(rand.Reader, iniVector); err != nil {
        return "", err
    }
    cbcMode := cipher.NewCBCEncrypter(block, iniVector)
    cbcMode.CryptBlocks(cipherText[aes.BlockSize:], b)
    return fmt.Sprintf("%x", cipherText), nil
}

// 執行AES的CBC解密
func (c *AesCbcCodec) Decode(value string, dst interface{}) error {
    var empty interface{}
    if dst ==nil || dst == empty {
        return errors.New("nil dst input")
    }
    if value == "" {
        return errors.New("empty value input")
    }

    cipherText, err := hex.DecodeString(value)
    if err != nil {
        return err
    }

    block, err := aes.NewCipher([]byte(c.Key))
    if err != nil {
        return err
    }

    if len(cipherText) < aes.BlockSize {
        return err
    }
    iniVector := cipherText[:aes.BlockSize]
    cipherText = cipherText[aes.BlockSize:]

    if len(cipherText) % aes.BlockSize != 0 {
        return err
    }
    cbcMode := cipher.NewCBCDecrypter(block, iniVector)
    cbcMode.CryptBlocks(cipherText, cipherText)

    serializeString := strings.TrimRight(fmt.Sprintf("%s", cipherText), c.Padding)
    err = c.Encoder.Deserialize([]byte(serializeString), dst)
    if err != nil {
        return err
    }
    return nil
}

// 自動填充，將明文字串填充至可被AES CBC加解密的size
func (c *AesCbcCodec) autoAddPadding(b []byte) []byte{
    s := string(b)
    for {
        if len(s) % aes.BlockSize != 0 {
            s = s + string(c.Padding)
        } else {
            break
        }
    }
    return []byte(s)
}

// 類別Sha512Codec，用sha512將資料做不可逆加密
type Sha512Codec struct {
    Encoder Serializer
}

// 取得一Sha512Codec物件
func NewSha512Codec() *Sha512Codec {
    return &Sha512Codec{
        Encoder: &GobEncoder{},
    }
}

// 用sha512加密
func (c *Sha512Codec) Encode(value interface{}) (string, error) {
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
    salt, err := MakeRandomContext(16)
    if err != nil {
        return "", err
    }
    buf := bytes.NewBuffer([]byte(salt))
    buf.Write(b)
    sha := sha512.Sum512_256(buf.Bytes())
    return fmt.Sprintf("%x", sha), nil
}

// sha512是無法做解密的，因此這裡固定回傳錯誤
func (c *Sha512Codec) Decode(value string, dst interface{}) error {
    return errors.New("sha512 can't decode")
}

// 亂數產生一組字串
func MakeRandomContext(length int) (string, error) {
    if length < 1 {
        return "", errors.New("length input can't less than 1")
    }
    k := make([]byte, length)
    if _, err := io.ReadFull(rand.Reader, k); err != nil {
        return "", err
    }
    return base64.URLEncoding.EncodeToString(k), nil
}
