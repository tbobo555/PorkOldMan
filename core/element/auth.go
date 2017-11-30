package element

import (
    "porkoldman/core"
    "porkoldman/core/config"
    "encoding/json"
    "fmt"
    "crypto/sha256"
    "strings"
)

// 類別Auth，處理與驗證相關的操作與資料
type Auth struct {

}

// 產生訪客身份遊玩(Guest)使用者的JWT
// Token組成方式為 body.sign ，body使用AES CBC加密，sign使用sha256加密
func (a *Auth) MakeGuestUserToken(id string) string {
    idData := &core.IdData{Id: id,}
    encodeIdJson, err := json.Marshal(idData)
    if err != nil {
        //todo: error here
    }

    body, err := a.encodeBodyWithAes([]byte(config.GuestUserIdEncodeKey), []byte(core.DefaultPadding), encodeIdJson)
    if err != nil {
        //todo: error here
    }

    sign, err := a.makeSignWithSha256(config.GuestTokenKey, body)
    if err != nil {
        //todo: error here
    }

    return body + "." + sign
}

// 驗證訪客使用者的JWT
func (a *Auth) VerifyGuestTokenData(token string) bool{
    splitString := strings.Split(token, ".")
    if len(splitString) != 2 {
        // todo: error here
        return false
    }
    body := splitString[0]
    sign := splitString[1]

    bodyString, err := a.decodeBodyWithAes([]byte(config.GuestUserIdEncodeKey), []byte(core.DefaultPadding), []byte(body))
    if err != nil {
        //todo: error here
    }

    idData := &core.IdData{}
    err = json.Unmarshal([]byte(bodyString), idData)
    if err != nil {
        //todo: error here
        return false
    }

    realSign, err := a.makeSignWithSha256(config.GuestTokenKey, body)
    if err != nil {
        //todo: error here
    }
    if strings.Compare(realSign, sign) != 0 {
        //todo: error here
        return false
    }

    return true
}

// 用AES加密JWT的body
func (a *Auth) encodeBodyWithAes(key, padding, data []byte) (string, error){
    aesHandler := NewAesHandler(key, padding)
    hexData, err := aesHandler.CBCEncrypt(data, true)
    if err != nil {
        //todo: error here
        return "", err
    }
    return fmt.Sprintf("%x", hexData), nil
}

// 用AES解密JWT的body
func (a * Auth) decodeBodyWithAes(key, padding, data []byte) (string, error) {
    aesHandler := NewAesHandler(key, padding)
    realData, err := aesHandler.CBCDecrypt(data)
    if err != nil {
        // todo: error here
        return "", err
    }
    return fmt.Sprintf("%s", realData), nil
}

// 用sha256製作JWT的簽名
func (a *Auth) makeSignWithSha256(key, body string) (string, error){
    hashData := &core.CommonHashData{
        Content: body,
        Key: key,
    }

    jsonHashData, err := json.Marshal(hashData)
    if err != nil {
        //todo: error here
        return "", err
    }
    sign := fmt.Sprintf("%x", sha256.Sum256(jsonHashData))
    return sign, nil
}
