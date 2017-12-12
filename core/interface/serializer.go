package _interface

// 介面Serializer，資料序列化，其作用是將資料轉換成字串型態的bytes
type Serializer interface {
    Serialize(src interface{}) ([]byte, error)
    Deserialize(src []byte, dst interface{}) error
}
