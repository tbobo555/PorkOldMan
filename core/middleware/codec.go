package middleware

import (
    "io"
    "fmt"
    "strings"
    "errors"
    "crypto/cipher"
    "crypto/rand"
    "crypto/aes"
    "encoding/hex"
    "porkoldman/core"
    "porkoldman/core/config"
    "porkoldman/core/interface"
)

// 類別AesCbcCodec，使用AES CBC來做資料的加解密
type AesCbcCodec struct {
    Key string
    Padding string
    Encoder _interface.Serializer
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
