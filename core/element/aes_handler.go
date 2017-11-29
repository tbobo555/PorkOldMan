package element

import (
    "encoding/hex"
    "crypto/aes"
    "crypto/cipher"
    "crypto/rand"
    "io"
)

// AesHandler類別，用進階加密標準(Advanced Encryption Standard)將資料進行加解密的操作
type AesHandler struct {
    key []byte
    padding []byte
}

// 創建一個AesHandler物件，並指定相關的密鑰與填充
func NewAesHandler (k []byte, p []byte) *AesHandler{
    return &AesHandler{
        key: k,
        padding: p,
    }
}

// 設置AES用來加解密的密鑰
func (a *AesHandler) SetKey(k []byte) {
    a.key = k
}

// 設置填充，若是字元數不夠AES加解密，會以此字符串添加
func (a *AesHandler) SetPadding(p []byte) {
    a.padding = p
}

// 執行AES的CBC加密，輸入一[]byte格式的明文字串，回傳一組加密後的[]byte格式的16進位密文
// 注意，回傳密文的[]byte格式是16進位數值，並非字串
func (a *AesHandler) CBCEncrypt(s []byte, auto bool) ([]byte, error) {
    if len(s) % aes.BlockSize != 0 {
        if auto == true {
            s = a.autoAddPadding(s)
        } else {
            //todo: error here
        }
    }
    block, err := aes.NewCipher(a.key)
    if err != nil {
        panic(err)
    }
    cipherText := make([]byte, aes.BlockSize + len(s))
    iniVector := cipherText[:aes.BlockSize]
    if _, err := io.ReadFull(rand.Reader, iniVector); err != nil {
        //todo: error here
    }

    cbcMode := cipher.NewCBCEncrypter(block, iniVector)
    cbcMode.CryptBlocks(cipherText[aes.BlockSize:], s)

    return cipherText, nil
}

// 執行AES的CBC解密，輸入一組[]byte(16進位密文的"字串"，回傳[]byte格式的明文字串
// 注意，輸入密文的[]byte格式是字串，並非16進位數值
func (a *AesHandler) CBCDecrypt(s []byte) ([]byte, error) {
    cipherText, err := hex.DecodeString(string(s))
    if err != nil {
        //todo: error here
    }

    block, err := aes.NewCipher(a.key)
    if err != nil {
        //todo: error here
    }

    if len(cipherText) < aes.BlockSize {
        //todo: error here
    }
    iniVector := cipherText[:aes.BlockSize]
    cipherText = cipherText[aes.BlockSize:]

    if len(cipherText) % aes.BlockSize != 0 {
        //todo: error here
    }
    cbcMode := cipher.NewCBCDecrypter(block, iniVector)
    cbcMode.CryptBlocks(cipherText, cipherText)

    return cipherText, nil
}

// 自動填充，將明文字串填充至可被AES CBC加解密的size
func (a *AesHandler) autoAddPadding(b []byte) []byte{
    s := string(b)
    for {
        if len(s) % aes.BlockSize != 0 {
            s = s + string(a.padding)
        } else {
            break
        }
    }
    return []byte(s)
}
