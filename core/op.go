package core

import (
    "reflect"
    "encoding/json"
    "bytes"
    "errors"
    "encoding/base64"
    "math/rand"
    "time"
    "net/http"
)

func init() {
    rand.Seed(time.Now().UTC().UnixNano())
}

// 檢查val是否存在array或slice裡面
// 如果有則回傳 true & 陣列索引編號
// 如果沒有則回傳 false & -1
// 所有非法的輸入只會回傳 false & -1，含式不會丟出error
func InArray(val interface{}, array interface{}) (exists bool, index int) {
    exists = false
    index = -1
    if val == nil || array == nil {
        return
    }
    switch reflect.TypeOf(array).Kind() {
    case reflect.Array:
        fallthrough
    case reflect.Slice:
        s := reflect.ValueOf(array)

        for i := 0; i < s.Len(); i++ {
            if reflect.DeepEqual(val, s.Index(i).Interface()) == true {
                index = i
                exists = true
                return
            }
        }
    }
    return
}

// 將json輸入轉成CommonData
// 如果輸入[]byte的格式並非是CommonData，則會回傳error
// 若輸入的[]byte無法被 json.Marshal 處理，回傳error
func DecodeCommonData(s []byte) (*CommonData, error) {
    if s == nil {
        return nil, errors.New("nil input")
    }
    var result, empty CommonData
    err := json.Unmarshal(s, &result)
    if err != nil {
        return nil, err
    }
    // 如果結果是empty，需要檢查輸入資料的格式是否為CommonData格式
    // 因為 json.Unmarshal 當輸入無法解讀的格式，會回傳空的CommonData
    if result == empty {
        resultByte, err := json.Marshal(result)
        if err != nil {
            return nil, err
        }
        // 不相等代表輸入s的資料並非屬於CommonData格式
        if bytes.Compare(resultByte, s) != 0{
            return nil, errors.New("bytes of input isn't a type of CommonData")
        }
    }
    return &result, nil
}

// 將CommonData做成json
func EncodeCommonDada(data *CommonData) ([]byte, error) {
    result, err := json.Marshal(data)
    if err != nil {
        return nil, err
    }
    return result, nil
}

// 亂數產生一組指定長度的字串，該長度介於1~1024間
func MakeRandomContext(length int) (string, error) {
    if length < 1 {
        return "", errors.New("length input can't less than 1")
    }
    if length > 1024 {
        return "", errors.New("length input can't more than 1024")
    }
    lower := "abcdefghijklmnopqrstuvwxyz"
    upper := "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    digit := "0123456789"
    all := lower + upper + digit
    lenAll := len(all)
    k := make([]byte, length)
    for i := 0; i < length; i++ {
        b := all[rand.Intn(lenAll)]
        k[i] = b
    }
    return base64.URLEncoding.EncodeToString(k), nil
}

// 產生一組cookie物件
func NewCookie(name, value, path, domain string, maxAge int, secure, httpOnly bool) *http.Cookie {
    cookie := &http.Cookie {
        Name:     name,
        Value:    value,
        Path:     path,
        Domain:   domain,
        MaxAge:   maxAge,
        Secure:   secure,
        HttpOnly: httpOnly,
    }
    if maxAge > 0 {
        d := time.Duration(maxAge) * time.Second
        cookie.Expires = time.Now().Add(d)
    } else if maxAge < 0 {
        cookie.Expires = time.Unix(1, 0)
    }
    return cookie
}

// 從server刪除client端的一組cookie
func DeleteCookie (writer http.ResponseWriter, name string) {
    cookie := NewCookie(name, "", "", "",
        -1, false, true)
    http.SetCookie(writer, cookie)
}

// 顯示錯誤畫面，若輸入無法判別的status，則預設顯示bad request
func ShowErrorPage(writer http.ResponseWriter, status int) {
    switch status {
    case http.StatusBadRequest:
        writer.WriteHeader(http.StatusBadRequest)
        writer.Write([]byte("400 - Bad Request!"))
    case http.StatusForbidden:
        writer.WriteHeader(http.StatusForbidden)
        writer.Write([]byte("403 - Forbidden!"))
    case http.StatusNotFound:
        writer.WriteHeader(http.StatusNotFound)
        writer.Write([]byte("404 - Not Found!"))
    case http.StatusInternalServerError:
        writer.WriteHeader(http.StatusInternalServerError)
        writer.Write([]byte("500 - Internal Server Error!"))
    default:
        writer.WriteHeader(http.StatusBadRequest)
        writer.Write([]byte("400 - Bad Request!"))
    }
}
