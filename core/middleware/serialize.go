package middleware

import (
    "errors"
    "bytes"
    "encoding/gob"
)

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
