package core

import (
    "reflect"
    "bytes"
    "encoding/json"
)

func InArray(val interface{}, array interface{}) (exists bool, index int) {
    exists = false
    index = -1
    switch reflect.TypeOf(array).Kind() {
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

func DecodeCommonData(s []byte) *CommonData{
    var result *CommonData
    s = bytes.TrimSpace(bytes.Replace(s, []byte{'\n'}, []byte{' '}, -1))
    err := json.Unmarshal(s, result)
    if err != nil {
        //todo: error here
    }
    return result
}

func EncodeCommonDada(data *CommonData) []byte{
    result, err := json.Marshal(data)
    if err != nil {
        //todo: error here
    }
    result = bytes.TrimSpace(bytes.Replace(result, []byte{'\n'}, []byte{' '}, -1))
    return result
}
