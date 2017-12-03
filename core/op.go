package core

import (
    "reflect"
    "encoding/json"
    "bytes"
    "errors"
)

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
        return nil, CommonError("DecodeCommonData", "nil", errors.New("nil input"))
    }
    var result, empty CommonData
    err := json.Unmarshal(s, &result)
    if err != nil {
        return nil, CommonError("DecodeCommonData", s, err)
    }
    // 如果結果是empty，需要檢查輸入資料的格式是否為CommonData格式
    // 因為 json.Unmarshal 當輸入無法解讀的格式，會回傳空的CommonData
    if result == empty {
        resultByte, err := json.Marshal(result)
        if err != nil {
            return nil, CommonError("DecodeCommonData", s, err)
        }
        // 不相等代表輸入s的資料並非屬於CommonData格式
        if bytes.Compare(resultByte, s) != 0{
            return nil, CommonError("DecodeCommonData", s, errors.New("input isn't type of CommonData"))
        }
    }
    return &result, nil
}

// 將CommonData做成json
func EncodeCommonDada(data *CommonData) ([]byte, error) {
    result, err := json.Marshal(data)
    if err != nil {
        return nil, CommonError("DecodeCommonData", data, err)
    }
    return result, nil
}
