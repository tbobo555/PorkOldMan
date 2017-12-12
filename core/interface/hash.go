package _interface

// Hash介面，將資料雜湊
type Hash interface {
    Hash(value interface{}) (string, error)
}

